import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { CopyEmail } from "./CopyEmail.tsx";

/** The address as a mail link, plus a copy button with a live confirmation. */
const meta = {
  title: "UI/CopyEmail",
  component: CopyEmail,
  args: { email: "karolina.kita.zg@gmail.com", place: "contact" },
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
