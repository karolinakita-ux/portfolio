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

export const Media: Story = {
  args: {
    layout: "media",
    gap: "lg",
    children: (
      <>
        <img src="/assets/cases/project-planning/thumbnail.webp" alt="Project Planning dashboard" width={320} />
        <span>Project Planning: enterprise project planning and cost management.</span>
      </>
    ),
  },
};
