import { Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import { GarageEnvironment } from "./GarageEnvironment";
import { VehicleModel } from "./VehicleModel";
import { garageScroll } from "./garageStore";

// Teto de delta usado em todo incremento/lerp desta cena. O frameloop do
// Canvas desliga fora da viewport (`frameloop="never"`); no frame em que ele
// volta a ligar, `delta` inclui o tempo inteiro pausado (as vezes segundos).
// Sem este teto, esse primeiro frame produz um incremento de rotacao enorme —
// a "teleportada" ao cruzar o inicio/fim da secao.
const MAX_DELTA = 1 / 30;

/** Rotacao ociosa lenta do veiculo — mantem o metal vivo. */
function VehicleRig({ vehicle }) {
  const group = useRef(null);

  useFrame((state, rawDelta) => {
    if (!group.current) return;
    const delta = Math.min(rawDelta, MAX_DELTA);
    group.current.rotation.y += delta * 0.06;
    group.current.position.y =
      Math.sin(state.clock.elapsedTime * 0.6) * 0.015 + garageScroll.progress * 0.05;
  });

  return (
    <group ref={group}>
      <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.12}>
        <VehicleModel vehicle={vehicle} />
      </Float>
    </group>
  );
}

export function GarageScene({ vehicle, tier }) {
  return (
    <>
      <GarageEnvironment accent={vehicle.accent} tier={tier} />

      <Suspense fallback={null}>
        <VehicleRig vehicle={vehicle} />
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.07}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI / 2.35}
        target={[0, 0.78, 0]}
      />
    </>
  );
}
