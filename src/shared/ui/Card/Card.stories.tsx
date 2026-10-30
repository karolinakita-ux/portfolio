import type { Meta, StoryObj } from "@storybook/react-vite";

import { Card } from "./Card.tsx";

/** Figma: Card (Big Card). Cards in a list fade up as they scroll into view. */
const meta = {
  title: "UI/Card",
  component: Card,
  args: {
    children: (
      <>
        <strong>Clarity over decoration</strong>
        <span>Every element earns its place by helping someone finish a task.</span>
      </>
    ),
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Stack: Story = {};

export const StackWideGap: Story = { args: { gap: "md" } };

/** A card that closes a case study (the Data Governance delivery cards): no scroll reveal. */
export const Still: Story = { args: { reveal: false } };

export const Media: Story = {
  args: {
    layout: "media",
    gap: "lg",
    children: (
      <>
        <img
          src="/assets/cases/project-planning/thumbnail-light.webp"
          alt="Sample project dashboards: a goals and milestones timeline, a budget burn table, and budget guardrails that flag projects at 80% and 100% of their budget."
          width={320}
        />
        <span>Enterprise project planning and cost management.</span>
      </>
    ),
  },
};
