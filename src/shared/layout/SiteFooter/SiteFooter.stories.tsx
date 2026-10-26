import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { SiteFooter } from "./SiteFooter.tsx";

/**
 * Figma: Footer. Explore links, contact, the legal lines: the site's version (package.json) linking to the
 * release notes, and the privacy link.
 */
const meta = {
  title: "Layout/SiteFooter",
  component: SiteFooter,
  parameters: { layout: "fullscreen" },
  args: { onNavigate: fn() },
} satisfies Meta<typeof SiteFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    const version = canvas.getByRole("link", { name: /^Version \d.*release notes.*opens in a new tab/ });
    await expect(version).toHaveTextContent(`Version ${import.meta.env.APP_VERSION} release notes`);
    await expect(version).toHaveAttribute(
      "href",
      "https://github.com/karolinakita-ux/portfolio/blob/main/CHANGELOG.md",
    );
    await userEvent.click(canvas.getByRole("link", { name: "Privacy" }));
    await expect(args.onNavigate).toHaveBeenCalledWith("privacy", undefined);
  },
};
