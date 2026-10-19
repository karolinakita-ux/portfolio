export interface DateRangeProps {
  /** ISO date (YYYY-MM or YYYY-MM-DD). */
  start: string;
  /** ISO date, or null for a current role ("Present"). */
  end: string | null;
}
