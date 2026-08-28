import { useEffect, useState } from "react";
import { detectTier } from "../lib/device";

/**
 * Tier do dispositivo, reavaliado em resize (debounced).
 * "low" | "mid" | "high"
 */
export function useDeviceTier() {
  const [tier, setTier] = useState(() => detectTier());

  useEffect(() => {
    let raf = 0;
    let lastWidth = window.innerWidth;

    const onResize = () => {
      // No mobile, a barra de endereco recolher/aparecer ao rolar dispara
      // "resize" mudando so a altura. Recalcular o tier nesse caso reverte e
      // reconstroi as animacoes de scroll no meio da rolagem — ignora
      // resize que nao mudou a largura.
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setTier(detectTier()));
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return tier;
}
