const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', 'utf8');

const regexTableRows = /const TABLE_ROW_TYPES = \[([\s\S]*?)\];/;
const newTableRows = `const TABLE_ROW_TYPES = [
$1,
  {
    type: "row_pegawai_nama",
    label: "Pilih Pegawai (Hanya Nama)",
    description: "Kolom kanan menampilkan Nama Pegawai (bisa ditambah Teks Default di atasnya)",
    icon: FaUser,
    color: "blue",
    preview: (label) => <div className="text-[12px] italic text-slate-400">Preview Pegawai</div>
  },
  {
    type: "row_pegawai_nip",
    label: "Pilih Pegawai (Nama & NIP)",
    description: "Kolom kanan menampilkan Nama Pegawai (Tebal) dan NIP di bawahnya",
    icon: FaIdCard,
    color: "indigo",
    preview: (label) => <div className="text-[12px] italic text-slate-400">Preview Pegawai + NIP</div>
  }
];`;

code = code.replace(regexTableRows, newTableRows);

const regexDefaultValueCheck = /!selectedType\.type\.startsWith\("pegawai"\)/;
const newDefaultValueCheck = `!selectedType.type.startsWith("pegawai_")`; 
// ini berarti "pegawai_single", "pegawai_multi" masih di hide, tapi "row_pegawai_nama" TIDAK di-hide default value nya!

code = code.replace(regexDefaultValueCheck, newDefaultValueCheck);

fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', code);
console.log('TABLE_ROW_TYPES extended with row_pegawai');
