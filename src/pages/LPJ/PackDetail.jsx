/**
 * PackDetail — Halaman Detail Paket LPJ
 * =======================================
 * Tampilan timeline per fase, status tiap surat, siapa assignee-nya,
 * dan aksi yang bisa dilakukan (Kerjakan / Selesai / Lihat).
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaPlay, FaLock, FaUser, FaClock, FaChevronDown, FaChevronUp, FaRegCircle, FaCircleNotch, FaCheckCircle, FaMinusCircle, FaRegFileAlt, FaEye, FaEdit } from 'react-icons/fa';
import { useLPJPackDetail } from './useLPJ';
import { PACK_TYPES } from './packTemplates';
import { getFirestore, doc, updateDoc, serverTimestamp, getDocs, collection, writeBatch } from 'firebase/firestore';
import { app } from '../../firebase';
import SuratPreviewModal from '../Persuratan/SuratPreviewModal';
import { SURAT_REGISTRY } from '../../surat';

const STATUS_CONFIG = {
  not_started: { label: 'Belum Mulai', icon: <FaRegCircle />, color: 'text-slate-400' },
  in_progress:  { label: 'Sedang Dikerjakan', icon: <FaCircleNotch className="animate-spin" />, color: 'text-indigo-500' },
  completed:    { label: 'Selesai', icon: <FaCheckCircle />, color: 'text-slate-700' },
  not_required: { label: 'Tidak Diperlukan', icon: <FaMinusCircle />, color: 'text-slate-300' },
};

/**
 * @param {{
 *   packId: string,
 *   currentUser: object,
 *   isAdmin: boolean
 * }} props
 */
export default function PackDetail({ packId, currentUser, isAdmin }) {
  const navigate = useNavigate();
  const { pack, items, loading, error } = useLPJPackDetail(packId);
  const [updating, setUpdating] = useState(''); // itemId yang sedang diupdate
  const [collapsedPhases, setCollapsedPhases] = useState(new Set());
  const [previewItem, setPreviewItem] = useState(null);

  if (loading) return <LoadingSkeleton />;
  if (error || !pack) return <ErrorState message={error} />;

  const packType = PACK_TYPES[pack.type];

  // Group items by phase
  const phaseGroups = {};
  items.forEach((item) => {
    const key = item.phase_id || 'lainnya';
    if (!phaseGroups[key]) {
      phaseGroups[key] = { label: item.phase_label || 'Lainnya', items: [] };
    }
    phaseGroups[key].items.push(item);
  });

  const handleStatusChange = async (item, newStatus) => {
    try {
      setUpdating(item.id);
      const db = getFirestore(app, 'imigrasi');
      const itemRef = doc(db, 'lpj_packs', packId, 'surat_items', item.id);
      
      const updateData = {
        status: newStatus,
        updated_at: serverTimestamp()
      };

      if (newStatus === 'completed') {
        updateData.completed_at = serverTimestamp();
        updateData.completed_by = currentUser?.uid;
        updateData.completed_by_nama = currentUser?.displayName || currentUser?.email;
      } else if (newStatus === 'in_progress') {
        updateData.started_at = serverTimestamp();
      }

      await updateDoc(itemRef, updateData);

      // --- FALLBACK FRONTEND UNTUK UNLOCK DEPENDENCY ---
      if (newStatus === 'completed') {
        const itemsSnap = await getDocs(collection(db, 'lpj_packs', packId, 'surat_items'));
        const allItems = itemsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        const completedIds = new Set(
          allItems.filter(i => i.status === 'completed' || i.id === item.id).map(i => i.id)
        );

        const batch = writeBatch(db);
        let hasUnlocks = false;

        allItems.forEach(depItem => {
          if (depItem.status === 'completed') return;
          if (!depItem.depends_on || depItem.depends_on.length === 0) return;
          if (!depItem.is_blocked) return;

          const allDepsMet = depItem.depends_on.every(dep => {
            if (completedIds.has(dep)) return true;
            const prefixItems = allItems.filter(i => i.id === dep || i.id.startsWith(dep + '-'));
            if (prefixItems.length === 0) return false;
            return prefixItems.every(i => completedIds.has(i.id));
          });

          if (allDepsMet) {
            const depRef = doc(db, 'lpj_packs', packId, 'surat_items', depItem.id);
            batch.update(depRef, { is_blocked: false, updated_at: serverTimestamp() });
            hasUnlocks = true;
          }
        });

        if (hasUnlocks) {
          await batch.commit();
        }

        // --- FALLBACK PROGRESS CALCULATION ---
        const total = allItems.length;
        const completedCount = completedIds.size;
        const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
        
        await updateDoc(doc(db, 'lpj_packs', packId), {
          'progress.total': total,
          'progress.completed': completedCount,
          'progress.percentage': percentage,
          status: percentage === 100 ? 'completed' : 'in_progress',
          updated_at: serverTimestamp()
        });
      }

    } catch (err) {
      console.error('Gagal update status:', err);
      alert('Gagal mengupdate status surat.');
    } finally {
      setUpdating(null);
    }
  };

  const togglePhase = (phaseId) => {
    setCollapsedPhases((prev) => {
      const next = new Set(prev);
      next.has(phaseId) ? next.delete(phaseId) : next.add(phaseId);
      return next;
    });
  };

  const handlePreview = (item) => {
    const suratDef = SURAT_REGISTRY.find(s => s.id === item.definition_id);
    if (!suratDef) {
      alert("Definisi surat tidak ditemukan!");
      return;
    }
    
    let instanceData = {};

    // Merge semua data dari item yang sudah ada agar variabel lintas dokumen tersedia
    items.forEach(i => {
      if (i.data) {
        instanceData = { ...instanceData, ...i.data };
      }
    });

    // Override dengan data item ini sendiri
    if (item.data) {
      instanceData = { ...instanceData, ...item.data };
    }

    // Phase 2 Child sync: Inject SPBY data dynamically
    const isPhase2Child = [
      'nota-dinas', 'surat-perintah-bayar', 'rincian-spby', 
      'rincian-perjalanan-tugas', 'sptjm-pelaksana', 'nominatif', 'kwitansi'
    ].includes(item.definition_id);

    if (isPhase2Child) {
      const spbyItem = items.find(i => i.definition_id === 'spby');
      if (spbyItem && spbyItem.data) {
        instanceData = { ...instanceData, ...spbyItem.data };
      }
    }

    // Inject pack info
    instanceData.nomor_bundle = pack.nomor_bundle;

    if (item._filterPegawai && Array.isArray(instanceData.detail_transaksi)) {
      instanceData.detail_transaksi = instanceData.detail_transaksi.filter(r => r.pegawai === item._filterPegawai);
    }

    setPreviewItem({
      ...suratDef,
      instanceData,
      _packItem: item
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <button
          onClick={() => navigate('/lpj')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 font-semibold mb-4 transition-colors"
        >
          <FaArrowLeft size={12} /> Kembali ke Daftar LPJ
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            {/* Badge tipe */}
            <div className="flex items-center gap-2 mb-2">
              {pack.nomor_bundle && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200">
                  {pack.nomor_bundle}
                </span>
              )}
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border bg-slate-100 text-slate-600 border-slate-200`}>
                {packType?.icon} {packType?.label}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-800">{pack.judul}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{pack.perihal}</p>
            {pack.tujuan && <p className="text-xs text-slate-400 mt-0.5 font-semibold">{pack.tujuan}</p>}
          </div>

          {/* Progress ring */}
          <div className="text-right">
            <div className="text-3xl font-black text-slate-800">{pack.progress?.percentage || 0}%</div>
            <div className="text-xs text-slate-400 mt-0.5">
              {pack.progress?.completed}/{pack.progress?.total} dokumen selesai
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${pack.progress?.percentage === 100 ? 'bg-indigo-500' : 'bg-slate-800'}`}
            style={{ width: `${pack.progress?.percentage || 0}%` }}
          />
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500 font-semibold">
          {pack.tanggal_mulai && (
            <span>{pack.tanggal_mulai} — {pack.tanggal_selesai}</span>
          )}
          {pack.mak && <span>MAK: {pack.mak}</span>}
          {pack.status === 'in_progress' && (pack.progress?.age_days || 0) > 7 && (
            <span className="font-semibold text-rose-500">
              Macet ({pack.progress.age_days} hari)
            </span>
          )}
          <span>Dibuat oleh: {pack.created_by_nama}</span>
        </div>
      </div>

      {/* ── Pegawai yang terlibat ── */}
      {pack.pegawai_list?.length > 0 && (
        <div className="bg-white border-b border-slate-100 px-6 py-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pegawai:</span>
            {pack.pegawai_list.map((p) => {
              const myItems = items.filter((i) => i.assigned_to === p.uid);
              const myDone = myItems.filter((i) => i.status === 'completed').length;
              return (
                <div key={p.uid} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3 py-1">
                  <span className="text-[10px] font-bold text-slate-600">{p.nama}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    myDone === myItems.length && myItems.length > 0
                      ? 'bg-slate-200 text-slate-700'
                      : myDone > 0
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {myDone}/{myItems.length}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Timeline Fase ── */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {Object.entries(phaseGroups).map(([phaseId, phase]) => {
            const isCollapsed = collapsedPhases.has(phaseId);
            const phaseDone = phase.items.filter((i) => i.status === 'completed').length;
            const phaseTotal = phase.items.length;
            const phaseAllDone = phaseDone === phaseTotal;

            return (
              <div key={phaseId} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {/* Phase Header */}
                <button
                  onClick={() => togglePhase(phaseId)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${
                      phaseAllDone ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {phaseAllDone ? <FaCheck /> : <FaRegFileAlt />}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-700">{phase.label}</p>
                      <p className="text-[10px] text-slate-400">
                        {phaseDone}/{phaseTotal} selesai
                        {!phaseAllDone && phase.items.some((i) => i.is_blocked) && (
                          <span className="ml-2 text-indigo-500">· beberapa menunggu fase sebelumnya</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${phaseAllDone ? 'bg-slate-800' : 'bg-indigo-400'}`}
                        style={{ width: `${(phaseDone / phaseTotal) * 100}%` }}
                      />
                    </div>
                    {isCollapsed ? <FaChevronDown size={12} className="text-slate-400" /> : <FaChevronUp size={12} className="text-slate-400" />}
                  </div>
                </button>

                {/* Phase Items */}
                  {!isCollapsed && (
                    <div className="border-t border-slate-100 divide-y divide-slate-50">
                      {phase.items.flatMap((item) => {
                        if (['rincian-spby', 'rincian-perjalanan-tugas'].includes(item.definition_id)) {
                          const spbyItem = items.find(i => i.definition_id === 'spby');
                          if (spbyItem && spbyItem.data && Array.isArray(spbyItem.data.detail_transaksi)) {
                            const pegawais = [...new Set(spbyItem.data.detail_transaksi.map(r => r.pegawai))].filter(Boolean);
                            if (pegawais.length > 0) {
                              return pegawais.map((p, pIdx) => {
                                const subItem = { 
                                  ...item, 
                                  surat_nama: `${item.surat_nama} - ${p.split(' - ')[1] || p.split(' - ')[0]}`,
                                  _filterPegawai: p 
                                };
                                return (
                                  <SuratItemRow
                                    key={`${item.id}-${pIdx}`}
                                    item={subItem}
                                    isAdmin={isAdmin}
                                    isUpdating={updating === item.id}
                                    currentUserUid={currentUser.uid}
                                    onStatusChange={handleStatusChange}
                                    packId={packId}
                                    navigate={navigate}
                                    onPreview={() => handlePreview(subItem)}
                                  />
                                );
                              });
                            }
                          }
                        }
                        
                        return (
                          <SuratItemRow
                            key={item.id}
                            item={item}
                            isAdmin={isAdmin}
                            isUpdating={updating === item.id}
                            currentUserUid={currentUser.uid}
                            onStatusChange={handleStatusChange}
                            packId={packId}
                            navigate={navigate}
                            onPreview={() => handlePreview(item)}
                          />
                        );
                      })}
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      </div>

      {previewItem && (
        <SuratPreviewModal
          surat={previewItem}
          onClose={() => setPreviewItem(null)}
        />
      )}
    </div>
  );
}

// ─── Sub-komponen: Row tiap surat item ────────────────────────────────────────

function SuratItemRow({ item, isAdmin, isUpdating, currentUserUid, onStatusChange, packId, navigate, onPreview }) {
  const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.not_started;
  const isMyItem = item.assigned_to === currentUserUid;
  const canAct = isAdmin || isMyItem;

  const isPhase2Child = [
    'nota-dinas', 'surat-perintah-bayar', 'rincian-spby', 
    'rincian-perjalanan-tugas', 'sptjm-pelaksana', 'nominatif', 'kwitansi'
  ].includes(item.definition_id);

  return (
    <div className={`flex items-center gap-4 px-5 py-3 transition-colors ${
      item.is_blocked ? 'opacity-50' : 'hover:bg-slate-50/50'
    }`}>
      {/* Status icon */}
      <span className={`text-lg w-6 text-center shrink-0 ${status.color}`}>{status.icon}</span>

      {/* Info surat */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-white shrink-0"
          >
            {item.kode}
          </span>
          <p className={`text-sm font-semibold truncate ${item.is_blocked ? 'text-slate-400' : 'text-slate-800'}`}>
            {item.surat_nama}
          </p>
          {item.is_blocked && (
            <span className="flex items-center gap-1 text-[9px] text-slate-500 font-semibold bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
              <FaLock size={7} /> Menunggu
            </span>
          )}
          {item.is_hub && (
            <span className="text-[9px] text-indigo-500 font-semibold bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
              HUB
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          {item.assigned_name && (
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
              <FaUser size={8} />
              {item.assigned_name}
            </span>
          )}
          {item.status === 'completed' && item.completed_at && (
            <span className="flex items-center gap-1 text-[10px] text-slate-500">
              <FaCheck size={8} />
              Selesai {item.completed_by_nama && `oleh ${item.completed_by_nama}`}
            </span>
          )}
          {item.nomor_surat && (
            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              {item.nomor_surat}
            </span>
          )}
        </div>
      </div>

      {/* Aksi */}
      {!item.is_blocked && canAct && !isUpdating && (
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Preview Button */}
          <button
            onClick={onPreview}
            disabled={!isPhase2Child && !item.instance_id}
            title={(!isPhase2Child && !item.instance_id) ? "Isi form terlebih dahulu" : "Preview Surat"}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <FaEye size={10} /> Preview
          </button>

          {/* Edit Button - HIDDEN for Phase 2 Children */}
          {!isPhase2Child && (item.status === 'not_started' || item.status === 'in_progress') && (
            <button
              onClick={() => {
                if (item.status === 'not_started') {
                  onStatusChange(item, 'in_progress');
                }
                navigate(`/persuratan/form/${item.definition_id}?packId=${packId}&itemId=${item.id}`);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <FaEdit size={10} /> {item.instance_id ? 'Edit' : 'Isi Form'}
            </button>
          )}

          {/* Selesai Button */}
          {item.status === 'in_progress' && (
            <button
              onClick={() => onStatusChange(item, 'completed')}
              disabled={(!isPhase2Child && !item.instance_id) || item.is_data_complete === false}
              title={(!isPhase2Child && !item.instance_id) ? "Form belum diisi" : (item.is_data_complete === false ? "Isian form belum lengkap" : "Tandai Selesai")}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaCheck size={10} /> Selesai
            </button>
          )}

          {/* Buka Kembali (Admin only) */}
          {item.status === 'completed' && isAdmin && (
            <button
              onClick={() => onStatusChange(item, 'in_progress')}
              className="text-xs text-slate-400 hover:text-indigo-600 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              title="Buka kembali (Batalkan Selesai)"
            >
              Buka
            </button>
          )}
        </div>
      )}

      {isUpdating && (
        <span className="text-xs text-slate-400 animate-pulse shrink-0">memperbarui...</span>
      )}
    </div>
  );
}

// ─── Skeleton & Error ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-1/3" />
      <div className="h-4 bg-slate-100 rounded w-1/2" />
      <div className="h-2.5 bg-slate-200 rounded-full" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="h-4 bg-slate-100 rounded w-1/4 mb-3" />
          {[1, 2].map((j) => (
            <div key={j} className="flex gap-3 py-2">
              <div className="w-6 h-6 bg-slate-100 rounded-full" />
              <div className="flex-1 h-4 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="flex-1 flex items-center justify-center p-6 text-center">
      <div>
        <p className="text-4xl mb-3">⚠️</p>
        <p className="text-slate-600 font-medium">{message || 'Terjadi kesalahan.'}</p>
      </div>
    </div>
  );
}
