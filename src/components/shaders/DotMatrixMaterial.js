import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { SIGNAL_BASE_PARAMS, SIGNAL_TRAIL_POINTS } from "../Signal/signalConfig";

/**
 * Reconstroi uma textura de video como uma matriz de pontos vermelhos —
 * halftone/LED matrix, nao particulas. Todo o trabalho e por pixel de tela,
 * no fragment shader: uma unica malha em tela cheia, um unico draw call.
 *
 * Cada celula da grade (uPixelSize px) amostra o video UMA vez no seu
 * centro; a luminosidade dessa amostra decide o raio (e a intensidade) do
 * ponto desenhado ali. Sem amostragem por-pixel do video (isso daria uma
 * imagem borrada, nao uma grade nitida de pontos).
 */
export const DotMatrixMaterial = shaderMaterial(
  {
    uVideo: null,
    uVideoResolution: new THREE.Vector2(16, 9),
    uResolution: new THREE.Vector2(1, 1),
    // rastro do mouse: ultimas posicoes onde o cursor passou (px de tela),
    // preenchido de fora pra dentro — slots vazios ficam bem longe da tela
    // (zero influencia) ate o SignalScene popular de verdade.
    uTrailPos: Array.from({ length: SIGNAL_TRAIL_POINTS }, () => new THREE.Vector2(-9999, -9999)),
    // idade (segundos) de cada ponto acima; alto = expirado/inativo.
    uTrailAge: new Array(SIGNAL_TRAIL_POINTS).fill(999),
    // Os numeros de verdade (densidade, cor, contraste...) vem de
    // signalConfig.js e chegam via props (sempre sobrescrevem isso aqui) —
    // estes sao so o fallback caso o material seja usado sem eles.
    ...SIGNAL_BASE_PARAMS,
  },
  /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* glsl */ `
    uniform sampler2D uVideo;
    uniform vec2  uVideoResolution;
    uniform vec2  uResolution;
    uniform vec2  uTrailPos[${SIGNAL_TRAIL_POINTS}];
    uniform float uTrailAge[${SIGNAL_TRAIL_POINTS}];
    uniform float uTrailLifetime;
    uniform float uTrailRadius;
    uniform float uTrailSize;
    uniform float uTrailGlow;
    uniform float uPixelSize;
    uniform float uDotScale;
    uniform float uThreshold;
    uniform float uSoftness;
    uniform float uContrast;
    uniform float uBrightness;
    uniform float uIntensity;
    uniform float uGlowPower;
    uniform vec3  uDotColor;
    uniform vec3  uBgColor;
    varying vec2  vUv;

    // interleaved gradient noise — dither barato (so ALU, sem textura) pra
    // quebrar banding nas transicoes suaves de coverage/glow.
    float dither(vec2 pixelCoord) {
      return fract(52.9829189 * fract(dot(pixelCoord, vec2(0.06711056, 0.00583715))));
    }

    // remapeia uv como "background-size: cover" — o video nunca deforma,
    // sobra e cortada nas bordas conforme a proporcao da tela.
    vec2 coverUv(vec2 uv, vec2 res, vec2 texRes) {
      float resAspect = res.x / res.y;
      float texAspect = texRes.x / texRes.y;
      vec2 ratio = resAspect > texAspect
        ? vec2(1.0, resAspect / texAspect)
        : vec2(texAspect / resAspect, 1.0);
      return (uv - 0.5) / ratio + 0.5;
    }

    // nome proprio (nao "luminance"): o Three injeta uma funcao global com
    // esse nome em todo ShaderMaterial (usada pelo tonemapping), com
    // assinatura diferente da nossa — colidir os dois nomes quebra a
    // compilacao ("function already has a body").
    float dotLuminance(vec3 c) {
      return dot(c, vec3(0.2126, 0.7152, 0.0722));
    }

    void main() {
      // posicao do fragmento e centro da sua celula, em pixels reais de
      // tela — trabalhar em px (nao uv 0..1) e o que mantem os pontos
      // circulares (nao elipticos) em qualquer proporcao de tela.
      vec2 pixelCoord   = vUv * uResolution;
      vec2 cell         = floor(pixelCoord / uPixelSize);
      vec2 cellCenterPx = (cell + 0.5) * uPixelSize;

      vec2 cellUv = coverUv(cellCenterPx / uResolution, uResolution, uVideoResolution);
      vec3 src = texture2D(uVideo, clamp(cellUv, 0.0, 1.0)).rgb;

      float lum = dotLuminance(src);
      lum = clamp((lum - 0.5) * uContrast + 0.5 + uBrightness, 0.0, 1.0);

      // abaixo do threshold a celula fica vazia (fundo escuro) — e o que da
      // o ar "digital", nao um gradiente continuo de pontos minusculos.
      float amount = smoothstep(uThreshold, 1.0, lum);

      // desconta uma margem de "amount" antes de virar raio — assim uma
      // celula fraca some de fato (raio negativo) em vez de deixar o
      // fantasma de meia intensidade que a borda suave nao zera sozinha.
      // Faz o mesmo trabalho do smoothstep(0, 0.08, amount) de antes, mas
      // numa unica passada (menos ALU, sem multiplicar coverage duas vezes).
      float baseRadius = (amount - 0.02) * uPixelSize * 0.5 * uDotScale;

      // rastro: campo suave (gaussiana somada, sem deslocar nada — nada de
      // "puxar" a grade, foi isso que virou moire/vortice na tentativa
      // anterior). Cada ponto recente do mouse contribui um brilho que cai
      // suave com a distancia e com a idade; a soma vira uma fita continua
      // que afunila nas pontas, nao uma bolha estatica. Ponto some sozinho
      // apos uTrailLifetime segundos (uTrailAge alto = peso zero) — parado,
      // a fita inteira esvai, nao fica nada preso na tela.
      float trailEnergy = 0.0;
      for (int i = 0; i < ${SIGNAL_TRAIL_POINTS}; i++) {
        float lifeFade = clamp(1.0 - uTrailAge[i] / uTrailLifetime, 0.0, 1.0);
        lifeFade *= lifeFade;
        float d = length(cellCenterPx - uTrailPos[i]);
        float k = d / uTrailRadius;
        trailEnergy += exp(-k * k) * lifeFade;
      }
      // soft-clamp exponencial em vez de clamp() duro — pontos do rastro
      // que se sobrepoem se somam sem criar um platô abrupto no meio da fita.
      trailEnergy = 1.0 - exp(-trailEnergy);

      // o rastro pode acender uma celula que o video sozinho deixaria
      // apagada (max com baseRadius) — e o que da a fita visivel sobre
      // fundo escuro, igual a referencia. Nunca encolhe um ponto que ja
      // existia.
      float trailRadius = trailEnergy * uPixelSize * 0.5 * uDotScale * uTrailSize;
      float radius = max(baseRadius, trailRadius);

      float dist = length(pixelCoord - cellCenterPx);
      float coverage = 1.0 - smoothstep(radius - uSoftness, radius + uSoftness, dist);

      // curva nao-linear: pontos no topo da luminosidade acendem bem mais
      // forte que os medianos (like um LED sobre-excitado), em vez do
      // degrade linear de antes — mais punch sem estourar a cor base.
      float glow = mix(0.55, 1.0, pow(amount, uGlowPower)) + trailEnergy * uTrailGlow;

      // nucleo do rastro pende pro branco — leitura de "ponto quente"
      // recem-aceso, como na referencia, sem trocar a cor base do resto.
      vec3 dotColor = mix(uDotColor, vec3(1.0), trailEnergy * 0.45);

      float d = (dither(pixelCoord) - 0.5) / 255.0;
      vec3 color = mix(uBgColor, dotColor, clamp(coverage * glow * uIntensity + d, 0.0, 1.0));
      gl_FragColor = vec4(color, 1.0);

      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `
);

extend({ DotMatrixMaterial });
