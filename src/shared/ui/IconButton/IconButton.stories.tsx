import type { Meta, StoryObj } from "@storybook/react-vite";
import { clsx } from "clsx";
import { expect, fn } from "storybook/test";

import { X, ZoomIn, ZoomOut } from "#shared/ui/icons/icons.tsx";

import { IconButton } from "./IconButton.tsx";

const styles = {
  zoom: clsx("flex gap-xs"),
  level: clsx("my-auto text-label-md text-text-secondary tabular-nums"),
};

/**
 * Figma: Emoji button. The image viewer’s Close, Previous, Next and zoom buttons: square and icon only; the label is
 * its accessible name and tooltip.
 */
const meta = {
  title: "UI/IconButton",
  component: IconButton,
  args: { label: "Close image viewer", icon: X, onClick: fn() },
  argTypes: { icon: { control: false }, ref: { table: { disable: true } } },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    // A click without focus: the story stays as a visitor first sees it, and the sidebar keeps the keyboard focus.
    canvas.getByRole("button", { name: "Close image viewer" }).click();
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

/** As in the image viewer at its largest zoom: Zoom in is `aria-disabled`, so it keeps focus and its label. */
export const ZoomControls: Story = {
  render: () => (
    <div role="group" aria-label="Zoom" className={styles.zoom}>
      <IconButton label="Zoom out" title="Zoom out (-)" icon={ZoomOut} /> <p className={styles.level}>400%</p>{" "}
      <IconButton label="Zoom in" title="Zoom in (+)" icon={ZoomIn} aria-disabled />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Zoom in" })).toHaveAttribute("aria-disabled", "true");
  },
};
