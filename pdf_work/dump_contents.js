const fs = require('fs');
const zlib = require('zlib');

function decodeAscii85(str) {
    let s = str.replace(/\s+/g, '');
    if (s.startsWith('<~')) s = s.slice(2);
    const endIdx = s.indexOf('~>');
    if (endIdx !== -1) s = s.slice(0, endIdx);

    const out = [];
    let i = 0;
    while (i < s.length) {
        if (s[i] === 'z') {
            out.push(0, 0, 0, 0);
            i++;
            continue;
        }
        let chunk = '';
        while (chunk.length < 5 && i < s.length) {
            if (s[i] === 'z') break;
            chunk += s[i];
            i++;
        }
        const len = chunk.length;
        if (len < 2) break;
        let padded = chunk;
        while (padded.length < 5) padded += 'u';
        let val = 0;
        for (let j = 0; j < 5; j++) {
            val = val * 85 + (padded.charCodeAt(j) - 33);
        }
        const bytes = [
            (val >>> 24) & 0xff,
            (val >>> 16) & 0xff,
            (val >>> 8) & 0xff,
            val & 0xff
        ];
        out.push(...bytes.slice(0, len - 1));
    }
    return Buffer.from(out);
}

const str = fs.readFileSync('c:/Users/shame/kms/pdf_work/KMS_Pharmaceuticals_Employment_Certificate.pdf', 'latin1');
const regex = /13\s+0\s+obj([\s\S]*?)stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
const match = regex.exec(str);
if (match) {
    console.log('Dict:', match[1]);
    const a85 = decodeAscii85(match[2]);
    const decomp = zlib.inflateSync(a85).toString('latin1');
    console.log('Decompressed length:', decomp.length);
    fs.writeFileSync('c:/Users/shame/kms/pdf_work/page1_stream.txt', decomp);
    console.log('Written to page1_stream.txt');
}
