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
import { FormFieldExtension } from '../components/builder-v2/FormFieldExtension';
import { FontSizeExtension } from '../components/builder-v2/FontSizeExtension';
import { TabExtension } from '../components/builder-v2/TabExtension';
import { IndentExtension } from '../components/builder-v2/IndentExtension';
import { TableFocusPlugin } from '../components/builder-v2/TableFocusPlugin';
import { RepeaterBlockExtension } from '../components/builder-v2/RepeaterBlockExtension';
import { PageBreakExtension } from '../components/builder-v2/PageBreakExtension';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { 
  FaBold, FaItalic, FaUnderline, FaAlignLeft, FaAlignCenter, 
  FaAlignRight, FaAlignJustify, FaSave, FaPlus, FaCog, FaTable,
  FaIndent, FaOutdent, FaBorderNone, FaChevronLeft, FaChevronRight, FaCut
} from 'react-icons/fa';

const TablePropsForm = ({ editor, insertVariable }) => {
  const tableAttrs = editor.getAttributes('table');
  const currentBorderWidth = tableAttrs.borderWidth || '1px';
  const currentBorderColor = tableAttrs.borderColor || '#000000';
  const currentBgColor = editor.getAttributes('tableCell').backgroundColor || '#ffffff';
  
  const currentIsRepeater = tableAttrs.isRepeater || false;
  const currentFieldName = tableAttrs.fieldName || 'Tabel Dinamis';

  const [borderWidth, setBorderWidth] = useState(currentBorderWidth);
  const [borderColor, setBorderColor] = useState(currentBorderColor);
  const [bgColor, setBgColor] = useState(currentBgColor);
  const [isRepeater, setIsRepeater] = useState(currentIsRepeater);
  const [fieldName, setFieldName] = useState(currentFieldName);

  useEffect(() => {
    setBorderWidth(currentBorderWidth);
    setBorderColor(currentBorderColor);
    setBgColor(currentBgColor);
    setIsRepeater(currentIsRepeater);
    setFieldName(currentFieldName);
  }, [currentBorderWidth, currentBorderColor, currentBgColor, currentIsRepeater, currentFieldName]);

  const applyChanges = () => {
     editor.commands.setTableAttributes({ 
       borderWidth, 
       borderColor, 
       isRepeater, 
       fieldName,
       fieldId: isRepeater && !tableAttrs.fieldId ? `table_${Date.now()}` : tableAttrs.fieldId
     });
     
     try {
       editor.commands.setCellAttribute('backgroundColor', bgColor === '#ffffff' ? null : bgColor);
     } catch (e) {
       // Abaikan error jika setCellAttribute gagal (misal saat NodeSelection)
     }
     
     editor.commands.focus();
  };

  return (
    <div className="space-y-4">
       <div>
         <label className="block text-xs font-bold text-slate-500 mb-1.5">Ketebalan Garis</label>
         <select 
           className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 bg-white"
           value={borderWidth}
           onChange={(e) => setBorderWidth(e.target.value)}
         >
           <option value="0px">0px (Transparan)</option>
           <option value="1px">1px (Tipis)</option>
           <option value="2px">2px (Tebal)</option>
           <option value="3px">3px (Sangat Tebal)</option>
         </select>
       </div>
       
       <div>
         <label className="block text-xs font-bold text-slate-500 mb-1.5">Warna Garis Tabel</label>
         <input 
           type="color"
           className="w-full h-9 rounded cursor-pointer border border-slate-200 p-0.5"
           value={borderColor}
           onChange={(e) => setBorderColor(e.target.value)}
         />
       </div>

       <div>
         <label className="block text-xs font-bold text-slate-500 mb-1.5">Warna Latar Sel (Cell)</label>
         <input 
           type="color"
           className="w-full h-9 rounded cursor-pointer border border-slate-200 p-0.5"
           value={bgColor}
           onChange={(e) => setBgColor(e.target.value)}
         />
         <p className="text-[10px] text-slate-400 mt-1">Pilih warna putih untuk menghapus warna latar.</p>
       </div>
       
       <div className="pt-3 border-t border-slate-200 mt-2">
         <label className="flex items-start gap-2 cursor-pointer bg-cyan-50 p-3 rounded-lg border border-cyan-100">
           <input 
             type="checkbox" 
             className="mt-0.5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
             checked={isRepeater}
             onChange={(e) => setIsRepeater(e.target.checked)}
           />
           <div>
             <div className="text-xs font-bold text-cyan-800">Jadikan Tabel Dinamis (Looping)</div>
             <div className="text-[10px] text-cyan-600 mt-0.5">Semua form isian di tabel ini akan dikelompokkan dan bisa ditambahkan barisnya berulang kali oleh user.</div>
           </div>
         </label>
       </div>

       {isRepeater && (
         <div className="animate-fadeIn">
           <label className="block text-xs font-bold text-slate-500 mb-1.5">Nama Tabel Form</label>
           <input 
             type="text"
             className="w-full text-xs border border-slate-300 rounded px-2 py-2"
             value={fieldName}
             onChange={(e) => setFieldName(e.target.value)}
             placeholder="Contoh: Rincian Biaya"
           />

           <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
             <label className="block text-xs font-bold text-amber-800 mb-2 uppercase tracking-wider">Sisipkan Kolom Variabel</label>
             <p className="text-[10px] text-amber-700 mb-3 leading-tight">Klik sel/kotak kosong di dalam tabel (di sebelah kiri), lalu klik tombol di bawah untuk menyisipkan variabel form.</p>
             <div className="grid grid-cols-2 gap-2">
               <button onClick={() => insertVariable && insertVariable('text')} className="bg-white border border-slate-200 rounded p-1.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:border-sky-300">Teks Singkat</button>
               <button onClick={() => insertVariable && insertVariable('number')} className="bg-white border border-slate-200 rounded p-1.5 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:border-amber-300">Angka</button>
               <button onClick={() => insertVariable && insertVariable('date')} className="bg-white border border-slate-200 rounded p-1.5 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:border-emerald-300">Tanggal</button>
               <button onClick={() => insertVariable && insertVariable('dropdown')} className="bg-white border border-slate-200 rounded p-1.5 text-xs font-semibold text-slate-700 hover:bg-fuchsia-50 hover:border-fuchsia-300">Dropdown</button>
               <button onClick={() => insertVariable && insertVariable('table_index')} className="col-span-2 bg-white border border-slate-200 rounded p-1.5 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:border-indigo-300">No. Urut (Otomatis)</button>
             </div>
           </div>
         </div>
       )}
       
       <button 
         onClick={applyChanges}
         className="w-full bg-indigo-600 text-white font-bold text-sm py-2 rounded hover:bg-indigo-700 transition-colors shadow-sm mt-2"
       >
         Terapkan Perubahan
       </button>
       
       <div className="pt-4 border-t border-slate-100">
         <label className="block text-xs font-bold text-slate-500 mb-1.5">Aksi Lanjutan Tabel</label>
         <div className="flex gap-2 mb-2">
           <button 
             onClick={() => editor.chain().focus().mergeCells().run()}
             disabled={!editor.can().mergeCells()}
             className="flex-1 bg-white border border-slate-300 rounded py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
           >
             Merge Cells
           </button>
           <button 
             onClick={() => editor.chain().focus().splitCell().run()}
             disabled={!editor.can().splitCell()}
             className="flex-1 bg-white border border-slate-300 rounded py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
           >
             Split Cell
           </button>
         </div>
         <button 
           onClick={() => {
             const { selection } = editor.state;
             let tablePos = -1;
             if (selection.$from) {
               for (let depth = selection.$from.depth; depth > 0; depth--) {
                 if (selection.$from.node(depth).type.name === 'table') {
                   tablePos = selection.$from.before(depth);
                   break;
                 }
               }
             }
             if (tablePos !== -1) {
               editor.chain().focus().setNodeSelection(tablePos).setMeta('pointer', true).run();
             }
           }}
           className="w-full flex items-center justify-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded py-2 text-xs font-semibold hover:bg-indigo-100 shadow-sm"
         >
           ✢ Pilih Seluruh Tabel (Untuk Digeser)
         </button>
         <p className="text-[10px] text-slate-400 mt-1 text-center">Klik tombol di atas, lalu seret (drag & drop) kotak birunya ke posisi baru.</p>
       </div>
    </div>
  );
};

export default function TemplateBuilderV2() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('Template Baru V2');
  const [hasKopSurat, setHasKopSurat] = useState(false);
  const [hasJudulSurat, setHasJudulSurat] = useState(false);
  const [judulSuratText, setJudulSuratText] = useState('');
  const [hasNomorSurat, setHasNomorSurat] = useState(false);
  const [hasInfoKanan, setHasInfoKanan] = useState(false);
  const [hasTandaTangan, setHasTandaTangan] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [showVariableGrid, setShowVariableGrid] = useState(false);
  const [clearRightPanel, setClearRightPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('form');
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!templateId);
  const [, forceUpdate] = useState(0);

  const editor = useEditor({
    onTransaction: () => {
      // PAKSA REACT UNTUK RE-RENDER AGAR DETEKSI TABEL SELALU AKURAT
      forceUpdate(c => c + 1);
    },
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
      TableFocusPlugin,
      CustomTable.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      CustomTableCell,
      FormFieldExtension.configure({
        onFieldClick: (attrs, updateAttributes) => {
          setEditingField({ attrs, updateAttributes });
        }
      }),
      RepeaterBlockExtension,
      PageBreakExtension
    ],
    content: '<p>Mulai mengetik template Anda di sini...</p>',
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-full font-inherit',
        style: 'font-family: inherit; font-size: 12pt; line-height: 1.5;',
      },
    },
    onSelectionUpdate: ({ editor, transaction }) => {
      setClearRightPanel(false);
      // Sangat krusial: Hanya tutup panel form variabel JIKA DAN HANYA JIKA 
      // perubahan seleksi benar-benar murni dari interaksi kursor/mouse user (pointer)
      // atau pergerakan keyboard (keyboard). 
      // Ini mencegah panel tertutup sendiri saat updateAttributes memicu transaksi internal.
      if (transaction && !transaction.getMeta('pointer') && !transaction.getMeta('keyboard')) {
        return;
      }

      // Cek apakah kursor masih berada di dalam atau menunjuk ke variabel form
      const { selection } = editor.state;
      let isInsideVariable = false;
      
      if (selection.node && selection.node.type.name === 'formField') {
        isInsideVariable = true;
      } else if (selection.$from) {
        for (let i = selection.$from.depth; i > 0; i--) {
          if (selection.$from.node(i).type.name === 'formField') {
            isInsideVariable = true;
            break;
          }
        }
      }
      
      // Auto-close variable form if user clicks outside
      if (!isInsideVariable) {
        setEditingField(null);
      }
    }
  });

  const isTableActive = (editor && !clearRightPanel) ? (() => {
      if (editor.isActive('table')) return true;
      const { selection } = editor.state;
      if (selection.node && selection.node.type.name === 'table') return true;
      if (selection.$from) {
        for (let i = selection.$from.depth; i > 0; i--) {
          if (selection.$from.node(i).type.name === 'table') return true;
        }
      }
      return false;
    })() : false;

  const isRepeaterActive = (editor && !clearRightPanel) ? (() => {
      let active = false;
      if (editor.isActive('repeaterBlock')) active = true;
      const { selection } = editor.state;
      if (selection.node && selection.node.type.name === 'repeaterBlock') active = true;
      if (selection.$from) {
        for (let i = selection.$from.depth; i > 0; i--) {
          if (selection.$from.node(i).type.name === 'repeaterBlock') active = true;
        }
      }
      console.log('REPEATER ACTIVE?', active, selection.$from?.depth);
      return active;
    })() : false;

  useEffect(() => {
    if (editingField || isRepeaterActive) {
      setActiveTab('variable');
    } else if (isTableActive) {
      setActiveTab('table');
    } else {
      setActiveTab('form');
    }
  }, [editingField, isRepeaterActive, isTableActive]);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (templateId) {
        try {
          const docSnap = await getDoc(doc(db, 'templates_v2', templateId));
          if (docSnap.exists()) {
            const data = docSnap.data();
            setTitle(data.title || 'Template V2');
            setHasKopSurat(data.hasKopSurat || false);
            setHasJudulSurat(data.hasJudulSurat || false);
            setJudulSuratText(data.judulSuratText || '');
            setHasNomorSurat(data.hasNomorSurat || false);
            setHasInfoKanan(data.hasInfoKanan || false);
            setHasTandaTangan(data.hasTandaTangan || false);
            if (editor && data.content) {
              try {
                const parsedContent = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
                editor.commands.setContent(parsedContent);
              } catch(e) {
                editor.commands.setContent(data.content);
              }
            }
          }
        } catch (error) {
          console.error("Gagal memuat template", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchTemplate();
  }, [templateId, editor]);

  const insertVariable = (type = 'text') => {
    if (editor) {
      setShowVariableGrid(false);
      const newId = `field_${Date.now()}`;
      const defaultName = type === 'pegawai' ? 'Data_Pegawai' : `Variabel_${type}`;
      
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'formField',
          attrs: {
            fieldId: newId,
            fieldName: defaultName,
            fieldType: type
          }
        })
        .insertContent(' ')
        .run();
        
      setTimeout(() => {
        setEditingField({
          attrs: { fieldId: newId, fieldName: defaultName, fieldType: type, isRequired: false, listType: '1' },
          updateAttributes: (newAttrs) => {
             // This doesn't actually need to do anything since editingField state handles the update logic on save/change
          }
        });
      }, 100);
    }
  };

  const getFormPreviewVars = () => {
    if (!editor) return [];
    const json = editor.getJSON();
    const vars = [];
    const traverse = (node) => {
      if (node.type === 'table' && node.attrs && node.attrs.isRepeater) {
        const tableCols = [];
        const traverseChild = (childNode) => {
          if (childNode.type === 'formField' && childNode.attrs) {
            tableCols.push(childNode.attrs);
          }
          if (childNode.content) childNode.content.forEach(traverseChild);
        };
        if (node.content) node.content.forEach(traverseChild);
        
        if (!vars.find(v => v.fieldId === node.attrs.fieldId)) {
          vars.push({
            fieldType: 'table_loop',
            fieldId: node.attrs.fieldId || `table_${Date.now()}`,
            fieldName: node.attrs.fieldName || 'Tabel Dinamis',
            tableColumns: tableCols.map(col => ({
              id: col.fieldId,
              label: col.fieldName,
              width: 'auto'
            }))
          });
        }
        return;
      }

      if (node.type === 'repeaterBlock' && node.attrs) {
        if (!vars.find(v => v.fieldId === node.attrs.fieldId)) {
          vars.push({
            ...node.attrs,
            fieldType: 'pegawai',
            allowMultiple: node.attrs.allowMultiple !== false,
            fieldName: node.attrs.fieldName || 'Data Pegawai'
          });
        }
      }
      if (node.type === 'formField' && node.attrs) {
        if (!node.attrs.fieldType.startsWith('pegawai_')) {
          if (!vars.find(v => v.fieldId === node.attrs.fieldId)) {
            vars.push(node.attrs);
          }
        }
      }
      if (node.content) node.content.forEach(traverse);
    };
    if (json.content) json.content.forEach(traverse);
    return vars;
  };

  const insertRepeater = () => {
    if (editor) {
      setShowVariableGrid(false);
      const newId = `repeater_${Date.now()}`;
      editor.chain().focus()
        .insertContent({
          type: 'repeaterBlock',
          attrs: {
            fieldId: newId,
            fieldName: 'Daftar Pegawai',
            repeaterType: 'pegawai'
          },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Ketik format untuk SATU pegawai di sini...' }]
            }
          ]
        })
        .run();
    }
  };

  const handleUpdateField = (key, value) => {
    if (!editingField) return;
    
    const updatedAttrs = { ...editingField.attrs, [key]: value };
    setEditingField({ ...editingField, attrs: updatedAttrs });
    
    if (editingField.updateAttributes) {
      try {
        editingField.updateAttributes(updatedAttrs);
      } catch(e) {}
    }
  };

  const saveTemplate = async () => {
    if (!editor || !title.trim()) {
      alert('Judul template tidak boleh kosong');
      return;
    }
    
    setIsSaving(true);
    const json = editor.getJSON();
    const extractedVariables = [];
    
    const traverse = (node) => {
      if (node.type === 'table' && node.attrs && node.attrs.isRepeater) {
        const tableCols = [];
        const traverseChild = (childNode) => {
          if (childNode.type === 'formField' && childNode.attrs) {
            tableCols.push(childNode.attrs);
          }
          if (childNode.content) childNode.content.forEach(traverseChild);
        };
        if (node.content) node.content.forEach(traverseChild);
        
        if (!extractedVariables.find(v => v.fieldId === node.attrs.fieldId)) {
          extractedVariables.push({
            fieldType: 'table_loop',
            fieldId: node.attrs.fieldId || `table_${Date.now()}`,
            fieldName: node.attrs.fieldName || 'Tabel Dinamis',
            tableColumns: tableCols.map(col => ({
              id: col.fieldId,
              label: col.fieldName,
              width: 'auto'
            }))
          });
        }
        return; // DO NOT TRAVERSE INSIDE normal flow
      }

      if (node.type === 'repeaterBlock' && node.attrs) {
        if (!extractedVariables.find(v => v.fieldId === node.attrs.fieldId)) {
          extractedVariables.push({
            ...node.attrs,
            fieldType: 'pegawai', 
            allowMultiple: true, 
            fieldName: node.attrs.fieldName || 'Data Pegawai'
          });
        }
      }
      if (node.type === 'formField' && node.attrs) {
        if (!node.attrs.fieldType.startsWith('pegawai_')) {
          if (!extractedVariables.find(v => v.fieldId === node.attrs.fieldId)) {
            extractedVariables.push(node.attrs);
          }
        }
      }
      if (node.content) {
        node.content.forEach(traverse);
      }
    };
    
    if (json.content) {
      json.content.forEach(traverse);
    }

    try {
      const dataToSave = {
        title: title,
        content: JSON.stringify(json), 
        variables: extractedVariables, 
        hasKopSurat: hasKopSurat,
        hasJudulSurat: hasJudulSurat,
        judulSuratText: judulSuratText,
        hasNomorSurat: hasNomorSurat,
        hasInfoKanan: hasInfoKanan,
        hasTandaTangan: hasTandaTangan,
        updatedAt: serverTimestamp()
      };

      if (templateId) {
        await updateDoc(doc(db, 'templates_v2', templateId), dataToSave);
        alert('Template V2 berhasil diperbarui!');
      } else {
        dataToSave.createdAt = serverTimestamp();
        await addDoc(collection(db, 'templates_v2'), dataToSave);
        alert('Template V2 berhasil dibuat!');
        navigate(`/templates-v2`);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Gagal menyimpan: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-10 text-center text-slate-500">Memuat editor...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-slate-100">
      
      {/* Top Header & Toolbar (Sticky) */}
      <div className="bg-white border-b border-slate-200 shrink-0 shadow-sm z-10">
        <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button 
               onClick={() => setShowLeftPanel(!showLeftPanel)}
               className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-colors"
               title="Toggle Panel Pengaturan (Kiri)"
            >
               {showLeftPanel ? <FaChevronLeft /> : <FaChevronRight />}
            </button>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none px-1 py-0.5 w-[400px]"
              placeholder="Judul Dokumen Tanpa Judul"
            />
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={saveTemplate}
              disabled={isSaving}
              className="bg-indigo-600 text-white px-4 py-2 rounded font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              <FaSave /> {isSaving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <div className="w-px h-6 bg-slate-300"></div>
            <button 
               onClick={() => setShowRightPanel(!showRightPanel)}
               className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-colors"
               title="Toggle Panel Konfigurasi (Kanan)"
            >
               {showRightPanel ? <FaChevronRight /> : <FaChevronLeft />}
            </button>
          </div>
        </div>

        {/* Toolbar Bawah */}
        <div className="px-4 py-2 flex items-center gap-1 bg-slate-50 flex-wrap">
          
          {/* Font Size Dropdown */}
          <select 
            className="border border-slate-300 rounded px-2 py-1 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 bg-white min-w-[70px]"
            onChange={(e) => {
              if (editor) {
                if (e.target.value === 'default') {
                  editor.chain().focus().unsetFontSize().run();
                } else {
                  editor.chain().focus().setFontSize(`${e.target.value}pt`).run();
                }
              }
            }}
            value={
              editor?.getAttributes('textStyle').fontSize?.replace('pt', '') || 'default'
            }
          >
            <option value="default">Default</option>
            {[8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          
          <div className="w-px h-5 bg-slate-300 mx-1"></div>

          <ToolbarButton editor={editor} icon={<FaBold />} action={() => editor.chain().focus().toggleBold().run()} isActive={editor?.isActive('bold')} />
          <ToolbarButton editor={editor} icon={<FaItalic />} action={() => editor.chain().focus().toggleItalic().run()} isActive={editor?.isActive('italic')} />
          <ToolbarButton editor={editor} icon={<FaUnderline />} action={() => editor.chain().focus().toggleUnderline().run()} isActive={editor?.isActive('underline')} />
          
          <div className="w-px h-5 bg-slate-300 mx-1"></div>
          
          <ToolbarButton editor={editor} icon={<FaAlignLeft />} action={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor?.isActive({ textAlign: 'left' })} />
          <ToolbarButton editor={editor} icon={<FaAlignCenter />} action={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor?.isActive({ textAlign: 'center' })} />
          <ToolbarButton editor={editor} icon={<FaAlignRight />} action={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor?.isActive({ textAlign: 'right' })} />
          <ToolbarButton editor={editor} icon={<FaAlignJustify />} action={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor?.isActive({ textAlign: 'justify' })} />

          <div className="w-px h-5 bg-slate-300 mx-1"></div>

          <ToolbarButton editor={editor} icon={<FaOutdent />} action={() => editor.chain().focus().outdent().run()} />
          <ToolbarButton editor={editor} icon={<FaIndent />} action={() => editor.chain().focus().indent().run()} />

          <div className="w-px h-5 bg-slate-300 mx-1"></div>

          <ToolbarButton 
            editor={editor} 
            icon={<FaTable />} 
            action={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: false }).run()} 
            isActive={isTableActive} 
          />

          <div className="w-px h-5 bg-slate-300 mx-1"></div>

          <button
            onClick={() => editor.chain().focus().setPageBreak().run()}
            className="flex items-center gap-1.5 px-2 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap"
            title="Tambah Batas Halaman (Page Break)"
          >
            <FaCut className="text-slate-500" /> Page Break
          </button>
          
          {isTableActive && (
            <div className="flex items-center gap-1 ml-2 bg-slate-200 p-1 rounded">
              <button onClick={() => editor.chain().focus().addColumnAfter().run()} className="px-2 py-1 text-[10px] font-bold bg-white rounded shadow-sm hover:bg-slate-50">+ Kolom</button>
              <button onClick={() => editor.chain().focus().deleteColumn().run()} className="px-2 py-1 text-[10px] font-bold bg-white text-rose-600 rounded shadow-sm hover:bg-slate-50">- Kolom</button>
              <button onClick={() => editor.chain().focus().addRowAfter().run()} className="px-2 py-1 text-[10px] font-bold bg-white rounded shadow-sm hover:bg-slate-50">+ Baris</button>
              <button onClick={() => editor.chain().focus().deleteRow().run()} className="px-2 py-1 text-[10px] font-bold bg-white text-rose-600 rounded shadow-sm hover:bg-slate-50">- Baris</button>
              <button onClick={() => editor.chain().focus().toggleHeaderRow().run()} className="px-2 py-1 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded shadow-sm hover:bg-indigo-100">Header On/Off</button>
              <button onClick={() => editor.chain().focus().deleteTable().run()} className="px-2 py-1 text-[10px] font-bold bg-rose-100 text-rose-700 rounded shadow-sm hover:bg-rose-200">Hapus Tabel</button>
              <div className="w-px h-4 bg-slate-300 mx-1"></div>
              <button onClick={() => {
                  const isBorderless = editor.getAttributes('table').borderless;
                  editor.chain().focus().setTableAttributes({ borderless: !isBorderless }).run();
                }} 
                className="px-2 py-1 text-[10px] font-bold bg-white text-indigo-600 rounded shadow-sm hover:bg-slate-50 flex items-center gap-1"
                title="Tabel transparan sangat cocok untuk mengatur layout Label : Isi"
              >
                <FaBorderNone /> {editor.getAttributes('table').borderless ? 'Garis Normal' : 'Tabel Transparan'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Panel Pengaturan (Kiri) */}
        {showLeftPanel && (
        <div className="w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col shadow-[4px_0_15px_-5px_rgba(0,0,0,0.05)] z-10">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <FaCog className="text-slate-400" />
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Pengaturan</h2>
          </div>
          
          <div className="p-5 flex-1 overflow-y-auto">
            <div className="space-y-6">
              {/* Tampilan Dokumen */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Tampilan Dokumen</h3>
                
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="pt-0.5">
                      <input
                        type="checkbox"
                        checked={hasKopSurat}
                        onChange={(e) => setHasKopSurat(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">Gunakan Kop Surat</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="pt-0.5">
                      <input
                        type="checkbox"
                        checked={hasInfoKanan}
                        onChange={(e) => setHasInfoKanan(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">Info Kanan (SPD)</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="pt-0.5">
                      <input
                        type="checkbox"
                        checked={hasJudulSurat}
                        onChange={(e) => setHasJudulSurat(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">Judul Surat</span>
                      {hasJudulSurat && (
                        <input
                          type="text"
                          value={judulSuratText}
                          onChange={(e) => setJudulSuratText(e.target.value)}
                          placeholder="Ketik judul surat..."
                          className="mt-2 w-full border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 bg-white"
                        />
                      )}
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="pt-0.5">
                      <input
                        type="checkbox"
                        checked={hasNomorSurat}
                        onChange={(e) => setHasNomorSurat(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">Nomor Surat</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group border-t border-slate-200 pt-3">
                    <div className="pt-0.5">
                      <input
                        type="checkbox"
                        checked={hasTandaTangan}
                        onChange={(e) => setHasTandaTangan(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">Gunakan Tanda Tangan</span>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Tambahkan blok tandatangan TTE dengan QR Code di akhir surat.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

            </div>
          </div>
        </div>
        )}

        {/* Kertas A4 (Tengah) */}
        <div 
          className="flex-1 overflow-auto bg-[#F8F9FA] p-4 sm:p-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setEditingField(null);
              setClearRightPanel(true);
              if (editor) {
                editor.commands.setTextSelection(editor.state.selection.from);
                editor.commands.blur();
              }
            }
          }}
        >
          <div 
            className="a4-page-canvas mx-auto shadow-md border border-slate-200 mb-10 flex flex-col text-slate-900 shrink-0"
            style={{
              width: "794px",
              minHeight: "1123px",
              fontFamily: "'Times New Roman', Times, serif",
              padding: "57px 57px 57px 76px"
            }}
          >
            {hasKopSurat && (
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

            {hasInfoKanan && (
              <div className="flex justify-end mb-6 text-[13px] font-sans leading-snug">
                <div className="w-[280px]">
                  <p>Lembar ke I: (Isian)</p>
                  <p>Kode No. : (Isian)</p>
                  <p>Nomor : (Otomatis / Nomor Surat)</p>
                  <p>(Info Tambahan)</p>
                </div>
              </div>
            )}
            
            {hasJudulSurat && (
              <div className="text-center mb-6">
                <h2 className="font-bold text-[16px] uppercase tracking-wider">
                  {judulSuratText || "JUDUL SURAT"}
                </h2>
                {hasNomorSurat && (
                  <div className="flex justify-center items-center mt-1 gap-2 text-[14px]">
                    <span className="font-bold">NOMOR :</span>
                    <div className="border border-dashed border-slate-300 rounded px-4 py-0.5 text-slate-400 text-[12px] min-w-[150px]">
                      (Otomatis dari sistem)
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {!hasJudulSurat && hasNomorSurat && (
              <div className="text-center mb-6">
                <div className="flex justify-center items-center gap-2 text-[14px]">
                  <span className="font-bold">NOMOR :</span>
                  <div className="border border-dashed border-slate-300 rounded px-4 py-0.5 text-slate-400 text-[12px] min-w-[150px]">
                    (Otomatis dari sistem)
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1">
              <EditorContent editor={editor} />
            </div>

            {/* Blok Tanda Tangan Preview */}
            {hasTandaTangan && (
              <div className="break-inside-avoid mt-8">
                <div className="mt-16 flex justify-between gap-4">
                  <div className="flex items-end pb-8">
                    <div className="w-24 h-24 bg-slate-50 border-2 border-slate-300 flex items-center justify-center text-[10px] text-slate-400 font-sans text-center p-2 rounded-lg">QR Code TTE</div>
                  </div>
                  <div className="text-[15px] flex flex-col items-start min-w-[320px]">
                    <div className="mb-1 w-full text-slate-500">
                      (Tempat), (Tanggal)
                    </div>
                    <div className="mb-2 font-bold uppercase text-slate-500">(Jabatan)</div>
                    <div className="my-2 h-[60px] border border-dashed border-slate-300 w-full rounded flex items-center justify-center text-slate-300 text-xs">Ruang TTD</div>
                    <div className="mt-4 w-full font-bold text-slate-500">
                      (Nama Penandatangan)
                    </div>
                  </div>
                </div>
                <div className="mt-16 text-center text-[11px] leading-tight pt-4 border-t border-black text-slate-500">
                  Dokumen ini telah ditandatangani secara elektronik menggunakan sertifikat elektronik<br />yang diterbitkan oleh Balai Besar Sertifikasi Elektronik (BSrE), Badan Siber dan Sandi Negara (BSSN).
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel Konfigurasi Kanan */}
        {showRightPanel && (
        <div className="w-[340px] bg-white border-l border-slate-200 shrink-0 flex flex-col shadow-[-4px_0_15px_-5px_rgba(0,0,0,0.05)] z-10">
          <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
            <button
              onClick={() => {
                setActiveTab('form');
                setEditingField(null);
                setClearRightPanel(true);
                if (editor) {
                  editor.commands.setTextSelection(editor.state.selection.from);
                  editor.commands.blur();
                }
              }}
              className={`flex-1 py-3 px-1 text-[11px] font-bold text-center border-b-2 transition-colors ${activeTab === 'form' ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
            >
              FORM ISIAN
            </button>
            <button
              onClick={() => setActiveTab('variable')}
              className={`flex-1 py-3 px-1 text-[11px] font-bold text-center border-b-2 transition-colors ${activeTab === 'variable' ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
            >
              VARIABEL
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`flex-1 py-3 px-1 text-[11px] font-bold text-center border-b-2 transition-colors ${activeTab === 'table' ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
            >
              TABEL
            </button>
          </div>
          
          <div className="p-5 flex-1 overflow-y-auto">
            {activeTab === 'form' && (
              !showVariableGrid ? (
              <div className="animate-fadeIn space-y-4">
                 <p className="text-xs text-slate-500 mb-4">Pratinjau form isian yang akan diisi oleh user:</p>
                 
                 <div className="space-y-4 pointer-events-none opacity-80">
                   {getFormPreviewVars().length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-4 border border-dashed rounded border-slate-300">Belum ada form isian.</p>
                   ) : (
                      getFormPreviewVars().map((field, idx) => (
                         <div key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              {field.fieldName.replace(/_/g, ' ')}
                              {field.isRequired && <span className="text-rose-500 ml-1">*</span>}
                            </label>
                            <div className="w-full h-8 bg-white border border-slate-300 rounded"></div>
                         </div>
                      ))
                   )}
                 </div>

                 <button 
                   onClick={() => setShowVariableGrid(true)}
                   className="w-full mt-4 flex items-center justify-center gap-2 p-3 bg-indigo-50 border border-dashed border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-semibold text-sm"
                 >
                   <FaPlus /> Tambah Form (Variabel)
                 </button>
                 
                 <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                   <p className="text-xs text-slate-400">Klik variabel atau tabel di kertas untuk mengedit pengaturannya.</p>
                 </div>
              </div>
            ) : (
              <div className="animate-fadeIn">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-slate-600 font-semibold">Pilih Tipe Form:</p>
                  <button onClick={() => setShowVariableGrid(false)} className="text-xs text-rose-500 font-bold hover:bg-rose-50 px-2 py-1 rounded transition-colors">Batal</button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => insertVariable('text')} className="flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                    <div className="w-8 h-8 rounded bg-sky-100 text-sky-600 flex items-center justify-center font-bold">T</div>
                    <span className="text-xs font-semibold text-slate-700">Teks Singkat</span>
                  </button>
                  
                  <button onClick={() => insertVariable('textarea')} className="flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                    <div className="w-8 h-8 rounded bg-violet-100 text-violet-600 flex items-center justify-center font-bold">A </div>
                    <span className="text-xs font-semibold text-slate-700">Teks Panjang</span>
                  </button>
                  
                  <button onClick={() => insertVariable('number')} className="flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                    <div className="w-8 h-8 rounded bg-amber-100 text-amber-600 flex items-center justify-center font-bold">123</div>
                    <span className="text-xs font-semibold text-slate-700">Angka</span>
                  </button>
                  
                  <button onClick={() => insertVariable('date')} className="flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                    <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">📅</div>
                    <span className="text-xs font-semibold text-slate-700">Tanggal</span>
                  </button>

                  <button onClick={() => insertVariable('dropdown')} className="flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                    <div className="w-8 h-8 rounded bg-fuchsia-100 text-fuchsia-600 flex items-center justify-center font-bold">▼</div>
                    <span className="text-xs font-semibold text-slate-700">Dropdown</span>
                  </button>

                  <button onClick={() => insertRepeater && insertRepeater()} className="flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors col-span-2">
                    <div className="w-full h-8 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs gap-2">🔄 Area Pegawai (Dinamis)</div>
                    <span className="text-xs font-semibold text-slate-700 text-center">Buat desain tabel/layout sendiri untuk pegawai (Bisa loop atau tidak).</span>
                  </button>

                  <button onClick={() => insertVariable('table_loop')} className="flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                    <div className="w-8 h-8 rounded bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold">📊</div>
                    <span className="text-xs font-semibold text-slate-700">Tabel Loop</span>
                  </button>

                  <button onClick={() => insertVariable('list')} className="flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                    <div className="w-8 h-8 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">📋</div>
                    <span className="text-xs font-semibold text-slate-700">List (Per Poin)</span>
                  </button>
                </div>
              </div>
            ))}

            {activeTab === 'variable' && (
              editingField ? (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Variabel</label>
                  <input
                    type="text"
                    value={editingField.attrs.fieldName}
                    onChange={(e) => handleUpdateField('fieldName', e.target.value.replace(/\s+/g, '_'))}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                    placeholder="nama_pemohon"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Tanpa spasi. Ini akan terlihat oleh user di form input.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tipe Input</label>
                  <select
                    value={editingField.attrs.fieldType}
                    onChange={(e) => handleUpdateField('fieldType', e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                  >
                    <option value="text">Teks Singkat</option>
                    <option value="textarea">Teks Panjang (Paragraf)</option>
                    <option value="number">Angka</option>
                    <option value="date">Tanggal</option>
                    <option value="dropdown">Dropdown (Pilihan)</option>
                    <option value="table_index">No. Urut (Untuk Tabel Dinamis)</option>
                    <option value="table_loop">Tabel Dinamis (Legacy)</option>
                    <option value="list">List (Per Poin)</option>
                  </select>
                </div>

                {editingField.attrs.fieldType === 'dropdown' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Opsi Pilihan</label>
                    <textarea
                      value={editingField.attrs.fieldOptions ? editingField.attrs.fieldOptions.join('\n') : ''}
                      onChange={(e) => handleUpdateField('fieldOptions', e.target.value.split('\n'))}
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-h-[80px]"
                      placeholder="Ketik opsi di sini (satu baris satu opsi)"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Pisahkan tiap pilihan dengan baris baru (Enter).</p>
                  </div>
                )}

                {editingField.attrs.fieldType === 'list' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Format Poin</label>
                    <select
                      value={editingField.attrs.listType || '1'}
                      onChange={(e) => handleUpdateField('listType', e.target.value)}
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                    >
                      <option value="1">Angka (1., 2., 3.)</option>
                      <option value="a">Huruf Kecil (a., b., c.)</option>
                      <option value="A">Huruf Besar (A., B., C.)</option>
                      <option value="dot">Bullet Point (•)</option>
                    </select>
                  </div>
                )}

                {editingField.attrs.fieldType === 'table_loop' && (
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <label className="block text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Pengaturan Kolom Tabel</label>
                    
                    <div className="space-y-2">
                      {(editingField.attrs.tableColumns || []).map((col, idx) => (
                        <div key={col.id} className="flex gap-2 items-center bg-slate-50 p-2 rounded border border-slate-200">
                          <input 
                            type="text" 
                            value={col.label} 
                            onChange={(e) => {
                              const newCols = [...(editingField.attrs.tableColumns || [])];
                              newCols[idx].label = e.target.value;
                              handleUpdateField('tableColumns', newCols);
                            }}
                            className="flex-1 text-xs border border-slate-300 rounded px-2 py-1"
                            placeholder="Nama Kolom"
                          />
                          <select 
                            value={col.width || 'auto'}
                            onChange={(e) => {
                              const newCols = [...(editingField.attrs.tableColumns || [])];
                              newCols[idx].width = e.target.value;
                              handleUpdateField('tableColumns', newCols);
                            }}
                            className="text-xs border border-slate-300 rounded px-2 py-1 w-[70px]"
                          >
                            <option value="auto">Auto</option>
                            <option value="10%">10%</option>
                            <option value="20%">20%</option>
                            <option value="30%">30%</option>
                            <option value="40%">40%</option>
                            <option value="50%">50%</option>
                          </select>
                          <button onClick={() => {
                             const newCols = [...(editingField.attrs.tableColumns || [])];
                             newCols.splice(idx, 1);
                             handleUpdateField('tableColumns', newCols);
                          }} className="text-rose-500 font-bold px-2 hover:bg-rose-100 rounded text-xs">x</button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <button onClick={() => {
                         const newCols = [...(editingField.attrs.tableColumns || [])];
                         newCols.push({ id: `col_${Date.now()}`, label: `Kolom ${newCols.length + 1}`, width: 'auto' });
                         handleUpdateField('tableColumns', newCols);
                      }} className="flex-1 text-xs bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-1.5 rounded font-semibold">
                         + Kolom Teks
                      </button>
                      <button onClick={() => {
                         const newCols = [...(editingField.attrs.tableColumns || [])];
                         newCols.push({ id: `no`, label: `No`, width: '10%' });
                         handleUpdateField('tableColumns', newCols);
                      }} className="flex-1 text-xs bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-1.5 rounded font-semibold">
                         + Kolom No
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingField.attrs.isRequired}
                      onChange={(e) => handleUpdateField('isRequired', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Wajib Diisi (Required)</span>
                  </label>
                </div>
                
                <div className="pt-4 mt-2 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Format Teks Variabel</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleUpdateField('isBold', !editingField.attrs.isBold)}
                      className={`p-2 rounded border ${editingField.attrs.isBold ? 'bg-indigo-100 border-indigo-300 text-indigo-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'} font-bold flex-1`}
                      title="Tebal (Bold)"
                    >
                      B
                    </button>
                    <button 
                      onClick={() => handleUpdateField('isItalic', !editingField.attrs.isItalic)}
                      className={`p-2 rounded border ${editingField.attrs.isItalic ? 'bg-indigo-100 border-indigo-300 text-indigo-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'} italic font-serif flex-1`}
                      title="Miring (Italic)"
                    >
                      I
                    </button>
                    <button 
                      onClick={() => handleUpdateField('isUnderline', !editingField.attrs.isUnderline)}
                      className={`p-2 rounded border ${editingField.attrs.isUnderline ? 'bg-indigo-100 border-indigo-300 text-indigo-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'} underline flex-1`}
                      title="Garis Bawah (Underline)"
                    >
                      U
                    </button>
                  </div>
                </div>
                
                <div className="mt-8 p-3 bg-indigo-50 rounded border border-indigo-100 text-xs text-indigo-700">
                  Perubahan Anda tersimpan secara <strong>real-time</strong> ke dalam dokumen. Jangan lupa klik tombol "Simpan" di atas setelah selesai.
                </div>
              </div>
              ) : isRepeaterActive ? (
              <div className="animate-fadeIn">
                <h3 className="font-bold text-indigo-700 mb-4 text-sm uppercase tracking-wider">Area Pegawai (Dinamis)</h3>
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded text-xs text-indigo-700 mb-4">
                  Susun formating (Tabel/Teks) di dalam area pengulangan ini lalu klik tombol di bawah untuk menyisipkan variabelnya.
                </div>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  <button onClick={() => insertVariable('pegawai_index')} className="p-2 bg-white border border-slate-200 rounded text-xs hover:bg-slate-50 font-semibold shadow-sm">No. Urut (1,2,3)</button>
                  <button onClick={() => insertVariable('pegawai_nama')} className="p-2 bg-white border border-slate-200 rounded text-xs hover:bg-slate-50 font-semibold shadow-sm">Nama</button>
                  <button onClick={() => insertVariable('pegawai_nip')} className="p-2 bg-white border border-slate-200 rounded text-xs hover:bg-slate-50 font-semibold shadow-sm">NIP</button>
                  <button onClick={() => insertVariable('pegawai_pangkat')} className="p-2 bg-white border border-slate-200 rounded text-xs hover:bg-slate-50 font-semibold shadow-sm">Pangkat/Gol.</button>
                  <button onClick={() => insertVariable('pegawai_jabatan')} className="p-2 bg-white border border-slate-200 rounded text-xs hover:bg-slate-50 font-semibold shadow-sm">Jabatan</button>
                </div>
                
                <div className="pt-4 border-t border-slate-200">
                  <label className="flex items-start gap-2 cursor-pointer bg-slate-50 p-2.5 rounded border border-slate-200 hover:border-indigo-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={editor?.getAttributes('repeaterBlock')?.allowMultiple !== false}
                      onChange={(e) => {
                        if (editor) {
                          editor.commands.updateAttributes('repeaterBlock', { allowMultiple: e.target.checked });
                        }
                      }}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-slate-700 block">Izinkan Pilih Banyak Pegawai</span>
                      <span className="text-[10px] text-slate-500 leading-tight block mt-1">Jika dicentang, sistem akan mengulang (looping) format ini. Jika tidak dicentang, hanya bisa memilih 1 pegawai (cocok untuk formatting bebas tanpa loop).</span>
                    </div>
                  </label>
                </div>
              </div>
              ) : (
                <div className="text-center py-10 opacity-60 animate-fadeIn mt-8">
                   <p className="text-sm font-bold text-slate-500 mb-2">Pilih Variabel/Loop</p>
                   <p className="text-xs text-slate-400 px-4">Klik salah satu variabel atau area pengulangan di kertas untuk melihat propertinya.</p>
                </div>
              )
            )}

            {activeTab === 'table' && (
              isTableActive ? (
              <div className="animate-fadeIn">
                <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wider">Properti Tabel</h3>
                <TablePropsForm editor={editor} insertVariable={insertVariable} />
              </div>
              ) : (
                <div className="text-center py-10 opacity-60 animate-fadeIn mt-8">
                   <p className="text-sm font-bold text-slate-500 mb-2">Pilih Tabel</p>
                   <p className="text-xs text-slate-400 px-4">Klik tabel di kertas untuk melihat propertinya.</p>
                </div>
              )
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

function ToolbarButton({ editor, icon, action, isActive }) {
  return (
    <button
      onClick={action}
      className={`p-1.5 rounded transition-colors flex items-center justify-center ${
        isActive ? 'bg-slate-200 text-slate-800' : 'text-slate-600 hover:bg-slate-200'
      }`}
    >
      {icon}
    </button>
  );
}
