import { ShowcaseRow } from "#features/case-studies/components/ShowcaseRow/ShowcaseRow.tsx";

import type { ShowcaseRowsProps } from "./ShowcaseRows.types.ts";

/** One list item per screenshot row (the parent supplies the <ul> or <ol>). */
export function ShowcaseRows({ rows }: ShowcaseRowsProps) {
  return rows.map((row) => (
    <li key={row.card.id}>
      <ShowcaseRow item={row.card} src={row.src} previewSrc={row.previewSrc} onExpand={row.onExpand} />
    </li>
  ));
}
