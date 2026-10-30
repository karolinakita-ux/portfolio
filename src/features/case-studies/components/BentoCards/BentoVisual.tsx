import { Badge } from "#shared/ui/Badge/Badge.tsx";
import { Check } from "#shared/ui/icons/icons.tsx";

import { styles } from "./BentoCards.styles.ts";
import type { BentoVisualProps } from "./BentoCards.types.ts";

/** The small visual at the foot of a bento card: tags, checks, label samples, swatches, code or two phases. */
export function BentoVisual({ visual }: BentoVisualProps) {
  switch (visual.kind) {
    case "tags":
      return (
        <ul className={styles.chips}>
          {visual.items.map((item) => (
            <Badge key={item} as="li">
              {item}
            </Badge>
          ))}
        </ul>
      );
    case "checks":
      return (
        <ul className={styles.chips}>
          {visual.items.map((item) => (
            <li key={item} className={styles.check}>
              <Check aria-hidden="true" size={14} className={styles.checkIcon} /> {item}
            </li>
          ))}
        </ul>
      );
    case "labels":
      return (
        <ul className={styles.labels}>
          {visual.items.map((item) => (
            <li
              key={item.text}
              className={styles.label}
              style={{ backgroundColor: item.background, color: item.color }}
            >
              <span aria-hidden="true" className={styles.labelSample}>
                Aa
              </span>{" "}
              <span className={styles.labelValue}>{item.text}</span>
            </li>
          ))}
        </ul>
      );
    case "swatches":
      return (
        <ul className={styles.swatches}>
          {visual.items.map((item) => (
            <li key={item.label} className={styles.swatch}>
              <span aria-hidden="true" className={styles.swatchColor} style={{ backgroundColor: item.color }} />{" "}
              <span className={styles.swatchLabel}>{item.label}</span>{" "}
              <span className={styles.swatchRule}>{item.rule}</span>
            </li>
          ))}
        </ul>
      );
    case "code":
      // The name sits on a figure: ARIA does not allow aria-label on <pre> (a generic element).
      return (
        <figure aria-label={visual.label}>
          <pre className={styles.code}>
            <code>
              {visual.lines.map(([property, value]) => (
                <span key={property}>
                  <span className={styles.codeProperty}>{property}:</span> {value}
                  {"\n"}
                </span>
              ))}
            </code>
          </pre>
        </figure>
      );
    case "phases":
      return (
        <div className={styles.phases}>
          <div className={styles.phase}>
            <span className={styles.phaseLabel}>
              <span aria-hidden="true" className={styles.dotShipped} /> {visual.from.label}
            </span>{" "}
            <span className={styles.phaseNote}>{visual.from.note}</span>
          </div>{" "}
          <span aria-hidden="true" className={styles.phaseLine} />{" "}
          <div className={styles.phaseEnd}>
            <span className={styles.phaseLabel}>
              <span aria-hidden="true" className={styles.dotRoadmap} /> {visual.to.label}
            </span>{" "}
            <span className={styles.phaseNote}>{visual.to.note}</span>
          </div>
        </div>
      );
  }
}
