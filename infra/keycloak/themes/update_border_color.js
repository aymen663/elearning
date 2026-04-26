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
    
    // Update .fc border to emerald green
    code = code.replace(
        /border: 1px solid rgba\(0,0,0,0\.1\) !important;/g,
        'border: 1.5px solid #059669 !important;'
    );
    
    // Update .ip border to a softer emerald green
    code = code.replace(
        /border: 1\.5px solid rgba\(0,0,0,0\.12\) !important;/g,
        'border: 1.5px solid rgba(5,150,105,0.4) !important;'
    );
    
    // Add focus state for inputs in light mode if not exists
    if (!code.includes('.light-mode .ip:focus')) {
        code = code.replace(
            /<\/style>/,
            '.light-mode .ip:focus { border-color: #059669 !important; box-shadow: 0 0 0 4px rgba(5,150,105,0.15) !important; }\n</style>'
        );
    }
    
    fs.writeFileSync(filePath, code);
    console.log('Updated border colors in', f);
});
