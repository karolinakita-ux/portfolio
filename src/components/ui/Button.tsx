import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import type { IconComponent } from "../icons.tsx";
import { cn, FOCUS_RING } from "../../lib/ui.ts";

export type ButtonVariant = "primary" | "secondary" | "subtle" | "link";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: cn(
    "bg-bg-interactive-primary-default text-text-interactive-primary font-semibold shadow-sm",
    "hover:bg-bg-interactive-primary-hover active:bg-bg-interactive-primary-active",
    "disabled:bg-bg-interactive-disabled disabled:text-text-interactive-disabled disabled:shadow-none"
  ),
  secondary: cn(
    "border border-border-interactive-default bg-bg-interactive-secondary-default text-text-interactive-secondary",
    "hover:border-border-interactive-hover hover:bg-bg-interactive-secondary-hover active:bg-bg-interactive-secondary-active",
    "disabled:border-border-interactive-disabled disabled:text-text-interactive-disabled"
  ),
  subtle: cn(
    "bg-bg-interactive-subtle-default text-text-interactive-secondary",
    "hover:bg-bg-interactive-subtle-hover active:bg-bg-interactive-subtle-active",
    "disabled:bg-bg-interactive-disabled disabled:text-text-interactive-disabled"
  ),
  link: "text-text-primary decoration-1 underline-offset-4 hover:underline disabled:text-text-interactive-disabled",
};

interface ButtonOwnProps {
  variant?: ButtonVariant;
  iconLeft?: IconComponent;
  iconRight?: IconComponent;
  className?: string;
  children: ReactNode;
}

type AsButton = ButtonOwnProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps> & { as?: "button" };
type AsAnchor = ButtonOwnProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonOwnProps> & { as: "a" };

export type ButtonProps = AsButton | AsAnchor;

/** Button - variant × state, optional leading/trailing icon, text label. Renders <button> or, with as="a", <a>. */
export function Button(props: ButtonProps) {
  const IconLeft = props.iconLeft;
  const IconRight = props.iconRight;

  const classes = cn(
    "group/button inline-flex cursor-pointer items-center justify-center gap-xs rounded-md px-md py-xs text-label-lg",
    "transition-[background-color,border-color,color,box-shadow] duration-150 ease-out disabled:cursor-not-allowed",
    FOCUS_RING,
    BUTTON_VARIANTS[props.variant ?? "primary"],
    props.className
  );

  const content = (
    <>
      {IconLeft && <IconLeft aria-hidden="true" size={16} className="shrink-0" />}
      <span>{props.children}</span>
      {IconRight && (
        <IconRight
          aria-hidden="true"
          size={16}
          className="shrink-0 transition-transform duration-150 ease-out motion-safe:group-hover/button:translate-x-2xs"
        />
      )}
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

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Accessible name and tooltip. */
  label: string;
  icon: IconComponent;
}

/** Square icon-only button on a raised surface (image viewer controls). */
export function IconButton({ label, icon: Icon, className, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-xl shrink-0 cursor-pointer items-center justify-center rounded-md border border-border-subtle",
        "bg-bg-surface-raised text-text-primary shadow-sm transition-colors duration-150 ease-out",
        "hover:border-border-interactive-hover hover:bg-bg-surface-default",
        // aria-disabled (not disabled) keeps focus on the button when it hits a limit, e.g. max zoom.
        "aria-disabled:cursor-not-allowed aria-disabled:border-border-interactive-disabled aria-disabled:bg-bg-surface-raised",
        "aria-disabled:text-text-interactive-disabled aria-disabled:shadow-none",
        FOCUS_RING,
        className
      )}
      {...props}
    >
      <Icon aria-hidden="true" size={20} />
    </button>
  );
}
