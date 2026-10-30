import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Callout } from "#shared/ui/Callout/Callout.tsx";
import { lead } from "#shared/ui/lead/lead.tsx";

import { ProseSection } from "./ProseSection.tsx";

/** A part of a text page (privacy policy, accessibility statement): paragraphs and points at reading width. */
const meta = {
  title: "UI/ProseSection",
  component: ProseSection,
  parameters: { layout: "fullscreen" },
  args: {
    section: {
      id: "in-short",
      title: "In Short",
      paragraphs: ["How this website works for people who use it in different ways."],
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

/** With the section's own component (here the privacy page's note) between its text and its closing paragraph. */
export const WithExtra: Story = {
  args: {
    section: {
      id: "rights",
      title: "Your Rights",
      intro: ["Write to karolina.kita.zg@gmail.com. I answer within 1 month."],
      after: ["You do not have to give me any data: the website works the same with statistics switched off."],
    },
    extra: (
      <Callout tone="info" label="Your Right to Object" title="Your Right to Object">
        <p>The statistics run only with your consent, which you can withdraw with the switch on this page.</p>
      </Callout>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 3, name: "Your Right to Object" })).toBeInTheDocument();
  },
};
