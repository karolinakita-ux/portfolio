import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";

import { VIEW } from "#shared/lib/routes/routes.constants.ts";
import { CASE_NAMES } from "#shared/lib/routes/routes.content.ts";

import { HOME_CRUMB, WORK_CRUMB } from "./Breadcrumb.constants.ts";
import { Breadcrumb } from "./Breadcrumb.tsx";

/**
 * Figma: Breadcrumbs. Pages outside Work start at Home (the house icon, the home page); case studies start at
 * Work, which opens the list of case studies on that page. As in Figma: Body Small, 16px icons, and 8px between
 * a crumb and the chevron on each side.
 */
const meta = {
  title: "UI/Breadcrumb",
  component: Breadcrumb,
  args: { items: [HOME_CRUMB, { label: "About" }], onNavigate: fn() },
  argTypes: { onNavigate: { control: false } },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText("About")).toHaveAttribute("aria-current", "page");
    // A click without focus: the story stays as a visitor first sees it, and the sidebar keeps the keyboard focus.
    canvas.getByRole("link", { name: "Home" }).click();
    await expect(args.onNavigate).toHaveBeenCalledWith("work", undefined);
  },
};

export const CaseStudy: Story = {
  args: { items: [WORK_CRUMB, { label: CASE_NAMES[VIEW.caseProjectPlanning].shortTitle }] },
  play: async ({ canvas, args }) => {
    const work = canvas.getByRole("link", { name: "Work" });
    await expect(work).toHaveAttribute("href", "/#enterprise-cases");
    work.click(); // a click without focus, as above
    await expect(args.onNavigate).toHaveBeenCalledWith("work", "enterprise-cases");
  },
};
