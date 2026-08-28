import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { SIGNAL_BASE_PARAMS } from "../Signal/signalConfig";

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
    uniform float uPixelSize;
    uniform float uDotScale;
    uniform float uThreshold;
    uniform float uSoftness;
    uniform float uContrast;
    uniform float uBrightness;
    uniform float uIntensity;
    uniform vec3  uDotColor;
    uniform vec3  uBgColor;
    varying vec2  vUv;

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
      float radius = amount * uPixelSize * 0.5 * uDotScale;

      float dist = length(pixelCoord - cellCenterPx);
      float coverage = 1.0 - smoothstep(radius - uSoftness, radius + uSoftness, dist);
      // sem isso, um raio perto de zero ainda deixa um "fantasma" de meia
      // intensidade no centro da celula (a borda suave nao zera sozinha) —
      // celulas abaixo do threshold precisam ficar de fato vazias.
      coverage *= smoothstep(0.0, 0.08, amount);

      // pontos mais claros tambem "acendem" um pouco mais forte, nao so
      // maiores — reforca a leitura de luminosidade sem ficar estourado.
      float glow = mix(0.6, 1.0, amount);

      vec3 color = mix(uBgColor, uDotColor, coverage * glow * uIntensity);
      gl_FragColor = vec4(color, 1.0);

      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `
);

extend({ DotMatrixMaterial });
