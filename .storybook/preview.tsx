import { Controls, Description, Primary, Stories, Subtitle, Title } from "@storybook/addon-docs/blocks";
import type { Decorator, Preview } from "@storybook/react-vite";

import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/zilla-slab/400.css";
import "@fontsource/zilla-slab/500.css";
import "../src/styles/app.css";

/**
 * Light or dark tokens, as on the site: the `dark` class on <html> (theme toolbar). On a docs page the page itself
 * stays Storybook's light one and only each story's preview turns dark (preview-head.html): with the page dark, the
 * descriptions turned near white on Storybook's white page and every radio in the props table looked selected.
 */
const withTheme: Decorator = (Story, context) => {
  const dark = context.globals.theme === "dark";
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark && context.viewMode !== "docs" ? "dark" : "light";
  return <Story />;
};

/**
 * Storybook's default docs page, except that the first story shows once: at the top, not again under Stories. With
 * the default, a component with one docs story (Dialog, Image Viewer) showed it twice, and the two frames ran its
 * play function at the same time.
 */
function DocsPage() {
  return (
    <>
      <Title />
      <Subtitle />
      <Description />
      <Primary />
      <Controls />
      <Stories includePrimary={false} />
    </>
  );
}

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: "Colour theme (KitaBranding Light and Dark mode tokens)",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "light", title: "Light mode" },
          { value: "dark", title: "Dark mode" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  parameters: {
    docs: { page: DocsPage },
    layout: "padded",
    controls: { expanded: true },
    backgrounds: { disable: true },
    // Accessibility checks (axe) fail a story in the test run, not only warn in the panel.
    a11y: { test: "error" },
    // Welcome first (Storybook opens the first entry), then from tokens up to whole patterns. Not "alphabetical":
    // that would also reorder the stories inside each component, whose first story is its docs page's preview.
    options: {
      storySort: {
        // The UI components alphabetically: by file path, Inline Text (Strong/) sat between Section and TextLink.
        // Written out here: Storybook reads storySort without running this file, so a constant fails the build.
        order: [
          "Welcome",
          "Foundations",
          "UI",
          [
            "Accordion",
            "Avatar",
            "Badge",
            "BannerLink",
            "Breadcrumb",
            "Button",
            "Callout",
            "Card",
            "Container",
            "CopyEmail",
            "Dialog",
            "EmailLink",
            "Eyebrow",
            "HeadingAnchor",
            "IconButton",
            "InfoTable",
            "Inline Text",
            "PageTitle",
            "ProseSection",
            "Section",
            "TextLink",
            "ViewLink",
          ],
          "Layout",
          "Media",
          "Patterns",
        ],
      },
    },
  },
  tags: ["autodocs"],
};

export default preview;
