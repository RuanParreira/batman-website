import { useLayoutEffect, useRef } from "react";
import { ScrollSmoother, ScrollTrigger } from "../lib/gsap";
import { prefersReducedMotion } from "../lib/device";

/**
 * Cria o ScrollSmoother global uma unica vez.
 * O ScrollSmoother nao e revertido por gsap.context(), entao o kill e
 * explicito aqui — isso tambem cobre o duplo mount do StrictMode.
 */
export function useSmoothScroller({ enabled = true } = {}) {
  const smootherRef = useRef(null);

  useLayoutEffect(() => {
    if (!enabled) return undefined;

    const reduced = prefersReducedMotion();

    window.scrollTo(0, 0);

    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: reduced ? 0 : 1.35,
      smoothTouch: reduced ? 0 : 0.1,
      effects: true,
      normalizeScroll: true,
      ignoreMobileResize: true,
    });

    smootherRef.current = smoother;
    ScrollTrigger.refresh();

    return () => {
      smoother.kill();
      smootherRef.current = null;
    };
  }, [enabled]);

  return smootherRef;
}
