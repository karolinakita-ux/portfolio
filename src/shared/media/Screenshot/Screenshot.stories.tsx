import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { Screenshot } from "./Screenshot.tsx";

/** Case-study screenshot at its own aspect ratio; with onExpand it opens the image viewer. */
const meta = {
  title: "Media/Screenshot",
  component: Screenshot,
  args: {
    src: "/assets/cases/project-planning/thumbnail.webp",
    alt: "Month overview: a participant calendar with a mini month picker beside a weekly schedule of meetings.",
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
