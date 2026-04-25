const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p, callback);
    } else {
      if (p.endsWith('.tsx') || p.endsWith('.ts')) {
        callback(p);
      }
    }
  });
}

walk(path.join(__dirname, 'src'), (p) => {
  let text = fs.readFileSync(p, 'utf8');
  let original = text;

  // Check if React is used (e.g. React.FC, React.useEffect)
  // Simple check: remove the import line(s) and see if 'React' appears as a word
  let withoutImports = text.replace(/import\s+React.*?from\s+['"]react['"];?/g, '');
  
  if (!/\bReact\b/.test(withoutImports)) {
    // React is not used.
    // Replace "import React from 'react';" -> ""
    text = text.replace(/^import\s+React\s+from\s+['"]react['"];?\r?\n/gm, '');
    
    // Replace "import React, { ... } from 'react';" -> "import { ... } from 'react';"
    text = text.replace(/^import\s+React\s*,\s*{/gm, 'import {');
  }

  if (text !== original) {
    fs.writeFileSync(p, text);
    console.log(`Cleaned ${p}`);
  }
});
