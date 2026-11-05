import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { Screenshot } from "./Screenshot.tsx";

/**
 * Case-study screenshot at its own aspect ratio; with onExpand it opens the image viewer.
 * With darkSrc it shows the dark version while the site is in Dark mode (try the toolbar’s theme switch).
 */
const meta = {
  title: "Media/Screenshot",
  component: Screenshot,
  args: {
    src: "/assets/cases/project-planning/calendar-week-view-v2-light.webp",
    darkSrc: "/assets/cases/project-planning/calendar-week-view-v2-dark.webp",
    alt: "Month overview in week view: a Participant and Organizer switch, a project filter, a mini calendar with meeting counts, the selected day’s meetings and a weekly grid of meetings with a current-time line.",
  },
  // A column narrower than the docs page, so the page does not repeat the screenshot at its full width.
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "39.5rem" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Screenshot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Static: Story = {};

/** Clicking calls `onExpand`; the viewer it opens is shown in Patterns/Image Viewer. */
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
    alt: "Brand primary tokens for interactive actions: primary #005D8F, hover, active, contrast and subtle, each with its token name, hex value, contrast ratio and AAA badge.",
    frameless: true,
  },
};

/**
 * A dark version that cannot load (here on purpose): in Dark mode the screenshot shows its Light version instead of a
 * gap. Switch the toolbar’s Theme to Dark mode to see it.
 */
export const MissingDarkVersion: Story = {
  args: { darkSrc: "/assets/cases/missing-dark.webp" },
};
