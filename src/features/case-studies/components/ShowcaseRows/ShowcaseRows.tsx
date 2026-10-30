import { ShowcaseRow } from "#features/case-studies/components/ShowcaseRow/ShowcaseRow.tsx";

import type { ShowcaseRowsProps } from "./ShowcaseRows.types.ts";

/** One list item per screenshot row (the parent supplies the <ul> or <ol>); the sides alternate row by row. */
export function ShowcaseRows({ rows }: ShowcaseRowsProps) {
  return rows.map((row, index) => (
    <li key={row.card.id}>
      <ShowcaseRow
        item={row.card}
        src={row.src}
        darkSrc={row.darkSrc}
        previewSrc={row.previewSrc}
        onExpand={row.onExpand}
        reverse={index % 2 === 1}
      />
    </li>
  ));
}
