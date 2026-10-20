import type { Decorator, Preview } from "@storybook/react-vite";

import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/zilla-slab/400.css";
import "@fontsource/zilla-slab/500.css";
import "../src/styles/app.css";

/** Light or dark tokens, as on the site: the `dark` class on <html> (theme toolbar). */
const withTheme: Decorator = (Story, context) => {
  const dark = context.globals.theme === "dark";
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
  return <Story />;
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: "Colour theme (KitaBranding light / dark tokens)",
      toolbar: { title: "Theme", icon: "mirror", items: ["light", "dark"], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: "light" },
  parameters: {
    layout: "padded",
    controls: { expanded: true },
    backgrounds: { disable: true },
    // Accessibility checks (axe) fail a story in the test run, not only warn in the panel.
    a11y: { test: "error" },
    // Welcome first (Storybook opens the first entry), then from tokens up to whole patterns.
    options: { storySort: { order: ["Welcome", "Foundations", "UI", "Layout", "Media", "Patterns"] } },
  },
  tags: ["autodocs"],
};

export default preview;
