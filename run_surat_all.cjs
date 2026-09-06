const fs = require('fs');

function updateSuratWriter() {
  let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', 'utf8');

  // 1. Flat fields helper
  const helper = `
const getFlatFields = (fields) => {
  if (!fields) return [];
  let flat = [];
  fields.forEach(f => {
    flat.push(f);
    if (f.subFields) {
      flat = flat.concat(f.subFields);
    }
  });
  return flat;
};
`;
  if (!code.includes('const getFlatFields')) {
    code = code.replace('const isFieldValid = ', helper + '\nconst isFieldValid = ');
  }

  code = code.replace(/data\.fields\.forEach\(\(f\) => \{/g, 'getFlatFields(data.fields).forEach((f) => {');
  code = code.replace(/\(template\.fields \|\| \[\]\)\.every\(\(f\) =>/g, 'getFlatFields(template.fields).every((f) =>');
  code = code.replace(/template\.fields\?\.find\(\(f\) =>/g, 'getFlatFields(template.fields).find((f) =>');
  code = code.replace(/template\.fields\.find\(/g, 'getFlatFields(template.fields).find(');

  // 2. Form Map
  const formMap = `<div className="flex flex-col gap-5">
                  {(template.fields || []).map((field) => {
                    if (field.type === "table_group") {
                      const subs = field.subFields || [];
                      return (
                        <div key={field.id} className="flex flex-col gap-4 p-4 bg-purple-50/30 border-2 border-purple-200 rounded-xl">
                          <h3 className="font-bold text-sm text-purple-800 border-b border-purple-200 pb-2">{field.label}</h3>
                          {subs.map(sub => (
                            <FieldFormView
                              key={sub.id}
                              field={sub}
                              value={docData[sub.name]}
                              onChange={(v) => updateField(sub.name, v)}
                              activeField={activeField}
                              setActiveField={setActiveField}
                              openSugestiFor={openSugestiFor}
                            />
                          ))}
                        </div>
                      );
                    }
                    return (
                      <FieldFormView
                        key={field.id}
                        field={field}
                        value={docData[field.name]}
                        onChange={(v) => updateField(field.name, v)}
                        activeField={activeField}
                        setActiveField={setActiveField}
                        openSugestiFor={openSugestiFor}
                      />
                    );
                  })}
                </div>`;
  const oldFormMap = `<div className="flex flex-col gap-5">
                  {(template.fields || []).map((field) => (
                    <FieldFormView
                      key={field.id}
                      field={field}
                      value={docData[field.name]}
                      onChange={(v) => updateField(field.name, v)}
                      activeField={activeField}
                      setActiveField={setActiveField}
                      openSugestiFor={openSugestiFor}
                    />
                  ))}
                </div>`;
  code = code.replace(oldFormMap, formMap);

  // 3. Doc Map
  const docMap = `<div className="flex-1 flex flex-col gap-3 text-justify text-[15px] leading-snug">
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
  const oldDocMap = `<div className="flex-1 flex flex-col gap-3 text-justify text-[15px] leading-snug">
              {(template.fields || []).map(renderFieldDoc)}
            </div>`;
  code = code.replace(oldDocMap, docMap);

  // 4. Also add useLocation because we checked out SuratWriter.jsx!
  code = code.replace('import { useNavigate, useParams, Link } from "react-router-dom";', 'import { useNavigate, useParams, Link, useLocation } from "react-router-dom";');

  fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', code);
  console.log("SuratWriter rewritten perfectly.");
}
updateSuratWriter();
