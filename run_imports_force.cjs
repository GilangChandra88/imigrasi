const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', 'utf8');

const correctImports = `import { useNavigate, useParams } from "react-router-dom";
import {
  FaPlus, FaTrash, FaTimes, FaArrowUp, FaArrowDown,
  FaSave, FaChevronLeft, FaCheck, FaEye, FaAlignLeft,
  FaFont, FaCalendar, FaList, FaUser, FaUsers, FaToggleOn,
  FaToggleOff, FaGripVertical, FaMinus, FaAlignJustify,
  FaListOl, FaIdCard, FaPencilAlt, FaTable
} from "react-icons/fa";

// ============================================================
// FIELD TYPE DEFINITIONS
// ============================================================`;

// Inject right after firebase/firestore
const splitPoint = '} from "firebase/firestore";';
if (code.includes(splitPoint)) {
  const parts = code.split(splitPoint);
  code = parts[0] + splitPoint + '\n' + correctImports + '\n' + parts[1].replace('// ============================================================\n// FIELD TYPE DEFINITIONS\n// ============================================================', '').trimStart();
  fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', code);
  console.log("Imports forcibly injected");
} else {
  console.log("Could not find split point");
}
