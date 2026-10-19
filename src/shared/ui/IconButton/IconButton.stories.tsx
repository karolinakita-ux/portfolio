import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { X, ZoomIn } from "#shared/ui/icons/icons.tsx";

import { IconButton } from "./IconButton.tsx";

/** Figma: Emoji button. Square, icon only; the label is its accessible name and tooltip. */
const meta = {
  title: "UI/IconButton",
  component: IconButton,
  args: { label: "Close image viewer", icon: X, onClick: fn() },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Close image viewer" }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

/** aria-disabled keeps focus on the button when it reaches a limit (the maximum zoom). */
export const AtLimit: Story = { args: { label: "Zoom in", icon: ZoomIn, "aria-disabled": true } };
