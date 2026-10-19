import { useCallback, useRef, useState } from "react";

import { LightboxDialog } from "#features/image-viewer/components/LightboxDialog/LightboxDialog.tsx";
import type { LightboxState } from "#features/image-viewer/lightbox.types.ts";
import { wrapIndex } from "#features/image-viewer/lightbox.utils.ts";
import { LightboxContext } from "#shared/media/lightbox/lightbox.context.ts";
import type { OpenLightbox } from "#shared/media/lightbox/lightbox.types.ts";

import type { LightboxProviderProps } from "./LightboxProvider.types.ts";

/**
 * Full-size image viewer for case-study screenshots. Wrap the app once; open it with useLightbox()
 * from #shared/media/lightbox.context.ts. On close, focus returns to the screenshot that opened it.
 */
export function LightboxProvider({ children }: LightboxProviderProps) {
  const [state, setState] = useState<LightboxState | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const open = useCallback<OpenLightbox>((items, index, trigger) => {
    if (!items.length) return;
    triggerRef.current = trigger ?? null;
    setState({ items, index: Math.min(Math.max(index, 0), items.length - 1), direction: 0 });
  }, []);

  const handleClosed = useCallback(() => {
    setState(null);
    const trigger = triggerRef.current;
    triggerRef.current = null;
    trigger?.focus({ preventScroll: true });
  }, []);

  const step = useCallback((delta: number) => {
    setState((current) =>
      current
        ? {
            ...current,
            index: wrapIndex(current.index, delta, current.items.length),
            direction: delta > 0 ? 1 : -1,
          }
        : current,
    );
  }, []);

  return (
    <LightboxContext value={open}>
      {children}
      <LightboxDialog state={state} onClosed={handleClosed} onStep={step} />
    </LightboxContext>
  );
}
