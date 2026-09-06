const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', 'utf8');

const lines = code.split(/\r?\n/);

// find the second import { useNavigate...
let secondImportIdx = -1;
let firstFound = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('import { useNavigate, useParams } from "react-router-dom";')) {
    if (firstFound) {
      secondImportIdx = i;
      break;
    }
    firstFound = true;
  }
}

if (secondImportIdx !== -1) {
  // delete from secondImportIdx down to the closing brace of react-icons/fa
  let endIdx = -1;
  for (let i = secondImportIdx; i < lines.length; i++) {
    if (lines[i].includes('} from "react-icons/fa";')) {
      endIdx = i;
      break;
    }
  }
  
  if (endIdx !== -1) {
    lines.splice(secondImportIdx, endIdx - secondImportIdx + 1);
    fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', lines.join('\n'));
    console.log('Duplicates successfully deleted using array splice');
  } else {
    console.log('Could not find end of second import');
  }
} else {
  console.log('Could not find second import');
}
