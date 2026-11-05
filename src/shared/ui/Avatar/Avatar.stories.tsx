import type { Meta, StoryObj } from "@storybook/react-vite";
import { clsx } from "clsx";

import { Avatar } from "./Avatar.tsx";

const styles = {
  header: clsx("flex items-start gap-sm"),
  identity: clsx("flex min-w-0 flex-col"),
  name: clsx("text-title-lg text-text-primary"),
  role: clsx("text-body-md text-text-secondary"),
};

/**
 * Figma: Avatar. Initials on the avatar glow, beside a name: the testimonials on the Work page and the persona cards
 * in Smart Ticket. Decorative: the name next to it is the text.
 */
const meta = { title: "UI/Avatar", component: Avatar, args: { initials: "SW" } } satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** As on a Smart Ticket persona card: the avatar is decorative, the name beside it is the text. */
export const BesideAName: Story = {
  name: "Beside a Name",
  args: { initials: "TK" },
  render: (args) => (
    <div className={styles.header}>
      <Avatar {...args} />{" "}
      <div className={styles.identity}>
        <p className={styles.name}>Tomasz, 34</p> <p className={styles.role}>Daily office commuter</p>
      </div>
    </div>
  ),
};
