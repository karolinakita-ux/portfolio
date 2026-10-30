import { DesignFileLink } from "#features/case-studies/components/DesignFileLink/DesignFileLink.tsx";
import { Callout } from "#shared/ui/Callout/Callout.tsx";
import { Container } from "#shared/ui/Container/Container.tsx";

import { styles } from "./DesignFilesBanner.styles.ts";
import type { DesignFilesBannerProps } from "./DesignFilesBanner.types.ts";

/**
 * Info banner near the end of a case study: invites visitors to open the case's Figma file (new tab), the same
 * link as in the case intro. Same tone, rhythm and link style as the Behind the Design banner on the Work page.
 * It follows the last section rather than belonging to it, so its title is an H2, like a section's.
 */
export function DesignFilesBanner({ file, caseView }: DesignFilesBannerProps) {
  return (
    <div className={styles.root}>
      <Container>
        <Callout tone="info" label="Design files" title={file.title} headingLevel={2}>
          <div className={styles.body}>
            <p>{file.body}</p> <DesignFileLink file={file} caseView={caseView} place="end" />
          </div>
        </Callout>
      </Container>
    </div>
  );
}
