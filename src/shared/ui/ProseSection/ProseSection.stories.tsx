import type { Meta, StoryObj } from "@storybook/react-vite";
import { Fragment } from "react";
import { expect } from "storybook/test";

import { PROFILE } from "#shared/content/profile.ts";
import { Callout } from "#shared/ui/Callout/Callout.tsx";
import { EmailLink } from "#shared/ui/EmailLink/EmailLink.tsx";
import { lead } from "#shared/ui/lead/lead.tsx";

import { ProseSection } from "./ProseSection.tsx";

/** A part of a text page (privacy policy, accessibility statement): paragraphs and points at reading width. */
const meta = {
  title: "UI/ProseSection",
  component: ProseSection,
  parameters: { layout: "fullscreen" },
  // On the site the next section’s top padding gives the last line this space.
  decorators: [
    (Story) => (
      <div style={{ paddingBottom: "var(--spacing-2xl)" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    section: {
      id: "in-short",
      title: "In Short",
      paragraphs: [
        "How this website works for people who use it in different ways, and what to do if something does not work for you.",
      ],
      points: [
        lead("Keyboard", "every link and button can be reached with Tab, and the focus is always visible."),
        lead("Zoom and text size", "pages reflow up to 400% zoom and follow a larger text size in your browser."),
      ],
    },
  },
} satisfies Meta<typeof ProseSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 2, name: "In Short" })).toBeInTheDocument();
    await expect(canvas.getAllByRole("listitem")).toHaveLength(2);
  },
};

/** With the section’s own component (here the privacy page’s note) between its text and its closing paragraph. */
export const WithExtra: Story = {
  args: {
    section: {
      id: "rights",
      title: "Your Rights",
      intro: [
        <Fragment key="write">
          Write to <EmailLink email={PROFILE.email} place="privacy" />. I answer within 1 month.
        </Fragment>,
      ],
      after: ["You do not have to give me any data: the website works the same with statistics switched off."],
    },
    extra: (
      <Callout tone="info" label="Your Right to Object" title="Your Right to Object">
        <p>
          You can object at any time to the use of your data based on my legitimate interest: the server logs, and
          emails that are not about work (GDPR Art. 21). The statistics run only with your consent, which you can
          withdraw with the switch on this page.
        </p>
      </Callout>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 3, name: "Your Right to Object" })).toBeInTheDocument();
  },
};
