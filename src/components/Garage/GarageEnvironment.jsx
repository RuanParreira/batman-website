import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer, Sparkles } from "@react-three/drei";
import { garageScroll } from "./garageStore";
import "../shaders/HoloFloorMaterial";

// Chave estavel: forca a recriacao do material quando o modulo do shader e
// trocado a quente durante o desenvolvimento.
const HOLO_FLOOR_KEY = "holo-floor-v1";

const RING_TICKS = [0, 90, 180, 270];

// Mesmo teto de GarageScene.jsx: sem ele, o primeiro frame apos o canvas
// voltar a renderizar (frameloop pausado enquanto a secao esta fora da
// viewport) soma um `delta` de segundos no uTime do shader — a scanline
// do grid pula de fase visivelmente nesse frame.
const MAX_DELTA = 1 / 30;

/**
 * Anel de inspecao sob o veiculo — mesma linguagem de HUD do resto da
 * secao (moldura, progresso em SVG). Substitui a mancha de contact-shadow
 * genérica por uma marca de chao desenhada, ancorando o veiculo no espaco
 * sem depender de uma sombra borrada para "explicar" onde ele pousa.
 */
function InspectionRing({ accent }) {
  const inner = useRef(null);

  useFrame((state) => {
    if (!inner.current) return;
    inner.current.material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 0.8) * 0.14;
  });

  return (
    <group position={[0, 0.009, 0]}>
      <mesh ref={inner} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.82, 2.96, 96]} />
        <meshBasicMaterial color={accent} transparent opacity={0.55} toneMapped={false} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.38, 3.4, 96]} />
        <meshBasicMaterial color={accent} transparent opacity={0.22} toneMapped={false} />
      </mesh>

      {RING_TICKS.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <mesh
            key={deg}
            rotation={[-Math.PI / 2, 0, -rad]}
            position={[Math.sin(rad) * 3.4, 0, Math.cos(rad) * 3.4]}
          >
            <planeGeometry args={[0.05, 0.34]} />
            <meshBasicMaterial color={accent} transparent opacity={0.75} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
}

/**
 * Atmosfera da garagem.
 *
 * Iluminacao de tres pontos com leitura de cinema: key quente e baixa vindo
 * da frente, rim frio por tras (separa o veiculo do fundo preto) e um fill
 * dourado rasante no chao. O ambiente e construido com Lightformers em vez
 * de um HDRI remoto — nenhuma requisicao de rede, nenhum asset extra.
 */
export function GarageEnvironment({ accent = "#e11021", tier = "high" }) {
  const key = useRef(null);
  const rim = useRef(null);
  const fill = useRef(null);
  const floor = useRef(null);

  const shadows = tier === "high";

  useFrame((state, rawDelta) => {
    const p = garageScroll.progress;
    const delta = Math.min(rawDelta, MAX_DELTA);

    if (key.current) {
      key.current.intensity = 26 + p * 32;
    }
    if (rim.current) {
      rim.current.intensity = 26 + Math.sin(p * Math.PI) * 34;
    }
    if (fill.current) {
      fill.current.intensity = 3.1 - p * 1.1;
    }
    if (floor.current) {
      floor.current.uTime += delta;
      floor.current.uOpacity = 0.3 + p * 0.45;
    }
  });

  return (
    <>
      <color attach="background" args={["#04050a"]} />
      <fog attach="fog" args={["#04050a", 11, 38]} />

      <ambientLight intensity={0.75} color="#445066" />

      {/* key branca: sem ela o metal quase preto nao le forma nenhuma */}
      <directionalLight
        ref={fill}
        position={[6, 7, 8]}
        intensity={3.1}
        color="#d6dde9"
        castShadow={shadows}
        shadow-mapSize={shadows ? [1024, 1024] : [512, 512]}
        shadow-bias={-0.0006}
      />

      <spotLight
        ref={key}
        position={[5.5, 8.5, 6]}
        angle={0.62}
        penumbra={1}
        intensity={26}
        distance={40}
        color={accent}
        castShadow={shadows}
        shadow-mapSize={shadows ? [1024, 1024] : [512, 512]}
        shadow-bias={-0.0006}
      />

      <spotLight
        ref={rim}
        position={[-7, 5.5, -6.5]}
        angle={0.8}
        penumbra={1}
        intensity={24}
        distance={40}
        color="#8fb4ff"
      />

      <pointLight position={[0, 0.6, 5]} intensity={6} distance={14} color="#f2b53c" />

      {/* chao fisico — mais escuro e reflexivo, le como concreto molhado de subsolo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[70, 70]} />
        <meshStandardMaterial color="#05060a" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* grid holografico (shader customizado) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[40, 40]} />
        <holoFloorMaterial
          ref={floor}
          key={HOLO_FLOOR_KEY}
          uColor={accent}
          transparent
          depthWrite={false}
        />
      </mesh>

      <InspectionRing accent={accent} />

      {tier !== "low" && (
        <Sparkles
          count={60}
          scale={[16, 7, 16]}
          size={1.3}
          speed={0.15}
          opacity={0.3}
          color="#9fb4ff"
          position={[0, 3.2, -2]}
        />
      )}

      <Environment resolution={tier === "low" ? 64 : 192}>
        <Lightformer intensity={4} color={accent} position={[0, 6, 4]} scale={[12, 4, 1]} />
        <Lightformer intensity={3} color="#9dbcff" position={[-8, 5, -6]} scale={[10, 5, 1]} />
        <Lightformer intensity={1.6} color="#f2b53c" position={[8, 2, 2]} scale={[7, 2, 1]} />
        <Lightformer intensity={1.2} color="#233047" position={[0, 8, -2]} scale={[20, 8, 1]} />
      </Environment>
    </>
  );
}
