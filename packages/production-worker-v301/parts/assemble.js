// Assemble the recovered v301 artifact from parts and verify integrity.
// Usage: node assemble.js  -> writes ../buildsignal-worker-v301-production-original.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const manifest = require('./manifest.json');
let out = '';
for (const m of manifest.parts) {
  const p = fs.readFileSync(path.join(__dirname, `artifact.part${String(m.part).padStart(2,'0')}.js`), 'utf8');
  const h = crypto.createHash('sha256').update(p, 'utf8').digest('hex');
  if (h !== m.sha256) throw new Error(`part ${m.part} checksum mismatch`);
  out += p;
}
const g = crypto.createHash('sha256').update(out, 'utf8').digest('hex');
if (out.length !== manifest.length || g !== manifest.sha256) throw new Error('global checksum mismatch');
fs.writeFileSync(path.join(__dirname, '..', 'buildsignal-worker-v301-production-original.js'), out);
console.log('OK', out.length, g);
