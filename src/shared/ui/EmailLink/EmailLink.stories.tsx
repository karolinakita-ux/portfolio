import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { PROFILE } from "#shared/content/profile.ts";

import { EmailLink } from "./EmailLink.tsx";

/** The email address as an inline mail link, as the privacy policy and the accessibility statement show it. */
const meta = {
  title: "UI/EmailLink",
  component: EmailLink,
  args: { email: PROFILE.email, place: "privacy" },
  decorators: [
    (Story) => (
      <p>
        Write to <Story />. I answer within one month.
      </p>
    ),
  ],
} satisfies Meta<typeof EmailLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: PROFILE.email })).toHaveAttribute("href", "mailto:" + PROFILE.email);
  },
};
