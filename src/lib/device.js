/**
 * Deteccao de capacidade do dispositivo.
 * Usada para degradar 3D/pos-processamento e simplificar animacoes.
 */

export const BREAKPOINTS = {
  mobile: "(max-width: 767px)",
  tablet: "(min-width: 768px) and (max-width: 1023px)",
  desktop: "(min-width: 1024px)",
  touch: "(pointer: coarse)",
  reduced: "(prefers-reduced-motion: reduce)",
};

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia(BREAKPOINTS.reduced).matches;
}

/**
 * @returns {"low"|"mid"|"high"}
 */
export function detectTier() {
  if (typeof window === "undefined") return "mid";
  if (prefersReducedMotion()) return "low";

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = navigator.deviceMemory ?? 4;
  const coarse = window.matchMedia(BREAKPOINTS.touch).matches;
  const narrow = window.innerWidth < 768;

  if (cores <= 4 || memory <= 4 || (coarse && narrow)) return "low";
  if (cores <= 8 || memory <= 8 || coarse) return "mid";
  return "high";
}

/** Device pixel ratio seguro para o Canvas do R3F. */
export function dprForTier(tier) {
  if (tier === "low") return [1, 1.25];
  if (tier === "mid") return [1, 1.6];
  return [1, 2];
}
