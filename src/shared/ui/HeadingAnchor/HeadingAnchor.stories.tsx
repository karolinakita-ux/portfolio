import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";

import { styles } from "#shared/ui/Section/Section.styles.ts";

import { HeadingAnchor } from "./HeadingAnchor.tsx";

/**
 * The copy-link icon beside every section heading (About, the case studies, the CV). It shows on hover and keyboard
 * focus, and always on touch screens. A click copies the section’s link and shows a tick for 2 seconds.
 */
const meta = {
  title: "UI/HeadingAnchor",
  component: HeadingAnchor,
  args: { id: "faq", headingId: "faq-title", label: "How I Think & Work" },
  render: (args) => (
    <div className={styles.titleRow}>
      <h2 id={args.headingId} tabIndex={-1} className={styles.title}>
        {args.label}
      </h2>{" "}
      <HeadingAnchor {...args} />
    </div>
  ),
} satisfies Meta<typeof HeadingAnchor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: "Copy link to section: How I Think & Work" });
    await expect(link).toHaveAttribute("href", "#faq");
    // Shown as a keyboard user finds it: the icon with its focus ring.
    link.focus();
    await waitFor(() => expect(link).toHaveFocus());
  },
};
