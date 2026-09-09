import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaChevronLeft, FaSave, FaPrint, FaCheckCircle, FaSpinner, FaSearch, FaTimes } from 'react-icons/fa';
import { SURAT_REGISTRY } from '../../surat';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp, getDocs, doc, updateDoc, getDoc, runTransaction, query, where } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { syncSPDItems, syncOtherSPDsData } from '../LPJ/useLPJ';
import SuratPreviewModal from './SuratPreviewModal';
import SuratPreviewCanvas from './SuratPreviewCanvas';

export default function SuratForm() {
  const { suratId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  const queryParams = new URLSearchParams(location.search);
  const packId = queryParams.get('packId');
  const itemId = queryParams.get('itemId');
  
  const [surat, setSurat] = useState(null);
  const [formData, setFormData] = useState({});
  const [pegawaiDB, setPegawaiDB] = useState([]);
  const [makDB, setMakDB] = useState([]);
  const [nomorSuratDB, setNomorSuratDB] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [savedInstance, setSavedInstance] = useState(null);
  const [missingFieldInfo, setMissingFieldInfo] = useState(null);

  // Init Surat & Load DB
  useEffect(() => {
    const found = SURAT_REGISTRY.find((s) => s.id === suratId);
    if (!found) {
      alert('Surat tidak ditemukan!');
      navigate('/persuratan');
      return;
    }
    setSurat(found);

    async function loadData() {
      const initial = {};
      found.variables?.forEach((v) => {
        if (v.source !== 'auto') {
          if (v.type === 'pegawai_multi') {
            initial[v.key] = [];
          } else if (v.type === 'dynamic_list') {
            initial[v.key] = ['']; // Array string kosong pertama
          } else if (v.key === 'tempat_terbit') {
            initial[v.key] = 'Singaraja';
          } else if (v.type === 'date') {
            initial[v.key] = new Date().toISOString().split('T')[0];
          } else {
            initial[v.key] = v.default !== undefined ? v.default : '';
          }
        }
      });
      // Load formData from server
      let savedData = null;
      let assignedName = null;

      if (packId && itemId) {
        try {
          const itemRef = doc(db, 'lpj_packs', packId, 'surat_items', itemId);
          const docSnap = await getDoc(itemRef);
          if (docSnap.exists()) {
            savedData = docSnap.data().data || {};
            assignedName = docSnap.data().assigned_name;
          }

          // Bulletproof sync: If this is an SPD, always inherit the latest nomor_sp from SP
          if (found.id === 'surat-perjalanan-dinas') {
            const itemsRef = collection(db, 'lpj_packs', packId, 'surat_items');
            const spQuery = query(itemsRef, where('kode', '==', 'SP'));
            const spSnap = await getDocs(spQuery);
            if (!spSnap.empty) {
              const spData = spSnap.docs[0].data();
              if (spData.data && spData.data.nomor_sp) {
                if (!savedData) savedData = {};
                savedData.nomor_spd = spData.data.nomor_sp;
              }
            }
          }
        } catch (err) {
          console.error("Gagal memuat data sebelumnya:", err);
        }
      }

      // Merge savedData over initial
      let finalData = { ...initial, ...(savedData || {}) };

      // Load Pegawai DB if needed
      const hasPegawaiVar = found.variables?.some((v) => v.type === 'pegawai' || v.type === 'pegawai_multi');
      if (hasPegawaiVar) {
        try {
          const snap = await getDocs(collection(db, 'pegawai'));
          const pDB = snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
          setPegawaiDB(pDB);

          const formatPegawai = (p) => `${p.nama}\nNIP. ${p.nip || '-'}\nPangkat: ${p.pangkat || '-'}\nJabatan: ${p.jabatan || '-'}`;

          // Autofill PPK (Pejabat Pembuat Komitmen) if key exists and is empty
          if ('ppk' in finalData && !finalData.ppk) {
            const ppk = pDB.find(p => p.status_khusus === 'PPK');
            if (ppk) finalData.ppk = formatPegawai(ppk);
          }

          // Autofill assigned employee for this SPD if key exists and is empty
          if ('pegawai' in finalData && !finalData.pegawai && assignedName) {
            const assignedPegawai = pDB.find(p => p.nama === assignedName);
            if (assignedPegawai) finalData.pegawai = formatPegawai(assignedPegawai);
          }
        } catch (err) {
          console.error("Gagal load pegawai", err);
        }
      }

      // Load MAK DB if needed
      const hasMakVar = found.variables?.some((v) => v.type === 'mak');
      if (hasMakVar) {
        try {
          const makSnap = await getDocs(collection(db, 'MAK'));
          const mDB = makSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          setMakDB(mDB);
        } catch (err) {
          console.error("Gagal load MAK", err);
        }
      }

      // Load Nomor Surat DB if needed
      const hasNomorVar = found.variables?.some((v) => v.type === 'nomor_surat');
      if (hasNomorVar) {
        try {
          const nomSnap = await getDocs(collection(db, 'nomor surat kanim'));
          const nDB = nomSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          setNomorSuratDB(nDB);
        } catch (err) {
          console.error("Gagal load Nomor Surat", err);
        }
      }

      setFormData(finalData);
    }

    loadData();
  }, [suratId, navigate, packId, itemId]);

  // Auto-Save Effect (Debounced 1.5 detik)
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    if (!packId || !itemId || !surat) return;
    if (Object.keys(formData).length === 0) return;

    setIsSaving(true);
    const timer = setTimeout(() => {
      const isComplete = !surat.variables
        ?.filter((v) => v.required && v.source !== 'auto')
        .some((v) => !formData[v.key] || (Array.isArray(formData[v.key]) && formData[v.key].length === 0));

      const itemRef = doc(db, 'lpj_packs', packId, 'surat_items', itemId);
      updateDoc(itemRef, {
        data: formData,
        is_data_complete: isComplete,
        updated_at: serverTimestamp()
      }).then(() => {
        setIsSaving(false);
        // Sync SPD dinamik jika ini form SP (surat-perintah)
        if (surat.id === 'surat-perintah' && formData.pegawai_list) {
          syncSPDItems(packId, formData).catch(err => console.error("Gagal sync SPD:", err));
        } else if (surat.id === 'surat-perjalanan-dinas') {
          syncOtherSPDsData(packId, itemId, formData, isComplete).catch(err => console.error("Gagal sync data SPD lain:", err));
        }
      }).catch((err) => {
        console.error("Autosave gagal", err);
        setIsSaving(false);
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [formData, packId, itemId, surat]);

  if (!surat) return <div className="p-8">Loading...</div>;

  const handleSave = async (force = false) => {
    if (!force) {
      const missing = surat.variables
        ?.filter((v) => v.required && v.source !== 'auto')
        .find((v) => !formData[v.key] || (Array.isArray(formData[v.key]) && formData[v.key].length === 0));

      if (missing) {
        setMissingFieldInfo(missing);
        return;
      }
    }

    setMissingFieldInfo(null);
    setIsSubmitting(true);
    try {
      let instanceId;
      const instanceData = {
        surat_id: surat.id,
        surat_kode: surat.kode,
        surat_nama: surat.nama,
        data: formData,
        status: 'draft',
        created_by: currentUser?.uid,
        created_by_nama: currentUser?.displayName || currentUser?.email || 'User',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'surat_instances'), instanceData);
      instanceId = docRef.id;

      if (packId && itemId) {
        const isComplete = !surat.variables
          ?.filter((v) => v.required && v.source !== 'auto')
          .some((v) => !formData[v.key] || (Array.isArray(formData[v.key]) && formData[v.key].length === 0));

        const itemRef = doc(db, 'lpj_packs', packId, 'surat_items', itemId);
        await updateDoc(itemRef, {
          data: formData,
          instance_id: instanceId,
          is_data_complete: isComplete,
          updated_at: serverTimestamp()
        });
        
        if (surat.id === 'surat-perintah' && formData.pegawai_list) {
          await syncSPDItems(packId, formData);
        } else if (surat.id === 'surat-perjalanan-dinas') {
          await syncOtherSPDsData(packId, itemId, formData, isComplete);
        }
      }

      setIsSubmitting(false);

      if (force && packId) {
        navigate(`/lpj/${packId}`);
      } else if (force) {
        navigate('/persuratan');
      } else {
        setSavedInstance({ id: instanceId, ...formData });
      }
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan surat!');
      setIsSubmitting(false);
    }
  };

  const previewSuratObj = {
    ...surat,
    instanceData: formData
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      
      {/* Custom Warning Modal */}
      {missingFieldInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 overflow-hidden transform transition-all">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center shrink-0 shadow-inner">
                <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-800">Isian Belum Lengkap</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Terdapat form yang masih kosong.
                </p>
              </div>
            </div>
            
            <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-sm text-slate-600 leading-relaxed">
                Bagian <strong className="text-indigo-600 font-bold">"{missingFieldInfo.label}"</strong> belum Anda isi.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed mt-2">
                Pilih <strong className="text-slate-800">Lanjutkan Isi Form</strong> untuk melengkapinya, atau <strong className="text-slate-800">Simpan & Kembali</strong> untuk menyimpan apa adanya dan kembali ke halaman LPJ.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setMissingFieldInfo(null)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-colors"
              >
                Lanjutkan Isi Form
              </button>
              <button 
                onClick={() => handleSave(true)}
                disabled={isSubmitting}
                className="px-6 py-2.5 flex items-center gap-2 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? <FaSpinner className="animate-spin" /> : null}
                Simpan & Kembali
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-20 shrink-0 shadow-sm print:hidden">
        <div className="flex items-center gap-4">
          <button onClick={() => packId ? navigate(`/lpj/${packId}`) : navigate('/persuratan')} className="p-2 -ml-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
            <FaChevronLeft />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-800 leading-none">{surat.nama}</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{surat.kode} • Real-time Preview</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {packId && (
            <span className="text-xs font-medium text-slate-400 mr-2 flex items-center gap-1">
              {isSaving ? (
                <><FaSpinner className="animate-spin" /> Menyimpan...</>
              ) : (
                <><FaCheckCircle className="text-emerald-500" /> Tersimpan otomatis</>
              )}
            </span>
          )}

          <button 
            onClick={() => window.print()}
            title="Cetak Dokumen (Ctrl+P)"
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-indigo-600 text-sm font-bold rounded-lg transition-colors shadow-sm"
          >
            <FaPrint /> Print
          </button>

          {!savedInstance && (
            <button 
              onClick={() => handleSave(false)}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
              {packId ? 'Simpan Dokumen' : 'Simpan Draft'}
            </button>
          )}
          {savedInstance && (
            <button 
              onClick={() => packId ? navigate(`/lpj/${packId}`) : navigate('/persuratan')}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-emerald-700"
            >
              <FaCheckCircle /> {packId ? 'Kembali ke LPJ' : 'Kembali ke Daftar Surat'}
            </button>
          )}
        </div>
      </div>

      {/* 2-Pane Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Kiri: Live Preview */}
        <div className="flex-1 bg-slate-300 overflow-auto relative shadow-inner print:absolute print:inset-0 print:bg-white print:overflow-visible print:shadow-none">
          <SuratPreviewCanvas surat={surat} formData={formData} />
        </div>

        {/* Kanan: Form */}
        <div className="w-[450px] bg-white border-l border-slate-200 overflow-y-auto flex flex-col z-10 shrink-0 print:hidden">
          <div className="p-6">
            {savedInstance ? (
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 flex flex-col items-center text-center">
                <FaCheckCircle className="text-emerald-500 text-5xl mb-4" />
                <h2 className="text-lg font-bold text-emerald-800 mb-2">Berhasil Disimpan!</h2>
                <p className="text-emerald-600 text-xs mb-6">
                  Dokumen ini telah disimpan ke sistem.
                </p>
                <button onClick={() => window.print()} className="flex items-center gap-2 bg-white text-emerald-700 border border-emerald-200 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-emerald-100 transition-colors w-full justify-center">
                  <FaPrint /> Print Dokumen
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-sm font-bold text-slate-800 mb-6 border-b border-slate-100 pb-3">
                  Lengkapi Form Isian
                </h2>
                
                <div className="space-y-5">
                  {surat.variables?.map((v) => {
                    if (v.source === 'auto') return null;

                    return (
                      <div key={v.key}>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                          {v.label} {v.required && <span className="text-rose-500">*</span>}
                        </label>
                        
                        {v.type === 'text' && (
                          <input
                            type="text"
                            value={formData[v.key] || ''}
                            onChange={(e) => setFormData({ ...formData, [v.key]: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-colors"
                            placeholder={`Masukkan ${v.label.toLowerCase()}...`}
                          />
                        )}

                        {v.type === 'select' && (
                          <select
                            value={formData[v.key] || ''}
                            onChange={(e) => setFormData({ ...formData, [v.key]: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-colors"
                          >
                            <option value="">-- Pilih {v.label} --</option>
                            {v.options?.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        )}

                        {v.type === 'textarea' && (
                          <textarea
                            rows={3}
                            value={formData[v.key] || ''}
                            onChange={(e) => setFormData({ ...formData, [v.key]: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-colors resize-y"
                            placeholder={`Masukkan ${v.label.toLowerCase()}...`}
                          />
                        )}

                        {v.type === 'dynamic_list' && (
                          <div className="space-y-3">
                            {(Array.isArray(formData[v.key]) ? formData[v.key] : [formData[v.key] || '']).map((item, index) => (
                              <div key={index} className="flex gap-2 items-start">
                                <span className="text-slate-400 font-bold text-sm mt-2">{index + 1}.</span>
                                <textarea
                                  rows={2}
                                  value={item}
                                  onChange={(e) => {
                                    const newArr = Array.isArray(formData[v.key]) ? [...formData[v.key]] : [formData[v.key] || ''];
                                    newArr[index] = e.target.value;
                                    setFormData({ ...formData, [v.key]: newArr });
                                  }}
                                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-colors resize-y"
                                  placeholder={`Poin ${index + 1}...`}
                                />
                                <button
                                  onClick={() => {
                                    const newArr = Array.isArray(formData[v.key]) ? [...formData[v.key]] : [formData[v.key] || ''];
                                    newArr.splice(index, 1);
                                    setFormData({ ...formData, [v.key]: newArr });
                                  }}
                                  className="p-2 mt-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Hapus Poin"
                                >
                                  <FaTimes />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const newArr = Array.isArray(formData[v.key]) ? [...formData[v.key]] : [formData[v.key] || ''];
                                newArr.push('');
                                setFormData({ ...formData, [v.key]: newArr });
                              }}
                              className="w-full px-3 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 border border-dashed border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                            >
                              + Tambah Poin
                            </button>
                          </div>
                        )}

                        {v.type === 'date' && (
                          <input
                            type="date"
                            value={formData[v.key] || ''}
                            onChange={(e) => setFormData({ ...formData, [v.key]: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-colors"
                          />
                        )}

                        {v.type === 'number' && (
                          <input
                            type="number"
                            value={formData[v.key] || ''}
                            onChange={(e) => setFormData({ ...formData, [v.key]: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-colors"
                            placeholder="0"
                          />
                        )}

                        {v.type === 'pegawai' && (
                          <PegawaiSearch
                            pegawaiDB={pegawaiDB}
                            multi={false}
                            value={formData[v.key]}
                            onChange={(val) => setFormData({ ...formData, [v.key]: val })}
                            placeholder={`Cari nama ${v.label.toLowerCase()}...`}
                            disabled={v.readonly}
                          />
                      )}

                      {/* Input PEGAWAI_MULTI (Multiple Search) */}
                      {v.type === 'pegawai_multi' && (
                        <PegawaiSearch
                          pegawaiDB={pegawaiDB}
                          multi={true}
                          value={formData[v.key] || []}
                          onChange={(val) => setFormData({ ...formData, [v.key]: val })}
                          placeholder={`Cari dan tambah ${v.label.toLowerCase()}...`}
                          disabled={v.readonly}
                        />
                      )}

                      {v.type === 'mak' && (
                        <MakSearch
                          makDB={makDB}
                          value={formData[v.key]}
                          onChange={(val) => setFormData({ ...formData, [v.key]: val })}
                          placeholder={`Cari ${v.label.toLowerCase()}...`}
                          disabled={v.readonly}
                        />
                      )}

                      {v.type === 'nomor_surat' && (
                        <NomorSuratSearch
                          nomorSuratDB={nomorSuratDB}
                          value={formData[v.key]}
                          onChange={(val) => setFormData({ ...formData, [v.key]: val })}
                          disabled={v.readonly}
                          formData={formData} // Pass formData to extract extra details for history
                        />
                      )}

                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

      {showPreview && (
        <SuratPreviewModal 
          surat={previewSuratObj} 
          onClose={() => setShowPreview(false)} 
        />
      )}
    </div>
  );
}

// ─── Sub Komponen: Search Pegawai ──────────────────────────────────────────

function PegawaiSearch({ pegawaiDB, multi, value, onChange, placeholder, disabled }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Format baku penyimpanan string pegawai:
  const formatPegawai = (p) => `${p.nama}\nNIP. ${p.nip || '-'}\nPangkat: ${p.pangkat || '-'}\nJabatan: ${p.jabatan || '-'}`;
  
  // Mem-parsing kembali nama untuk ditampilkan di badge
  const extractNama = (str) => str.split('\n')[0];

  const filtered = pegawaiDB.filter(p => 
    p.nama?.toLowerCase().includes(query.toLowerCase()) || 
    p.nip?.includes(query)
  );

  const handleSelect = (p) => {
    if (disabled) return;
    const val = formatPegawai(p);
    if (multi) {
      if (!value.includes(val)) {
        onChange([...value, val]);
      }
    } else {
      onChange(val);
    }
    setQuery('');
    setIsOpen(false);
  };

  const handleRemove = (valToRemove) => {
    if (disabled) return;
    if (multi) {
      onChange(value.filter(v => v !== valToRemove));
    } else {
      onChange('');
    }
  };

  return (
    <div className="relative w-full">
      
      {/* Area Tampilan yang sudah dipilih (Badges) */}
      {multi && value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          {value.map((v, i) => (
            <div key={i} className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
              <span>{extractNama(v)}</span>
              {!disabled && (
                <button onClick={() => handleRemove(v)} className="hover:text-rose-600 transition-colors">
                  <FaTimes size={10} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Jika Single dan sudah ada value, tampilkan state terpilih, bukan input text */}
      {!multi && value ? (
        <div className={`flex items-center justify-between w-full px-4 py-2.5 border rounded-xl text-sm ${disabled ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-indigo-50 border-indigo-200 text-indigo-800'}`}>
          <div className="font-semibold">{extractNama(value)}</div>
          {!disabled && (
            <button onClick={() => handleRemove()} className="text-slate-400 hover:text-rose-600 p-1">
              <FaTimes size={12} />
            </button>
          )}
        </div>
      ) : (
        /* Input Search */
        <div className="relative">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white transition-colors disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed"
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            disabled={disabled}
          />
        </div>
      )}

      {/* Dropdown Hasil Pencarian */}
      {isOpen && query && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map(p => (
              <button
                key={p.uid}
                type="button"
                onMouseDown={() => handleSelect(p)}
                className="w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors last:border-0"
              >
                <div className="font-bold text-slate-800 text-sm">{p.nama}</div>
                <div className="text-xs text-slate-500 mt-0.5">{p.nip || '-'} • {p.jabatan || '-'}</div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-slate-500 text-center">
              Pegawai tidak ditemukan.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Sub Komponen: Search MAK ------------------------------------------

function MakSearch({ makDB, value, onChange, placeholder, disabled }) {
  const hierarchy = ["Tahun", "Program", "Kegiatan", "KRO", "Output", "Komponen", "Sub Komponen", "Akun"];
  const [selections, setSelections] = useState({});

  const handleClear = () => {
    if (disabled) return;
    onChange('');
    setSelections({});
  };

  const handleSelectChange = (levelIndex, nodeId) => {
    const newSelections = { ...selections };
    newSelections[levelIndex] = nodeId;
    // Clear all subsequent levels
    for (let i = levelIndex + 1; i < hierarchy.length; i++) {
      delete newSelections[i];
    }
    setSelections(newSelections);

    // If this is the final level (Akun) and a valid node is selected
    if (levelIndex === hierarchy.length - 1 && nodeId) {
      const akunNode = makDB.find(n => n.id === nodeId);
      if (akunNode) {
        // Build full string
        const parts = [];
        let curr = akunNode;
        while(curr) {
          if (curr.kode) parts.unshift(curr.kode);
          curr = makDB.find(n => n.id === curr.parentId);
        }
        onChange(parts.join(' '));
      }
    }
  };

  if (value) {
    return (
      <div className={`flex items-center justify-between w-full px-4 py-3 border rounded-xl text-sm shadow-sm ${disabled ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-indigo-50 border-indigo-200 text-indigo-800'}`}>
        <div className="font-semibold leading-relaxed">{value}</div>
        {!disabled && (
          <button type="button" onClick={handleClear} className="text-slate-400 hover:text-rose-600 p-1 shrink-0 ml-2 bg-white rounded-full shadow-sm">
            <FaTimes size={12} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
      <div className="text-xs font-semibold text-slate-500 mb-1">
        Silakan pilih secara berurutan sesuai struktur MAK:
      </div>
      {hierarchy.map((type, idx) => {
        // Only show this level if the previous level is selected (or if it's the first level)
        if (idx > 0 && !selections[idx - 1]) return null;

        const parentId = idx === 0 ? null : selections[idx - 1];
        // Filter nodes for this level. For idx > 0, just get children of parentId.
        const options = makDB.filter(n => {
           if (idx === 0) return n.parentId === null && (n.type === type || n.type?.toUpperCase() === type.toUpperCase());
           return n.parentId === parentId;
        });

        if (options.length === 0 && parentId) {
           return <div key={type} className="text-xs text-rose-500 italic">Data {type} tidak tersedia untuk hirarki ini.</div>
        }

        return (
          <div key={type} className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">
              {idx + 1}. {type}
            </label>
            <select
              value={selections[idx] || ''}
              onChange={(e) => handleSelectChange(idx, e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-sm disabled:opacity-50"
            >
              <option value="">-- Pilih {type} --</option>
              {options.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {opt.kode ? `${opt.kode} - ` : ''}{opt.name}
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}

// --- Sub Komponen: Search Nomor Surat ----------------------------------

function NomorSuratSearch({ nomorSuratDB, value, onChange, disabled, formData }) {
  const hierarchy = ["KOP", "Kode surat 1", "Kode surat 2", "Kode surat 3"];
  const [selections, setSelections] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateSuccess, setGenerateSuccess] = useState(false);
  const [customValue, setCustomValue] = useState(value || '');

  // Keep customValue in sync with value if it changes externally
  useEffect(() => {
    setCustomValue(value || '');
  }, [value]);

  const handleClear = () => {
    if (disabled) return;
    onChange('');
    setCustomValue('');
    setSelections({});
  };

  const handleSelectChange = (levelIndex, nodeId) => {
    const newSelections = { ...selections };
    newSelections[levelIndex] = nodeId;
    for (let i = levelIndex + 1; i < hierarchy.length; i++) {
      delete newSelections[i];
    }
    setSelections(newSelections);
  };

  const handleGenerate = async () => {
    if (disabled || isGenerating) return;
    
    // Ensure all levels are selected
    if (Object.keys(selections).length !== hierarchy.length) {
      alert("Harap pilih semua tingkatan kode surat terlebih dahulu.");
      return;
    }

    setIsGenerating(true);
    try {
      // 1. Build prefix
      const parts = [];
      for (let i = 0; i < hierarchy.length; i++) {
        const nodeId = selections[i];
        const node = nomorSuratDB.find(n => n.id === nodeId);
        if (node && node.kode) parts.push(node.kode);
      }
      const prefix = parts.join('.');

      // 2. Transaction to get and increment lastNumber
      const settingsRef = doc(db, 'settings', 'nomor_surat');
      let newNumber = 1;
      
      await runTransaction(db, async (transaction) => {
        const settingsDoc = await transaction.get(settingsRef);
        if (!settingsDoc.exists()) {
          transaction.set(settingsRef, { lastNumber: 1 });
        } else {
          newNumber = (settingsDoc.data().lastNumber || 0) + 1;
          transaction.update(settingsRef, { lastNumber: newNumber });
        }
      });

      // 3. Format final string
      const formattedNumber = `${prefix}-${String(newNumber).padStart(4, '0')}`;

      // 4. Save to history (surat_dokumen)
      let kepadaName = "-";
      if (Array.isArray(formData.pegawai_list) && formData.pegawai_list.length > 0) {
         kepadaName = formData.pegawai_list[0].split('\n')[0];
      } else if (typeof formData.pegawai_list === 'string' && formData.pegawai_list) {
         kepadaName = formData.pegawai_list.split('\n')[0];
      }
      
      await addDoc(collection(db, 'surat_dokumen'), {
        nomor: formattedNumber,
        tanggal: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        templateNama: 'Surat Perintah (LPJ)',
        untuk: [formData.maksud || formData.kegiatan_poin_1 || "Perjalanan Dinas"],
        kepada: [{ nama: kepadaName }]
      });

      // 5. Update form state
      onChange(formattedNumber);
      setCustomValue(formattedNumber);
      // alert(`Nomor surat berhasil di-generate: ${formattedNumber}`);
      setGenerateSuccess(true);
      setTimeout(() => setGenerateSuccess(false), 3000);
    } catch (err) {
      console.error("Error generating nomor surat", err);
      alert("Gagal meng-generate nomor surat.");
    } finally {
      setIsGenerating(false);
    }
  };

  const isAllSelected = Object.keys(selections).length === hierarchy.length;

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
      <div className="flex items-center justify-between">
         <div className="text-xs font-semibold text-slate-500 mb-1">
           Pengaturan Nomor Surat:
         </div>
         {generateSuccess && (
           <span className="text-[10px] font-bold text-emerald-600 animate-pulse">Berhasil di-generate!</span>
         )}
      </div>
      
      {/* Jika sudah ada value, tampilkan input text (bisa diedit manual jika perlu) */}
      <div className="flex gap-2">
         <input 
            type="text" 
            value={customValue}
            onChange={(e) => {
               setCustomValue(e.target.value);
               onChange(e.target.value);
            }}
            placeholder="Atau ketik nomor surat manual..."
            disabled={disabled}
            className="flex-1 px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
         />
      </div>

      {!value && (
         <div className="flex flex-col gap-3 mt-2 border-t pt-3 border-slate-200">
            <div className="text-[11px] text-slate-500 italic mb-1">Buat otomatis (Pilih struktur):</div>
            {hierarchy.map((type, idx) => {
               if (idx > 0 && !selections[idx - 1]) return null;

               const parentId = idx === 0 ? null : selections[idx - 1];
               const options = nomorSuratDB.filter(n => {
                  if (idx === 0) return n.parentId === null && (n.type === type || n.type?.toUpperCase() === type.toUpperCase());
                  return n.parentId === parentId;
               });

               if (options.length === 0 && parentId) {
                  return <div key={type} className="text-xs text-rose-500 italic">Data {type} tidak tersedia.</div>
               }

               return (
                  <div key={type} className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">
                     {idx + 1}. {type}
                  </label>
                  <select
                     value={selections[idx] || ''}
                     onChange={(e) => handleSelectChange(idx, e.target.value)}
                     disabled={disabled || isGenerating}
                     className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-sm disabled:opacity-50"
                  >
                     <option value="">-- Pilih {type} --</option>
                     {options.map(opt => (
                        <option key={opt.id} value={opt.id}>
                        {opt.kode ? `${opt.kode} - ` : ''}{opt.name}
                        </option>
                     ))}
                  </select>
                  </div>
               );
            })}
            
            <button
               type="button"
               onClick={handleGenerate}
               disabled={disabled || !isAllSelected || isGenerating}
               className="mt-2 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
               {isGenerating ? <FaSpinner className="animate-spin" /> : <FaPrint />}
               Generate Nomor Surat
            </button>
         </div>
      )}
    </div>
  );
}
