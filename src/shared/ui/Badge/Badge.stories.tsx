import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "./Badge.tsx";

/** Figma: Badge. A skill tag, or a status next to a title; 22px tall in every tone, as in Figma. */
const meta = { title: "UI/Badge", component: Badge, args: { children: "Design Systems" } } satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Regular: Story = {};

export const Medium: Story = { args: { weight: "medium", children: "MVP" } };

/** A measured result before a redesign (Smart Ticket comparison). */
export const ErrorTone: Story = { args: { tone: "error", children: "3 text contrast failures" } };

/** A measured result after a redesign. */
export const SuccessTone: Story = { args: { tone: "success", children: "0 text contrast failures" } };

/** A planned item, not shipped yet (Data Governance roadmap card). */
export const WarningTone: Story = { args: { tone: "warning", weight: "medium", children: "Phase 2 · Roadmap" } };
