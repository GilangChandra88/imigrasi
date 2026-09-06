const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', 'utf8');

const newDocMap = `              <div className="flex-1 flex flex-col gap-3 text-justify text-[15px] leading-snug">
                {(template.fields || []).map(field => {
                  if (field.type === "table_group") {
                    const subs = field.subFields || [];
                    return (
                      <div key={field.id} className="w-full">
                        <style>{\`
                          .spd-hide-labels .spd-grid { display: block !important; margin-bottom: 0 !important; gap: 0 !important; }
                          .spd-hide-labels .spd-label { display: none !important; }
                          .spd-hide-labels .spd-colon { display: none !important; }
                        \`}</style>
                        <table className="w-full border-collapse border border-slate-800 text-[13px] leading-snug my-2">
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
                                return (
                                  <tr key={sub.id} className="align-top group">
                                    <td className="border border-slate-800 p-2 w-8 text-center">{num}</td>
                                    <td className="border border-slate-800 p-2 w-48 font-semibold">{sub.label}</td>
                                    <td className="border border-slate-800 p-2">
                                      <div className="spd-hide-labels">
                                        {renderFieldDoc(sub)}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              });
                            })()}
                          </tbody>
                        </table>
                      </div>
                    );
                  }
                  return renderFieldDoc(field);
                })}
              </div>`;

const searchStart = '<div className="flex-1 flex flex-col gap-3 text-justify text-[15px] leading-snug">';
const searchEnd = '</div>\n\n              {/* Footer */}';

const startIdx = code.indexOf(searchStart);
const endIdx = code.indexOf(searchEnd);

if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + newDocMap + '\n\n              {/* Footer */}' + code.substring(endIdx + searchEnd.length);
  fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', code);
  console.log("Doc map updated successfully using indexOf");
} else {
  console.log("Could not find start/end idx");
}
