import type { Meta, StoryObj } from "@storybook/react-vite";
import { clsx } from "clsx";

import { Badge } from "./Badge.tsx";

const styles = {
  row: clsx("flex flex-wrap gap-xs"),
  list: clsx("flex list-none flex-wrap gap-xs"),
};

/**
 * Figma: Badge. Skill tags on the About page, lines on the Smart Ticket persona cards, before / after results in the
 * case-study comparisons and status tags on case-study cards; 22px tall in every tone, as in Figma. On the site a
 * badge is a flex item, so the stories sit in a flex row too.
 */
const meta = {
  title: "UI/Badge",
  component: Badge,
  args: { children: "Design Systems" },
  argTypes: {
    weight: { table: { defaultValue: { summary: "regular" } } },
    tone: { table: { defaultValue: { summary: "neutral" } } },
  },
  decorators: [
    (Story) => (
      <div className={styles.row}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Regular: Story = {};

/**
 * Neutral tags (regular and medium), a measured result before and after a redesign (Smart Ticket), and a planned
 * item (Theme Generator roadmap).
 */
export const AllTones: Story = {
  render: () => (
    <ul aria-label="Badge tones" className={styles.list}>
      <Badge as="li">Design Systems</Badge>
      <Badge as="li" weight="medium">
        Metro M1
      </Badge>
      <Badge as="li" tone="error" weight="medium">
        3 text contrast failures
      </Badge>
      <Badge as="li" tone="success" weight="medium">
        0 text contrast failures
      </Badge>
      <Badge as="li" tone="warning" weight="medium">
        Phase 2 · Roadmap
      </Badge>
    </ul>
  ),
};
