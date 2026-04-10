import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputSvg = path.resolve(__dirname, '../public/chatparser.svg');
const publicDir = path.resolve(__dirname, '../public');

async function generateFavicons() {
  try {
    if (!fs.existsSync(inputSvg)) {
      console.error(`Source SVG not found at ${inputSvg}`);
      process.exit(1);
    }

    console.log('Generating favicons...');

    // PNG Favicon (32x32)
    await sharp(inputSvg)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon-32x32.png'));
    
    // PNG Favicon (16x16)
    await sharp(inputSvg)
      .resize(16, 16)
      .png()
      .toFile(path.join(publicDir, 'favicon-16x16.png'));

    // JPEG Favicon
    await sharp(inputSvg)
      .resize(32, 32)
      .jpeg()
      .toFile(path.join(publicDir, 'favicon.jpg'));

    // GIF Favicon
    await sharp(inputSvg)
      .resize(32, 32)
      .gif()
      .toFile(path.join(publicDir, 'favicon.gif'));

    // Note: BMP and ICO are not supported by sharp.
    // We will use the PNG-32 as a fallback or the user can manually convert if needed.
    // However, to satisfy the "add all types" request in HTML, we'll link to these.
    
    console.log('\x1b[32m✓\x1b[0m Favicons generated successfully.');
  } catch (error) {
    console.error('\x1b[31m✗\x1b[0m Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();
