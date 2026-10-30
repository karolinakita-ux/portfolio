import { PROCESS_BANNER } from "#features/work/work.content.ts";
import { PROFILE } from "#shared/content/profile.ts";
import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { track } from "#shared/lib/analytics/analytics.utils.ts";
import { BannerLink } from "#shared/ui/BannerLink/BannerLink.tsx";
import { Callout } from "#shared/ui/Callout/Callout.tsx";
import { Blocks, Figma, Github } from "#shared/ui/icons/icons.tsx";

import { styles } from "./ProcessBanner.styles.ts";

/**
 * "How this portfolio was built": links to the Figma workspace, the source code and the component library, each
 * counted with place: "banner".
 */
export function ProcessBanner() {
  return (
    <Callout tone="info" label="How this portfolio was built" title={PROCESS_BANNER.title}>
      <div className={styles.body}>
        <p>{PROCESS_BANNER.body}</p>
        <div className={styles.links}>
          <BannerLink
            href={PROFILE.figmaWorkspaceUrl}
            icon={Figma}
            onClick={() => track(EVENT.figmaClick, { place: "banner" })}
          >
            {PROCESS_BANNER.linkLabel}
          </BannerLink>{" "}
          {PROFILE.repositoryUrl ? (
            <BannerLink
              href={PROFILE.repositoryUrl}
              icon={Github}
              onClick={() => track(EVENT.githubClick, { place: "banner" })}
            >
              {PROCESS_BANNER.sourceLinkLabel}
            </BannerLink>
          ) : null}{" "}
          {PROFILE.storybookUrl ? (
            <BannerLink
              href={PROFILE.storybookUrl}
              icon={Blocks}
              onClick={() => track(EVENT.storybookClick, { place: "banner" })}
            >
              {PROCESS_BANNER.componentsLinkLabel}
            </BannerLink>
          ) : null}
        </div>
      </div>
    </Callout>
  );
}
