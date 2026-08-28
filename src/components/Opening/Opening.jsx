import { useRef } from "react";
import { useGSAP } from "../../lib/gsap";
import { BatGlyph } from "./BatGlyph";
import { OpeningHud } from "./OpeningHud";
import { createOpeningAnimation } from "../../animations/openingAnimation";

/** Mesma caixa usada pelo simbolo em toda a abertura. */
const SYMBOL_BOX = "w-[min(88vw,148vh)] h-auto";

/**
 * Abertura — uma placa preta com um recorte na forma do morcego, fixa por
 * cima da pagina inteira (fora do #smooth-content, como a Nav). Ela mesma
 * nao ocupa espaco no fluxo — mas pina a Hero (ver `createOpeningAnimation`)
 * enquanto o recorte cresce, entao o que aparece por dentro dele e a Hero de
 * verdade (nao uma copia): a experiencia e "a placa abre e revela a pagina",
 * nao "a placa toca uma cena generica e so depois entrega a Hero".
 */
export function Opening({ ready, tier }) {
  const root = useRef(null);

  useGSAP(
    () => {
      if (!ready) return undefined;
      return createOpeningAnimation(root.current, { tier });
    },
    { scope: root, dependencies: [ready, tier], revertOnUpdate: true }
  );

  return (
    <div
      ref={root}
      className="pointer-events-none fixed inset-0 z-45 overflow-hidden"
      data-section="opening"
      aria-hidden="true"
    >
      {/* -------- z0: a placa preta com o recorte do morcego ------------- */}
      <div className="layer grid place-items-center">
        <BatGlyph className={SYMBOL_BOX} />
      </div>

      {/* -------- z1: reticula de HUD (DrawSVG) -------------------------- */}
      <OpeningHud />

      {/* -------- z2: tipografia da abertura ------------------------------ */}
      <div className="layer flex flex-col justify-between p-6 sm:p-10">
        <div
          data-opening="hud-text"
          className="flex items-start justify-between opacity-0"
        >
          <p className="label">Gotham City — 03:47</p>
          <p className="label hidden sm:block">Arquivo 001 / Vingança</p>
        </div>

        <div
          data-opening="scroll-hint"
          className="flex flex-col items-center gap-3 opacity-0"
        >
          <p className="label text-bone/70">Role para atravessar</p>
          <svg
            width="1"
            height="54"
            viewBox="0 0 1 54"
            aria-hidden="true"
            className="overflow-visible"
          >
            <line
              data-hint-line
              x1="0.5"
              y1="0"
              x2="0.5"
              y2="54"
              stroke="var(--color-blood)"
              strokeWidth="1"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
