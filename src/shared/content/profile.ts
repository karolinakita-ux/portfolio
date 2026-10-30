export const PROFILE = {
  name: "Karolina Kita",
  role: "Senior Product Designer",
  email: "karolina.kita.zg@gmail.com",
  linkedinUrl: "https://www.linkedin.com/in/karolinakita",
  /** Her GitHub profile: named in the site-wide structured data (index.html sameAs) and llms.txt. */
  githubProfileUrl: "https://github.com/karolinakita-ux",
  /** Recommendations on LinkedIn, the source of the Work page quotes. */
  linkedinRecommendationsUrl: "https://www.linkedin.com/in/karolinakita/details/recommendations",
  figmaWorkspaceUrl:
    "https://www.figma.com/design/U5ke9Li7uZq06u8VM2VMCB/%F0%9F%A6%86-Karolina-Kita-Branding?node-id=0-1&t=LIh4obQs6HKRR9oF-1",
  /**
   * Source code of this site (public repo). null hides the GitHub links on the Work page
   * (hero button, Behind the Design banner), e.g. if the repo goes private again.
   */
  repositoryUrl: "https://github.com/karolinakita-ux/portfolio" as string | null,
  /**
   * The component library (Storybook). Only production deploys build it, so builds link the live one,
   * absolute, which works from local previews and the artifact too. `yarn dev` links the local
   * `yarn storybook` instead (port 6006, package.json), so unreleased stories show there. null hides
   * its Work page links (hero button, Behind the Design banner).
   */
  storybookUrl: (import.meta.env.MODE === "development"
    ? `http://${window.location.hostname}:6006/`
    : "https://karolina.kita.company/storybook/") as string | null,
  /**
   * The CV as a PDF, made from the /cv page by `yarn cv-pdf` (scripts/cv-pdf.ts) and served from public/. The
   * name never changes: recruiters save the link. Vite's base keeps it next to the page in a one-page build
   * (the claude.ai artifact). The pages are in the download labels; src/app/seo/cv-pdf.test.tsx checks them.
   */
  cvPdfUrl: import.meta.env.BASE_URL + "karolina-kita-cv.pdf",
  cvPdfPages: 2,
  /** Discreet footer note on how the site was made. */
  builtWith: "Designed in Figma, prototyped & built with Claude AI assistance",
} as const;
