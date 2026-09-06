const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', 'utf8');

const colorsBlock = `const COLOR_CLASSES = {
  purple: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300", light: "bg-purple-50", ring: "ring-purple-400" },
  cyan: { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-300", light: "bg-cyan-50", ring: "ring-cyan-400" },`;

if (!code.includes('purple: { bg:')) {
  code = code.replace('const COLOR_CLASSES = {', colorsBlock);
  fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/TemplateBuilder.jsx', code);
  console.log('Colors injected');
} else {
  console.log('Colors already there');
}
