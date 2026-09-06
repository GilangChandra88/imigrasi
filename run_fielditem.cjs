const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', 'utf8');

const tableGroupCode = `
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
    },`;

// Inject into FIELD_TYPES (before `type: "table"`)
if (!code.includes('type: "table_group"')) {
  code = code.replace(/\{\s*type: "table",/, tableGroupCode + '\n    {\n      type: "table",');
}

// Inject into PICKER_TYPES if needed. PICKER_TYPES maps FIELD_TYPES so it will auto include it! Wait, PICKER_TYPES filters out `list` etc. Let's check PICKER_TYPES.
// Actually PICKER_TYPES = [ ...FIELD_TYPES.filter(ft => !ft.type.startsWith("pegawai") && !ft.type.startsWith("list") && ft.type !== "separator"), ... ]
// This means table_group will be included!

// Now rewrite FieldItem
const newFieldItem = `function FieldItem({ field, index, total, onMoveUp, onMoveDown, onRemove, onEdit, onAddSubField, onMoveToTable, allGroups, isSub = false, parentId = null }) {
    const ft = getTypeInfo(field.type);
    const c = COLOR_CLASSES[ft.color] || COLOR_CLASSES.indigo;
    const Icon = ft.icon || FaFileAlt;
  
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
              <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><FaPencilAlt size={11} /></button>
              <button onClick={onMoveUp} disabled={index === 0} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><FaArrowUp size={11} /></button>
              <button onClick={onMoveDown} disabled={index === total - 1} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><FaArrowDown size={11} /></button>
              <button onClick={onRemove} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><FaTrash size={11} /></button>
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
              className="text-[10px] p-1 border rounded bg-slate-50 text-slate-600 outline-none max-w-[80px]"
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
  }`;

const oldFieldItemRegex = /function FieldItem\(\{[\s\S]*?\}\) \{\s*const ft = getTypeInfo[\s\S]*?return \([\s\S]*?\}\);\s*\}/;
if (code.match(oldFieldItemRegex)) {
  code = code.replace(oldFieldItemRegex, newFieldItem);
  console.log("FieldItem updated");
} else {
  console.log("Failed to match FieldItem");
}

fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', code);
