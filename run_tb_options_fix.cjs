const fs = require('fs');

let tbCode = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', 'utf8');

const regexConfirm = /const handleConfirm = \(\) => \{[\s\S]*?onClose\(\);\s*\};/;

const confirmNew = `const [options, setOptions] = useState(editingField?.options || ["Opsi 1", "Opsi 2"]);

    const handleConfirm = () => {
      const isMulti = selectedType.type === "row_multi";
      if (!isMulti && !label.trim()) return;
      
      const isSeparator = selectedType.type === "separator";
      const generatedName = label.trim() ? label.trim().toLowerCase().replace(/\\s+/g, "_").replace(/[^a-z0-9_]/g, "") : \`multi_\${Date.now()}\`;
      const name = isSeparator ? \`separator_\${Date.now()}\` : generatedName;
      
      onSelect({
        id: editingField ? editingField.id : \`f_\${Date.now()}\`,
        type: selectedType.type,
        label: label.trim(),
        name: editingField ? editingField.name : (name || selectedType.type),
        required: isSeparator ? false : required,
        defaultValue: defaultValue.trim(),
        ...(isMulti && { options: options.map(o => o.trim()).filter(Boolean) })
      });
      onClose();
    };`;

if (regexConfirm.test(tbCode)) {
    tbCode = tbCode.replace(regexConfirm, confirmNew);
    fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', tbCode);
    console.log('TemplateBuilder hooks updated successfully!');
} else {
    console.log('REGEX FAILED TO MATCH');
}
