import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Callout } from "./Callout.tsx";

/**
 * Figma: Banner, Info | Warning. Plain text, or a titled block. The title is an H3 (under a section's H2); a banner
 * between sections makes it an H2, one inside a block with its own H3 an H4 (`headingLevel`). The look stays.
 */
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
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 3, name: "Behind the Design" })).toBeVisible();
  },
};

export const BetweenSections: Story = {
  args: {
    tone: "info",
    label: "Design files",
    title: "Inspect the design files",
    headingLevel: 2,
    children: (
      <p>
        The Figma file holds the token collections and their DTCG export, the mobile screens and states in Light and
        Dark mode, the operations console, the components with their variants and the original 2022 screens for
        comparison.
      </p>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 2, name: "Inspect the design files" })).toBeVisible();
  },
};
