/**
 * Quanto o percurso do batarang extrapola a largura da tela pra nascer e
 * morrer fora da borda (0.85 = 85% a mais de cada lado). Compartilhado com
 * `batarangTransitionAnimation.js`, que usa o mesmo valor pra calcular onde
 * o wipe da imagem deve estar — sem isso os dois ficam fora de sincronia
 * (o wipe anda numa velocidade, o batarang em outra).
 */
export const EDGE_OVERSHOOT = 0.85;

/**
 * Ponte entre o ScrollTrigger e o loop de render do R3F, mesmo padrao de
 * `garageStore.js`: objeto mutavel lido a 60fps pelo useFrame, sem passar
 * por setState do React.
 */
export const batarangScroll = {
  /** 0 -> 1 ao longo do pin da transicao */
  progress: 0,
  /** transicao visivel? usado para pausar o frameloop do canvas */
  active: false,
};

export function resetBatarangScroll() {
  batarangScroll.progress = 0;
  batarangScroll.active = false;
}
