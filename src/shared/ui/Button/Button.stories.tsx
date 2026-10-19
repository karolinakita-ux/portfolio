import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { ArrowRight, ArrowUpRight, Figma } from "#shared/ui/icons/icons.tsx";

import { Button } from "./Button.tsx";

/** Figma: Button. Type = Primary | Secondary | Subtle | Link; with or without an icon; default, hover, disabled. */
const meta = {
  title: "UI/Button",
  component: Button,
  args: { children: "Explore Case Studies", onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Explore Case Studies" }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Secondary: Story = { args: { variant: "secondary", iconLeft: Figma, iconRight: ArrowUpRight } };

export const Subtle: Story = { args: { variant: "subtle" } };

export const Link: Story = { args: { variant: "link", iconRight: ArrowRight, children: "View Case Study" } };

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button")).toBeDisabled();
  },
};
