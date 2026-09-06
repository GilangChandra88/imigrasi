const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', 'utf8');

const regexPreview = /if \(sub\.type === "row_multi"\) \{[\s\S]*?return \([\s\S]*?<\/tr>\s*\);\s*\}/;

const newPreview = `if (sub.type === "row_multi") {
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
                                    <div className="flex flex-col gap-1">
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

if (regexPreview.test(code)) {
    code = code.replace(regexPreview, newPreview);
    fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', code);
    console.log('TemplateBuilder LivePreview updated!');
} else {
    console.log('Regex did not match TemplateBuilder LivePreview');
}
