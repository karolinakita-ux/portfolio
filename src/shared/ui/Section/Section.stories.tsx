import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Section } from "./Section.tsx";

/** Page section: heading with a copy-link anchor (its id is the URL hash), optional lead, content. */
const meta = {
  title: "UI/Section",
  component: Section,
  parameters: { layout: "fullscreen" },
  args: {
    id: "career",
    title: "Career Progression",
    description: "2015 - Present",
    children: <p>Roles, newest first.</p>,
  },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Copy link to section: Career Progression" })).toHaveAttribute(
      "href",
      "#career",
    );
  },
};
