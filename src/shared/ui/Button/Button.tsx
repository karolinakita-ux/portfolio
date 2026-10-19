import { styles } from "./Button.styles.ts";
import type { ButtonProps } from "./Button.types.ts";

/** Button - variant × state, optional leading/trailing icon, text label. Renders <button> or, with as="a", <a>. */
export function Button(props: ButtonProps) {
  const IconLeft = props.iconLeft;
  const IconRight = props.iconRight;
  const classes = styles.root(props.variant ?? "primary", props.className);

  const content = (
    <>
      {IconLeft && <IconLeft aria-hidden="true" size={16} className={styles.iconLeft} />}
      <span>{props.children}</span>
      {IconRight && <IconRight aria-hidden="true" size={16} className={styles.iconRight} />}
    </>
  );

  // Own props are styling inputs; everything else goes to the DOM element.
  if (props.as === "a") {
    const { as, variant, iconLeft, iconRight, className, children, ...anchorProps } = props;
    return (
      <a className={classes} {...anchorProps}>
        {content}
      </a>
    );
  } else {
    const { as, variant, iconLeft, iconRight, className, children, type = "button", ...buttonProps } = props;
    return (
      <button type={type} className={classes} {...buttonProps}>
        {content}
      </button>
    );
  }
}
