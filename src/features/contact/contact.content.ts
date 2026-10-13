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
};
