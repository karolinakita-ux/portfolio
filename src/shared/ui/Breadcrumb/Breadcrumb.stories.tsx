import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

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
  args: { items: [WORK_CRUMB, { label: CASE_NAMES[VIEW.caseProjectPlanning].shortTitle }] },
  play: async ({ canvas, args }) => {
    const work = canvas.getByRole("link", { name: "Work" });
    await expect(work).toHaveAttribute("href", "/#enterprise-cases");
    await userEvent.click(work);
    await expect(args.onNavigate).toHaveBeenCalledWith("work", "enterprise-cases");
  },
};
