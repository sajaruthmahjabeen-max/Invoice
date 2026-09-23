const fs = require('fs');
const zlib = require('zlib');
const str = fs.readFileSync('c:/Users/shame/kms/pdf_work/KMS_Pharmaceuticals_Employment_Certificate.pdf', 'latin1');

const objMatches = [...str.matchAll(/(\d+)\s+0\s+obj([\s\S]*?)endobj/g)];
console.log('Total objects:', objMatches.length);

objMatches.forEach(m => {
    const num = m[1];
    const body = m[2];
    if (body.includes('/Contents') || body.includes('/Type /Page')) {
        console.log('Page/Contents Obj', num, ':', body.substring(0, 300).replace(/[\r\n]+/g, ' '));
    }
});
