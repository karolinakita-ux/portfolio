import { PROFILE } from "#shared/content/profile.ts";

export interface Engagement {
  /** primary: highlighted pill; selective: deliberately quieter. */
  tier: "primary" | "selective";
  label: string;
  body: string;
}

export const CONTACT = {
  eyebrow: "Get in touch",
  title: "Let’s connect",
  intro:
    "I am open to new opportunities as a Senior Product Designer and Design Systems specialist. Whether you have a complex enterprise project, need a design system consultation, or just want to chat about product design, feel free to reach out.",
  engagements: [
    {
      tier: "primary",
      label: "Open to Opportunities",
      body: "Full-time (Remote) or B2B Contract / Consulting. Available for long-term product teams or focused design system engagements.",
    },
  ] satisfies Engagement[],
  targetRoles: ["Senior Product Designer", "Senior UX/UI Designer", "Design System Specialist"],
  location: "Poland (CET / UTC+1)",
  collaboration:
    "Available for remote work worldwide. Comfortable collaborating across European time zones and overlapping with US East Coast (EST) working hours.",
  /**
   * Privacy note (GDPR Art. 13) for the visitor statistics in src/shared/lib/analytics.utils.ts.
   * Keep it true to the code: what is counted, the vendor, how long, how to opt out.
   */
  privacy: {
    title: "Privacy",
    intro:
      "This site counts visits so I can see which pages and links are useful. It sets no cookies and saves nothing on your device to do this.",
    points: [
      [
        "What I count",
        "The pages you open and the site that sent you here. I also count clicks: case studies, screenshots, FAQ questions, section links, the light / dark switch, and links to LinkedIn, Figma, GitHub and email.",
      ],
      [
        "What is recorded with it",
        "Your browser, operating system, device type, screen size, language and approximate location (country, region and city). Umami says it does not store IP addresses.",
      ],
      [
        "Who processes it",
        "Umami Software, Inc. (USA) runs the statistics service on servers in the EU and the US. Its data processing agreement includes the EU Standard Contractual Clauses. Data is kept for 6 months.",
      ],
      [
        "Why",
        "To learn how visitors use this portfolio and to improve it. The legal basis is my legitimate interest (GDPR Art. 6(1)(f)).",
      ],
      [
        "Tagged links",
        "Links I share, for example in job applications, may end in ?ref= and a company or channel name, so I can see which link brought a visit. They never contain a person's name.",
      ],
      [
        "How to opt out",
        "Turn on Do Not Track or Global Privacy Control in your browser, and this site does not load the statistics script at all. A content blocker works too.",
      ],
      [
        "Your theme choice",
        "If you pick light or dark mode, your browser keeps that choice on your device. It is not sent anywhere.",
      ],
      [
        "Your rights",
        `I, Karolina Kita, am responsible for this data. You can ask me for access, correction or deletion, or object to it, at ${PROFILE.email}. You can also complain to the Polish data protection authority (UODO).`,
      ],
    ] satisfies Array<[term: string, text: string]>,
  },
};
