const fs = require('fs');
let swCode = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', 'utf8');

const marker = `if (sub.type === "row_multi") {`;
const inject = `if (sub.type === "row_pegawai_nama" || sub.type === "row_pegawai_nip") {
                                  return (
                                    <tr key={sub.id} className="align-top group">
                                      <td className="border border-slate-800 p-2 w-8 text-center">{num}</td>
                                      <td className="border border-slate-800 p-2 w-48 font-semibold whitespace-pre-wrap">{sub.label}</td>
                                      <td colSpan={2} className="border border-slate-800 p-2">
                                        {sub.defaultValue && <div className="whitespace-pre-wrap mb-0.5">{sub.defaultValue}</div>}
                                        {val ? (
                                          <div className="whitespace-pre-wrap">
                                            <span className="font-bold uppercase">{val.nama}</span>
                                            {sub.type === "row_pegawai_nip" && (
                                              <><br/>{val.nip}</>
                                            )}
                                          </div>
                                        ) : (
                                          <span className="text-slate-300 italic">Pilih {sub.label}...</span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                }

                                if (sub.type === "row_multi") {`;

if (swCode.includes(marker)) {
    swCode = swCode.replace(marker, inject);
    fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', swCode);
    console.log('SuratWriter row_pegawai FieldDocView injected!');
} else {
    console.log('Marker not found!');
}
