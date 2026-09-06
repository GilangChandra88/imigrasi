const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', 'utf8');

code = code.replace(/value=\{row\[colIndex\] \|\| ""\}/g, 'value={(row && row[colIndex]) || ""}');
code = code.replace(/<div className="hidden print:block">\{row\[colIndex\] \|\| ""\}<\/div>/g, '<div className="hidden print:block">{(row && row[colIndex]) || ""}</div>');

fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', code);
console.log("Safe row access applied.");
