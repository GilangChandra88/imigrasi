const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', 'utf8');

// Undo the renaming of the main component
code = code.replace(/function SuratWriterInner\(\) \{/, 'export default function SuratWriter() {');

// Remove the appended ErrorBoundary wrapper block
const wrapperBlock = `
export default function SuratWriter() {
  return (
    <ErrorBoundary>
      <SuratWriterInner />
    </ErrorBoundary>
  );
}
`;
code = code.replace(wrapperBlock, '');

fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', code);
console.log('Restored');
