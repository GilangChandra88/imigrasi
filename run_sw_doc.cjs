const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', 'utf8');

const oldTableGroupRegex = /<table className="w-full border-collapse border border-slate-800 text-\[13px\] leading-snug my-2">[\s\S]*?<\/table>/;

const newTableGroupRender = `<table className="w-full border-collapse border border-slate-800 text-[13px] leading-snug my-2">
                          <tbody>
                            {(() => {
                              let counter = 1;
                              return subs.map((sub) => {
                                if (sub.type === "separator") {
                                  return (
                                    <tr key={sub.id}>
                                      <td colSpan={3} className="border border-slate-800 p-2 text-center font-bold tracking-widest text-[14px]">
                                        {sub.label}
                                      </td>
                                    </tr>
                                  );
                                }
                                const num = counter++;
                                const val = docData[sub.name];
                                
                                if (sub.type === "row_pengikut") {
                                  const rows = Array.isArray(val) ? val : [];
                                  return (
                                    <React.Fragment key={sub.id}>
                                      <tr className="align-top">
                                        <td className="border border-slate-800 p-2 w-8 text-center" rowSpan={rows.length > 0 ? rows.length + 1 : 2}>{num}</td>
                                        <td className="border border-slate-800 p-2 w-48 font-semibold" rowSpan={rows.length > 0 ? rows.length + 1 : 2}>{sub.label}</td>
                                        <td className="border border-slate-800 p-2 font-semibold text-center w-1/2">Tanggal Lahir</td>
                                        <td className="border border-slate-800 p-2 font-semibold text-center w-1/2">Keterangan</td>
                                      </tr>
                                      {rows.length === 0 && (
                                        <tr>
                                          <td className="border border-slate-800 p-2 h-6"></td>
                                          <td className="border border-slate-800 p-2 h-6"></td>
                                        </tr>
                                      )}
                                      {rows.map((r, i) => (
                                        <tr key={i} className="align-top">
                                          <td className="border border-slate-800 p-2">{(r && r[1]) || ""}</td>
                                          <td className="border border-slate-800 p-2">{(r && r[2]) || ""}</td>
                                        </tr>
                                      ))}
                                    </React.Fragment>
                                  );
                                }

                                if (sub.type === "row_multi") {
                                  const pts = sub.label.split(/[\\n,]+/).map(s => s.trim()).filter(Boolean);
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
                                }

                                return (
                                  <tr key={sub.id} className="align-top group">
                                    <td className="border border-slate-800 p-2 w-8 text-center">{num}</td>
                                    <td className="border border-slate-800 p-2 w-48 font-semibold">{sub.label}</td>
                                    <td colSpan={2} className="border border-slate-800 p-2">
                                      <div className="spd-hide-labels">
                                        {renderFieldDoc(sub)}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              });
                            })()}
                          </tbody>
                        </table>`;

code = code.replace(oldTableGroupRegex, newTableGroupRender);
fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', code);
console.log('Doc View updated for custom rows');
