import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, onSnapshot, query, where } from "firebase/firestore";
import { FaSearch, FaPlus, FaTrash, FaSave, FaCheck, FaTimes, FaPrint, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function SuratPerintah() {
  const navigate = useNavigate();
  const [PegawaiList, setPegawaiList] = useState([]);
  const [searchPegawai, setSearchPegawai] = useState("");
  
  const [sugestiList, setSugestiList] = useState([]);
  const [activeField, setActiveField] = useState("menimbang"); // 'menimbang', 'dasar', 'untuk'
  const [viewMode, setViewMode] = useState("document");
  const [isSugestiOpen, setIsSugestiOpen] = useState(false);
  const [pegawaiPanelMode, setPegawaiPanelMode] = useState(null); // null, "kepada", "penandatangan"
  const [newSugesti, setNewSugesti] = useState("");
  
  // Document State
  const [docData, setDocData] = useState({
    nomor: "",
    menimbang: "",
    dasar: [""],
    kepada: [],
    untuk: [""],
    tempat: "Singaraja",
    tanggal: new Date().toISOString().split('T')[0], // yyyy-mm-dd
    penandatangan: ""
  });

  const [isNomorModalOpen, setIsNomorModalOpen] = useState(false);
  

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

  // Auto-resize textareas to fit content
  useEffect(() => {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(t => {
      t.style.height = 'auto';
      t.style.height = t.scrollHeight + 'px';
    });
  }, [docData, viewMode]);

  const isFormValid = () => {
    return (docData.menimbang || '').trim() !== '' &&
           docData.dasar.length > 0 && docData.dasar.every(d => (d || '').trim() !== '') &&
           docData.kepada.length > 0 &&
           docData.untuk.length > 0 && docData.untuk.every(u => (u || '').trim() !== '') &&
           (docData.tempat || '').trim() !== '' &&
           (docData.tanggal || '').trim() !== '' &&
           (docData.penandatangan || '').trim() !== '';
  };

  const getValidationClass = (val, isActive) => {
    const isFilled = typeof val === 'string' ? (val || '').trim() !== '' : (Array.isArray(val) ? val.length > 0 && val.every(v => typeof v === 'string' ? (v || '').trim() !== '' : !!v) : !!val);
    if (isFilled) return `border-emerald-400 bg-emerald-50/40 focus:ring-emerald-500 ${isActive ? 'ring-2 ring-emerald-200' : ''}`;
    return `border-rose-400 bg-rose-50/60 focus:ring-rose-500 ${isActive ? 'ring-2 ring-rose-200' : ''}`;
  };

  const getDocValidationClass = (val, isActive) => {
    const isFilled = typeof val === 'string' ? (val || '').trim() !== '' : (Array.isArray(val) ? val.length > 0 && val.every(v => typeof v === 'string' ? (v || '').trim() !== '' : !!v) : !!val);
    if (isFilled) return `print:!bg-transparent print:!border-transparent print:!ring-0 bg-emerald-50/40 border border-emerald-200 ${isActive ? 'ring-2 ring-emerald-200' : ''}`;
    return `print:!bg-transparent print:!border-transparent print:!ring-0 bg-rose-50 border border-dashed border-rose-400 ${isActive ? 'ring-2 ring-rose-300' : ''}`;
  };

  const handleGenerateNomor = async () => {
    if (!selectedKop || !selectedKode1 || !selectedKode2 || !selectedKode3) {
      alert("Pilih hierarki nomor surat dengan lengkap!");
      return;
    }
    const nextNumber = parseInt(lastNumberSetting) + 1;
    
    // Gabungkan kode, jika kode kosong maka gunakan nama. Filter bagian yang kosong agar tidak ada titik berlebih.
    const parts = [
      selectedKop.kode || selectedKop.name,
      selectedKode1.kode || selectedKode1.name,
      selectedKode2.kode || selectedKode2.name,
      selectedKode3.kode || selectedKode3.name
    ].filter(p => p && p.trim() !== "");
    
    const generated = `${parts.join(".")}-${nextNumber.toString().padStart(4, '0')}`;
    const newData = { ...docData, nomor: generated };
    
    setDocData(newData);
    setIsNomorModalOpen(false);

    try {
      await addDoc(collection(db, "surat_perintah"), {
        ...newData,
        createdAt: new Date().toISOString()
      });
      await updateDoc(doc(db, "settings", "nomor_surat"), {
        lastNumber: nextNumber
      });
      
      // Wait a bit for React to render the new Nomor in the document before printing
      setTimeout(() => {
        window.print();
      }, 500);
    } catch (error) {
      console.error("Error saving document:", error);
      alert("Gagal menyimpan dokumen surat. Hubungi administrator.");
    }
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
    if (activeField === 'dasar' || activeField === 'untuk') {
      const currentArray = Array.isArray(docData[activeField]) ? docData[activeField] : (typeof docData[activeField] === 'string' ? docData[activeField].split('\n') : []);
      setDocData({ ...docData, [activeField]: [...currentArray, teks] });
    } else {
      const currentText = docData[activeField];
      const newText = currentText ? `${currentText}\n${teks}` : teks;
      setDocData({ ...docData, [activeField]: newText });
    }
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
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-hidden relative print:bg-white print:h-auto print:overflow-visible">
      
      {/* MODAL NOMOR SURAT */}
      {isNomorModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 print:hidden">
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
      <div className="px-6 py-4 border-b border-slate-200 bg-white flex justify-between items-center shrink-0 shadow-sm z-10 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Buat Surat Perintah</h1>
          <p className="text-slate-500 font-medium text-sm">Desain dan simpan surat perintah secara interaktif</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 mx-4">
          <button 
            onClick={() => setViewMode('document')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'document' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Mode Dokumen
          </button>
          <button 
            onClick={() => setViewMode('form')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'form' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Mode Form
          </button>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => setIsNomorModalOpen(true)} 
            disabled={!isFormValid()}
            className={`border px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-sm ${isFormValid() ? 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700' : 'bg-slate-100 text-slate-400 border-slate-200 opacity-50 cursor-not-allowed'}`}>
            <FaPrint size={16} /> Buat Surat
          </button>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="flex-1 flex min-h-0 print:h-auto print:block">
        
        {/* MIDDLE PANEL: Main View Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-200/50 print:p-0 print:bg-transparent print:overflow-visible print:block">
          
          {/* FORM VIEW */}
          {viewMode === 'form' && (
            <div className="bg-white shadow-sm rounded-xl border border-slate-200 w-full max-w-3xl p-8 flex flex-col gap-6 print:hidden h-fit">
              <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4">Isi Data Surat Perintah</h2>
              
              <div className="flex flex-col gap-5">

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-600">Menimbang</label>
                  <textarea 
                    value={docData.menimbang} 
                    onChange={e => setDocData({...docData, menimbang: e.target.value})} 
                    onFocus={() => { setActiveField('menimbang'); setIsSugestiOpen(true); }}
                    onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                    className={`w-full p-3 border rounded-lg outline-none focus:ring-2 leading-relaxed resize-none overflow-hidden transition-colors ${getValidationClass(docData.menimbang, activeField === 'menimbang')}`}
                    rows={1}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-600">Dasar</label>
                  <div className="flex flex-col gap-3">
                    {(Array.isArray(docData.dasar) ? docData.dasar : [docData.dasar]).map((item, index) => (
                      <div key={index} className="flex gap-2 items-start group">
                        <span className="font-bold text-slate-400 pt-3 w-5 text-right">{index + 1}.</span>
                        <textarea 
                          value={item} 
                          onChange={e => {
                            const newDasar = [...(Array.isArray(docData.dasar) ? docData.dasar : [docData.dasar])];
                            newDasar[index] = e.target.value;
                            setDocData({...docData, dasar: newDasar});
                          }}
                          onFocus={() => { setActiveField('dasar'); setIsSugestiOpen(true); }}
                          onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                          className={`flex-1 p-3 border rounded-lg outline-none focus:ring-2 leading-relaxed resize-none overflow-hidden transition-colors ${getValidationClass(item, activeField === 'dasar')}`}
                          rows={1}
                        />
                        <button onClick={() => {
                          const newDasar = [...(Array.isArray(docData.dasar) ? docData.dasar : [docData.dasar])];
                          newDasar.splice(index, 1);
                          setDocData({...docData, dasar: newDasar});
                        }} className="p-3 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors mt-1 opacity-0 group-hover:opacity-100">
                          <FaTrash size={14} />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => {
                      const newDasar = [...(Array.isArray(docData.dasar) ? docData.dasar : [docData.dasar])];
                      newDasar.push("");
                      setDocData({...docData, dasar: newDasar});
                      setActiveField('dasar');
                    }} className="self-start flex items-center gap-2 text-indigo-600 font-bold text-sm hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors ml-7">
                      <FaPlus size={12} /> Tambah Dasar
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-slate-600">Kepada (Pegawai yang ditugaskan)</label>
                    <button onClick={() => { setActiveField('kepada'); setIsSugestiOpen(true); }} className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"><FaPlus size={10} /> Tambah Pegawai</button>
                  </div>
                  <div className={`flex flex-col gap-2 p-3 border rounded-lg transition-colors ${getValidationClass(docData.kepada, false)}`}>
                    {docData.kepada.length === 0 && <div className="text-sm text-slate-400 italic p-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center">Belum ada pegawai yang dipilih. Klik tombol Tambah Pegawai di atas.</div>}
                    {docData.kepada.map(k => (
                      <div key={k.id} className="flex justify-between items-center bg-white border border-slate-200 shadow-sm p-3 rounded-lg">
                        <div>
                          <p className="font-bold text-slate-700 text-sm">{k.nama}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{k.nip} - {k.jabatan}</p>
                        </div>
                        <button onClick={() => handleRemoveKepada(k.id)} className="text-rose-500 hover:text-rose-700 p-2 hover:bg-rose-50 rounded-lg transition-colors"><FaTrash size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-600">Untuk</label>
                  <div className="flex flex-col gap-3">
                    {(Array.isArray(docData.untuk) ? docData.untuk : [docData.untuk]).map((item, index) => (
                      <div key={index} className="flex gap-2 items-start group">
                        <span className="font-bold text-slate-400 pt-3 w-5 text-right">{index + 1}.</span>
                        <textarea 
                          value={item} 
                          onChange={e => {
                            const newUntuk = [...(Array.isArray(docData.untuk) ? docData.untuk : [docData.untuk])];
                            newUntuk[index] = e.target.value;
                            setDocData({...docData, untuk: newUntuk});
                          }}
                          onFocus={() => { setActiveField('untuk'); setIsSugestiOpen(true); }}
                          onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                          className={`flex-1 p-3 border rounded-lg outline-none focus:ring-2 leading-relaxed resize-none overflow-hidden transition-colors ${getValidationClass(item, activeField === 'untuk')}`}
                          rows={1}
                        />
                        <button onClick={() => {
                          const newUntuk = [...(Array.isArray(docData.untuk) ? docData.untuk : [docData.untuk])];
                          newUntuk.splice(index, 1);
                          setDocData({...docData, untuk: newUntuk});
                        }} className="p-3 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors mt-1 opacity-0 group-hover:opacity-100">
                          <FaTrash size={14} />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => {
                      const newUntuk = [...(Array.isArray(docData.untuk) ? docData.untuk : [docData.untuk])];
                      newUntuk.push("");
                      setDocData({...docData, untuk: newUntuk});
                      setActiveField('untuk');
                    }} className="self-start flex items-center gap-2 text-indigo-600 font-bold text-sm hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors ml-7">
                      <FaPlus size={12} /> Tambah Untuk
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-600">Tempat Dikeluarkan</label>
                    <input type="text" value={docData.tempat} onChange={e => setDocData({...docData, tempat: e.target.value})} className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 transition-colors ${getValidationClass(docData.tempat, false)}`} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-600">Tanggal</label>
                    <input type="date" value={docData.tanggal} onChange={e => setDocData({...docData, tanggal: e.target.value})} className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 transition-colors ${getValidationClass(docData.tanggal, false)}`} />
                  </div>
                </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-slate-600">Penandatangan</label>
                      <button onClick={() => { setActiveField('penandatangan'); setIsSugestiOpen(true); }} className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"><FaPlus size={10} /> Pilih Pegawai</button>
                    </div>
                    <input type="text" onFocus={() => { setActiveField('penandatangan'); setIsSugestiOpen(true); }} value={docData.penandatangan} onChange={e => setDocData({...docData, penandatangan: e.target.value})} className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 transition-colors ${getValidationClass(docData.penandatangan, false)}`} />
                  </div>
              </div>
            </div>
          )}

          {/* DOCUMENT PREVIEW */}
          <div 
            className={`bg-white shadow-xl w-full max-w-[794px] h-fit min-h-[1123px] p-10 sm:p-14 flex-col text-slate-900 relative print:shadow-none print:max-w-none print:w-full print:min-h-0 print:p-0 ${viewMode === 'document' ? 'flex' : 'hidden print:flex'}`}
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
                  <div className={`font-bold text-base bg-transparent text-center px-4 py-0.5 min-w-[250px] rounded ${getDocValidationClass(docData.nomor, false)}`}>
                    {docData.nomor}
                  </div>
                </div>
              </div>
            </div>

            {/* Isi Surat */}
            <div className="flex-1 flex flex-col gap-3 text-justify">
              
              <div className="grid grid-cols-[100px_1fr] gap-4">
                <div className="font-semibold pt-1 cursor-pointer" onClick={() => setActiveField('menimbang')}>Menimbang</div>
                <div className="relative group flex items-start">
                  <span className="mr-2 pt-1">:</span>
                  <textarea onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}  
                    value={docData.menimbang}
                    onChange={e => setDocData({...docData, menimbang: e.target.value})}
                    onClick={() => setActiveField('menimbang')}
                    className={`w-full bg-transparent outline-none resize-none overflow-hidden hover:bg-slate-50 transition-colors p-1 print:p-0 rounded print:!bg-transparent min-h-[80px] leading-relaxed ${getDocValidationClass(docData.menimbang, activeField === 'menimbang')}`}
                  />
                </div>

                <div className="font-semibold pt-1 cursor-pointer" onClick={() => setActiveField('dasar')}>Dasar</div>
                <div className="relative group flex items-start">
                  <span className="mr-2 pt-1">:</span>
                  <div className="flex-1 flex flex-col gap-1 w-full relative">
                    {(Array.isArray(docData.dasar) ? docData.dasar : [docData.dasar]).map((item, index) => (
                      <div key={index} className="flex items-start group/item relative">
                        <span className="mr-2 pt-1 min-w-[15px]">{index + 1}.</span>
                        <textarea onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}  
                          value={item}
                          onChange={e => {
                            const newDasar = [...(Array.isArray(docData.dasar) ? docData.dasar : [docData.dasar])];
                            newDasar[index] = e.target.value;
                            setDocData({...docData, dasar: newDasar});
                          }}
                          onClick={() => setActiveField('dasar')}
                          className={`w-full bg-transparent outline-none resize-none overflow-hidden hover:bg-slate-50 transition-colors p-1 print:p-0 rounded print:!bg-transparent  leading-relaxed ${getDocValidationClass(item, activeField === 'dasar')}`} rows={1}
                        />
                        <button 
                          onClick={() => {
                            const newDasar = [...(Array.isArray(docData.dasar) ? docData.dasar : [docData.dasar])];
                            newDasar.splice(index, 1);
                            setDocData({...docData, dasar: newDasar});
                          }}
                          className="absolute -right-8 top-1 opacity-0 group-hover/item:opacity-100 p-1.5 text-rose-500 hover:bg-rose-50 rounded print:hidden"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    ))}
                    
                    <button 
                      onClick={() => {
                        const newDasar = [...(Array.isArray(docData.dasar) ? docData.dasar : [docData.dasar])];
                        newDasar.push("");
                        setDocData({...docData, dasar: newDasar});
                      }}
                      className="mt-1 self-start opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-all print:hidden ml-6"
                    >
                      <FaPlus size={10} /> Tambah Dasar
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-center font-bold tracking-widest my-4">M E N U G A S K A N :</div>

              <div className="grid grid-cols-[100px_1fr] gap-4">
                <div className="font-semibold pt-1 cursor-pointer" onClick={() => setActiveField('kepada')}>Kepada</div>
                <div className={`flex rounded p-1 print:p-0 ${getDocValidationClass(docData.kepada, activeField === 'kepada')}`}>
                  <span className="mr-2 pt-1">:</span>
                  <div className="flex-1 flex flex-col gap-4 pt-1">
                    {docData.kepada.map((p, idx) => (
                      <div key={p.id} className="grid grid-cols-[20px_1fr] gap-2 group relative">
                        <span>{idx + 1}.</span>
                        <div className="grid grid-cols-[100px_1fr] gap-2">
                          <span>Nama</span>
                          <span className="font-bold uppercase">: {p.nama}</span>
                          <span>NIP</span>
                          <span>: {p.nip}</span>
                          <span>Pangkat / Gol.</span>
                          <span>: {p.pangkat}</span>
                          <span>Jabatan</span>
                          <span>: {p.jabatan}</span>
                        </div>
                        <button onClick={() => handleRemoveKepada(p.id)} className="absolute right-0 top-0 text-rose-500 opacity-0 group-hover:opacity-100 hover:bg-rose-50 p-1 rounded print:hidden"><FaTrash size={12} /></button>
                      </div>
                    ))}
                    {docData.kepada.length === 0 && (
                      <div className="text-slate-400 italic text-sm py-2">Belum ada pegawai dipilih...</div>
                    )}
                  </div>
                </div>

                <div className="font-semibold pt-1 cursor-pointer" onClick={() => setActiveField('untuk')}>Untuk</div>
                <div className="relative group flex items-start">
                  <span className="mr-2 pt-1">:</span>
                  <div className="flex-1 flex flex-col gap-1 w-full relative">
                    {(Array.isArray(docData.untuk) ? docData.untuk : [docData.untuk]).map((item, index) => (
                      <div key={index} className="flex items-start group/item relative">
                        <span className="mr-2 pt-1 min-w-[15px]">{index + 1}.</span>
                        <textarea onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}  
                          value={item}
                          onChange={e => {
                            const newUntuk = [...(Array.isArray(docData.untuk) ? docData.untuk : [docData.untuk])];
                            newUntuk[index] = e.target.value;
                            setDocData({...docData, untuk: newUntuk});
                          }}
                          onClick={() => setActiveField('untuk')}
                          className={`w-full bg-transparent outline-none resize-none overflow-hidden hover:bg-slate-50 transition-colors p-1 print:p-0 rounded print:!bg-transparent  leading-relaxed ${getDocValidationClass(item, activeField === 'untuk')}`} rows={1}
                        />
                        <button 
                          onClick={() => {
                            const newUntuk = [...(Array.isArray(docData.untuk) ? docData.untuk : [docData.untuk])];
                            newUntuk.splice(index, 1);
                            setDocData({...docData, untuk: newUntuk});
                          }}
                          className="absolute -right-8 top-1 opacity-0 group-hover/item:opacity-100 p-1.5 text-rose-500 hover:bg-rose-50 rounded print:hidden"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    ))}
                    
                    <button 
                      onClick={() => {
                        const newUntuk = [...(Array.isArray(docData.untuk) ? docData.untuk : [docData.untuk])];
                        newUntuk.push("");
                        setDocData({...docData, untuk: newUntuk});
                      }}
                      className="mt-1 self-start opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-all print:hidden ml-6"
                    >
                      <FaPlus size={10} /> Tambah Untuk
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-16 grid grid-cols-2">
                <div>
                  {/* QR Code Placeholder */}
                  <div className="w-24 h-24 bg-slate-100 border-2 border-slate-300 mt-12 flex items-center justify-center text-xs text-slate-400 font-sans text-center p-2">QR Code TTE</div>
                </div>
                <div className="text-sm">
                  <div className="grid grid-cols-[100px_1fr] gap-1 mb-2">
                    <span>Dikeluarkan di</span>
                    <span>: <input value={docData.tempat} onChange={e=>setDocData({...docData, tempat: e.target.value})} className={`outline-none border-b border-transparent hover:border-slate-300 focus:border-indigo-500 bg-transparent w-32 rounded ${getDocValidationClass(docData.tempat, false)}`} /></span>
                    
                    <span>Pada Tanggal</span>
                    <span>: <input type="date" value={docData.tanggal} onChange={e=>setDocData({...docData, tanggal: e.target.value})} className={`outline-none border-b border-transparent hover:border-slate-300 focus:border-indigo-500 bg-transparent w-32 font-sans text-xs rounded ${getDocValidationClass(docData.tanggal, false)}`} /></span>
                  </div>
                  <div className="font-bold mb-16 uppercase">
                    KEPALA KANTOR,
                  </div>
                  <div>
                    <input 
                      value={docData.penandatangan} 
                      onChange={e=>setDocData({...docData, penandatangan: e.target.value})} 
                      onClick={() => setActiveField('penandatangan')}
                      className={`font-bold underline outline-none border-transparent hover:bg-slate-50 focus:bg-indigo-50 bg-transparent w-full rounded ${getDocValidationClass(docData.penandatangan, activeField === 'penandatangan')}`} 
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Suggestions */}
        <div className={`bg-white border-l border-slate-200 flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-20 print:hidden transition-all duration-300 relative ${isSugestiOpen ? 'w-80' : 'w-0'}`}>
          <button 
            onClick={() => setIsSugestiOpen(!isSugestiOpen)}
            className="absolute -left-9 top-1/2 -translate-y-1/2 bg-white border border-slate-200 border-r-0 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] p-2.5 rounded-l-xl text-slate-500 hover:text-indigo-600 transition-colors z-30 flex items-center justify-center cursor-pointer"
            title={isSugestiOpen ? "Tutup panel sugesti" : "Buka panel sugesti"}
          >
            {isSugestiOpen ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
          </button>

            <div className={`flex-1 flex flex-col w-80 overflow-hidden transition-opacity duration-300 ${isSugestiOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div className="p-4 border-b border-slate-100 bg-indigo-50/50 shrink-0">
                <h2 className="font-bold text-indigo-900 mb-1 flex items-center gap-2">
                  {(activeField === 'kepada' || activeField === 'penandatangan') ? 'Data Pegawai' : 'Suggestion Box'}
                </h2>
                <p className="text-xs text-indigo-600/80 font-medium">Bagian terpilih: <strong className="uppercase bg-indigo-100 px-1 rounded">{activeField}</strong></p>
              </div>
              
              {(activeField === 'kepada' || activeField === 'penandatangan') ? (
                <>
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
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
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {filteredPegawai.map(k => {
                      const isSelected = activeField === 'kepada' 
                        ? docData.kepada.find(selected => selected.id === k.id)
                        : docData.penandatangan === k.nama;
                        
                      return (
                        <div key={k.id} className={`p-3 rounded-xl border transition-all cursor-pointer ${isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-300'}`} onClick={() => {
                          if (activeField === 'kepada') {
                            isSelected ? handleRemoveKepada(k.id) : handleAddKepada(k);
                          } else if (activeField === 'penandatangan') {
                            setDocData({...docData, penandatangan: k.nama});
                          }
                        }}>
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
                </>
              ) : (
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
              )}

            <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0">
              <form onSubmit={handleSaveNewSugesti} className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500">TAMBAH SUGESTI BARU</label>
                <textarea onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}  
                  value={newSugesti}
                  onChange={e => setNewSugesti(e.target.value)}
                  placeholder={`Ketik sugesti untuk ${activeField}...`}
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none min-h-[80px]"
                />
                <button type="submit" className="w-full bg-indigo-50 text-indigo-700 py-2 rounded-lg font-bold text-xs hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2">
                  <FaPlus size={10} /> Simpan Sugesti
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}


















































