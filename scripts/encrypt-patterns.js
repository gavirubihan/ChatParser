import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceFile = path.resolve(__dirname, '../src/lib/localePatterns.ts');
const encFile = path.resolve(__dirname, '../src/lib/localePatterns.enc');
const envFile = path.resolve(__dirname, '../.env');
const envLocalFile = path.resolve(__dirname, '../.env.local');

// 1. Resolve secret from arg, process.env, .env, or .env.local
let secret = process.argv[2] || process.env.PATTERNS_KEY;

for (const f of [envFile, envLocalFile]) {
  if (!secret && fs.existsSync(f)) {
    const envContent = fs.readFileSync(f, 'utf8');
    const match = envContent.match(/^PATTERNS_KEY=(.+)$/m);
    if (match) secret = match[1].trim();
  }
}

if (!secret) {
  // Generate a random 256-bit key
  secret = crypto.randomBytes(32).toString('hex');
  console.log(`\n🔑 Generated new PATTERNS_KEY:\n\x1b[32m${secret}\x1b[0m\n`);
  console.log(`Added to .env.local — make sure to add this key in Vercel Environment Variables!\n`);

  let envData = fs.existsSync(envLocalFile) ? fs.readFileSync(envLocalFile, 'utf8') : '';
  if (!envData.includes('PATTERNS_KEY=')) {
    envData = envData.trim() ? `${envData.trim()}\nPATTERNS_KEY=${secret}\n` : `PATTERNS_KEY=${secret}\n`;
    fs.writeFileSync(envLocalFile, envData, 'utf8');
  }
}

if (!fs.existsSync(sourceFile)) {
  console.error(`❌ Source file not found: ${sourceFile}`);
  process.exit(1);
}

const plaintext = fs.readFileSync(sourceFile, 'utf8');
const salt = 'chat-parser-locale-patterns-v1';
const key = crypto.scryptSync(secret, salt, 32);

const iv = crypto.randomBytes(12);
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
const tag = cipher.getAuthTag();

// Structure: 12 bytes IV + 16 bytes Auth Tag + Ciphertext
const payload = Buffer.concat([iv, tag, encrypted]);
fs.writeFileSync(encFile, payload);

console.log(`✓ [encrypt-patterns] Encrypted ${sourceFile} (${plaintext.length} bytes) -> ${encFile} (${payload.length} bytes).`);
