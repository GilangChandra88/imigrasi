const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', 'utf8');

const newMapBlock = `                  <div className="flex flex-col gap-2 mb-3">
                    {template.fields.map((f, i) => (
                      <FieldItem
                        key={f.id}
                        field={f}
                        index={i}
                        total={template.fields.length}
                        onMoveUp={(subIndex = i, isSub = false, parentId = null) => {
                          if (isSub) handleMoveField(subIndex, -1, parentId);
                          else handleMoveField(i, -1);
                        }}
                        onMoveDown={(subIndex = i, isSub = false, parentId = null) => {
                          if (isSub) handleMoveField(subIndex, 1, parentId);
                          else handleMoveField(i, 1);
                        }}
                        onRemove={(id = f.id, parentId = null) => handleRemoveField(id)}
                        onEdit={(id = f.id, parentId = null) => {
                          setEditingFieldId(id);
                          setActiveParentId(parentId);
                          setShowFieldPicker(true);
                        }}
                        onAddSubField={(parentId) => {
                          setEditingFieldId(null);
                          setActiveParentId(parentId);
                          setShowFieldPicker(true);
                        }}
                        onMoveToTable={handleMoveToTable}
                        allGroups={template.fields.filter(x => x.type === 'table_group')}
                      />
                    ))}
                  </div>`;

const oldMapRegex = /<div className="flex flex-col gap-2 mb-3">[\s\S]*?<\/div>/;
if (code.match(oldMapRegex)) {
  code = code.replace(oldMapRegex, newMapBlock);
  console.log("Map block updated");
}

fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', code);
