import { useEffect, useRef } from "react";
import { useGSAP } from "../../lib/gsap";
import { GothamBed } from "../common/GothamBed";
import { createHeroAnimation } from "../../animations/heroAnimation";

/**
 * Hero — Opcao A (texto a esquerda, personagem a direita).
 *
 * O retrato e um video (`/video/hero.mp4`, Batman virando para encarar a
 * camera) em vez de imagem estatica. Fica parado no primeiro frame ate o
 * proprio recorte da Opening terminar de revela-lo — `createOpeningAnimation`
 * dispara um unico play() nesse instante. Disparar em `ready` (antes do
 * scroll) tocaria o giro escondido atras do recorte fechado: o usuario so
 * veria o resultado ja pronto quando o recorte finalmente abrisse.
 */
export function Hero({ ready, tier }) {
  const root = useRef(null);
  const videoRef = useRef(null);

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

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    // React tem um bug antigo (facebook/react#10389): o atributo `muted`
    // no JSX nem sempre vira a PROPRIEDADE muted do DOM a tempo — sem
    // estar genuinamente mutado o navegador recusa o play() programatico.
    el.muted = true;
    el.defaultMuted = true;
  }, []);

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
          <video
            ref={videoRef}
            data-hero="portrait-video"
            src="/video/hero.mp4"
            aria-label="Batman sob a chuva em Gotham, virando para encarar a camera"
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            draggable="false"
            className="h-full w-full object-cover"
            style={{
              // o video tem uma faixa morta acima da cabeca; sobe o ponto
              // de ancoragem do crop (object-top puro seria 50% 0%, que
              // mostra essa faixa) pra cortar o vao e a figura ocupar mais
              // do quadro
              objectPosition: "50% 22%",
              maskImage:
                "radial-gradient(76% 60% at 58% 38%, #000 34%, rgba(0,0,0,0.55) 68%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(76% 60% at 58% 38%, #000 34%, rgba(0,0,0,0.55) 68%, transparent 100%)",
            }}
          />
          {/* sem preto solido no 0% de proposito — o brilho do GothamBed
              (glow) e centrado bem nessa borda (50% da secao); um degrade
              que comeca opaco cria um corte visivel contra o brilho por
              tras. Comecar ja parcialmente transparente deixa a transicao
              continua com o que esta atras */}
          <div
            className="layer"
            style={{
              background:
                "linear-gradient(90deg, rgba(4,5,10,0.5) 0%, rgba(4,5,10,0.62) 22%, rgba(4,5,10,0.3) 44%, rgba(4,5,10,0) 68%)",
            }}
          />
          {/* assenta so a base da figura no preto da secao — sem precisar
              esconder marca d'agua (o video, ao contrario do jpg antigo,
              nao tem nada gravado no rodape) */}
          <div
            className="layer"
            style={{
              background:
                "linear-gradient(0deg, rgba(4,5,10,0.55) 0%, rgba(4,5,10,0.24) 20%, rgba(4,5,10,0) 42%)",
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
