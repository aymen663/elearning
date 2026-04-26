const fs = require('fs');

let code = fs.readFileSync('frontend/src/app/page.jsx', 'utf8');

// Add import
code = code.replace(
  /import \{ useAuthStore \} from '@\/lib\/authStore';/,
  "import { useAuthStore } from '@/lib/authStore';\nimport { useThemeStore } from '@/lib/themeStore';"
);

// Add state and variables
code = code.replace(
  /const \{ user \} = useAuthStore\(\);/,
  `const { user } = useAuthStore();
    const { isLightMode } = useThemeStore();

    const bgMain = isLightMode ? '#FFFFFF' : '#060e0a';
    const textMain = isLightMode ? '#111827' : 'white';
    const textMuted = isLightMode ? '#4B5563' : 'rgba(255,255,255,0.5)';
    const textLight = isLightMode ? '#6B7280' : 'rgba(255,255,255,0.4)';
    const borderMain = isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
    const borderHover = isLightMode ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)';
    const cardBg = isLightMode ? '#FFFFFF' : 'rgba(255,255,255,0.03)';
    const shadowClass = isLightMode ? 'shadow-xl' : '';
    const orb1 = isLightMode ? '#F0FDF4' : '#0d4a30';
    const orb2 = isLightMode ? '#ECFDF5' : '#1a6b42';`
);

// Replace hardcoded colors with variables
code = code.replace(/background: '#060e0a'/g, "background: bgMain");
code = code.replace(/text-white\/50/g, "text-[color:var(--text-muted)]").replace(/var\(--text-muted\)/g, "${textMuted}");
code = code.replace(/text-white\/40/g, "text-[color:var(--text-light)]").replace(/var\(--text-light\)/g, "${textLight}");
code = code.replace(/text-white\/35/g, "text-[color:var(--text-light)]").replace(/var\(--text-light\)/g, "${textLight}");
code = code.replace(/text-white\/30/g, "text-[color:var(--text-light)]").replace(/var\(--text-light\)/g, "${textLight}");
code = code.replace(/text-white\/60/g, "text-[color:var(--text-muted)]").replace(/var\(--text-muted\)/g, "${textMuted}");
code = code.replace(/text-white\/65/g, "text-[color:var(--text-muted)]").replace(/var\(--text-muted\)/g, "${textMuted}");
code = code.replace(/text-white\/80/g, "text-[color:var(--text-muted)]").replace(/var\(--text-muted\)/g, "${textMuted}");

code = code.replace(/text-white/g, "text-[color:var(--text-main)]").replace(/var\(--text-main\)/g, "${textMain}");
code = code.replace(/background: '#0d4a30'/g, "background: orb1");
code = code.replace(/background: '#1a6b42'/g, "background: orb2");

// Replace borders and backgrounds
code = code.replace(/border-white\/\[0\.06\]/g, "border-[color:var(--border-main)]").replace(/var\(--border-main\)/g, "${borderMain}");
code = code.replace(/border-white\/\[0\.08\]/g, "border-[color:var(--border-main)]").replace(/var\(--border-main\)/g, "${borderMain}");
code = code.replace(/border-white\/10/g, "border-[color:var(--border-main)]").replace(/var\(--border-main\)/g, "${borderMain}");
code = code.replace(/border-white\/15/g, "border-[color:var(--border-hover)]").replace(/var\(--border-hover\)/g, "${borderHover}");
code = code.replace(/border-white\/20/g, "border-[color:var(--border-hover)]").replace(/var\(--border-hover\)/g, "${borderHover}");

code = code.replace(/background: 'rgba\(255,255,255,0\.03\)'/g, "background: cardBg");
code = code.replace(/background: 'rgba\(255,255,255,0\.02\)'/g, "background: cardBg");
code = code.replace(/background: 'rgba\(255,255,255,0\.04\)'/g, "background: cardBg");
code = code.replace(/background: 'rgba\(255,255,255,0\.06\)'/g, "background: isLightMode ? '#F9FAFB' : 'rgba(255,255,255,0.06)'");

code = code.replace(/className="(.*?)"/g, (match, p1) => {
  if (p1.includes('${')) return match; // already a template literal somehow
  if (p1.match(/text-\[color:\$\{/)) {
     return `className={\`${p1}\`}`;
  }
  if (p1.match(/border-\[color:\$\{/)) {
     return `className={\`${p1}\`}`;
  }
  return match;
});

// A simpler approach for classNames:
code = code.replace(/className="([^"]*?text-\[color:\$\{.*?\][^"]*?)"/g, "className={`$1`}");
code = code.replace(/className="([^"]*?border-\[color:\$\{.*?\][^"]*?)"/g, "className={`$1`}");

// Fix the radial gradients to be light mode friendly
code = code.replace(/background: 'radial-gradient\(circle, #1B5E40, transparent 70%\)'/g, "background: isLightMode ? 'radial-gradient(circle, #F0FDF4, transparent 70%)' : 'radial-gradient(circle, #1B5E40, transparent 70%)'");
code = code.replace(/background: 'radial-gradient\(circle at 30% 30%, #1B5E40, #0D4A35\)'/g, "background: isLightMode ? 'radial-gradient(circle at 30% 30%, #F0FDF4, #DCFCE7)' : 'radial-gradient(circle at 30% 30%, #1B5E40, #0D4A35)'");
code = code.replace(/background: 'radial-gradient\(circle at 40% 40%, #1B5E40, #0D4A35\)'/g, "background: isLightMode ? 'radial-gradient(circle at 40% 40%, #F0FDF4, #DCFCE7)' : 'radial-gradient(circle at 40% 40%, #1B5E40, #0D4A35)'");
code = code.replace(/rgba\(11,61,46,0\.8\)/g, "${isLightMode ? 'rgba(255,255,255,0.9)' : 'rgba(11,61,46,0.8)'}");
code = code.replace(/rgba\(255,255,255,0\.03\)/g, "${cardBg}");

fs.writeFileSync('frontend/src/app/page.jsx', code);
