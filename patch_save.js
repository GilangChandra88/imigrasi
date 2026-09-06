
const fs = require('fs');
let code = fs.readFileSync('src/pages/TemplateBuilderV2.jsx', 'utf8');

// Patch 1: Saving
code = code.replace(
\      try {
        const dataToSave = {
          title: title,
          content: json,\,
\      try {
        const dataToSave = {
          title: title,
          content: JSON.stringify(json),\
);

// Patch 2: Loading
code = code.replace(
\            if (docSnap.exists()) {
              const data = docSnap.data();
              setTitle(data.title);
              setHasKopSurat(data.hasKopSurat || false);
              setHasJudulSurat(data.hasJudulSurat || false);
              setJudulSuratText(data.judulSuratText || '');
              setHasNomorSurat(data.hasNomorSurat || false);
              setHasInfoKanan(data.hasInfoKanan || false);
              setHasTandaTangan(data.hasTandaTangan || false);
              if (editor && data.content) {
                editor.commands.setContent(data.content);
              }
            }\,
\            if (docSnap.exists()) {
              const data = docSnap.data();
              setTitle(data.title);
              setHasKopSurat(data.hasKopSurat || false);
              setHasJudulSurat(data.hasJudulSurat || false);
              setJudulSuratText(data.judulSuratText || '');
              setHasNomorSurat(data.hasNomorSurat || false);
              setHasInfoKanan(data.hasInfoKanan || false);
              setHasTandaTangan(data.hasTandaTangan || false);
              if (editor && data.content) {
                const parsedContent = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
                editor.commands.setContent(parsedContent);
              }
            }\
);

fs.writeFileSync('src/pages/TemplateBuilderV2.jsx', code);
console.log('TemplateBuilderV2 patched!');

