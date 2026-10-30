const fs = require('fs');
const path = require('path');

const REPLACEMENTS = [
  // Primary Teal replacements
  { from: /#2D6A4F/gi, to: '#0F766E' },
  { from: /#23543E/gi, to: '#115E59' },
  { from: /#245740/gi, to: '#115E59' },
  { from: /#1B4332/gi, to: '#134E4A' },
  { from: /#357A5B/gi, to: '#0D9488' },
  { from: /#408A68/gi, to: '#14B8A6' },
  { from: /#40916C/gi, to: '#14B8A6' },
  { from: /#52B788/gi, to: '#2DD4BF' },
  { from: /#74C69D/gi, to: '#5EEAD4' },

  // Secondary Coral replacements
  { from: /#C97B4A/gi, to: '#F97316' },
  { from: /#A85222/gi, to: '#EA580C' },
  { from: /#91451C/gi, to: '#C2410C' },
  { from: /#B35F2B/gi, to: '#EA580C' },
  { from: /#B36839/gi, to: '#EA580C' },
  { from: /#E58A54/gi, to: '#FB923C' },
  { from: /#EE9A68/gi, to: '#FDBA74' },
  { from: /#D48956/gi, to: '#FB923C' },

  // Background Canvas & Surfaces
  { from: /#FAF7F2/gi, to: '#F4F7F6' },
  { from: /#F8F6F1/gi, to: '#F4F7F6' },
  { from: /#F0EBE1/gi, to: '#E8F0EE' },
  { from: /#F0F7F4/gi, to: '#ECFDF5' },
  { from: /#EAE5D8/gi, to: '#E1ECE9' },

  // Borders
  { from: /#E6DFC6/gi, to: '#E0E7E5' },
  { from: /#D8CEB3/gi, to: '#CFDAD6' },
  { from: /#E4DCCE/gi, to: '#DCE5E2' },
  { from: /#CBE3D8/gi, to: '#CCFBF1' },

  // Text
  { from: /#22291F/gi, to: '#132226' },
  { from: /#52584E/gi, to: '#455A60' },
  { from: /#6B6B63/gi, to: '#5A7178' },
  { from: /#62685E/gi, to: '#52676D' },
  { from: /#8E8E84/gi, to: '#758D94' },

  // Dark Mode Slate
  { from: /#131713/gi, to: '#0B1114' },
  { from: /#151915/gi, to: '#0B1114' },
  { from: /#1A1D19/gi, to: '#0B1114' },
  { from: /#1C221C/gi, to: '#121C21' },
  { from: /#242C24/gi, to: '#19272D' },
  { from: /#2F3B2F/gi, to: '#21333A' },
  { from: /#445644/gi, to: '#2C444E' },
  { from: /#C4CFC3/gi, to: '#9DB4BA' },
  { from: /#94A493/gi, to: '#79949B' },
  { from: /#F5F1EA/gi, to: '#F0F7F6' }
];

function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist') {
        processDirectory(fullPath);
      }
    } else if (entry.isFile() && /\.(jsx?|tsx?|css|html)$/i.test(entry.name)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      for (const { from, to } of REPLACEMENTS) {
        if (from.test(content)) {
          content = content.replace(from, to);
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${path.relative(process.cwd(), fullPath)}`);
      }
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  for (const { from, to } of REPLACEMENTS) {
    if (from.test(content)) {
      content = content.replace(from, to);
      modified = true;
    }
  }
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${path.relative(process.cwd(), filePath)}`);
  }
}

console.log('Transforming site to Palette B: Nordic Sea Teal & Coral...');
processDirectory(path.join(process.cwd(), 'src'));
processFile(path.join(process.cwd(), 'index.html'));
console.log('Transformation complete!');
