const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', 'utf8');

const tableRowTypesCode = `
// ============================================================
// TABLE ROW TYPE DEFINITIONS (Khusus untuk dalam table_group)
// ============================================================
const TABLE_ROW_TYPES = [
  {
    type: "row_standard",
    label: "Baris Standar",
    description: "Kolom kiri label, kolom kanan 1 input teks",
    icon: FaAlignLeft,
    color: "sky",
    preview: (label) => <div className="text-[12px] italic text-slate-400">Preview Baris Standar</div>
  },
  {
    type: "row_multi",
    label: "Baris Beranak (a, b, c)",
    description: "Kolom kiri dan kanan terbagi menjadi beberapa poin (pisahkan dengan koma/enter pada label)",
    icon: FaListOl,
    color: "emerald",
    preview: (label) => <div className="text-[12px] italic text-slate-400">Preview Baris Beranak</div>
  },
  {
    type: "row_pengikut",
    label: "Tabel Pengikut",
    description: "Format baris khusus untuk Pengikut (Tabel di dalam tabel)",
    icon: FaUsers,
    color: "rose",
    preview: (label) => <div className="text-[12px] italic text-slate-400">Preview Baris Pengikut</div>
  }
];

function getTableRowTypeInfo(type) {
  return TABLE_ROW_TYPES.find((t) => t.type === type) || TABLE_ROW_TYPES[0];
}
`;

// Insert after FIELD_TYPES array
const insertIndex = code.indexOf('function getTypeInfo(type)');
if (insertIndex !== -1) {
  code = code.slice(0, insertIndex) + tableRowTypesCode + '\n' + code.slice(insertIndex);
}

fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', code);
console.log('TABLE_ROW_TYPES injected');
