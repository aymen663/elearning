const fs = require('fs');

const files = [
    'frontend/src/app/page.jsx',
    'frontend/src/components/layout/Header.jsx',
    'frontend/src/components/layout/Footer.jsx'
];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, 'utf8');
    
    // Replace accent color Y (Green -> Professional Blue)
    code = code.replace(/#22C55E/g, '#3B82F6');
    code = code.replace(/34,197,94/g, '59,130,246');
    
    // Replace dark mode background G (Dark Green -> Professional Slate 900)
    code = code.replace(/#0B3D2E/g, '#0F172A');
    
    // Fix text colors on the accent background (Blue needs White text, not Dark Slate)
    // Replace `color: G` with `color: '#ffffff'` 
    code = code.replace(/color:\s*G/g, "color: '#ffffff'");
    
    // Except where G was used as a fallback color in "HOW IT WORKS" section
    // 'style={{ background: i === 1 ? G : 'rgba(255,255,255,0.06)' }}' is fine.
    
    fs.writeFileSync(file, code);
});
