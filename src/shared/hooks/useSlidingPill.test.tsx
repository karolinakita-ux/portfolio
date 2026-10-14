import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";

import { mockAnimate, MOTION_TOKENS, setMotionTokens, type FakeAnimation } from "#test/animations.ts";
import { mockMatchMedia } from "#test/matchMedia.ts";

import { useSlidingPill } from "./useSlidingPill.ts";

const EASING = MOTION_TOKENS["--motion-easing-standard"];

/** Three items with a pill each, like the header nav: b sits right of a, c on a second, taller row. */
function Pills({ active }: { active: string | null }) {
  const ref = useSlidingPill<HTMLUListElement>(active);
  return (
    <ul ref={ref}>
      {["a", "b", "c"].map((key) => (
        <li key={key}>
          <span data-pill={key} aria-hidden="true" className={key === active ? "opacity-100" : "opacity-0"} />
          {key.toUpperCase()}
        </li>
      ))}
    </ul>
  );
}

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

const OWN_BOXES: Readonly<Record<string, Box>> = {
  a: { left: 10, top: 0, width: 60, height: 36 },
  b: { left: 90, top: 0, width: 80, height: 36 },
  c: { left: 10, top: 50, width: 100, height: 40 },
};
/** Where each pill is on screen; a test moves one to stand for a running animation. */
let boxes: Record<string, Box> = {};
/** The getBoundingClientRect spy (reads boxes). */
let measure: MockInstance<(this: Element) => DOMRect>;

const rect = ({ left, top, width, height }: Box) =>
  ({ left, top, width, height, x: left, y: top, right: left + width, bottom: top + height }) as DOMRect;

const pill = (key: string) => {
  const element = screen.getByText(key.toUpperCase()).querySelector(`[data-pill="${key}"]`);
  if (!element) throw new Error(`no pill ${key}`);
  return element;
};

beforeEach(() => {
  boxes = { ...OWN_BOXES };
  measure = vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    const key = this.getAttribute("data-pill") ?? "";
    return rect(boxes[key] ?? { left: 0, top: 0, width: 0, height: 0 });
  });
  setMotionTokens();
});

describe("useSlidingPill", () => {
  it("does not animate on the first render, with or without an active item", () => {
    const { animations } = mockAnimate();
    render(<Pills active="a" />);
    render(<Pills active={null} />);
    expect(animations).toEqual([]);
  });

  it("does not animate when a render keeps the same active item", () => {
    const { animations } = mockAnimate();
    const { rerender } = render(<Pills active="a" />);
    rerender(<Pills active="a" />);
    expect(animations).toEqual([]);
  });

  it("slides the new pill from the old one's box: translate and width, with the motion tokens", () => {
    const { animations } = mockAnimate();
    const { rerender } = render(<Pills active="a" />);
    rerender(<Pills active="b" />);

    expect(animations).toHaveLength(1);
    const [move] = animations;
    expect(move?.target).toBe(pill("b"));
    expect(move?.keyframes).toEqual([
      { transform: "translate(-80px, 0px)", width: "60px" },
      { transform: "translate(0px, 0px)", width: "80px" },
    ]);
    expect(move?.options).toEqual({ duration: 240, easing: EASING });
    expect(pill("b")).toHaveClass("opacity-100");
    expect(pill("a")).toHaveClass("opacity-0");
  });

  it("animates the height too when the boxes differ in height (a pill on another row)", () => {
    const { animations } = mockAnimate();
    const { rerender } = render(<Pills active="a" />);
    rerender(<Pills active="c" />);
    expect(animations[0]?.keyframes).toEqual([
      { transform: "translate(0px, -50px)", width: "60px", height: "36px" },
      { transform: "translate(0px, 0px)", width: "100px", height: "40px" },
    ]);
  });

  it("on an interruption, cancels the running move and starts from where the pill is on screen", () => {
    // Cancelling drops the animation's transform: the pill is back in its own box.
    const { animations } = mockAnimate((animation: FakeAnimation) => {
      const key = animation.target.getAttribute("data-pill") ?? "";
      const own = OWN_BOXES[key];
      if (own) boxes[key] = own;
    });
    const { rerender } = render(<Pills active="a" />);
    rerender(<Pills active="b" />);
    boxes.b = { left: 50, top: 0, width: 70, height: 36 }; // halfway from a to b

    rerender(<Pills active="c" />);
    expect(animations).toHaveLength(2);
    const [first, second] = animations;
    expect(first?.cancel).toHaveBeenCalledOnce();
    expect(second?.target).toBe(pill("c"));
    expect(second?.keyframes).toEqual([
      { transform: "translate(40px, -50px)", width: "70px", height: "36px" },
      { transform: "translate(0px, 0px)", width: "100px", height: "40px" },
    ]);
  });

  it("fades the pill in when there was no active item before", () => {
    const { animations } = mockAnimate();
    const { rerender } = render(<Pills active={null} />);
    rerender(<Pills active="b" />);
    expect(animations).toHaveLength(1);
    expect(animations[0]?.target).toBe(pill("b"));
    expect(animations[0]?.keyframes).toEqual([{ opacity: 0 }, { opacity: 1 }]);
    expect(animations[0]?.options).toEqual({ duration: 240, easing: EASING });
  });

  it("fades the old pill out when no item is active any more", () => {
    const { animations } = mockAnimate();
    const { rerender } = render(<Pills active="b" />);
    rerender(<Pills active={null} />);
    expect(animations).toHaveLength(1);
    expect(animations[0]?.target).toBe(pill("b"));
    expect(animations[0]?.keyframes).toEqual([{ opacity: 1 }, { opacity: 0 }]);
    expect(pill("b")).toHaveClass("opacity-0");
  });

  it("fades instead of sliding when a key has no pill, and does nothing when neither has one", () => {
    const { animations } = mockAnimate();
    const { rerender } = render(<Pills active="x" />);
    rerender(<Pills active="a" />); // nothing to slide from
    rerender(<Pills active="y" />); // nothing to slide to
    rerender(<Pills active="z" />); // neither
    expect(animations.map((animation) => animation.keyframes)).toEqual([
      [{ opacity: 0 }, { opacity: 1 }],
      [{ opacity: 1 }, { opacity: 0 }],
    ]);
    expect(animations[0]?.cancel).toHaveBeenCalledOnce();
    expect(animations[1]?.cancel).toHaveBeenCalledOnce();
  });

  it("only switches the pill with reduced motion, without measuring (no forced layout)", () => {
    const { animations } = mockAnimate();
    mockMatchMedia(true);
    const { rerender } = render(<Pills active="a" />);
    rerender(<Pills active="b" />);
    expect(animations).toEqual([]);
    expect(measure).not.toHaveBeenCalled();
    expect(pill("b")).toHaveClass("opacity-100");
  });

  it("stops a running move when motion is turned off mid-way", () => {
    const system = mockMatchMedia(false);
    const { animations } = mockAnimate();
    const { rerender } = render(<Pills active="a" />);
    rerender(<Pills active="b" />);
    act(() => system.change(true)); // reduced motion switched on
    rerender(<Pills active="c" />);
    expect(animations).toHaveLength(1);
    expect(animations[0]?.cancel).toHaveBeenCalledOnce();
  });

  it("only switches the pill without the Web Animations API", () => {
    const { rerender } = render(<Pills active="a" />);
    expect(() => rerender(<Pills active="b" />)).not.toThrow();
    expect(pill("b")).toHaveClass("opacity-100");
    expect(pill("a")).toHaveClass("opacity-0");
  });

  it("only switches the pill when a motion token is missing or zero", () => {
    const { animations } = mockAnimate();
    document.documentElement.style.removeProperty("--motion-easing-standard");
    const { rerender } = render(<Pills active="a" />);
    rerender(<Pills active="b" />);
    setMotionTokens({ "--motion-duration-medium": "0ms" });
    rerender(<Pills active="c" />);
    expect(animations).toEqual([]);
  });

  it("does nothing while the ref is not attached to an element", () => {
    function Detached({ active }: { active: string }) {
      useSlidingPill<HTMLUListElement>(active);
      return <span data-pill={active} aria-hidden="true" />;
    }
    const { animations } = mockAnimate();
    const { rerender } = render(<Detached active="a" />);
    expect(() => rerender(<Detached active="b" />)).not.toThrow();
    expect(animations).toEqual([]);
  });

  it("only switches the pill when the browser rejects the easing token", () => {
    const { animate } = mockAnimate();
    animate.mockImplementation(() => {
      throw new TypeError("Invalid easing");
    });
    const { rerender } = render(<Pills active="a" />);
    expect(() => rerender(<Pills active="b" />)).not.toThrow();
    expect(animate).toHaveBeenCalledOnce();
    expect(pill("b")).toHaveClass("opacity-100");
  });
});
