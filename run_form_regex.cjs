const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', 'utf8');

const newFormMap = `                <div className="flex flex-col gap-5">
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

const regex = /<div className="flex flex-col gap-5">\s*\{\(template\.fields \|\| \[\]\)\.map\(\(field\) => \(\s*<FieldFormView[\s\S]*?\/>\s*\)\)\}\s*<\/div>/;

if (code.match(regex)) {
  code = code.replace(regex, newFormMap);
  fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', code);
  console.log("Form view updated");
} else {
  console.log("Could not find regex");
}
