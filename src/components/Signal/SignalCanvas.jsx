import { Canvas } from "@react-three/fiber";
import { SignalScene } from "./SignalScene";
import { dprForTier } from "../../lib/device";
import { getSignalParams } from "./signalConfig";

/**
 * Canvas ortografico full-bleed. Sem camera em perspectiva, sem cena 3D —
 * so um quad tela-cheia recebendo o shader (ver SignalScene). `frameloop`
 * desliga por completo quando a seccao esta fora da viewport.
 *
 * Os numeros do efeito (densidade, cor, contraste...) ficam todos em
 * `signalConfig.js` — edita la, nao aqui.
 */
export default function SignalCanvas({ video, active, tier = "high" }) {
  return (
    <Canvas
      className="!absolute inset-0"
      orthographic
      frameloop={active ? "always" : "never"}
      dpr={dprForTier(tier)}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 1], zoom: 1, near: 0.1, far: 10 }}
    >
      <SignalScene video={video} active={active} params={getSignalParams(tier)} />
    </Canvas>
  );
}
