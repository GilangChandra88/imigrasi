const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', 'utf8');

// 1. getInitialValue
code = code.replace(
  'case "row_multi": return [];',
  'case "row_multi": return [];\n    case "row_pegawai_nama":\n    case "row_pegawai_nip": return null;'
);

// 2. isFieldValid
code = code.replace(
  'case "pegawai_single":',
  'case "row_pegawai_nama":\n      case "row_pegawai_nip":\n      case "pegawai_single":'
);

// 3. isPegawaiField and logic
code = code.replace(
  'const isPegawaiField = activeFieldDef?.type === "pegawai_single" || activeFieldDef?.type === "pegawai_detail" || activeFieldDef?.type === "pegawai_multi" || activeField === "__penandatangan__";',
  'const isPegawaiField = activeFieldDef?.type === "row_pegawai_nama" || activeFieldDef?.type === "row_pegawai_nip" || activeFieldDef?.type === "pegawai_single" || activeFieldDef?.type === "pegawai_detail" || activeFieldDef?.type === "pegawai_multi" || activeField === "__penandatangan__";'
);
code = code.replace(
  'if (activeFieldDef.type === "pegawai_single" || activeFieldDef.type === "pegawai_detail") {',
  'if (activeFieldDef.type === "row_pegawai_nama" || activeFieldDef.type === "row_pegawai_nip" || activeFieldDef.type === "pegawai_single" || activeFieldDef.type === "pegawai_detail") {'
);
code = code.replace(
  'if (activeFieldDef.type === "pegawai_single" || activeFieldDef.type === "pegawai_detail") return docData[activeField]?.id === pegawai.id;',
  'if (activeFieldDef.type === "row_pegawai_nama" || activeFieldDef.type === "row_pegawai_nip" || activeFieldDef.type === "pegawai_single" || activeFieldDef.type === "pegawai_detail") return docData[activeField]?.id === pegawai.id;'
);

// 4. FieldFormView
code = code.replace(
  'if (field.type === "pegawai_single" || field.type === "pegawai_detail") {',
  'if (field.type === "row_pegawai_nama" || field.type === "row_pegawai_nip" || field.type === "pegawai_single" || field.type === "pegawai_detail") {'
);

// 5. FieldDocView (inside table_group)
const oldDocView = /if \(sub\.type === "row_multi"\) \{/;
const newDocView = `if (sub.type === "row_pegawai_nama" || sub.type === "row_pegawai_nip") {
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
code = code.replace(oldDocView, newDocView);

fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', code);
console.log('SuratWriter updated for row_pegawai');
