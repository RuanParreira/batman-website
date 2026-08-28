import { useEffect, useMemo, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { LoopRepeat } from "three";
import { PlaceholderBatmobile } from "./PlaceholderBatmobile";

/**
 * Carrega o .glb/.gltf do veiculo.
 * Fica em componente proprio para que o hook useGLTF (que suspende) nunca
 * seja chamado condicionalmente.
 */
function GLTFVehicle({ url, transform }) {
  const { scene, animations } = useGLTF(url);

  const object = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  const group = useRef(null);
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    const running = Object.values(actions).map((action) =>
      action.reset().setLoop(LoopRepeat, Infinity).play()
    );
    return () => running.forEach((action) => action.stop());
  }, [actions]);

  return (
    <group ref={group}>
      <primitive
        object={object}
        scale={transform?.scale ?? 1}
        position={transform?.position ?? [0, 0, 0]}
        rotation={transform?.rotation ?? [0, 0, 0]}
      />
    </group>
  );
}

/**
 * Ponto unico de troca: se o veiculo ainda nao tem modelo, entra o
 * substituto procedural. Adicionar um `.glb` em vehicles.js e suficiente.
 */
export function VehicleModel({ vehicle }) {
  if (!vehicle.model) {
    return <PlaceholderBatmobile accent={vehicle.accent} />;
  }

  return <GLTFVehicle key={vehicle.model} url={vehicle.model} transform={vehicle.transform} />;
}
