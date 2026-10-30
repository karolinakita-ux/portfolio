---
name: add-tracking
description: Add or change a visitor statistics event or session property (Umami) the way this repo requires - the question it answers, the tracker's real behaviour, the privacy policy and consent decision, the tracking plan and tests. Use whenever a change sends something new to Umami or changes what an event or the session data carries.
---

# Add an event or a session property to the statistics

The rules are in `docs/analytics.md` (the tracking plan: principles, naming, every event and session property) and CLAUDE.md (Code conventions, visitor statistics).

1. **The question.** Write down the question the data answers and the decision it feeds. No question, no data. Check "Not collected, on purpose" in the plan first.
2. **The tracker as it is now.** Download `https://cloud.umami.is/script.js` and read what it does with the call you plan (`track`, `identify`, the `data-*` options). Where the dashboard will show it decides how to send it: Events → Properties lists event data, Sessions → Properties lists session data, and the tag is only a filter and a list under Other → Tag. When unsure, read Umami's current source on GitHub.
3. **Event or session property.**
   - Something the visitor does, or a measurement at one moment: an event. Add it to `EVENT` in `analytics.constants.ts` and its properties to `EventData` in `analytics.types.ts`, send it with `track()`, and add it to `PASSIVE_EVENTS` when no click or key starts it.
   - Something true for the whole page load: a session property in `sessionData()` (`session.utils.ts`) and `SessionData`, sent once with `umami.identify()`. Never an `id` key. Umami keeps one value per session and property: a later page load replaces it, and a key that is not sent keeps its old value.
   - Name it by the plan's rules. Ranges, not exact values, for anything that could tell visitors apart.
4. **Tell visitors.** Add or extend its line in the privacy policy (`src/features/privacy/privacy.content.tsx`), set `updated` to today and the /privacy `<lastmod>` in `public/sitemap.xml`. Then decide whether it is a new kind of data: if neither the policy nor the consent box text covers it yet, bump `STORED_CHOICE.on` (earlier yeses are asked again) and update the consent box text. Write the decision and the reason in the changelog entry.
5. **The plan.** Add its row to `docs/analytics.md` (the events or the session data table) and the event's properties to `EVENT_PROPERTIES` in `tracking-plan.test.ts` (`yarn typecheck` fails until they match), and update "Using the dashboard" if it is read somewhere new. `tracking-plan.test.ts` fails until the plan and the code match.
6. **Tests.** The helper's unit test, `analytics.utils.test.ts` for what reaches the tracker, and `e2e/analytics.e2e.ts` for the real tracker (it catches every call before it leaves and needs the internet). Expectations about the device come from the page (`page.evaluate`), never from assumptions.
7. **Copy.** Run the `copy-reviewer` agent on the policy text, then commit with `ship-change`: new data is a minor version.
