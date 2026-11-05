import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";

import { Container } from "./Container.tsx";

/** Inline styles use colour and spacing variables that exist at runtime; Tailwind does not scan story files. */
const COLUMN: CSSProperties = {
  background: "var(--bg-accent-brand-subtle)",
  outline: "1px dashed var(--border-default)",
  padding: "var(--spacing-md)",
  color: "var(--text-primary)",
};

/** The page gutter and the centred content column (at most 1120px) that every page section sits in. */
const meta = {
  title: "UI/Container",
  component: Container,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ paddingBlock: "var(--spacing-lg)" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    children: (
      <p style={COLUMN}>
        The content column: centred and at most 1120px wide. The gutter around it is 24px on phones, 48px from 768px and
        96px from 1024px.
      </p>
    ),
  },
  argTypes: { className: { control: false }, children: { control: false } },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
