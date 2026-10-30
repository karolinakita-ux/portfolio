import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { PROFILE } from "#shared/content/profile.ts";
import { Figma, Github } from "#shared/ui/icons/icons.tsx";

import { BannerLink } from "./BannerLink.tsx";

/**
 * An external text link with a brand icon, as tall as a bordered Button: the Work page's Behind the Design banner
 * and a case study's "Explore the Figma File". It opens in a new tab and says so to screen readers.
 */
const meta = {
  title: "UI/BannerLink",
  component: BannerLink,
  args: { href: PROFILE.figmaWorkspaceUrl, icon: Figma, children: "Explore the Figma Workspace" },
  argTypes: { icon: { control: false } },
} satisfies Meta<typeof BannerLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: /^Explore the Figma Workspace/ });
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveTextContent(/opens in a new tab/);
  },
};

export const FigmaFile: Story = {
  args: {
    href: "https://www.figma.com/design/al8zX7vvgJvxNPUaeKp38Q/Smart-Ticket-App?node-id=200-85&t=rLEE9MGJA3JJXZxT-1",
    children: "Explore the Figma File",
  },
};

export const SourceCode: Story = {
  args: { href: "https://github.com/karolinakita-ux/portfolio", icon: Github, children: "Explore the Code on GitHub" },
};
