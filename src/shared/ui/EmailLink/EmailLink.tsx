import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { track } from "#shared/lib/analytics/analytics.utils.ts";
import { EmailAppNote } from "#shared/ui/EmailAppNote/EmailAppNote.tsx";
import { TextLink } from "#shared/ui/TextLink/TextLink.tsx";

import type { EmailLinkProps } from "./EmailLink.types.ts";

/**
 * The email address as an inline mailto: link in a sentence (a TextLink), counted as email-click with its place,
 * like every other way to the email address. Screen readers hear that it opens the email app, as with CopyEmail,
 * the version with a copy button beside it.
 */
export function EmailLink({ email, place }: EmailLinkProps) {
  return (
    <TextLink href={"mailto:" + email} onClick={() => track(EVENT.emailClick, { action: "mailto", place })}>
      {email}
      <EmailAppNote />
    </TextLink>
  );
}
