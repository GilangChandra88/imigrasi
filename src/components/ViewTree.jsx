import { useState, useRef, useEffect } from "react";
import { FaPlus, FaTrash, FaPen, FaChevronDown, FaChevronRight, FaFolder, FaFolderOpen, FaLayerGroup } from "react-icons/fa";

const TYPE_COLORS = {
  "Tahun": "text-indigo-700 bg-white shadow-sm border-indigo-200",
  "Program": "text-blue-700 bg-white shadow-sm border-blue-200",
  "Kegiatan": "text-emerald-700 bg-white shadow-sm border-emerald-200",
  "KRO": "text-amber-700 bg-white shadow-sm border-amber-200",
  "OUTPUT": "text-orange-700 bg-white shadow-sm border-orange-200",
  "Output": "text-orange-700 bg-white shadow-sm border-orange-200",
  "KOMPONEN": "text-rose-700 bg-white shadow-sm border-rose-200",
  "Komponen": "text-rose-700 bg-white shadow-sm border-rose-200",
  "SUB KOMPONEN": "text-pink-700 bg-white shadow-sm border-pink-200",
  "Sub Komponen": "text-pink-700 bg-white shadow-sm border-pink-200",
  "AKUN": "text-purple-700 bg-white shadow-sm border-purple-200",
  "Akun": "text-purple-700 bg-white shadow-sm border-purple-200",
  "Seksi": "text-blue-700 bg-white shadow-sm border-blue-200",
  "KOP": "text-indigo-700 bg-white shadow-sm border-indigo-200",
  "Kode surat 1": "text-emerald-700 bg-white shadow-sm border-emerald-200",
  "Kode surat 2": "text-amber-700 bg-white shadow-sm border-amber-200",
  "Kode surat 3": "text-orange-700 bg-white shadow-sm border-orange-200",
};

const WRAPPER_COLORS = {
  "Tahun": "bg-indigo-100 border-indigo-300",
  "Program": "bg-blue-100 border-blue-300",
  "Kegiatan": "bg-emerald-100 border-emerald-300",
  "KRO": "bg-amber-100 border-amber-300",
  "Output": "bg-orange-100 border-orange-300",
  "OUTPUT": "bg-orange-100 border-orange-300",
  "Komponen": "bg-rose-100 border-rose-300",
  "KOMPONEN": "bg-rose-100 border-rose-300",
  "Sub Komponen": "bg-pink-100 border-pink-300",
  "SUB KOMPONEN": "bg-pink-100 border-pink-300",
  "Akun": "bg-purple-100 border-purple-300",
  "AKUN": "bg-purple-100 border-purple-300",
  "Seksi": "bg-blue-100 border-blue-300",
  "KOP": "bg-indigo-100 border-indigo-300",
  "Kode surat 1": "bg-emerald-100 border-emerald-300",
  "Kode surat 2": "bg-amber-100 border-amber-300",
  "Kode surat 3": "bg-orange-100 border-orange-300",
};

const MakNode = ({ node, allNodes, levelIndex, onAdd, onDelete, onEdit, hierarchy, focusedPath }) => {
  const [expanded, setExpanded] = useState(true);
  const nodeRef = useRef(null);

  // Auto-scroll and highlight if this node is the target of search
  const isFocused = focusedPath && focusedPath[focusedPath.length - 1] === node.id;
  useEffect(() => {
    if (isFocused && nodeRef.current) {
      setTimeout(() => {
        nodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [isFocused]);
  
  // Adding state
  const [isAdding, setIsAdding] = useState(false);
  const [newKode, setNewKode] = useState("");
  const [newItemName, setNewItemName] = useState("");

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editKode, setEditKode] = useState(node.kode || "");
  const [editName, setEditName] = useState(node.name || "");

  const childType = hierarchy[levelIndex + 1];
  const children = allNodes.filter((n) => n.parentId === node.id);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    await onAdd(newKode.trim(), newItemName.trim(), childType, node.id);
    setNewKode("");
    setNewItemName("");
    setIsAdding(false);
    setExpanded(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    await onEdit(node.id, editKode.trim(), editName.trim());
    setIsEditing(false);
  };

  const typeStyle = TYPE_COLORS[node.type] || "text-slate-700 bg-white shadow-sm border-slate-300";
  const wrapperStyle = WRAPPER_COLORS[node.type] || "bg-slate-100 border-slate-300";
  const bgClass = wrapperStyle.split(' ')[0]; // Extract just the background color class

  return (
    <div ref={nodeRef} className={`mt-3 rounded-2xl border transition-all duration-300 ${wrapperStyle} ${isFocused ? 'ring-4 ring-indigo-400 shadow-lg' : 'shadow-sm'}`}>
      
      {/* Node Header Card - Fixed 3rem height for perfect sticky stacking without overlap */}
      <div 
        className={`flex items-center gap-2 sticky px-2 py-2 transition-all duration-200 group ${bgClass} rounded-t-2xl border-b border-black/10 shadow-sm`}
        style={{ 
          top: `${levelIndex * 3}rem`, 
          height: '3rem', 
          zIndex: 50 - levelIndex 
        }}
      >
        
        {/* Expand/Collapse Button */}
        <div className="flex items-center justify-center w-6 shrink-0">
          {children.length > 0 ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded-full hover:bg-white"
            >
              {expanded ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}
            </button>
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
          )}
        </div>
        
        {/* Icon */}
        <div className={`flex items-center justify-center w-8 h-8 rounded-lg border shrink-0 ${typeStyle}`}>
          {expanded && children.length > 0 ? <FaFolderOpen size={14} /> : <FaFolder size={14} />}
        </div>

        {/* Content or Edit Form */}
        {isEditing ? (
          <form onSubmit={handleEdit} className="flex-1 flex gap-2 items-center mr-2 min-w-0">
            {node.type !== hierarchy[0] && (
              <>
                <input
                  type="text"
                  autoFocus
                  value={editKode}
                  onChange={(e) => setEditKode(e.target.value)}
                  placeholder="Kode"
                  className="w-16 text-xs py-1 px-2 bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                />
                <span className="text-slate-400 font-bold">-</span>
              </>
            )}
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder={`Keterangan...`}
              className="flex-1 min-w-0 text-xs py-1 px-2 bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
            />
            <button type="submit" className="bg-indigo-600 text-white px-2 py-1 rounded-md text-xs font-semibold hover:bg-indigo-700">
              OK
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 p-1 text-xs">
              Batal
            </button>
          </form>
        ) : (
          <div className="flex items-center flex-1 min-w-0 pr-2 gap-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 bg-white/60 px-1.5 py-0.5 rounded shadow-sm border border-black/5 shrink-0">
              {node.type}
            </span>
            <span className="text-sm text-slate-800 truncate">
              {node.kode ? <strong className="font-bold">{node.kode}</strong> : null}
              {node.kode ? " - " : ""}
              <span className="font-medium">{node.name}</span>
            </span>
          </div>
        )}

        {/* Actions */}
        {!isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0 bg-white/50 px-1.5 py-0.5 rounded-lg">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-white transition-colors shadow-sm"
              title="Edit"
            >
              <FaPen size={12} />
            </button>
            {childType && (
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-emerald-600 hover:bg-white transition-colors shadow-sm"
                title={`Tambah ${childType}`}
              >
                <FaPlus size={12} />
              </button>
            )}
            <button
              onClick={() => onDelete(node.id)}
              className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-rose-600 hover:bg-white transition-colors shadow-sm"
              title="Hapus"
            >
              <FaTrash size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Children Container */}
      {expanded && (
        <div className="ml-2 sm:ml-6 mt-1 flex flex-col gap-1 border-l-2 border-white/40 pl-2 sm:pl-4 pb-3 sm:pb-4 pr-3 sm:pr-6">
          {children.length > 0 && children.map((child) => (
            <MakNode
              key={child.id}
              node={child}
              allNodes={allNodes}
              levelIndex={levelIndex + 1}
              onAdd={onAdd}
              onDelete={onDelete}
              onEdit={onEdit}
              hierarchy={hierarchy}
              focusedPath={focusedPath}
            />
          ))}

          {isAdding && (
            <div className="mt-3 rounded-xl border border-indigo-200/60 bg-white/60 p-3 shadow-sm ring-2 ring-indigo-100 backdrop-blur-sm">
              <form onSubmit={handleAdd} className="flex gap-2 items-center">
                <div className="text-indigo-400 mr-1 shrink-0">
                  <FaLayerGroup size={14} />
                </div>
                <input
                  type="text"
                  autoFocus
                  value={newKode}
                  onChange={(e) => setNewKode(e.target.value)}
                  placeholder="Kode"
                  className="w-24 shrink-0 text-sm py-1.5 px-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-bold"
                />
                <span className="text-slate-400 font-bold shrink-0">-</span>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={`Keterangan ${childType}...`}
                  className="flex-1 min-w-0 text-sm py-1.5 px-2 bg-transparent focus:outline-none text-slate-700 placeholder-slate-400 font-medium border-b border-transparent focus:border-indigo-300"
                />
                <div className="flex gap-2 shrink-0 ml-auto pl-2">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-sm transition-all"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-white"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function ViewTree({ nodes, hierarchy, onAdd, onDelete, onEdit, focusedPath }) {
  const [isAddingRoot, setIsAddingRoot] = useState(false);
  const [rootName, setRootName] = useState("");

  const handleAddRoot = async (e) => {
    e.preventDefault();
    if (!rootName.trim()) return;
    await onAdd("", rootName.trim(), hierarchy[0], null);
    setRootName("");
    setIsAddingRoot(false);
  };

  const rootNodes = nodes.filter((n) => n.parentId === null && n.type === hierarchy[0]);

  return (
    <div className="pb-12 pt-4">
      <div className="min-w-full pr-4">
        {rootNodes.map((node) => (
          <div key={node.id} className="mb-8 relative">
            <MakNode
              node={node}
              allNodes={nodes}
              levelIndex={0}
              onAdd={onAdd}
              onDelete={onDelete}
              onEdit={onEdit}
              hierarchy={hierarchy}
              focusedPath={focusedPath}
            />
          </div>
        ))}
        
        {/* Tambah Tahun Button at the bottom */}
        <div className="mt-4 w-full">
          {isAddingRoot ? (
            <form onSubmit={handleAddRoot} className="flex gap-2 items-center bg-white p-3 rounded-xl border border-indigo-200 shadow-sm w-full">
              <div className="text-indigo-400 mr-2 shrink-0">
                <FaFolder size={16} />
              </div>
              <input
                type="text"
                autoFocus
                value={rootName}
                onChange={(e) => setRootName(e.target.value)}
                placeholder={`Tambah ${hierarchy[0]}...`}
                className="w-56 text-sm py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
              <div className="flex gap-2 shrink-0 ml-auto pl-2">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingRoot(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
                >
                  Batal
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingRoot(true)}
              className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-sm font-bold text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
            >
              <FaPlus size={14} /> Tambah {hierarchy[0]}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
