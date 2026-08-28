import * as THREE from "three";

/**
 * Config unica do efeito "Transmissao" (matriz de pontos sobre o video).
 * Mexe SO aqui pra ajustar o visual — nao no shader, nao no Canvas.
 *
 * uPixelSize   tamanho da celula da grade, em px. Maior = pontos mais
 *              grossos e esparsos; menor = grade mais densa/fina.
 * uDotScale    tamanho maximo do ponto, fracao da celula (0..1). Em 1 os
 *              pontos no brilho maximo quase encostam nos vizinhos.
 * uThreshold   luminosidade minima (0..1) pra um ponto comecar a existir.
 *              Sobe = mais area do vídeo vira fundo vazio.
 * uSoftness    suavidade da borda do ponto, em px (0 = serrilhado/duro).
 * uContrast    contraste aplicado na luminosidade antes do threshold.
 * uBrightness  deslocamento de brilho (tipicamente -0.3..0.3) antes do
 *              threshold — empurra tudo mais claro ou mais escuro.
 * uIntensity   forca geral do efeito (0..1) — 0 apaga os pontos de vez.
 * uDotColor    cor dos pontos.
 * uBgColor     cor do fundo, onde nao ha ponto.
 */
export const SIGNAL_BASE_PARAMS = {
  uPixelSize: 6.2,
  uDotScale: 0.8,
  uThreshold: 0.08,
  uSoftness: 1.2,
  uContrast: 1,
  uBrightness: 0.1,
  uIntensity: 1,
  uDotColor: new THREE.Color("#ff2418"),
  uBgColor: new THREE.Color("#07050a"),
};

/**
 * O que muda por tier de dispositivo (ver useDeviceTier): so a densidade da
 * grade, pra aliviar GPU fraca — nada de mudar a linguagem visual entre
 * tiers, so a resolucao dela. Chaves ausentes herdam do base acima.
 */
const SIGNAL_TIER_OVERRIDES = {
  low: { uPixelSize: 10, uDotScale: 0.84, uSoftness: 1.2 },
  mid: { uPixelSize: 8, uDotScale: 0.85, uSoftness: 1.15 },
  high: {},
};

export function getSignalParams(tier = "high") {
  return { ...SIGNAL_BASE_PARAMS, ...(SIGNAL_TIER_OVERRIDES[tier] ?? {}) };
}
