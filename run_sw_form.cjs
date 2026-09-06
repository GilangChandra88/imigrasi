const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', 'utf8');

const fieldFormViewRegex = /if \(field\.type === "textarea" \|\| field\.type === "textarea_full" \|\| field\.type === "text"\) \{/;

const newFieldFormViewCode = `if (field.type === "row_standard") {
    return (
      <div className="flex flex-col gap-2 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
        <label className="text-sm font-bold text-slate-700">{field.label}{field.required && <span className="text-rose-500 ml-1">*</span>}</label>
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setActiveField(field.name)}
          className={getFormClass(valid, isActive)}
          placeholder="Isi data..."
        />
      </div>
    );
  }

  if (field.type === "row_multi") {
    const pts = field.label.split(/[\\n,]+/).map(s => s.trim()).filter(Boolean);
    const vals = Array.isArray(value) ? value : [];
    return (
      <div className="flex flex-col gap-2 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
        <label className="text-sm font-bold text-slate-700">{field.label.replace(/\\n/g, ', ')}{field.required && <span className="text-rose-500 ml-1">*</span>}</label>
        <div className="flex flex-col gap-2 mt-1">
          {pts.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-8 text-sm font-semibold text-slate-500">{p}</span>
              <input
                type="text"
                value={vals[i] || ""}
                onChange={(e) => {
                  const newVals = [...vals];
                  newVals[i] = e.target.value;
                  onChange(newVals);
                }}
                onFocus={() => setActiveField(field.name)}
                className={getFormClass(valid, isActive)}
                placeholder={\`Isi untuk \${p}...\`}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "row_pengikut") {
    const rows = Array.isArray(value) ? value : [[]];
    return (
      <div className="flex flex-col gap-2 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
        <label className="text-sm font-bold text-slate-700">{field.label}{field.required && <span className="text-rose-500 ml-1">*</span>}</label>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-left text-[11px] border-collapse bg-white">
            <thead className="bg-slate-50">
              <tr>
                <th className="border-b border-slate-200 p-2 w-8">No</th>
                <th className="border-b border-slate-200 p-2">Nama</th>
                <th className="border-b border-slate-200 p-2">Tanggal Lahir</th>
                <th className="border-b border-slate-200 p-2">Keterangan</th>
                <th className="border-b border-slate-200 p-2 w-8">X</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-slate-100 last:border-0 group">
                  <td className="p-2 text-slate-400 text-center">{rowIndex + 1}</td>
                  <td className="p-1"><input type="text" value={(row && row[0]) || ""} onChange={(e) => { const newRows = [...rows]; if(!newRows[rowIndex]) newRows[rowIndex] = []; newRows[rowIndex][0] = e.target.value; onChange(newRows); }} className="w-full p-1 border rounded text-xs" /></td>
                  <td className="p-1"><input type="text" value={(row && row[1]) || ""} onChange={(e) => { const newRows = [...rows]; if(!newRows[rowIndex]) newRows[rowIndex] = []; newRows[rowIndex][1] = e.target.value; onChange(newRows); }} className="w-full p-1 border rounded text-xs" /></td>
                  <td className="p-1"><input type="text" value={(row && row[2]) || ""} onChange={(e) => { const newRows = [...rows]; if(!newRows[rowIndex]) newRows[rowIndex] = []; newRows[rowIndex][2] = e.target.value; onChange(newRows); }} className="w-full p-1 border rounded text-xs" /></td>
                  <td className="p-1 text-center"><button type="button" onClick={() => { const newRows = rows.filter((_, i) => i !== rowIndex); onChange(newRows.length > 0 ? newRows : [[]]); }} className="text-slate-300 hover:text-rose-500"><FaTrash size={10}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-2 bg-slate-50 border-t border-slate-100">
            <button type="button" onClick={() => onChange([...rows, ["", "", ""]])} className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              <FaPlus size={9}/> Tambah Pengikut
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (field.type === "textarea" || field.type === "textarea_full" || field.type === "text") {`;

code = code.replace(fieldFormViewRegex, newFieldFormViewCode);
fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', code);
console.log('FieldFormView updated');
