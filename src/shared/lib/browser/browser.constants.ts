/**
 * Browsers built into social and messaging apps, by the marks they add to the user agent, in the
 * order they are tried: Messenger and Instagram carry Facebook's marks too. They show a loading bar
 * on every history write (useSectionHash leaves the hash alone there), and visitor statistics name
 * the app a visit came through (session data: inApp).
 */
export const IN_APP_BROWSERS = [
  ["messenger", /\b(Orca-Android|MessengerForiOS)/i],
  ["instagram", /\bInstagram/i],
  ["facebook", /\b(FBAN|FBAV|FB_IAB|FB4A|FBIOS)/i],
  ["linkedin", /\bLinkedInApp/i],
  ["x", /\bTwitter/i],
  ["tiktok", /\b(BytedanceWebview|musical_ly)/i],
  ["snapchat", /\bSnapchat/i],
  ["pinterest", /\bPinterest/i],
  ["line", /\bLine\//i],
  ["wechat", /\bMicroMessenger/i],
] as const satisfies ReadonlyArray<readonly [string, RegExp]>;
