const path = require('path');
const { execSync } = require('child_process');

const dir = 'c:/Users/shame/kms/payslip';
const htmlFile = path.join(dir, 'index.html');
const outPdf = path.join(dir, 'KMS_Payslip_June_2026.pdf');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const cmd = `"${edgePath}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --no-pdf-header-footer --print-to-pdf="${outPdf}" "file:///${htmlFile.replace(/\\/g, '/')}"`;

console.log('Generating Payslip PDF...');
try {
    execSync(cmd, { stdio: 'inherit', timeout: 15000 });
    console.log('PDF generated successfully at:', outPdf);
} catch (e) {
    console.error('Error generating PDF:', e.message);
}
