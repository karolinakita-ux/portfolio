import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { SiteFooter } from "./SiteFooter.tsx";

/** Figma: Footer. Explore links, contact, legal line with the privacy link. */
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
    await userEvent.click(canvas.getByRole("link", { name: "Privacy" }));
    await expect(args.onNavigate).toHaveBeenCalledWith("privacy", undefined);
  },
};
