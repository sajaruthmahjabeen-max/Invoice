const fs = require('fs');
const zlib = require('zlib');

function decodeAscii85(str) {
    // Remove whitespace and optional <~ and ~>
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
        if (len < 2) break; // trailing single char is invalid in standard A85 or ignored
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

// Test on one stream
const pdfContent = fs.readFileSync('c:/Users/shame/kms/pdf_work/KMS_Pharmaceuticals_Employment_Certificate.pdf', 'latin1');

function extractStream(objNum) {
    // Find "objNum 0 obj ... endobj"
    const regex = new RegExp(`${objNum}\\s+0\\s+obj([\\s\\S]*?)stream[\\r\\n]+([\\s\\S]*?)[\\r\\n]+endstream`, 'g');
    const match = regex.exec(pdfContent);
    if (!match) {
        console.log(`Could not find obj ${objNum}`);
        return null;
    }
    const dict = match[1];
    const streamRaw = match[2];
    console.log(`Obj ${objNum} Dict:`, dict.replace(/[\r\n]+/g, ' '));
    console.log(`Obj ${objNum} Raw stream length:`, streamRaw.length);
    const a85 = decodeAscii85(streamRaw);
    console.log(`Obj ${objNum} after A85:`, a85.length);
    const inflated = zlib.inflateSync(a85);
    console.log(`Obj ${objNum} after inflate:`, inflated.length);
    return { dict, data: inflated };
}

// In our earlier scan:
// Image 0 (Width 1522, Height 991, SMask 4 0 R)
// Obj 4 is SMask for Image 0
// Image 2 (Width 640, Height 218, SMask 7 0 R)
// Obj 7 is SMask for Image 2
[3, 4, 6, 7].forEach(num => {
    try {
        const res = extractStream(num);
        if (res) {
            fs.writeFileSync(`c:/Users/shame/kms/pdf_work/obj_${num}.bin`, res.data);
        }
    } catch (e) {
        console.error(`Error on obj ${num}:`, e.message);
    }
});
