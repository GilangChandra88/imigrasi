const fs = require('fs');
let swCode = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', 'utf8');

const regex = /if \(field\.type === "row_pengikut"\) \{\s*return Array\.isArray\(value\) && value\.length > 0 && value\.every\(row => Array\.isArray\(row\)\);\s*\}/;

const injection = `if (field.type === "row_pengikut") {
      return Array.isArray(value) && value.length > 0 && value.every(row => Array.isArray(row));
    }
    if (field.type === "table") {
      return Array.isArray(value) && value.length > 0 && value.every(row => Array.isArray(row) && row.some(cell => cell && typeof cell === 'string' && cell.trim() !== ""));
    }
    if (field.type === "row_pegawai_nama" || field.type === "row_pegawai_nip") {
      return value !== null && typeof value === "object";
    }`;

swCode = swCode.replace(regex, injection);
fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', swCode);
