import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  FaPlus, FaEdit, FaTrash, FaFileAlt, FaPlay,
  FaSearch, FaClock, FaLayerGroup, FaChevronRight
} from "react-icons/fa";

const FIELD_TYPE_LABELS = {
  textarea: "Teks Panjang",
  textarea_full: "Teks Panjang (Penuh)",
  text: "Teks Pendek",
  date: "Tanggal",
  list: "Daftar Bernomor",
  list_full: "Daftar Bernomor (Penuh)",
  pegawai_single: "Pegawai (Tunggal)",
  pegawai_detail: "Pegawai (Detail Penuh)",
  pegawai_multi: "Pegawai (Banyak)",
  separator: "Separator / Pemisah",
};

const FIELD_TYPE_COLORS = {
  textarea: "bg-violet-100 text-violet-700",
  textarea_full: "bg-fuchsia-100 text-fuchsia-700",
  text: "bg-sky-100 text-sky-700",
  date: "bg-amber-100 text-amber-700",
  list: "bg-emerald-100 text-emerald-700",
  list_full: "bg-teal-100 text-teal-700",
  pegawai_single: "bg-indigo-100 text-indigo-700",
  pegawai_detail: "bg-blue-100 text-blue-700",
  pegawai_multi: "bg-rose-100 text-rose-700",
  separator: "bg-slate-200 text-slate-600",
};

function TemplateCard({ template, onUse, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(template.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group flex flex-col overflow-hidden">
      {/* Card Header */}
      <div className="p-5 pb-4 flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-500 group-hover:bg-indigo-100 transition-colors shrink-0">
            <FaFileAlt size={18} />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded-lg">
            {template.fields?.length || 0} Field
          </span>
        </div>

        <h3 className="font-bold text-slate-800 text-base leading-tight mb-1">
          {template.nama}
        </h3>
        {template.deskripsi && (
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
            {template.deskripsi}
          </p>
        )}

        {/* Field Tags */}
        {template.fields && template.fields.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {template.fields.slice(0, 4).map((f) => (
              <span
                key={f.id}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${FIELD_TYPE_COLORS[f.type] || "bg-slate-100 text-slate-600"}`}
              >
                {f.label}
              </span>
            ))}
            {template.fields.length > 4 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                +{template.fields.length - 4} lainnya
              </span>
            )}
          </div>
        )}

        {/* Meta info */}
        <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
          {template.dengan_nomor_surat && (
            <span className="flex items-center gap-1">
              <FaLayerGroup size={10} /> Nomor Surat
            </span>
          )}
          {template.createdAt && (
            <span className="flex items-center gap-1">
              <FaClock size={10} />
              {new Date(template.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          )}
        </div>
      </div>

      {/* Card Actions */}
      <div className="px-4 pb-4 pt-3 border-t border-slate-100 flex gap-2">
        <button
          onClick={() => onUse(template.id)}
          className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-2 px-3 rounded-xl transition-colors"
        >
          <FaPlay size={11} /> Gunakan
        </button>
        <button
          onClick={() => onEdit(template.id)}
          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-xl transition-colors"
          title="Edit Template"
        >
          <FaEdit size={14} />
        </button>
        <button
          onClick={handleDelete}
          className={`p-2 border rounded-xl transition-colors ${confirmDelete ? "text-white bg-rose-500 border-rose-500" : "text-slate-400 hover:text-rose-500 hover:bg-rose-50 border-slate-200"}`}
          title={confirmDelete ? "Klik lagi untuk konfirmasi hapus" : "Hapus Template"}
        >
          <FaTrash size={14} />
        </button>
      </div>
    </div>
  );
}

export default function SuratEditor() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "surat_templates"), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Sort by createdAt desc
      data.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setTemplates(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "surat_templates", id));
    } catch (e) {
      console.error("Error deleting template:", e);
      alert("Gagal menghapus template.");
    }
  };

  const filtered = templates.filter(
    (t) =>
      t.nama?.toLowerCase().includes(search.toLowerCase()) ||
      t.deskripsi?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 bg-white shadow-sm z-10 shrink-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Surat Editor
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Kelola template surat dan buat surat baru dari template
            </p>
          </div>
          <button
            onClick={() => navigate("/surat-editor/builder")}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm transition-colors"
          >
            <FaPlus size={14} />
            Buat Template Baru
          </button>
        </div>

        {/* Search */}
        <div className="mt-4 relative max-w-sm">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
          <input
            type="text"
            placeholder="Cari template..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-slate-400">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium">Memuat template...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-sm">
              <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaFileAlt size={36} className="text-indigo-300" />
              </div>
              <h2 className="text-xl font-bold text-slate-700 mb-2">
                {search ? "Template tidak ditemukan" : "Belum ada template"}
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                {search
                  ? `Tidak ada template yang cocok dengan "${search}"`
                  : "Mulai dengan membuat template surat pertama Anda secara interaktif."}
              </p>
              {!search && (
                <button
                  onClick={() => navigate("/surat-editor/builder")}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm transition-colors mx-auto"
                >
                  <FaPlus size={14} />
                  Buat Template Pertama
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Stats bar */}
            <div className="flex items-center gap-2 mb-5 text-sm text-slate-500">
              <FaLayerGroup size={13} className="text-indigo-400" />
              <span>
                <strong className="text-slate-700">{filtered.length}</strong> template tersedia
              </span>
              {search && (
                <span className="text-slate-400">
                  (dari {templates.length} total)
                </span>
              )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Add new card */}
              <button
                onClick={() => navigate("/surat-editor/builder")}
                className="border-2 border-dashed border-indigo-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-indigo-400 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all group min-h-[180px]"
              >
                <div className="p-3 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
                  <FaPlus size={20} />
                </div>
                <span className="font-bold text-sm">Buat Template Baru</span>
              </button>

              {/* Template cards */}
              {filtered.map((t) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  onUse={(id) => navigate(`/surat-editor/tulis/${id}`)}
                  onEdit={(id) => navigate(`/surat-editor/builder/${id}`)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
