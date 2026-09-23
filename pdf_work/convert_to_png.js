const fs = require('fs');
const zlib = require('zlib');

// PNG file structure writer:
// 8-byte PNG signature: 89 50 4E 47 0D 0A 1A 0A
// IHDR chunk
// IDAT chunk (zlib deflated scanlines with filter type 0)
// IEND chunk

function crc32(buf) {
    let table = [];
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let k = 0; k < 8; k++) {
            c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        table[i] = c;
    }
    let crc = 0 ^ (-1);
    for (let i = 0; i < buf.length; i++) {
        crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const combined = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(combined), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function writeRGBAtoPNG(w, h, rgbBuf, alphaBuf, outputPath) {
    // 8 bytes PNG signature
    const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

    // IHDR: width(4), height(4), bitDepth(1)=8, colorType(1)=6 (RGBA), compression(1)=0, filter(1)=0, interlace(1)=0
    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(w, 0);
    ihdrData.writeUInt32BE(h, 4);
    ihdrData[8] = 8;
    ihdrData[9] = 6; // RGBA
    ihdrData[10] = 0;
    ihdrData[11] = 0;
    ihdrData[12] = 0;
    const ihdrChunk = makeChunk('IHDR', ihdrData);

    // IDAT raw scanlines: each scanline has 1 byte filter type (0) + w * 4 bytes
    const scanlineLen = 1 + w * 4;
    const rawScanlines = Buffer.alloc(h * scanlineLen);

    let srcRgbIdx = 0;
    let srcAlphaIdx = 0;
    let dstIdx = 0;

    for (let y = 0; y < h; y++) {
        rawScanlines[dstIdx++] = 0; // Filter byte: None
        for (let x = 0; x < w; x++) {
            rawScanlines[dstIdx++] = rgbBuf[srcRgbIdx++];     // R
            rawScanlines[dstIdx++] = rgbBuf[srcRgbIdx++];     // G
            rawScanlines[dstIdx++] = rgbBuf[srcRgbIdx++];     // B
            rawScanlines[dstIdx++] = alphaBuf ? alphaBuf[srcAlphaIdx++] : 255; // A
        }
    }

    const compressed = zlib.deflateSync(rawScanlines, { level: 9 });
    const idatChunk = makeChunk('IDAT', compressed);
    const iendChunk = makeChunk('IEND', Buffer.alloc(0));

    const png = Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
    fs.writeFileSync(outputPath, png);
    console.log(`Saved PNG: ${outputPath} (${w}x${h})`);
}

// Write image 0 (Obj 3 + Obj 4) -> 1522 x 991
const rgb3 = fs.readFileSync('c:/Users/shame/kms/pdf_work/obj_3.bin');
const alpha4 = fs.readFileSync('c:/Users/shame/kms/pdf_work/obj_4.bin');
writeRGBAtoPNG(1522, 991, rgb3, alpha4, 'c:/Users/shame/kms/pdf_work/extracted_img1.png');

// Write image 1 (Obj 6 + Obj 7) -> 640 x 218
const rgb6 = fs.readFileSync('c:/Users/shame/kms/pdf_work/obj_6.bin');
const alpha7 = fs.readFileSync('c:/Users/shame/kms/pdf_work/obj_7.bin');
writeRGBAtoPNG(640, 218, rgb6, alpha7, 'c:/Users/shame/kms/pdf_work/extracted_img2.png');
