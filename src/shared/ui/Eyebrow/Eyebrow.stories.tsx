import type { Meta, StoryObj } from "@storybook/react-vite";

import { Eyebrow } from "./Eyebrow.tsx";

/** Uppercase kicker; parts joined by a bullet (a comma for screen readers). */
const meta = {
  title: "UI/Eyebrow",
  component: Eyebrow,
  args: { parts: ["Karolina Kita", "Senior Product Designer"] },
} satisfies Meta<typeof Eyebrow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
