import { useRef } from "react";
import { gsap, useGSAP, EASE } from "../../lib/gsap";
import { revealChars, revertSplits } from "../../animations/text";
import { useScrollTo } from "../../hooks/useScrollTo";

/**
 * Fecho da experiencia. Placeholder estrutural: e aqui que entram os
 * proximos capitulos (Batcaverna, dossies, creditos).
 */
export function Outro({ ready }) {
  const root = useRef(null);
  const scrollTo = useScrollTo();

  useGSAP(
    () => {
      if (!ready) return undefined;
      const q = gsap.utils.selector(root);
      const splits = [];

      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: "top 70%", once: true } })
        .from(q("[data-outro='mark']"), {
          opacity: 0,
          scale: 1.18,
          filter: "blur(18px)",
          duration: 2,
          ease: EASE.cine,
        })
        .add(revealChars(q("[data-outro='title']")[0], { bin: splits, stagger: 0.02 }), 0.35)
        .from(q("[data-outro='foot']"), { opacity: 0, y: 18, duration: 1 }, 0.8);

      return () => revertSplits(splits);
    },
    { scope: root, dependencies: [ready], revertOnUpdate: true }
  );

  return (
    <footer
      ref={root}
      id="outro"
      className="relative flex min-h-[90svh] w-full flex-col items-center justify-center overflow-hidden bg-void px-6 py-24 text-center"
    >
      <img
        data-outro="mark"
        src="/imgs/foto2.jpg"
        alt="Logotipo de The Batman"
        loading="lazy"
        decoding="async"
        draggable="false"
        className="pointer-events-none w-[min(78vw,560px)] object-contain mix-blend-screen"
      />

      <h2
        data-outro="title"
        className="display mt-10 max-w-[18ch] text-[clamp(1.8rem,4.6vw,3.4rem)] text-bone"
      >
        O arquivo continua
      </h2>

      <div data-outro="foot" className="mt-12 flex flex-col items-center gap-6">
        <button
          type="button"
          onClick={() => scrollTo("#hero")}
          className="border border-smoke/70 px-7 py-4 text-[0.62rem] tracking-[0.28em] text-fog uppercase transition-colors duration-500 hover:border-blood hover:text-bone"
        >
          Reiniciar a noite
        </button>
        <p className="label">Protótipo · Etapa 01 de fundação</p>
      </div>
    </footer>
  );
}
