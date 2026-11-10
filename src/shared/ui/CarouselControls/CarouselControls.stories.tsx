import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";

import { CarouselControls } from "./CarouselControls.tsx";

/**
 * Figma: CarouselControls (Position Start, Middle, End). Where the Work page’s recommendations carousel is and
 * Previous / Next, which move it by one view. At either end the button stays focusable and says it is unavailable.
 */
const meta = {
  title: "UI/CarouselControls",
  component: CarouselControls,
  args: {
    first: 1,
    last: 2,
    count: 5,
    atStart: true,
    atEnd: false,
    announce: false,
    onPrevious: fn(),
    onNext: fn(),
    labels: { previous: "Previous recommendations", next: "Next recommendations" },
  },
} satisfies Meta<typeof CarouselControls>;

export default meta;
type Story = StoryObj<typeof meta>;

/** At the start: the first 2 recommendations show, Previous is unavailable. */
export const Start: Story = {
  play: async ({ canvas, args }) => {
    canvas.getByRole("button", { name: "Previous recommendations" }).click();
    await expect(args.onPrevious).not.toHaveBeenCalled();
    canvas.getByRole("button", { name: "Next recommendations" }).click();
    await expect(args.onNext).toHaveBeenCalledOnce();
  },
};

/** Moved on once: both buttons work, and a screen reader has heard the new position. */
export const Middle: Story = {
  args: { first: 3, last: 4, atStart: false, announce: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Showing 3 to 4 of 5")).toHaveAttribute("aria-live", "polite");
  },
};

/** At the end: the last 2 show, Next is unavailable. */
export const End: Story = {
  args: { first: 4, last: 5, atStart: false, atEnd: true, announce: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Next recommendations" })).toHaveAttribute("aria-disabled", "true");
  },
};

/** On a phone, 1 recommendation shows at a time. */
export const OneInView: Story = {
  args: { first: 1, last: 1 },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("1 of 5")).toBeVisible();
  },
};
