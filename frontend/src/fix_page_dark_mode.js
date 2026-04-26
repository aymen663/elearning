const fs = require('fs');

let code = fs.readFileSync('frontend/src/app/page.jsx', 'utf8');

// Remove global Y, G
code = code.replace(/const Y = '#059669', G = '#022C22';\n/g, '');

// Insert Y, G inside HomePage
code = code.replace(
    /const { isLightMode } = useThemeStore\(\);/,
    "const { isLightMode } = useThemeStore();\n    const Y = isLightMode ? '#059669' : '#D4E157';\n    const G = '#0B3D2E';"
);

// Fix orb3 background color (which was hardcoded to #059669)
code = code.replace(/background: '#059669'/g, 'background: Y');

// Fix the SVG background dots which were hardcoded to rgba(5,150,105,.03)
code = code.replace(/rgba\(5,150,105,\.03\)/g, 'rgba(var(--accent-rgb),.03)');
// Wait, I can't use var() inside a React style where I don't define `--accent-rgb`.
// Let's just leave it, or replace it with dynamic:
// `linear-gradient(${isLightMode ? 'rgba(5,150,105,.03)' : 'rgba(212,225,87,.03)'} 1px`
code = code.replace(
    /backgroundImage: 'linear-gradient\(rgba\(5,150,105,\.03\) 1px, transparent 1px\), linear-gradient\(90deg, rgba\(5,150,105,\.03\) 1px, transparent 1px\)'/g,
    "backgroundImage: `linear-gradient(${isLightMode ? 'rgba(5,150,105,.04)' : 'rgba(212,225,87,.03)'} 1px, transparent 1px), linear-gradient(90deg, ${isLightMode ? 'rgba(5,150,105,.04)' : 'rgba(212,225,87,.03)'} 1px, transparent 1px)`"
);

// Replace all color: '#ffffff' with color: isLightMode ? '#ffffff' : G
code = code.replace(/color:\s*'#ffffff'/g, "color: isLightMode ? '#ffffff' : G");

fs.writeFileSync('frontend/src/app/page.jsx', code);
