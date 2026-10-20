import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { HOME_CRUMB, WORK_CRUMB } from "./Breadcrumb.constants.ts";
import { Breadcrumb } from "./Breadcrumb.tsx";

/** Figma: Breadcrumbs. The home page, then the current page: Home on pages outside Work, Work on case studies. */
const meta = {
  title: "UI/Breadcrumb",
  component: Breadcrumb,
  args: { items: [HOME_CRUMB, { label: "About" }], onNavigate: fn() },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText("About")).toHaveAttribute("aria-current", "page");
    await userEvent.click(canvas.getByRole("link", { name: "Home" }));
    await expect(args.onNavigate).toHaveBeenCalledWith("work", undefined);
  },
};

export const CaseStudy: Story = {
  args: { items: [WORK_CRUMB, { label: "Project Planning" }] },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("link", { name: "Work" }));
    await expect(args.onNavigate).toHaveBeenCalledWith("work", undefined);
  },
};
