import type { Meta, StoryObj } from "@storybook/react-vite";

import { InfoTableCell } from "#shared/ui/InfoTableCell/InfoTableCell.tsx";

import { InfoTable } from "./InfoTable.tsx";

/** Figma: Info Table. Label/value cells: two side by side from lg, or one per row. */
const meta = {
  title: "UI/InfoTable",
  component: InfoTable,
  args: {
    children: (
      <>
        <InfoTableCell label="Location">Poland (CET / UTC+1)</InfoTableCell>
        <InfoTableCell label="Collaboration">Remote, across European time zones.</InfoTableCell>
      </>
    ),
  },
} satisfies Meta<typeof InfoTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TwoColumns: Story = {};

export const OneColumn: Story = { args: { columns: 1 } };
