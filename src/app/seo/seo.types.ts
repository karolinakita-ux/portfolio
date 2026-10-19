export interface PageHead {
  title: string;
  description: string;
  url: string;
  /** One JSON-LD document: the page, its breadcrumb and, for case studies, the work itself. */
  jsonLd: Record<string, unknown>;
}
