import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query } from "firebase/firestore";
import { FaUserPlus, FaTrash, FaPen, FaUsers, FaMedal, FaBriefcase, FaSave, FaTimes, FaPlus } from "react-icons/fa";

export default function Karyawan() {
  const [activeTab, setActiveTab] = useState('karyawan'); // 'karyawan', 'pangkat', 'jabatan'
  
  // Data States
  const [karyawanList, setKaryawanList] = useState([]);
  const [pangkatList, setPangkatList] = useState([]);
  const [jabatanList, setJabatanList] = useState([]);
  
  const [loading, setLoading] = useState(true);

  // Form States - Karyawan
  const [isAddingKaryawan, setIsAddingKaryawan] = useState(false);
  const [editingKaryawanId, setEditingKaryawanId] = useState(null);
  const [formKaryawan, setFormKaryawan] = useState({ nama: '', nip: '', pangkat: '', jabatan: '' });

  // Form States - Master
  const [isAddingMaster, setIsAddingMaster] = useState(false);
  const [editingMasterId, setEditingMasterId] = useState(null);
  const [formMasterName, setFormMasterName] = useState('');

  const karyawanCol = collection(db, "karyawan");
  const pangkatCol = collection(db, "master_pangkat");
  const jabatanCol = collection(db, "master_jabatan");

  useEffect(() => {
    const unsubKaryawan = onSnapshot(query(karyawanCol), (snapshot) => {
      setKaryawanList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    const unsubPangkat = onSnapshot(query(pangkatCol), (snapshot) => {
      setPangkatList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubJabatan = onSnapshot(query(jabatanCol), (snapshot) => {
      setJabatanList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubKaryawan();
      unsubPangkat();
      unsubJabatan();
    };
  }, []);

  // --- KARYAWAN HANDLERS ---
  const handleSaveKaryawan = async (e) => {
    e.preventDefault();
    if (!formKaryawan.nama || !formKaryawan.nip) return;
    try {
      if (editingKaryawanId) {
        await updateDoc(doc(db, "karyawan", editingKaryawanId), formKaryawan);
      } else {
        await addDoc(karyawanCol, { ...formKaryawan, createdAt: new Date().toISOString() });
      }
      setIsAddingKaryawan(false);
      setEditingKaryawanId(null);
      setFormKaryawan({ nama: '', nip: '', pangkat: '', jabatan: '' });
    } catch (error) {
      console.error("Error saving karyawan:", error);
    }
  };

  const handleDeleteKaryawan = async (id) => {
    if (!window.confirm("Yakin ingin menghapus karyawan ini?")) return;
    try {
      await deleteDoc(doc(db, "karyawan", id));
    } catch (error) {
      console.error("Error deleting karyawan:", error);
    }
  };

  const startEditKaryawan = (k) => {
    setFormKaryawan({ nama: k.nama, nip: k.nip, pangkat: k.pangkat || '', jabatan: k.jabatan || '' });
    setEditingKaryawanId(k.id);
    setIsAddingKaryawan(true);
  };

  // --- MASTER HANDLERS ---
  const handleSaveMaster = async (e, colRef, collectionName) => {
    e.preventDefault();
    if (!formMasterName.trim()) return;
    try {
      if (editingMasterId) {
        await updateDoc(doc(db, collectionName, editingMasterId), { name: formMasterName });
      } else {
        await addDoc(colRef, { name: formMasterName, createdAt: new Date().toISOString() });
      }
      setIsAddingMaster(false);
      setEditingMasterId(null);
      setFormMasterName('');
    } catch (error) {
      console.error("Error saving master data:", error);
    }
  };

  const handleDeleteMaster = async (id, collectionName) => {
    if (!window.confirm("Yakin ingin menghapus data master ini?")) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      console.error("Error deleting master data:", error);
    }
  };

  const startEditMaster = (item) => {
    setFormMasterName(item.name);
    setEditingMasterId(item.id);
    setIsAddingMaster(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50">
      {/* Header Section */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-1 tracking-tight">Karyawan</h1>
          <p className="text-slate-500 font-medium text-sm">Kelola data pegawai, pangkat/golongan, dan jabatan</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white px-6 border-b border-slate-200 flex gap-6 shrink-0">
        <button 
          onClick={() => { setActiveTab('karyawan'); setIsAddingMaster(false); }}
          className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'karyawan' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <FaUsers size={16} /> Daftar Karyawan
        </button>
        <button 
          onClick={() => { setActiveTab('pangkat'); setIsAddingKaryawan(false); }}
          className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'pangkat' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <FaMedal size={16} /> Master Pangkat/Gol
        </button>
        <button 
          onClick={() => { setActiveTab('jabatan'); setIsAddingKaryawan(false); }}
          className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'jabatan' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <FaBriefcase size={16} /> Master Jabatan
        </button>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-6 overflow-auto">
        {loading ? (
          <div className="text-center py-16 flex flex-col items-center justify-center gap-4 flex-1">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium animate-pulse">Memuat data...</p>
          </div>
        ) : (
          <div>
            
            {/* KARYAWAN TAB */}
            {activeTab === 'karyawan' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                  <h2 className="font-bold text-slate-700">Data Karyawan</h2>
                  {!isAddingKaryawan && (
                    <button 
                      onClick={() => { setIsAddingKaryawan(true); setEditingKaryawanId(null); setFormKaryawan({ nama: '', nip: '', pangkat: '', jabatan: '' }); }}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2"
                    >
                      <FaUserPlus /> Tambah Karyawan
                    </button>
                  )}
                </div>

                {isAddingKaryawan && (
                  <form onSubmit={handleSaveKaryawan} className="p-4 border-b border-indigo-100 bg-indigo-50/30 flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-xs font-bold text-slate-500 mb-1">NAMA</label>
                      <input required type="text" value={formKaryawan.nama} onChange={e => setFormKaryawan({...formKaryawan, nama: e.target.value})} className="w-full text-sm py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white" placeholder="Nama Karyawan" />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <label className="block text-xs font-bold text-slate-500 mb-1">NIP</label>
                      <input required type="text" value={formKaryawan.nip} onChange={e => setFormKaryawan({...formKaryawan, nip: e.target.value})} className="w-full text-sm py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white" placeholder="Nomor Induk Pegawai" />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <label className="block text-xs font-bold text-slate-500 mb-1">PANGKAT/GOL</label>
                      <select value={formKaryawan.pangkat} onChange={e => setFormKaryawan({...formKaryawan, pangkat: e.target.value})} className="w-full text-sm py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                        <option value="">-- Pilih Pangkat --</option>
                        {pangkatList.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <label className="block text-xs font-bold text-slate-500 mb-1">JABATAN</label>
                      <select value={formKaryawan.jabatan} onChange={e => setFormKaryawan({...formKaryawan, jabatan: e.target.value})} className="w-full text-sm py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                        <option value="">-- Pilih Jabatan --</option>
                        {jabatanList.map(j => <option key={j.id} value={j.name}>{j.name}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      <button type="submit" className="flex-1 sm:flex-none bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-sm">
                        <FaSave /> Simpan
                      </button>
                      <button type="button" onClick={() => setIsAddingKaryawan(false)} className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-100 flex items-center justify-center gap-2">
                        <FaTimes /> Batal
                      </button>
                    </div>
                  </form>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="p-4 text-xs font-bold text-slate-500 tracking-wider">NAMA</th>
                        <th className="p-4 text-xs font-bold text-slate-500 tracking-wider">NIP</th>
                        <th className="p-4 text-xs font-bold text-slate-500 tracking-wider">PANGKAT/GOL</th>
                        <th className="p-4 text-xs font-bold text-slate-500 tracking-wider">JABATAN</th>
                        <th className="p-4 text-xs font-bold text-slate-500 tracking-wider text-right">AKSI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {karyawanList.length === 0 ? (
                        <tr><td colSpan="5" className="p-8 text-center text-slate-400 font-medium">Belum ada data karyawan</td></tr>
                      ) : (
                        karyawanList.map((k) => (
                          <tr key={k.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                            <td className="p-4 font-semibold text-slate-800">{k.nama}</td>
                            <td className="p-4 text-slate-600 font-mono text-sm">{k.nip}</td>
                            <td className="p-4 text-slate-600">
                              {k.pangkat ? <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-100 inline-block">{k.pangkat}</span> : <span className="text-slate-400">-</span>}
                            </td>
                            <td className="p-4 text-slate-600">
                              {k.jabatan ? <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-100 inline-block">{k.jabatan}</span> : <span className="text-slate-400">-</span>}
                            </td>
                            <td className="p-4 text-right flex items-center justify-end gap-2">
                              <button onClick={() => startEditKaryawan(k)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"><FaPen size={14} /></button>
                              <button onClick={() => handleDeleteKaryawan(k.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"><FaTrash size={14} /></button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MASTER PANGKAT & JABATAN TABS */}
            {(activeTab === 'pangkat' || activeTab === 'jabatan') && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden max-w-2xl mx-auto">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                  <h2 className="font-bold text-slate-700">Data Master {activeTab === 'pangkat' ? 'Pangkat/Golongan' : 'Jabatan'}</h2>
                  {!isAddingMaster && (
                    <button 
                      onClick={() => { setIsAddingMaster(true); setEditingMasterId(null); setFormMasterName(''); }}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2"
                    >
                      <FaPlus /> Tambah Data
                    </button>
                  )}
                </div>

                {isAddingMaster && (
                  <form onSubmit={(e) => handleSaveMaster(e, activeTab === 'pangkat' ? pangkatCol : jabatanCol, activeTab === 'pangkat' ? 'master_pangkat' : 'master_jabatan')} className="p-4 border-b border-indigo-100 bg-indigo-50/30 flex gap-2">
                    <input 
                      required 
                      type="text" 
                      autoFocus
                      value={formMasterName} 
                      onChange={e => setFormMasterName(e.target.value)} 
                      className="flex-1 text-sm py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white" 
                      placeholder={`Nama ${activeTab === 'pangkat' ? 'Pangkat/Golongan' : 'Jabatan'}`} 
                    />
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2 shadow-sm">
                      <FaSave />
                    </button>
                    <button type="button" onClick={() => setIsAddingMaster(false)} className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-100 flex items-center gap-2">
                      <FaTimes />
                    </button>
                  </form>
                )}

                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="p-4 text-xs font-bold text-slate-500 tracking-wider">NAMA {activeTab === 'pangkat' ? 'PANGKAT/GOLONGAN' : 'JABATAN'}</th>
                      <th className="p-4 text-xs font-bold text-slate-500 tracking-wider text-right">AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(activeTab === 'pangkat' ? pangkatList : jabatanList).length === 0 ? (
                      <tr><td colSpan="2" className="p-8 text-center text-slate-400 font-medium">Belum ada data</td></tr>
                    ) : (
                      (activeTab === 'pangkat' ? pangkatList : jabatanList).map((item) => (
                        <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                          <td className="p-4 font-semibold text-slate-800">{item.name}</td>
                          <td className="p-4 text-right flex items-center justify-end gap-2">
                            <button onClick={() => startEditMaster(item)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"><FaPen size={14} /></button>
                            <button onClick={() => handleDeleteMaster(item.id, activeTab === 'pangkat' ? 'master_pangkat' : 'master_jabatan')} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"><FaTrash size={14} /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
}
