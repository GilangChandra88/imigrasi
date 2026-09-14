import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { FaHistory, FaSearch, FaFilter, FaTimes, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const BULAN_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export default function MakHistory() {
  const { isSuperAdmin } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'cancelled'

  useEffect(() => {
    const q = query(collection(db, "MAK_History"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching MAK_History:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      // Month & Year Filter
      if (filterMonth !== 0 && item.bulan !== filterMonth) return false;
      if (filterYear && item.tahun !== filterYear) return false;
      
      // Status Filter
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;

      // Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const searchStr = `${item.makString} ${item.itemName} ${item.uraian} ${item.suratRef?.pegawai} ${item.suratRef?.kode}`.toLowerCase();
        if (!searchStr.includes(q)) return false;
      }

      return true;
    });
  }, [history, filterMonth, filterYear, searchQuery, statusFilter]);

  const handleCancelTransaction = async (id, currentStatus) => {
    if (!isSuperAdmin) {
      alert("Hanya Super Admin yang dapat membatalkan transaksi.");
      return;
    }

    const isCancelling = currentStatus === 'active';
    const actionText = isCancelling ? 'membatalkan' : 'memulihkan';
    
    if (!window.confirm(`Yakin ingin ${actionText} transaksi ini? Realisasi anggaran akan terpengaruh.`)) {
      return;
    }

    try {
      await updateDoc(doc(db, "MAK_History", id), {
        status: isCancelling ? 'cancelled' : 'active',
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating transaction status:", error);
      alert("Gagal mengubah status transaksi.");
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID').format(angka || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const totalAmount = filteredHistory.filter(h => h.status === 'active').reduce((sum, item) => sum + (Number(item.jumlah) || 0), 0);

  return (
    <div className="w-full bg-slate-50 min-h-screen font-sans flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 tracking-tight">
            <FaHistory className="text-indigo-600" /> History MAK
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Log pencatatan realisasi anggaran dari surat/transaksi.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-slate-400" size={12} />
            </div>
            <input 
              type="text"
              placeholder="Cari uraian, pegawai, MAK..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(Number(e.target.value))}
              className="text-sm border border-slate-200 rounded-lg px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={0}>Semua Bulan</option>
              {BULAN_NAMES.map((name, idx) => (
                <option key={idx} value={idx + 1}>{name}</option>
              ))}
            </select>

            <input
              type="number"
              value={filterYear}
              onChange={(e) => setFilterYear(Number(e.target.value))}
              placeholder="Tahun"
              className="w-20 text-sm border border-slate-200 rounded-lg px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Semua Status</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-slate-500">Memuat history transaksi...</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            
            {/* Summary Bar */}
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-600">Total Transaksi Aktif (Filter):</span>
              <span className="text-lg font-bold text-indigo-700">Rp {formatRupiah(totalAmount)}</span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold border-b">Tanggal</th>
                    <th className="px-4 py-3 font-semibold border-b">Sumber / Pegawai</th>
                    <th className="px-4 py-3 font-semibold border-b">MAK / Item</th>
                    <th className="px-4 py-3 font-semibold border-b">Uraian</th>
                    <th className="px-4 py-3 font-semibold border-b text-right">Jumlah (Rp)</th>
                    <th className="px-4 py-3 font-semibold border-b text-center">Status</th>
                    {isSuperAdmin && <th className="px-4 py-3 font-semibold border-b text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={isSuperAdmin ? 7 : 6} className="text-center py-12 text-slate-400">
                        Tidak ada riwayat transaksi ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((item) => (
                      <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${item.status === 'cancelled' ? 'opacity-60 bg-rose-50/30' : ''}`}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {formatDate(item.tanggal)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">{item.suratRef?.kode || 'Manual'}</div>
                          <div className="text-xs text-slate-500 mt-0.5 max-w-[200px] truncate" title={item.suratRef?.pegawai}>
                            {item.suratRef?.pegawai || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-[10px] font-mono text-slate-500 mb-0.5 truncate max-w-[250px]" title={item.makString}>
                            {item.makString}
                          </div>
                          <div className="font-semibold text-teal-700 bg-teal-50 inline-block px-1.5 py-0.5 rounded border border-teal-100">
                            {item.itemKode} - {item.itemName}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-slate-700 max-w-[250px] line-clamp-2" title={item.uraian}>
                            {item.uraian || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-800 whitespace-nowrap">
                          {formatRupiah(item.jumlah)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                              <FaCheck size={8} /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-1 rounded-full border border-rose-200">
                              <FaTimes size={8} /> Cancelled
                            </span>
                          )}
                        </td>
                        {isSuperAdmin && (
                          <td className="px-4 py-3 text-center">
                            {item.status === 'active' ? (
                              <button
                                onClick={() => handleCancelTransaction(item.id, 'active')}
                                className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded transition-colors"
                                title="Batalkan Transaksi"
                              >
                                <FaTimes size={14} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleCancelTransaction(item.id, 'cancelled')}
                                className="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 p-1.5 rounded transition-colors"
                                title="Pulihkan Transaksi"
                              >
                                <FaCheck size={14} />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
