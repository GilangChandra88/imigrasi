const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', 'utf8');

const exactDropdown = `{!isSub && allGroups && allGroups.length > 0 && (
            <select 
              className="text-[10px] p-1 border rounded bg-slate-50 text-slate-600 outline-none max-w-[80px] cursor-pointer"
              onChange={(e) => {
                if (e.target.value) onMoveToTable(field.id, e.target.value);
                e.target.value = "";
              }}
            >
              <option value="">Pindah ke...</option>
              {allGroups.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
            </select>
          )}`;

if (code.includes(exactDropdown)) {
  code = code.replace(exactDropdown, '');
  fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', code);
  console.log('Dropdown removed successfully');
} else {
  console.log('Could not find exact dropdown string');
}
