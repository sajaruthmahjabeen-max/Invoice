const fs = require('fs');

const supabaseUrl = process.env.SUPABASE_URL || 'https://qhuhngicocldbcmbegfg.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFodWhuZ2ljb2NsZGJjbWJlZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMDMzOTEsImV4cCI6MjEwMzY3OTM5MX0.DwikR5b5qwkDSWxscH248zj3T6iNwZSPWVbfMkh77r0';

const content = `// Auto-generated configuration from environment variables
window.__ENV__ = {
  SUPABASE_URL: ${JSON.stringify(supabaseUrl)},
  SUPABASE_ANON_KEY: ${JSON.stringify(supabaseAnonKey)}
};
`;

fs.writeFileSync('env.js', content, 'utf8');
console.log('Successfully generated env.js with Vercel environment variables.');
