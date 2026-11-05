import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { ConsentBanner } from "./ConsentBanner.tsx";

/** Shows at the bottom of every page until the visitor answers. It asks before visitor statistics load. Allow and decline look the same; a link explains the details. */
const meta = {
  title: "Patterns/ConsentBanner",
  component: ConsentBanner,
  parameters: {
    layout: "fullscreen",
    // The box is fixed to the bottom of the window: on the docs page, in a frame of its own (inline it was cut away,
    // an empty preview). Taller than 480px, or the box would sit in the page as on short screens (cramped).
    docs: { story: { inline: false, iframeHeight: 520 } },
  },
  args: { onAllow: fn(), onDecline: fn(), onNavigate: fn() },
  // A function: "Set object" would make every link click throw.
  argTypes: { onNavigate: { control: false } },
} satisfies Meta<typeof ConsentBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole("region", { name: "Can I Count Your Visit?" })).toBeInTheDocument();
    // Equal weight: declining must look exactly like allowing.
    await expect(canvas.getByRole("button", { name: "No, thanks" }).className).toBe(
      canvas.getByRole("button", { name: "Allow statistics" }).className,
    );
    await userEvent.click(canvas.getByRole("button", { name: "No, thanks" }));
    await expect(args.onDecline).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole("button", { name: "Allow statistics" }));
    await expect(args.onAllow).toHaveBeenCalledOnce();
    await expect(canvas.getByRole("link", { name: /^Umami.*opens in a new tab/ })).toHaveAttribute("target", "_blank");
    const details = canvas.getByRole("link", { name: "Privacy details" });
    await userEvent.click(details);
    await expect(args.onNavigate).toHaveBeenCalledWith("privacy", undefined);
    // Leaves the box as a visitor first sees it: without the click's focus ring, and from its top where a narrow
    // frame (the docs page on a phone) holds it in the page, which that click had scrolled down.
    details.blur();
    window.scrollTo({ top: 0 });
  },
};
