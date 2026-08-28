import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { BatarangScene } from "./BatarangScene";
import { dprForTier } from "../../lib/device";

/**
 * Canvas da transicao. Mesmo padrao do GarageCanvas: `frameloop` desliga
 * fora da faixa ativa, sem sombra/pos-processamento — e um objeto pequeno
 * cruzando a tela, nao justifica o custo.
 */
export default function BatarangCanvas({ tier, active }) {
  return (
    <Canvas
      className="!absolute inset-0"
      style={{ pointerEvents: "none" }}
      frameloop={active ? "always" : "never"}
      dpr={dprForTier(tier)}
      gl={{
        antialias: tier !== "low",
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      camera={{ position: [0, 0, 8], fov: 45, near: 0.1, far: 40 }}
    >
      <Suspense fallback={null}>
        <BatarangScene />
      </Suspense>
    </Canvas>
  );
}
