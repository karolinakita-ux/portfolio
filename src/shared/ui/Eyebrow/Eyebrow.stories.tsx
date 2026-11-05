import type { Meta, StoryObj } from "@storybook/react-vite";

import { PROFILE } from "#shared/content/profile.ts";

import { Eyebrow } from "./Eyebrow.tsx";

/**
 * Uppercase kicker; parts joined by a bullet that CSS draws (screen readers hear a comma). On the Work hero (name and
 * role), each case card and each case-study intro.
 */
const meta = {
  title: "UI/Eyebrow",
  component: Eyebrow,
  args: { parts: [PROFILE.name, PROFILE.role] },
  argTypes: { className: { control: false } },
} satisfies Meta<typeof Eyebrow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
