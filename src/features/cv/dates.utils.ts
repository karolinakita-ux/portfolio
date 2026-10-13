const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

/** Splits an ISO date ("2026", "2026-10" or "2026-10-08") into numbers. */
const parseIso = (iso: string) => {
  const match = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(iso);
  if (!match) throw new Error(`Invalid ISO date: "${iso}"`);
  const [, year, month, day] = match;
  return { year: Number(year), month: month ? Number(month) : null, day: day ? Number(day) : null };
};

const monthName = (names: readonly string[], month: number, iso: string) => {
  const name = names[month - 1];
  if (!name) throw new Error(`Invalid month in ISO date: "${iso}"`);
  return name;
};

/** CV dates: "2023-09" → "Sep 2023", "2015" → "2015". */
export const formatMonthYear = (iso: string): string => {
  const { year, month } = parseIso(iso);
  return month === null ? String(year) : monthName(SHORT_MONTHS, month, iso) + " " + year;
};
