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
    
    if (!code.includes('.light-mode .sb svg[fill=')) {
        code = code.replace(
            /<\/style>/,
            '.light-mode .sb svg[fill="rgba(255,255,255,.5)"] { fill: #111827 !important; }\n</style>'
        );
        fs.writeFileSync(filePath, code);
        console.log('Fixed github icon in', f);
    }
});
