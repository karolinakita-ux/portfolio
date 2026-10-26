/**
 * More contrast (prefers-contrast: more; macOS and iOS "Increase contrast"): the stronger tokens of the Figma
 * modes lightMoreContrast and darkMoreContrast apply in both themes, and nothing changes without the setting.
 * Checked on two of the most used tokens: secondary text and the subtle border under the header.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

import { THEMES } from "./helpers/helpers.constants.ts";
import { openView } from "./helpers/page.utils.ts";

type Mode = Record<string, string | number>;
const { kitaBranding } = JSON.parse(
  readFileSync(join(process.cwd(), "src", "styles", "kita-branding.tokens.json"), "utf8"),
) as { kitaBranding: Record<string, Mode | undefined> };

/** A token as the browser reports a computed colour: rgb(r, g, b). */
function rgb(mode: string, token: string): string {
  const hex = kitaBranding[mode]?.[token];
  if (typeof hex !== "string") throw new Error(`no colour ${token} in ${mode}`);
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
  return `rgb(${String(r)}, ${String(g)}, ${String(b)})`;
}

for (const theme of THEMES) {
  for (const contrast of ["more", "no-preference"] as const) {
    test(`${theme} theme, contrast ${contrast}: secondary text and subtle borders`, async ({ page }) => {
      await page.emulateMedia({ contrast });
      await openView(page, "/about", { theme });
      const mode = contrast === "more" ? `${theme}MoreContrast` : theme;
      await expect(page.locator("header").first()).toHaveCSS("border-bottom-color", rgb(mode, "borderSubtle"));
      await expect(page.locator(".text-text-secondary").first()).toHaveCSS("color", rgb(mode, "textSecondary"));
    });
  }
}
