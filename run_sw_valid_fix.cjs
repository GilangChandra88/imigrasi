const fs = require('fs');

let swCode = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', 'utf8');

const oldValid = `const isFieldValid = (field, value) => {
    if (field.type === "separator") return true; // separators are always valid
    if (!field.required) return true;
    switch (field.type) {`;

const newValid = `const isFieldValid = (field, value) => {
    if (field.type === "separator") return true; // separators are always valid
    if (!field.required) return true;
    if (field.type === "row_multi") {
      return Array.isArray(value) && value.some(v => typeof v === 'string' && v.trim() !== "");
    }
    if (field.type === "row_pengikut") {
      return Array.isArray(value) && value.length > 0 && value.every(row => Array.isArray(row));
    }
    if (field.type === "table") {
      return Array.isArray(value) && value.length > 0 && value.every(row => Array.isArray(row) && row.some(cell => cell && typeof cell === 'string' && cell.trim() !== ""));
    }
    if (field.type === "row_pegawai_nama" || field.type === "row_pegawai_nip") {
      return value !== null && typeof value === "object";
    }
    switch (field.type) {`;

swCode = swCode.replace(oldValid, newValid);
fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', swCode);
