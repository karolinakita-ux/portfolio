import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Lang } from "#shared/ui/Lang/Lang.tsx";

import { TextLink } from "./TextLink.tsx";

/**
 * An inline text link; `external` opens it in a new tab and says so to screen readers. On the site every link to
 * another website is external: the privacy policy’s outside links and the footer’s version number.
 */
const meta = {
  title: "UI/TextLink",
  component: TextLink,
  args: { href: "https://uodo.gov.pl/en", external: true, children: "uodo.gov.pl" },
  decorators: [
    (Story) => (
      <p>
        You can also complain to the President of the Personal Data Protection Office (
        <Lang lang="pl">Prezes Urzędu Ochrony Danych Osobowych</Lang>, UODO),{" "}
        <Lang lang="pl">ul. Stanisława Moniuszki 1A, 00-014 Warszawa</Lang>, <Story />.
      </p>
    ),
  ],
} satisfies Meta<typeof TextLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    await expect(link).toHaveTextContent(/opens in a new tab/);
  },
};
