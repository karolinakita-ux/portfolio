import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { ThemeToggle } from "./ThemeToggle.tsx";

/** Figma: Toggle. Two pressed-state buttons; the marker slides to the picked theme. */
const meta = {
  title: "Layout/ThemeToggle",
  component: ThemeToggle,
  args: { theme: "light", onChange: fn() },
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Light: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole("button", { name: "Light theme" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Dark theme" }));
    await expect(args.onChange).toHaveBeenCalledWith("dark");
  },
};

export const Dark: Story = { args: { theme: "dark" } };
