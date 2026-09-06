const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', 'utf8');

// 1. isFieldValid
const validCode = `
  if (field.type === "table") {
    return Array.isArray(value) && value.length > 0 && value.every(row => Array.isArray(row) && row.some(cell => cell && typeof cell === 'string' && cell.trim() !== ""));
  }`;
code = code.replace(/if \(!field\.required\) return true;/, `if (!field.required) return true;${validCode}`);

// 2. FieldFormView for table and text
const formCode = `
  if (field.type === "table") {
    const rows = Array.isArray(value) ? value : [[]];
    const cols = field.defaultValue ? String(field.defaultValue).split(',').map(c=>c.trim()) : ["Kolom 1"];
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-600">{field.label}{field.required && <span className="text-rose-500 ml-1">*</span>}</label>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-left text-[11px] border-collapse bg-white">
            <thead className="bg-slate-50">
              <tr>
                <th className="border-b border-slate-200 p-2 font-semibold text-slate-600 w-8">No</th>
                {cols.map((c, i) => (
                  <th key={i} className="border-b border-slate-200 p-2 font-semibold text-slate-600">{c}</th>
                ))}
                <th className="border-b border-slate-200 p-2 font-semibold text-slate-600 w-8">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-slate-100 last:border-0 group">
                  <td className="p-2 text-slate-400 text-center">{rowIndex + 1}</td>
                  {cols.map((_, colIndex) => (
                    <td key={colIndex} className="p-1">
                      <input 
                        type="text" 
                        value={(row && row[colIndex]) || ""}
                        onChange={(e) => {
                          const newRows = [...rows];
                          if(!newRows[rowIndex]) newRows[rowIndex] = [];
                          newRows[rowIndex][colIndex] = e.target.value;
                          onChange(newRows);
                        }}
                        className="w-full p-1.5 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Ketik..."
                      />
                    </td>
                  ))}
                  <td className="p-1 text-center">
                    <button type="button" onClick={() => {
                      const newRows = rows.filter((_, i) => i !== rowIndex);
                      onChange(newRows.length > 0 ? newRows : [[]]);
                    }} className="p-1 text-slate-300 hover:text-rose-500 rounded"><FaTrash size={10}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-2 bg-slate-50 border-t border-slate-100">
            <button type="button" onClick={() => onChange([...rows, cols.map(()=>"")])} className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              <FaPlus size={9}/> Tambah Baris
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (field.type === "textarea" || field.type === "textarea_full" || field.type === "text") {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-600">{field.label}{field.required && <span className="text-rose-500 ml-1">*</span>}</label>
        <RichTextEditor
          value={value || ""}
          onChange={onChange}
          onFocus={() => setActiveField(field.name)}
          className={getFormClass(valid, isActive)}
          rows={field.type === "text" ? 1 : 3}
        />
        {/* Sugesti logic... Wait, SuratWriter.jsx already has this for textarea, I should just modify the if statement! */}`;

// Wait, SuratWriter.jsx already has textarea logic, let's just replace the if condition!
code = code.replace(/if \(field\.type === "textarea" \|\| field\.type === "textarea_full"\) \{/, `if (field.type === "table") {
    const rows = Array.isArray(value) ? value : [[]];
    const cols = field.defaultValue ? String(field.defaultValue).split(',').map(c=>c.trim()) : ["Kolom 1"];
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-600">{field.label}{field.required && <span className="text-rose-500 ml-1">*</span>}</label>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-left text-[11px] border-collapse bg-white">
            <thead className="bg-slate-50">
              <tr>
                <th className="border-b border-slate-200 p-2 font-semibold text-slate-600 w-8">No</th>
                {cols.map((c, i) => (
                  <th key={i} className="border-b border-slate-200 p-2 font-semibold text-slate-600">{c}</th>
                ))}
                <th className="border-b border-slate-200 p-2 font-semibold text-slate-600 w-8 text-center">X</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-slate-100 last:border-0 group">
                  <td className="p-2 text-slate-400 text-center">{rowIndex + 1}</td>
                  {cols.map((_, colIndex) => (
                    <td key={colIndex} className="p-1">
                      <input 
                        type="text" 
                        value={(row && row[colIndex]) || ""}
                        onChange={(e) => {
                          const newRows = [...rows];
                          if(!newRows[rowIndex]) newRows[rowIndex] = [];
                          newRows[rowIndex][colIndex] = e.target.value;
                          onChange(newRows);
                        }}
                        className="w-full p-1.5 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Ketik..."
                      />
                    </td>
                  ))}
                  <td className="p-1 text-center">
                    <button type="button" onClick={() => {
                      const newRows = rows.filter((_, i) => i !== rowIndex);
                      onChange(newRows.length > 0 ? newRows : [[]]);
                    }} className="p-1 text-slate-300 hover:text-rose-500 rounded"><FaTrash size={10}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-2 bg-slate-50 border-t border-slate-100">
            <button type="button" onClick={() => onChange([...rows, cols.map(()=>"")])} className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              <FaPlus size={9}/> Tambah Baris
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (field.type === "textarea" || field.type === "textarea_full" || field.type === "text") {`);
  
// Replace rows=3 with rows={field.type==="text"?1:3}
code = code.replace(/<RichTextEditor[\s\S]*?className=\{getFormClass\(valid, isActive\)\}\s*\/>/, `<RichTextEditor
          value={value || ""}
          onChange={onChange}
          onFocus={() => setActiveField(field.name)}
          className={getFormClass(valid, isActive)}
          rows={field.type === "text" ? 1 : 3}
        />`);

// 3. FieldDocView for table and text
code = code.replace(/if \(field\.type === "textarea"\) \{/, `if (field.type === "text") {
    return (
      <div className="spd-grid grid grid-cols-[110px_1fr] gap-2 mb-2">
        <div className="spd-label font-semibold pt-1 cursor-pointer" onClick={() => setActiveField(field.name)}>{field.label}</div>
        <div className="relative flex flex-col gap-1">
          <div className="flex group">
            <span className="spd-colon w-5 shrink-0 pt-1 text-center">:</span>
            <div className="flex-1 whitespace-pre-wrap leading-relaxed py-1 print:py-0 text-justify" dangerouslySetInnerHTML={{ __html: value || "" }} />
          </div>
        </div>
      </div>
    );
  }

  if (field.type === "table") {
    const rows = Array.isArray(value) ? value : [[]];
    const cols = field.defaultValue ? String(field.defaultValue).split(',').map(c=>c.trim()) : ["Kolom 1"];
    return (
      <div className="spd-grid grid grid-cols-[110px_1fr] gap-2 mb-2">
        <div className="spd-label font-semibold pt-1 cursor-pointer" onClick={() => setActiveField(field.name)}>{field.label}</div>
        <div className="relative flex flex-col gap-1 w-full overflow-hidden">
          <div className="flex group w-full">
            <span className="spd-colon w-5 shrink-0 pt-1 text-center">:</span>
            <table className="w-full border-collapse border border-slate-800 text-[13px] leading-snug">
              <thead>
                <tr>
                  <th className="border border-slate-800 p-1 w-6 text-center">No</th>
                  {cols.map((c, i) => (
                    <th key={i} className="border border-slate-800 p-1 text-left">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="border border-slate-800 p-1 text-center">{rowIndex + 1}</td>
                    {cols.map((_, colIndex) => (
                      <td key={colIndex} className="border border-slate-800 p-1">{(row && row[colIndex]) || ""}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (field.type === "textarea") {`);

fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', code);
console.log('Table and Text injected safely to SuratWriter.jsx');
