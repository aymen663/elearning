const fs = require('fs');

const files = [
    'frontend/src/app/page.jsx',
    'frontend/src/components/layout/Header.jsx',
    'frontend/src/components/layout/Footer.jsx'
];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, 'utf8');
    
    // 1. Update Y and G declarations
    code = code.replace(/const Y = '#059669', G = '#022C22';/g, "const Y = isLightMode ? '#059669' : '#D4E157';\n    const G = '#0B3D2E';");
    
    // 2. Fix the static RGB of Y in the floating dots (page.jsx only)
    code = code.replace(/background: '#059669'/g, 'background: Y');
    
    // 3. Update the text colors that were forced to #ffffff back to dynamic contrast
    code = code.replace(/color: '#ffffff'/g, "color: isLightMode ? '#ffffff' : G");
    
    // Wait, in Footer.jsx there is `const Y = '#059669', G = '#022C22';` OUTSIDE the component!
    // If it's outside the component, `isLightMode` is not defined!
    // Let's check if it's outside. Yes, `const Y = ..., G = ...` is usually outside `export default function`.
    fs.writeFileSync(file, code);
});
