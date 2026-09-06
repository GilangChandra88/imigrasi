
const fs = require('fs');
let code = fs.readFileSync('src/pages/TemplateBuilderV2.jsx', 'utf8');
const search = '    const traverse = (node) => {';
const replace = \    const traverse = (node) => {
      if (node.type === 'repeaterBlock' && node.attrs) {
        if (!extractedVariables.find(v => v.fieldId === node.attrs.fieldId)) {
          extractedVariables.push({
            ...node.attrs,
            fieldType: 'pegawai', 
            allowMultiple: true, 
            fieldName: node.attrs.fieldName || 'Data Pegawai'
          });
        }
      }
      if (node.type === 'formField' && node.attrs) {
        if (!node.attrs.fieldType.startsWith('pegawai_')) {
          if (!extractedVariables.find(v => v.fieldId === node.attrs.fieldId)) {
            extractedVariables.push(node.attrs);
          }
        }
      }\;

const parts = code.split(\    const traverse = (node) => {
      if (node.type === 'formField' && node.attrs) {\);

if (parts.length === 2) {
    fs.writeFileSync('src/pages/TemplateBuilderV2.jsx', parts[0] + replace + parts[1].substring(parts[1].indexOf('}')));
    console.log('Patched traversal!');
}

