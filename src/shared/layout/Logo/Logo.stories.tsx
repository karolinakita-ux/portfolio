import type { Meta, StoryObj } from "@storybook/react-vite";

import { Logo } from "./Logo.tsx";

/** K.KITA wordmark: letters in textPrimary, the dot in bgAccentBrand. Decorative (the link names it). */
const meta = { title: "Layout/Logo", component: Logo } satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
