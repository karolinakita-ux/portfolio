import { Fragment } from "react";

import { CvEmailLink } from "#features/cv/components/CvEmailLink/CvEmailLink.tsx";

import { styles } from "./CvConsent.styles.ts";
import type { CvConsentProps } from "./CvConsent.types.ts";

/** "{email}" in the text becomes the address, as a link. */
const withEmail = (text: string, email: string) =>
  text.split("{email}").map((part, index) => (
    // eslint-disable-next-line @eslint-react/no-array-index-key -- the parts of one fixed sentence, in order
    <Fragment key={index}>
      {index > 0 && <CvEmailLink email={email} />}
      {part}
    </Fragment>
  ));

/**
 * The recruitment consent at the end of the CV: one paragraph in English, the CV's language, for employers and
 * agencies in Poland or abroad. Secondary text, not Figma's muted grey, which fails 4.5:1 for text people must read.
 */
export function CvConsent({ consent, email }: CvConsentProps) {
  return (
    <footer className={styles.root}>
      <p>{withEmail(consent, email)}</p>
    </footer>
  );
}
