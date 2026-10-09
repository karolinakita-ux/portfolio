/**
 * Cover letter content - single source of truth for the #cover-letter view
 * and its A4 / PDF export.
 *
 * Same plain-text rules as cv-data.ts (checked in content.test.ts):
 *   - No icons, emoji, curly quotes or long dashes. Use " - " and straight apostrophes.
 *   - The date is ISO ("2026-10-08"); CoverLetterView formats it as "October 8, 2026".
 *   - Highlights are { lead, text } pairs, rendered as "<strong>Lead:</strong> text"
 *     (the portfolio's bold lead-in rule).
 *
 * Sender details extend the CV header, so name, email and links live in one place.
 * Keep the whole letter on one A4 page: the view shows the remaining space on
 * screen and warns when the copy runs over.
 */
import { CV } from "./cv-data.ts";
import type { CoverLetter } from "./types.ts";

export const COVER_LETTER: CoverLetter = {
  sender: {
    ...CV.header,
    phone: "+48 123 456 789",
  },

  date: "2026-10-08",

  recipient: ["Hiring Team", "Company name"],

  subject: "Application for Senior Product Designer",

  salutation: "Dear Hiring Team,",

  opening:
    "I am applying for the Senior Product Designer role. I bring 8+ years of designing complex enterprise software - operations tools, administration back-offices and heavy data systems where a single screen carries hundreds of records, permissions and states. Three strengths shape how I would approach your products:",

  highlights: [
    {
      lead: "Enterprise Software & Dense Data",
      text: "I design data-heavy enterprise tools, scheduling engines and administration back-offices. My focus is turning dense tables, layered permissions and edge cases into clear workflows that operations teams can trust under time pressure.",
    },
    {
      lead: "Working Directly with Engineering",
      text: "I build design systems for 1:1 translation into frontend code, with clear specs for edge cases, interaction states and accessibility. Engineers get a predictable handoff instead of a set of screens to interpret.",
    },
    {
      lead: "Research Grounded in Psychology & Prototyping",
      text: "My M.Sc. in Psychology shapes workflows around users' mental models and cognitive load. I pair it with rapid code prototyping in Claude Code to validate interaction logic with real states and data before implementation starts.",
    },
  ],

  closing:
    "I would welcome the opportunity to discuss how this practical, systems-oriented approach could support your platform roadmap. Thank you for your time and consideration.",

  signOff: "Sincerely,",
};
