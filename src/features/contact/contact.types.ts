export interface Engagement {
  /** primary: highlighted pill; selective: deliberately quieter. */
  tier: "primary" | "selective";
  label: string;
  body: string;
}
