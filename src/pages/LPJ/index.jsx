/**
 * LPJ — Halaman Utama Manajemen Paket LPJ
 * ==========================================
 * Daftar semua paket LPJ dengan progress tracking.
 * Admin: lihat semua pack + buat baru.
 * Pegawai: lihat pack yang dia terlibat + update status surat-nya.
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaPlus, FaFilter, FaFolderOpen, FaCheckCircle,
  FaClock, FaSearch, FaBolt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useLPJPacks } from './useLPJ';
import { PACK_TYPES } from './packTemplates';
import CreatePackModal from './CreatePackModal';
import PackDetail from './PackDetail';

export default function LPJ() {
  const { packId } = useParams(); // /lpj/:packId → detail view
  const navigate = useNavigate();
  const { currentUser, userData, isAdmin, isSuperAdmin } = useAuth();
  const canManage = isAdmin || isSuperAdmin;

  const [showCreate, setShowCreate] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');

  const { packs, loading, error } = useLPJPacks({
    isAdmin: canManage,
    userUid: currentUser?.uid || '',
  });

  // Jika ada packId di URL → tampilkan detail
  if (packId) {
    return (
      <PackDetail
        packId={packId}
        currentUser={currentUser}
        isAdmin={canManage}
      />
    );
  }

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = packs.filter((p) => {
    const matchSearch = !search || p.judul?.toLowerCase().includes(search.toLowerCase()) || p.perihal?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchType = filterType === 'all' || p.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  // ── Stats ringkas ────────────────────────────────────────────────────────────
  const stats = {
    total:       packs.length,
    in_progress: packs.filter((p) => p.status === 'in_progress').length,
    completed:   packs.filter((p) => p.status === 'completed').length,
    // Stuck: pack yang tidak ada progress > 7 hari (hanya untuk admin)
    stuck: packs.filter((p) => p.status === 'in_progress' && (p.progress?.age_days || 0) > 7).length,
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">LPJ</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {canManage
                ? 'Monitor dan kelola semua paket pertanggungjawaban kegiatan.'
                : 'Buat paket LPJ atau lihat paket yang Anda terlibat.'}
            </p>
          </div>
          
          <div className="flex gap-2">
            {/* Tombol Migrasi untuk Admin */}
            {canManage && (
              <button
                onClick={async () => {
                  if (!window.confirm('Generate ID untuk semua LPJ lama yang belum punya ID?')) return;
                  try {
                    const { migrateMissingLPJIds } = await import('./useLPJ');
                    const jml = await migrateMissingLPJIds();
                    if (jml === 0) {
                      alert('Tidak ada LPJ lama yang perlu diperbaiki (semuanya sudah punya ID atau format valid).');
                    } else {
                      alert(`Berhasil! ${jml} LPJ lama telah diberi ID berurutan.`);
                    }
                  } catch (err) {
                    console.error(err);
                    alert('Gagal generate ID: ' + err.message);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-100 text-indigo-700 text-sm font-bold rounded-lg hover:bg-indigo-200 transition-colors shadow-sm"
              >
                <FaBolt size={12} /> Perbaiki ID Lama
              </button>
            )}

            {/* Semua user bisa buat pack */}
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white text-sm font-bold rounded-lg hover:bg-slate-900 transition-colors shadow-sm"
            >
              <FaPlus size={12} /> Buat Paket LPJ
            </button>
          </div>
        </div>

        {/* Stats bar — hanya admin */}
        {canManage && (
          <div className="max-w-6xl mx-auto mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={<FaFolderOpen />} value={stats.total}       label="Total Paket"      color="slate"  onClick={() => setFilterStatus('all')} />
            <StatCard icon={<FaClock />}       value={stats.in_progress} label="Sedang Berjalan"  color="amber"   onClick={() => setFilterStatus('in_progress')} />
            <StatCard icon={<FaCheckCircle />} value={stats.completed}   label="Selesai"           color="emerald" onClick={() => setFilterStatus('completed')} />
            <StatCard icon={<FaBolt />}        value={stats.stuck}       label="Macet > 7 Hari"   color={stats.stuck > 0 ? 'rose' : 'slate'} onClick={() => {}} />
          </div>
        )}

        {/* Toolbar filter */}
        <div className="max-w-6xl mx-auto mt-4 flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari judul atau perihal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* Filter tipe */}
          <div className="flex gap-1.5">
            {[
              { val: 'all', label: 'Semua' },
              { val: 'perjadin', label: 'Perjalanan Dinas' },
              { val: 'non_perjadin', label: 'Non Perjalanan Dinas' },
            ].map(({ val, label }) => (
              <button
                key={val}
                onClick={() => setFilterType(val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  filterType === val
                    ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Konten ── */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">

          {/* Loading */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-36 animate-pulse" />
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold px-4 py-3 rounded-xl">
              ⚠️ {error}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <FaFolderOpen size={48} className="mb-4 opacity-20" />
              <p className="font-semibold text-sm">
                {packs.length === 0
                  ? 'Belum ada paket LPJ.'
                  : 'Tidak ada paket yang cocok dengan filter.'}
              </p>
              {canManage && packs.length === 0 && (
                <button
                  onClick={() => setShowCreate(true)}
                  className="mt-4 text-indigo-600 font-bold text-sm hover:underline"
                >
                  + Buat Paket Pertama
                </button>
              )}
            </div>
          )}

          {/* Pack List */}
          {!loading && filtered.length > 0 && (
            <div className="space-y-4">
              {filtered.map((pack) => (
                <PackCard
                  key={pack.id}
                  pack={pack}
                  currentUserUid={currentUser?.uid}
                  onOpen={() => navigate(`/lpj/${pack.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modal Buat Pack ── */}
      {showCreate && (
        <CreatePackModal
          currentUser={currentUser}
          onClose={() => setShowCreate(false)}
          onCreated={(newPackId) => {
            setShowCreate(false);
            navigate(`/lpj/${newPackId}`);
          }}
        />
      )}
    </div>
  );
}

// ─── Sub-komponen: Pack Card ──────────────────────────────────────────────────

function PackCard({ pack, currentUserUid, onOpen }) {
  const packType = PACK_TYPES[pack.type];
  const progress = pack.progress || {};
  // Macet jika sudah in_progress lebih dari 7 hari
  const isStuck = pack.status === 'in_progress' && (progress.age_days || 0) > 7;

  // Cari surat yang sudah selesai dan belum
  const pendingItems = (progress.total || 0) - (progress.completed || 0);

  return (
    <div
      className={`bg-white rounded-2xl border-2 p-5 cursor-pointer hover:shadow-md transition-all duration-200 group ${
        isStuck ? 'border-rose-200 hover:border-rose-300' : 'border-slate-200 hover:border-indigo-200'
      }`}
      onClick={onOpen}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {pack.nomor_bundle && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-indigo-50 text-indigo-600 border-indigo-200">
                {pack.nomor_bundle}
              </span>
            )}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${packType?.bgColor} ${packType?.textColor} ${packType?.borderColor}`}>
               {packType?.label}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              pack.status === 'completed' ? 'bg-emerald-50 text-emerald-600'
              : pack.status === 'in_progress' ? 'bg-amber-50 text-amber-600'
              : pack.status === 'archived' ? 'bg-slate-100 text-slate-400'
              : 'bg-slate-100 text-slate-500'
            }`}>
              {pack.status === 'completed' ? 'Selesai'
               : pack.status === 'in_progress' ? 'Berjalan'
               : pack.status === 'archived' ? 'Diarsipkan'
               : 'Draft'}
            </span>
            {isStuck && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-600">
                Macet ({progress.age_days} hari)
              </span>
            )}
          </div>

          <h3 className="font-bold text-slate-800 text-base group-hover:text-slate-900 transition-colors truncate">
            {pack.judul}
          </h3>
          <p className="text-xs text-slate-500 truncate mt-0.5">{pack.perihal}</p>

          {/* Meta */}
          <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-slate-400 font-semibold">
            {pack.tujuan && <span>{pack.tujuan}</span>}
            {pack.tujuan && pack.tanggal_mulai && <span>•</span>}
            {pack.tanggal_mulai && <span>{pack.tanggal_mulai}</span>}
            {pack.tanggal_mulai && pack.mak && <span>•</span>}
            {pack.mak && <span>{pack.mak}</span>}
            {pack.mak && pack.created_by_nama && <span>•</span>}
            <span>{pack.created_by_nama}</span>
          </div>

          {/* Pegawai avatars */}
          {pack.pegawai_list?.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              {pack.pegawai_list.slice(0, 4).map((p) => (
                <span key={p.uid} title={p.nama}
                  className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-[9px] font-bold flex items-center justify-center border border-white">
                  {p.nama?.[0] || '?'}
                </span>
              ))}
              {pack.pegawai_list.length > 4 && (
                <span className="text-[9px] text-slate-400 ml-1">+{pack.pegawai_list.length - 4}</span>
              )}
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="text-right shrink-0">
          <div className={`text-2xl font-black ${
            progress.percentage === 100 ? 'text-emerald-500' : 'text-indigo-600'
          }`}>
            {progress.percentage || 0}%
          </div>
          <div className="text-[10px] text-slate-400">
            {progress.completed}/{progress.total}
          </div>
          {pendingItems > 0 && (
            <div className="text-[10px] text-amber-500 font-semibold mt-0.5">
              {pendingItems} belum selesai
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            progress.percentage === 100 ? 'bg-emerald-400' : 'bg-slate-800'
          }`}
          style={{ width: `${progress.percentage || 0}%` }}
        />
      </div>
    </div>
  );
}

// ─── Sub-komponen: Stat Card ──────────────────────────────────────────────────

const COLOR_CLASSES = {
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  amber:  'bg-amber-50  text-amber-600  border-amber-200',
  emerald:'bg-emerald-50 text-emerald-600 border-emerald-200',
  rose:   'bg-rose-50   text-rose-600   border-rose-200',
  slate:  'bg-slate-50  text-slate-400  border-slate-200',
};

function StatCard({ icon, value, label, color = 'slate', onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border cursor-pointer hover:shadow-sm transition-all ${COLOR_CLASSES[color]}`}
    >
      <span className="text-lg">{icon}</span>
      <div className="text-left">
        <p className="text-xl font-black leading-none">{value}</p>
        <p className="text-[10px] font-semibold mt-0.5 opacity-80">{label}</p>
      </div>
    </button>
  );
}
