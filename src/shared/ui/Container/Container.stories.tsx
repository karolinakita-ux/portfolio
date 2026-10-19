import type { Meta, StoryObj } from "@storybook/react-vite";

import { Container } from "./Container.tsx";

/** Page gutter and the centred 1120px content column. */
const meta = {
  title: "UI/Container",
  component: Container,
  parameters: { layout: "fullscreen" },
  args: { children: <p>Content sits in the column; the gutter grows from 24px to 96px.</p> },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
