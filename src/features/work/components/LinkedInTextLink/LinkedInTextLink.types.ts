export interface LinkedInTextLinkProps {
  href: string;
  label: string;
  /** What the link opens, for the accessible name ("LinkedIn profile"). */
  destination: string;
  /** For the linkedin-click count. */
  target: "author" | "company";
}
