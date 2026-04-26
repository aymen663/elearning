const fs = require('fs');

let code = fs.readFileSync('frontend/src/app/page.jsx', 'utf8');

// 1. Update bgMain to be a soft gradient in light mode
code = code.replace(
    /const bgMain = isLightMode \? '#FFFFFF' : '#060e0a';/,
    "const bgMain = isLightMode ? 'linear-gradient(135deg, #FFFFFF 0%, #F4F7F6 50%, #EAEFE9 100%)' : '#060e0a';"
);

// 2. Add FLOATING_DOTS array right after CHECKS
const floatingDotsArray = `
const FLOATING_DOTS = [
    { top: '10%', left: '5%', size: 4, dur: 15, delay: 0 },
    { top: '25%', left: '80%', size: 6, dur: 18, delay: 2 },
    { top: '45%', left: '15%', size: 3, dur: 12, delay: 5 },
    { top: '70%', left: '85%', size: 5, dur: 20, delay: 1 },
    { top: '85%', left: '25%', size: 7, dur: 22, delay: 3 },
    { top: '15%', left: '45%', size: 4, dur: 14, delay: 4 },
    { top: '55%', left: '60%', size: 5, dur: 17, delay: 2 },
    { top: '90%', left: '70%', size: 3, dur: 16, delay: 1 },
    { top: '35%', left: '30%', size: 6, dur: 19, delay: 0 },
    { top: '80%', left: '10%', size: 4, dur: 15, delay: 3 },
    { top: '5%', left: '65%', size: 5, dur: 21, delay: 4 },
    { top: '65%', left: '40%', size: 7, dur: 23, delay: 2 },
    { top: '50%', left: '90%', size: 4, dur: 16, delay: 1 },
    { top: '20%', left: '20%', size: 5, dur: 18, delay: 3 },
    { top: '75%', left: '55%', size: 6, dur: 20, delay: 5 },
];
`;

if (!code.includes('const FLOATING_DOTS')) {
    code = code.replace(/(const CHECKS = \[.*?\];)/, `$1\n${floatingDotsArray}`);
}

// 3. Inject the floating dots into the fixed background layer
const backgroundLayerMatch = `<div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(221,242,71,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(221,242,71,.03) 1px, transparent 1px)', backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)', WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)' }} />`;

const floatingDotsJSX = `
                {/* Global Floating Dots */}
                {FLOATING_DOTS.map((dot, i) => (
                    <motion.div key={i}
                        className="absolute rounded-full"
                        style={{
                            width: dot.size,
                            height: dot.size,
                            top: dot.top,
                            left: dot.left,
                            background: Y,
                            opacity: isLightMode ? 0.6 : 0.2
                        }}
                        animate={{
                            y: [0, -60, 0],
                            x: [0, 30, 0],
                            opacity: [isLightMode ? 0.6 : 0.2, isLightMode ? 1 : 0.5, isLightMode ? 0.6 : 0.2]
                        }}
                        transition={{
                            duration: dot.dur,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: dot.delay
                        }}
                    />
                ))}
`;

if (!code.includes('Global Floating Dots')) {
    code = code.replace(backgroundLayerMatch, `${backgroundLayerMatch}\n${floatingDotsJSX}`);
}

fs.writeFileSync('frontend/src/app/page.jsx', code);
