import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { PROFILE } from "#shared/content/profile.ts";

import { EmailLink } from "./EmailLink.tsx";

/**
 * The email address as an inline mail link, as the privacy policy and the accessibility statement show it. Screen
 * readers also hear “opens your email app” (EmailAppNote), as with the Contact page’s and the footer’s address.
 */
const meta = {
  title: "UI/EmailLink",
  component: EmailLink,
  args: { email: PROFILE.email, place: "privacy" },
  decorators: [
    (Story) => (
      <p>
        Write to <Story />. I answer within 1 month.
      </p>
    ),
  ],
} satisfies Meta<typeof EmailLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    // The visible address first (WCAG 2.5.3); jsdom drops the space before the hidden note that browsers keep.
    const address = PROFILE.email.replace(/[.@]/g, "\\$&");
    const link = canvas.getByRole("link", { name: new RegExp(`^${address} ?\\(opens your email app\\)$`) });
    await expect(link).toHaveAttribute("href", "mailto:" + PROFILE.email);
    await expect(canvas.getByText(PROFILE.email)).toBeVisible();
  },
};
