import { BannerLink } from "#features/work/components/BannerLink/BannerLink.tsx";
import { PROCESS_BANNER } from "#features/work/work.content.ts";
import { PROFILE } from "#shared/content/profile.ts";
import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { Callout } from "#shared/ui/Callout/Callout.tsx";
import { Figma, Github } from "#shared/ui/icons/icons.tsx";

import { styles } from "./ProcessBanner.styles.ts";

/** "How this portfolio was built": links to the Figma workspace and the source code. */
export function ProcessBanner() {
  return (
    <Callout tone="info" label="How this portfolio was built" title={PROCESS_BANNER.title}>
      <div className={styles.body}>
        <p>{PROCESS_BANNER.body}</p>
        <div className={styles.links}>
          <BannerLink href={PROFILE.figmaWorkspaceUrl} icon={Figma} event={EVENT.figmaClick}>
            {PROCESS_BANNER.linkLabel}
          </BannerLink>
          {PROFILE.repositoryUrl ? (
            <BannerLink href={PROFILE.repositoryUrl} icon={Github} event={EVENT.githubClick}>
              {PROCESS_BANNER.sourceLinkLabel}
            </BannerLink>
          ) : null}
        </div>
      </div>
    </Callout>
  );
}
