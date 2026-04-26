const fs = require('fs');

let code = fs.readFileSync('frontend/src/app/page.jsx', 'utf8');

// Replace string interpolations back to CSS variables
code = code.replace(/\$\{textMain\}/g, 'var(--text-main)');
code = code.replace(/\$\{textMuted\}/g, 'var(--text-muted)');
code = code.replace(/\$\{textLight\}/g, 'var(--text-light)');
code = code.replace(/\$\{borderMain\}/g, 'var(--border-main)');
code = code.replace(/\$\{borderHover\}/g, 'var(--border-hover)');

// Remove the now-unnecessary template literal backticks around classNames if there are no other interpolations
// Actually, it's safer to just leave the backticks or replace them manually.
code = code.replace(/className=\{`([^`]+)`\}/g, (match, p1) => {
    // If there is still a $ inside, keep backticks, else replace with quotes
    if (p1.includes('$')) {
        return match;
    }
    return `className="${p1}"`;
});

// Update the root wrapper div to provide the CSS variables
const rootDivMatch = `<div className="min-h-screen overflow-x-hidden" style={{ background: bgMain, position: 'relative' }}>`;
const rootDivReplacement = `<div className="min-h-screen overflow-x-hidden" style={{ 
            background: bgMain, position: 'relative',
            '--text-main': textMain,
            '--text-muted': textMuted,
            '--text-light': textLight,
            '--border-main': borderMain,
            '--border-hover': borderHover
        }}>`;

code = code.replace(rootDivMatch, rootDivReplacement);

fs.writeFileSync('frontend/src/app/page.jsx', code);
