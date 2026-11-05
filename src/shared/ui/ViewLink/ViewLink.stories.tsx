import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";

import { VIEW } from "#shared/lib/routes/routes.constants.ts";
import { TEXT_LINK } from "#shared/lib/ui/ui.styles.ts";

import { ViewLink } from "./ViewLink.tsx";

/**
 * A link to another view: a real href for new tabs, an in-app navigation on a plain click. It has no look of its own:
 * the caller passes its classes (here the footer’s Privacy link, `TEXT_LINK`). The site uses it for the footer and
 * header links, the breadcrumbs and the case cards.
 */
const meta = {
  title: "UI/ViewLink",
  component: ViewLink,
  args: { view: VIEW.privacy, onNavigate: fn(), className: TEXT_LINK, children: "Privacy" },
  argTypes: {
    onNavigate: { control: false },
    className: { control: false },
    view: { control: "select", options: Object.values(VIEW) },
    // A section id (the URL hash); "Set object" would put an object in the address.
    anchor: { control: "text" },
  },
} satisfies Meta<typeof ViewLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    const link = canvas.getByRole("link", { name: "Privacy" });
    await expect(link).toHaveAttribute("href", "/privacy");
    // A click without focus: the story stays as a visitor first sees it, and the sidebar keeps the keyboard focus.
    link.click();
    await expect(args.onNavigate).toHaveBeenCalledWith("privacy", undefined);
  },
};
