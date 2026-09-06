import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactFlow, { 
  Background, Controls, MarkerType, applyNodeChanges, Handle, Position,
  getBezierPath, EdgeLabelRenderer, addEdge 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, updateDoc, doc, deleteField } from 'firebase/firestore';
import { FaFileAlt, FaClock, FaKey, FaCog, FaTimes } from 'react-icons/fa';

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div className="flex flex-col items-center gap-1">
            {data?.hasTraffic && (
              <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                {data.trafficCount} Menunggu
              </span>
            )}
            <button
              onClick={() => data?.onConfigClick(id, data.source, data.target)}
              className="bg-white hover:bg-slate-50 border border-slate-300 shadow-sm text-slate-600 rounded-full p-1.5 transition-colors group"
              title="Konfigurasi Alur Kerja"
            >
              <FaCog size={14} className="group-hover:text-indigo-600 transition-colors" />
            </button>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

const CustomNode = ({ data }) => {
  return (
    <div className="bg-white border border-slate-400 shadow-md rounded-lg overflow-hidden w-[260px] font-sans">
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!bg-slate-500 border-2 border-white cursor-pointer hover:!bg-indigo-500 transition-colors shadow-sm"
        style={{ width: '80px', height: '14px', borderRadius: '10px' }}
      />
      
      {/* Header ala phpMyAdmin Designer */}
      <div className="bg-[#4d6b8a] text-white px-3 py-2 border-b border-slate-400 flex items-center gap-2">
        <FaFileAlt size={12} className="text-blue-100 opacity-80" />
        <span className="font-bold text-sm truncate tracking-wide">{data.nama}</span>
      </div>
      
      {/* Table Fields (Rows) */}
      <div className="bg-white flex flex-col">
        {data.fields && data.fields.length > 0 ? (
          data.fields.map((f, i) => (
            <div key={f.id} className={`flex justify-between items-center px-3 py-1.5 text-xs hover:bg-slate-50 ${i !== data.fields.length - 1 ? 'border-b border-slate-200' : ''}`}>
              <div className="flex items-center gap-2 overflow-hidden">
                {f.id === data.triggerFieldId ? (
                   <FaKey size={10} className="text-[#d4af37] shrink-0" title="Trigger Field (Primary)" />
                ) : (
                   <span className="w-[10px] shrink-0"></span>
                )}
                <span className="font-semibold text-slate-700 truncate" title={f.label}>{f.label}</span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest shrink-0 ml-2">{f.type.replace('_', ' ')}</span>
            </div>
          ))
        ) : (
          <div className="px-3 py-2 text-xs text-slate-400 italic">Tidak ada kolom</div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-100 px-3 py-2 border-t border-slate-300 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5">
          <FaClock size={10} className={data.pendingTasks > 0 ? 'text-amber-500' : 'text-slate-400'} />
          Tugas Menunggu:
        </span>
        <span className={`text-xs font-black ${data.pendingTasks > 0 ? 'text-amber-600' : 'text-slate-500'}`}>
          {data.pendingTasks || 0}
        </span>
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!bg-slate-500 border-2 border-white cursor-pointer hover:!bg-indigo-500 transition-colors shadow-sm" 
        style={{ width: '80px', height: '14px', borderRadius: '10px' }}
      />
    </div>
  );
};

const nodeTypes = { custom: CustomNode };
const edgeTypes = { customEdge: CustomEdge };

export default function WorkflowMap({ templates }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  
  // Modal State
  const [configModal, setConfigModal] = useState({ isOpen: false, source: null, target: null });
  const [configData, setConfigData] = useState({ triggerFieldId: '', mappings: {} });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'document_tasks'), where('status', '==', 'pending'));
    const unsub = onSnapshot(q, (snap) => {
      setPendingTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const openConfig = useCallback((edgeId, sourceId, targetId) => {
    const sourceTpl = templates.find(t => t.id === sourceId);
    if (sourceTpl && sourceTpl.workflow && sourceTpl.workflow.targetTemplateId === targetId) {
      setConfigData({
        triggerFieldId: sourceTpl.workflow.triggerFieldId || '',
        mappings: sourceTpl.workflow.mappings || {}
      });
    } else {
      setConfigData({ triggerFieldId: '', mappings: {} });
    }
    setConfigModal({ isOpen: true, source: sourceId, target: targetId });
  }, [templates]);

  useEffect(() => {
    if (!templates.length) return;

    // Build Nodes
    const newNodes = templates.map((t, index) => {
      const taskCount = pendingTasks.filter(task => task.targetTemplateId === t.id).length;
      return {
        id: t.id,
        type: 'custom',
        data: { 
          nama: t.nama || t.judul_surat, 
          pendingTasks: taskCount, 
          fields: t.fields || [],
          triggerFieldId: t.workflow?.triggerFieldId
        },
        position: { x: 250 + (index % 3) * 350, y: 100 + Math.floor(index / 3) * 200 }
      };
    });

    // Build Edges
    const newEdges = [];
    templates.forEach(t => {
      if (t.workflow && t.workflow.targetTemplateId) {
        const trafficCount = pendingTasks.filter(task => task.sourceDokumenNama === t.nama && task.targetTemplateId === t.workflow.targetTemplateId).length;
        const hasTraffic = trafficCount > 0;

        newEdges.push({
          id: `e-${t.id}-${t.workflow.targetTemplateId}`,
          source: t.id,
          target: t.workflow.targetTemplateId,
          type: 'customEdge',
          animated: hasTraffic,
          style: { stroke: hasTraffic ? '#f59e0b' : '#64748b', strokeWidth: hasTraffic ? 3 : 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: hasTraffic ? '#f59e0b' : '#64748b',
          },
          data: {
            hasTraffic,
            trafficCount,
            source: t.id,
            target: t.workflow.targetTemplateId,
            onConfigClick: openConfig
          }
        });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [templates, pendingTasks, openConfig]);

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  
  const onConnect = useCallback((params) => {
    // Attempting to connect source and target
    if (params.source === params.target) {
      alert("Tidak bisa menghubungkan ke template yang sama.");
      return;
    }
    const sourceTpl = templates.find(t => t.id === params.source);
    if (sourceTpl.workflow && sourceTpl.workflow.targetTemplateId && sourceTpl.workflow.targetTemplateId !== params.target) {
      if (!confirm("Template ini sudah memiliki alur ke template lain. Ganti?")) return;
    }
    openConfig(`e-${params.source}-${params.target}`, params.source, params.target);
  }, [templates, openConfig]);

  const sourceTemplate = templates.find(t => t.id === configModal.source);
  const targetTemplate = templates.find(t => t.id === configModal.target);

  const handleSaveConfig = async () => {
    if (!configData.triggerFieldId) {
      alert("Pilih Trigger Field (Pemicu Pecah Tugas)!");
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, 'surat_templates', configModal.source), {
        workflow: {
          targetTemplateId: configModal.target,
          triggerFieldId: configData.triggerFieldId,
          mappings: configData.mappings
        }
      });
      setConfigModal({ isOpen: false, source: null, target: null });
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan alur kerja.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveConfig = async () => {
    if (!confirm("Hapus hubungan alur kerja ini?")) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'surat_templates', configModal.source), {
        workflow: deleteField()
      });
      setConfigModal({ isOpen: false, source: null, target: null });
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus alur kerja.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#f3f4f6] relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#cbd5e1" gap={20} size={1.5} />
        <Controls />
      </ReactFlow>

      {/* Configuration Modal */}
      {configModal.isOpen && sourceTemplate && targetTemplate && (
        <div className="absolute inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <FaCog className="text-indigo-500" />
                  Konfigurasi Alur Kerja (Fan-Out)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Meneruskan data dari <strong className="text-indigo-600">{sourceTemplate.nama}</strong> ke <strong className="text-emerald-600">{targetTemplate.nama}</strong>
                </p>
              </div>
              <button onClick={() => setConfigModal({ isOpen: false, source: null, target: null })} className="text-slate-400 hover:text-slate-600 p-2">
                <FaTimes size={16} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Trigger Field */}
              <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100">
                <label className="block text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
                  <FaKey className="text-amber-500" /> Field Pemicu (Trigger Penciptaan Tugas)
                </label>
                <p className="text-xs text-indigo-700/70 mb-3 leading-relaxed">
                  Pilih field Pegawai di Template Induk. Jika Anda mengisi 5 pegawai di field ini, sistem akan otomatis mencetak 5 tugas (dokumen) terpisah ke Kotak Masuk tiap-tiap pegawai tersebut.
                </p>
                <select
                  value={configData.triggerFieldId}
                  onChange={e => setConfigData({ ...configData, triggerFieldId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-indigo-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Pilih Field Pegawai --</option>
                  {sourceTemplate.fields?.filter(f => f.type.includes('pegawai')).map(f => (
                    <option key={f.id} value={f.id}>{f.label} ({f.type})</option>
                  ))}
                </select>
              </div>

              {/* Data Mapping */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3">Pemetaan Data (Otomatis Terisi)</h4>
                <p className="text-xs text-slate-500 mb-4">
                  Pilih data mana dari {sourceTemplate.nama} yang akan otomatis disalin dan diturunkan ke field {targetTemplate.nama}.
                </p>
                <div className="space-y-3">
                  {targetTemplate.fields?.map(tField => (
                    <div key={tField.id} className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 truncate">
                        {tField.label} <span className="text-[10px] text-slate-400 uppercase">({tField.type})</span>
                      </div>
                      <span className="text-slate-300 font-bold">?</span>
                      <select
                        value={configData.mappings[tField.id] || ""}
                        onChange={e => setConfigData({
                          ...configData,
                          mappings: { ...configData.mappings, [tField.id]: e.target.value }
                        })}
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">-- Kosong (Diisi manual oleh pegawai) --</option>
                        <option value="_nomor_surat_induk">[Auto] Nomor Surat Induk</option>
                        <option value="_pegawai_ditugaskan">[Auto] Nama Pegawai yang sedang login</option>
                        {sourceTemplate.fields?.map(sField => (
                          <option key={sField.id} value={sField.id}>{sField.label} ({sField.type})</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <button 
                onClick={handleRemoveConfig}
                disabled={saving || !sourceTemplate.workflow || sourceTemplate.workflow.targetTemplateId !== configModal.target}
                className="text-rose-500 hover:text-rose-600 font-bold text-sm px-4 py-2 disabled:opacity-50"
              >
                Hapus Relasi
              </button>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfigModal({ isOpen: false, source: null, target: null })}
                  className="px-5 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSaveConfig}
                  disabled={saving}
                  className="px-6 py-2 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Alur Kerja'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
