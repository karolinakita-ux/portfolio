import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";

import * as icons from "./icons.tsx";

/**
 * Inline styles from the design tokens' variables: Tailwind does not scan story files (app.css), so classes used only
 * here would not exist.
 */
const GRID: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(11rem, 1fr))",
  gap: "var(--spacing-sm)",
  margin: 0,
  padding: 0,
  listStyle: "none",
};
const TILE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--spacing-sm)",
  padding: "var(--spacing-sm) var(--spacing-md)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-md)",
  background: "var(--bg-surface-raised)",
  color: "var(--text-primary)",
};

/** Every icon the site uses, by the name the code imports it with. */
function IconGallery({ size }: { size: number }) {
  return (
    <ul aria-label="Icons" style={GRID}>
      {Object.entries(icons).map(([name, Icon]) => (
        <li key={name} style={TILE}>
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
