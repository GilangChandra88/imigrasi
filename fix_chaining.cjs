const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', 'utf8');

code = code.replace(/getFlatFields\(template\.fields\)/g, 'getFlatFields(template?.fields)');
code = code.replace(/getFlatFields\(data\.fields\)/g, 'getFlatFields(data?.fields)');

fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', code);
console.log('Fixed optional chaining');
