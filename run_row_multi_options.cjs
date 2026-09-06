const fs = require('fs');

// ============================================
// 1. UPDATE TemplateBuilder.jsx
// ============================================
let tbCode = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', 'utf8');

// Update FieldPickerModal state & handleConfirm
const confirmOld = `const handleConfirm = () => {
      if (!label.trim()) return;
      const isSeparator = selectedType.type === "separator";
      const generatedName = label.trim().toLowerCase().replace(/\\s+/g, "_").replace(/[^a-z0-9_]/g, "");
      const name = isSeparator ? \`separator_\${Date.now()}\` : generatedName;
      
      onSelect({
        id: editingField ? editingField.id : \`f_\${Date.now()}\`,
        type: selectedType.type,
        label: label.trim(),
        name: editingField ? editingField.name : (name || selectedType.type),
        required: isSeparator ? false : required,
        defaultValue: defaultValue.trim(),
      });
      onClose();
    };`;

const confirmNew = `const [options, setOptions] = useState(editingField?.options || ["Opsi 1", "Opsi 2"]);

    const handleConfirm = () => {
      const isMulti = selectedType.type === "row_multi";
      if (!isMulti && !label.trim()) return;
      
      const isSeparator = selectedType.type === "separator";
      const generatedName = label.trim() ? label.trim().toLowerCase().replace(/\\s+/g, "_").replace(/[^a-z0-9_]/g, "") : \`multi_\${Date.now()}\`;
      const name = isSeparator ? \`separator_\${Date.now()}\` : generatedName;
      
      onSelect({
        id: editingField ? editingField.id : \`f_\${Date.now()}\`,
        type: selectedType.type,
        label: label.trim(),
        name: editingField ? editingField.name : (name || selectedType.type),
        required: isSeparator ? false : required,
        defaultValue: defaultValue.trim(),
        ...(isMulti && { options: options.map(o => o.trim()).filter(Boolean) })
      });
      onClose();
    };`;
tbCode = tbCode.replace(confirmOld, confirmNew);

// Update Label Input Area
const labelAreaRegex = /\{\/\* Label input \*\/\}([\s\S]*?)<p className="text-xs text-slate-400">[\s\S]*?<\/p>\s*<\/div>/;
const newLabelArea = `{/* Label & Options Input */}
              {selectedType.type === "row_multi" ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700">Judul Baris (Opsional)</label>
                    <input
                      type="text"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder="Contoh: Pembebanan Anggaran"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700">Opsi Beranak (a, b, c)</label>
                    {options.map((opt, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <span className="w-6 text-sm font-bold text-slate-400">{String.fromCharCode(97 + idx)}.</span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => { const newOpts = [...options]; newOpts[idx] = e.target.value; setOptions(newOpts); }}
                          placeholder="Nama opsi..."
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                        <button type="button" onClick={() => setOptions(options.filter((_, i) => i !== idx))} className="text-rose-400 hover:text-rose-600 p-2"><FaTrash size={12}/></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setOptions([...options, ""])} className="mt-1 text-sm font-bold text-indigo-600 hover:text-indigo-800 flex gap-2 items-center"><FaPlus size={12}/> Tambah Opsi</button>
                  </div>
                </div>
              ) : (
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
                      ? "Teks yang muncul di tengah dokumen."
                      : "Nama field yang tampil di formulir dan dokumen."}
                  </p>
                </div>
              )}`;
tbCode = tbCode.replace(labelAreaRegex, newLabelArea);

// Update disabled button logic
tbCode = tbCode.replace('disabled={!label.trim()}', 'disabled={selectedType.type !== "row_multi" && !label.trim()}');

// Update LivePreview for row_multi
const tbPreviewOld = `if (sub.type === "row_multi") {
                              const lines = sub.label.split(/\\n/).map(s => s.trim()).filter(Boolean);
                              return (
                                <tr key={sub.id} className="align-top">
                                  <td className="border border-slate-800 p-1.5 w-6 text-center">{i + 1}</td>
                                  <td className="border border-slate-800 p-1.5 w-40 font-semibold">
                                    <div className="whitespace-pre-wrap">{sub.label}</div>
                                  </td>
                                  <td colSpan={2} className="border border-slate-800 p-1.5">
                                    <div className="flex flex-col">
                                      {lines.map((line, lIdx) => {
                                        const match = line.match(/^([a-z0-9]+[\\.\\)])\\s+(.*)/i);
                                        if (!match) return <div key={lIdx} className="min-h-[1.5rem]"></div>;
                                        return (
                                          <div key={lIdx} className="flex gap-1 text-slate-400">
                                            <span className="w-4 shrink-0">{match[1]}</span><span className="flex-1 border-b border-dashed border-slate-300 mt-3"></span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </td>
                                </tr>
                              );
                            }`;
const tbPreviewNew = `if (sub.type === "row_multi") {
                              const opts = sub.options || [];
                              return (
                                <tr key={sub.id} className="align-top">
                                  <td className="border border-slate-800 p-1.5 w-6 text-center">{i + 1}</td>
                                  <td className="border border-slate-800 p-1.5 w-40 font-semibold">
                                    <div className="whitespace-pre-wrap">{sub.label}</div>
                                    {opts.map((opt, oIdx) => (
                                      <div key={oIdx} className="font-normal">{String.fromCharCode(97 + oIdx)}. {opt}</div>
                                    ))}
                                  </td>
                                  <td colSpan={2} className="border border-slate-800 p-1.5">
                                    {sub.label && <div className="min-h-[1.4rem]"></div>}
                                    <div className="flex flex-col">
                                      {opts.map((opt, oIdx) => {
                                        const prefix = String.fromCharCode(97 + oIdx) + ".";
                                        return (
                                          <div key={oIdx} className="flex gap-1 text-slate-400">
                                            <span className="w-4 shrink-0">{prefix}</span><span className="flex-1 border-b border-dashed border-slate-300 mt-3"></span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </td>
                                </tr>
                              );
                            }`;
tbCode = tbCode.replace(tbPreviewOld, tbPreviewNew);

fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', tbCode);
console.log('TemplateBuilder updated for dynamic options');


// ============================================
// 2. UPDATE SuratWriter.jsx
// ============================================
let swCode = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', 'utf8');

const swFormOld = `if (field.type === "row_multi") {
    const lines = field.label.split(/\\n/).map(s => s.trim()).filter(Boolean);
    const items = lines.filter(l => l.match(/^([a-z0-9]+[\\.\\)])\\s+(.*)/i));
    const vals = Array.isArray(value) ? value : [];
    return (
      <div className="flex flex-col gap-2 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
        <label className="text-sm font-bold text-slate-700 whitespace-pre-wrap">{field.label}{field.required && <span className="text-rose-500 ml-1">*</span>}</label>
        <div className="flex flex-col gap-2 mt-1">
          {items.map((item, i) => {
            const match = item.match(/^([a-z0-9]+[\\.\\)])\\s+(.*)/i);
            const prefix = match[1];
            const text = match[2];
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="w-8 text-sm font-semibold text-slate-500">{prefix}</span>
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
                  placeholder={\`Isi untuk \${text}...\`}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }`;
const swFormNew = `if (field.type === "row_multi") {
    const opts = field.options || [];
    const vals = Array.isArray(value) ? value : [];
    return (
      <div className="flex flex-col gap-2 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
        {field.label && <label className="text-sm font-bold text-slate-700 whitespace-pre-wrap">{field.label}{field.required && <span className="text-rose-500 ml-1">*</span>}</label>}
        <div className="flex flex-col gap-2 mt-1">
          {opts.map((opt, i) => {
            const prefix = String.fromCharCode(97 + i) + ".";
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="w-6 text-sm font-semibold text-slate-500">{prefix}</span>
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
                  placeholder={\`Isi untuk \${opt}...\`}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }`;
swCode = swCode.replace(swFormOld, swFormNew);

const swDocOld = `if (sub.type === "row_multi") {
                                  const lines = sub.label.split(/\\n/).map(s => s.trim()).filter(Boolean);
                                  const vals = Array.isArray(val) ? val : [];
                                  let itemIndex = 0;
                                  return (
                                    <tr key={sub.id} className="align-top group">
                                      <td className="border border-slate-800 p-2 w-8 text-center">{num}</td>
                                      <td className="border border-slate-800 p-2 w-48 font-semibold">
                                        <div className="whitespace-pre-wrap">{sub.label}</div>
                                      </td>
                                      <td colSpan={2} className="border border-slate-800 p-2">
                                        <div className="flex flex-col">
                                          {lines.map((line, lIdx) => {
                                            const match = line.match(/^([a-z0-9]+[\\.\\)])\\s+(.*)/i);
                                            if (!match) return <div key={lIdx} className="min-h-[1.4rem]"></div>;
                                            
                                            const valText = vals[itemIndex] || "";
                                            itemIndex++;
                                            
                                            return (
                                              <div key={lIdx} className="flex">
                                                <span className="w-6 shrink-0">{match[1]}</span>
                                                <span className="flex-1 whitespace-pre-wrap">{valText}</span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                }`;
const swDocNew = `if (sub.type === "row_multi") {
                                  const opts = sub.options || [];
                                  const vals = Array.isArray(val) ? val : [];
                                  return (
                                    <tr key={sub.id} className="align-top group">
                                      <td className="border border-slate-800 p-2 w-8 text-center">{num}</td>
                                      <td className="border border-slate-800 p-2 w-48 font-semibold">
                                        <div className="whitespace-pre-wrap">{sub.label}</div>
                                        {opts.map((opt, oIdx) => (
                                          <div key={oIdx} className="font-normal">{String.fromCharCode(97 + oIdx)}. {opt}</div>
                                        ))}
                                      </td>
                                      <td colSpan={2} className="border border-slate-800 p-2">
                                        {sub.label && <div className="min-h-[1.4rem]"></div>}
                                        <div className="flex flex-col">
                                          {opts.map((opt, oIdx) => {
                                            const prefix = String.fromCharCode(97 + oIdx) + ".";
                                            const valText = vals[oIdx] || "";
                                            return (
                                              <div key={oIdx} className="flex">
                                                <span className="w-6 shrink-0">{prefix}</span>
                                                <span className="flex-1 whitespace-pre-wrap">{valText}</span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                }`;
swCode = swCode.replace(swDocOld, swDocNew);

fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', swCode);
console.log('SuratWriter updated for dynamic options');
