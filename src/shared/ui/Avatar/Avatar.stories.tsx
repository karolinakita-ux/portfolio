import type { Meta, StoryObj } from "@storybook/react-vite";

import { Avatar } from "./Avatar.tsx";

/** Figma: Avatar. Initials on the avatar glow; decorative (the name is next to it). */
const meta = { title: "UI/Avatar", component: Avatar, args: { initials: "SW" } } satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
