/** Umami Cloud: the script, this site's id, and the only host that counts (see analytics.utils.ts). */
export const UMAMI = {
  script: "https://cloud.umami.is/script.js",
  websiteId: "19c960f0-bad6-40f5-b5cb-75dca6dc292f",
  /** The only host that counts; the tracker checks it again (data-domains). */
  host: "karolina.kita.company",
} as const;

/** Event names as the Umami dashboard lists them (at most 50 characters). Properties: EventData. */
export const EVENT = {
  linkRef: "link-ref",
  caseOpen: "case-open",
  caseNav: "case-nav",
  imageOpen: "image-open",
  figmaClick: "figma-click",
  githubClick: "github-click",
  linkedinClick: "linkedin-click",
  emailClick: "email-click",
  cvPrint: "cv-print",
  faqOpen: "faq-open",
  sectionLinkCopy: "section-link-copy",
  themeSwitch: "theme-switch",
} as const;

/** Calls waiting for the script; a blocked script never arrives, so the queue stays short. */
export const MAX_QUEUED = 50;

/** Umami keeps event values up to 500 characters; a tag is a company or channel name. */
export const MAX_REF_LENGTH = 100;
