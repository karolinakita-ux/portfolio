export interface DateRangeProps {
  /** ISO month ("2023-11") or year. */
  start: string;
  /** ISO month or year, or null for a current role ("Present"). */
  end: string | null;
}
