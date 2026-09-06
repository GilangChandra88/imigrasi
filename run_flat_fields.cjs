const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', 'utf8');

const helper = `
const getFlatFields = (fields) => {
  if (!fields) return [];
  let flat = [];
  fields.forEach(f => {
    flat.push(f);
    if (f.subFields) {
      flat = flat.concat(f.subFields);
    }
  });
  return flat;
};
`;

// Insert helper before isFieldValid
if (!code.includes('const getFlatFields')) {
  code = code.replace('const isFieldValid = ', helper + '\nconst isFieldValid = ');
}

// In useEffect for initialization:
// data.fields.forEach((f) => { ... })  =>  getFlatFields(data.fields).forEach((f) => { ... })
code = code.replace(/data\.fields\.forEach\(\(f\) => \{/g, 'getFlatFields(data.fields).forEach((f) => {');

// In isFormValid:
// (template.fields || []).every((f) =>
code = code.replace(/\(template\.fields \|\| \[\]\)\.every\(\(f\) =>/g, 'getFlatFields(template.fields).every((f) =>');

// In activeFieldDef:
// template.fields?.find((f) =>
code = code.replace(/template\.fields\?\.find\(\(f\) =>/g, 'getFlatFields(template.fields).find((f) =>');

// In triggerFieldDef and sourceField:
// template.fields.find(
code = code.replace(/template\.fields\.find\(/g, 'getFlatFields(template.fields).find(');

fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', code);
console.log('Flat fields logic applied');
