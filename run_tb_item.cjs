const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', 'utf8');

code = code.replace(
  'function FieldItem({ field, index, total, onMoveUp, onMoveDown, onRemove, onEdit, onAddSubField, onMoveToTable, allGroups, isSub = false, parentId = null }) {\n    const ft = getTypeInfo(field.type);',
  'function FieldItem({ field, index, total, onMoveUp, onMoveDown, onRemove, onEdit, onAddSubField, onMoveToTable, allGroups, isSub = false, parentId = null }) {\n    const ft = isSub ? getTableRowTypeInfo(field.type) : getTypeInfo(field.type);'
);

fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', code);
console.log('FieldItem updated');
