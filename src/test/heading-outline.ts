/**
 * Where a page's headings do not form a correct outline. Screen reader users move through a page by its headings,
 * and a heading's level says what it belongs to, so the levels must match the page:
 * - one H1, and it comes first;
 * - no skipped level: a heading is at most one level below the heading before it (H2, then H4 is not);
 * - a heading is deeper than the title of every part it sits in (a section, article or nav labelled by a heading),
 *   so a block's own parts are not its siblings: a banner inside a comparison titled with an H3 takes an H4;
 * - a heading sits inside the part that its outline parent (the nearest heading before it at a higher level) titles,
 *   so a banner after a section is not filed under it: after the lessons' section, outside it, it takes an H2. Not
 *   for the H1: the whole page belongs to it, not only the hero it titles.
 */
const levelOf = (heading: Element): number => Number(heading.localName.slice(1));
const nameOf = (heading: Element): string =>
  `H${String(levelOf(heading))} "${heading.textContent.replace(/\s+/g, " ").trim()}"`;
const isHeading = (element: Element | null): element is HTMLHeadingElement =>
  element !== null && /^h[1-6]$/.test(element.localName);

/** The heading that titles a part of the page: the first heading its aria-labelledby names. */
function titleOf(part: Element): HTMLHeadingElement | null {
  const ids = part.getAttribute("aria-labelledby")?.split(/\s+/) ?? [];
  for (const id of ids) {
    const target = part.ownerDocument.getElementById(id);
    if (isHeading(target)) return target;
  }
  return null;
}

export function outlineProblems(root: Element): string[] {
  const headings = [...root.querySelectorAll("h1, h2, h3, h4, h5, h6")];
  const parts = [...root.querySelectorAll("[aria-labelledby]")].flatMap((part) => {
    const title = titleOf(part);
    return title && part.contains(title) ? [{ part, title }] : [];
  });
  const problems: string[] = [];

  const h1s = headings.filter((heading) => levelOf(heading) === 1);
  if (h1s.length !== 1 || headings[0] !== h1s[0]) {
    const first = headings[0];
    problems.push(`one H1, first: ${String(h1s.length)} H1, first heading ${first ? nameOf(first) : "none"}`);
  }

  headings.forEach((heading, index) => {
    const level = levelOf(heading);
    const previous = headings[index - 1];
    if (previous && level > levelOf(previous) + 1) {
      problems.push(`${nameOf(heading)} skips a level after ${nameOf(previous)}`);
    }
    for (const { part, title } of parts) {
      if (title !== heading && part.contains(heading) && levelOf(title) >= level) {
        problems.push(`${nameOf(heading)} sits inside the part titled ${nameOf(title)}, at its level or above it`);
      }
    }
    let parent: Element | undefined;
    for (let before = index - 1; before >= 0 && !parent; before--) {
      const candidate = headings[before];
      if (candidate && levelOf(candidate) < level) parent = candidate;
    }
    const titled = parts.filter(({ title }) => title === parent).map(({ part }) => part);
    if (parent && levelOf(parent) > 1 && titled.length > 0 && !titled.some((part) => part.contains(heading))) {
      problems.push(`${nameOf(heading)} is filed under ${nameOf(parent)} but sits outside the part it titles`);
    }
  });
  return problems;
}
