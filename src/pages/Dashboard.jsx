import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaCheckCircle, FaFileSignature, FaInbox } from 'react-icons/fa';

export default function Dashboard() {
  const { userData, userRole } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isSuperAdmin = userRole === 'Super Admin' || userRole === 'Admin';

  useEffect(() => {
    if (!userData) return;

    let q;
    if (isSuperAdmin) {
      q = query(collection(db, "document_tasks"), orderBy("createdAt", "desc"));
    } else {
      q = query(
        collection(db, "document_tasks"), 
        where("assigneeUid", "==", userData.nip || userData.id),
        orderBy("createdAt", "desc")
      );
    }

    const unsub = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return unsub;
  }, [userData, isSuperAdmin]);

  const pendingTasks = tasks.filter(t => t.status === "pending");
  const completedTasks = tasks.filter(t => t.status === "completed");

  const handleExecuteTask = (task) => {
    navigate(`/surat-editor/tulis/${task.targetTemplateId}`, {
      state: { taskId: task.id, prefillData: task.prefillData }
    });
  };

  if (loading) return <div className="p-8">Memuat Kotak Masuk...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Kotak Masuk</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            {isSuperAdmin ? "Pantau seluruh tugas yang sedang berjalan di sistem." : "Daftar tugas dokumen yang perlu Anda selesaikan."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FaClock className="text-amber-500" /> Tugas Menunggu ({pendingTasks.length})
              </h2>
              {pendingTasks.length === 0 ? (
                <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center text-slate-400">
                  <FaInbox size={48} className="mb-3 opacity-20" />
                  <p className="font-medium text-sm">Tidak ada tugas yang menunggu.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingTasks.map(task => (
                    <div key={task.id} className="bg-white border border-amber-200 shadow-sm rounded-2xl p-5 hover:shadow-md transition-shadow relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400" />
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Tugas Baru</span>
                            <span className="text-xs text-slate-400 font-mono">{new Date(task.createdAt).toLocaleDateString('id-ID')}</span>
                          </div>
                          <h3 className="font-bold text-slate-800 text-lg mb-1">Buat Dokumen Lanjutan</h3>
                          <p className="text-sm text-slate-600 mb-2">
                            Berdasarkan: <strong>{task.sourceDokumenNama}</strong> <br/>
                            Nomor Induk: <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded text-slate-600">{task.sourceDokumenNomor}</span>
                          </p>
                          {isSuperAdmin && (
                            <p className="text-xs text-indigo-600 font-semibold bg-indigo-50 inline-block px-2 py-1 rounded">Ditugaskan ke: {task.assigneeName || task.assigneeUid}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleExecuteTask(task)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shrink-0"
                        >
                          <FaFileSignature size={12} /> Kerjakan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FaCheckCircle className="text-emerald-500" /> Riwayat Selesai
              </h2>
              {completedTasks.length === 0 ? (
                <div className="text-sm text-slate-400 italic">Belum ada tugas selesai.</div>
              ) : (
                <div className="space-y-3">
                  {completedTasks.slice(0, 10).map(task => (
                    <div key={task.id} className="bg-white border border-slate-200 rounded-xl p-4 opacity-75">
                      <div className="flex items-center gap-2 mb-2">
                        <FaCheckCircle size={12} className="text-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-500">{task.completedAt ? new Date(task.completedAt).toLocaleDateString('id-ID') : '-'}</span>
                      </div>
                      <p className="text-xs text-slate-600">Dokumen lanjutan dari <strong>{task.sourceDokumenNama}</strong> berhasil diselesaikan.</p>
                      {isSuperAdmin && (
                        <p className="text-[10px] font-bold mt-1 text-slate-400">Oleh: {task.assigneeName}</p>
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
