import { Suspense, lazy, useCallback, useRef, useState } from "react";
import { useGSAP } from "../../lib/gsap";
import { prefersReducedMotion } from "../../lib/device";
import { asset } from "../../lib/asset";
import { createBatarangTransitionAnimation } from "../../animations/batarangTransitionAnimation";

// three + R3F saem do bundle inicial, mesmo criterio da Garagem/Sinal.
const BatarangCanvas = lazy(() => import("./BatarangCanvas"));

/**
 * Corte Cronica -> Dossie.
 *
 * Sem cabecalho proprio: e um batente, nao uma secao de conteudo. A Cronica
 * ja termina em preto (ver `chronicleAnimation`/quote-band), entao a saida
 * daqui e so o void — sem repetir nenhuma imagem que o leitor acabou de ver.
 * O batarang atravessa a tela girando enquanto `foto8` (abertura do Dossie)
 * entra via clip-path — a pagina muda "conforme ele passa", nao antes.
 *
 * Ponto isolado de deslocamento: mover essa transicao pra outro par de
 * secoes e so trocar onde este component e montado em `App.jsx`.
 */
export function BatarangTransition({ ready, tier }) {
  const root = useRef(null);
  const [active, setActive] = useState(false);
  const [reduced] = useState(() => prefersReducedMotion());

  const handleActive = useCallback((value) => setActive(value), []);

  useGSAP(
    () => {
      if (!ready) return undefined;
      return createBatarangTransitionAnimation(root.current, { onActiveChange: handleActive });
    },
    { scope: root, dependencies: [ready, handleActive], revertOnUpdate: true }
  );

  return (
    <section
      ref={root}
      className="relative w-full bg-void"
      data-section="batarang-transition"
    >
      <div
        data-batarang="stage"
        className="relative h-screen w-full overflow-hidden"
      >
        {/* -------------------- saida: a Cronica ja fecha em preto -------------------- */}
        <div data-batarang="outgoing" className="layer bg-void">
          <div
            className="layer"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 50%, rgba(45,4,9,0.4) 0%, rgba(4,5,10,1) 75%)",
            }}
          />
        </div>

        {/* -------------------- entrada: abertura do Dossie -------------------- */}
        <div
          data-batarang="incoming"
          className="layer"
          style={{ clipPath: "inset(0% 100% 0% 0%)" }}
        >
          <img
            src={asset("/imgs/foto8.jpg")}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            draggable="false"
            className="h-full w-full object-cover opacity-70"
            style={{ objectPosition: "60% 46%" }}
          />
          <div
            className="layer"
            style={{
              background:
                "radial-gradient(52% 44% at 78% 32%, rgba(225,16,33,0.16) 0%, rgba(4,5,10,0.4) 72%)",
            }}
          />
        </div>

        {/* -------------------- batarang -------------------- */}
        {!reduced && (
          <div className="layer">
            <Suspense fallback={null}>
              <BatarangCanvas tier={tier} active={active} />
            </Suspense>
          </div>
        )}

        <div className="layer vignette" />
        <div className="layer grain" />
      </div>
    </section>
  );
}
