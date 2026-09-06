const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', 'utf8');

const newRenderBlock = `            {fields.map((f) => {
              if (f.type === "separator") {
                return (
                  <div key={f.id} className="text-center font-bold tracking-widest my-2 text-[12px] text-slate-700">
                    {f.label || "— SEPARATOR —"}
                  </div>
                );
              }
              if (f.type === "table_group") {
                const subs = f.subFields || [];
                return (
                  <div key={f.id} className="w-full">
                    <style>{\`
                      .spd-hide-labels .grid { display: block !important; gap: 0 !important; }
                      .spd-hide-labels .grid > .text-slate-700 { display: none !important; }
                      .spd-hide-labels .grid > .flex > .w-5.text-center.shrink-0 { display: none !important; }
                    \`}</style>
                    <table className="w-full border-collapse border border-slate-800 text-[12px] my-2">
                      <tbody>
                        {subs.length === 0 ? (
                          <tr><td className="border border-slate-800 p-2 text-center text-slate-400 italic">Tabel kosong</td></tr>
                        ) : (
                          subs.map((sub, i) => {
                            if (sub.type === "separator") {
                              return (
                                <tr key={sub.id}>
                                  <td colSpan={3} className="border border-slate-800 p-1.5 text-center font-bold tracking-widest text-[12px] text-slate-700">
                                    {sub.label || "— SEPARATOR —"}
                                  </td>
                                </tr>
                              );
                            }
                            const st = getTypeInfo(sub.type);
                            return (
                              <tr key={sub.id} className="align-top">
                                <td className="border border-slate-800 p-1.5 w-6 text-center">{i + 1}</td>
                                <td className="border border-slate-800 p-1.5 w-40 font-semibold">{sub.label}</td>
                                <td className="border border-slate-800 p-1.5">
                                  <div className="spd-hide-labels">
                                    {st.preview(sub.label, sub.defaultValue)}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                );
              }
              const ft = getTypeInfo(f.type);
              return <div key={f.id}>{ft.preview(f.label, f.defaultValue)}</div>;
            })}`;

const regex = /\{fields\.map\(\(f\) => \{[\s\S]*?return <div key=\{f\.id\}>\{ft\.preview\(f\.label, f\.defaultValue\)\}<\/div>;\s*\}\)\}/;
if (code.match(regex)) {
  code = code.replace(regex, newRenderBlock);
  console.log("LivePreview map updated");
}

fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', code);
