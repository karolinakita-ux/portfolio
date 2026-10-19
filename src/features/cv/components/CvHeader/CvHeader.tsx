import type { ReactNode } from "react";

import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { track } from "#shared/lib/analytics/analytics.utils.ts";
import { DOC_LINK } from "#shared/lib/ui/ui.styles.ts";
import { telHref } from "#shared/lib/ui/ui.utils.ts";
import { Joined } from "#shared/ui/Joined/Joined.tsx";

import { styles } from "./CvHeader.styles.ts";
import type { CvHeaderProps } from "./CvHeader.types.ts";

/** Name, title and contact line; the links show their URL as the label (plain text in a PDF). */
export function CvHeader({ header }: CvHeaderProps) {
  const contacts: ReactNode[] = [
    header.location,
    header.phone && (
      <a key="phone" href={telHref(header.phone)} className={DOC_LINK}>
        {header.phone}
      </a>
    ),
    <a
      key="email"
      href={"mailto:" + header.email}
      onClick={() => track(EVENT.emailClick, { action: "mailto", place: "cv" })}
      className={DOC_LINK}
    >
      {header.email}
    </a>,
    <a key="portfolio" href={header.portfolio.href} className={DOC_LINK}>
      {header.portfolio.label}
    </a>,
    <a
      key="linkedin"
      href={header.linkedin.href}
      onClick={() => track(EVENT.linkedinClick, { target: "profile", place: "cv" })}
      className={DOC_LINK}
    >
      {header.linkedin.label}
    </a>,
  ];

  return (
    <header className={styles.root}>
      <h1 id="cv-name" className={styles.name}>
        {header.name}
      </h1>
      <p className={styles.title}>{header.title}</p>
      <address className={styles.contacts}>
        <Joined parts={contacts} />
      </address>
    </header>
  );
}
