import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { CopyEmail } from "./CopyEmail.tsx";

/**
 * The email address on the Contact page and in the footer: a mail link, plus a copy button. Copying shows “Copied to
 * clipboard!” above the address for 2 seconds; when the browser blocks the clipboard, the address is selected instead.
 */
const meta = {
  title: "UI/CopyEmail",
  component: CopyEmail,
  args: { email: "karolina.kita.zg@gmail.com", place: "contact" },
  // Room above the row for the confirmation bubble, which sits over the address.
  decorators: [
    (Story) => (
      <div style={{ paddingTop: "var(--spacing-2xl)" }}>
        <Story />
      </div>
    ),
  ],
  // `icon` is a React element and `place` only changes the statistics value: the JSON editors would break the story.
  argTypes: { icon: { control: false }, place: { control: false }, textClassName: { control: false } },
} satisfies Meta<typeof CopyEmail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: /karolina\.kita\.zg@gmail\.com/ })).toHaveAttribute(
      "href",
      "mailto:karolina.kita.zg@gmail.com",
    );
    await expect(canvas.getByRole("button", { name: "Copy email address" })).toBeInTheDocument();
  },
};
