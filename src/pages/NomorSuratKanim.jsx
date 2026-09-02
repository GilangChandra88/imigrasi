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
      <div className="bg-white px-6 border-b border-slate-200 flex gap-6 shrink-0 print:hidden overflow-x-auto">
        <button 
          onClick={() => setActiveTab('hierarki')}
          className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'hierarki' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <FaSitemap size={16} /> Hierarki Kode Surat
        </button>
        <button 
          onClick={() => setActiveTab('riwayat')}
          className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'riwayat' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <FaFileAlt size={16} /> Riwayat Surat Keluar
        </button>
        <button 
          onClick={() => setActiveTab('pengaturan')}
          className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'pengaturan' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <FaFolderOpen size={16} /> Pengaturan
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
          <div className="max-w-3xl mx-auto">
            
            {/* Pengaturan Nomor */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FaFolderOpen className="text-indigo-600" />
                Pengaturan Nomor Surat
              </h2>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Tentukan nomor urut surat terakhir yang dikeluarkan oleh sistem sebelumnya. Sistem akan otomatis melanjutkan penomoran dari angka tersebut untuk surat-surat berikutnya.
              </p>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 mb-2">NOMOR TERAKHIR</label>
                  <input 
                    type="number" 
                    value={lastNumber}
                    onChange={(e) => setLastNumber(e.target.value)}
                    className="w-full font-mono text-lg py-2.5 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <button 
                  onClick={handleSaveLastNumber}
                  disabled={isSavingNumber}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 h-[48px]"
                >
                  {isSavingNumber ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {activeTab === 'riwayat' && (
        <div className="flex-1 p-6 bg-slate-50 overflow-auto print:hidden">
          <div className="max-w-[1400px] mx-auto">
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
                      <th className="p-4 text-xs font-bold text-slate-500 tracking-wider">PERIHAL / UNTUK</th>
                      <th className="p-4 text-xs font-bold text-slate-500 tracking-wider">PENUGASAN</th>
                      <th className="p-4 text-xs font-bold text-slate-500 tracking-wider text-right">DIBUAT PADA</th>
                      <th className="p-4 text-xs font-bold text-slate-500 tracking-wider text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suratHistory.length === 0 ? (
                      <tr><td colSpan="6" className="p-8 text-center text-slate-400 font-medium">Belum ada riwayat surat keluar</td></tr>
                    ) : (
                      suratHistory.map((s) => (
                        <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 text-slate-800 font-medium whitespace-nowrap">{new Date(s.tanggal).toLocaleDateString('id-ID')}</td>
                          <td className="p-4 text-indigo-700 font-mono font-bold text-sm bg-indigo-50/30 whitespace-nowrap">{s.nomor}</td>
                          <td className="p-4 text-slate-600 text-sm max-w-[400px] truncate" title={s.untuk?.[0]}>{s.untuk?.[0] || '-'}</td>
                          <td className="p-4 text-slate-600 text-sm">
                            {s.kepada && s.kepada.length > 0 ? (
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-700 whitespace-nowrap truncate">{s.kepada[0].nama}</span>
                                {s.kepada.length > 1 && <span className="text-xs text-indigo-500 mt-0.5">+{s.kepada.length - 1} pegawai lainnya</span>}
                              </div>
                            ) : '-'}
                          </td>
                          <td className="p-4 text-slate-500 text-xs text-right whitespace-nowrap">{new Date(s.createdAt).toLocaleString('id-ID')}</td>
                          <td className="p-4 text-center">
                            <button onClick={() => setPreviewSurat(s)} className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                              Lihat
                            </button>
                          </td>
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

      {/* Preview Modal */}
      {previewSurat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 print:bg-white print:inset-auto print:relative print:w-full">
          <div className="bg-white rounded-2xl shadow-xl flex flex-col max-h-[95vh] w-[1000px] max-w-[95vw] print:shadow-none print:max-h-none print:w-full print:max-w-none">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-2xl shrink-0 print:hidden">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <FaFileAlt className="text-indigo-600" />
                  Preview Dokumen
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-mono">{previewSurat.nomor}</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors">
                  <FaPrint size={14} /> Cetak
                </button>
                <button onClick={() => setPreviewSurat(null)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                  <FaTimes size={20} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-8 print:p-0 bg-slate-200/50 print:bg-white flex-1">
              {/* Document Paper */}
              <div className="bg-white mx-auto shadow-sm print:shadow-none min-h-[1056px] w-[816px] print:w-full text-black pl-[3cm] pr-[2cm] py-[2cm] print:p-0" style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: '16px' }}>
                  {/* Header / KOP Placeholder */}
                  <div className="border-b-[4px] border-black pb-2 mb-8 flex items-center text-center relative" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
                    <div className="w-[90px] h-[90px] shrink-0 bg-slate-100 rounded-full border-2 border-slate-300 flex items-center justify-center text-slate-400 text-xs font-sans print:border-black print:text-black">Logo</div>
                    <div className="flex-1 ml-4 pr-10">
                      <h3 className="leading-tight uppercase text-[13px]">KEMENTERIAN IMIGRASI DAN PEMASYARAKATAN REPUBLIK INDONESIA</h3>
                      <h3 className="leading-tight uppercase text-[13px]">DIREKTORAT JENDERAL IMIGRASI</h3>
                      <h3 className="leading-tight uppercase text-[13px]">KANTOR WILAYAH DIREKTORAT JENDERAL IMIGRASI BALI</h3>
                      <h2 className="font-bold leading-tight uppercase mt-0.5 text-[16px]">KANTOR IMIGRASI KELAS II TPI SINGARAJA</h2>
                      <p className="mt-0.5 text-[11px]">Jl. Raya Singaraja Seririt, Pemaron, Buleleng, Bali. Telepon (0362) 32174</p>
                      <p className="text-[11px]">Laman: www.singaraja.imigrasi.go.id Pos-el: kanim_singaraja@imigrasi.go.id</p>
                    </div>
                  </div>

                  {/* Judul Surat */}
                  <div className="text-center mb-8">
                    <h2 className="font-bold text-[17px] uppercase tracking-wider">SURAT PERINTAH</h2>
                    <div className="flex justify-center items-center mt-0.5">
                      <span className="font-bold mr-2 text-[14px]">NOMOR :</span>
                      <div className="font-bold text-[14px] bg-transparent text-center px-2 py-0.5 min-w-[250px] rounded">
                        {previewSurat.nomor}
                      </div>
                    </div>
                  </div>

                  {/* Isi Surat */}
                  <div className="flex-1 flex flex-col gap-3 text-justify text-[15px] leading-snug">
                    
                    <div className="grid grid-cols-[110px_1fr] gap-2">
                      <div className="pt-1">Menimbang</div>
                      <div className="flex items-start w-full">
                        <span className="w-[20px] shrink-0 pt-1 text-center">:</span>
                        <div className="flex-1 w-full leading-relaxed py-1">
                          {previewSurat.menimbang}
                        </div>
                      </div>

                      <div className="pt-1">Dasar</div>
                      <div className="flex items-start">
                        <span className="w-[20px] shrink-0 pt-1 text-center">:</span>
                        <div className="flex-1 flex flex-col gap-1 w-full">
                          {(Array.isArray(previewSurat.dasar) ? previewSurat.dasar : [previewSurat.dasar]).map((item, index) => (
                            <div key={index} className="flex items-start">
                              <span className="w-[25px] shrink-0 pt-1">{index + 1}.</span>
                              <div className="flex-1 w-full leading-relaxed py-1">
                                {item}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="text-center font-bold tracking-widest my-4 text-[15px]">M E N U G A S K A N :</div>

                    <div className="grid grid-cols-[110px_1fr] gap-2">
                      <div className="pt-1">Kepada</div>
                      <div className="flex flex-col gap-4 p-1 print:p-0">
                        {previewSurat.kepada?.map((p, idx) => (
                          <div key={p.id || idx} className="flex">
                            <span className="w-[20px] shrink-0 text-center">:</span>
                            <span className="w-[25px] shrink-0">{idx + 1}</span>
                            <div className="flex-1 grid grid-cols-[110px_15px_1fr] gap-y-1">
                              <span>Nama</span><span>:</span><span>{p.nama}</span>
                              <span>NIP</span><span>:</span><span>{p.nip}</span>
                              <span>Pangkat / Gol.</span><span>:</span><span>{p.pangkat}</span>
                              <span>Jabatan</span><span>:</span><span>{p.jabatan}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-1">Untuk</div>
                      <div className="flex items-start">
                        <span className="w-[20px] shrink-0 pt-1 text-center">:</span>
                        <div className="flex-1 flex flex-col gap-1 w-full">
                          {(Array.isArray(previewSurat.untuk) ? previewSurat.untuk : [previewSurat.untuk]).map((item, index) => (
                            <div key={index} className="flex items-start">
                              <span className="w-[25px] shrink-0 pt-1">{index + 1}.</span>
                              <div className="flex-1 w-full leading-relaxed py-1">
                                {item}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="break-inside-avoid">
                    <div className="mt-16 grid grid-cols-[1fr_250px] gap-4">
                      <div className="flex items-end pb-8">
                        {/* QR Code Placeholder */}
                        <div className="w-24 h-24 bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-xs text-slate-400 font-sans text-center p-2">QR Code TTE</div>
                      </div>
                      <div className="text-[15px] flex flex-col">
                        <div className="flex mb-1 items-center">
                          <span>{previewSurat.tempat}</span>
                          <span className="mr-2">,</span>
                          <span>{previewSurat.tanggal ? new Date(previewSurat.tanggal).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'}) : ''}</span>
                        </div>
                        <div className="mb-2 uppercase">
                          Kepala,
                        </div>
                        
                        {/* Signature Space */}
                        <div className="h-[60px]"></div>

                        <div className="mt-2">
                          <div className="font-bold w-full rounded">
                            {typeof previewSurat.penandatangan === 'string' 
                              ? previewSurat.penandatangan 
                              : previewSurat.penandatangan?.nama}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Notes */}
                    <div className="mt-16 text-center text-[11px] leading-tight pt-4 border-t border-black">
                      Dokumen ini telah ditandatangani secara elektronik menggunakan sertifikat elektronik<br/>yang diterbitkan oleh Balai Besar Sertifikasi Elektronik (BSrE), Badan Siber dan Sandi Negara (BSSN).
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



















