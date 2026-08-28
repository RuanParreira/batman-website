import { useCallback } from "react";
import { gsap, ScrollSmoother, EASE } from "../lib/gsap";

/**
 * Navegacao por ancora.
 * Usa o ScrollSmoother quando ele existe (respeita o lerp da pagina) e cai
 * no ScrollToPlugin quando o smoother esta desligado (reduced motion).
 */
export function useScrollTo() {
  return useCallback((selector, { offset = 0 } = {}) => {
    const target = document.querySelector(selector);
    if (!target) return;

    const smoother = ScrollSmoother.get();

    if (smoother) {
      smoother.scrollTo(target, true, `top ${offset}px`);
      return;
    }

    gsap.to(window, {
      duration: 1.4,
      ease: EASE.cine,
      scrollTo: { y: target, offsetY: -offset, autoKill: true },
    });
  }, []);
}
