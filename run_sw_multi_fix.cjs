const fs = require('fs');

let swCode = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', 'utf8');

// Update FieldFormView
const formRegex = /if \(field\.type === "row_multi"\) \{[\s\S]*?return \([\s\S]*?<\/div>\s*\);\s*\}/;
const formNew = `if (field.type === "row_multi") {
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
if (formRegex.test(swCode)) {
    swCode = swCode.replace(formRegex, formNew);
    console.log('SuratWriter FieldFormView updated!');
} else {
    console.log('SuratWriter FieldFormView Regex failed!');
}

// Update FieldDocView
const docRegex = /if \(sub\.type === "row_multi"\) \{[\s\S]*?return \([\s\S]*?<\/tr>\s*\);\s*\}/;
const docNew = `if (sub.type === "row_multi") {
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

if (docRegex.test(swCode)) {
    swCode = swCode.replace(docRegex, docNew);
    console.log('SuratWriter FieldDocView updated!');
} else {
    console.log('SuratWriter FieldDocView Regex failed!');
}

fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', swCode);
