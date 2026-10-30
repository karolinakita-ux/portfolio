import { formatMonthYear } from "#features/cv/dates/dates.utils.ts";

import type { DateRangeProps } from "./DateRange.types.ts";

/** "Nov 2023 - Present", with machine-readable <time> elements. */
export function DateRange({ start, end }: DateRangeProps) {
  return (
    <>
      <time dateTime={start}>{formatMonthYear(start)}</time>
      {" - "}
      {end ? <time dateTime={end}>{formatMonthYear(end)}</time> : "Present"}
    </>
  );
}
