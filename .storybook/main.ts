import type { StorybookConfig } from "@storybook/react-vite";

/**
 * The component library in Storybook: `yarn storybook` locally. Netlify's production deploy builds it
 * into dist/storybook (`yarn build-storybook`), served at /storybook/ with noindex, linked from the Work page hero.
 * It is a separate build: the site's pages never load any of it. Stories sit next to their component
 * (`Button/Button.stories.tsx`); src/test/stories.test.tsx runs every story in Vitest.
 */
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.tsx"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: "@storybook/react-vite",
  // Only the images the stories show; the site's public/ folder (headers, redirects, sitemap) stays out.
  staticDirs: [{ from: "../public/assets/cases/meetestim", to: "/assets/cases/meetestim" }],
  viteFinal: (viteConfig) => ({ ...viteConfig, publicDir: false }),
  core: { disableTelemetry: true },
};

export default config;
