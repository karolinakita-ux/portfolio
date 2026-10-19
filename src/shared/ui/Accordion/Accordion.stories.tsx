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
        <AccordionItem title="How does a background in psychology help?" onOpen={onOpen}>
          <p>It helps me see how people actually think and work.</p>
        </AccordionItem>
        <AccordionItem title="Which tools do you use?">
          <p>Figma, a token-driven design system, and code prototypes.</p>
        </AccordionItem>
      </>
    ),
  },
  play: async ({ canvas }) => {
    const question = canvas.getByRole("button", { name: "How does a background in psychology help?" });
    await expect(question).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(question);
    await expect(question).toHaveAttribute("aria-expanded", "true");
    await expect(onOpen).toHaveBeenCalledOnce();
    await userEvent.click(question);
    await expect(question).toHaveAttribute("aria-expanded", "false");
    await expect(onOpen).toHaveBeenCalledOnce();
  },
};
