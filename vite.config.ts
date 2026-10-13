/// <reference types="vitest/config" />
import { closeSync, openSync, readdirSync, readSync } from "node:fs";
import { join } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

/**
 * `virtual:asset-sizes`: the pixel size of every PNG in public/assets, read from
 * its header at build time. The image viewer uses it to draw a placeholder of the
 * right shape before an image arrives. Restart `yarn dev` after adding an image.
 */
function assetSizes(): Plugin {
  const id = "virtual:asset-sizes";
  let dir = "";
  return {
    name: "asset-sizes",
    configResolved(config) {
      dir = join(config.publicDir, "assets");
    },
    resolveId: (source) => (source === id ? "\0" + id : undefined),
    load(resolved) {
      if (resolved !== "\0" + id) return undefined;
      const sizes: Record<string, [number, number]> = {};
      for (const name of readdirSync(dir)) {
        if (!name.endsWith(".png")) continue;
        // PNG: 8-byte signature, then the IHDR chunk with width and height at bytes 16 and 20.
        const header = Buffer.alloc(24);
        const fd = openSync(join(dir, name), "r");
        readSync(fd, header, 0, 24, 0);
        closeSync(fd);
        sizes[name] = [header.readUInt32BE(16), header.readUInt32BE(20)];
      }
      return `export default ${JSON.stringify(sizes)};`;
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), tailwindcss(), assetSizes()],
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
