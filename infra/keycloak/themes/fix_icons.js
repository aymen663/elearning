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
    
    if (!code.includes('.light-mode .ip-ic')) {
        code = code.replace(
            /<\/style>/,
            '.light-mode .ip-ic { color: #9CA3AF !important; }\n.light-mode .fg:has(.ip:focus) .ip-ic { color: #059669 !important; }\n</style>'
        );
        fs.writeFileSync(filePath, code);
        console.log('Fixed icon colors in', f);
    }
});
