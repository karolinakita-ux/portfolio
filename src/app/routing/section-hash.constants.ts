/** A section counts as "current" once its top passes this share of the viewport height (useSectionHash). */
export const READING_LINE = 0.3;

/**
 * Browsers built into social and messaging apps, by the marks they add to the user agent:
 * Facebook and Messenger (FBAN, FBAV, FB_IAB, Orca), Instagram, LinkedIn, X / Twitter, TikTok,
 * Snapchat, Pinterest, LINE, WeChat. They show a loading bar on every history write, so the
 * hash does not follow the reader there (their address bar is out of sight anyway).
 */
export const IN_APP_BROWSER =
  /\b(FBAN|FBAV|FB_IAB|FB4A|FBIOS|Orca-Android|MessengerForiOS|Instagram|LinkedInApp|Twitter|BytedanceWebview|musical_ly|Snapchat|Pinterest|Line\/|MicroMessenger)/i;
