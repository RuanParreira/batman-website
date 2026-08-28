import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger, EASE } from "../../lib/gsap";
import { BatMark } from "../Opening/BatMark";
import { asset } from "../../lib/asset";

/**
 * Preloader.
 *
 * Existe por um motivo tecnico alem do estetico: o SplitText precisa das
 * fontes carregadas para medir linhas corretamente. A experiencia so libera
 * as animacoes depois de `document.fonts.ready` — sem isso, a Hero
 * recalcularia as linhas no meio da entrada.
 */
export function Preloader({ onComplete }) {
  const root = useRef(null);
  const [assetsReady, setAssetsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fonts = document.fonts?.ready ?? Promise.resolve();
    const symbol = new Promise((resolve) => {
      const image = new Image();
      image.onload = resolve;
      image.onerror = resolve;
      image.src = asset("/imgs/batarang.png");
    });
    const floor = new Promise((resolve) => setTimeout(resolve, 900));

    Promise.all([fonts, symbol, floor]).then(() => {
      if (!cancelled) setAssetsReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Traco continuo enquanto carrega — criado uma unica vez.
  useGSAP(
    () => {
      const strokes = gsap.utils.toArray("[data-preload-draw]", root.current);
      gsap.set(strokes, { drawSVG: 0 });
      gsap.to(strokes, {
        drawSVG: "0% 100%",
        duration: 2.2,
        ease: "power1.inOut",
        stagger: 0.12,
        repeat: -1,
        repeatDelay: 0.2,
        yoyo: true,
      });
    },
    { scope: root }
  );

  // Saida — so quando fontes e simbolo estiverem prontos.
  useGSAP(
    () => {
      if (!assetsReady) return;
      const q = gsap.utils.selector(root);

      gsap
        .timeline({
          onComplete: () => {
            document.documentElement.classList.remove("is-loading");
            // Ultima garantia contra restauracao tardia de scroll do
            // navegador: layout e fontes ja assentaram aqui, entao se algo
            // ainda vai pular a posicao, e agora — antes de qualquer
            // ScrollTrigger da experiencia existir.
            window.scrollTo(0, 0);
            ScrollTrigger.refresh();
            onComplete?.();
          },
        })
        .to(
          q("[data-preload-draw]"),
          { drawSVG: "0% 100%", duration: 0.5, ease: "power2.out", overwrite: true },
          0
        )
        .to(
          q("[data-preload-mark]"),
          { opacity: 0, scale: 1.3, duration: 0.9, ease: EASE.shutter },
          0.25
        )
        .to(root.current, { opacity: 0, duration: 0.8, ease: EASE.cine }, 0.55)
        .set(root.current, { display: "none" });
    },
    { scope: root, dependencies: [assetsReady] }
  );

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] grid place-items-center bg-void"
      aria-hidden="true"
    >
      <div data-preload-mark className="relative flex flex-col items-center gap-8">
        <BatMark
          className="h-auto w-[46vw] max-w-[280px] text-blood"
          strokeWidth={4}
          drawAttr="data-preload-draw"
        />
        <p className="label text-fog">Carregando o arquivo</p>
      </div>
    </div>
  );
}
