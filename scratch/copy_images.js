import fs from 'fs';
import path from 'path';

const srcBase = 'D:\\Pictures_PJ';
const destBase = 'd:\\uva-explorer\\client\\public\\images\\places';

if (!fs.existsSync(destBase)) {
  fs.mkdirSync(destBase, { recursive: true });
}

const folderMap = {
  'addhism bangalow': 'adisham-bungalow',
  'dowa rock temple': 'dowa-rock-temple',
  'ella rock': 'ella-rock',
  'kumbalwela mahamewnawa': 'kumbalwela-mahamewnawa',
  'little adems peak': 'little-adams-peak',
  'nine arch': 'nine-arches-bridge',
  'Porogala': 'porowagala-viewpoint',
  'ravana cave': 'rawana-ella-cave',
  'ravana ella': 'ravana-fall'
};

const results = {};

for (const [folder, prefix] of Object.entries(folderMap)) {
  const folderPath = path.join(srcBase, folder);
  results[prefix] = [];
  if (fs.existsSync(folderPath)) {
    const files = fs.readdirSync(folderPath).filter(f => fs.statSync(path.join(folderPath, f)).isFile());
    files.sort();
    let idx = 1;
    for (const file of files) {
      let ext = path.extname(file).toLowerCase();
      if (!ext) ext = '.jpg';
      const newName = `${prefix}-${idx}${ext}`;
      const srcFile = path.join(folderPath, file);
      const destFile = path.join(destBase, newName);
      fs.copyFileSync(srcFile, destFile);
      const relPath = `/images/places/${newName}`;
      results[prefix].push(relPath);
      console.log(`Copied: ${file} -> ${newName}`);
      idx++;
    }
  }
}

console.log("\nFULL COPIED GALLERY MAP:");
console.log(JSON.stringify(results, null, 2));
