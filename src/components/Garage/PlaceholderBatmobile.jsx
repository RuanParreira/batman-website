import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Substituto procedural do Batmovel.
 *
 * Existe para que a garagem tenha volume, sombra, reflexo e escala corretos
 * antes dos .glb finais. Ocupa aproximadamente a mesma caixa envolvente de um
 * muscle car (4.9 x 1.3 x 2.1 m), entao a trajetoria de camera nao precisara
 * de reajuste quando o modelo real substituir isto.
 */
function Wheel({ position, radius = 0.46, width = 0.34 }) {
  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, width, 28]} />
        <meshStandardMaterial color="#15171d" metalness={0.3} roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.001, 0]}>
        <cylinderGeometry args={[radius * 0.56, radius * 0.56, width + 0.02, 20]} />
        <meshStandardMaterial color="#2c313c" metalness={0.9} roughness={0.26} />
      </mesh>
    </group>
  );
}

export function PlaceholderBatmobile({ accent = "#e11021", ...props }) {
  const thruster = useRef(null);
  const accentColor = useMemo(() => new THREE.Color(accent), [accent]);

  useFrame((state) => {
    if (!thruster.current) return;
    const t = state.clock.elapsedTime;
    thruster.current.material.emissiveIntensity = 1.1 + Math.sin(t * 3.1) * 0.3;
  });

  return (
    <group {...props} dispose={null}>
      {/* chassi inferior */}
      <mesh castShadow receiveShadow position={[0, 0.52, 0]}>
        <boxGeometry args={[4.9, 0.52, 2.05]} />
        <meshStandardMaterial color="#1b1e27" metalness={0.78} roughness={0.34} />
      </mesh>

      {/* capo / traseira alta */}
      <mesh castShadow receiveShadow position={[-0.55, 0.92, 0]}>
        <boxGeometry args={[2.5, 0.46, 1.9]} />
        <meshStandardMaterial color="#20242e" metalness={0.82} roughness={0.28} />
      </mesh>

      {/* cabine */}
      <mesh castShadow position={[0.1, 1.24, 0]}>
        <boxGeometry args={[1.5, 0.42, 1.5]} />
        <meshPhysicalMaterial
          color="#05060a"
          metalness={0.2}
          roughness={0.08}
          transmission={0.35}
          thickness={0.5}
        />
      </mesh>

      {/* splitter dianteiro */}
      <mesh castShadow receiveShadow position={[2.35, 0.34, 0]}>
        <boxGeometry args={[0.9, 0.14, 2.2]} />
        <meshStandardMaterial color="#181b23" metalness={0.75} roughness={0.42} />
      </mesh>

      {/* asa traseira */}
      <mesh castShadow position={[-2.4, 1.06, 0]}>
        <boxGeometry args={[0.5, 0.08, 2.1]} />
        <meshStandardMaterial color="#1d212a" metalness={0.8} roughness={0.38} />
      </mesh>

      {/* turbina — acento emissivo do veiculo */}
      <mesh ref={thruster} position={[-2.62, 0.76, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.42, 0.5, 0.34, 26]} />
        <meshStandardMaterial
          color="#120306"
          emissive={accentColor}
          emissiveIntensity={1.1}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* faixa de luz frontal */}
      <mesh position={[2.48, 0.72, 0]}>
        <boxGeometry args={[0.06, 0.1, 1.5]} />
        <meshStandardMaterial
          color="#1a0207"
          emissive={accentColor}
          emissiveIntensity={1.2}
        />
      </mesh>

      <Wheel position={[1.62, 0.46, 1.02]} />
      <Wheel position={[1.62, 0.46, -1.02]} />
      <Wheel position={[-1.68, 0.5, 1.08]} radius={0.5} width={0.44} />
      <Wheel position={[-1.68, 0.5, -1.08]} radius={0.5} width={0.44} />
    </group>
  );
}
