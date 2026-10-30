export interface PageHead {
  title: string;
  description: string;
  url: string;
  /** One JSON-LD document: the page, its breadcrumb and, for case studies, the work itself. */
  jsonLd: Record<string, unknown>;
}

/** A tag in index.html's head that carries one of the page's values (HEAD_TAGS in seo.constants.ts). */
export interface HeadTag {
  tag: "meta" | "link";
  /** The attribute and value that name the tag, in this order in index.html: name="description", rel="canonical". */
  key: readonly [attribute: string, value: string];
  /** The attribute that holds the page's value. */
  attribute: "content" | "href";
  field: keyof Pick<PageHead, "title" | "description" | "url">;
}
