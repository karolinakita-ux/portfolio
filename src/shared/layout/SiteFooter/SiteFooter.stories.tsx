import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { SiteFooter } from "./SiteFooter.tsx";

/**
 * Figma: Footer. Explore links (the header’s pages, then the CV), contact, the legal lines: the site’s version
 * (package.json) linking to the release notes, and the privacy and accessibility links.
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
    const explore = within(canvas.getByRole("navigation", { name: "Explore" }));
    const pages = explore.getAllByRole("link").map((link) => link.textContent);
    await expect(pages).toEqual(["Work", "About", "Contact", "CV"]);
    await userEvent.click(explore.getByRole("link", { name: "CV" }));
    await expect(args.onNavigate).toHaveBeenCalledWith("cv", undefined);
    const version = canvas.getByRole("link", { name: /^Version \d.*release notes.*opens in a new tab/ });
    await expect(version).toHaveTextContent(`Version ${import.meta.env.APP_VERSION} release notes`);
    await expect(version).toHaveAttribute(
      "href",
      "https://github.com/karolinakita-ux/portfolio/blob/main/CHANGELOG.md",
    );
    await userEvent.click(canvas.getByRole("link", { name: "Privacy" }));
    await expect(args.onNavigate).toHaveBeenCalledWith("privacy", undefined);
    await userEvent.click(canvas.getByRole("link", { name: "Accessibility" }));
    await expect(args.onNavigate).toHaveBeenCalledWith("accessibility", undefined);
  },
};
