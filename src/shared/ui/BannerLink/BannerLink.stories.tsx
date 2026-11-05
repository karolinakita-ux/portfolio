import type { Meta, StoryObj } from "@storybook/react-vite";
import { clsx } from "clsx";
import { expect } from "storybook/test";

import { PROFILE } from "#shared/content/profile.ts";
import { callout } from "#shared/ui/Callout/Callout.styles.ts";
import { Blocks, Figma, Github } from "#shared/ui/icons/icons.tsx";

import { BannerLink } from "./BannerLink.tsx";

const styles = {
  banner: callout({ tone: "info" }),
  links: clsx("flex flex-wrap gap-x-lg gap-y-sm"),
};

/**
 * An external text link with a brand icon, as tall as a bordered Button: the Work page’s Behind the Design banner
 * and a case study’s “Explore the Figma File”. It opens in a new tab and says so to screen readers. It has no colour
 * of its own: it takes the banner’s, so the stories sit in an info banner.
 */
const meta = {
  title: "UI/BannerLink",
  component: BannerLink,
  args: { href: PROFILE.figmaWorkspaceUrl, icon: Figma, children: "Explore the Figma Workspace" },
  argTypes: { icon: { control: false } },
  decorators: [
    (Story) => (
      <div className={styles.banner}>
        <Story />
      </div>
    ),
  ],
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

/** The Behind the Design banner’s links on the Work page: a row that wraps, spaced like buttons. */
export const BehindTheDesignLinks: Story = {
  name: "Behind the Design Links",
  render: () => (
    <div className={styles.links}>
      <BannerLink href={PROFILE.figmaWorkspaceUrl} icon={Figma}>
        Explore the Figma Workspace
      </BannerLink>{" "}
      <BannerLink href="https://github.com/karolinakita-ux/portfolio" icon={Github}>
        Explore the Code on GitHub
      </BannerLink>{" "}
      <BannerLink href="https://karolina.kita.company/storybook/" icon={Blocks}>
        Explore the Storybook Library
      </BannerLink>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("link")).toHaveLength(3);
  },
};
