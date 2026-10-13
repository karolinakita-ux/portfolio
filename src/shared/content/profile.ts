export const PROFILE = {
  name: "Karolina Kita",
  role: "Senior Product Designer",
  email: "karolina.kita.zg@gmail.com",
  linkedinUrl: "https://www.linkedin.com/in/karolinakita",
  /** Recommendations on LinkedIn, the source of the Work page quotes. */
  linkedinRecommendationsUrl: "https://www.linkedin.com/in/karolinakita/details/recommendations",
  figmaWorkspaceUrl:
    "https://www.figma.com/design/U5ke9Li7uZq06u8VM2VMCB/%F0%9F%A6%86-Karolina-Kita-Branding?node-id=0-1&t=LIh4obQs6HKRR9oF-1",
  /**
   * Source code of this site. null hides the Work page button: set it to
   * "https://github.com/karolinakita-ux/portfolio" once that repo is public.
   */
  repositoryUrl: null as string | null,
  /** Discreet footer note on how the site was made. */
  builtWith: "Designed in Figma, prototyped & built with Claude AI assistance",
} as const;
