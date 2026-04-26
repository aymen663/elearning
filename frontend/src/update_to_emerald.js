const fs = require('fs');

const files = [
    'frontend/src/app/page.jsx',
    'frontend/src/components/layout/Header.jsx',
    'frontend/src/components/layout/Footer.jsx'
];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, 'utf8');
    
    // Replace Professional Blue -> Professional Emerald Green (Easy on eyes)
    code = code.replace(/#3B82F6/g, '#059669');
    code = code.replace(/59,130,246/g, '5,150,105');
    
    // Replace Professional Slate -> Professional Deep Emerald Night
    code = code.replace(/#0F172A/g, '#022C22');
    
    fs.writeFileSync(file, code);
});
