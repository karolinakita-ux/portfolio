import type { Meta, StoryObj } from "@storybook/react-vite";

import { Lang } from "#shared/ui/Lang/Lang.tsx";
import { lead } from "#shared/ui/lead/lead.tsx";
import { Swatch } from "#shared/ui/Swatch/Swatch.tsx";
import { TextLink } from "#shared/ui/TextLink/TextLink.tsx";

import { Strong } from "./Strong.tsx";

/**
 * Small inline pieces of copy: emphasis, language, colour chips, screen reader text. The props table and controls are
 * for `Strong`; the other stories show `Lang` (also as `as="p"` for a whole paragraph), `Swatch`, `NewTabNote` and
 * `VisuallyHidden`.
 */
const meta = {
  title: "UI/Inline Text",
  component: Strong,
  args: { children: "High risk of human error" },
} satisfies Meta<typeof Strong>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StrongText: Story = {};

/** Case-study bullets open with a bold lead-in and a colon (lead()). */
export const LeadIn: Story = {
  render: () => (
    <p>
      {lead(
        "High risk of human error",
        "Untrained admins pairing light text with pastel buttons or dark cards on dark backgrounds.",
      )}
    </p>
  ),
};

/** A phrase in another language, so screen readers switch pronunciation (WCAG 3.1.2). From the privacy policy. */
export const OtherLanguage: Story = {
  render: () => (
    <p>
      You can also complain to the President of the Personal Data Protection Office (
      <Lang lang="pl">Prezes Urzędu Ochrony Danych Osobowych</Lang>, UODO).
    </p>
  ),
};

/** A colour chip beside its value, as in the Project Planning case study. */
export const ColourSwatch: Story = {
  render: () => (
    <p>
      Deep navy (<Swatch hex="#005D8F" />
      #005D8F, primary/500) is used only for actions and selection.
    </p>
  ),
};

/** Text only screen readers get: they hear “Umami (opens in a new tab)” (`NewTabNote`, a `VisuallyHidden` span). */
export const ScreenReaderText: Story = {
  render: () => (
    <p>
      I, Karolina Kita, use{" "}
      <TextLink href="https://umami.is" external>
        Umami
      </TextLink>
      , a visitor statistics tool, to see which pages and links are useful.
    </p>
  ),
};
