import { Suspense, lazy } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { GarageScene } from "./GarageScene";
import { dprForTier } from "../../lib/device";

const GarageEffects = lazy(() => import("./GarageEffects"));

/**
 * Canvas da garagem.
 *
 * - `frameloop` desliga quando a secao sai da viewport (o ScrollTrigger da
 *   secao alterna `active`), o que zera o custo de GPU no resto da pagina.
 * - `dpr` e limitado por tier.
 * - sombras e pos-processamento so existem em tier "high".
 * - `position: absolute` + `pointer-events` controlados: o canvas nunca
 *   participa do fluxo de layout nem sequestra o scroll da pagina.
 */
export default function GarageCanvas({ vehicle, tier, active }) {
  return (
    <Canvas
      className="!absolute inset-0"
      style={{ pointerEvents: "auto" }}
      frameloop={active ? "always" : "never"}
      dpr={dprForTier(tier)}
      shadows={tier === "high" ? "percentage" : false}
      gl={{
        antialias: tier !== "low",
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      camera={{ position: [6.2, 3.4, 9.4], fov: 38, near: 0.1, far: 120 }}
    >
      <Suspense fallback={null}>
        <GarageScene vehicle={vehicle} tier={tier} />
        {tier === "high" ? <GarageEffects /> : null}
      </Suspense>
    </Canvas>
  );
}
