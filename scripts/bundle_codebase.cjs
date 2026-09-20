const fs = require('fs');
const path = require('path');

const excludeDirs = new Set(['node_modules', 'dist', '.git', '.gemini']);
const excludeFiles = new Set(['package-lock.json', 'FULL_CODEBASE_FOR_AI.md', 'bundle_codebase.cjs']);
const binaryExtensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot']);

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const dirent of list) {
    if (excludeDirs.has(dirent.name)) continue;
    const res = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      results = results.concat(getFiles(res));
    } else {
      if (!excludeFiles.has(dirent.name) && !binaryExtensions.has(path.extname(dirent.name).toLowerCase())) {
        results.push(res);
      }
    }
  }
  return results;
}

const rootDir = process.cwd();
const files = getFiles(rootDir).sort();

let output = '# COMMUNITY SERVICE APPLICATION - COMPLETE CODEBASE\n\n';
output += 'This document contains all source code and configuration files for the project.\n';
output += 'Generated on: ' + new Date().toISOString() + '\n\n';

output += '## Project File Tree\n```text\n';
files.forEach(f => {
  output += path.relative(rootDir, f).replace(/\\/g, '/') + '\n';
});
output += '```\n\n---\n\n';

const extToLang = {
  '.js': 'javascript',
  '.jsx': 'jsx',
  '.json': 'json',
  '.html': 'html',
  '.css': 'css',
  '.mjs': 'javascript',
  '.rules': 'text',
  '.ejs': 'html',
  '.md': 'markdown',
  '.env': 'bash'
};

files.forEach(file => {
  const relPath = path.relative(rootDir, file).replace(/\\/g, '/');
  const ext = path.extname(file).toLowerCase();
  const lang = extToLang[ext] || '';
  const content = fs.readFileSync(file, 'utf8');

  output += '================================================================================\n';
  output += 'FILE: ' + relPath + '\n';
  output += '================================================================================\n';
  output += '```' + lang + '\n';
  output += content + (content.endsWith('\n') ? '' : '\n');
  output += '```\n\n';
});

fs.writeFileSync(path.join(rootDir, 'FULL_CODEBASE_FOR_AI.md'), output, 'utf8');
console.log('Successfully generated FULL_CODEBASE_FOR_AI.md! Total files: ' + files.length + ', Total bytes: ' + fs.statSync(path.join(rootDir, 'FULL_CODEBASE_FOR_AI.md')).size);
