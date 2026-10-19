import { PRIVACY } from "#features/privacy/privacy.content.tsx";
import { InfoTable } from "#shared/ui/InfoTable/InfoTable.tsx";
import { InfoTableCell } from "#shared/ui/InfoTableCell/InfoTableCell.tsx";
import { TextLink } from "#shared/ui/TextLink/TextLink.tsx";

import { styles } from "./RecipientsTable.styles.ts";

/** Who processes visitors' data for the site: role, place, transfer safeguard, and their policy. */
export function RecipientsTable() {
  return (
    <InfoTable columns={1}>
      {PRIVACY.recipients.map((recipient) => (
        <InfoTableCell key={recipient.name} label={recipient.name}>
          <span className={styles.text}>
            {recipient.text}
            <TextLink href={recipient.policy.href} external>
              {recipient.policy.label}
            </TextLink>
          </span>
        </InfoTableCell>
      ))}
    </InfoTable>
  );
}
