
const fs = require('fs');
let code = fs.readFileSync('src/components/builder-v2/PreviewFieldExtension.jsx', 'utf8');
const parts = code.split('import React, { createContext, useContext } from \'react\';');
if (parts.length > 2) {
    fs.writeFileSync('src/components/builder-v2/PreviewFieldExtension.jsx', 'import React, { createContext, useContext } from \'react\';' + parts[2]);
    console.log('Fixed duplications!');
}

