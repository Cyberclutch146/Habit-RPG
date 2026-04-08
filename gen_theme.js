const fs = require('fs');

const darkColors = {
  "on-secondary-fixed": "#1b1c1c",
  "on-surface-variant": "#e3bebb",
  "outline": "#aa8986",
  "on-tertiary-fixed": "#1b1c1c",
  "on-error-container": "#ffdad6",
  "on-error": "#690005",
  "on-secondary-container": "#b5b5b5",
  "on-tertiary-fixed-variant": "#474746",
  "on-background": "#e5e2e1",
  "background": "#131313",
  "outline-variant": "#5a403e",
  "on-tertiary-container": "#f9f7f6",
  "error": "#ffb4ab",
  "on-primary": "#68000c",
  "primary-fixed": "#ffdad7",
  "on-tertiary": "#303030",
  "error-container": "#93000a",
  "secondary-fixed": "#e3e2e2",
  "surface-container-highest": "#353534",
  "surface-container": "#201f1f",
  "on-primary-fixed": "#410004",
  "surface-tint": "#ffb3ae",
  "primary": "#ffb3ae",
  "tertiary-fixed-dim": "#c8c6c5",
  "primary-container": "#d13639",
  "on-primary-fixed-variant": "#930015",
  "inverse-primary": "#b62129",
  "tertiary-fixed": "#e4e2e1",
  "inverse-on-surface": "#313030",
  "surface-container-low": "#1c1b1b",
  "tertiary": "#c8c6c5",
  "secondary-container": "#464747",
  "surface-container-high": "#2a2a2a",
  "secondary": "#c7c6c6",
  "surface": "#131313",
  "on-surface": "#e5e2e1",
  "surface-dim": "#131313",
  "surface-container-lowest": "#0e0e0e",
  "surface-bright": "#3a3939",
  "on-secondary": "#303031",
  "inverse-surface": "#e5e2e1",
  "tertiary-container": "#727171",
  "on-primary-container": "#fff4f3",
  "on-secondary-fixed-variant": "#464747",
  "primary-fixed-dim": "#ffb3ae",
  "secondary-fixed-dim": "#c7c6c6",
  "surface-variant": "#353534"
};

const lightColors = {
  "on-secondary-fixed": "#1b1c1c",
  "on-surface-variant": "#524443", // dark pink/brown
  "outline": "#857371",
  "on-tertiary-fixed": "#1b1c1c",
  "on-error-container": "#410002",
  "on-error": "#ffffff",
  "on-secondary-container": "#1d192b",
  "on-tertiary-fixed-variant": "#474746",
  "on-background": "#201a1a",
  "background": "#fffbff",
  "outline-variant": "#d7c1c0",
  "on-tertiary-container": "#111010",
  "error": "#ba1a1a",
  "on-primary": "#ffffff",
  "primary-fixed": "#ffdad7",
  "on-tertiary": "#ffffff",
  "error-container": "#ffdad6",
  "secondary-fixed": "#e3e2e2",
  "surface-container-highest": "#e5e2e1",
  "surface-container": "#f1efee",
  "on-primary-fixed": "#410004",
  "surface-tint": "#b62129",
  "primary": "#b62129", // dark red
  "tertiary-fixed-dim": "#c8c6c5",
  "primary-container": "#ffdad7",
  "on-primary-fixed-variant": "#930015",
  "inverse-primary": "#ffb3ae",
  "tertiary-fixed": "#e4e2e1",
  "inverse-on-surface": "#f4f0ef",
  "surface-container-low": "#f7f5f4",
  "tertiary": "#5d5e5e",
  "secondary-container": "#e8def8",
  "surface-container-high": "#ebe9e8",
  "secondary": "#625b71",
  "surface": "#fffbff",
  "on-surface": "#201a1a",
  "surface-dim": "#ded8d7",
  "surface-container-lowest": "#ffffff",
  "surface-bright": "#fffbff",
  "on-secondary": "#ffffff",
  "inverse-surface": "#313030",
  "tertiary-container": "#f9f7f6",
  "on-primary-container": "#410002",
  "on-secondary-fixed-variant": "#464747",
  "primary-fixed-dim": "#ffb3ae",
  "secondary-fixed-dim": "#c7c6c6",
  "surface-variant": "#f4dddb"
};

let css = `@layer base {
  :root {
`;
for (let [k,v] of Object.entries(lightColors)) {
  css += `    --color-${k}: ${v};\n`;
}
css += `  }

  .dark {
`;
for (let [k,v] of Object.entries(darkColors)) {
  css += `    --color-${k}: ${v};\n`;
}
css += `  }
}
`;

const tailwindColors = {};
for (let k of Object.keys(darkColors)) {
  tailwindColors[k] = `var(--color-${k})`;
}

fs.writeFileSync('C:\\Users\\blazi\\Downloads\\Habit-RPG\\src\\theme.css', css);
fs.writeFileSync('C:\\Users\\blazi\\Downloads\\Habit-RPG\\theme.json', JSON.stringify(tailwindColors, null, 2));

console.log("Done");
