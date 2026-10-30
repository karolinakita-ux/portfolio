/// <reference types="vitest/config" />
import { closeSync, openSync, readdirSync, readFileSync, readSync } from "node:fs";
import { join, relative, sep } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

/** Pixel size from a PNG or WebP file header, or null for other formats. */
function imageSize(header: Buffer): readonly [number, number] | null {
  // PNG: 8-byte signature, then the IHDR chunk with width and height at bytes 16 and 20.
  if (header.readUInt32BE(0) === 0x89504e47) return [header.readUInt32BE(16), header.readUInt32BE(20)];
  if (header.toString("ascii", 0, 4) !== "RIFF" || header.toString("ascii", 8, 12) !== "WEBP") return null;
  switch (header.toString("ascii", 12, 16)) {
    case "VP8X": // extended (alpha, metadata): 24-bit canvas width - 1 and height - 1
      return [header.readUIntLE(24, 3) + 1, header.readUIntLE(27, 3) + 1];
    case "VP8L": {
      // lossless: 14-bit width - 1 and height - 1 after the 0x2f signature byte
      const bits = header.readUInt32LE(21);
      return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
    }
    case "VP8 ": // lossy: key frame header, 14-bit width and height
      return [header.readUInt16LE(26) & 0x3fff, header.readUInt16LE(28) & 0x3fff];
    default:
      return null;
  }
}

/**
 * `virtual:asset-sizes`: the pixel size of every image in public/assets (subfolders
 * included), keyed by its path under /assets ("cases/automotive/thumbnail.webp"), read
 * from the file header at build time. Images on the page take it as width and height
 * attributes (`shared/media/asset-size`), so the prerendered HTML holds their height before
 * they load, and the image viewer draws a placeholder of the right shape. Restart `yarn dev`
 * after adding an image.
 */
function assetSizes(): Plugin {
  const id = "virtual:asset-sizes";
  let dir = "";
  return {
    name: "asset-sizes",
    configResolved(config) {
      // Storybook turns publicDir off (it serves only the images its stories show); the sizes still come from public/.
      dir = join(config.publicDir || join(config.root, "public"), "assets");
    },
    resolveId: (source) => (source === id ? "\0" + id : undefined),
    load(resolved) {
      if (resolved !== "\0" + id) return undefined;
      const sizes: Record<string, readonly [number, number]> = {};
      for (const entry of readdirSync(dir, { recursive: true, withFileTypes: true })) {
        if (!entry.isFile()) continue;
        const file = join(entry.parentPath, entry.name);
        const header = Buffer.alloc(30);
        const fd = openSync(file, "r");
        readSync(fd, header, 0, 30, 0);
        closeSync(fd);
        const size = imageSize(header);
        if (size) sizes[relative(dir, file).split(sep).join("/")] = size;
      }
      return `export default ${JSON.stringify(sizes)};`;
    },
  };
}

/** The site's version: shown in the footer, sent to Umami as the tag (src/main.tsx) and in the session data. */
const { version } = JSON.parse(readFileSync(new URL("package.json", import.meta.url), "utf8")) as { version: string };

// https://vite.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), tailwindcss(), assetSizes()],
  define: { "import.meta.env.APP_VERSION": JSON.stringify(version) },
  build: {
    // Hashed bundles go to /static/*, which public/_headers caches for a year.
    // Content images stay in /assets under their own names.
    assetsDir: "static",
    // The SSR build (scripts/prerender.ts) only needs the render code, not a copy of public/.
    copyPublicDir: !isSsrBuild,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
    restoreMocks: true,
    unstubGlobals: true,
  },
}));
