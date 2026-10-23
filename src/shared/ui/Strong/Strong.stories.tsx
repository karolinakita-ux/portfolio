import type { Meta, StoryObj } from "@storybook/react-vite";

import { Lang } from "#shared/ui/Lang/Lang.tsx";
import { lead } from "#shared/ui/lead/lead.tsx";
import { NewTabNote } from "#shared/ui/NewTabNote/NewTabNote.tsx";
import { Swatch } from "#shared/ui/Swatch/Swatch.tsx";
import { VisuallyHidden } from "#shared/ui/VisuallyHidden/VisuallyHidden.tsx";

import { Strong } from "./Strong.tsx";

/** Small inline pieces of copy: emphasis, language, colour chips, screen reader text. */
const meta = {
  title: "UI/Inline text",
  component: Strong,
  args: { children: "High risk of human error" },
} satisfies Meta<typeof Strong>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StrongText: Story = {};

/** Case-study bullets open with a bold lead-in and a colon (lead()). */
export const LeadIn: Story = {
  render: () => <p>{lead("High risk of human error", "Admins paired light text with light backgrounds.")}</p>,
};

export const OtherLanguage: Story = {
  render: () => (
    <p>
      The button said &quot;<Lang lang="pl">Zapisz zmiany</Lang>&quot;.
    </p>
  ),
};

export const ColourSwatch: Story = {
  render: () => (
    <p>
      <Swatch hex="#f5c84c" />
      Accent yellow
    </p>
  ),
};

export const ScreenReaderText: Story = {
  render: () => (
    <p>
      <a href="https://www.linkedin.com/in/karolinakita" target="_blank" rel="noopener noreferrer">
        LinkedIn
        <NewTabNote />
      </a>{" "}
      and hidden text: <VisuallyHidden>read out, not shown</VisuallyHidden>
    </p>
  ),
};
