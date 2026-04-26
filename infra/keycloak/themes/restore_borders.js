const fs = require('fs');
const path = require('path');

const files = [
    'infra/keycloak/themes/eduai/login/login.ftl',
    'infra/keycloak/themes/eduai/login/register.ftl'
];

files.forEach(f => {
    const filePath = path.join('d:/elearning/elearning', f);
    if (!fs.existsSync(filePath)) return;
    
    let code = fs.readFileSync(filePath, 'utf8');
    
    // Restore the form card with a visible border
    code = code.replace(
        /\.light-mode \.fc \{ background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; \}/g,
        '.light-mode .fc { background: #FFFFFF !important; border: 1px solid rgba(0,0,0,0.1) !important; box-shadow: 0 10px 40px rgba(0,0,0,0.06) !important; padding: 2.5rem !important; border-radius: 24px !important; backdrop-filter: none !important; }'
    );
    
    // Make inputs border more visible
    code = code.replace(
        /\.light-mode \.ip \{ background: #FFFFFF !important; border: 1px solid rgba\(0,0,0,0\.06\) !important; box-shadow: 0 4px 15px rgba\(0,0,0,0\.03\) !important; color: #111827 !important; \}/g,
        '.light-mode .ip { background: #FFFFFF !important; border: 1.5px solid rgba(0,0,0,0.12) !important; box-shadow: 0 2px 8px rgba(0,0,0,0.02) !important; color: #111827 !important; }'
    );
    
    fs.writeFileSync(filePath, code);
    console.log('Restored borders in', f);
});
