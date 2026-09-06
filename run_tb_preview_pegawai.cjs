const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', 'utf8');

const regexPreview = /\/\/\s*row_standard\s*return \(\s*<tr key=\{sub\.id\} className="align-top">\s*<td className="border border-slate-800 p-1\.5 w-6 text-center">\{i \+ 1\}<\/td>\s*<td className="border border-slate-800 p-1\.5 w-40 font-semibold">\{sub\.label\}<\/td>\s*<td colSpan=\{2\} className="border border-slate-800 p-1\.5">\s*<div className="w-full h-5 bg-slate-100 rounded border border-dashed border-slate-300"><\/div>\s*<\/td>\s*<\/tr>\s*\);/;

const newPreview = `if (sub.type === "row_pegawai_nama" || sub.type === "row_pegawai_nip") {
                              return (
                                <tr key={sub.id} className="align-top">
                                  <td className="border border-slate-800 p-1.5 w-6 text-center">{i + 1}</td>
                                  <td className="border border-slate-800 p-1.5 w-40 font-semibold">{sub.label}</td>
                                  <td colSpan={2} className="border border-slate-800 p-1.5 text-slate-400 italic">
                                    {sub.defaultValue && <div className="whitespace-pre-wrap not-italic text-slate-800">{sub.defaultValue}</div>}
                                    Pilih Pegawai...
                                  </td>
                                </tr>
                              );
                            }
                            // row_standard
                            return (
                              <tr key={sub.id} className="align-top">
                                <td className="border border-slate-800 p-1.5 w-6 text-center">{i + 1}</td>
                                <td className="border border-slate-800 p-1.5 w-40 font-semibold">{sub.label}</td>
                                <td colSpan={2} className="border border-slate-800 p-1.5">
                                  <div className="w-full h-5 bg-slate-100 rounded border border-dashed border-slate-300"></div>
                                </td>
                              </tr>
                            );`;

code = code.replace(regexPreview, newPreview);
fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', code);
console.log('TemplateBuilder LivePreview updated for row_pegawai');
