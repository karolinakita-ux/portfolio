import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { AccordionItem } from "#shared/ui/AccordionItem/AccordionItem.tsx";

import { Accordion } from "./Accordion.tsx";

/** WAI-ARIA disclosure list: each item opens on its own; a closed panel is inert. */
const meta = {
  title: "UI/Accordion",
  component: Accordion,
  args: { children: null },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

const onOpen = fn();

export const Default: Story = {
  args: {
    children: (
      <>
        <AccordionItem title="How Does a Background in Psychology Shape Your Design Work?" onOpen={onOpen}>
          <p>
            Psychology helps me understand how people process information, make choices, and handle heavy workloads.
          </p>
        </AccordionItem>
        <AccordionItem title="How Do You Collaborate with Cross-Functional Teams?">
          <p>Great software is always a team effort.</p>
        </AccordionItem>
      </>
    ),
  },
  play: async ({ canvas }) => {
    const question = canvas.getByRole("button", {
      name: "How Does a Background in Psychology Shape Your Design Work?",
    });
    await expect(question).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(question);
    await expect(question).toHaveAttribute("aria-expanded", "true");
    await expect(onOpen).toHaveBeenCalledOnce();
    await userEvent.click(question);
    await expect(question).toHaveAttribute("aria-expanded", "false");
    await expect(onOpen).toHaveBeenCalledOnce();
  },
};
