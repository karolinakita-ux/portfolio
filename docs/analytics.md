# Visitor statistics: tracking plan

What this site sends to [Umami Cloud](https://umami.is), why, and the rules for changing it. The code lives in `src/shared/lib/analytics/`; how the parts fit together is in [architecture.md](architecture.md#visitor-statistics). What visitors are told is the privacy page (`src/features/privacy/privacy.content.tsx`). `src/shared/lib/analytics/tracking-plan.test.ts` fails when an event or a session property is missing here, or this file lists one the code does not send.

## Principles

1. **Consent first.** Nothing loads before the visitor allows statistics (the consent box or the switch on /privacy). ePrivacy Art. 5(3) and Art. 399 of the Polish Prawo komunikacji elektronicznej need consent for a script that reads device data, cookies or not. Do Not Track and Global Privacy Control mean nobody is asked. Only the live host counts (`UMAMI.host`).
2. **Each event answers a question Karolina acts on.** If no decision depends on it, it is not sent. The table below names the question for every event.
3. **Ranges, not exact values**, for anything a visitor could be told apart by: time, window width, pixel density. Never names, email addresses, text the visitor typed or copied, the exact spot of a click, or an id that links visits.
4. **One way in.** Events go through `track()` with a name from `EVENT` and properties from `EventData` (a wrong name or property is a type error). Pageviews go through `trackPageview()`, session data through `analytics.utils.ts` only. No `data-umami-event` attributes, no second tracker, no direct calls to `window.umami`.
5. **Told before it is sent.** Every event has a line in the privacy policy. A new kind of data also bumps `STORED_CHOICE.on`, so earlier yeses are asked again, and goes into the consent box text.

## Naming

**Event names** are kebab-case (`a-z` and hyphens), at most 50 characters (Umami's limit).

- Something the visitor does: `<object>-<verb>`, e.g. `case-open`, `theme-switch`, `section-link-copy`. The verbs in use are **open**, **nav**, **click**, **copy**, **switch** and **print**. Reuse one of them; add a new verb only when none fits, and add it to this list.
- Something measured, not done: a noun phrase, e.g. `time-on-page`, `dead-click`, `page-not-found`, `js-error`.
- Links that leave the site: `<destination>-click` for the main destinations (`figma-click`, `github-click`, `storybook-click`, `linkedin-click`, `email-click`); `outbound-click` with `host` for any other.
- Context goes in properties, not in the name: `figma-click` with `place: "hero"`, not `figma-hero-click`.
- Keep a name once it is live: Umami groups history by name, and a renamed event starts from zero.

**Property names** are lowerCamelCase, one word where possible. The same meaning keeps the same name:

| Property    | Meaning                                                                         |
| ----------- | ------------------------------------------------------------------------------- |
| `place`     | where on the site a link or button sits (`hero`, `banner`, `footer`, `contact`) |
| `case`      | a case study's view id (`case-meetestim`)                                       |
| `image`     | a screenshot card's id                                                          |
| `area`      | the section id around an element, a hero's name, or the landmark                |
| `element`   | the kind of element (`image`, `icon`, `heading`, `text`, `card`, `page`)        |
| `label`     | site copy that names the element (alt text, heading, card title)                |
| `direction` | `prev` or `next`                                                                |
| `input`     | `mouse`, `touch`, `pen` or `keyboard`; added by `track()`, never by hand        |

Never a property called `id`: `umami.identify()` takes it as a Distinct ID and links visits.

**Property values** are lowercase kebab-case ids and choices (`card-link`, `case-automotive`). Values the dashboard groups by are readable range labels with short hyphens (`10 - 30 s`, `768 - 1023px`); a raw number goes beside one only when sums or exports need it (`seconds`). Umami keeps strings up to 500 characters and 50 properties per event; this site cuts text at 100 - 150 characters.

## What Umami records by itself

Every request carries the address (`url`), page title, referrer, screen size (`390x844`), browser language and the site's version as the tag (`data-tag`). Umami works out the browser, operating system, device type and approximate location (country, region, city) from them and from the IP address, which it does not keep. A session is a hash of the IP address, the browser and a salt that Umami rotates, with no cookie.

Addresses are cleaned before anything goes (`payload.utils.ts`, applied to the tracker's own requests too): no hash, and no query parameter but `ref` and the UTM parameters (`KEPT_PARAMS`), so click ids such as `fbclid`, `gclid` and `li_fat_id` never reach Umami. A referrer from another site loses its query and hash.

## Events

| Event               | Sent when                                                                         | Properties                                | Question it answers                                             |
| ------------------- | --------------------------------------------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------- |
| `link-ref`          | the first page of a visit was opened from a tagged link (`?ref=`, `utm_source`)   | `ref`                                     | Which application or channel brought the visit?                 |
| `case-open`         | a case study is opened from the Work page                                         | `case`, `from` (`card-link`, `thumbnail`) | Which cases draw people in, and from which part of the card?    |
| `case-nav`          | the previous / next case link at the end of a case study                          | `from`, `to`, `direction`                 | Do readers go on to the next case?                              |
| `image-open`        | a screenshot opens in the image viewer                                            | `case`, `image`                           | Which screenshots do people want to see up close?               |
| `image-nav`         | the viewer moves to the next or previous screenshot (arrow, key, swipe)           | `case`, `image`, `direction`              | Do people browse the gallery, and how far?                      |
| `figma-click`       | a link to the Figma workspace                                                     | `place`                                   | Do visitors check the design files?                             |
| `github-click`      | a link to the source code                                                         | `place`                                   | Do visitors check the code?                                     |
| `storybook-click`   | a link to the Storybook component library                                         | `place`                                   | Do visitors check the component library?                        |
| `linkedin-click`    | a link to LinkedIn                                                                | `target`, `place`                         | Which LinkedIn links lead somewhere (profile, recommendations)? |
| `email-click`       | the email link or its Copy button                                                 | `action` (`mailto`, `copy`), `place`      | How many visitors try to get in touch, and how?                 |
| `outbound-click`    | a link to any other website (`TextLink external`)                                 | `host`                                    | Which other links are used?                                     |
| `faq-open`          | a FAQ question opens (not when it closes)                                         | `question`                                | Which questions matter to visitors?                             |
| `section-link-copy` | the copy-link button next to a section heading                                    | `section`                                 | Which sections do people share?                                 |
| `text-copy`         | the visitor selects text and copies it                                            | `element`, `area`, `label`                | Which content do people take with them?                         |
| `theme-switch`      | the light / dark switch changes the theme                                         | `theme`                                   | Is dark mode used on purpose?                                   |
| `page-print`        | the page goes to the printer or to a PDF                                          | none                                      | Which pages do people print or save?                            |
| `time-on-page`      | the visitor leaves a page, switches tabs or apps, or closes it                    | `time`, `seconds`, `scroll`, `section`    | Which pages are read, and how far?                              |
| `dead-click`        | a click or tap on something that does nothing, once per burst                     | `element`, `area`, `label`                | What do people expect to be a link or a bigger image?           |
| `rage-click`        | the same burst reaches three quick clicks on one spot                             | `element`, `area`, `label`                | Where does the site frustrate people?                           |
| `page-not-found`    | the visitor opened an address that matches no page (sent with the first pageview) | `path`                                    | Which links to the site are broken?                             |
| `js-error`          | an error in the site's own code: at most 3 a page, each message once              | `kind`, `message`, `file`                 | Is the site broken in some browser or in-app browser?           |

`link-ref`, `time-on-page` and `page-not-found` never carry `input`: no click or key starts them (`PASSIVE_EVENTS`).

## Session data

Sent once per page load with `umami.identify()` (`session.utils.ts`), never with an id. Umami shows it on the Sessions page, and every report can be filtered by it.

| Property      | Values                                                                              | Question it answers                                 |
| ------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------- |
| `viewport`    | browser window width at the site's breakpoints: `under 480px` ... `1280px or wider` | Which layouts are seen most, and so polished first? |
| `pixelRatio`  | `1x`, `1.5x`, `2x`, `3x`                                                            | Which image resolutions are worth producing?        |
| `theme`       | `light`, `dark`: the theme when the page loaded                                     | How many visitors see dark mode?                    |
| `themeSource` | `system` (follows the device), `picked` (chosen with the switch)                    | Is dark mode a device default or a choice?          |
| `inApp`       | `linkedin`, `messenger`, `instagram`, `facebook`, ... or `none`                     | How many visits come through an app's own browser?  |

## Speed reports

`data-performance` turns on the tracker's own Core Web Vitals: LCP, INP, CLS, FCP and TTFB, shown in Umami's Performance tab as p50, p75 and p95 by page and by device or browser.

- The tracker stays initialised for it, with its own pageviews off (`data-auto-pageview="false"`): the app sends one pageview per view.
- It takes every `history.pushState` and `history.replaceState` as a new page. A new view goes through `pushState`, so each view gets its report. The section hash while reading, a jump within the same view and the first load's normalised address go past it (`replaceAddress` in `shared/lib/routes/address.utils.ts`).
- Load metrics (TTFB, FCP, LCP) belong to the page the browser loaded. When the visitor moved to another view before allowing statistics, they are dropped, so the first page's load is never credited to another one (`LOAD_METRICS`).
- `beforeSend` (`data-before-send`) gives each report the page the app counted last, cleans its addresses, and cancels it once statistics are off.

## Not collected, on purpose

- **Heatmaps and session replays.** Umami's `recorder.js` is a 190 KB rrweb recorder that copies the page's content to Umami, and the free Hobby plan does not include it. `dead-click`, `time-on-page` (scroll depth) and `text-copy` answer the same questions without recording the page.
- **Distinct IDs** (`data-distinct-id`, `identify()` with an id): visits stay unlinked.
- **Accessibility settings** (reduced motion, forced colours, contrast): they can hint at health, and the site supports them for everyone anyway.
- **Connection type, memory, battery, exact screen pixels beyond Umami's own `screen`**: more fingerprinting surface, and no decision depends on them.
- **Text**: what visitors type or copy, and the exact spot of a click.

## Adding or changing an event

1. Write down the question it answers. No question, no event.
2. Name it by the rules above. Add it to `EVENT` and `EventData` in `analytics.constants.ts` / `analytics.types.ts`, with a comment on when it is sent. No click or key behind it: add it to `PASSIVE_EVENTS`.
3. Send it with `track()` from the component, or from a watcher in `src/shared/lib/analytics/` for page-wide signals (remove its listener when statistics go off).
4. Add its line to the privacy policy, update `updated` there and the /privacy `<lastmod>` in `public/sitemap.xml`. A new kind of data, not just one more click of a kind already listed: bump `STORED_CHOICE.on` and update the consent box text.
5. Add its row to the events table here.
6. Test it: the helper's unit test, `src/app/analytics/analytics.test.tsx` for what the app reports, and `e2e/analytics.e2e.ts` when the real tracker is involved.
7. Add the change to `CHANGELOG.md`.

## Event budget

The Hobby plan allows 100,000 events a month and keeps data for 6 months, which the privacy policy states. Pageviews, events, session data and speed reports all count: a page view costs about four (pageview, `time-on-page`, speed report, a click or two), a visit adds one for session data. Dead clicks count once per burst, errors at most three a page, and calls waiting for the script at most 50.

## Using the dashboard

- **Goals**: `email-click` and `linkedin-click` (a visitor tries to get in touch), `case-open`.
- **Funnel**: `/` → `case-open` (or a `/work/...` page) → `email-click` or `linkedin-click`.
- **Journey**: which pages lead to Contact, and where visits end.
- **Compare releases**: filter by tag (the version from `package.json`).
- **Filter by session data**: `inApp` is `linkedin` for visits from LinkedIn's app; `viewport` for one layout.
- **Performance tab**: p75 of LCP, INP and CLS per page and device. Google's limits: LCP 2.5 s, INP 200 ms, CLS 0.1.
- **UTM report** for `utm_*` links; `link-ref` for `?ref=` tags.
- **Events → Properties**: `dead-click` by `area` and `label`, `time-on-page` by `time` and `scroll`, `page-not-found` by `path`, `js-error` by `message`.

## Your own visits

Choose "No, thanks" in the consent box on your own devices. To keep testing the live site without counting it, run `localStorage.setItem("umami.disabled", "1")` in the browser console there: the tracker sends nothing while it is set.
