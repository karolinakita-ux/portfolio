import type { Meta, StoryObj } from "@storybook/react-vite";
import { clsx } from "clsx";
import { expect, fn, userEvent } from "storybook/test";

import { BULLET_LIST } from "#shared/lib/ui/ui.styles.ts";
import { AccordionItem } from "#shared/ui/AccordionItem/AccordionItem.tsx";
import { lead } from "#shared/ui/lead/lead.tsx";

import { Accordion } from "./Accordion.tsx";

/** The answer’s type style on the About page (features/about FaqItem, which shared code may not import). */
const styles = { answer: clsx("text-body-md text-text-secondary") };

/**
 * The About page’s questions (“How I Think & Work”), a WAI-ARIA disclosure list: each question opens on its own; a
 * closed answer is inert, so keyboard and screen readers skip it.
 */
const meta = {
  title: "UI/Accordion",
  component: Accordion,
  args: { children: null },
  // A React element: the JSON editor would only break it.
  argTypes: { children: { control: false } },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

const onOpen = fn();

export const Default: Story = {
  args: {
    children: (
      <>
        <AccordionItem title="How Does a Background in Psychology Shape Your Design Work?" onOpen={onOpen}>
          <p className={styles.answer}>
            Psychology helps me understand how people process information, make choices, and handle heavy workloads. In
            complex business tools, good design reduces mental fatigue by organising information clearly and preventing
            mistakes before they happen.
          </p>
        </AccordionItem>
        <AccordionItem title="How Do You Collaborate with Cross-Functional Teams?">
          <p className={styles.answer}>Great software is always a team effort:</p>
          <ul className={BULLET_LIST}>
            <li>
              {lead(
                "Product Managers",
                "Partner early to understand business goals, prioritise requirements, and define realistic delivery phases.",
              )}
            </li>
            <li>
              {lead(
                "Frontend Developers",
                "Work closely on technical feasibility, component libraries, and clear handoff documentation so designs are straightforward to build.",
              )}
            </li>
            <li>
              {lead(
                "QA Specialists",
                "Provide clear states, edge cases, and accessibility guidelines (WCAG 2.1 AA) to make testing smooth and predictable.",
              )}
            </li>
          </ul>
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
    // Ends open, as a reader sees an answer, without the click's focus ring.
    await userEvent.click(question);
    await expect(question).toHaveAttribute("aria-expanded", "true");
    question.blur();
  },
};
