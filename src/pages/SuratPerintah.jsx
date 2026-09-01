import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, onSnapshot, query, where } from "firebase/firestore";
import { FaSearch, FaPlus, FaTrash, FaSave, FaCheck, FaTimes } from "react-icons/fa";

export default function SuratPerintah() {
  const [PegawaiList, setPegawaiList] = useState([]);
  const [searchPegawai, setSearchPegawai] = useState("");
  
  const [sugestiList, setSugestiList] = useState([]);
  const [newSugesti, setNewSugesti] = useState("");
  
  // Document State
  const [docData, setDocData] = useState({
    nomor: "WIM.20.IMI.3.UM.02.07-",
    menimbang: "Bahwa dalam rangka pelaksanaan tugas kedinasan, dipandang perlu untuk dikeluarkan Surat Perintah sebagai landasan dalam pelaksanaan kegiatan dimaksud.",
    dasar: "1. DIPA Kantor Imigrasi Kelas II TPI Singaraja;",
    kepada: [],
    untuk: "1. Melaksanakan tugas kedinasan dengan sebaik-baiknya;\n2. Melaporkan hasil kegiatan tersebut kepada Kepala Kantor Imigrasi Kelas II TPI Singaraja.",
    tempat: "Singaraja",
    tanggal: new Date().toISOString().split('T')[0], // yyyy-mm-dd
    penandatangan: "Anak Agung Gde Kusuma Putra"
  });

  const [isNomorModalOpen, setIsNomorModalOpen] = useState(false);
  const [activeField, setActiveField] = useState("menimbang"); // 'menimbang', 'dasar', 'untuk'

  // Nomor Surat State
  const [nomorNodes, setNomorNodes] = useState([]);
  const [lastNumberSetting, setLastNumberSetting] = useState(0);
  const [selectedKop, setSelectedKop] = useState(null);
  const [selectedKode1, setSelectedKode1] = useState(null);
  const [selectedKode2, setSelectedKode2] = useState(null);
  const [selectedKode3, setSelectedKode3] = useState(null);

  // Fetch Pegawai
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "pegawai"), (snapshot) => {
      setPegawaiList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  // Fetch Sugesti
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "master_sugesti"), (snapshot) => {
      setSugestiList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  // Fetch Nomor Surat Hierarchy and Settings
  useEffect(() => {
    const unsubNomor = onSnapshot(collection(db, "nomor surat kanim"), (snapshot) => {
      setNomorNodes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubSettings = onSnapshot(doc(db, "settings", "nomor_surat"), (docSnap) => {
      if (docSnap.exists()) {
        setLastNumberSetting(docSnap.data().lastNumber || 0);
      }
    });
    return () => { unsubNomor(); unsubSettings(); };
  }, []);

  const handleGenerateNomor = () => {
    if (!selectedKop || !selectedKode1 || !selectedKode2 || !selectedKode3) {
      alert("Pilih hierarki nomor surat dengan lengkap!");
      return;
    }
    const nextNumber = parseInt(lastNumberSetting) + 1;
    // Format: [KOP].[Kode 1].[Kode 2].[Kode 3]-[NextNumber]
    const generated = `${selectedKop.kode}.${selectedKode1.kode}.${selectedKode2.kode}.${selectedKode3.kode}-${nextNumber}`;
    setDocData({ ...docData, nomor: generated });
    setIsNomorModalOpen(false);
  };

  const filteredPegawai = PegawaiList.filter(k => 
    k.nama?.toLowerCase().includes(searchPegawai.toLowerCase()) || 
    k.nip?.toLowerCase().includes(searchPegawai.toLowerCase())
  );

  const activeSugesti = sugestiList.filter(s => s.kategori === activeField);

  const handleAddKepada = (Pegawai) => {
    if (!docData.kepada.find(k => k.id === Pegawai.id)) {
      setDocData({ ...docData, kepada: [...docData.kepada, Pegawai] });
    }
  };

  const handleRemoveKepada = (id) => {
    setDocData({ ...docData, kepada: docData.kepada.filter(k => k.id !== id) });
  };

  const handleAddSugestiToDoc = (teks) => {
    const currentText = docData[activeField];
    const newText = currentText ? `${currentText}\n${teks}` : teks;
    setDocData({ ...docData, [activeField]: newText });
  };

  const handleSaveNewSugesti = async (e) => {
    e.preventDefault();
    if (!newSugesti.trim()) return;
    try {
      await addDoc(collection(db, "master_sugesti"), {
        kategori: activeField,
        teks: newSugesti.trim(),
        createdAt: new Date().toISOString()
      });
      setNewSugesti("");
    } catch (error) {
      console.error("Error adding sugesti:", error);
    }
  };

  const handleDeleteSugesti = async (id) => {
    if(!window.confirm("Hapus sugesti ini?")) return;
    try {
      await deleteDoc(doc(db, "master_sugesti", id));
    } catch (error) {
      console.error("Error deleting sugesti:", error);
    }
  };

  const handleSaveDocument = async () => {
    try {
      await addDoc(collection(db, "surat_perintah"), {
        ...docData,
        createdAt: new Date().toISOString()
      });
      alert("Surat Perintah berhasil disimpan!");
    } catch (error) {
      console.error("Error saving document:", error);
      alert("Gagal menyimpan dokumen");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-hidden relative">
      
      {/* MODAL NOMOR SURAT */}
      {isNomorModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-full">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-lg text-slate-800">Generate Nomor Surat</h2>
              <button onClick={() => setIsNomorModalOpen(false)} className="text-slate-400 hover:text-rose-500"><FaTimes /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex flex-col gap-6">
              
              {/* KOP Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">PILIH KOP</label>
                <select 
                  value={selectedKop?.id || ''} 
                  onChange={e => {
                    setSelectedKop(nomorNodes.find(n => n.id === e.target.value));
                    setSelectedKode1(null); setSelectedKode2(null); setSelectedKode3(null);
                  }}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Pilih KOP --</option>
                  {nomorNodes.filter(n => n.type === 'KOP').map(n => <option key={n.id} value={n.id}>{n.kode} - {n.name}</option>)}
                </select>
              </div>

              {/* Kode 1 Selection */}
              {selectedKop && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">PILIH KODE SURAT 1</label>
                  <select 
                    value={selectedKode1?.id || ''} 
                    onChange={e => {
                      setSelectedKode1(nomorNodes.find(n => n.id === e.target.value));
                      setSelectedKode2(null); setSelectedKode3(null);
                    }}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Pilih Kode Surat 1 --</option>
                    {nomorNodes.filter(n => n.parentId === selectedKop.id).map(n => <option key={n.id} value={n.id}>{n.kode} - {n.name}</option>)}
                  </select>
                </div>
              )}

              {/* Kode 2 Selection */}
              {selectedKode1 && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">PILIH KODE SURAT 2</label>
                  <select 
                    value={selectedKode2?.id || ''} 
                    onChange={e => {
                      setSelectedKode2(nomorNodes.find(n => n.id === e.target.value));
                      setSelectedKode3(null);
                    }}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Pilih Kode Surat 2 --</option>
                    {nomorNodes.filter(n => n.parentId === selectedKode1.id).map(n => <option key={n.id} value={n.id}>{n.kode} - {n.name}</option>)}
                  </select>
                </div>
              )}

              {/* Kode 3 Selection */}
              {selectedKode2 && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">PILIH KODE SURAT 3</label>
                  <select 
                    value={selectedKode3?.id || ''} 
                    onChange={e => setSelectedKode3(nomorNodes.find(n => n.id === e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Pilih Kode Surat 3 --</option>
                    {nomorNodes.filter(n => n.parentId === selectedKode2.id).map(n => <option key={n.id} value={n.id}>{n.kode} - {n.name}</option>)}
                  </select>
                </div>
              )}
              
            </div>
            
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
              <button onClick={() => setIsNomorModalOpen(false)} className="px-4 py-2 rounded-lg font-semibold text-slate-500 hover:bg-slate-100">Batal</button>
              <button onClick={handleGenerateNomor} className="px-4 py-2 rounded-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700">Generate Nomor</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white flex justify-between items-center shrink-0 shadow-sm z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Buat Surat Perintah</h1>
          <p className="text-slate-500 font-medium text-sm">Desain dan simpan surat perintah secara interaktif</p>
        </div>
        <button onClick={handleSaveDocument} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm">
          <FaSave size={16} /> Simpan Surat
        </button>
      </div>

      {/* 3-Column Layout */}
      <div className="flex-1 flex min-h-0">
        
        {/* LEFT PANEL: Pegawai List */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-[4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-slate-700 mb-3 text-sm flex items-center gap-2">
              Pilih Pegawai (Ditugaskan)
            </h2>
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Cari nama atau NIP..."
                value={searchPegawai}
                onChange={e => setSearchPegawai(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredPegawai.map(k => {
              const isSelected = docData.kepada.find(selected => selected.id === k.id);
              return (
                <div key={k.id} className={`p-3 rounded-xl border transition-all cursor-pointer ${isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-300'}`} onClick={() => isSelected ? handleRemoveKepada(k.id) : handleAddKepada(k)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-800 text-sm leading-tight mb-0.5">{k.nama}</p>
                      <p className="text-slate-500 text-xs font-mono">{k.nip}</p>
                      <p className="text-slate-500 text-xs mt-1 truncate">{k.jabatan}</p>
                    </div>
                    {isSelected ? (
                      <div className="bg-indigo-500 text-white p-1 rounded-full"><FaCheck size={10} /></div>
                    ) : (
                      <div className="text-slate-300"><FaPlus size={12} /></div>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredPegawai.length === 0 && (
              <div className="text-center p-4 text-slate-400 text-sm">Tidak ada pegawai ditemukan.</div>
            )}
          </div>
        </div>

        {/* MIDDLE PANEL: Document Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-200/50">
          <div 
            className="bg-white shadow-xl w-full max-w-[794px] h-fit min-h-[1123px] p-10 sm:p-14 flex flex-col text-slate-900 relative"
            style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: '16px' }}
          >
            
            {/* Header / KOP Placeholder */}
            <div className="border-b-[3px] border-slate-900 pb-4 mb-6 flex items-center justify-center text-center relative" style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: '13.33px' }}>
              <div className="absolute left-0 top-0 w-20 h-20 bg-slate-100 rounded-full border-2 border-slate-300 flex items-center justify-center text-slate-400 text-xs font-sans">Logo</div>
              <div>
                <h3 className="font-bold leading-tight uppercase">Kementerian Imigrasi dan Pemasyarakatan</h3>
                <h3 className="font-bold leading-tight uppercase">Direktorat Jenderal Imigrasi</h3>
                <h2 className="font-bold leading-tight uppercase mt-0.5" style={{ fontSize: '16px' }}>Kantor Imigrasi Kelas II TPI Singaraja</h2>
                <p className="mt-0.5">Jl. Raya Singaraja Seririt, Pemaron, Buleleng, Bali. Telepon (0362) 32174</p>
                <p>Laman: www.singaraja.imigrasi.go.id Pos-el: kanim_singaraja@imigrasi.go.id</p>
              </div>
            </div>

            {/* Judul Surat */}
            <div className="text-center mb-8">
              <h2 className="font-bold text-lg underline uppercase tracking-wider">Surat Perintah</h2>
              <div className="flex justify-center items-center mt-1">
                <span className="mr-2">NOMOR :</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={docData.nomor} 
                    onChange={e => setDocData({...docData, nomor: e.target.value})}
                    className="font-bold text-base outline-none border-b border-transparent hover:border-slate-300 focus:border-indigo-500 bg-transparent text-center w-64"
                  />
                  <button onClick={() => setIsNomorModalOpen(true)} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-sans font-bold hover:bg-indigo-200">
                    SET NOMOR
                  </button>
                </div>
              </div>
            </div>

            {/* Isi Surat Layout Grid */}
            <div className="grid grid-cols-[100px_1fr] gap-4 text-sm leading-relaxed text-justify">
              
              {/* Menimbang */}
              <div className="font-semibold pt-1 cursor-pointer" onClick={() => setActiveField('menimbang')}>Menimbang</div>
              <div className="relative group flex items-start">
                <span className="mr-2 pt-1">:</span>
                <textarea 
                  value={docData.menimbang}
                  onChange={e => setDocData({...docData, menimbang: e.target.value})}
                  onClick={() => setActiveField('menimbang')}
                  className={`w-full bg-transparent outline-none resize-none overflow-hidden hover:bg-slate-50 transition-colors p-1 rounded min-h-[80px] leading-relaxed ${activeField === 'menimbang' ? 'ring-2 ring-indigo-200 bg-indigo-50/30' : ''}`}
                />
              </div>

              {/* Dasar */}
              <div className="font-semibold pt-1 cursor-pointer" onClick={() => setActiveField('dasar')}>Dasar</div>
              <div className="relative group flex items-start">
                <span className="mr-2 pt-1">:</span>
                <textarea 
                  value={docData.dasar}
                  onChange={e => setDocData({...docData, dasar: e.target.value})}
                  onClick={() => setActiveField('dasar')}
                  className={`w-full bg-transparent outline-none resize-none overflow-hidden hover:bg-slate-50 transition-colors p-1 rounded min-h-[100px] leading-relaxed ${activeField === 'dasar' ? 'ring-2 ring-indigo-200 bg-indigo-50/30' : ''}`}
                />
              </div>

              {/* Teks Menugaskan */}
              <div className="col-span-2 text-center font-bold my-4 tracking-widest">
                M E N U G A S K A N :
              </div>

              {/* Kepada (Pegawai) */}
              <div className="font-semibold pt-1">Kepada</div>
              <div className="flex items-start">
                <span className="mr-2 pt-1">:</span>
                <div className="w-full p-1">
                  {docData.kepada.length === 0 ? (
                    <div className="text-slate-400 italic bg-red-50 p-2 rounded border border-red-100 text-xs font-sans">
                      * Silakan pilih pegawai dari panel sebelah kiri
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {docData.kepada.map((k, index) => (
                        <div key={k.id} className="flex group relative">
                          <span className="w-6">{index + 1}.</span>
                          <div className="flex-1 grid grid-cols-[100px_1fr] gap-x-2">
                            <span>Nama</span>
                            <span className="font-semibold">: {k.nama}</span>
                            
                            <span>NIP</span>
                            <span>: {k.nip}</span>
                            
                            <span>Pangkat / Gol.</span>
                            <span>: {k.pangkat || '-'}</span>
                            
                            <span>Jabatan</span>
                            <span>: {k.jabatan || '-'}</span>
                          </div>
                          <button onClick={() => handleRemoveKepada(k.id)} className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-50 p-1 rounded font-sans">
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Untuk */}
              <div className="font-semibold pt-1 cursor-pointer" onClick={() => setActiveField('untuk')}>Untuk</div>
              <div className="relative group flex items-start">
                <span className="mr-2 pt-1">:</span>
                <textarea 
                  value={docData.untuk}
                  onChange={e => setDocData({...docData, untuk: e.target.value})}
                  onClick={() => setActiveField('untuk')}
                  className={`w-full bg-transparent outline-none resize-none overflow-hidden hover:bg-slate-50 transition-colors p-1 rounded min-h-[150px] leading-relaxed ${activeField === 'untuk' ? 'ring-2 ring-indigo-200 bg-indigo-50/30' : ''}`}
                />
              </div>

            </div>

            {/* Footer / Tanda Tangan */}
            <div className="mt-16 grid grid-cols-2">
              <div>
                {/* QR Code Placeholder */}
                <div className="w-24 h-24 bg-slate-100 border-2 border-slate-300 mt-12 flex items-center justify-center text-xs text-slate-400 font-sans text-center p-2">QR Code TTE</div>
              </div>
              <div className="text-sm">
                <div className="grid grid-cols-[100px_1fr] gap-1 mb-2">
                  <span>Dikeluarkan di</span>
                  <span>: <input value={docData.tempat} onChange={e=>setDocData({...docData, tempat: e.target.value})} className="outline-none border-b border-transparent hover:border-slate-300 focus:border-indigo-500 bg-transparent w-32" /></span>
                  
                  <span>Pada Tanggal</span>
                  <span>: <input type="date" value={docData.tanggal} onChange={e=>setDocData({...docData, tanggal: e.target.value})} className="outline-none border-b border-transparent hover:border-slate-300 focus:border-indigo-500 bg-transparent w-32 font-sans text-xs" /></span>
                </div>
                <div className="font-bold mb-16">
                  KEPALA KANTOR,
                </div>
                <div>
                  <input 
                    value={docData.penandatangan} 
                    onChange={e=>setDocData({...docData, penandatangan: e.target.value})} 
                    className="font-bold underline outline-none border-transparent hover:bg-slate-50 focus:bg-indigo-50 bg-transparent w-full" 
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT PANEL: Suggestions */}
        <div className="w-80 bg-white border-l border-slate-200 flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10">
          <div className="p-4 border-b border-slate-100 bg-indigo-50/50">
            <h2 className="font-bold text-indigo-900 mb-1 flex items-center gap-2">
              Suggestion Box
            </h2>
            <p className="text-xs text-indigo-600/80 font-medium">Bagian terpilih: <strong className="uppercase bg-indigo-100 px-1 rounded">{activeField}</strong></p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeSugesti.length === 0 ? (
              <div className="text-center p-6 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                Belum ada sugesti untuk bagian {activeField.toUpperCase()}.
              </div>
            ) : (
              activeSugesti.map(s => (
                <div key={s.id} className="p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group relative cursor-pointer" onClick={() => handleAddSugestiToDoc(s.teks)}>
                  <p className="text-xs text-slate-600 line-clamp-4 leading-relaxed">{s.teks}</p>
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteSugesti(s.id); }} className="p-1.5 bg-white text-rose-500 hover:bg-rose-50 rounded-lg shadow-sm border border-slate-200"><FaTrash size={10} /></button>
                  </div>
                  <div className="mt-2 text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Klik untuk menambahkan</div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <form onSubmit={handleSaveNewSugesti} className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500">TAMBAH SUGESTI BARU</label>
              <textarea 
                value={newSugesti}
                onChange={e => setNewSugesti(e.target.value)}
                placeholder={`Ketik sugesti untuk ${activeField}...`}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-20"
              />
              <button type="submit" className="bg-white border border-indigo-200 text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
                <FaPlus size={12} /> Simpan Sugesti
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
