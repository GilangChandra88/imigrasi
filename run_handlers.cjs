const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', 'utf8');

const stateRegex = /const \[editingFieldId, setEditingFieldId\] = useState\(null\);/;
if (code.match(stateRegex)) {
  code = code.replace(stateRegex, 'const [editingFieldId, setEditingFieldId] = useState(null);\n  const [activeParentId, setActiveParentId] = useState(null);');
}

const handlersCode = `  const handleAddField = (field) => {
    setTemplate((prev) => {
      let fields = [...prev.fields];
      let existingIndex = -1;
      let existingParentIndex = -1;

      // Find existing
      fields.forEach((f, i) => {
        if (f.id === field.id) existingIndex = i;
        if (f.subFields) {
          const subIdx = f.subFields.findIndex(sub => sub.id === field.id);
          if (subIdx !== -1) { existingIndex = subIdx; existingParentIndex = i; }
        }
      });

      if (existingIndex !== -1) {
        // Edit mode
        if (existingParentIndex !== -1) {
          const p = { ...fields[existingParentIndex] };
          p.subFields = [...p.subFields];
          p.subFields[existingIndex] = field;
          fields[existingParentIndex] = p;
        } else {
          fields[existingIndex] = field;
        }
      } else {
        // Add mode
        if (activeParentId) {
          const pIdx = fields.findIndex(f => f.id === activeParentId);
          if (pIdx !== -1) {
            const p = { ...fields[pIdx] };
            p.subFields = [...(p.subFields || []), field];
            fields[pIdx] = p;
          }
        } else {
          fields.push(field);
        }
      }
      return { ...prev, fields };
    });
  };

  const handleRemoveField = (id) => {
    setTemplate((prev) => {
      const fields = prev.fields.map(f => {
        if (f.subFields) return { ...f, subFields: f.subFields.filter(sub => sub.id !== id) };
        return f;
      }).filter(f => f.id !== id);
      return { ...prev, fields };
    });
  };

  const handleMoveField = (index, direction, parentId = null) => {
    setTemplate((prev) => {
      const fields = [...prev.fields];
      if (parentId) {
        const pIdx = fields.findIndex(f => f.id === parentId);
        if (pIdx !== -1) {
          const p = { ...fields[pIdx] };
          const subs = [...(p.subFields || [])];
          const targetIndex = index + direction;
          if (targetIndex >= 0 && targetIndex < subs.length) {
            [subs[index], subs[targetIndex]] = [subs[targetIndex], subs[index]];
            p.subFields = subs;
            fields[pIdx] = p;
          }
        }
      } else {
        const targetIndex = index + direction;
        if (targetIndex >= 0 && targetIndex < fields.length) {
          [fields[index], fields[targetIndex]] = [fields[targetIndex], fields[index]];
        }
      }
      return { ...prev, fields };
    });
  };

  const handleMoveToTable = (fieldId, targetParentId) => {
    setTemplate((prev) => {
      let fields = [...prev.fields];
      let fieldToMove = null;
      
      // Extract from root
      const rootIdx = fields.findIndex(f => f.id === fieldId);
      if (rootIdx !== -1) {
        fieldToMove = fields[rootIdx];
        fields.splice(rootIdx, 1);
      }
      
      if (!fieldToMove) return prev; // Cannot move from inside table currently

      // Insert to target
      const pIdx = fields.findIndex(f => f.id === targetParentId);
      if (pIdx !== -1) {
        const p = { ...fields[pIdx] };
        p.subFields = [...(p.subFields || []), fieldToMove];
        fields[pIdx] = p;
      }
      return { ...prev, fields };
    });
  };`;

const startIdx = code.indexOf('const handleAddField =');
const endIdx = code.indexOf('const handleSave =');
if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + handlersCode + '\n\n  ' + code.substring(endIdx);
  fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', code);
  console.log('Handlers updated');
} else {
  console.log('Failed to find replace block');
}
