import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { BackToTop } from "./BackToTop.tsx";

/** Floating button after scrolling down; it stays shown while it has focus. */
const meta = {
  title: "Layout/BackToTop",
  component: BackToTop,
  args: { onActivate: fn() },
} satisfies Meta<typeof BackToTop>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Focused: Story = {
  play: async ({ canvas, args }) => {
    // Hidden until the page scrolls or it gets focus, so it has no accessible name yet.
    const button = canvas.getByRole("button", { hidden: true });
    button.focus();
    await waitFor(() => expect(button).toHaveAttribute("aria-hidden", "false"));
    await userEvent.click(button);
    await expect(args.onActivate).toHaveBeenCalledOnce();
  },
};
