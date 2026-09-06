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

code = code.replace(/} from "firebase\/firestore";\nconst FIELD_TYPES = \[/, `} from "firebase/firestore";\n${correctImports}\nconst FIELD_TYPES = [`);

fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', code);
console.log('Restored imports');
