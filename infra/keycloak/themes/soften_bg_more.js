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
    
    // Update the background to the darker off-white
    code = code.replace(
        /body\.light-mode \{ background: linear-gradient\(135deg, #F8FAF9 0%, #F1F5F3 50%, #E8ECE9 100%\) !important; \}/g,
        'body.light-mode { background: linear-gradient(135deg, #EEF2F0 0%, #E2E8E5 50%, #D1D8D4 100%) !important; }'
    );
    
    fs.writeFileSync(filePath, code);
    console.log('Soften background even more in', f);
});
