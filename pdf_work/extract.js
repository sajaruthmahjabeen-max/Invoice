const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const buf = fs.readFileSync('c:/Users/shame/kms/pdf_work/KMS_Pharmaceuticals_Employment_Certificate.pdf');
console.log('PDF loaded, length:', buf.length);

const str = buf.toString('latin1');
const matches = [...str.matchAll(/\/Subtype\s*\/Image/g)];
console.log('Found Image objects count:', matches.length);

matches.forEach((m, idx) => {
    const start = Math.max(0, m.index - 100);
    const end = Math.min(str.length, m.index + 300);
    console.log(`\n--- Image Object ${idx} ---`);
    console.log(str.substring(start, end).replace(/[\r\n]+/g, ' '));
});
