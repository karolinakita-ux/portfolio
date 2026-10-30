import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { Screenshot } from "./Screenshot.tsx";

/**
 * Case-study screenshot at its own aspect ratio; with onExpand it opens the image viewer.
 * With darkSrc it shows the dark version while the site is in Dark mode (try the toolbar's theme switch).
 */
const meta = {
  title: "Media/Screenshot",
  component: Screenshot,
  args: {
    src: "/assets/cases/project-planning/calendar-week-view-light.webp",
    darkSrc: "/assets/cases/project-planning/calendar-week-view-dark.webp",
    alt: "Month overview in week view: a participant and organizer switch, a project filter, a mini calendar with meeting counts and a weekly grid of meetings with a current-time line.",
  },
} satisfies Meta<typeof Screenshot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Static: Story = {};

export const Expandable: Story = {
  args: { onExpand: fn() },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: /View full size/ }));
    await expect(args.onExpand).toHaveBeenCalledOnce();
  },
};

/** An image that draws its own rounded card and shadow sits on the page without the screenshot frame. */
export const Frameless: Story = {
  args: {
    src: "/assets/cases/project-planning/brand-primary-actions-light.webp",
    darkSrc: "/assets/cases/project-planning/brand-primary-actions-dark.webp",
    alt: "Brand primary colour tokens for interactive actions: primary, hover, active, contrast and subtle, each with its hex value and contrast ratio.",
    frameless: true,
  },
};

/** A broken dark version falls back to the default image. */
export const MissingDarkVersion: Story = {
  args: { darkSrc: "/assets/cases/missing-dark.webp" },
};
