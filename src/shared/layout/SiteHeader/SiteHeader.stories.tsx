import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import { VIEW } from "#shared/lib/routes/routes.constants.ts";

import { SiteHeader } from "./SiteHeader.tsx";
import type { SiteHeaderProps } from "./SiteHeader.types.ts";

/** As on the site: a menu link moves the pill, the switch its marker (the app keeps both; here the story does). */
function SiteHeaderDemo(args: SiteHeaderProps) {
  const [activeView, setActiveView] = useState(args.activeView);
  const [theme, setTheme] = useState(args.theme);
  return (
    <SiteHeader
      {...args}
      activeView={activeView}
      theme={theme}
      onNavigate={(...navigation) => {
        setActiveView(navigation[0]);
        args.onNavigate(...navigation); // the same arguments, so toHaveBeenCalledWith("contact", undefined) holds
      }}
      onThemeChange={(next) => {
        setTheme(next);
        args.onThemeChange(next);
      }}
    />
  );
}

/**
 * The header on every page: the K.KITA home link, the menu and the Light and Dark mode switch.
 *
 * Figma: Header + Navigation menu. Sticky; the yellow pill marks the current section, with an underline under the
 * label inside it: the pill alone is 1.54:1 on the white header, under the 3:1 a state needs (WCAG 1.4.11). Being
 * part of the pill, the underline slides with it to the next page’s link. Click Work, About or Contact to see the
 * pill slide; the theme switch here moves only its marker (the toolbar’s Theme switches the story to Dark mode).
 */
const meta = {
  title: "Layout/SiteHeader",
  component: SiteHeader,
  parameters: { layout: "fullscreen" },
  args: { activeView: "about", onNavigate: fn(), onHome: fn(), theme: "light", onThemeChange: fn() },
  argTypes: {
    activeView: { control: "select", options: Object.values(VIEW) },
    theme: { control: "inline-radio", options: ["light", "dark"] },
    // A function: "Set object" would make every link click throw.
    onNavigate: { control: false },
  },
  render: (args) => <SiteHeaderDemo key={`${args.activeView}-${args.theme}`} {...args} />,
} satisfies Meta<typeof SiteHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The menu links. */
const menuLinks = (canvasElement: HTMLElement) =>
  within(within(canvasElement).getByRole("navigation", { name: "Primary" })).getAllByRole("link");

/** The menu links whose underline shows: the bar inside the one visible pill. */
const underlinedLinks = (canvasElement: HTMLElement) =>
  menuLinks(canvasElement).filter((link) => {
    const pill = link.querySelector("[data-pill]");
    return pill?.classList.contains("opacity-100") === true && pill.querySelector("[data-pill-underline]") !== null;
  });

/** Text-decoration classes on the menu links: none, the underline lives in the pill. */
const textUnderlines = (canvasElement: HTMLElement) =>
  menuLinks(canvasElement).flatMap((link) =>
    [...link.classList].filter((name) => /^(underline|decoration-|underline-offset-)/.test(name)),
  );

export const About: Story = {
  play: async ({ canvas, canvasElement, args }) => {
    const nav = canvas.getByRole("navigation", { name: "Primary" });
    await expect(nav).toBeInTheDocument();
    const underlined = underlinedLinks(canvasElement);
    await expect(underlined).toHaveLength(1);
    await expect(underlined[0]).toBe(canvas.getByRole("link", { name: "About" }));
    await expect(underlined[0]).toHaveAttribute("aria-current", "page");
    await expect(underlined[0]?.querySelector("[data-pill-underline]")).toHaveClass("border-b-2", "border-current");
    await expect(textUnderlines(canvasElement)).toEqual([]);
    await userEvent.click(canvas.getByRole("link", { name: "Contact" }));
    await expect(args.onNavigate).toHaveBeenCalledWith("contact", undefined);
    const contact = canvas.getByRole("link", { name: "Contact" });
    await expect(contact).toHaveAttribute("aria-current", "page"); // the pill has moved
    const about = canvas.getByRole("link", { name: "About" });
    await userEvent.click(about);
    await expect(about).toHaveAttribute("aria-current", "page");
    // Ends as it started, on About, without the click's focus ring.
    about.blur();
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
    await expect(textUnderlines(canvasElement)).toEqual([]);
  },
};
