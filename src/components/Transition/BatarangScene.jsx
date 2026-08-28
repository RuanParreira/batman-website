import { Suspense, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { BatarangModel } from "./BatarangModel";
import { batarangScroll, EDGE_OVERSHOOT } from "./batarangTransitionStore";

const SPINS = 3.25;
const APEX_PUSH = 1.1;

// Largura crua do mesh (bounding box do .glb, eixo X): ~4.59 unidades.
// Escala e recalculada a cada frame a partir do viewport para que o
// batarang sempre ocupe a mesma FRACAO da tela, em vez de um tamanho fixo
// em unidades de mundo (que ficaria minusculo ou gigante conforme o fov e a
// distancia da camera).
const NATIVE_WIDTH = 4.59;
const TARGET_WIDTH_FRACTION = 0.55;

/**
 * Rotacao/posicao/escala sao funcao pura de `batarangScroll.progress` e do
 * viewport — nada e acumulado por delta. Assim o batarang sempre reflete a
 * posicao exata do scroll, inclusive ao rolar pra tras (scrub bidirecional).
 */
function BatarangRig() {
  const group = useRef(null);
  const { viewport } = useThree();

  useFrame(() => {
    if (!group.current) return;
    const t = batarangScroll.progress;
    const halfWidth = (viewport.width / 2) * (1 + EDGE_OVERSHOOT);
    const scale = (viewport.width * TARGET_WIDTH_FRACTION) / NATIVE_WIDTH;

    group.current.position.x = -halfWidth + t * halfWidth * 2;
    group.current.position.z = Math.sin(t * Math.PI) * APEX_PUSH;
    group.current.rotation.z = -t * Math.PI * 2 * SPINS;
    group.current.scale.setScalar(scale);
  });

  return (
    <group ref={group}>
      <BatarangModel />
    </group>
  );
}

export function BatarangScene() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={3} color="#ffffff" />
      <directionalLight position={[-4, -2, -3]} intensity={0.4} color="#e11021" />

      <Suspense fallback={null}>
        <BatarangRig />
      </Suspense>
    </>
  );
}
