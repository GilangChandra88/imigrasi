import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection, addDoc, getDocs, doc, getDoc,
  onSnapshot, updateDoc, deleteDoc, query, where
} from "firebase/firestore";
import {
  FaSearch, FaPlus, FaTrash, FaSave, FaCheck, FaTimes,
  FaPrint, FaChevronLeft, FaChevronRight, FaFileAlt, FaSpinner
} from "react-icons/fa";
import { useNavigate, useParams, Link } from "react-router-dom";

// ============================================================
// HELPERS
// ============================================================
const toIndonesianDate = (dateStr) => {
  if (!dateStr) return "";
  const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  const d = new Date(dateStr);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const getInitialValue = (field) => {
  if (field.defaultValue) {
    if (field.type === "list" || field.type === "list_full") {
      return Array.isArray(field.defaultValue) ? field.defaultValue : [field.defaultValue];
    }
    return field.defaultValue;
  }
  switch (field.type) {
    case "list": return [""];
    case "list_full": return [""];
    case "pegawai_multi": return [];
    case "pegawai_single": return null;
    case "pegawai_detail": return null;
    case "date": return new Date().toISOString().split("T")[0];
    case "separator": return null;
    default: return "";
  }
};

const isFieldValid = (field, value) => {
  if (field.type === "separator") return true; // separators are always valid
  if (!field.required) return true;
  switch (field.type) {
    case "list":
    case "list_full":
      return Array.isArray(value) && value.length > 0 && value.every(v => typeof v === "string" && v.trim() !== "");
    case "pegawai_multi":
      return Array.isArray(value) && value.length > 0;
    case "pegawai_single":
    case "pegawai_detail":
      return value !== null && typeof value === "object";
    default:
      return typeof value === "string" && value.trim() !== "";
  }
};

// ============================================================
// VALIDATION CLASS HELPERS
// ============================================================
const getFormClass = (isValid, isActive) =>
  isValid
    ? `border-emerald-400 bg-emerald-50/40 focus:ring-emerald-500 ${isActive ? "ring-2 ring-emerald-200" : ""}`
    : `border-rose-400 bg-rose-50/60 focus:ring-rose-500 ${isActive ? "ring-2 ring-rose-200" : ""}`;

const getDocClass = (isValid, isActive) =>
  isValid
    ? `print:!bg-transparent print:!border-transparent print:!ring-0 bg-emerald-50/40 border border-emerald-200 ${isActive ? "ring-2 ring-emerald-200" : ""}`
    : `print:!bg-transparent print:!border-transparent print:!ring-0 bg-rose-50 border border-dashed border-rose-400 ${isActive ? "ring-2 ring-rose-200" : ""}`;

// ============================================================
// FIELD RENDERERS - FORM VIEW
// ============================================================
function FieldFormView({ field, value, onChange, activeField, setActiveField, openSugestiFor }) {
  // Separator has no form input — it's purely a visual divider in the document
  if (field.type === "separator") return null;

  const valid = isFieldValid(field, value);
  const isActive = activeField === field.name;

  const autoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  if (field.type === "textarea" || field.type === "textarea_full") {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-600">{field.label}{field.required && <span className="text-rose-500 ml-1">*</span>}</label>
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => { setActiveField(field.name); openSugestiFor(field.name); }}
          onInput={autoResize}
          className={`w-full p-3 border rounded-lg outline-none focus:ring-2 leading-relaxed resize-none overflow-hidden transition-colors text-sm ${getFormClass(valid, isActive)}`}
          rows={3}
        />
      </div>
    );
  }

  if (field.type === "text") {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-600">{field.label}{field.required && <span className="text-rose-500 ml-1">*</span>}</label>
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => { setActiveField(field.name); openSugestiFor(field.name); }}
          className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 transition-colors text-sm ${getFormClass(valid, isActive)}`}
        />
      </div>
    );
  }

  if (field.type === "date") {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-600">{field.label}{field.required && <span className="text-rose-500 ml-1">*</span>}</label>
        <input
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setActiveField(field.name)}
          className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 transition-colors ${getFormClass(valid, isActive)}`}
        />
      </div>
    );
  }

  if (field.type === "list" || field.type === "list_full") {
    const items = Array.isArray(value) ? value : [""];
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-600">{field.label}{field.required && <span className="text-rose-500 ml-1">*</span>}</label>
        <div className="flex flex-col gap-3">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 items-start group">
              <span className="font-bold text-slate-400 pt-3 w-5 text-right text-sm">{index + 1}.</span>
              <textarea
                value={item}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index] = e.target.value;
                  onChange(newItems);
                }}
                onFocus={() => { setActiveField(field.name); openSugestiFor(field.name); }}
                onInput={autoResize}
                className={`flex-1 p-3 border rounded-lg outline-none focus:ring-2 leading-relaxed resize-none overflow-hidden transition-colors text-sm ${getFormClass(isFieldValid(field, [item]), isActive)}`}
                rows={1}
              />
              <button
                onClick={() => { const n = [...items]; n.splice(index, 1); onChange(n.length ? n : [""]); }}
                className="p-3 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors mt-1"
              >
                <FaTrash size={13} />
              </button>
            </div>
          ))}
          <button
            onClick={() => onChange([...items, ""])}
            className="ml-7 flex items-center justify-center gap-2 text-indigo-500 font-bold text-sm border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 hover:border-indigo-300 py-2.5 rounded-lg transition-all"
          >
            <FaPlus size={11} /> Tambah {field.label}
          </button>
        </div>
      </div>
    );
  }

  if (field.type === "pegawai_single" || field.type === "pegawai_detail") {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-600">{field.label}{field.required && <span className="text-rose-500 ml-1">*</span>}</label>
        {value ? (
          <div className={`flex justify-between items-center bg-white border shadow-sm p-3 rounded-lg ${getFormClass(true, isActive)}`}>
            <div>
              <p className="font-bold text-slate-700 text-sm">{value.nama}</p>
              <p className="text-xs text-slate-500 mt-0.5">{value.nip} — {value.jabatan}</p>
            </div>
            <button onClick={() => onChange(null)} className="text-rose-500 hover:text-rose-700 p-2 hover:bg-rose-50 rounded-lg">
              <FaTrash size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setActiveField(field.name); openSugestiFor(field.name); }}
            className={`w-full flex justify-center items-center gap-2 font-bold text-sm border-2 border-dashed py-3 rounded-lg transition-all border-rose-400 bg-rose-50/50 text-rose-500 hover:bg-rose-100`}
          >
            <FaPlus size={12} /> Pilih {field.label}
          </button>
        )}
      </div>
    );
  }

  if (field.type === "pegawai_multi") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-600">{field.label}{field.required && <span className="text-rose-500 ml-1">*</span>}</label>
        <div className={`flex flex-col gap-2 p-3 border rounded-lg transition-colors ${getFormClass(selected.length > 0, isActive)}`}>
          {selected.map((k) => (
            <div key={k.id} className="flex justify-between items-center bg-white border border-slate-200 shadow-sm p-3 rounded-lg">
              <div>
                <p className="font-bold text-slate-700 text-sm">{k.nama}</p>
                <p className="text-xs text-slate-500 mt-0.5">{k.nip} — {k.jabatan}</p>
              </div>
              <button
                onClick={() => onChange(selected.filter((s) => s.id !== k.id))}
                className="text-rose-500 hover:text-rose-700 p-2 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <FaTrash size={13} />
              </button>
            </div>
          ))}
          <button
            onClick={() => { setActiveField(field.name); openSugestiFor(field.name); }}
            className="w-full flex justify-center items-center gap-2 text-indigo-500 font-bold text-sm border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 hover:border-indigo-300 py-2.5 rounded-lg transition-all mt-1"
          >
            <FaPlus size={12} /> Tambah {field.label}
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// ============================================================
// FIELD RENDERERS - DOCUMENT VIEW
// ============================================================
function FieldDocView({ field, value, onChange, activeField, setActiveField }) {
  // Separator renders as centered bold text at its position in the document
  if (field.type === "separator") {
    return (
      <div className="text-center font-bold tracking-widest my-4 text-[15px]">
        {field.label}
      </div>
    );
  }

  const valid = isFieldValid(field, value);
  const isActive = activeField === field.name;

  const autoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  if (field.type === "textarea_full") {
    return (
      <div className="w-full relative">
        <textarea
          onInput={autoResize}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onClick={() => setActiveField(field.name)}
          className={`w-full bg-transparent outline-none resize-none overflow-hidden hover:bg-slate-50 transition-colors p-1 rounded min-h-[60px] leading-relaxed text-justify print:hidden ${getDocClass(valid, isActive)}`}
          placeholder={`[${field.label}]`}
        />
        <div className="hidden print:block w-full leading-relaxed text-justify py-1 whitespace-pre-wrap">{value}</div>
      </div>
    );
  }

  if (field.type === "list_full") {
    const items = Array.isArray(value) ? value : [""];
    return (
      <div className="w-full relative group">
        <div className="flex-1 flex flex-col gap-1">
          {items.map((item, index) => (
            <div key={index} className="flex items-start group/item relative">
              <span className="w-6 shrink-0 pt-1">{index + 1}.</span>
              <div className="flex-1 relative">
                <textarea
                  onInput={autoResize}
                  value={item}
                  onChange={(e) => {
                    const n = [...items]; n[index] = e.target.value; onChange(n);
                  }}
                  onClick={() => setActiveField(field.name)}
                  className={`w-full bg-transparent outline-none resize-none overflow-hidden hover:bg-slate-50 transition-colors p-1 rounded print:hidden leading-relaxed ${getDocClass(isFieldValid(field, [item]), isActive)}`}
                  rows={1}
                  placeholder={`[${field.label} - item ${index + 1}]`}
                />
                <div className="hidden print:block w-full leading-relaxed text-justify py-1 whitespace-pre-wrap">{item}</div>
              </div>
              <button
                onClick={() => { const n = [...items]; n.splice(index, 1); onChange(n.length ? n : [""]); }}
                className="absolute -right-7 top-1 opacity-0 group-hover/item:opacity-100 p-1.5 text-rose-500 hover:bg-rose-50 rounded print:hidden"
              >
                <FaTrash size={11} />
              </button>
            </div>
          ))}
          <button
            onClick={() => onChange([...items, ""])}
            className="mt-1 self-start opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-all print:hidden ml-6"
          >
            <FaPlus size={9} /> Tambah {field.label}
          </button>
        </div>
      </div>
    );
  }

  if (field.type === "pegawai_detail") {
    return (
      <div className="w-full">
        {value ? (
          <div className="grid grid-cols-[110px_15px_1fr] gap-y-1 text-[15px]">
            <span>Nama</span><span>:</span><span className="font-semibold">{value.nama}</span>
            <span>NIP</span><span>:</span><span>{value.nip}</span>
            <span>Jabatan</span><span>:</span><span>{value.jabatan}</span>
          </div>
        ) : (
          <div className={`italic text-slate-400 text-sm py-1 px-2 ${getDocClass(false, isActive)}`}>
            Pilih {field.label}...
          </div>
        )}
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="grid grid-cols-[110px_1fr] gap-2">
        <div className="pt-1 cursor-pointer" onClick={() => setActiveField(field.name)}>{field.label}</div>
        <div className="flex items-start">
          <span className="w-5 shrink-0 pt-1 text-center">:</span>
          <div className="flex-1 relative">
            <textarea
              onInput={autoResize}
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              onClick={() => setActiveField(field.name)}
              className={`w-full bg-transparent outline-none resize-none overflow-hidden hover:bg-slate-50 transition-colors p-1 rounded min-h-[60px] leading-relaxed text-justify print:hidden ${getDocClass(valid, isActive)}`}
            />
            <div className="hidden print:block w-full leading-relaxed text-justify py-1">{value}</div>
          </div>
        </div>
      </div>
    );
  }

  if (field.type === "text") {
    return (
      <div className="grid grid-cols-[110px_1fr] gap-2">
        <div className="pt-1">{field.label}</div>
        <div className="flex items-start">
          <span className="w-5 shrink-0 pt-1 text-center">:</span>
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className={`flex-1 bg-transparent outline-none border-b hover:border-slate-300 focus:border-indigo-500 py-1 rounded-sm print:hidden ${getDocClass(valid, isActive)}`}
          />
          <div className="hidden print:block flex-1 py-1">{value}</div>
        </div>
      </div>
    );
  }

  if (field.type === "date") {
    return (
      <div className="grid grid-cols-[110px_1fr] gap-2">
        <div className="pt-1">{field.label}</div>
        <div className="flex items-start">
          <span className="w-5 shrink-0 pt-1 text-center">:</span>
          <input
            type="date"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className={`flex-1 bg-transparent outline-none font-sans text-sm py-1 print:hidden ${getDocClass(valid, isActive)}`}
          />
          <div className="hidden print:block flex-1 py-1">{toIndonesianDate(value)}</div>
        </div>
      </div>
    );
  }

  if (field.type === "list") {
    const items = Array.isArray(value) ? value : [""];
    return (
      <div className="grid grid-cols-[110px_1fr] gap-2">
        <div className="pt-1 cursor-pointer" onClick={() => setActiveField(field.name)}>{field.label}</div>
        <div className="relative group flex items-start">
          <span className="w-5 shrink-0 pt-1 text-center">:</span>
          <div className="flex-1 flex flex-col gap-1">
            {items.map((item, index) => (
              <div key={index} className="flex items-start group/item relative">
                <span className="w-6 shrink-0 pt-1">{index + 1}.</span>
                <div className="flex-1 relative">
                  <textarea
                    onInput={autoResize}
                    value={item}
                    onChange={(e) => {
                      const n = [...items]; n[index] = e.target.value; onChange(n);
                    }}
                    onClick={() => setActiveField(field.name)}
                    className={`w-full bg-transparent outline-none resize-none overflow-hidden hover:bg-slate-50 transition-colors p-1 rounded print:hidden leading-relaxed ${getDocClass(isFieldValid(field, [item]), isActive)}`}
                    rows={1}
                  />
                  <div className="hidden print:block w-full leading-relaxed py-1">{item}</div>
                </div>
                <button
                  onClick={() => { const n = [...items]; n.splice(index, 1); onChange(n.length ? n : [""]); }}
                  className="absolute -right-7 top-1 opacity-0 group-hover/item:opacity-100 p-1.5 text-rose-500 hover:bg-rose-50 rounded print:hidden"
                >
                  <FaTrash size={11} />
                </button>
              </div>
            ))}
            <button
              onClick={() => onChange([...items, ""])}
              className="mt-1 self-start opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-all print:hidden ml-6"
            >
              <FaPlus size={9} /> Tambah {field.label}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (field.type === "pegawai_single") {
    return (
      <div className="grid grid-cols-[110px_1fr] gap-2">
        <div className="pt-1">{field.label}</div>
        <div className="flex items-start">
          <span className="w-5 shrink-0 pt-1 text-center">:</span>
          {value ? (
            <div className="flex-1 grid grid-cols-[110px_15px_1fr] gap-y-1 text-[15px]">
              <span>Nama</span><span>:</span><span className="font-semibold">{value.nama}</span>
              <span>NIP</span><span>:</span><span>{value.nip}</span>
              <span>Pangkat/Gol.</span><span>:</span><span>{value.pangkat}</span>
              <span>Jabatan</span><span>:</span><span>{value.jabatan}</span>
            </div>
          ) : (
            <div className={`flex-1 italic text-slate-400 text-sm py-1 px-2 ${getDocClass(false, isActive)}`}>
              Pilih {field.label}...
            </div>
          )}
        </div>
      </div>
    );
  }

  if (field.type === "pegawai_multi") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <div className="grid grid-cols-[110px_1fr] gap-2">
        <div className="pt-1 cursor-pointer" onClick={() => setActiveField(field.name)}>{field.label}</div>
        <div className={`flex flex-col gap-4 rounded p-1 print:p-0 ${getDocClass(selected.length > 0, isActive)}`}>
          {selected.map((p, idx) => (
            <div key={p.id} className="flex group relative">
              <span className="w-5 shrink-0 text-center">:</span>
              <span className="w-6 shrink-0">{idx + 1}</span>
              <div className="flex-1 grid grid-cols-[110px_15px_1fr] gap-y-1 text-[15px]">
                <span>Nama</span><span>:</span><span>{p.nama}</span>
                <span>NIP</span><span>:</span><span>{p.nip}</span>
                <span>Pangkat / Gol.</span><span>:</span><span>{p.pangkat}</span>
                <span>Jabatan</span><span>:</span><span>{p.jabatan}</span>
              </div>
              <button
                onClick={() => onChange(selected.filter((s) => s.id !== p.id))}
                className="absolute right-0 top-0 text-rose-500 opacity-0 group-hover:opacity-100 hover:bg-rose-50 p-1 rounded print:hidden"
              >
                <FaTrash size={11} />
              </button>
            </div>
          ))}
          {selected.length === 0 && (
            <div className="flex items-center">
              <span className="w-5 shrink-0 text-center">:</span>
              <div className="text-slate-400 italic text-sm py-1 px-2">Belum ada {field.label} dipilih...</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

// ============================================================
// NOMOR SURAT MODAL
// ============================================================
function NomorSuratModal({ nomorNodes, lastNumber, onGenerate, onClose }) {
  const [selectedKop, setSelectedKop] = useState(null);
  const [selectedKode1, setSelectedKode1] = useState(null);
  const [selectedKode2, setSelectedKode2] = useState(null);
  const [selectedKode3, setSelectedKode3] = useState(null);

  const handleGenerate = () => {
    if (!selectedKop || !selectedKode1 || !selectedKode2 || !selectedKode3) {
      alert("Pilih hierarki nomor surat dengan lengkap!");
      return;
    }
    const nextNumber = parseInt(lastNumber) + 1;
    const parts = [
      selectedKop.kode || selectedKop.name,
      selectedKode1.kode || selectedKode1.name,
      selectedKode2.kode || selectedKode2.name,
      selectedKode3.kode || selectedKode3.name,
    ].filter((p) => p && p.trim() !== "");
    const generated = `${parts.join(".")}-${nextNumber.toString().padStart(4, "0")}`;
    onGenerate(generated, nextNumber);
  };

  const selects = [
    { label: "PILIH KOP", value: selectedKop, onChange: (v) => { setSelectedKop(v); setSelectedKode1(null); setSelectedKode2(null); setSelectedKode3(null); }, options: nomorNodes.filter((n) => n.type === "KOP") },
    { label: "PILIH KODE SURAT 1", value: selectedKode1, onChange: (v) => { setSelectedKode1(v); setSelectedKode2(null); setSelectedKode3(null); }, options: selectedKop ? nomorNodes.filter((n) => n.parentId === selectedKop.id) : [] },
    { label: "PILIH KODE SURAT 2", value: selectedKode2, onChange: (v) => { setSelectedKode2(v); setSelectedKode3(null); }, options: selectedKode1 ? nomorNodes.filter((n) => n.parentId === selectedKode1.id) : [] },
    { label: "PILIH KODE SURAT 3", value: selectedKode3, onChange: (v) => setSelectedKode3(v), options: selectedKode2 ? nomorNodes.filter((n) => n.parentId === selectedKode2.id) : [] },
  ];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 print:hidden">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-full">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-lg text-slate-800">Generate Nomor Surat</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500"><FaTimes /></button>
        </div>
        <div className="p-6 overflow-y-auto flex flex-col gap-5">
          {selects.map(({ label, value, onChange, options }, index) => {
            const shouldShow = index === 0 || selects[index - 1].value;
            if (!shouldShow) return null;
            return (
              <div key={label}>
                <label className="block text-xs font-bold text-slate-500 mb-2">{label}</label>
                <select
                  value={value?.id || ""}
                  onChange={(e) => onChange(nomorNodes.find((n) => n.id === e.target.value) || null)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- {label.replace("PILIH ", "")} --</option>
                  {options.map((n) => (
                    <option key={n.id} value={n.id}>{n.kode} - {n.name}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg font-semibold text-slate-500 hover:bg-slate-100">Batal</button>
          <button onClick={handleGenerate} className="px-4 py-2 rounded-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700">Generate Nomor</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT: SURAT WRITER
// ============================================================
export default function SuratWriter() {
  const navigate = useNavigate();
  const { templateId } = useParams();

  const [template, setTemplate] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(true);

  // Document data: keyed by field.name
  const [docData, setDocData] = useState({});
  const [nomor, setNomor] = useState("");
  const [tempat, setTempat] = useState("Singaraja");
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [penandatangan, setPenandatangan] = useState(null);

  // UI State
  const [viewMode, setViewMode] = useState("document");
  const [activeField, setActiveField] = useState(null);
  const [isSugestiOpen, setIsSugestiOpen] = useState(false);
  const [isNomorModalOpen, setIsNomorModalOpen] = useState(false);

  // Sidebar data
  const [pegawaiList, setPegawaiList] = useState([]);
  const [sugestiList, setSugestiList] = useState([]);
  const [searchPegawai, setSearchPegawai] = useState("");
  const [newSugesti, setNewSugesti] = useState("");

  // Nomor surat
  const [nomorNodes, setNomorNodes] = useState([]);
  const [lastNumber, setLastNumber] = useState(0);

  // Load template
  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "surat_templates", templateId));
        if (snap.exists()) {
          const t = { id: snap.id, ...snap.data() };
          setTemplate(t);
          // Initialize docData with default values per field
          const initial = {};
          (t.fields || []).forEach((f) => {
            initial[f.name] = getInitialValue(f);
          });
          setDocData(initial);
        } else {
          alert("Template tidak ditemukan!");
          navigate("/surat-editor");
        }
      } catch (e) {
        console.error("Error loading template:", e);
      } finally {
        setLoadingTemplate(false);
      }
    };
    load();
  }, [templateId]);

  // Realtime listeners
  useEffect(() => {
    const u1 = onSnapshot(collection(db, "pegawai"), (s) =>
      setPegawaiList(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const u2 = onSnapshot(collection(db, "master_sugesti"), (s) =>
      setSugestiList(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const u3 = onSnapshot(collection(db, "nomor surat kanim"), (s) =>
      setNomorNodes(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const u4 = onSnapshot(doc(db, "settings", "nomor_surat"), (d) => {
      if (d.exists()) setLastNumber(d.data().lastNumber || 0);
    });
    return () => { u1(); u2(); u3(); u4(); };
  }, []);

  // Auto-resize textareas
  useEffect(() => {
    document.querySelectorAll("textarea").forEach((t) => {
      t.style.height = "auto";
      t.style.height = t.scrollHeight + "px";
    });
  }, [docData, viewMode]);

  if (loadingTemplate || !template) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <FaSpinner size={28} className="animate-spin mx-auto mb-3 text-indigo-400" />
          <p className="text-sm font-medium">Memuat template surat...</p>
        </div>
      </div>
    );
  }

  // Validation
  const isFormValid = () => {
    const fieldsValid = (template.fields || []).every((f) =>
      isFieldValid(f, docData[f.name])
    );
    const tempValid = tempat.trim() !== "" && tanggal.trim() !== "";
    const tandaValid = !template.dengan_penandatangan || penandatangan !== null;
    return fieldsValid && tempValid && tandaValid;
  };

  // Active field info
  const activeFieldDef = template.fields?.find((f) => f.name === activeField);
  const isPegawaiField = activeFieldDef?.type === "pegawai_single" || activeFieldDef?.type === "pegawai_detail" || activeFieldDef?.type === "pegawai_multi" || activeField === "__penandatangan__";
  const activeSugesti = sugestiList.filter((s) => s.kategori === activeField);

  const filteredPegawai = pegawaiList.filter(
    (k) =>
      k.nama?.toLowerCase().includes(searchPegawai.toLowerCase()) ||
      k.nip?.toLowerCase().includes(searchPegawai.toLowerCase())
  );

  const updateField = (name, value) => setDocData((prev) => ({ ...prev, [name]: value }));

  const openSugestiFor = (fieldName) => {
    setActiveField(fieldName);
    setIsSugestiOpen(true);
  };

  // Handle selecting pegawai from sidebar
  const handlePegawaiSelect = (pegawai) => {
    if (!activeFieldDef && activeField !== "__penandatangan__") return;

    if (activeField === "__penandatangan__") {
      setPenandatangan(pegawai);
      return;
    }

    if (activeFieldDef.type === "pegawai_single" || activeFieldDef.type === "pegawai_detail") {
      updateField(activeField, pegawai);
    } else if (activeFieldDef.type === "pegawai_multi") {
      const current = Array.isArray(docData[activeField]) ? docData[activeField] : [];
      const alreadySelected = current.find((k) => k.id === pegawai.id);
      if (alreadySelected) {
        updateField(activeField, current.filter((k) => k.id !== pegawai.id));
      } else {
        updateField(activeField, [...current, pegawai]);
      }
    }
  };

  const isPegawaiSelected = (pegawai) => {
    if (activeField === "__penandatangan__") return penandatangan?.id === pegawai.id;
    if (!activeFieldDef) return false;
    if (activeFieldDef.type === "pegawai_single" || activeFieldDef.type === "pegawai_detail") return docData[activeField]?.id === pegawai.id;
    if (activeFieldDef.type === "pegawai_multi") {
      const current = Array.isArray(docData[activeField]) ? docData[activeField] : [];
      return !!current.find((k) => k.id === pegawai.id);
    }
    return false;
  };

  const handleAddSugesti = (teks) => {
    if (!activeField) return;
    const fieldDef = template.fields?.find((f) => f.name === activeField);
    if (!fieldDef) return;
    if (fieldDef.type === "list" || fieldDef.type === "list_full") {
      const current = Array.isArray(docData[activeField]) ? [...docData[activeField]] : [""];
      const emptyIdx = current.findIndex((i) => typeof i === "string" && i.trim() === "");
      if (emptyIdx !== -1) { current[emptyIdx] = teks; } else { current.push(teks); }
      updateField(activeField, current);
    } else if (fieldDef.type === "textarea" || fieldDef.type === "textarea_full" || fieldDef.type === "text") {
      const cur = docData[activeField] || "";
      updateField(activeField, cur ? `${cur}\n${teks}` : teks);
    }
  };

  const handleSaveNewSugesti = async (e) => {
    e.preventDefault();
    if (!newSugesti.trim() || !activeField) return;
    try {
      await addDoc(collection(db, "master_sugesti"), {
        kategori: activeField,
        teks: newSugesti.trim(),
        createdAt: new Date().toISOString(),
      });
      setNewSugesti("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSugesti = async (id) => {
    if (!window.confirm("Hapus sugesti ini?")) return;
    await deleteDoc(doc(db, "master_sugesti", id));
  };

  const submitSurat = async () => {
    if (template.dengan_nomor_surat) {
      setIsNomorModalOpen(true);
    } else {
      const fullData = {
        templateId,
        templateNama: template.nama,
        nomor: null,
        fields: docData,
        tempat,
        tanggal,
        penandatangan: penandatangan || null,
        createdAt: new Date().toISOString(),
      };
      try {
        await addDoc(collection(db, "surat_dokumen"), fullData);
        setTimeout(() => window.print(), 500);
      } catch (err) {
        console.error("Error saving document:", err);
        alert("Gagal menyimpan dokumen. Hubungi administrator.");
      }
    }
  };

  const handleGenerateNomor = async (generated, nextNumber) => {
    setNomor(generated);
    setIsNomorModalOpen(false);

    // Build full docData snapshot
    const fullData = {
      templateId,
      templateNama: template.nama,
      nomor: generated,
      fields: docData,
      tempat,
      tanggal,
      penandatangan: penandatangan || null,
      createdAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, "surat_dokumen"), fullData);
      await updateDoc(doc(db, "settings", "nomor_surat"), { lastNumber: nextNumber });
      setTimeout(() => window.print(), 500);
    } catch (err) {
      console.error("Error saving document:", err);
      alert("Gagal menyimpan dokumen. Hubungi administrator.");
    }
  };

  // Render a single field in document view
  const renderFieldDoc = (field) => (
    <FieldDocView
      key={field.id}
      field={field}
      value={docData[field.name]}
      onChange={(v) => updateField(field.name, v)}
      activeField={activeField}
      setActiveField={setActiveField}
    />
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-hidden relative print:bg-white print:h-auto print:overflow-visible">
      {/* NOMOR SURAT MODAL */}
      {isNomorModalOpen && (
        <NomorSuratModal
          nomorNodes={nomorNodes}
          lastNumber={lastNumber}
          onGenerate={handleGenerateNomor}
          onClose={() => setIsNomorModalOpen(false)}
        />
      )}

      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white flex justify-between items-center shrink-0 shadow-sm z-10 print:hidden flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/surat-editor"
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
            title="Kembali ke Surat Editor"
          >
            <FaChevronLeft size={14} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">{template.nama}</h1>
            <p className="text-slate-500 text-sm">{template.deskripsi || "Isi data untuk membuat surat"}</p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
          {["document", "form"].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === mode ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {mode === "document" ? "Mode Dokumen" : "Mode Form"}
            </button>
          ))}
        </div>

        <button
          onClick={submitSurat}
          disabled={!isFormValid()}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${isFormValid() ? "bg-indigo-600 text-white border border-indigo-700 hover:bg-indigo-700" : "bg-slate-100 text-slate-400 border border-slate-200 opacity-50 cursor-not-allowed"}`}
        >
          <FaPrint size={15} /> Buat Surat
        </button>
      </div>

      {/* 2-Column Layout */}
      <div className="flex-1 flex min-h-0 print:h-auto print:block">

        {/* MIDDLE: Main content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-200/50 print:p-0 print:bg-transparent print:overflow-visible print:block">

          {/* FORM VIEW */}
          {viewMode === "form" && (
            <div className="bg-white shadow-sm rounded-xl border border-slate-200 w-full max-w-3xl p-8 flex flex-col gap-6 print:hidden h-fit">
              <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4">
                Isi Data — {template.nama}
              </h2>
              <div className="flex flex-col gap-5">
                {(template.fields || []).map((field) => (
                  <FieldFormView
                    key={field.id}
                    field={field}
                    value={docData[field.name]}
                    onChange={(v) => updateField(field.name, v)}
                    activeField={activeField}
                    setActiveField={setActiveField}
                    openSugestiFor={openSugestiFor}
                  />
                ))}

                {/* Tempat & Tanggal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-600">Tempat Dikeluarkan</label>
                    <input
                      type="text"
                      value={tempat}
                      onChange={(e) => setTempat(e.target.value)}
                      className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 transition-colors ${getFormClass(tempat.trim() !== "", false)}`}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-600">Tanggal</label>
                    <input
                      type="date"
                      value={tanggal}
                      onChange={(e) => setTanggal(e.target.value)}
                      className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 transition-colors ${getFormClass(tanggal.trim() !== "", false)}`}
                    />
                  </div>
                </div>

                {/* Penandatangan */}
                {template.dengan_penandatangan && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-600">Penandatangan <span className="text-rose-500">*</span></label>
                    {penandatangan ? (
                      <div className={`flex justify-between items-center bg-white border shadow-sm p-3 rounded-lg ${getFormClass(true, false)}`}>
                        <div>
                          <p className="font-bold text-slate-700 text-sm">{penandatangan.nama}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{penandatangan.nip} — {penandatangan.jabatan}</p>
                        </div>
                        <button onClick={() => setPenandatangan(null)} className="text-rose-500 hover:text-rose-700 p-2 hover:bg-rose-50 rounded-lg">
                          <FaTrash size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setActiveField("__penandatangan__"); setIsSugestiOpen(true); }}
                        className="w-full flex justify-center items-center gap-2 font-bold text-sm border-2 border-dashed py-3 rounded-lg transition-all border-rose-400 bg-rose-50/50 text-rose-500 hover:bg-rose-100"
                      >
                        <FaPlus size={12} /> Pilih Penandatangan
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DOCUMENT VIEW */}
          <div
            className={`bg-white shadow-xl w-full max-w-[794px] h-fit min-h-[1123px] pl-[3cm] pr-[2cm] py-[2cm] print:p-0 flex-col text-slate-900 relative print:shadow-none print:max-w-none print:w-full print:min-h-0 ${viewMode === "document" ? "flex" : "hidden print:flex"}`}
            style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: "16px" }}
          >
            {/* KOP */}
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

            {/* Judul */}
            <div className="text-center mb-8">
              <h2 className="font-bold text-[17px] uppercase tracking-wider">{template.judul_surat}</h2>
              {template.dengan_nomor_surat && (
                <div className="flex justify-center items-center mt-0.5">
                  <span className="font-bold mr-2 text-[14px]">NOMOR :</span>
                  {/* Form view (with box/border) */}
                  <div className={`font-bold text-[14px] bg-transparent text-center px-2 py-0.5 min-w-[250px] rounded print:hidden ${getDocClass(!!nomor, false)}`}>
                    {nomor || <span className="text-slate-400 font-normal text-sm italic">Nomor digenerate saat cetak</span>}
                  </div>
                  {/* Print view (native text, no gap) */}
                  <div className="hidden print:block font-bold text-[14px]">
                    {nomor}
                  </div>
                </div>
              )}
            </div>

            {/* Fields in document — rendered sequentially; separator renders inline at its position */}
            <div className="flex-1 flex flex-col gap-3 text-justify text-[15px] leading-snug">
              {(template.fields || []).map(renderFieldDoc)}
            </div>

            {/* Footer */}
            {template.dengan_penandatangan && (
              <div className="break-inside-avoid">
                <div className="mt-16 flex justify-between gap-4">
                  <div className="flex items-end pb-8">
                    <div className="w-24 h-24 bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-xs text-slate-400 font-sans text-center p-2 print:border-black print:text-black">QR Code TTE</div>
                  </div>
                  <div className="text-[15px] flex flex-col items-start min-w-[320px]">
                    <div className="mb-1 w-full">
                      {/* Form View (hidden in print) */}
                      <div className="flex gap-1 items-center print:hidden">
                        <input
                          value={tempat}
                          onChange={(e) => setTempat(e.target.value)}
                          className={`outline-none border-b border-transparent hover:border-slate-300 focus:border-indigo-500 bg-transparent w-[120px] rounded ${getDocClass(!!tempat.trim(), false)}`}
                          placeholder="Tempat"
                        />
                        <span>,</span>
                        <input
                          type="date"
                          value={tanggal}
                          onChange={(e) => setTanggal(e.target.value)}
                          className={`outline-none border-b border-transparent hover:border-slate-300 focus:border-indigo-500 bg-transparent w-[140px] font-sans text-sm rounded ml-1 ${getDocClass(!!tanggal.trim(), false)}`}
                        />
                      </div>
                      {/* Document View (only shown in print) */}
                      <div className="hidden print:block">
                        {tempat}, {toIndonesianDate(tanggal)}
                      </div>
                    </div>
                    <div className="mb-2 uppercase">Kepala,</div>
                    {/* Signature Space */}
                    <div className="my-2 h-[40px]"></div>
                    <div className="mt-4 w-full">
                      {/* Form View (hidden in print) */}
                      <input
                        value={penandatangan?.nama || ""}
                        readOnly
                        onClick={() => { setActiveField("__penandatangan__"); setIsSugestiOpen(true); }}
                        className={`font-bold outline-none border-transparent hover:bg-slate-50 bg-transparent w-full rounded cursor-pointer print:hidden ${getDocClass(!!penandatangan, activeField === "__penandatangan__")}`}
                        placeholder="Klik untuk pilih penandatangan..."
                      />
                      {/* Document View (only shown in print) */}
                      <div className="hidden print:block font-bold">
                        {penandatangan?.nama || ""}
                      </div>
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

        {/* RIGHT PANEL: Sugesti / Pegawai */}
        <div className={`bg-white border-l border-slate-200 flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-20 print:hidden transition-all duration-300 relative ${isSugestiOpen ? "w-80" : "w-0"}`}>
          <button
            onClick={() => setIsSugestiOpen(!isSugestiOpen)}
            className="absolute -left-9 top-1/2 -translate-y-1/2 bg-white border border-slate-200 border-r-0 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] p-2.5 rounded-l-xl text-slate-500 hover:text-indigo-600 transition-colors z-30 flex items-center justify-center cursor-pointer"
            title={isSugestiOpen ? "Tutup panel" : "Buka panel"}
          >
            {isSugestiOpen ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
          </button>

          <div className={`flex-1 flex flex-col w-80 overflow-hidden transition-opacity duration-300 ${isSugestiOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            {/* Panel Header */}
            <div className="p-4 border-b border-slate-100 bg-indigo-50/50 shrink-0">
              <h2 className="font-bold text-indigo-900 mb-1">
                {isPegawaiField ? "Data Pegawai" : "Suggestion Box"}
              </h2>
              <p className="text-xs text-indigo-600/80 font-medium">
                Bagian terpilih:{" "}
                <strong className="uppercase bg-indigo-100 px-1 rounded">
                  {activeField === "__penandatangan__" ? "penandatangan" : (activeField || "—")}
                </strong>
              </p>
            </div>

            {/* Pegawai list */}
            {isPegawaiField ? (
              <>
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-3 text-slate-400" size={13} />
                    <input
                      type="text"
                      placeholder="Cari nama atau NIP..."
                      value={searchPegawai}
                      onChange={(e) => setSearchPegawai(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {filteredPegawai.map((k) => {
                    const isSelected = isPegawaiSelected(k);
                    return (
                      <div
                        key={k.id}
                        onClick={() => handlePegawaiSelect(k)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${isSelected ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white hover:border-indigo-300"}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-slate-800 text-sm leading-tight mb-0.5">{k.nama}</p>
                            <p className="text-slate-500 text-xs font-mono">{k.nip}</p>
                            <p className="text-slate-500 text-xs mt-1 truncate">{k.jabatan}</p>
                          </div>
                          {isSelected ? (
                            <div className="bg-indigo-500 text-white p-1 rounded-full shrink-0"><FaCheck size={10} /></div>
                          ) : (
                            <div className="text-slate-300 shrink-0"><FaPlus size={12} /></div>
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
              /* Sugesti list */
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeSugesti.length === 0 ? (
                  <div className="text-center p-6 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                    Belum ada sugesti untuk <strong>{activeField || "bagian ini"}</strong>.
                  </div>
                ) : (
                  activeSugesti.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group relative cursor-pointer"
                      onClick={() => handleAddSugesti(s.teks)}
                    >
                      <p className="text-xs text-slate-600 line-clamp-4 leading-relaxed">{s.teks}</p>
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteSugesti(s.id); }}
                          className="p-1.5 bg-white text-rose-500 hover:bg-rose-50 rounded-lg shadow-sm border border-slate-200"
                        >
                          <FaTrash size={10} />
                        </button>
                      </div>
                      <div className="mt-2 text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Klik untuk menambahkan</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Add sugesti form (only for text fields) */}
            {!isPegawaiField && (
              <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0">
                <form onSubmit={handleSaveNewSugesti} className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500">TAMBAH SUGESTI BARU</label>
                  <textarea
                    value={newSugesti}
                    onChange={(e) => setNewSugesti(e.target.value)}
                    onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
                    placeholder={`Ketik sugesti untuk ${activeField || "bagian ini"}...`}
                    className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none min-h-[70px]"
                  />
                  <button
                    type="submit"
                    className="w-full bg-indigo-50 text-indigo-700 py-2 rounded-lg font-bold text-xs hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaPlus size={10} /> Simpan Sugesti
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
