const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', 'utf8');

const dropdownRegex = /\{\!isSub && allGroups && allGroups\.length > 0 && \([\s\S]*?\}\)/;
code = code.replace(dropdownRegex, '');

fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', code);
console.log('Dropdown removed');
