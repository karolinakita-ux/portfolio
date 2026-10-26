/**
 * Text that runs together when a page is read without CSS. Search engines, AI assistants, reader modes and
 * plain-text copies take the HTML's own text, where elements that the layout shows apart (flex items, spans
 * set to block) sit side by side: "Next Case Study" and the case name after it read "Next Case
 * StudyEnterprise" unless the markup has a space between them. A space between flex items is not rendered,
 * so `{" "}` there costs no layout.
 */
const BLOCK = new Set(
  "address article aside blockquote body br dd details dialog div dl dt fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 header hr li main nav ol p pre section summary table tbody td tfoot th thead tr ul".split(
    " ",
  ),
);
const SKIP = new Set(["script", "style", "template", "noscript", "svg"]);

interface Run {
  text: string;
  parent: Element | null;
}

/** Each place where text from two different elements touches with no space, as "…left" + "right…". */
export function joinedText(root: Element): string[] {
  // null marks the edge of a block element, which keeps the text on both sides apart.
  const runs: Array<Run | null> = [];
  const walk = (node: Node): void => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        if (child.textContent) runs.push({ text: child.textContent, parent: child.parentElement });
      } else if (child instanceof Element && !SKIP.has(child.localName)) {
        const block = BLOCK.has(child.localName);
        if (block) runs.push(null);
        walk(child);
        if (block) runs.push(null);
      }
    }
  };
  walk(root);
  return runs.flatMap((right, index) => {
    const left = runs[index - 1];
    if (!left || !right || left.parent === right.parent) return [];
    const touching = /[\p{L}\p{N}.,:;!?)\]]$/u.test(left.text) && /^[\p{L}\p{N}(]/u.test(right.text);
    return touching ? [`"…${left.text.slice(-24)}" + "${right.text.slice(0, 24)}…"`] : [];
  });
}
