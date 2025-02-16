import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [
  { size: 192, name: "icon-192.png" },
  { size: 512, name: "icon-512.png" },
  { size: 180, name: "apple-touch-icon.png" },
];

async function generateIcons() {
  const svgBuffer = fs.readFileSync(join(__dirname, "../public/icon.svg"));

  for (const { size, name } of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(join(__dirname, "../public", name));

    console.log(`Generated ${name} (${size}x${size})`);
  }
}

generateIcons().catch(console.error);
