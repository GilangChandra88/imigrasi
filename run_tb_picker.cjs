const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', 'utf8');

// 1. Update FieldPickerModal definition
code = code.replace(
  'function FieldPickerModal({ onClose, onSelect, editingField }) {',
  'function FieldPickerModal({ onClose, onSelect, editingField, isSubField }) {'
);

code = code.replace(
  'const [selectedType, setSelectedType] = useState(editingField ? getTypeInfo(editingField.type) : null);',
  'const [selectedType, setSelectedType] = useState(editingField ? (isSubField ? getTableRowTypeInfo(editingField.type) : getTypeInfo(editingField.type)) : null);'
);

code = code.replace(
  '{FIELD_TYPES.map((ft) => {',
  '{(isSubField ? TABLE_ROW_TYPES : FIELD_TYPES).map((ft) => {'
);

// 2. Update FieldPickerModal rendering
const oldPicker = `{showFieldPicker && (
        <FieldPickerModal
          onClose={() => {
            setShowFieldPicker(false);
            setEditingFieldId(null);
          }}
          onSelect={handleAddField}
          editingField={editingFieldId ? template.fields.find(f => f.id === editingFieldId) : null}
        />
      )}`;

const newPicker = `{showFieldPicker && (
        <FieldPickerModal
          onClose={() => {
            setShowFieldPicker(false);
            setEditingFieldId(null);
            setActiveParentId(null);
          }}
          onSelect={handleAddField}
          editingField={editingFieldId ? (() => {
            for (let f of template.fields) {
              if (f.id === editingFieldId) return f;
              if (f.subFields) {
                const sub = f.subFields.find(s => s.id === editingFieldId);
                if (sub) return sub;
              }
            }
            return null;
          })() : null}
          isSubField={!!activeParentId}
        />
      )}`;

code = code.replace(oldPicker, newPicker);

fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', code);
console.log('FieldPickerModal updated');
