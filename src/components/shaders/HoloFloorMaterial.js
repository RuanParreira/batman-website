import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

/**
 * Chao holografico da garagem.
 *
 * Serve como base da camada de shaders do projeto: grid analitico com
 * anti-aliasing por derivada, scanline animada e queda radial. Todos os
 * parametros sao uniforms, entao a mesma malha aceita distorcao, dissolucao
 * ou glitch depois, sem trocar de material.
 */
export const HoloFloorMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color("#e11021"),
    uGrid: 24,
    uFade: 0.46,
    uScan: 0.35,
    uOpacity: 1,
  },
  /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* glsl */ `
    uniform float uTime;
    uniform vec3  uColor;
    uniform float uGrid;
    uniform float uFade;
    uniform float uScan;
    uniform float uOpacity;
    varying vec2  vUv;

    // grid com espessura constante em tela (independente da distancia)
    float gridLine(vec2 uv, float n) {
      vec2 coord = uv * n;
      vec2 g = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
      return 1.0 - min(min(g.x, g.y), 1.0);
    }

    void main() {
      float fine  = gridLine(vUv, uGrid);
      float major = gridLine(vUv, uGrid * 0.25);
      float grid  = fine * 0.42 + major * 0.58;

      float d    = distance(vUv, vec2(0.5));
      float fade = smoothstep(uFade, 0.02, d);

      float scan  = 0.5 + 0.5 * sin(vUv.y * 220.0 - uTime * 2.6);
      float pulse = 0.65 + 0.35 * sin(uTime * 0.7 - d * 12.0);

      vec3  color = uColor * (grid * 1.35 + 0.03) * pulse;
      float alpha = (grid * 0.9 + 0.035) * fade * (0.72 + uScan * scan) * uOpacity;

      gl_FragColor = vec4(color, alpha);

      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `
);

extend({ HoloFloorMaterial });
