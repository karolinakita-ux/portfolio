import type { Meta, StoryObj } from "@storybook/react-vite";
import { clsx } from "clsx";
import type { CSSProperties } from "react";

import * as icons from "./icons.tsx";

/**
 * Tailwind does not scan story files (app.css), so a class here works only while the site itself uses it, as these
 * do. Theme variables such as `--spacing-sm` or `--radius-md` exist at runtime only when some CSS uses them, so
 * inline styles avoid them.
 */
const styles = {
  grid: clsx("grid gap-sm"),
  tile: clsx(
    "flex items-center gap-sm rounded-md border border-border-subtle bg-bg-surface-raised px-md py-xs text-text-primary",
  ),
};

/** Only the column rule is inline: its arbitrary value is not a class the site uses. */
const COLUMNS: CSSProperties = {
  gridTemplateColumns: "repeat(auto-fill, minmax(11rem, 1fr))",
  margin: 0,
  padding: 0,
  listStyle: "none",
};

/** Every icon the site uses, by the name the code imports it with. */
function IconGallery({ size }: { size: number }) {
  return (
    <ul aria-label="Icons" className={styles.grid} style={COLUMNS}>
      {Object.entries(icons).map(([name, Icon]) => (
        <li key={name} className={styles.tile}>
          <Icon aria-hidden="true" size={size} /> <code>{name}</code>
        </li>
      ))}
    </ul>
  );
}

/** Every icon the site uses (Lucide geometry; the LinkedIn, Figma and GitHub marks belong to their owners). */
const meta = { title: "Foundations/Icons", component: IconGallery, args: { size: 24 } } satisfies Meta<
  typeof IconGallery
>;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {};
