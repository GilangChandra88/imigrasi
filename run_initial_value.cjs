const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', 'utf8');

code = code.replace(/if \(field\.type === "list" \|\| field\.type === "list_full"\) \{/, `if (field.type === "table") {
      const cols = String(field.defaultValue).split(',');
      return [cols.map(() => "")];
    }
    if (field.type === "list" || field.type === "list_full") {`);

code = code.replace(/case "list": return \[""\];/, `case "table": return [[]];\n    case "list": return [""];`);

fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', code);
console.log("getInitialValue updated");
