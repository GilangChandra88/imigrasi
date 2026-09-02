import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import {
  collection, addDoc, doc, getDoc, updateDoc
} from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaPlus, FaTrash, FaTimes, FaArrowUp, FaArrowDown,
  FaSave, FaChevronLeft, FaCheck, FaEye, FaAlignLeft,
  FaFont, FaCalendar, FaList, FaUser, FaUsers, FaToggleOn,
  FaToggleOff, FaGripVertical, FaMinus, FaAlignJustify,
  FaListOl, FaIdCard, FaPencilAlt
} from "react-icons/fa";

// ============================================================
// FIELD TYPE DEFINITIONS
// ============================================================
const FIELD_TYPES = [
  {
    type: "textarea",
    label: "Teks Panjang",
    description: "Paragraf teks bebas dengan label di kiri",
    icon: FaAlignLeft,
    color: "violet",
    preview: (label, def) => (
      <div className="grid grid-cols-[110px_1fr] gap-2 text-[14px]">
        <div className="text-slate-700">{label}</div>
        <div className="flex items-start">
          <span className="w-5 text-center shrink-0">:</span>
          <div className="flex-1 border border-dashed border-violet-300 rounded bg-violet-50/50 min-h-[40px] text-[11px] p-2 text-violet-700 whitespace-pre-wrap">{def || ""}</div>
        </div>
      </div>
    ),
  },
  {
    type: "textarea_full",
    label: "Teks Panjang (Penuh)",
    description: "Paragraf panjang selebar kertas (tanpa label di kiri)",
    icon: FaAlignJustify,
    color: "fuchsia",
    preview: (label, def) => (
      <div className="flex flex-col gap-2 text-[14px]">
        <div className="text-slate-700 italic hidden">{label}</div>
        <div className="flex-1 border border-dashed border-fuchsia-300 rounded bg-fuchsia-50/50 min-h-[40px] w-full text-[11px] p-2 text-fuchsia-700 whitespace-pre-wrap">{def || ""}</div>
      </div>
    ),
  },
  {
    type: "text",
    label: "Teks Pendek",
    description: "Input satu baris (contoh: Tempat, Perihal)",
    icon: FaFont,
    color: "sky",
    preview: (label, def) => (
      <div className="grid grid-cols-[110px_1fr] gap-2 text-[14px]">
        <div className="text-slate-700">{label}</div>
        <div className="flex items-start">
          <span className="w-5 text-center shrink-0">:</span>
          <div className="flex-1 border border-dashed border-sky-300 rounded bg-sky-50/50 min-h-[24px] text-[11px] px-2 flex items-center text-sky-700 whitespace-pre-wrap">{def || ""}</div>
        </div>
      </div>
    ),
  },
  {
    type: "date",
    label: "Tanggal",
    description: "Pilih tanggal dari kalender",
    icon: FaCalendar,
    color: "amber",
    preview: (label) => (
      <div className="grid grid-cols-[110px_1fr] gap-2 text-[14px]">
        <div className="text-slate-700">{label}</div>
        <div className="flex items-start">
          <span className="w-5 text-center shrink-0">:</span>
          <div className="border border-dashed border-amber-300 rounded bg-amber-50/50 h-6 w-36" />
        </div>
      </div>
    ),
  },
  {
    type: "list",
    label: "Daftar Bernomor",
    description: "Beberapa baris bernomor dengan label di kiri",
    icon: FaList,
    color: "emerald",
    preview: (label) => (
      <div className="grid grid-cols-[110px_1fr] gap-2 text-[14px]">
        <div className="text-slate-700">{label}</div>
        <div className="flex items-start">
          <span className="w-5 text-center shrink-0">:</span>
          <div className="flex-1 flex flex-col gap-1">
            {[1, 2].map((n) => (
              <div key={n} className="flex items-center gap-1">
                <span className="text-slate-400 text-xs">{n}.</span>
                <div className="flex-1 border border-dashed border-emerald-300 rounded bg-emerald-50/50 h-5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    type: "list_full",
    label: "Daftar Bernomor (Penuh)",
    description: "Daftar bernomor selebar kertas (tanpa label di kiri)",
    icon: FaListOl,
    color: "teal",
    preview: (label) => (
      <div className="flex flex-col gap-1 text-[14px]">
        <div className="text-slate-700 italic hidden">{label}</div>
        {[1, 2].map((n) => (
          <div key={n} className="flex items-center gap-1">
            <span className="text-slate-400 text-xs">{n}.</span>
            <div className="flex-1 border border-dashed border-teal-300 rounded bg-teal-50/50 h-5" />
          </div>
        ))}
      </div>
    ),
  },
  {
    type: "pegawai_single",
    label: "Pegawai (Tunggal)",
    description: "Pilih 1 pegawai (dengan label di kiri)",
    icon: FaUser,
    color: "indigo",
    preview: (label) => (
      <div className="grid grid-cols-[110px_1fr] gap-2 text-[14px]">
        <div className="text-slate-700">{label}</div>
        <div className="flex items-start">
          <span className="w-5 text-center shrink-0">:</span>
          <div className="flex-1 border border-dashed border-indigo-300 rounded bg-indigo-50/50 p-2 grid grid-cols-[60px_8px_1fr] gap-y-1 text-[11px] text-slate-400">
            <span>Nama</span><span>:</span><div className="bg-indigo-100 rounded h-3 w-24" />
            <span>NIP</span><span>:</span><div className="bg-indigo-100 rounded h-3 w-20" />
            <span>Jabatan</span><span>:</span><div className="bg-indigo-100 rounded h-3 w-32" />
          </div>
        </div>
      </div>
    ),
  },
  {
    type: "pegawai_detail",
    label: "Pegawai (Detail Penuh)",
    description: "Tampilkan Nama, NIP, Jabatan selebar kertas (tanpa label di kiri)",
    icon: FaIdCard,
    color: "blue",
    preview: (label) => (
      <div className="flex flex-col gap-2 text-[14px]">
        <div className="text-slate-700 italic hidden">{label}</div>
        <div className="border border-dashed border-blue-300 rounded bg-blue-50/50 p-2 grid grid-cols-[80px_8px_1fr] gap-y-1 text-[12px] text-slate-400 w-full">
          <span>Nama</span><span>:</span><div className="bg-blue-200 rounded h-3 w-48" />
          <span>NIP</span><span>:</span><div className="bg-blue-200 rounded h-3 w-32" />
          <span>Jabatan</span><span>:</span><div className="bg-blue-200 rounded h-3 w-56" />
        </div>
      </div>
    ),
  },
  {
    type: "pegawai_multi",
    label: "Pegawai (Banyak)",
    description: "Pilih beberapa pegawai (contoh: Kepada / yang ditugaskan)",
    icon: FaUsers,
    color: "rose",
    preview: (label) => (
      <div className="grid grid-cols-[110px_1fr] gap-2 text-[14px]">
        <div className="text-slate-700">{label}</div>
        <div className="flex items-start">
          <span className="w-5 text-center shrink-0">:</span>
          <div className="flex-1 flex flex-col gap-2">
            {[1, 2].map((n) => (
              <div key={n} className="border border-dashed border-rose-300 rounded bg-rose-50/50 p-2 grid grid-cols-[60px_8px_1fr] gap-y-0.5 text-[11px] text-slate-400">
                <span className="text-slate-400 text-[11px] col-span-3 font-bold mb-0.5">{n}.</span>
                <span>Nama</span><span>:</span><div className="bg-rose-100 rounded h-2.5 w-20" />
                <span>NIP</span><span>:</span><div className="bg-rose-100 rounded h-2.5 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    type: "separator",
    label: "Separator / Pemisah",
    description: "Teks pemisah di tengah dokumen, bisa ditempatkan di mana saja",
    icon: FaMinus,
    color: "slate",
    preview: (label) => (
      <div className="text-center font-bold tracking-widest text-[12px] py-2 text-slate-700">
        {label || "— SEPARATOR —"}
      </div>
    ),
  },
];

const COLOR_CLASSES = {
  violet: { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-300", light: "bg-violet-50", ring: "ring-violet-400" },
  fuchsia: { bg: "bg-fuchsia-100", text: "text-fuchsia-700", border: "border-fuchsia-300", light: "bg-fuchsia-50", ring: "ring-fuchsia-400" },
  sky: { bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-300", light: "bg-sky-50", ring: "ring-sky-400" },
  amber: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300", light: "bg-amber-50", ring: "ring-amber-400" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300", light: "bg-emerald-50", ring: "ring-emerald-400" },
  teal: { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-300", light: "bg-teal-50", ring: "ring-teal-400" },
  indigo: { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-300", light: "bg-indigo-50", ring: "ring-indigo-400" },
  blue: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300", light: "bg-blue-50", ring: "ring-blue-400" },
  rose: { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-300", light: "bg-rose-50", ring: "ring-rose-400" },
  slate: { bg: "bg-slate-200", text: "text-slate-600", border: "border-slate-300", light: "bg-slate-100", ring: "ring-slate-400" },
};


function getTypeInfo(type) {
  return FIELD_TYPES.find((t) => t.type === type) || FIELD_TYPES[0];
}

// ============================================================
// FIELD PICKER MODAL
// ============================================================
function FieldPickerModal({ onClose, onSelect, editingField }) {
  const [step, setStep] = useState(editingField ? "config" : "type"); // 'type' | 'config'
  const [selectedType, setSelectedType] = useState(editingField ? getTypeInfo(editingField.type) : null);
  const [label, setLabel] = useState(editingField ? editingField.label : "");
  const [required, setRequired] = useState(editingField ? editingField.required : true);
  const [defaultValue, setDefaultValue] = useState(editingField ? (editingField.defaultValue || "") : "");

  const handleSelectType = (ft) => {
    setSelectedType(ft);
    // Only reset label if we aren't editing, or if we switched to separator
    if (!editingField || ft.type === "separator") {
      setLabel(ft.type === "separator" ? "M E N U G A S K A N :" : ft.label);
    }
    setRequired(ft.type !== "separator");
    setStep("config");
  };

  const handleConfirm = () => {
    if (!label.trim()) return;
    const isSeparator = selectedType.type === "separator";
    const generatedName = label.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    const name = isSeparator ? `separator_${Date.now()}` : generatedName;
    
    onSelect({
      id: editingField ? editingField.id : `f_${Date.now()}`,
      type: selectedType.type,
      label: label.trim(),
      name: editingField ? editingField.name : (name || selectedType.type),
      required: isSeparator ? false : required,
      defaultValue: defaultValue.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-bold text-lg text-slate-800">
              {step === "type" ? "Pilih Tipe Field" : "Konfigurasi Field"}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {step === "type"
                ? "Klik kartu untuk melihat preview lalu pilih"
                : `Tipe: ${selectedType?.label}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Step: Type Selection */}
        {step === "type" && (
          <div className="overflow-y-auto p-5">
            {/* Subtitle hint */}
            <p className="text-xs text-slate-400 mb-4">
              Pilih berdasarkan tampilan hasil di dokumen yang Anda inginkan
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {FIELD_TYPES.map((ft) => {
                const c = COLOR_CLASSES[ft.color];
                const Icon = ft.icon;
                return (
                  <button
                    key={ft.type}
                    onClick={() => handleSelectType(ft)}
                    className={`flex flex-col items-start gap-0 rounded-xl border-2 border-transparent overflow-hidden ${c.light} hover:border-current hover:shadow-lg transition-all group text-left ${c.text}`}
                  >
                    {/* Card header: icon + label */}
                    <div className="px-4 pt-4 pb-3 flex items-center gap-3 w-full">
                      <div className={`p-2 rounded-lg shrink-0 ${c.bg} group-hover:scale-110 transition-transform`}>
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm leading-tight">{ft.label}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-tight truncate">{ft.description}</p>
                      </div>
                    </div>

                    {/* Mini document preview */}
                    <div
                      className="w-full bg-white/90 border-t border-current/10 px-4 py-3 min-h-[100px]"
                      style={{ fontFamily: "'Times New Roman', serif", fontSize: "11px", color: "#334155" }}
                    >
                      <div className="text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Tampilan di dokumen:
                      </div>
                      {ft.preview(ft.label)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step: Config */}
        {step === "config" && selectedType && (
          <div className="overflow-y-auto p-5 flex flex-col gap-5">
            {/* Selected type badge */}
            <div
              className={`flex items-center gap-3 p-3 rounded-xl ${COLOR_CLASSES[selectedType.color].light}`}
            >
              <div className={`p-2 rounded-lg ${COLOR_CLASSES[selectedType.color].bg}`}>
                <selectedType.icon size={16} className={COLOR_CLASSES[selectedType.color].text} />
              </div>
              <div>
                <p className={`font-bold text-sm ${COLOR_CLASSES[selectedType.color].text}`}>
                  {selectedType.label}
                </p>
                <p className="text-xs text-slate-500">{selectedType.description}</p>
              </div>
              <button
                onClick={() => setStep("type")}
                className="ml-auto text-xs font-semibold text-slate-400 hover:text-indigo-600 underline"
              >
                Ganti
              </button>
            </div>

            {/* Label input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">
                {selectedType.type === "separator" ? "Teks Separator" : "Label Field"}
                {selectedType.type !== "separator" && <span className="text-rose-500"> *</span>}
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={selectedType.type === "separator" ? "Contoh: M E N U G A S K A N :" : "Contoh: Menimbang, Dasar, Kepada..."}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
              />
              <p className="text-xs text-slate-400">
                {selectedType.type === "separator"
                  ? "Teks yang muncul di tengah dokumen (bisa dikosongkan untuk garis pemisah biasa)."
                  : "Nama field yang tampil di formulir dan dokumen."}
              </p>
            </div>

            {/* Default Value Input */}
            {selectedType.type !== "separator" && !selectedType.type.startsWith("pegawai") && !selectedType.type.startsWith("list") && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">
                  Nilai Awal (Default Value)
                </label>
                <textarea
                  value={defaultValue}
                  onChange={(e) => setDefaultValue(e.target.value)}
                  placeholder="Bisa dikosongkan. Jika diisi, teks ini akan otomatis muncul saat membuat surat."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 resize-none min-h-[80px]"
                />
              </div>
            )}

            {/* Required toggle — hidden for separator */}
            {selectedType.type !== "separator" && (
              <div
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer"
                onClick={() => setRequired(!required)}
              >
                <div>
                  <p className="font-semibold text-sm text-slate-700">Wajib diisi</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Surat tidak bisa dibuat jika field ini kosong
                  </p>
                </div>
                {required ? (
                  <FaToggleOn size={24} className="text-indigo-500" />
                ) : (
                  <FaToggleOff size={24} className="text-slate-300" />
                )}
              </div>
            )}

            {/* Preview */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Preview di Dokumen
              </p>
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50" style={{ fontFamily: "'Times New Roman', serif" }}>
                {selectedType.preview(label || selectedType.label)}
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
          {step === "config" ? (
            <>
              <button
                onClick={() => setStep("type")}
                className="px-4 py-2 text-slate-500 hover:text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-2"
              >
                <FaChevronLeft size={12} /> Kembali
              </button>
              <button
                onClick={handleConfirm}
                disabled={!label.trim()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-colors flex items-center gap-2"
              >
                <FaCheck size={12} /> Tambahkan Field
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-500 hover:text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// LIVE PREVIEW COMPONENT
// ============================================================
function LivePreview({ template }) {
  const { judul_surat, dengan_nomor_surat, dengan_penandatangan, fields } = template;

  return (
    <div
      className="bg-white shadow-lg w-full mx-auto text-slate-900 overflow-y-auto"
      style={{
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: "13px",
        padding: "1.5cm 1.5cm 1.5cm 2cm",
        minHeight: "100%",
      }}
    >
      {/* KOP */}
      <div className="border-b-[3px] border-black pb-2 mb-6 flex items-center text-center">
        <div className="w-16 h-16 shrink-0 bg-slate-100 rounded-full border-2 border-slate-300 flex items-center justify-center text-slate-400 text-[9px]">
          Logo
        </div>
        <div className="flex-1 ml-3">
          <p className="leading-tight uppercase text-[10px]">KEMENTERIAN IMIGRASI DAN PEMASYARAKATAN</p>
          <p className="leading-tight uppercase text-[10px]">DIREKTORAT JENDERAL IMIGRASI</p>
          <p className="leading-tight uppercase text-[10px]">KANTOR WILAYAH DIREKTORAT JENDERAL IMIGRASI BALI</p>
          <p className="font-bold leading-tight uppercase text-[12px]">KANTOR IMIGRASI KELAS II TPI SINGARAJA</p>
        </div>
      </div>

      {/* Judul */}
      <div className="text-center mb-5">
        <h2 className="font-bold text-[14px] uppercase tracking-widest">
          {judul_surat || "JUDUL SURAT"}
        </h2>
        {dengan_nomor_surat && (
          <div className="flex justify-center items-center mt-0.5 gap-2 text-[12px]">
            <span className="font-bold">NOMOR :</span>
            <div className="border border-dashed border-slate-300 rounded px-4 py-0.5 text-slate-400 text-[10px] min-w-[120px]">
              W?.../.../.../...
            </div>
          </div>
        )}
      </div>

      {/* Fields Preview */}
      <div className="flex flex-col gap-3">
        {!fields || fields.length === 0 ? (
          <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg text-[11px]">
            Tambahkan field di panel kiri untuk melihat preview
          </div>
        ) : (
          fields.map((f) => {
            if (f.type === "separator") {
              return (
                <div key={f.id} className="text-center font-bold tracking-widest my-2 text-[12px] text-slate-700">
                  {f.label || "— SEPARATOR —"}
                </div>
              );
            }
            const ft = getTypeInfo(f.type);
            return <div key={f.id}>{ft.preview(f.label, f.defaultValue)}</div>;
          })
        )}
      </div>

      {/* Penandatangan */}
      {dengan_penandatangan && (
        <div className="mt-8 flex justify-end">
          <div className="text-[12px] flex flex-col gap-1 w-44">
            <div className="flex gap-1 text-[11px] text-slate-500">
              <span>Singaraja,</span>
              <div className="border-b border-dashed border-slate-300 flex-1" />
            </div>
            <p className="uppercase">Kepala,</p>
            <div className="h-12 border border-dashed border-slate-200 rounded mt-1" />
            <div className="border-b border-dashed border-slate-300 h-3" />
            <div className="border-b border-dashed border-slate-300 h-3 w-3/4" />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// FIELD ITEM in config panel
// ============================================================
function FieldItem({ field, index, total, onMoveUp, onMoveDown, onRemove, onEdit }) {
  const ft = getTypeInfo(field.type);
  const c = COLOR_CLASSES[ft.color] || COLOR_CLASSES.indigo;
  const Icon = ft.icon;

  // Separator gets a special full-width look
  if (field.type === "separator") {
    return (
      <div className="flex items-center gap-2 bg-slate-100 border border-dashed border-slate-300 rounded-xl p-2 group hover:border-slate-400 transition-all">
        <div className="text-slate-300 cursor-grab shrink-0">
          <FaGripVertical size={14} />
        </div>
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-slate-200 shrink-0">
            <FaMinus size={11} className="text-slate-500" />
          </div>
          <p className="font-bold text-sm text-slate-600 tracking-wider truncate flex-1">
            {field.label || "— SEPARATOR —"}
          </p>
          <span className="text-[9px] font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded-full shrink-0">
            Pemisah
          </span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
            <FaPencilAlt size={11} />
          </button>
          <button onClick={onMoveUp} disabled={index === 0}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <FaArrowUp size={11} />
          </button>
          <button onClick={onMoveDown} disabled={index === total - 1}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <FaArrowDown size={11} />
          </button>
          <button onClick={onRemove}
            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
            <FaTrash size={11} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-3 shadow-sm group hover:border-indigo-200 transition-all">
      <div className="text-slate-300 cursor-grab shrink-0">
        <FaGripVertical size={14} />
      </div>
      <div className={`p-1.5 rounded-lg shrink-0 ${c.bg}`}>
        <Icon size={12} className={c.text} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-slate-800 truncate">{field.label}</p>
        <p className={`text-[10px] font-semibold ${c.text}`}>{ft.label}</p>
      </div>
      {field.required && (
        <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-full shrink-0">
          Wajib
        </span>
      )}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          <FaPencilAlt size={11} />
        </button>
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <FaArrowUp size={11} />
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <FaArrowDown size={11} />
        </button>
        <button
          onClick={onRemove}
          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <FaTrash size={11} />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function TemplateBuilder() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const isEditMode = !!templateId;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [showFieldPicker, setShowFieldPicker] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [template, setTemplate] = useState({
    nama: "",
    deskripsi: "",
    judul_surat: "",
    dengan_nomor_surat: true,
    dengan_penandatangan: true,
    fields: [],
  });

  const [leftWidth, setLeftWidth] = useState(420);
  const isResizing = React.useRef(false);

  const startResize = (e) => {
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResize);
    document.body.classList.add("cursor-col-resize", "select-none");
  };

  const handleMouseMove = (e) => {
    if (!isResizing.current) return;
    setLeftWidth(Math.max(300, Math.min(800, e.clientX)));
  };

  const stopResize = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResize);
    document.body.classList.remove("cursor-col-resize", "select-none");
  };

  // Load existing template if editing
  useEffect(() => {
    if (!isEditMode) return;
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "surat_templates", templateId));
        if (snap.exists()) {
          setTemplate({ ...snap.data() });
        }
      } catch (e) {
        console.error("Error loading template:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [templateId, isEditMode]);

  const updateField = (key, value) =>
    setTemplate((prev) => ({ ...prev, [key]: value }));

  const handleAddField = (field) => {
    setTemplate((prev) => {
      const idx = prev.fields.findIndex(f => f.id === field.id);
      if (idx !== -1) {
        const newFields = [...prev.fields];
        newFields[idx] = field;
        return { ...prev, fields: newFields };
      }
      return { ...prev, fields: [...prev.fields, field] };
    });
  };

  const handleRemoveField = (id) => {
    setTemplate((prev) => ({
      ...prev,
      fields: prev.fields.filter((f) => f.id !== id),
    }));
  };

  const handleMoveField = (index, direction) => {
    const fields = [...template.fields];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    [fields[index], fields[targetIndex]] = [fields[targetIndex], fields[index]];
    setTemplate((prev) => ({ ...prev, fields }));
  };

  const handleSave = async () => {
    if (!template.nama.trim() || !template.judul_surat.trim()) {
      alert("Nama template dan judul surat wajib diisi!");
      return;
    }
    if (template.fields.length === 0) {
      alert("Tambahkan minimal 1 field ke template!");
      return;
    }
    setSaving(true);
    try {
      const data = {
        ...template,
        updatedAt: new Date().toISOString(),
        ...(isEditMode ? {} : { createdAt: new Date().toISOString() }),
      };
      if (isEditMode) {
        await updateDoc(doc(db, "surat_templates", templateId), data);
      } else {
        await addDoc(collection(db, "surat_templates"), data);
      }
      setSaveSuccess(true);
      setTimeout(() => {
        navigate("/surat-editor");
      }, 800);
    } catch (e) {
      console.error("Error saving template:", e);
      alert("Gagal menyimpan template. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Memuat template...</p>
        </div>
      </div>
    );
  }

  const isFormReady =
    template.nama.trim() &&
    template.judul_surat.trim() &&
    template.fields.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-hidden">
      {showFieldPicker && (
        <FieldPickerModal
          onClose={() => {
            setShowFieldPicker(false);
            setEditingFieldId(null);
          }}
          onSelect={handleAddField}
          editingField={editingFieldId ? template.fields.find(f => f.id === editingFieldId) : null}
        />
      )}

      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white shadow-sm z-10 shrink-0 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/surat-editor")}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
            title="Kembali"
          >
            <FaChevronLeft size={14} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              {isEditMode ? "Edit Template" : "Buat Template Baru"}
            </h1>
            <p className="text-slate-500 text-sm">
              {isEditMode
                ? `Mengedit: ${template.nama || "..."}`
                : "Desain template surat secara interaktif"}
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!isFormReady || saving}
          className={`flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm text-sm ${
            saveSuccess
              ? "bg-emerald-500 text-white"
              : isFormReady && !saving
              ? "bg-indigo-600 hover:bg-indigo-700 text-white"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          {saveSuccess ? (
            <><FaCheck size={13} /> Tersimpan!</>
          ) : saving ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Menyimpan...</>
          ) : (
            <><FaSave size={13} /> Simpan Template</>
          )}
        </button>
      </div>

      {/* 2-Panel Layout */}
      <div className="flex-1 flex min-h-0 relative">
        {/* LEFT PANEL: Config */}
        <div 
          className="shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden relative"
          style={{ width: leftWidth }}
        >
          {/* Drag Handle */}
          <div
            className="absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize hover:bg-indigo-300 active:bg-indigo-500 z-50 transition-colors"
            onMouseDown={startResize}
          />
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 pr-6">

            {/* Section: Info Template */}
            <section>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Informasi Template
              </h2>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                    Nama Template <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={template.nama}
                    onChange={(e) => updateField("nama", e.target.value)}
                    placeholder="Contoh: Surat Perintah Tugas"
                    className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-colors ${
                      template.nama.trim() ? "border-emerald-400 bg-emerald-50/30" : "border-rose-300 bg-rose-50/30"
                    }`}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                    Deskripsi
                  </label>
                  <input
                    type="text"
                    value={template.deskripsi}
                    onChange={(e) => updateField("deskripsi", e.target.value)}
                    placeholder="Penjelasan singkat tentang template ini"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>
            </section>

            {/* Section: Dokumen */}
            <section>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Konfigurasi Dokumen
              </h2>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                    Judul Surat <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={template.judul_surat}
                    onChange={(e) => updateField("judul_surat", e.target.value)}
                    placeholder="Contoh: SURAT PERINTAH, SURAT KETERANGAN"
                    className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold uppercase tracking-wide transition-colors ${
                      template.judul_surat.trim() ? "border-emerald-400 bg-emerald-50/30" : "border-rose-300 bg-rose-50/30"
                    }`}
                  />
                </div>

                {/* Toggles */}
                {[
                  { key: "dengan_nomor_surat", label: "Dengan Nomor Surat", desc: "Surat memiliki kolom nomor resmi" },
                  { key: "dengan_penandatangan", label: "Dengan Penandatangan", desc: "Surat memiliki blok tanda tangan" },
                ].map(({ key, label, desc }) => (
                  <div
                    key={key}
                    onClick={() => updateField(key, !template[key])}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      template[key] ? "bg-indigo-50 border-indigo-200" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-sm text-slate-700">{label}</p>
                      <p className="text-xs text-slate-400">{desc}</p>
                    </div>
                    {template[key] ? (
                      <FaToggleOn size={22} className="text-indigo-500 shrink-0" />
                    ) : (
                      <FaToggleOff size={22} className="text-slate-300 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Section: Fields */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Field Isi Surat
                  <span className="ml-2 bg-indigo-100 text-indigo-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {template.fields.length}
                  </span>
                </h2>
              </div>
              <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                Tambah field dan <strong>Separator / Pemisah</strong> (teks tengah) di posisi mana saja. Gunakan ↑↓ untuk mengubah urutan.
              </p>

              {template.fields.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-sm">
                  Belum ada field. Klik tombol di bawah untuk menambahkan.
                </div>
              ) : (
                <div className="flex flex-col gap-2 mb-3">
                  {template.fields.map((f, i) => (
                    <FieldItem
                      key={f.id}
                      field={f}
                      index={i}
                      total={template.fields.length}
                      onMoveUp={() => handleMoveField(i, -1)}
                      onMoveDown={() => handleMoveField(i, 1)}
                      onRemove={() => handleRemoveField(f.id)}
                      onEdit={() => {
                        setEditingFieldId(f.id);
                        setShowFieldPicker(true);
                      }}
                    />
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  setEditingFieldId(null);
                  setShowFieldPicker(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-indigo-200 text-indigo-500 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 font-bold text-sm transition-all"
              >
                <FaPlus size={13} /> Tambah Field
              </button>
            </section>
          </div>

          {/* Left panel footer: validation summary */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
            <div className="flex flex-col gap-1.5">
              {[
                { ok: !!template.nama.trim(), label: "Nama template" },
                { ok: !!template.judul_surat.trim(), label: "Judul surat" },
                { ok: template.fields.length > 0, label: "Minimal 1 field" },
              ].map(({ ok, label }) => (
                <div key={label} className="flex items-center gap-2 text-xs">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${ok ? "bg-emerald-500" : "bg-slate-200"}`}>
                    {ok && <FaCheck size={8} className="text-white" />}
                  </div>
                  <span className={ok ? "text-emerald-700 font-semibold" : "text-slate-400"}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Live Preview */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-200/80 border-b border-slate-300 flex items-center gap-2 shrink-0">
            <FaEye size={13} className="text-slate-500" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Live Preview Dokumen</span>
            <span className="ml-auto text-xs text-slate-400">Preview skematik, bukan tampilan cetak sesungguhnya</span>
          </div>
          <div className="flex-1 overflow-y-auto bg-slate-300/50 p-6">
            <div className="max-w-[600px] mx-auto shadow-xl rounded-sm overflow-hidden min-h-[700px]">
              <LivePreview template={template} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
