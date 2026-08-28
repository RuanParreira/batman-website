import { useEffect, useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import "../shaders/DotMatrixMaterial";

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
