import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import "../shaders/DotMatrixMaterial";
import { SIGNAL_TRAIL_POINTS } from "./signalConfig";

// distancia minima (px) que o cursor precisa andar pra render um novo ponto
// de rastro — parado, nenhum ponto novo entra e o rastro existente so
// desaparece (ver uTrailLifetime), nunca fica uma "bola" acesa fixa. Baixo
// o bastante pra fita ficar continua (sem "contas" espacadas) num movimento
// normal de mouse.
const TRAIL_MIN_DIST = 6;

/**
 * Malha unica, tela cheia, ortografica — nao ha "objetos" alem dela. O
 * shader (DotMatrixMaterial) reconstroi o video inteiro por pixel de tela;
 * ver o comentario la para a logica do efeito.
 *
 * `video` chega pronto (elemento real, no DOM — ver Signal.jsx); aqui so
 * criamos a VideoTexture em cima dele.
 */
export function SignalScene({ video, active, params }) {
  const { viewport, size, gl } = useThree();
  const materialRef = useRef(null);
  const trailRef = useRef([]); // fila de {x, y, t}, mais novo primeiro
  const lastPointRef = useRef(null);

  // O pointer do R3F ja acompanha o mouse sobre o canvas sozinho (sem
  // listener manual). NDC (-1..1, y pra cima) e vUv (0..1, y pra cima) usam
  // a mesma orientacao — so escala pra pixel de tela, sem inverter eixo.
  useFrame((state) => {
    const material = materialRef.current;
    if (!material) return;

    const { pointer, clock } = state;
    const now = clock.elapsedTime;
    const x = (pointer.x * 0.5 + 0.5) * size.width;
    const y = (pointer.y * 0.5 + 0.5) * size.height;

    const last = lastPointRef.current;
    if (!last || Math.hypot(x - last.x, y - last.y) >= TRAIL_MIN_DIST) {
      trailRef.current.unshift({ x, y, t: now });
      if (trailRef.current.length > SIGNAL_TRAIL_POINTS) trailRef.current.length = SIGNAL_TRAIL_POINTS;
      lastPointRef.current = { x, y };
    }

    // pop em vez de filter: a fila fica ordenada mais-novo-primeiro (unshift
    // acima), entao pontos expirados sempre se acumulam no fim — sem isso
    // seria uma alocacao de array nova a cada frame, pra sempre, enquanto a
    // seccao estiver visivel.
    const lifetime = params.uTrailLifetime;
    const queue = trailRef.current;
    while (queue.length && now - queue[queue.length - 1].t >= lifetime) queue.pop();

    const positions = material.uTrailPos;
    const ages = material.uTrailAge;
    for (let i = 0; i < SIGNAL_TRAIL_POINTS; i++) {
      const p = trailRef.current[i];
      if (p) {
        positions[i].set(p.x, p.y);
        ages[i] = now - p.t;
      } else {
        positions[i].set(-9999, -9999);
        ages[i] = lifetime + 1;
      }
    }
  });

  const texture = useMemo(() => {
    const t = new THREE.VideoTexture(video);
    t.colorSpace = gl.outputColorSpace;
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video]);

  const [videoRes, setVideoRes] = useState(() => [
    video.videoWidth || 16,
    video.videoHeight || 9,
  ]);

  useEffect(() => {
    const update = () => setVideoRes([video.videoWidth, video.videoHeight]);
    if (video.videoWidth) update();
    video.addEventListener("loadedmetadata", update);
    return () => video.removeEventListener("loadedmetadata", update);
  }, [video]);

  // A seccao so fica com frameloop "always" quando visivel (ver
  // SignalCanvas) — aqui tambem pausamos o <video> real, senao ele continua
  // decodificando fora de tela mesmo sem nada renderizando o resultado.
  useEffect(() => {
    if (active) {
      const attempt = video.play();
      // Se isso rejeitar (autoplay bloqueado), quero saber — nao esconder
      // o erro so pra "ficar bonito" quando o efeito inteiro depende disso.
      attempt == null
        ? void 0
        : attempt.catch((err) => console.warn("[Signal] video.play() falhou:", err));
    } else {
      video.pause();
    }
  }, [active, video]);

  useEffect(() => () => texture.dispose(), [texture]);

  const resolution = useMemo(() => [size.width, size.height], [size.width, size.height]);

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <dotMatrixMaterial
        ref={materialRef}
        uVideo={texture}
        uResolution={resolution}
        uVideoResolution={videoRes}
        toneMapped={false}
        depthTest={false}
        depthWrite={false}
        {...params}
      />
    </mesh>
  );
}
