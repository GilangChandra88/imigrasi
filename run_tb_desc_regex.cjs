const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', 'utf8');

const regexDesc = /\{selectedType\.type === "separator"\s*\?\s*"Teks yang muncul di tengah dokumen \(bisa dikosongkan untuk garis pemisah biasa\)\."\s*:\s*"Nama field yang tampil di formulir dan dokumen\."\}/;

const newDesc = `{selectedType.type === "separator"
                    ? "Teks yang muncul di tengah dokumen."
                    : selectedType.type === "row_multi" 
                    ? "Gunakan tombol ENTER (baris baru) untuk memisahkan setiap opsi (a, b, c)." 
                    : "Nama field yang tampil di formulir dan dokumen."}`;

if (regexDesc.test(code)) {
  code = code.replace(regexDesc, newDesc);
  fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', code);
  console.log('Desc replace successful');
} else {
  console.log('Desc regex did not match!');
}
