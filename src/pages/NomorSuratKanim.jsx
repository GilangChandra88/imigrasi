import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, query, deleteDoc, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { FaPlus, FaFolderOpen, FaSitemap, FaFolder, FaColumns } from "react-icons/fa";

import ViewTree from "../components/ViewTree";
import ViewExplorer from "../components/ViewExplorer";
import ViewColumns from "../components/ViewColumns";

const HIERARCHY = [
  "KOP",
  "Kode surat 1",
  "Kode surat 2",
  "Kode surat 3"
];

export default function NomorSuratKanim() {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('tree'); // 'tree', 'explorer', 'columns'
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedPath, setFocusedPath] = useState(null);

  const makCollection = collection(db, "nomor surat kanim");

  useEffect(() => {
    const q = query(makCollection);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNodes(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching data realtime:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddNode = async (kode, name, type, parentId) => {
    try {
      await addDoc(makCollection, {
        kode: kode || "",
        name,
        type,
        parentId,
        createdAt: new Date().toISOString(),
      });
      // Realtime listener will handle state update
    } catch (error) {
      console.error("Error adding node:", error);
    }
  };

  const handleDeleteNode = async (id) => {
    if (!window.confirm("Yakin ingin menghapus item ini beserta seluruh isinya?")) return;
    
    // Recursive delete function to get all children
    const getChildrenIds = (parentId, allNodes) => {
      const children = allNodes.filter(n => n.parentId === parentId);
      let ids = children.map(c => c.id);
      children.forEach(c => {
        ids = [...ids, ...getChildrenIds(c.id, allNodes)];
      });
      return ids;
    };

    const idsToDelete = [id, ...getChildrenIds(id, nodes)];

    try {
      for (const nodeId of idsToDelete) {
        await deleteDoc(doc(db, "nomor surat kanim", nodeId));
      }
      // Realtime listener will handle state update
    } catch (error) {
      console.error("Error deleting nodes:", error);
    }
  };

  const handleEditNode = async (id, kode, name) => {
    try {
      await updateDoc(doc(db, "nomor surat kanim", id), { kode, name });
      // Realtime listener will handle state update
    } catch (error) {
      console.error("Error editing node:", error);
    }
  };

  const handleSearchResultClick = (clickedNode) => {
    const path = [];
    let current = clickedNode;
    while (current) {
      path.unshift(current.id);
      current = nodes.find(n => n.id === current.parentId);
    }
    setFocusedPath(path);
    setSearchQuery("");
  };

  const rootNodes = nodes.filter((n) => n.parentId === null && n.type === "Tahun");

  const filteredNodes = searchQuery.trim() 
    ? nodes.filter(n => 
        (n.name && n.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (n.kode && n.kode.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : nodes;

  return (
    <div className="w-full bg-white min-h-screen font-sans flex flex-col">
      {/* Header Section */}
      <div className="px-6 py-4 border-b border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-1 tracking-tight">Nomor Surat Kanim</h1>
          <p className="text-slate-500 font-medium text-sm">
            {HIERARCHY.join(' ➔ ')}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full xl:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input 
              type="text"
              placeholder="Cari kode / keterangan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
            <button 
              onClick={() => setViewMode('tree')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'tree' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <FaSitemap /> Pohon
            </button>
            <button 
              onClick={() => setViewMode('explorer')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'explorer' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <FaFolder /> Explorer
            </button>
            <button 
              onClick={() => setViewMode('columns')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'columns' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <FaColumns /> Kolom
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 bg-slate-50 flex flex-col min-h-0">
        {loading ? (
          <div className="text-center py-16 flex flex-col items-center justify-center gap-4 flex-1">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium animate-pulse">Memuat struktur data...</p>
          </div>
        ) : searchQuery.trim() ? (
          <div className="flex-1 p-6 overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Hasil Pencarian ({filteredNodes.length})</h2>
            {filteredNodes.length === 0 ? (
              <div className="text-center p-12 text-slate-500">Tidak ada data yang cocok dengan pencarian Anda.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredNodes.map(node => (
                  <div 
                    key={node.id} 
                    onClick={() => handleSearchResultClick(node)}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">{node.type}</span>
                    </div>
                    <div className="text-sm text-slate-800 mt-1">
                      {node.kode ? <strong className="font-bold block text-slate-600 mb-1">{node.kode}</strong> : null}
                      <span className="font-medium leading-relaxed">{node.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 relative">
            {viewMode === 'tree' && (
              <div className="px-6 pb-6 flex-1 overflow-auto">
                <ViewTree nodes={nodes} hierarchy={HIERARCHY} onAdd={handleAddNode} onDelete={handleDeleteNode} onEdit={handleEditNode} focusedPath={focusedPath} />
              </div>
            )}
            {viewMode === 'explorer' && (
              <div className="flex-1 flex flex-col min-h-0">
                <ViewExplorer nodes={nodes} hierarchy={HIERARCHY} onAdd={handleAddNode} onDelete={handleDeleteNode} onEdit={handleEditNode} focusedPath={focusedPath} />
              </div>
            )}
            {viewMode === 'columns' && (
              <div className="flex-1 flex flex-col min-h-0">
                <ViewColumns nodes={nodes} hierarchy={HIERARCHY} onAdd={handleAddNode} onDelete={handleDeleteNode} onEdit={handleEditNode} focusedPath={focusedPath} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
