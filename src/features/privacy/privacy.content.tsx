import { PROFILE } from "#shared/content/profile.ts";
import { Lang } from "#shared/ui/Lang/Lang.tsx";
import { lead } from "#shared/ui/lead/lead.tsx";
import { TextLink } from "#shared/ui/TextLink/TextLink.tsx";

import type { PrivacyContent } from "./privacy.types.ts";

/**
 * The privacy policy (GDPR Art. 7, 13 and 21; Polish law: Art. 399 of Prawo komunikacji elektronicznej, UODO). Keep it true to the code and the vendors'
 * terms: analytics in shared/lib/analytics, hosting on Netlify (netlify.toml), the theme key in
 * shared/hooks/theme. Sources checked 2026-10-19: Netlify privacy policy and DPA (visitors of customer
 * sites, Data Privacy Framework, logs 90 days online and 1 year offline), Umami DPA and subprocessors
 * (Standard Contractual Clauses Module Two, servers in the USA and the EU), Google's frameworks page
 * (Data Privacy Framework), uodo.gov.pl (address, complaints). Consent for statistics: EDPB Guidelines
 * 2/2023 para. 33 (JavaScript that makes the browser send device information is in scope of ePrivacy
 * Art. 5(3), cookies or not) and Art. 399 PKE (no exception for analytics). Change `updated` with every edit.
 */

const email = <TextLink href={"mailto:" + PROFILE.email}>{PROFILE.email}</TextLink>;
// Umami's own homepage: what the tool is, in its words. The DPA is linked in the recipients table.
const umami = (
  <TextLink href="https://umami.is" external>
    Umami
  </TextLink>
);

export const PRIVACY: PrivacyContent = {
  eyebrow: "Privacy policy",
  title: "Privacy",
  intro: "How this website handles your data, in plain words.",
  updated: { iso: "2026-10-19", label: "19 October 2026" },
  sections: [
    {
      id: "in-short",
      title: "In short",
      points: [
        "No cookies, no ads, and nothing that follows you to other websites.",
        "I count visits with Umami only if you allow it. It sets no cookies, and you can change your choice at any time.",
        "The host, Netlify, logs each request to keep the site running and safe.",
        "If you email me, I use your message only to reply and to talk about work.",
      ],
    },
    {
      id: "controller",
      title: "Who is responsible",
      paragraphs: [
        <>
          I, Karolina Kita, run this website and decide how its data is used: I am the controller under the GDPR. You
          can reach me at {email}.
        </>,
        "I have not appointed a data protection officer. A personal website like this one does not need one.",
      ],
    },
    {
      id: "hosting",
      title: "When you open a page",
      paragraphs: [
        "Netlify, Inc. hosts this website. Like every web server, it receives your IP address, the page you ask for, the time and your browser's details, and keeps them in its logs.",
        "This keeps the site running and protects it from attacks. The legal basis is my legitimate interest in a working and secure website (GDPR Art. 6(1)(f)).",
        "Netlify keeps these logs online for 90 days and offline for up to a year, as its data processing agreement says.",
      ],
    },
    {
      id: "statistics",
      title: "Visitor statistics",
      paragraphs: [
        "I use Umami Cloud to see which pages and links are useful, so I can improve this portfolio. It counts your visit only if you allow it. The legal basis is your consent (GDPR Art. 6(1)(a)). The statistics show counts and trends; I do not try to find out who you are.",
      ],
      points: [
        lead(
          "What I count",
          "The pages you open and the site that sent you here. I also count clicks on case studies, screenshots, FAQ questions, section links, the light / dark switch, and links to LinkedIn, Figma, GitHub and email.",
        ),
        lead(
          "What is recorded with it",
          "Your browser, operating system, device type, screen size, language and approximate location (country, region and city). Umami uses your IP address only to work out the location; its data processing agreement does not list the IP address among the data it keeps.",
        ),
        lead(
          "Why I ask first",
          "The statistics script reads your screen size and language and sends them. European law and the Polish Electronic Communications Law (Art. 399) need your consent for that, even without cookies.",
        ),
        lead("No cookies", "The statistics set no cookies. Only your choice is kept in your browser."),
        lead("How long", "Umami keeps the statistics for 6 months, then deletes them."),
        lead(
          "Tagged links",
          "Links I share, for example in job applications, may end in ?ref= and a company or channel name, so I can see which link brought a visit. They never contain a person's name.",
        ),
      ],
      intro: [
        "Without your consent the statistics script does not load. If your browser sends Do Not Track or Global Privacy Control, I do not ask and do not count. You can change your choice here at any time; switching off is as easy as allowing:",
      ],
    },
    {
      id: "email",
      title: "When you email me",
      paragraphs: [
        <>If you write to {email}, I use your address and your message to reply and to talk about work.</>,
        "The legal basis is taking the steps you ask for before a possible contract (GDPR Art. 6(1)(b)) or, for other messages, my legitimate interest in answering them (Art. 6(1)(f)).",
        "My email runs on Gmail, so Google receives the messages. I keep them as long as we are in touch about work, and longer only if we work together or the law requires it.",
      ],
    },
    {
      id: "device",
      title: "Cookies and your device",
      paragraphs: ["This website sets no cookies. It saves something on your device only when you ask for it:"],
      points: [
        lead("Your theme", "when you pick light or dark mode, your browser keeps that choice (kb-theme)."),
        lead(
          "Your statistics choice",
          "when you allow or decline statistics, your browser keeps that choice (kb-statistics), so I do not ask again.",
        ),
      ],
      after: [
        "Both stay in your browser and are never sent anywhere. Clearing this site's data in your browser removes them. Fonts and images come from this website itself, not from other services.",
      ],
    },
    {
      id: "recipients",
      title: "Who receives data",
      paragraphs: [
        "These companies receive data when you visit this website or email me. I do not sell data, and I do not share it with anyone else.",
      ],
    },
    {
      id: "rights",
      title: "Your rights",
      paragraphs: ["You can ask me to:"],
      points: [
        lead("Access", "show you the data I have about you (GDPR Art. 15)."),
        lead("Correction", "correct it (Art. 16)."),
        lead("Deletion", "delete it (Art. 17)."),
        lead("Restriction", "limit how I use it (Art. 18)."),
        lead("Portability", "give you the messages you sent me in a common file format (Art. 20)."),
        lead(
          "Withdraw consent",
          "switch statistics off on this page at any time. It does not change what was counted before (Art. 7(3)).",
        ),
      ],
      intro: [<>Write to {email}. I answer within one month.</>],
      after: [
        <>
          You can also complain to the President of the Personal Data Protection Office (
          <Lang lang="pl">Prezes Urzędu Ochrony Danych Osobowych</Lang>, UODO),{" "}
          <Lang lang="pl">ul. Stanisława Moniuszki 1A, 00-014 Warszawa</Lang>,{" "}
          <TextLink href="https://uodo.gov.pl/en" external>
            uodo.gov.pl
          </TextLink>
          .
        </>,
        "You do not have to give me any data: the website works the same with statistics switched off. I make no automated decisions about you and build no profiles.",
      ],
    },
    {
      id: "links",
      title: "Links to other websites",
      paragraphs: ["Links to LinkedIn, Figma and GitHub open those websites. Their own privacy policies apply there."],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      paragraphs: [
        "I update this page when the website changes how it uses data. The date at the top shows the latest version.",
      ],
    },
  ],
  recipients: [
    {
      name: "Netlify, Inc. (USA)",
      text: "Hosting. Processes data on my behalf under its data processing agreement. Transfers to the USA rely on the EU-U.S. Data Privacy Framework.",
      policy: { label: "Netlify privacy policy", href: "https://www.netlify.com/privacy/" },
    },
    {
      name: "Umami Software, Inc. (USA)",
      text: "Visitor statistics, on servers in the EU and the USA. Processes data on my behalf under its data processing agreement, which includes the EU Standard Contractual Clauses.",
      policy: { label: "Umami data processing agreement", href: "https://umami.is/dpa" },
    },
    {
      name: "Google LLC (USA)",
      // A free Gmail account: Google is not a processor here, it handles mail under its own policy.
      text: "Email (Gmail). Google handles the messages under its own privacy policy. Transfers to the USA rely on the EU-U.S. Data Privacy Framework.",
      policy: { label: "Google privacy policy", href: "https://policies.google.com/privacy" },
    },
  ],
  objection: {
    title: "Your right to object",
    text: "You can object at any time to the use of your data based on my legitimate interest: the server logs, and emails that are not about work (GDPR Art. 21). The statistics run only with your consent, which you can withdraw with the switch on this page.",
  },
  statisticsSwitch: {
    on: "Statistics are on in this browser: you allowed them.",
    off: "Statistics are off in this browser.",
    unset: "You have not decided yet, so statistics are off.",
    browser:
      "Your browser asks websites not to track you (Do Not Track or Global Privacy Control), so this site does not count your visits.",
    noScript: "Without JavaScript, this site does not count your visits.",
    switchOff: "Switch statistics off",
    switchOn: "Allow statistics",
  },
  consent: {
    title: "Can I count your visit?",
    // Valid consent names who asks, what for, which data and that it can be withdrawn (EDPB Guidelines 05/2020, para. 64).
    text: (
      <>
        I, Karolina Kita, use {umami}, a visitor statistics tool, to see which pages and links are useful. It sets no
        cookies and does not follow you to other websites. It reads your screen size and language, so I ask first. You
        can change your choice at any time on the privacy page.
      </>
    ),
    allow: "Allow statistics",
    decline: "No, thanks",
    details: "Privacy details",
  },
};
