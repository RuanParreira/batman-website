import { Suspense, lazy, useEffect, useRef, useState } from "react";

const SignalCanvas = lazy(() => import("./SignalCanvas"));

/**
 * Transmissao — o video da garagem/patrulha reconstruido como uma matriz de
 * pontos vermelhos (halftone/LED), via shader GLSL (ver
 * `DotMatrixMaterial`). Nao e o video em si: e uma imagem 2D recriada por
 * pixel de tela a partir da luminosidade dele, num unico quad.
 *
 * O <video> vive de verdade no DOM (so escondido via CSS, nao
 * display:none) — um <video> criado via document.createElement e nunca
 * anexado a pagina tem decodificacao/autoplay pouco confiavel em varios
 * navegadores quando usado so como fonte de VideoTexture. O elemento e
 * criado aqui e passado pronto pro Canvas; o WebGL nunca cria o proprio.
 *
 * So monta o Canvas (bundle pesado do Three) depois de `ready`, e so liga o
 * frameloop/o video quando a seccao esta de fato na viewport
 * (IntersectionObserver) — fora dela, GPU e CPU ficam ociosas.
 */
export function Signal({ ready, tier }) {
  const root = useRef(null);
  const videoRef = useRef(null);
  const [active, setActive] = useState(false);
  const [video, setVideo] = useState(null);

  useEffect(() => {
    const el = videoRef.current;
    // React tem um bug antigo (facebook/react#10389): o atributo `muted` no
    // JSX nem sempre vira a PROPRIEDADE muted do DOM a tempo. Sem estar
    // genuinamente mutado, o navegador recusa o autoplay programatico —
    // silenciosamente, sem erro. Forcar aqui e o fix documentado.
    if (el) {
      el.muted = true;
      el.defaultMuted = true;
    }
    setVideo(el);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="signal"
      ref={root}
      className="relative h-[68svh] w-full overflow-hidden bg-void sm:h-[82svh] lg:h-[94svh]"
      data-section="signal"
    >
      <video
        ref={videoRef}
        src="/video/video3.mp4"
        muted
        loop
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
        aria-hidden="true"
        tabIndex={-1}
        onError={(event) =>
          console.error("[Signal] falha ao carregar o video:", event.currentTarget.error)
        }
      />

      {ready && video && (
        <Suspense fallback={null}>
          <SignalCanvas video={video} active={active} tier={tier} />
        </Suspense>
      )}

      <div className="layer flex flex-col justify-between p-6 sm:p-10 lg:p-14">
        <p className="label text-blood">07 — Transmissão</p>
        <p className="label max-w-[26ch] self-end text-right text-bone/60">
          Sinal decodificado em tempo real
        </p>
      </div>
    </section>
  );
}
