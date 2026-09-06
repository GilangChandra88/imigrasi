const fs = require('fs');

// 1. UPDATE TemplateBuilder.jsx
let tbCode = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', 'utf8');

const oldTbPreview = `if (sub.type === "row_multi") {
                              const pts = sub.label.split(/[\\\\n,]+/).map(s => s.trim()).filter(Boolean);
                              return (
                                <tr key={sub.id} className="align-top">
                                  <td className="border border-slate-800 p-1.5 w-6 text-center">{i + 1}</td>
                                  <td className="border border-slate-800 p-1.5 w-40 font-semibold">
                                    <div className="whitespace-pre-wrap">{sub.label}</div>
                                  </td>
                                  <td colSpan={2} className="border border-slate-800 p-1.5">
                                    <div className="flex flex-col gap-1">
                                      {pts.map((p, pIdx) => (
                                        <div key={pIdx} className="flex gap-1 text-slate-400">
                                          <span>{p}</span><span className="flex-1 border-b border-dashed border-slate-300"></span>
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              );
                            }`;

const newTbPreview = `if (sub.type === "row_multi") {
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

tbCode = tbCode.replace(oldTbPreview, newTbPreview);
fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', tbCode);
console.log('TemplateBuilder.jsx updated');


// 2. UPDATE SuratWriter.jsx
let swCode = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', 'utf8');

const oldSwForm = `if (field.type === "row_multi") {
    const pts = field.label.split(/[\\\\n,]+/).map(s => s.trim()).filter(Boolean);
    const vals = Array.isArray(value) ? value : [];
    return (
      <div className="flex flex-col gap-2 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
        <label className="text-sm font-bold text-slate-700">{field.label.replace(/\\\\n/g, ', ')}{field.required && <span className="text-rose-500 ml-1">*</span>}</label>
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
  }`;

const newSwForm = `if (field.type === "row_multi") {
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
swCode = swCode.replace(oldSwForm, newSwForm);

const oldSwDoc = `if (sub.type === "row_multi") {
                                  const pts = sub.label.split(/[\\\\n,]+/).map(s => s.trim()).filter(Boolean);
                                  const vals = Array.isArray(val) ? val : [];
                                  return (
                                    <tr key={sub.id} className="align-top group">
                                      <td className="border border-slate-800 p-2 w-8 text-center">{num}</td>
                                      <td className="border border-slate-800 p-2 w-48 font-semibold">
                                        <div className="whitespace-pre-wrap">{sub.label}</div>
                                      </td>
                                      <td colSpan={2} className="border border-slate-800 p-2">
                                        <div className="flex flex-col">
                                          {pts.map((p, i) => (
                                            <div key={i} className="flex">
                                              <span className="w-6 shrink-0">{p.substring(0, 2)}</span>
                                              <span className="flex-1 whitespace-pre-wrap">{vals[i] || ""}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                }`;

const newSwDoc = `if (sub.type === "row_multi") {
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
swCode = swCode.replace(oldSwDoc, newSwDoc);

fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', swCode);
console.log('SuratWriter.jsx updated');
