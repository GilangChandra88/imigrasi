const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', 'utf8');

const regex = /<input\s*type="text"\s*value=\{label\}\s*onChange=\{\(e\) => setLabel\(e\.target\.value\)\}[\s\S]*?onKeyDown=\{\(e\) => e\.key === "Enter" && handleConfirm\(\)\}\s*\/>/;

const newLabelInput = `{selectedType.type === "row_multi" ? (
                  <textarea
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Contoh:\\na. Pangkat\\nb. Jabatan\\n(Tekan ENTER untuk setiap poin)"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 min-h-[100px]"
                    autoFocus
                  />
                ) : (
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder={selectedType.type === "separator" ? "Contoh: M E N U G A S K A N :" : "Contoh: Menimbang, Dasar, Kepada..."}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                  />
                )}`;

if (regex.test(code)) {
  code = code.replace(regex, newLabelInput);
  fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', code);
  console.log('Regex replace successful');
} else {
  console.log('Regex did not match!');
}
