const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', 'utf8');

const oldGetInitial = `case "table": return [[]];
    case "list": return [""];`;

const newGetInitial = `case "table": return [[]];
    case "list": return [""];
    case "row_multi": return [];
    case "row_pengikut": return [[]];
    case "row_standard": return "";`;

code = code.replace(oldGetInitial, newGetInitial);

// Update isFieldValid
const validCode = `if (field.type === "row_multi") {
    return Array.isArray(value) && value.some(v => typeof v === 'string' && v.trim() !== "");
  }
  if (field.type === "row_pengikut") {
    return Array.isArray(value) && value.length > 0 && value.every(row => Array.isArray(row));
  }`;

code = code.replace(/if \(!field\.required\) return true;/, `if (!field.required) return true;\n  ${validCode}`);

fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', code);
console.log('SuratWriter getInitialValue updated');
