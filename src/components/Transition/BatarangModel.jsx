import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { asset } from "../../lib/asset";

const MODEL_URL = asset("/models/batarang.glb");

/**
 * Carrega o .glb do batarang. Componente proprio porque `useGLTF` suspende
 * (mesma razao de `GLTFVehicle` na Garagem).
 */
export function BatarangModel() {
  const { scene } = useGLTF(MODEL_URL);

  const object = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
    return clone;
  }, [scene]);

  return (
    // O .glb traz a correcao de eixo padrao do Sketchfab (Z-up -> Y-up)
    // bakeada no node raiz: uma rotacao de -90 em X que deixa o objeto
    // deitado de barriga pra cima (fino no eixo Y), de perfil pra uma
    // camera frontal. +90 em X desfaz exatamente essa correcao e devolve
    // a orientacao crua do mesh — fino em Z, de frente pra camera.
    <group rotation={[Math.PI / 2, 0, 0]}>
      <primitive object={object} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);
