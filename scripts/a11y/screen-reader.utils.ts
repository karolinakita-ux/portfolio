import { createRequire } from "node:module";
import type { Page } from "playwright";

import { MAX_SR_STEPS } from "./a11y.constants.ts";

const require = createRequire(import.meta.url);
/** The Guidepup Virtual Screen Reader browser bundle, injected into each page. */
export const vsrBundlePath = require.resolve("@guidepup/virtual-screen-reader/browser.js");

export async function loadScreenReader(page: Page, bundle: string): Promise<void> {
  await page.route("**/__vsr.js", (route) => route.fulfill({ contentType: "text/javascript", body: bundle }));
  await page.addScriptTag({ type: "module", content: "import { virtual } from '/__vsr.js'; window.__vsr = virtual;" });
  await page.waitForFunction(() => window.__vsr !== undefined);
  // Real browsers with JavaScript on do not expose <noscript>; the emulated reader would read its raw HTML.
  await page.evaluate(() => document.querySelectorAll("noscript").forEach((node) => node.remove()));
}

/** Walks the emulated screen reader from the start of `selector` to its end; returns the spoken phrases. */
export async function screenReaderTranscript(page: Page, selector: string): Promise<string[]> {
  return page.evaluate(
    async ({ selector, maxSteps }) => {
      const vsr = window.__vsr;
      const container = document.querySelector(selector);
      if (!vsr || !container) return ["(screen reader or container missing)"];
      await vsr.start({ container });
      // The reader wraps to the top after the last item: stop when the opening phrase comes round again.
      const opening = await vsr.lastSpokenPhrase();
      for (let step = 0; step < maxSteps; step++) {
        await vsr.next();
        if ((await vsr.lastSpokenPhrase()) === opening) break;
      }
      const log = (await vsr.spokenPhraseLog()).slice(0, -1);
      await vsr.stop();
      return log;
    },
    { selector, maxSteps: MAX_SR_STEPS },
  );
}
