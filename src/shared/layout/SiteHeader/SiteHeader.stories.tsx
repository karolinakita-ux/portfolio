import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { SiteHeader } from "./SiteHeader.tsx";

/** Figma: Header + Navigation menu. Sticky; the yellow pill marks the current section. */
const meta = {
  title: "Layout/SiteHeader",
  component: SiteHeader,
  parameters: { layout: "fullscreen" },
  args: { activeView: "about", onNavigate: fn(), onHome: fn(), theme: "light", onThemeChange: fn() },
} satisfies Meta<typeof SiteHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const About: Story = {
  play: async ({ canvas, args }) => {
    const nav = canvas.getByRole("navigation", { name: "Primary" });
    await expect(nav).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("link", { name: "Contact" }));
    await expect(args.onNavigate).toHaveBeenCalledWith("contact", undefined);
  },
};

/** On a case study, Work stays marked: the case belongs to it. */
export const CaseStudy: Story = { args: { activeView: "case-project-planning" } };
