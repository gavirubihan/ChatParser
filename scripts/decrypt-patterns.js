import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetFile = path.resolve(__dirname, '../src/lib/localePatterns.ts');
const encFile = path.resolve(__dirname, '../src/lib/localePatterns.enc');
const publicFile = path.resolve(__dirname, '../src/lib/localePatterns.public.ts');
const envFile = path.resolve(__dirname, '../.env');
const envLocalFile = path.resolve(__dirname, '../.env.local');

let secret = process.env.PATTERNS_KEY;

// Check .env and .env.local if present
for (const f of [envFile, envLocalFile]) {
  if (!secret && fs.existsSync(f)) {
    const envContent = fs.readFileSync(f, 'utf8');
    const match = envContent.match(/^PATTERNS_KEY=(.+)$/m);
    if (match) secret = match[1].trim();
  }
}

if (secret && fs.existsSync(encFile)) {
  try {
    const payload = fs.readFileSync(encFile);
    if (payload.length < 28) {
      throw new Error('Encrypted payload is corrupted or too short');
    }
    const iv = payload.subarray(0, 12);
    const tag = payload.subarray(12, 28);
    const ciphertext = payload.subarray(28);

    const salt = 'chat-parser-locale-patterns-v1';
    const key = crypto.scryptSync(secret, salt, 32);

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');

    fs.writeFileSync(targetFile, decrypted, 'utf8');
    console.log(`✓ [decrypt-patterns] Successfully decrypted private patterns for build.`);
    process.exit(0);
  } catch (err) {
    console.error(`❌ [decrypt-patterns] Decryption failed: ${err.message}`);
    if (fs.existsSync(targetFile)) {
      console.log(`ℹ [decrypt-patterns] Keeping existing ${targetFile}`);
      process.exit(0);
    }
    process.exit(1);
  }
} else if (fs.existsSync(targetFile)) {
  console.log(`ℹ [decrypt-patterns] Using existing ${targetFile}`);
  process.exit(0);
} else if (fs.existsSync(publicFile)) {
  console.log(`ℹ [decrypt-patterns] PATTERNS_KEY not provided. Using public fallback patterns.`);
  fs.copyFileSync(publicFile, targetFile);
  process.exit(0);
} else {
  console.warn(`⚠️ [decrypt-patterns] No encrypted file or public fallback found.`);
}
