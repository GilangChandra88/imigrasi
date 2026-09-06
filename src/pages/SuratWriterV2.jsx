import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { CustomTable } from '../components/builder-v2/CustomTable';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { CustomTableCell } from '../components/builder-v2/CustomTableCell';
import { TextStyle } from '@tiptap/extension-text-style';
import { PreviewFieldExtension, FormDataContext } from '../components/builder-v2/PreviewFieldExtension';
import { RepeaterBlockExtension } from '../components/builder-v2/RepeaterBlockExtension';
import { FontSizeExtension } from '../components/builder-v2/FontSizeExtension';
import { TabExtension } from '../components/builder-v2/TabExtension';
import { IndentExtension } from '../components/builder-v2/IndentExtension';
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

const MOCK_PEGAWAI = [
  { id: 1, nama: 'I GEDE ARTHA KESUMAWIJAYA', nip: '198604252009011004', pangkat: 'Penata(III/c)', jabatan: 'Kepala Urusan Umum' },
  { id: 2, nama: 'I KADEK DARWIN YANTO', nip: '197911112001121002', pangkat: 'Penata Tk.I (III/d)', jabatan: 'Kepala Subbagian Tata Usaha' },
  { id: 3, nama: 'GILANG CHANDRA', nip: '199001012015011001', pangkat: 'Penata Muda (III/a)', jabatan: 'Analis Keimigrasian Ahli Pertama' },
  { id: 4, nama: 'BUDI SANTOSO', nip: '198205152010011005', pangkat: 'Penata (III/c)', jabatan: 'Kepala Seksi Intelijen dan Penindakan Keimigrasian' }
];

export default function SuratWriterV2() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  
  const [template, setTemplate] = useState(null);
  const [templatesList, setTemplatesList] = useState([]);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Initialize read-only editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      FontSizeExtension,
      TabExtension,
      IndentExtension,
      CustomTable.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      CustomTableCell,
      PreviewFieldExtension,
      RepeaterBlockExtension
    ],
    content: template ? template.content : '',
    editable: false, 
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-full font-inherit',
        style: 'font-family: inherit; font-size: 12pt; line-height: 1.5;',
      },
    },
  });

  // Fetch Template Logic
  useEffect(() => {
    const fetchTemplate = async () => {
      setIsLoading(true);
      try {
        if (templateId) {
          const docRef = doc(db, 'templates_v2', templateId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            let parsedContent = data.content;
            if (typeof data.content === 'string') {
              try {
                parsedContent = JSON.parse(data.content);
              } catch(e) {
                // Ignore if not json
              }
            }
            const parsedData = { ...data, content: parsedContent };
            setTemplate({ id: docSnap.id, ...parsedData });
            
            // Set editor content
            if (editor && parsedContent) {
              editor.commands.setContent(parsedContent);
            }
            
            // Initialize formData with empty strings
            const initialData = {};
            (parsedData.variables || []).forEach(v => {
              initialData[v.fieldId] = '';
            });
            if (parsedData.hasTandaTangan) {
              initialData._ttd_tempat = 'Singaraja';
              initialData._ttd_tanggal = new Date().toISOString().split('T')[0];
            }
            setFormData(initialData);
          } else {
            alert('Template tidak ditemukan!');
          }
        } else {
          // Fetch list if no ID provided
          const querySnapshot = await getDocs(collection(db, 'templates_v2'));
          const list = [];
          querySnapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() });
          });
          setTemplatesList(list);
        }
      } catch (error) {
        console.error('Error fetching template:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId, editor]);

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  if (isLoading) {
    return <div className="p-10 text-center text-slate-500">Memuat data...</div>;
  }

  // View: Template Selector (if no templateId in URL)
  if (!templateId) {
    return (
      <div className="p-6 max-w-5xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Pilih Template V2</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templatesList.map(tpl => (
            <div key={tpl.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/writer-v2/${tpl.id}`)}>
              <h3 className="font-bold text-lg text-slate-800">{tpl.title}</h3>
              <p className="text-sm text-slate-500 mt-2">{tpl.variables?.length || 0} Variabel Form</p>
            </div>
          ))}
          {templatesList.length === 0 && (
            <div className="col-span-3 p-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">
              Belum ada template. Buat di Builder V2 terlebih dahulu.
            </div>
          )}
        </div>
      </div>
    );
  }

  // View: Split-View Editor
  return (
    <div className="p-6 max-w-7xl mx-auto w-full h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Isi Dokumen: {template?.title}</h1>
          <p className="text-sm text-slate-500">Lengkapi form di sebelah kiri untuk menghasilkan dokumen.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/writer-v2')} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors">
            Ganti Template
          </button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            Proses Dokumen
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        
        {/* Left Panel: Dynamic Form */}
        <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-y-auto">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5">Form Isian</h2>
          
          <div className="space-y-5">
            {template?.hasNomorSurat && (
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg mb-4">
                <label className="block text-sm font-semibold text-indigo-900 mb-1.5">
                  Nomor Surat <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData._nomor_surat || ''}
                  onChange={(e) => handleInputChange('_nomor_surat', e.target.value)}
                  placeholder="Ketik nomor surat..."
                  className="w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                />
              </div>
            )}
            
            {template?.hasInfoKanan && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg mb-4 space-y-3">
                <h3 className="text-sm font-bold text-slate-700 border-b border-slate-200 pb-2">Info Surat (Kanan)</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Lembar Ke</label>
                  <input
                    type="text"
                    value={formData._info_lembar || ''}
                    onChange={(e) => handleInputChange('_info_lembar', e.target.value)}
                    placeholder="Contoh: I"
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kode No.</label>
                  <input
                    type="text"
                    value={formData._info_kode || ''}
                    onChange={(e) => handleInputChange('_info_kode', e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Keterangan Tambahan (Tahun)</label>
                  <input
                    type="text"
                    value={formData._info_tambahan || ''}
                    onChange={(e) => handleInputChange('_info_tambahan', e.target.value)}
                    placeholder="Contoh: 2026"
                    className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
              </div>
            )}

            {template?.variables?.length === 0 && !template?.hasNomorSurat && !template?.hasInfoKanan && !template?.hasTandaTangan ? (
              <p className="text-sm text-slate-500 italic">Template ini tidak memiliki variabel form.</p>
            ) : (
              template?.variables?.map((field) => (
                <div key={field.fieldId}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    {field.fieldName.replace(/_/g, ' ')}
                    {field.isRequired && <span className="text-rose-500 ml-1">*</span>}
                  </label>
                  
                  {field.fieldType === 'textarea' ? (
                    <textarea
                      value={formData[field.fieldId] || ''}
                      onChange={(e) => handleInputChange(field.fieldId, e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50 min-h-[80px]"
                      placeholder={`Ketik ${field.fieldName.replace(/_/g, ' ')}...`}
                      required={field.isRequired}
                    />
                  ) : field.fieldType === 'pegawai' ? (
                    <div className="space-y-2">
                      {field.allowMultiple && Array.isArray(formData[field.fieldId]) && formData[field.fieldId].length > 0 && (
                        <div className="flex flex-col gap-2">
                          {formData[field.fieldId].map((peg, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white border border-slate-200 rounded p-2 text-xs">
                                <div>
                                  <div className="font-bold text-slate-700">{idx+1}. {peg.nama}</div>
                                  <div className="text-slate-500">{peg.nip} • {peg.jabatan}</div>
                                </div>
                                <button type="button" onClick={() => {
                                  const arr = [...formData[field.fieldId]];
                                  arr.splice(idx, 1);
                                  handleInputChange(field.fieldId, arr.length ? arr : '');
                                }} className="text-rose-500 font-bold px-2 py-1 hover:bg-rose-50 rounded">✕</button>
                            </div>
                          ))}
                        </div>
                      )}
                      <select
                        value=""
                        onChange={(e) => {
                            if (!e.target.value) return;
                            const selectedId = parseInt(e.target.value);
                            const peg = MOCK_PEGAWAI.find(p => p.id === selectedId);
                            if (!peg) return;
                            if (field.allowMultiple) {
                              const arr = Array.isArray(formData[field.fieldId]) ? [...formData[field.fieldId]] : [];
                              handleInputChange(field.fieldId, [...arr, peg]);
                            } else {
                              handleInputChange(field.fieldId, peg);
                            }
                        }}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                      >
                        <option value="">{field.allowMultiple ? '+ Tambah Pegawai...' : `-- Pilih ${field.fieldName.replace(/_/g, ' ')} --`}</option>
                        {MOCK_PEGAWAI.map(p => (
                            <option key={p.id} value={p.id}>{p.nama} ({p.nip})</option>
                        ))}
                      </select>
                      {!field.allowMultiple && formData[field.fieldId] && (
                          <div className="mt-2 p-2 bg-indigo-50 border border-indigo-100 rounded text-xs text-indigo-800">
                            <strong>Terpilih:</strong> {formData[field.fieldId].nama} <br/>
                            <span className="text-[10px] opacity-75">{formData[field.fieldId].jabatan}</span>
                          </div>
                      )}
                    </div>
                  ) : field.fieldType === 'list' ? (
                    <div className="space-y-2">
                      {Array.isArray(formData[field.fieldId]) && formData[field.fieldId].length > 0 && (
                        <div className="flex flex-col gap-2">
                          {formData[field.fieldId].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <input 
                                  type="text"
                                  value={item}
                                  onChange={(e) => {
                                    const arr = [...formData[field.fieldId]];
                                    arr[idx] = e.target.value;
                                    handleInputChange(field.fieldId, arr);
                                  }}
                                  className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                                  placeholder={`Poin ${idx + 1}`}
                                />
                                <button type="button" onClick={() => {
                                  const arr = [...formData[field.fieldId]];
                                  arr.splice(idx, 1);
                                  handleInputChange(field.fieldId, arr.length ? arr : '');
                                }} className="text-rose-500 font-bold px-2 py-1 hover:bg-rose-50 rounded">× </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <button 
                        type="button" 
                        onClick={() => {
                          const arr = Array.isArray(formData[field.fieldId]) ? [...formData[field.fieldId]] : [];
                          handleInputChange(field.fieldId, [...arr, '']);
                        }}
                        className="w-full border border-dashed border-indigo-300 text-indigo-600 rounded-lg px-3 py-2 text-sm font-medium hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1"
                      >
                        + Tambah Poin
                      </button>
                    </div>
                  ) : field.fieldType === 'dropdown' ? (
                    <select
                      value={formData[field.fieldId] || ''}
                      onChange={(e) => handleInputChange(field.fieldId, e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                      required={field.isRequired}
                    >
                      <option value="" disabled>-- Pilih {field.fieldName.replace(/_/g, ' ')} --</option>
                      {field.fieldOptions?.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.fieldType === 'date' ? (
                    <input
                      type="date"
                      value={formData[field.fieldId] || ''}
                      onChange={(e) => handleInputChange(field.fieldId, e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                      required={field.isRequired}
                    />
                  ) : field.fieldType === 'number' ? (
                    <input
                      type="number"
                      value={formData[field.fieldId] || ''}
                      onChange={(e) => handleInputChange(field.fieldId, e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                      placeholder="0"
                      required={field.isRequired}
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData[field.fieldId] || ''}
                      onChange={(e) => handleInputChange(field.fieldId, e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                      placeholder={`Ketik ${field.fieldName.replace(/_/g, ' ')}...`}
                      required={field.isRequired}
                    />
                  )}
                </div>
              ))
            )}

            {template?.hasTandaTangan && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg mt-8 space-y-3">
                <h3 className="text-sm font-bold text-slate-700 border-b border-slate-200 pb-2">Informasi Penandatangan</h3>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tempat</label>
                    <input
                      type="text"
                      value={formData._ttd_tempat || ''}
                      onChange={(e) => handleInputChange('_ttd_tempat', e.target.value)}
                      placeholder="Contoh: Singaraja"
                      className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500 bg-white"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal</label>
                    <input
                      type="date"
                      value={formData._ttd_tanggal || ''}
                      onChange={(e) => handleInputChange('_ttd_tanggal', e.target.value)}
                      className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500 bg-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Penandatangan</label>
                  <select
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 bg-white"
                    value={MOCK_PEGAWAI.find(p => p.nama === formData._ttd_nama)?.id || ''}
                    onChange={(e) => {
                      if (!e.target.value) {
                         handleInputChange('_ttd_nama', '');
                         handleInputChange('_ttd_jabatan', '');
                         return;
                      }
                      const selectedId = parseInt(e.target.value);
                      const peg = MOCK_PEGAWAI.find(p => p.id === selectedId);
                      if (peg) {
                        handleInputChange('_ttd_nama', peg.nama);
                        handleInputChange('_ttd_jabatan', peg.jabatan);
                      }
                    }}
                  >
                    <option value="">-- Pilih Pegawai --</option>
                    {MOCK_PEGAWAI.map(p => (
                      <option key={p.id} value={p.id}>{p.nama} ({p.nip})</option>
                    ))}
                  </select>
                </div>
                
                {(formData._ttd_nama || formData._ttd_jabatan) && (
                  <div className="p-2 bg-white border border-slate-200 rounded text-xs text-slate-600 space-y-1 mt-2">
                    <div><span className="font-semibold">Nama:</span> {formData._ttd_nama}</div>
                    <div><span className="font-semibold">Jabatan:</span> {formData._ttd_jabatan}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Live Document Preview */}
        <div className="w-full lg:w-2/3 bg-slate-200 rounded-xl p-4 sm:p-8 overflow-y-auto flex justify-center">
          <div 
            className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-md flex flex-col text-slate-900"
            style={{
              fontFamily: "'Times New Roman', Times, serif",
              padding: "1.5cm 1.5cm 1.5cm 2cm"
            }}
          >
            {template?.hasKopSurat && (
              <div className="border-b-[4px] border-black pb-2 mb-8 flex items-center text-center select-none shrink-0" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
                <div className="w-[90px] h-[90px] shrink-0 bg-slate-50 rounded-full border-2 border-slate-300 flex items-center justify-center text-slate-400 text-sm font-sans">
                  Logo
                </div>
                <div className="flex-1 pr-[90px]">
                  <p className="leading-tight uppercase text-[13px]">KEMENTERIAN IMIGRASI DAN PEMASYARAKATAN REPUBLIK INDONESIA</p>
                  <p className="leading-tight uppercase text-[13px]">DIREKTORAT JENDERAL IMIGRASI</p>
                  <p className="leading-tight uppercase text-[13px]">KANTOR WILAYAH DIREKTORAT JENDERAL IMIGRASI BALI</p>
                  <p className="font-bold leading-tight uppercase mt-0.5 text-[16px]">KANTOR IMIGRASI KELAS II TPI SINGARAJA</p>
                  <p className="mt-0.5 text-[11px]">Jl. Raya Singaraja Seririt, Pemaron, Buleleng, Bali. Telepon (0362) 32174</p>
                  <p className="text-[11px]">Laman: www.singaraja.imigrasi.go.id Pos-el: kanim_singaraja@imigrasi.go.id</p>
                </div>
              </div>
            )}
            
            {template?.hasInfoKanan && (
              <div className="flex justify-end mb-6 text-[13px] font-sans leading-snug">
                <div className="w-[280px]">
                  <p>Lembar ke I: {formData._info_lembar || ''}</p>
                  <p>Kode No. : {formData._info_kode || ''}</p>
                  <p>Nomor : {formData._nomor_surat || ''}</p>
                  <p>{formData._info_tambahan || ''}</p>
                </div>
              </div>
            )}
            
            {template?.hasJudulSurat && (
              <div className="text-center mb-6">
                <h2 className="font-bold text-[16px] uppercase tracking-wider">
                  {template?.judulSuratText || "JUDUL SURAT"}
                </h2>
                {template?.hasNomorSurat && (
                  <div className="flex justify-center items-center mt-1 gap-2 text-[14px]">
                    <span className="font-bold">NOMOR :</span>
                    <div className="border-b border-black min-w-[150px] text-center font-bold px-2 py-0.5">
                      {formData._nomor_surat || "..."}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {!template?.hasJudulSurat && template?.hasNomorSurat && (
              <div className="text-center mb-6">
                <div className="flex justify-center items-center gap-2 text-[14px]">
                  <span className="font-bold">NOMOR :</span>
                  <div className="border-b border-black min-w-[150px] text-center font-bold px-2 py-0.5">
                    {formData._nomor_surat || "..."}
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1">
              <FormDataContext.Provider value={formData}>
                <EditorContent editor={editor} />
              </FormDataContext.Provider>
            </div>

            {/* Blok Tanda Tangan Rendering */}
            {template?.hasTandaTangan && (
              <div className="break-inside-avoid mt-8">
                <div className="mt-16 flex justify-between gap-4">
                  <div className="flex items-end pb-8">
                    <div className="w-24 h-24 bg-slate-50 border-2 border-slate-300 flex items-center justify-center text-[10px] text-slate-400 font-sans text-center p-2 rounded-lg print:border-black print:text-black">QR Code TTE</div>
                  </div>
                  <div className="text-[15px] flex flex-col items-start min-w-[320px]">
                    <div className="mb-1 w-full">
                      {formData._ttd_tempat || "..."}
                      {formData._ttd_tanggal ? `, ${new Date(formData._ttd_tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}` : ', ...'}
                    </div>
                    <div className="mb-2 font-bold uppercase">{formData._ttd_jabatan || "..."}</div>
                    <div className="my-2 h-[60px] w-full"></div>
                    <div className="mt-4 w-full font-bold">
                      {formData._ttd_nama || "..."}
                    </div>
                  </div>
                </div>
                <div className="mt-16 text-center text-[11px] leading-tight pt-4 border-t border-black">
                  Dokumen ini telah ditandatangani secara elektronik menggunakan sertifikat elektronik<br />yang diterbitkan oleh Balai Besar Sertifikasi Elektronik (BSrE), Badan Siber dan Sandi Negara (BSSN).
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
