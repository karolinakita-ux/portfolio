import type { Meta, StoryObj } from "@storybook/react-vite";

import * as icons from "./icons.tsx";

/** Every icon the site uses (Lucide geometry; LinkedIn, Figma and GitHub marks belong to their owners). */
function IconGallery({ size }: { size: number }) {
  return (
    <ul aria-label="Icons">
      {Object.entries(icons).map(([name, Icon]) => (
        <li key={name}>
          <Icon aria-hidden="true" size={size} /> {name}
        </li>
      ))}
    </ul>
  );
}

const meta = { title: "Foundations/Icons", component: IconGallery, args: { size: 24 } } satisfies Meta<
  typeof IconGallery
>;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {};
