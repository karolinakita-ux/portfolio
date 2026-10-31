import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { SiteHeader } from "./SiteHeader.tsx";

/**
 * Figma: Header + Navigation menu. Sticky; the yellow pill marks the current section, and its link is underlined too:
 * the pill alone is 1.54:1 on the white header, under the 3:1 a state needs (WCAG 1.4.11).
 */
const meta = {
  title: "Layout/SiteHeader",
  component: SiteHeader,
  parameters: { layout: "fullscreen" },
  args: { activeView: "about", onNavigate: fn(), onHome: fn(), theme: "light", onThemeChange: fn() },
} satisfies Meta<typeof SiteHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The menu links that carry the underline. */
const underlinedLinks = (canvasElement: HTMLElement) =>
  within(within(canvasElement).getByRole("navigation", { name: "Primary" }))
    .getAllByRole("link")
    .filter((link) => link.classList.contains("underline"));

export const About: Story = {
  play: async ({ canvas, canvasElement, args }) => {
    const nav = canvas.getByRole("navigation", { name: "Primary" });
    await expect(nav).toBeInTheDocument();
    const underlined = underlinedLinks(canvasElement);
    await expect(underlined).toHaveLength(1);
    await expect(underlined[0]).toBe(canvas.getByRole("link", { name: "About" }));
    await expect(underlined[0]).toHaveAttribute("aria-current", "page");
    await expect(underlined[0]).toHaveClass("decoration-2", "underline-offset-4");
    await userEvent.click(canvas.getByRole("link", { name: "Contact" }));
    await expect(args.onNavigate).toHaveBeenCalledWith("contact", undefined);
  },
};

/** On a case study, Work stays marked: the case belongs to it. */
export const CaseStudy: Story = {
  args: { activeView: "case-project-planning" },
  play: async ({ canvas, canvasElement }) => {
    const underlined = underlinedLinks(canvasElement);
    await expect(underlined).toHaveLength(1);
    await expect(underlined[0]).toBe(canvas.getByRole("link", { name: "Work" }));
    await expect(underlined[0]).toHaveAttribute("aria-current", "true");
  },
};
