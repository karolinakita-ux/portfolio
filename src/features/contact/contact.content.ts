import type { Engagement } from "./contact.types.ts";

export const CONTACT = {
  eyebrow: "Get in Touch",
  title: "Let’s Connect",
  intro:
    "I am open to new opportunities as a Senior Product Designer and Design Systems Specialist. Whether you have a complex enterprise project, need a design system consultation, or just want to chat about product design, feel free to reach out.",
  engagements: [
    {
      tier: "primary",
      label: "Open to Opportunities",
      body: "Full-time (Remote) or B2B Contract / Consulting. Available for long-term product teams or focused design system engagements.",
    },
  ] satisfies Engagement[],
  /** The CV under the channels: the page, and its PDF (the label adds the page count). */
  cv: { label: "CV", view: "View CV", download: "Download PDF" },
  targetRoles: ["Senior Product Designer", "Senior UX/UI Designer", "Design Systems Specialist"],
  location: "Poland (CET / UTC+1)",
  collaboration:
    "Available for remote work worldwide. Comfortable collaborating across European time zones and overlapping with US East Coast (EST) working hours.",
};
