const fs = require('fs');
const files = [
    'frontend/src/app/page.jsx',
    'frontend/src/components/layout/Header.jsx',
    'frontend/src/components/layout/Footer.jsx'
];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(/#DDF247/g, '#22C55E');
    code = code.replace(/221,242,71/g, '34,197,94');
    fs.writeFileSync(file, code);
});
