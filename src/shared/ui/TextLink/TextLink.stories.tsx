import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { TextLink } from "./TextLink.tsx";

/** An inline text link; `external` opens it in a new tab and says so to screen readers. */
const meta = {
  title: "UI/TextLink",
  component: TextLink,
  args: { href: "https://uodo.gov.pl/en", children: "uodo.gov.pl" },
} satisfies Meta<typeof TextLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const External: Story = {
  args: { external: true },
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    await expect(link).toHaveTextContent(/opens in a new tab/);
  },
};
