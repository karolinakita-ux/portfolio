/**
 * Raster copies of the site icon, made from public/favicon.svg: `yarn favicons`. Run it after changing the
 * SVG and commit the files it writes. Browsers take the SVG first, but Google Search does not read SVG
 * favicons (it lists BMP, GIF, ICO, PNG, JPEG, PPM and TIFF), and iOS wants a PNG for the home screen:
 *   public/favicon.ico           16, 32 and 48 px, PNG images inside an ICO
 *   public/favicon-96x96.png     for Google Search, which asks for a square larger than 48 x 48 px
 *   public/apple-touch-icon.png  180 px with no transparency: iOS rounds the corners itself and shows
 *                                transparent pixels as black, so the icon's tile colour fills the square
 * The names never change, because Google asks for a stable favicon URL (public/_headers caches them for a
 * day). index.html links all four; src/app/seo/favicons.test.ts checks the links and the files.
 */
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const SOURCE = "public/favicon.svg";
const ICO_SIZES = [16, 32, 48];
const TOUCH_SIZE = 180;
const GOOGLE_SIZE = 96;

const svg = await readFile(SOURCE);
// The tile behind the mark: its colour fills the corners of the touch icon.
const tile = /<rect[^>]* fill="(#[0-9a-f]{6})"/i.exec(svg.toString("utf8"))?.[1];
if (!tile) throw new Error(`favicons: no <rect fill="#rrggbb"> in ${SOURCE}`);

const png = (size: number): Promise<Buffer> => sharp(svg).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

interface IcoImage {
  size: number;
  data: Buffer;
}

/** An ICO file that holds PNG images: a 6-byte header, a 16-byte entry per image, then the images. */
function ico(images: readonly IcoImage[]): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  let offset = header.length + 16 * images.length;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size % 256, 0); // width; 0 means 256
    entry.writeUInt8(size % 256, 1); // height
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map((image) => image.data)]);
}

const icoImages = await Promise.all(ICO_SIZES.map(async (size) => ({ size, data: await png(size) })));
await writeFile("public/favicon.ico", ico(icoImages));
await writeFile(`public/favicon-${String(GOOGLE_SIZE)}x${String(GOOGLE_SIZE)}.png`, await png(GOOGLE_SIZE));
const touch = sharp(svg).resize(TOUCH_SIZE, TOUCH_SIZE).flatten({ background: tile });
await writeFile("public/apple-touch-icon.png", await touch.png({ compressionLevel: 9 }).toBuffer());
console.log(`favicons: favicon.ico (${ICO_SIZES.join(", ")} px), favicon-96x96.png, apple-touch-icon.png on ${tile}`);
