const fs = require('fs');

function updateTemplateBuilder() {
  let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', 'utf8');

  // 1. Add activeParentId state
  if (!code.includes('activeParentId')) {
    code = code.replace('const [editingFieldId, setEditingFieldId] = useState(null);', 'const [editingFieldId, setEditingFieldId] = useState(null);\n  const [activeParentId, setActiveParentId] = useState(null);');
  }

  // 2. Add table_group and table to FIELD_TYPES
  const tableAndGroupCode = `
    {
      type: "table_group",
      label: "Tabel Terstruktur (Grup)",
      description: "Sebuah kontainer tabel yang dapat membungkus field-field lain menjadi baris tabel.",
      icon: FaTable,
      color: "purple",
      preview: (label, def) => (
        <div className="text-center italic text-slate-400 py-4 border-2 border-dashed border-purple-200 bg-purple-50 rounded">
          -- Preview Sub-Field Tabel --
        </div>
      ),
    },
    {
      type: "table",
      label: "Tabel Data Dinamis",
      description: "Tabel dengan tombol Tambah Baris. (Pisahkan nama kolom dengan koma pada Nilai Awal)",
      icon: FaTable,
      color: "cyan",
      preview: (label, def) => {
        const cols = def ? def.split(',').map(c => c.trim()) : ["Kolom 1", "Kolom 2"];
        return (
          <div className="flex flex-col gap-2 text-[14px] w-full">
            <div className="text-slate-700 italic hidden">{label}</div>
            <table className="w-full border-collapse border border-dashed border-cyan-300 text-[11px] text-cyan-700 bg-cyan-50/50">
              <thead><tr>{cols.map((c,i)=><th key={i} className="border-b border-cyan-300 pb-1 px-1 text-left">{c}</th>)}</tr></thead>
              <tbody><tr>{cols.map((_,i)=><td key={i} className="pt-1 px-1"><div className="h-3 bg-cyan-100 rounded w-full"/></td>)}</tr></tbody>
            </table>
          </div>
        );
      },
    },`;
  
  if (!code.includes('type: "table_group"')) {
    code = code.replace(/\{\s*type: "separator",/, tableAndGroupCode + '\n    {\n      type: "separator",');
  }

  // 3. Replace Handlers
  const handlersCode = `  const handleAddField = (field) => {
    setTemplate((prev) => {
      let fields = [...prev.fields];
      let existingIndex = -1;
      let existingParentIndex = -1;

      fields.forEach((f, i) => {
        if (f.id === field.id) existingIndex = i;
        if (f.subFields) {
          const subIdx = f.subFields.findIndex(sub => sub.id === field.id);
          if (subIdx !== -1) { existingIndex = subIdx; existingParentIndex = i; }
        }
      });

      if (existingIndex !== -1) {
        if (existingParentIndex !== -1) {
          const p = { ...fields[existingParentIndex] };
          p.subFields = [...p.subFields];
          p.subFields[existingIndex] = field;
          fields[existingParentIndex] = p;
        } else {
          fields[existingIndex] = field;
        }
      } else {
        if (activeParentId) {
          const pIdx = fields.findIndex(f => f.id === activeParentId);
          if (pIdx !== -1) {
            const p = { ...fields[pIdx] };
            p.subFields = [...(p.subFields || []), field];
            fields[pIdx] = p;
          }
        } else {
          fields.push(field);
        }
      }
      return { ...prev, fields };
    });
  };

  const handleRemoveField = (id) => {
    setTemplate((prev) => {
      const fields = prev.fields.map(f => {
        if (f.subFields) return { ...f, subFields: f.subFields.filter(sub => sub.id !== id) };
        return f;
      }).filter(f => f.id !== id);
      return { ...prev, fields };
    });
  };

  const handleMoveField = (index, direction, parentId = null) => {
    setTemplate((prev) => {
      const fields = [...prev.fields];
      if (parentId) {
        const pIdx = fields.findIndex(f => f.id === parentId);
        if (pIdx !== -1) {
          const p = { ...fields[pIdx] };
          const subs = [...(p.subFields || [])];
          const targetIndex = index + direction;
          if (targetIndex >= 0 && targetIndex < subs.length) {
            [subs[index], subs[targetIndex]] = [subs[targetIndex], subs[index]];
            p.subFields = subs;
            fields[pIdx] = p;
          }
        }
      } else {
        const targetIndex = index + direction;
        if (targetIndex >= 0 && targetIndex < fields.length) {
          [fields[index], fields[targetIndex]] = [fields[targetIndex], fields[index]];
        }
      }
      return { ...prev, fields };
    });
  };

  const handleMoveToTable = (fieldId, targetParentId) => {
    setTemplate((prev) => {
      let fields = [...prev.fields];
      let fieldToMove = null;
      
      const rootIdx = fields.findIndex(f => f.id === fieldId);
      if (rootIdx !== -1) {
        fieldToMove = fields[rootIdx];
        fields.splice(rootIdx, 1);
      }
      if (!fieldToMove) return prev; 

      const pIdx = fields.findIndex(f => f.id === targetParentId);
      if (pIdx !== -1) {
        const p = { ...fields[pIdx] };
        p.subFields = [...(p.subFields || []), fieldToMove];
        fields[pIdx] = p;
      }
      return { ...prev, fields };
    });
  };`;

  const hStart = code.indexOf('const handleAddField =');
  const hEnd = code.indexOf('const handleSave =');
  if (hStart !== -1 && hEnd !== -1) {
    code = code.substring(0, hStart) + handlersCode + '\n\n  ' + code.substring(hEnd);
  }

  // 4. Replace FieldItem
  const fieldItemStart = code.indexOf('function FieldItem({');
  const fieldItemEndStr = 'export default function TemplateBuilder() {';
  const fieldItemEnd = code.indexOf(fieldItemEndStr);
  
  if (fieldItemStart !== -1 && fieldItemEnd !== -1) {
    const newFieldItem = `function FieldItem({ field, index, total, onMoveUp, onMoveDown, onRemove, onEdit, onAddSubField, onMoveToTable, allGroups, isSub = false, parentId = null }) {
    const ft = getTypeInfo(field.type);
    const c = COLOR_CLASSES[ft.color] || COLOR_CLASSES.indigo;
    const Icon = ft.icon || FaFileAlt;
  
    if (field.type === "separator") {
      return (
        <div className="flex items-center gap-2 bg-slate-100 border border-dashed border-slate-300 rounded-xl p-2 group hover:border-slate-400 transition-all">
          <div className="text-slate-300 cursor-grab shrink-0"><FaGripVertical size={14} /></div>
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-slate-200 shrink-0"><FaMinus size={11} className="text-slate-500" /></div>
            <p className="font-bold text-sm text-slate-600 tracking-wider truncate flex-1">{field.label || "— SEPARATOR —"}</p>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><FaPencilAlt size={11} /></button>
            <button onClick={onMoveUp} disabled={index === 0} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><FaArrowUp size={11} /></button>
            <button onClick={onMoveDown} disabled={index === total - 1} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><FaArrowDown size={11} /></button>
            <button onClick={onRemove} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><FaTrash size={11} /></button>
          </div>
        </div>
      );
    }

    if (field.type === "table_group") {
      const subs = field.subFields || [];
      return (
        <div className="flex flex-col gap-2 bg-purple-50/30 border-2 border-purple-200 rounded-xl p-3 shadow-sm group hover:border-purple-300 transition-all mb-3">
          <div className="flex items-center gap-2">
            <div className="text-slate-300 cursor-grab shrink-0"><FaGripVertical size={14} /></div>
            <div className="p-1.5 rounded-lg shrink-0 bg-purple-100"><Icon size={12} className="text-purple-600" /></div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-slate-700 truncate">{field.label}</p>
              <p className="text-[10px] font-semibold text-purple-600">{ft.label} • {subs.length} item</p>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEdit(field.id)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><FaPencilAlt size={11} /></button>
              <button onClick={() => onMoveUp(index)} disabled={index === 0} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><FaArrowUp size={11} /></button>
              <button onClick={() => onMoveDown(index)} disabled={index === total - 1} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><FaArrowDown size={11} /></button>
              <button onClick={() => onRemove(field.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><FaTrash size={11} /></button>
            </div>
          </div>
          <div className="pl-6 pr-2 pt-2 pb-1 border-t border-purple-100 mt-2 flex flex-col gap-2">
            {subs.length === 0 ? (
              <div className="text-xs text-slate-400 italic text-center py-2">Tabel masih kosong</div>
            ) : (
              subs.map((sub, i) => (
                <FieldItem 
                  key={sub.id} field={sub} index={i} total={subs.length}
                  onMoveUp={() => onMoveUp(i, true, field.id)}
                  onMoveDown={() => onMoveDown(i, true, field.id)}
                  onRemove={() => onRemove(sub.id, field.id)}
                  onEdit={() => onEdit(sub.id, field.id)}
                  isSub={true} parentId={field.id}
                />
              ))
            )}
            <button
              onClick={() => onAddSubField(field.id)}
              className="mt-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dashed border-purple-300 text-purple-600 hover:bg-purple-100 text-xs font-bold transition-colors w-full"
            >
              <FaPlus size={10} /> Tambah Field ke Tabel
            </button>
          </div>
        </div>
      );
    }
  
    return (
      <div className={\`flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-3 shadow-sm group hover:border-indigo-200 transition-all \${isSub ? 'scale-[0.98] -mx-1' : ''}\`}>
        <div className="text-slate-300 cursor-grab shrink-0"><FaGripVertical size={14} /></div>
        <div className={\`p-1.5 rounded-lg shrink-0 \${c.bg}\`}><Icon size={12} className={c.text} /></div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-slate-700 truncate">{field.label}</p>
          <div className="flex items-center gap-1">
            <span className={\`text-[10px] font-bold px-1.5 py-0.5 rounded-full \${c.bg} \${c.text}\`}>{ft.label}</span>
            {field.required && <span className="text-[10px] font-bold text-rose-500">*</span>}
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isSub && allGroups && allGroups.length > 0 && (
            <select 
              className="text-[10px] p-1 border rounded bg-slate-50 text-slate-600 outline-none max-w-[80px] cursor-pointer"
              onChange={(e) => {
                if (e.target.value) onMoveToTable(field.id, e.target.value);
                e.target.value = "";
              }}
            >
              <option value="">Pindah ke...</option>
              {allGroups.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
            </select>
          )}
          <button onClick={() => isSub ? onEdit(field.id, parentId) : onEdit(field.id)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><FaPencilAlt size={11} /></button>
          <button onClick={() => isSub ? onMoveUp(index, true, parentId) : onMoveUp(index)} disabled={index === 0} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><FaArrowUp size={11} /></button>
          <button onClick={() => isSub ? onMoveDown(index, true, parentId) : onMoveDown(index)} disabled={index === total - 1} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><FaArrowDown size={11} /></button>
          <button onClick={() => isSub ? onRemove(field.id, parentId) : onRemove(field.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><FaTrash size={11} /></button>
        </div>
      </div>
    );
  }
`;
    code = code.substring(0, fieldItemStart) + newFieldItem + '\n\n' + code.substring(fieldItemEnd);
  }

  // 5. Replace Map logic in Builder UI
  const mapRegex = /<div className="flex flex-col gap-2 mb-3">[\s\S]*?<\/div>\s*\)\}\s*<button/;
  const mapCode = `<div className="flex flex-col gap-2 mb-3">
                    {template.fields.map((f, i) => (
                      <FieldItem
                        key={f.id}
                        field={f}
                        index={i}
                        total={template.fields.length}
                        onMoveUp={(subIndex = i, isSub = false, parentId = null) => {
                          if (isSub) handleMoveField(subIndex, -1, parentId);
                          else handleMoveField(i, -1);
                        }}
                        onMoveDown={(subIndex = i, isSub = false, parentId = null) => {
                          if (isSub) handleMoveField(subIndex, 1, parentId);
                          else handleMoveField(i, 1);
                        }}
                        onRemove={(id = f.id, parentId = null) => handleRemoveField(id)}
                        onEdit={(id = f.id, parentId = null) => {
                          setEditingFieldId(id);
                          setActiveParentId(parentId);
                          setShowFieldPicker(true);
                        }}
                        onAddSubField={(parentId) => {
                          setEditingFieldId(null);
                          setActiveParentId(parentId);
                          setShowFieldPicker(true);
                        }}
                        onMoveToTable={handleMoveToTable}
                        allGroups={template.fields.filter(x => x.type === 'table_group')}
                      />
                    ))}
                  </div>
                )}
  
                <button`;
  code = code.replace(mapRegex, mapCode);

  // 6. Replace Add Field Button Click to clear activeParentId
  code = code.replace(/onClick=\{\(\) => \{\s*setEditingFieldId\(null\);\s*setShowFieldPicker\(true\);\s*\}\}/, 'onClick={() => { setEditingFieldId(null); setActiveParentId(null); setShowFieldPicker(true); }}');

  // 7. Live Preview
  const livePreviewRegex = /\{fields\.map\(\(f\) => \{[\s\S]*?return <div key=\{f\.id\}>\{ft\.preview\(f\.label, f\.defaultValue\)\}<\/div>;\s*\}\)\}/g;
  const livePreviewRender = `{fields.map((f) => {
              if (f.type === "separator") {
                return (
                  <div key={f.id} className="text-center font-bold tracking-widest my-2 text-[12px] text-slate-700">{f.label || "— SEPARATOR —"}</div>
                );
              }
              if (f.type === "table_group") {
                const subs = f.subFields || [];
                return (
                  <div key={f.id} className="w-full">
                    <style>{\`
                      .spd-hide-labels .grid { display: block !important; gap: 0 !important; }
                      .spd-hide-labels .grid > .text-slate-700 { display: none !important; }
                      .spd-hide-labels .grid > .flex > .w-5.text-center.shrink-0 { display: none !important; }
                    \`}</style>
                    <table className="w-full border-collapse border border-slate-800 text-[12px] my-2">
                      <tbody>
                        {subs.length === 0 ? (
                          <tr><td className="border border-slate-800 p-2 text-center text-slate-400 italic">Tabel kosong</td></tr>
                        ) : (
                          subs.map((sub, i) => {
                            if (sub.type === "separator") return null;
                            const st = getTypeInfo(sub.type);
                            return (
                              <tr key={sub.id} className="align-top">
                                <td className="border border-slate-800 p-1.5 w-6 text-center">{i + 1}</td>
                                <td className="border border-slate-800 p-1.5 w-40 font-semibold">{sub.label}</td>
                                <td className="border border-slate-800 p-1.5">
                                  <div className="spd-hide-labels">{st.preview(sub.label, sub.defaultValue)}</div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                );
              }
              const ft = getTypeInfo(f.type);
              return <div key={f.id}>{ft.preview(f.label, f.defaultValue)}</div>;
            })}`;
  code = code.replace(livePreviewRegex, livePreviewRender);

  fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', code);
  console.log("TemplateBuilder rewrite successful.");
}
updateTemplateBuilder();
