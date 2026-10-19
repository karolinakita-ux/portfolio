import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "./Badge.tsx";

/** Figma: Badge. A skill tag, or a status next to a title. */
const meta = { title: "UI/Badge", component: Badge, args: { children: "Design Systems" } } satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Regular: Story = {};

export const Medium: Story = { args: { weight: "medium", children: "MVP" } };
