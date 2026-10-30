/**
 * Karolina's copy rules that a pattern can check (her answers of 2026-10-30), applied to the site's copy and its
 * rendered pages by src/app/content-rules.test.ts. Each function returns what breaks its rule, so a failing test
 * shows it; quotes from real people are left out by the caller.
 */

/** Words a Title Case heading keeps lowercase inside it: articles, conjunctions and prepositions of 4 letters at most. */
const MINOR_WORDS = new Set([
  ...["a", "an", "the", "and", "but", "for", "nor", "or", "so", "yet"],
  ...["as", "at", "by", "from", "in", "into", "like", "of", "off", "on", "onto", "per", "than", "to", "up", "via"],
  ...["vs", "vs.", "with"],
]);

/** Names that start in lowercase in any heading. */
const LOWERCASE_NAMES = /^(?:iOS|iPhone|iPad|macOS)\b/;

/**
 * The words a heading leaves in lowercase that Title Case capitalises: every word but the minor ones, and always the
 * first and the last word of the heading and of each part after a colon or a spaced hyphen ("Why - The Standard").
 * A word that starts with a digit or a symbol ("1:1", "&", "29-Point") needs nothing; one in brackets or quotes is
 * read from its first letter ("(Proposal)", "“Why”").
 */
export function titleCaseMisses(heading: string): string[] {
  return heading.split(/:\s+|\s+-\s+/).flatMap((part) => {
    const words = part
      .split(/\s+/)
      .map((word) => word.replace(/^[^\p{L}\p{N}]+/u, ""))
      .filter(Boolean);
    return words.filter((word, index) => {
      if (!/^\p{Ll}/u.test(word) || LOWERCASE_NAMES.test(word)) return false;
      const edge = index === 0 || index === words.length - 1;
      return edge || !MINOR_WORDS.has(word.replace(/[^\p{L}.]+$/u, "").toLowerCase());
    });
  });
}

/** Straight quotes and apostrophes: the site writes them curly (’ “ ”), only the CV keeps them straight (ATS). */
export const straightQuotes = (text: string): string[] => text.match(/['"]/g) ?? [];

/**
 * Counts written as words ("three taps", "two-step"): the site writes counts and measures as digits ("3 taps",
 * "2-step"). Allowed at the start of a sentence, in quotes (“…”), before "of" and in fixed terms ("two-factor
 * authentication"); "one" is left out ("one place", "one sheet").
 */
const SPELLED_COUNT =
  /(?<!^|[.!?]\s+)\b(?:two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)(?:\s+|-)(?!of\b|factor\b)\p{L}+/giu;

/** A colon before a capital starts a title or a sentence ("Copy link to section: Three Riders, …"). */
export const spelledCounts = (text: string): string[] =>
  text
    .replace(/“[^”]*”/g, "“”")
    .replace(/:\s+(?=\p{Lu})/gu, ". ")
    .match(SPELLED_COUNT) ?? [];

/**
 * Light / Dark wording other than the one pattern: "Light and Dark mode", "Light mode", "Dark mode", capitalised as
 * the theme switch names them ("Light mode", "Dark mode"). Catches lowercase names ("dark mode", "light / dark
 * switch"), plural modes or themes ("Light and Dark modes", "Dark theme") and a slash between the names ("Light / Dark").
 */
const THEME_WORDING = [
  /\b(?:light|dark)(?:\s*(?:\/|and|or|&)\s*(?:a\s+)?(?:light|dark))?\s+(?:modes?|themes?|switch)\b/g,
  /\b(?:Light|Dark)(?:\s*(?:\/|and|or|&)\s*(?:a\s+)?(?:Light|Dark))?\s+(?:modes|themes?)\b/g,
  /\b(?:Light|Dark)\s*\/\s*(?:Light|Dark)\b/g,
];

export const themeWording = (text: string): string[] => THEME_WORDING.flatMap((pattern) => text.match(pattern) ?? []);

/** "front-end" or "front end": the site writes "frontend", as noun and adjective. */
export const frontEndSpellings = (text: string): string[] => text.match(/\bfront[- ]end\b/gi) ?? [];

/**
 * Prices written another way than the copy's "PLN 4.40": "zł", the currency after the amount, or a decimal comma.
 * Screenshots show the Polish interface; copy that quotes a value from one writes it the copy's way.
 */
export const currencyMisses = (text: string): string[] => text.match(/zł|\d\s*PLN\b|PLN\s*\d+,\d/g) ?? [];
