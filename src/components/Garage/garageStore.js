/**
 * Ponte entre o ScrollTrigger (thread do GSAP) e o loop de render do R3F.
 *
 * Deliberadamente um objeto mutavel e nao estado do React: o scrub escreve
 * aqui a 60 fps e o useFrame le no mesmo tick. Passar isso por setState
 * causaria um re-render por frame.
 */
export const garageScroll = {
  /** 0 -> 1 ao longo do pin da secao */
  progress: 0,
  /** secao visivel? usado para pausar o frameloop */
  active: false,
  /** 0 = camera dirigida pelo scroll, 1 = usuario inspecionando */
  inspect: 0,
};

export function resetGarageScroll() {
  garageScroll.progress = 0;
  garageScroll.active = false;
  garageScroll.inspect = 0;
}
