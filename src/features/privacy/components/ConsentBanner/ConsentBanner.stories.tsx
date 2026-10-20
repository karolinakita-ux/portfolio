import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { ConsentBanner } from "./ConsentBanner.tsx";

/** Asks before visitor statistics load. Allow and decline look the same; a link explains the details. */
const meta = {
  title: "Patterns/ConsentBanner",
  component: ConsentBanner,
  parameters: { layout: "fullscreen" },
  args: { onAllow: fn(), onDecline: fn(), onNavigate: fn() },
} satisfies Meta<typeof ConsentBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole("region", { name: "Can I count your visit?" })).toBeInTheDocument();
    // Equal weight: declining must look exactly like allowing.
    await expect(canvas.getByRole("button", { name: "No, thanks" }).className).toBe(
      canvas.getByRole("button", { name: "Allow statistics" }).className,
    );
    await userEvent.click(canvas.getByRole("button", { name: "No, thanks" }));
    await expect(args.onDecline).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole("button", { name: "Allow statistics" }));
    await expect(args.onAllow).toHaveBeenCalledOnce();
    await expect(canvas.getByRole("link", { name: /^Umami.*opens in a new tab/ })).toHaveAttribute("target", "_blank");
    await userEvent.click(canvas.getByRole("link", { name: "Privacy details" }));
    await expect(args.onNavigate).toHaveBeenCalledWith("privacy", undefined);
  },
};
