const fs = require('fs');
const files = [
    'frontend/src/app/page.jsx',
    'frontend/src/components/layout/Header.jsx',
    'frontend/src/components/layout/Footer.jsx'
];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(/#D4E157/g, '#DDF247');
    code = code.replace(/212,225,87/g, '221,242,71'); // RGB for #DDF247
    fs.writeFileSync(file, code);
});
