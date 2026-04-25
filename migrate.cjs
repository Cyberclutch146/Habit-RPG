const fs = require('fs');
const path = require('path');

const files = ['Boss.tsx', 'Stats.tsx', 'Vault.tsx', 'Settings.tsx'];

for (const file of files) {
  const p = path.join('src/pages', file);
  if (!fs.existsSync(p)) continue;
  
  let t = fs.readFileSync(p, 'utf8');
  
  // Basic Next.js conversion
  t = '"use client";\n' + t;
  
  // Replace imports
  t = t.replace(/import\s+\{([^}]*?)useNavigate([^}]*?)\}\s+from\s+['"]react-router-dom['"];?/g, 
    "import { $1 $2 } from 'react-router-dom';\nimport { useRouter } from 'next/navigation';");
    
  t = t.replace(/import\s+(.*?)\s+from\s+['"]react-router-dom['"];?/g, (match, p1) => {
      // If it only imported useNavigate, it gets weird, but we are blunt
      if(p1.trim() === '{ useNavigate }' || p1.trim() === '{useNavigate}') {
          return "import { useRouter } from 'next/navigation';";
      }
      return match;
  });

  t = t.replace(/useNavigate\(\)/g, 'useRouter()');
  
  const outDir = path.join('src/app', file.toLowerCase().replace('.tsx', ''));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'page.tsx'), t);
}
console.log('Migration complete');
