const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

/** CV dates: "2023-11" → "Nov 2023", "2015" → "2015". Anything else throws, so a typo fails the tests. */
export const formatMonthYear = (iso: string): string => {
  const match = /^(\d{4})(?:-(\d{2}))?$/.exec(iso);
  if (!match) throw new Error(`Invalid CV date: "${iso}" (use YYYY-MM or YYYY)`);
  const [, year = "", month] = match;
  if (month === undefined) return year;
  const name = SHORT_MONTHS[Number(month) - 1];
  if (!name) throw new Error(`Invalid month in CV date: "${iso}"`);
  return name + " " + year;
};
