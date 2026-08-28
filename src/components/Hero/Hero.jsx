import { useRef } from "react";
import { useGSAP } from "../../lib/gsap";
import { GothamBed } from "../common/GothamBed";
import { createHeroAnimation } from "../../animations/heroAnimation";

/**
 * Hero — Opcao A (texto a esquerda, personagem a direita).
 *
 * Escolha justificada no relatorio: `PossivelFotoHero.jpg` e a unica arte
 * vertical com o personagem deslocado e espaco negativo utilizavel, o que
 * permite uma composicao editorial real. As artes candidatas a fundo cheio
 * (`possivelFundodaHero.jpg`, `foto6.jpg`) trazem a palavra BATMAN gravada
 * no pixel e brigariam com a tipografia animada por SplitText.
 */
export function Hero({ ready, tier }) {
  const root = useRef(null);

  // A Hero e a primeira secao real da pagina — ja visivel e rolando desde o
  // scroll 0. A abertura (Opening) e um overlay fixo por cima dela; o
  // recorte do morcego e quem revela este conteudo aos poucos, nao um
  // autoAlpha aqui. Ver `createOpeningAnimation`.
  useGSAP(
    () => {
      // Sem as fontes carregadas o SplitText mede as linhas com a fonte de
      // fallback e as mascaras ficam com a altura errada.
      if (!ready) return undefined;
      return createHeroAnimation(root.current, { tier });
    },
    { scope: root, dependencies: [ready, tier], revertOnUpdate: true }
  );

  return (
    <section
      id="hero"
      ref={root}
      className="relative z-10 flex min-h-[100svh] w-full items-center overflow-hidden bg-void"
      data-section="hero"
    >
      <GothamBed />

      {/* ---------------- personagem (direita) ---------------- */}
      <div
        className="layer flex justify-center lg:justify-end"
        data-speed="0.86"
      >
        <div
          data-hero="portrait"
          className="relative h-full w-full max-w-[720px] lg:w-[50%] lg:max-w-none"
        >
          <img
            src="/imgs/PossivelFotoHero.jpg"
            alt="Batman sob a chuva em Gotham"
            draggable="false"
            className="h-full w-full object-cover object-top"
            style={{
              maskImage:
                "radial-gradient(76% 60% at 58% 38%, #000 34%, rgba(0,0,0,0.55) 68%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(76% 60% at 58% 38%, #000 34%, rgba(0,0,0,0.55) 68%, transparent 100%)",
            }}
          />
          <div
            className="layer"
            style={{
              background:
                "linear-gradient(90deg, var(--color-void) 0%, rgba(4,5,10,0.72) 26%, rgba(4,5,10,0) 62%)",
            }}
          />
          {/* o asset traz a palavra BATMAN gravada no rodape — este scrim
              apaga a marca e assenta a figura no preto da secao */}
          <div
            className="layer"
            style={{
              background:
                "linear-gradient(0deg, var(--color-void) 0%, var(--color-void) 14%, rgba(4,5,10,0.72) 24%, rgba(4,5,10,0) 46%)",
            }}
          />
        </div>
      </div>

      {/* ---------------- conteudo (esquerda) ---------------- */}
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-16">
        <div className="lg:max-w-[54%]">
          <div className="max-w-[min(92vw,560px)] lg:max-w-none">
            <p data-hero="eyebrow" className="label mb-6 text-blood">
              01 — O Sinal
            </p>

            <h1
              data-hero="title"
              className="display text-[clamp(3.2rem,14vw,9rem)] text-bone"
            >
              Eu sou a vingança
            </h1>
          </div>

          <div className="mt-8 max-w-[46ch] lg:mt-10">
            <p
              data-hero="subtitle"
              className="text-base leading-relaxed text-fog sm:text-lg"
            >
              Dois anos de noites. Gotham aprendeu a olhar para cima quando a
              luz se acende — e a cidade inteira prende a respiração.
            </p>

            <div
              data-hero="cta"
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <a
                href="#garage"
                data-scroll-to="#garage"
                className="group relative inline-flex items-center gap-3 overflow-hidden border border-blood/60 px-7 py-4 text-xs font-medium tracking-[0.28em] text-bone uppercase transition-colors duration-500 hover:text-void"
              >
                <span className="absolute inset-0 -translate-x-full bg-blood transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0" />
                <span className="relative">Entrar na garagem</span>
              </a>

              <a
                href="#chronicle"
                data-scroll-to="#chronicle"
                className="inline-flex items-center gap-3 border-b border-smoke px-1 py-2 text-xs font-medium tracking-[0.28em] text-fog uppercase transition-colors duration-500 hover:border-gold hover:text-gold"
              >
                A crônica
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* rodape da hero */}
      <div className="absolute bottom-0 left-0 z-10 flex w-full items-end justify-between px-6 pb-6 sm:px-10 sm:pb-8">
        <p data-hero="meta" className="label">
          Distrito Leste · 41°N
        </p>
        <p data-hero="meta" className="label hidden sm:block">
          Cap. 01 / 06
        </p>
      </div>
    </section>
  );
}
