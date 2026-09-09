import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import {
  FaClock, FaCheckCircle, FaFileSignature, FaInbox,
  FaFolderOpen, FaBolt, FaChevronRight, FaRegFileAlt, FaCircleNotch, FaRegCircle
} from 'react-icons/fa';
import { useMyLPJTasks } from './LPJ/useLPJ';

const STATUS_ICON = {
  not_started: { icon: <FaRegCircle />, label: 'Belum Mulai',       bg: 'bg-slate-50',   text: 'text-slate-500',  border: 'border-slate-200' },
  in_progress:  { icon: <FaCircleNotch className="animate-spin" />, label: 'Sedang Dikerjakan', bg: 'bg-amber-50',   text: 'text-amber-600',  border: 'border-amber-200' },
};

export default function Dashboard() {
  const { userData, userRole, currentUser } = useAuth();
  const navigate = useNavigate();

  const isSuperAdmin = userRole === 'Super Admin' || userRole === 'Admin';

  // ── Kotak Masuk (tugas dari template lama) ──────────────────────────────────
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    if (!userData) return;
    let q;
    if (isSuperAdmin) {
      q = query(collection(db, 'document_tasks'), orderBy('createdAt', 'desc'));
    } else {
      q = query(
        collection(db, 'document_tasks'),
        where('assigneeUid', '==', userData.nip || userData.id),
        orderBy('createdAt', 'desc')
      );
    }
    const unsub = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoadingTasks(false);
    });
    return unsub;
  }, [userData, isSuperAdmin]);

  // ── Tugas LPJ untuk user ini ────────────────────────────────────────────────
  const { tasks: lpjTasks, loading: loadingLpj } = useMyLPJTasks(currentUser?.uid);

  const pendingTasks    = tasks.filter((t) => t.status === 'pending');
  const completedTasks  = tasks.filter((t) => t.status === 'completed');

  const handleExecuteTask = (task) => {
    navigate(`/surat-editor/tulis/${task.targetTemplateId}`, {
      state: { taskId: task.id, prefillData: task.prefillData },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto">

        {/* ── Greeting ── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Selamat datang{userData?.nama ? `, ${userData.nama.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            {isSuperAdmin
              ? 'Pantau seluruh tugas dan paket LPJ yang sedang berjalan.'
              : 'Berikut adalah tugas dokumen yang perlu Anda selesaikan.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Kolom Kiri: Tugas Utama ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* ── SECTION: Tugas LPJ ── */}
            <div>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FaFolderOpen className="text-slate-400" />
                Tugas Dokumen LPJ Anda
                {lpjTasks.length > 0 && (
                  <span className="bg-slate-800 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                    {lpjTasks.length}
                  </span>
                )}
              </h2>

              {loadingLpj ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 h-20 animate-pulse" />
                  ))}
                </div>
              ) : lpjTasks.length === 0 ? (
                <div className="bg-white border border-slate-200 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center text-slate-400">
                  <FaFolderOpen size={32} className="mb-3 opacity-20" />
                  <p className="font-medium text-sm">Tidak ada tugas dokumen LPJ yang menunggu.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lpjTasks.map((task) => {
                    const cfg = STATUS_ICON[task.status] || STATUS_ICON.not_started;
                    return (
                      <div
                        key={`${task.packId}-${task.id}`}
                        className={`group bg-white border rounded-xl p-5 cursor-pointer hover:border-slate-400 hover:shadow-sm transition-all ${cfg.border} relative overflow-hidden`}
                        onClick={() => navigate(`/lpj/${task.packId}`)}
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
                              <FaRegFileAlt size={16} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-200 text-slate-500">
                                  {task.kode}
                                </span>
                                <span className={`flex items-center gap-1.5 text-[10px] font-bold ${cfg.text}`}>
                                  {cfg.icon} {cfg.label}
                                </span>
                              </div>
                              <p className="font-bold text-slate-800 text-sm leading-snug">{task.surat_nama}</p>
                              <p className="text-xs text-slate-400 mt-1">{task.phase_label}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 self-center">
                            {task.status === 'not_started' && (
                              <span className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-slate-800 text-white rounded-lg group-hover:bg-slate-900 transition-colors">
                                Mulai
                              </span>
                            )}
                            {task.status === 'in_progress' && (
                              <span className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-amber-100 text-amber-700 rounded-lg group-hover:bg-amber-200 transition-colors">
                                Lanjutkan
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── SECTION: Kotak Masuk (Tugas Template Lama) ── */}
            {(pendingTasks.length > 0 || isSuperAdmin) && (
              <div>
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FaClock className="text-slate-400" />
                  Kotak Masuk ({pendingTasks.length})
                </h2>

                {loadingTasks ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-4 h-24 animate-pulse" />
                ) : pendingTasks.length === 0 ? (
                  <div className="bg-white border border-slate-200 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center text-slate-400">
                    <FaInbox size={32} className="mb-3 opacity-20" />
                    <p className="font-medium text-sm">Tidak ada tugas yang menunggu.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingTasks.map((task) => (
                      <div key={task.id} className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 hover:border-slate-400 transition-colors relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                                Tugas Baru
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(task.createdAt).toLocaleDateString('id-ID')}
                              </span>
                            </div>
                            <h3 className="font-bold text-slate-800 text-base mb-1">Buat Dokumen Lanjutan</h3>
                            <p className="text-sm text-slate-600 mb-2">
                              Berdasarkan: <strong>{task.sourceDokumenNama}</strong><br />
                              Nomor Induk: <span className="font-mono text-xs bg-slate-50 px-1 py-0.5 rounded border border-slate-100">{task.sourceDokumenNomor}</span>
                            </p>
                            {isSuperAdmin && (
                              <p className="text-[10px] text-slate-600 font-semibold bg-slate-50 inline-block px-2 py-1 rounded border border-slate-100">
                                Ditugaskan ke: {task.assigneeName || task.assigneeUid}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleExecuteTask(task)}
                            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shrink-0 shadow-sm"
                          >
                            <FaFileSignature size={12} /> Kerjakan
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Kolom Kanan: Riwayat + Shortcut ── */}
          <div className="space-y-6">

            {/* Shortcut: Buat Pack Baru */}
            <div className="bg-slate-800 rounded-xl p-6 text-white shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-5">
                <FaFolderOpen size={120} />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Mulai Sekarang</p>
                <p className="font-bold text-lg leading-snug mb-4">Buat Paket LPJ Baru</p>
                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={() => navigate('/lpj')}
                    className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <FaFolderOpen size={13} /> Perjalanan Dinas
                  </button>
                  <button
                    onClick={() => navigate('/lpj')}
                    className="w-full border border-white/20 hover:bg-white/5 text-white text-xs font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <FaRegFileAlt size={13} /> Non Perjalanan
                  </button>
                </div>
              </div>
            </div>

            {/* Riwayat Selesai */}
            <div>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FaCheckCircle className="text-emerald-500" /> Riwayat Selesai
              </h2>
              {completedTasks.length === 0 ? (
                <div className="text-sm text-slate-400 italic">Belum ada tugas selesai.</div>
              ) : (
                 <div className="space-y-3">
                  {completedTasks.slice(0, 8).map((task) => (
                    <div key={task.id} className="bg-white border border-slate-200 rounded-xl p-4 opacity-80 hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-2 mb-2">
                        <FaCheckCircle size={11} className="text-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-500">
                          {task.completedAt ? new Date(task.completedAt).toLocaleDateString('id-ID') : '-'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Dokumen lanjutan dari <strong className="text-slate-800">{task.sourceDokumenNama}</strong> berhasil diselesaikan.
                      </p>
                      {isSuperAdmin && (
                        <p className="text-[10px] font-bold mt-1.5 text-slate-400">Oleh: {task.assigneeName}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
