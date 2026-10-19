import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { HeadingAnchor } from "./HeadingAnchor.tsx";

/** The copy-link icon next to a section heading; visible on hover and focus, always on touch screens. */
const meta = {
  title: "UI/HeadingAnchor",
  component: HeadingAnchor,
  args: { id: "faq", headingId: "faq-title", label: "How I Think & Work" },
  render: (args) => (
    <div>
      <h2 id={args.headingId}>{args.label}</h2>
      <HeadingAnchor {...args} />
    </div>
  ),
} satisfies Meta<typeof HeadingAnchor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Copy link to section: How I Think & Work" })).toHaveAttribute(
      "href",
      "#faq",
    );
  },
};
