const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', 'utf8');

const regex = /\{ judul_surat, dengan_nomor_surat, dengan_penandatangan, fields \}/;
code = code.replace(regex, '{ judul_surat, dengan_nomor_surat, dengan_penandatangan, layout_tabel, fields }');
// Also try without spaces
code = code.replace(/\{judul_surat, dengan_nomor_surat, dengan_penandatangan, fields\}/, '{judul_surat, dengan_nomor_surat, dengan_penandatangan, layout_tabel, fields}');
code = code.replace(/\{judul_surat, dengan_nomor_surat, dengan_penandatangan, fields \}/, '{judul_surat, dengan_nomor_surat, dengan_penandatangan, layout_tabel, fields}');

const newBlock = `{!fields || fields.length === 0 ? (
          <div className="flex flex-col gap-3">
            <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg text-[11px]">
              Tambahkan field di panel kiri untuk melihat preview
            </div>
          </div>
        ) : layout_tabel ? (
          <>
            <style>{\`
              .spd-hide-labels .grid { display: block !important; gap: 0 !important; }
              .spd-hide-labels .grid > .text-slate-700 { display: none !important; }
              .spd-hide-labels .grid > .flex > .w-5.text-center.shrink-0 { display: none !important; }
            \`}</style>
            <table className="w-full border-collapse border border-slate-800 text-[12px] my-2">
              <tbody>
                {(() => {
                  let counter = 1;
                  return fields.map((f) => {
                    if (f.type === "separator") {
                      return (
                        <tr key={f.id}>
                          <td colSpan={3} className="border border-slate-800 p-1.5 text-center font-bold tracking-widest text-[12px] text-slate-700">
                            {f.label || "— SEPARATOR —"}
                          </td>
                        </tr>
                      );
                    }
                    const num = counter++;
                    const ft = getTypeInfo(f.type);
                    return (
                      <tr key={f.id} className="align-top">
                        <td className="border border-slate-800 p-1.5 w-6 text-center">{num}</td>
                        <td className="border border-slate-800 p-1.5 w-40 font-semibold">{f.label}</td>
                        <td className="border border-slate-800 p-1.5">
                          <div className="spd-hide-labels">
                            {ft.preview(f.label, f.defaultValue)}
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </>
        ) : (
          <div className="flex flex-col gap-3">
            {fields.map((f) => {
              if (f.type === "separator") {
                return (
                  <div key={f.id} className="text-center font-bold tracking-widest my-2 text-[12px] text-slate-700">
                    {f.label || "— SEPARATOR —"}
                  </div>
                );
              }
              const ft = getTypeInfo(f.type);
              return <div key={f.id}>{ft.preview(f.label, f.defaultValue)}</div>;
            })}
          </div>
        )}`;

const replaceRegex = /<div className="flex flex-col gap-3">\s*\{\!fields \|\| fields\.length === 0 \? \([\s\S]*?\}\)\s*\)\}\s*<\/div>/;

if (replaceRegex.test(code)) {
  code = code.replace(replaceRegex, newBlock);
  fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', code);
  console.log('TemplateBuilder.jsx updated for layout_tabel preview');
} else {
  console.log('Failed to match block');
}
