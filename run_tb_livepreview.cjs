const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', 'utf8');

const oldLivePreviewTbody = `{subs.length === 0 ? (
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
                        )}`;

const newLivePreviewTbody = `{subs.length === 0 ? (
                          <tr><td className="border border-slate-800 p-2 text-center text-slate-400 italic">Tabel kosong</td></tr>
                        ) : (
                          subs.map((sub, i) => {
                            if (sub.type === "row_pengikut") {
                              return (
                                <tr key={sub.id} className="align-top">
                                  <td className="border border-slate-800 p-1.5 w-6 text-center">{i + 1}</td>
                                  <td className="border border-slate-800 p-1.5 w-40 font-semibold align-top" rowSpan={2}>{sub.label}</td>
                                  <td className="border border-slate-800 p-1.5 font-semibold text-center w-1/2">Tanggal Lahir</td>
                                  <td className="border border-slate-800 p-1.5 font-semibold text-center w-1/2">Keterangan</td>
                                </tr>
                              );
                            }
                            if (sub.type === "row_multi") {
                              const pts = sub.label.split(/[\\n,]+/).map(s => s.trim()).filter(Boolean);
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
                            );
                          })
                        )}`;

code = code.replace(oldLivePreviewTbody, newLivePreviewTbody);

fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', code);
console.log('LivePreview updated');
