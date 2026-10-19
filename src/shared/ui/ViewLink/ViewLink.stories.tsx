import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { ViewLink } from "./ViewLink.tsx";

/** A link to another view: a real href for new tabs, an in-app navigation on a plain click. */
const meta = {
  title: "UI/ViewLink",
  component: ViewLink,
  args: { view: "about", onNavigate: fn(), children: "About" },
} satisfies Meta<typeof ViewLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    const link = canvas.getByRole("link", { name: "About" });
    await expect(link).toHaveAttribute("href", "/about");
    await userEvent.click(link);
    await expect(args.onNavigate).toHaveBeenCalledWith("about", undefined);
  },
};
