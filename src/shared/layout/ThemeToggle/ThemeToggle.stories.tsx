import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent } from "storybook/test";

import { ThemeToggle } from "./ThemeToggle.tsx";
import type { ThemeToggleProps } from "./ThemeToggle.types.ts";

/** As in the header: a click moves the marker (the site keeps the theme in the app; here the story does). */
function ThemeToggleDemo({ theme, onChange }: ThemeToggleProps) {
  const [picked, setPicked] = useState(theme);
  return (
    <ThemeToggle
      theme={picked}
      onChange={(next) => {
        setPicked(next);
        onChange(next);
      }}
    />
  );
}

/**
 * The Light and Dark mode switch in the header (Figma: Toggle): two pressed-state buttons, and the marker slides to
 * the one picked. Here it moves only its marker; the toolbar’s Theme switches the story to Dark mode.
 */
const meta = {
  title: "Layout/ThemeToggle",
  component: ThemeToggle,
  args: { theme: "light", onChange: fn() },
  argTypes: { theme: { control: "inline-radio", options: ["light", "dark"] } },
  render: (args) => <ThemeToggleDemo key={args.theme} {...args} />,
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Light: Story = {
  play: async ({ canvas, args }) => {
    const light = canvas.getByRole("button", { name: "Light mode" });
    const dark = canvas.getByRole("button", { name: "Dark mode" });
    await expect(light).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(dark);
    await expect(args.onChange).toHaveBeenCalledWith("dark");
    await expect(dark).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(light);
    await expect(light).toHaveAttribute("aria-pressed", "true");
    // Ends as it started, without the click's focus ring.
    light.blur();
  },
};

export const Dark: Story = { args: { theme: "dark" } };
