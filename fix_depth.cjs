const fs = require('fs');
const files = [
  'src/app/boss/page.tsx',
  'src/app/stats/page.tsx',
  'src/app/vault/page.tsx',
  'src/app/settings/page.tsx'
];

for (const p of files) {
  if (fs.existsSync(p)) {
    let t = fs.readFileSync(p, 'utf8');
    t = t.replace(/from\s+['"]\.\.\//g, "from '../../");
    fs.writeFileSync(p, t);
  }
}

console.log('Fixed depth references');
