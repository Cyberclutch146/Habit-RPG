const fs = require('fs');
const path = require('path');

const files = [
  'src/app/boss/page.tsx',
  'src/app/stats/page.tsx',
  'src/app/vault/page.tsx',
  'src/app/settings/page.tsx'
];

for (const p of files) {
  if (!fs.existsSync(p)) continue;
  
  let t = fs.readFileSync(p, 'utf8');
  
  // Remove imports
  t = t.replace(/import\s+\{\s*TopBar\s*\}\s*from\s*['"][^'"]+['"];?/g, '');
  t = t.replace(/import\s+\{\s*BottomNav\s*\}\s*from\s*['"][^'"]+['"];?/g, '');
  
  // Remove JSX usage
  t = t.replace(/<TopBar\s*\/>/g, '');
  t = t.replace(/<BottomNav\s*\/>/g, '');
  
  fs.writeFileSync(p, t);
}
console.log('Fixed imports');
