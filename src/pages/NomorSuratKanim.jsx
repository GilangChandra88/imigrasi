import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, query, deleteDoc, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { FaPlus, FaFolderOpen, FaSitemap, FaFolder, FaColumns, FaFileAlt, FaTimes, FaPrint } from "react-icons/fa";

import ViewTree from "../components/ViewTree";
import ViewExplorer from "../components/ViewExplorer";
import ViewColumns from "../components/ViewColumns";

const HIERARCHY = [
  "KOP",
  "Kode surat 1",
  "Kode surat 2",
  "Kode surat 3"
];

export default function NomorSuratKanim() {
  const [activeTab, setActiveTab] = useState('hierarki');
  const [previewSurat, setPreviewSurat] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('tree'); // 'tree', 'explorer', 'columns'
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedPath, setFocusedPath] = useState(null);
  
  // Settings & History State
  const [lastNumber, setLastNumber] = useState(0);
  const [isSavingNumber, setIsSavingNumber] = useState(false);
  const [suratHistory, setSuratHistory] = useState([]);

  const makCollection = collection(db, "nomor surat kanim");
  const settingsDocRef = doc(db, "settings", "nomor_surat");
  const historyCollection = collection(db, "surat_perintah");

  useEffect(() => {
    const q = query(makCollection);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNodes(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching data realtime:", error);
      setLoading(false);
    });

    const unsubSettings = onSnapshot(settingsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setLastNumber(docSnap.data().lastNumber || 0);
      }
    });

    const unsubHistory = onSnapshot(historyCollection, (snapshot) => {
      const hist = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // sort by createdAt descending
      hist.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setSuratHistory(hist);
    });

    return () => { unsubscribe(); unsubSettings(); unsubHistory(); };
  }, []);

  const handleSaveLastNumber = async () => {
    setIsSavingNumber(true);
    try {
      // Use updateDoc if it exists, setDoc if not. For safety we just use updateDoc or setDoc.
      // But firestore setDoc with merge: true is better. I will use updateDoc inside try and catch it if not exists.
      const { setDoc } = await import("firebase/firestore");
      await setDoc(settingsDocRef, { lastNumber: parseInt(lastNumber) }, { merge: true });
      alert("Nomor surat terakhir berhasil disimpan!");
    } catch (error) {
      console.error("Error saving last number:", error);
      alert("Gagal menyimpan pengaturan.");
    }
    setIsSavingNumber(false);
  };

  const HIERARCHY = [
    "KOP",
    "Kode surat 1",
    "Kode surat 2",
    "Kode surat 3"
  ];


  const handleAddNode = async (kode, name, type, parentId) => {
    try {
      await addDoc(makCollection, {
        kode: kode || "",
        name,
        type,
        parentId,
        createdAt: new Date().toISOString(),
      });
      // Realtime listener will handle state update
    } catch (error) {
      console.error("Error adding node:", error);
    }
  };

  const handleDeleteNode = async (id) => {
    if (!window.confirm("Yakin ingin menghapus item ini beserta seluruh isinya?")) return;
    
    // Recursive delete function to get all children
    const getChildrenIds = (parentId, allNodes) => {
      const children = allNodes.filter(n => n.parentId === parentId);
      let ids = children.map(c => c.id);
      children.forEach(c => {
        ids = [...ids, ...getChildrenIds(c.id, allNodes)];
      });
      return ids;
    };

    const idsToDelete = [id, ...getChildrenIds(id, nodes)];

    try {
      for (const nodeId of idsToDelete) {
        await deleteDoc(doc(db, "nomor surat kanim", nodeId));
      }
      // Realtime listener will handle state update
    } catch (error) {
      console.error("Error deleting nodes:", error);
    }
  };

  const handleEditNode = async (id, kode, name) => {
    try {
      await updateDoc(doc(db, "nomor surat kanim", id), { kode, name });
      // Realtime listener will handle state update
    } catch (error) {
      console.error("Error editing node:", error);
    }
  };

  const handleSearchResultClick = (clickedNode) => {
    const path = [];
    let current = clickedNode;
    while (current) {
      path.unshift(current.id);
      current = nodes.find(n => n.id === current.parentId);
    }
    setFocusedPath(path);
    setSearchQuery("");
  };

  const rootNodes = nodes.filter((n) => n.parentId === null && n.type === "Tahun");

  const filteredNodes = searchQuery.trim() 
    ? nodes.filter(n => 
        (n.name && n.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (n.kode && n.kode.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : nodes;

  return (
    <div className="w-full bg-white min-h-screen font-sans flex flex-col">
      {/* Header Section */}
      <div className="px-6 py-4 border-b border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-1 tracking-tight">Nomor Surat Kanim</h1>
          <p className="text-slate-500 font-medium text-sm">
            Manajemen hierarki dan pengaturan nomor surat keluar
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white px-6 border-b border-slate-200 flex gap-6 shrink-0 print:hidden">
        <button 
          onClick={() => setActiveTab('hierarki')}
          className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'hierarki' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <FaSitemap size={16} /> Hierarki Kode Surat
        </button>
        <button 
          onClick={() => setActiveTab('pengaturan')}
          className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'pengaturan' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <FaFolderOpen size={16} /> Pengaturan & Riwayat Surat
        </button>
      </div>

      {activeTab === 'hierarki' && (
        <div className="flex flex-col flex-1 min-h-0 print:hidden">
          <div className="px-6 py-3 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50/50 justify-between">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              {HIERARCHY.join(' → ')}
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <input 
                  type="text"
                  placeholder="Cari kode / keterangan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                />
              </div>
    
              <div className="flex bg-slate-200 p-1 rounded-xl shrink-0">
                <button 
                  onClick={() => setViewMode('tree')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${viewMode === 'tree' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <FaSitemap /> Pohon
                </button>
                <button 
                  onClick={() => setViewMode('explorer')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${viewMode === 'explorer' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <FaFolder /> Explorer
                </button>
                <button 
                  onClick={() => setViewMode('columns')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${viewMode === 'columns' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <FaColumns /> Kolom
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex-1 relative bg-slate-50/30 overflow-hidden flex flex-col">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium animate-pulse">Memuat data hierarki...</p>
              </div>
            ) : searchQuery.trim() ? (
              <div className="flex-1 p-6 overflow-y-auto">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Hasil Pencarian ({filteredNodes.length})</h2>
                {filteredNodes.length === 0 ? (
                  <div className="text-center p-12 text-slate-500">Tidak ada data yang cocok dengan pencarian Anda.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredNodes.map(node => (
                      <div 
                        key={node.id} 
                        onClick={() => handleSearchResultClick(node)}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">{node.type}</span>
                        </div>
                        <div className="text-sm text-slate-800 mt-1">
                          {node.kode ? <strong className="font-bold block text-slate-600 mb-1">{node.kode}</strong> : null}
                          <span className="font-medium leading-relaxed">{node.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0 relative">
                {viewMode === 'tree' && (
                  <div className="px-6 pb-6 flex-1 overflow-auto">
                    <ViewTree nodes={nodes} hierarchy={HIERARCHY} onAdd={handleAddNode} onDelete={handleDeleteNode} onEdit={handleEditNode} focusedPath={focusedPath} setFocusedPath={setFocusedPath} />
                  </div>
                )}
                {viewMode === 'explorer' && (
                  <div className="flex-1 flex flex-col min-h-0">
                    <ViewExplorer nodes={nodes} hierarchy={HIERARCHY} onAdd={handleAddNode} onDelete={handleDeleteNode} onEdit={handleEditNode} focusedPath={focusedPath} />
                  </div>
                )}
                {viewMode === 'columns' && (
                  <div className="flex-1 flex flex-col min-h-0">
                    <ViewColumns nodes={nodes} hierarchy={HIERARCHY} onAdd={handleAddNode} onDelete={handleDeleteNode} onEdit={handleEditNode} focusedPath={focusedPath} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'pengaturan' && (
        <div className="flex-1 p-6 bg-slate-50 overflow-auto print:hidden">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Pengaturan Nomor */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FaFolderOpen className="text-indigo-600" />
                Pengaturan Nomor Surat
              </h2>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Tentukan nomor urut surat terakhir yang dikeluarkan oleh sistem sebelumnya. Sistem akan otomatis melanjutkan penomoran dari angka tersebut untuk surat-surat berikutnya.
              </p>
              <div className="flex items-end gap-4 max-w-sm">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 mb-2">NOMOR TERAKHIR</label>
                  <input 
                    type="number" 
                    value={lastNumber}
                    onChange={(e) => setLastNumber(e.target.value)}
                    className="w-full font-mono text-lg py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <button 
                  onClick={handleSaveLastNumber}
                  disabled={isSavingNumber}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {isSavingNumber ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </button>
              </div>
            </div>

            {/* Riwayat Surat */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FaFileAlt className="text-slate-500" />
                  Riwayat Surat Keluar
                </h2>
                <p className="text-sm text-slate-500 mt-1">Daftar surat yang pernah dibuat melalui sistem</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="p-4 text-xs font-bold text-slate-500 tracking-wider">TANGGAL</th>
                      <th className="p-4 text-xs font-bold text-slate-500 tracking-wider">NOMOR SURAT</th>
                      <th className="p-4 text-xs font-bold text-slate-500 tracking-wider">JENIS SURAT</th>
                      <th className="p-4 text-xs font-bold text-slate-500 tracking-wider">DIBUAT PADA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suratHistory.length === 0 ? (
                      <tr><td colSpan="5" className="p-8 text-center text-slate-400 font-medium">Belum ada riwayat surat keluar</td></tr>
                    ) : (
                      suratHistory.map((s) => (
                        <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 text-slate-800 font-medium">{new Date(s.tanggal).toLocaleDateString('id-ID')}</td>
                          <td className="p-4 text-indigo-700 font-mono font-bold text-sm bg-indigo-50/30">{s.nomor}</td>
                          <td className="p-4 text-slate-600"><span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-100">Surat Perintah</span></td>
                          <td className="p-4 text-slate-500 text-sm">{new Date(s.createdAt).toLocaleString('id-ID')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}










