const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', 'utf8');

const regex = /import \{ useNavigate, useParams \} from "react-router-dom";\nimport \{\n  FaPlus, FaTrash, FaTimes, FaArrowUp, FaArrowDown,\n  FaSave, FaChevronLeft, FaCheck, FaEye, FaAlignLeft,\n  FaFont, FaCalendar, FaList, FaUser, FaUsers, FaToggleOn,\n  FaToggleOff, FaGripVertical, FaMinus, FaAlignJustify,\n  FaListOl, FaIdCard, FaPencilAlt\n\} from "react-icons\/fa";\n/;
code = code.replace(regex, '');
fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', code);
console.log('Duplicates removed');
