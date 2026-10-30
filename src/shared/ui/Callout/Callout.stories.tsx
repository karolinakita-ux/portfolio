import type { Meta, StoryObj } from "@storybook/react-vite";

import { Callout } from "./Callout.tsx";

/** Figma: Banner, Info | Warning. Plain text, or a titled block. */
const meta = {
  title: "UI/Callout",
  component: Callout,
  args: {
    tone: "warning",
    label: "Confidentiality note",
    children: "Client names have been anonymised, except where explicitly permitted.",
  },
} satisfies Meta<typeof Callout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Warning: Story = {};

export const InfoWithTitle: Story = {
  args: {
    tone: "info",
    label: "How this portfolio was built",
    title: "Behind the Design",
    children: <p>Designed in Figma, built with React and the KitaBranding tokens.</p>,
  },
};
