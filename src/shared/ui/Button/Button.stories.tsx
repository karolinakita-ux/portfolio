import type { Meta, StoryObj } from "@storybook/react-vite";
import { clsx } from "clsx";
import { expect, fn } from "storybook/test";

import { ArrowDown, ArrowRight, FileText } from "#shared/ui/icons/icons.tsx";

import { Button } from "./Button.tsx";

const styles = {
  rows: clsx("flex flex-col gap-md"),
  row: clsx("flex flex-wrap items-start gap-sm"),
};

/**
 * Figma: Button. Type = Primary | Secondary | Subtle | Link; with or without an icon; default, hover, disabled.
 * On hover a trailing arrow nudges the way it points (down, right, up and right); other icons stay still.
 * On the site: Primary and Secondary are the Work hero’s two actions, Link is each case card’s “View Case Study”,
 * and the consent box’s choices are Secondary. Subtle is in Figma and not on a page yet.
 */
const meta = {
  title: "UI/Button",
  component: Button,
  args: { children: "Explore Case Studies", onClick: fn() },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary", "subtle", "link"],
      description: "Figma: Type.",
      table: { defaultValue: { summary: "primary" } },
    },
    disabled: { control: "boolean" },
    iconLeft: { control: false, description: "Leading icon, 16px." },
    iconRight: { control: false, description: "Trailing icon, 16px; an arrow nudges the way it points on hover." },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { iconRight: ArrowDown },
  play: async ({ canvas, args }) => {
    // A click without focus: the story stays as a visitor first sees it, and the sidebar keeps the keyboard focus.
    canvas.getByRole("button", { name: "Explore Case Studies" }).click();
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

/** The four Figma types with the site’s labels, then the same four disabled. Hover with the pointer to see each hover state. */
export const AllTypes: Story = {
  render: () => (
    <div className={styles.rows}>
      <div className={styles.row}>
        <Button iconRight={ArrowDown}>Explore Case Studies</Button>{" "}
        <Button variant="secondary" iconLeft={FileText}>
          View CV
        </Button>{" "}
        <Button variant="subtle">Explore Case Studies</Button>{" "}
        <Button variant="link" iconRight={ArrowRight}>
          View Case Study
        </Button>
      </div>{" "}
      <div className={styles.row}>
        <Button disabled iconRight={ArrowDown}>
          Explore Case Studies
        </Button>{" "}
        <Button disabled variant="secondary" iconLeft={FileText}>
          View CV
        </Button>{" "}
        <Button disabled variant="subtle">
          Explore Case Studies
        </Button>{" "}
        <Button disabled variant="link" iconRight={ArrowRight}>
          View Case Study
        </Button>
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("button")).toHaveLength(8);
    await expect(canvas.getAllByRole("button", { name: "View CV" })[1]).toBeDisabled();
  },
};

/** The Work hero’s second action: Secondary with a leading icon. */
export const Secondary: Story = { args: { variant: "secondary", iconLeft: FileText, children: "View CV" } };

/** In Figma; not used on a page yet. */
export const Subtle: Story = { args: { variant: "subtle" } };

export const Link: Story = { args: { variant: "link", iconRight: ArrowRight, children: "View Case Study" } };

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button")).toBeDisabled();
  },
};
