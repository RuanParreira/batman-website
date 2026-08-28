import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

/**
 * Pos-processamento. Carregado sob lazy() e montado apenas em tier "high" —
 * o bundle do postprocessing nao chega a dispositivos fracos.
 *
 * Espaco reservado para as proximas etapas: ChromaticAberration na troca de
 * veiculo, Glitch no pulso de energia, DepthOfField na aproximacao final.
 */
export default function GarageEffects() {
  return (
    <EffectComposer enableNormalPass={false} multisampling={0}>
      <Bloom
        intensity={0.75}
        luminanceThreshold={0.62}
        luminanceSmoothing={0.28}
        mipmapBlur
      />
      <Noise blendFunction={BlendFunction.OVERLAY} opacity={0.035} />
      <Vignette eskil={false} offset={0.24} darkness={0.82} />
    </EffectComposer>
  );
}
