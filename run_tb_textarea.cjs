const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', 'utf8');

const oldLabelInput = `<input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder={selectedType.type === "separator" ? "Contoh: M E N U G A S K A N :" : "Contoh: Menimbang, Dasar, Kepada..."}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                />`;

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

const oldLabelDesc = `{selectedType.type === "separator"
                    ? "Teks yang muncul di tengah dokumen (bisa dikosongkan untuk garis pemisah biasa)."
                    : "Nama field yang tampil di formulir dan dokumen."}`;

const newLabelDesc = `{selectedType.type === "separator"
                    ? "Teks yang muncul di tengah dokumen."
                    : selectedType.type === "row_multi" 
                    ? "Gunakan tombol ENTER (baris baru) untuk memisahkan setiap opsi (a, b, c)." 
                    : "Nama field yang tampil di formulir dan dokumen."}`;

code = code.replace(oldLabelInput, newLabelInput);
code = code.replace(oldLabelDesc, newLabelDesc);

fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', code);
console.log('Label input updated for row_multi');
