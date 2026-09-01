import { useState, useEffect, useRef } from "react";
import { FaPlus, FaTrash, FaPen, FaChevronRight, FaFolder } from "react-icons/fa";

const TYPE_COLORS = {
  "Tahun": "text-indigo-600 bg-indigo-50 border-indigo-200",
  "Program": "text-blue-600 bg-blue-50 border-blue-200",
  "Kegiatan": "text-emerald-600 bg-emerald-50 border-emerald-200",
  "KRO": "text-amber-600 bg-amber-50 border-amber-200",
  "OUTPUT": "text-orange-600 bg-orange-50 border-orange-200",
  "Output": "text-orange-600 bg-orange-50 border-orange-200",
  "KOMPONEN": "text-rose-600 bg-rose-50 border-rose-200",
  "Komponen": "text-rose-600 bg-rose-50 border-rose-200",
  "SUB KOMPONEN": "text-pink-600 bg-pink-50 border-pink-200",
  "Sub Komponen": "text-pink-600 bg-pink-50 border-pink-200",
  "AKUN": "text-purple-600 bg-purple-50 border-purple-200",
  "Akun": "text-purple-600 bg-purple-50 border-purple-200",
  "Seksi": "text-blue-600 bg-blue-50 border-blue-200",
  "Kode surat 1": "text-emerald-600 bg-emerald-50 border-emerald-200",
  "Kode surat 2": "text-amber-600 bg-amber-50 border-amber-200",
  "Kode surat 3": "text-orange-600 bg-orange-50 border-orange-200",
};

export default function ViewColumns({ nodes, hierarchy, onAdd, onDelete, onEdit, focusedPath }) {
  const [selectedPath, setSelectedPath] = useState([]); // array of selected node IDs
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (focusedPath) {
      setSelectedPath(focusedPath);
    }
  }, [focusedPath]);

  // When selectedPath changes, scroll right
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [selectedPath]);

  const handleSelect = (levelIndex, node) => {
    const newPath = selectedPath.slice(0, levelIndex);
    newPath.push(node.id);
    setSelectedPath(newPath);
  };

  // Build the columns to render
  const columns = [];
  
  // First column: Root (Tahun)
  columns.push({
    levelIndex: 0,
    type: hierarchy[0],
    parentId: null,
    items: nodes.filter(n => n.parentId === null)
  });

  // Subsequent columns based on selectedPath
  for (let i = 0; i < selectedPath.length; i++) {
    const parentId = selectedPath[i];
    const levelIndex = i + 1;
    if (levelIndex < hierarchy.length) {
      columns.push({
        levelIndex,
        type: hierarchy[levelIndex],
        parentId: parentId,
        items: nodes.filter(n => n.parentId === parentId)
      });
    }
  }

  return (
    <div 
      ref={scrollContainerRef} className="flex gap-4 overflow-x-auto pb-4 flex-1 h-full min-h-[500px] snap-x p-6 bg-slate-50"
    >
      {columns.map((col) => (
        <Column 
          key={col.levelIndex}
          column={col}
          selectedId={selectedPath[col.levelIndex]}
          onSelect={(node) => handleSelect(col.levelIndex, node)}
          onAdd={onAdd}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}

function Column({ column, selectedId, onSelect, onAdd, onDelete, onEdit }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newKode, setNewKode] = useState("");
  const [newItemName, setNewItemName] = useState("");

  const [editingNodeId, setEditingNodeId] = useState(null);
  const [editKode, setEditKode] = useState("");
  const [editName, setEditName] = useState("");

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    await onAdd(newKode.trim(), newItemName.trim(), column.type, column.parentId);
    setNewKode("");
    setNewItemName("");
    setIsAdding(false);
  };

  const startEditing = (node, e) => {
    e.stopPropagation();
    setEditingNodeId(node.id);
    setEditKode(node.kode || "");
    setEditName(node.name || "");
  };

  const handleEditSubmit = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!editName.trim()) return;
    await onEdit(id, editKode.trim(), editName.trim());
    setEditingNodeId(null);
  };

  return (
    <div className="flex flex-col min-w-[320px] max-w-[320px] bg-white rounded-2xl border border-slate-200 shadow-sm snap-start shrink-0 h-full">
      {/* Column Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
        <h3 className="font-bold text-slate-700">{column.type}</h3>
        <span className="text-xs font-semibold text-slate-400 bg-slate-200 px-2 py-1 rounded-full">
          {column.items.length}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        {column.items.length === 0 ? (
          <div className="text-center p-6 text-sm text-slate-400">
            Kosong. Tambahkan item di bawah.
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {column.items.map(node => {
              const isSelected = selectedId === node.id;
              const typeStyle = TYPE_COLORS[node.type] || "text-slate-600 bg-slate-50 border-slate-200";
              const isEditing = editingNodeId === node.id;
              
              return (
                <div 
                  key={node.id}
                  onClick={() => !isEditing && onSelect(node)}
                  className={`group flex items-start gap-3 p-3 rounded-xl transition-all border ${isEditing ? 'bg-white border-indigo-300 shadow-sm' : isSelected ? 'bg-indigo-50 border-indigo-200 shadow-sm cursor-pointer' : 'border-transparent hover:bg-slate-50 hover:border-slate-200 cursor-pointer'}`}
                >
                  <div className={`p-2 rounded-lg border mt-0.5 ${isSelected && !isEditing ? typeStyle : 'bg-white border-slate-200 text-slate-400'}`}>
                    <FaFolder size={14} />
                  </div>
                  
                  {isEditing ? (
                    <form onSubmit={(e) => handleEditSubmit(e, node.id)} className="flex-1 flex flex-col gap-2 min-w-0" onClick={e => e.stopPropagation()}>
                      {node.type !== "Tahun" && (
                        <input
                          type="text"
                          autoFocus
                          value={editKode}
                          onChange={(e) => setEditKode(e.target.value)}
                          placeholder="Kode"
                          className="w-full p-1.5 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
                        />
                      )}
                      <input
                        type="text"
                        autoFocus={node.type === "Tahun"}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Keterangan..."
                        className="w-full p-1.5 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                      />
                      <div className="flex gap-2 mt-1">
                        <button type="submit" className="flex-1 bg-indigo-600 text-white text-xs py-1.5 rounded-md hover:bg-indigo-700">Simpan</button>
                        <button type="button" onClick={() => setEditingNodeId(null)} className="flex-1 bg-slate-200 text-slate-600 text-xs py-1.5 rounded-md hover:bg-slate-300">Batal</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className={`text-sm ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                          {node.kode ? <strong className="font-bold block text-xs text-slate-500 mb-0.5">{node.kode}</strong> : null}
                          <span className={`font-medium ${node.kode ? 'line-clamp-2' : ''}`}>{node.name}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity self-center">
                        <button
                          onClick={(e) => startEditing(node, e)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-md"
                          title="Edit"
                        >
                          <FaPen size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(node.id);
                          }}
                          className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-100 rounded-md"
                          title="Hapus"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                      
                      {/* Arrow for selection indicator */}
                      {!isSelected && (
                        <FaChevronRight className="text-slate-300 ml-1 opacity-0 group-hover:opacity-100 self-center" size={14} />
                      )}
                      {isSelected && (
                        <FaChevronRight className="text-indigo-500 ml-1 self-center" size={14} />
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
        {isAdding ? (
          <form onSubmit={handleAdd} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                autoFocus
                value={newKode}
                onChange={(e) => setNewKode(e.target.value)}
                placeholder="Kode"
                className="w-1/3 p-2 text-sm border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-bold"
              />
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={`Keterangan ${column.type}...`}
                className="w-2/3 p-2 text-sm border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-indigo-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                Simpan
              </button>
              <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-slate-200 text-slate-600 text-xs font-bold py-2 rounded-lg hover:bg-slate-300 transition-colors">
                Batal
              </button>
            </div>
          </form>
        ) : (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-slate-300 rounded-xl text-sm font-semibold text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
          >
            <FaPlus size={12} /> Tambah {column.type}
          </button>
        )}
      </div>
    </div>
  );
}
