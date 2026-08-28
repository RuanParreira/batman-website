import { gsap, EASE } from "../lib/gsap";
import { BAT_ORIGIN } from "../components/Opening/batPath";
import { revealChars, revealLines, revertSplits } from "./text";

/**
 * Abertura — o morcego mergulha para revelar a Hero.
 *
 * A placa (BatGlyph) e um overlay fixo, fora do fluxo, por cima da pagina
 * inteira (ver Opening.jsx). A Hero e a primeira secao real: ja esta la,
 * visivel, com seu proprio conteudo (nao uma copia). Duas timelines:
 *
 *  1. `intro` — independente do scroll. Materializa o simbolo solido e
 *               desenha a reticula com DrawSVG.
 *  2. `dive`  — scrubbed e pinada na propria Hero (o pin devolve a distancia
 *               de scroll que a transicao consome — sem ele diveEnd comeria
 *               a altura inteira da Hero e o usuario cairia direto na
 *               proxima secao). O buraco cresce ate engolir a viewport
 *               enquanto, NA MESMA janela, a Hero revela seu conteudo —
 *               titulo, retrato, CTA — atraves do proprio recorte. O
 *               resultado e a placa abrindo sobre a Hero de verdade, nao uma
 *               cena generica seguida de uma troca abrupta.
 *
 * A Nav (fora deste componente, fixa) tambem e revelada daqui, no instante
 * em que o morcego termina de sumir — NAO quando o pino solta de vez (isso
 * so acontece depois da "travadinha", ver abaixo, e ficaria tarde demais).
 * Usa a label `navReveal` da propria diveTl como fonte de verdade, em vez
 * de um ScrollTrigger paralelo tentando adivinhar a mesma distancia.
 *
 * @param {HTMLElement} root
 * @param {{tier: "low"|"mid"|"high"}} options
 * @returns {() => void} cleanup
 */
export function createOpeningAnimation(root, { tier = "high" } = {}) {
  const q = gsap.utils.selector(root);
  const mm = gsap.matchMedia();

  const glyph = q('[data-opening="glyph"]')[0];
  const glyphScale = q('[data-opening="glyph-scale"]')[0];
  const signal = q('[data-opening="glyph-signal"]')[0];
  const halo = q('[data-opening="glyph-halo"]')[0];
  const reticle = q('[data-opening="reticle"]')[0];
  const hudText = q('[data-opening="hud-text"]')[0];
  const scrollHint = q('[data-opening="scroll-hint"]')[0];
  const drawTargets = q("[data-draw]");
  const hintLine = q("[data-hint-line]")[0];

  const hero = document.querySelector("#hero");
  if (!hero) return () => {};
  const heroQ = gsap.utils.selector(hero);

  const nav = document.querySelector('[data-nav="root"]');
  const navHidden = { yPercent: -120, opacity: 0 };
  const navShown = { yPercent: 0, opacity: 1 };
  const syncNav = (active, animate) => {
    if (!nav) return;
    const target = active ? navShown : navHidden;
    if (animate) {
      gsap.to(nav, {
        ...target,
        duration: active ? 1.1 : 0.5,
        ease: EASE.cine,
        overwrite: true,
      });
    } else {
      gsap.set(nav, target);
    }
  };

  const eyebrow = heroQ('[data-hero="eyebrow"]')[0];
  const title = heroQ('[data-hero="title"]')[0];
  const subtitle = heroQ('[data-hero="subtitle"]')[0];
  const cta = heroQ('[data-hero="cta"]')[0];
  const meta = heroQ('[data-hero="meta"]');
  const portrait = heroQ('[data-hero="portrait"]')[0];

  const splits = [];
  const softFocus = tier !== "low";

  mm.add(
    {
      isMobile: "(max-width: 767px)",
      isDesktop: "(min-width: 768px)",
      isReduced: "(prefers-reduced-motion: reduce)",
    },
    (context) => {
      const { isMobile, isReduced } = context.conditions;

      // A Hero so tem ~1 viewport de altura (100svh) e o pin cobre essa
      // MESMA distancia — diveEnd perto de 100% deixava quase nada de
      // "respiro" depois que o pino solta, antes da Chronicle comecar. O
      // trecho extra aqui (alem do que a timeline de conteudo precisa) e a
      // "travadinha" — ver o `.to({}, ...)` mudo no fim da diveTl.
      const diveEnd = isMobile ? "+=65%" : "+=86%";
      // O morcego e largo e baixo: para o buraco engolir a viewport inteira
      // a escala precisa vencer a altura, nao a largura. Dai o fator alto.
      const holeEnd = isMobile ? 22 : 11;

      gsap.set(glyphScale, { scale: 1, svgOrigin: BAT_ORIGIN });
      gsap.set(drawTargets, { drawSVG: 0 });
      syncNav(false, false);

      // Esta animacao inteira e recriada sempre que `tier`/`ready` mudam ou
      // que o matchMedia cruza um breakpoint (isMobile/isDesktop) — o que
      // pode acontecer so por causa da barra de rolagem aparecer/sumir e
      // mudar `innerWidth` em alguns pixels, sem o usuario fazer nada. O
      // `intro` abaixo NAO sabe nada de scroll: se ele tocasse do zero com o
      // usuario ja rolado pra baixo, a entrada do hint ("Role para
      // atravessar") acenderia de novo, fora de sincronia com a posicao real
      // — parecia "grudado" na tela. Se o topo da Hero ja saiu da viewport,
      // o mergulho ja foi visto: pula a intro inteira em vez de tocar.
      const alreadyPastDive = hero.getBoundingClientRect().top < -40;

      /* ---------------------------- 1. intro ---------------------------- */
      // `intro` toca uma unica vez, do inicio ao fim, e nunca e pausada nem
      // retomada pelo scroll — so os loops decorativos infinitos (`loops`,
      // abaixo) sao. Antes os dois viviam na MESMA timeline: se o usuario
      // rolasse rapido o suficiente pra sair da Hero antes do fade-in do
      // hint terminar, `onLeave` pausava esse fade-in a meio caminho: uma
      // volta rapida a Hero (`onEnterBack`) retomava o relogio, que podia
      // terminar de acender o hint em segundo plano — com o usuario ja
      // longe da Hero, parecendo "grudado" na tela.
      const intro = gsap.timeline({ delay: alreadyPastDive ? 0 : 0.15 });
      const loops = gsap.timeline();

      if (alreadyPastDive) {
        gsap.set([hudText, scrollHint], { opacity: 0 });
      } else {
        intro
          // O morcego ja esta opaco desde antes do preloader soltar — aqui so
          // aguca o foco (blur+scale), nunca esconde a placa.
          .fromTo(
            glyph,
            { scale: 1.14, filter: softFocus ? "blur(16px)" : "none" },
            {
              scale: 1,
              filter: "blur(0px)",
              duration: isReduced ? 0.4 : 2,
              ease: EASE.cine,
              clearProps: "filter",
            }
          )
          .to(
            drawTargets,
            {
              drawSVG: "0% 100%",
              duration: isReduced ? 0.4 : 1.8,
              stagger: 0.05,
              ease: EASE.cine,
            },
            0.4
          )
          .from(hudText, { opacity: 0, y: 14, duration: 1.2 }, 0.8)
          .to(scrollHint, { opacity: 1, duration: 1 }, 1.25);

        if (!isReduced) {
          // pulso do halo: o simbolo respira antes de mergulhar
          loops.to(
            halo,
            {
              opacity: 1,
              duration: 2.6,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
            },
            1
          );

          if (hintLine) {
            loops.fromTo(
              hintLine,
              { drawSVG: "0% 0%" },
              {
                drawSVG: "0% 100%",
                duration: 1.1,
                repeat: -1,
                repeatDelay: 0.35,
                yoyo: true,
                ease: "power2.inOut",
              },
              1.4
            );
          }
        }
      }

      /* ----------------------------- 2. dive ----------------------------- */
      // A Hero fica pinada durante o mergulho — sem isso a distancia de
      // scroll da transicao (diveEnd) e consumida pela propria altura da
      // Hero (100svh) e o usuario cai direto na Chronicle antes de ver
      // qualquer coisa. O pin devolve esse espaco (pinSpacing) sem esconder
      // a Hero: ela continua real e visivel por baixo da placa, so nao
      // avanca no documento enquanto o buraco cresce.
      let navRevealed = false;

      const diveTl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: diveEnd,
          scrub: isReduced ? true : 0.7,
          pin: hero,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // Os loops infinitos (halo, hint-line) nao precisam rodar depois
          // que a transicao ja passou nem antes dela comecar — `intro`
          // (entrada de uma vez so) nunca e tocada aqui, de proposito.
          onLeave: () => loops.pause(),
          onEnterBack: () => loops.resume(),
          // A Nav usa a label `navReveal` (fim do conteudo, antes da
          // travadinha) como referencia — nao o fim do pino inteiro.
          onUpdate: (self) => {
            const revealed = self.progress >= navRevealProgress;
            if (revealed !== navRevealed) {
              navRevealed = revealed;
              syncNav(revealed, true);
            }
          },
          onRefresh: (self) => {
            navRevealed = self.progress >= navRevealProgress;
            syncNav(navRevealed, false);
          },
        },
        defaults: { ease: "none" },
      });

      diveTl
        // a interface de abertura sai primeiro
        .to(hudText, { opacity: 0, yPercent: -60, duration: 0.5, ease: EASE.cine }, 0)
        .to(scrollHint, { opacity: 0, yPercent: 60, duration: 0.4, ease: EASE.cine }, 0)
        .to(reticle, { opacity: 0, duration: 0.5, ease: EASE.cine }, 0)

        // o morcego mergulha: o buraco cresce ate engolir a viewport inteira
        .to(
          glyphScale,
          { scale: holeEnd, svgOrigin: BAT_ORIGIN, duration: 2.2, ease: EASE.cineIn },
          0.1
        )
        // o sinal (o brilho visto no repouso) se apaga cedo, para o recorte
        // revelar a Hero de verdade por baixo, nao o proprio brilho sintetico
        .to(signal, { opacity: 0, duration: 0.7, ease: EASE.shutter }, 0.3)
        .set(glyph, { opacity: 0, immediateRender: false }, 2.3)

        // a Hero revela na mesma janela, atraves do proprio recorte
        .fromTo(
          portrait,
          { opacity: 0, scale: 1.14, xPercent: isMobile ? 0 : 4 },
          { opacity: 1, scale: 1, xPercent: 0, duration: 1.8 },
          0.15
        )
        .fromTo(eyebrow, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.25)
        .add(
          revealChars(title, {
            bin: splits,
            stagger: isMobile ? 0.018 : 0.024,
            duration: isReduced ? 0.3 : 1.1,
          }),
          0.35
        )
        .fromTo(subtitle, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.9)
        .add(revealLines(subtitle, { bin: splits, stagger: 0.06, duration: 0.9 }), 0.9)
        .fromTo(cta, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.6 }, 1.3)
        .from(meta, { opacity: 0, y: 14, stagger: 0.1, duration: 0.5 }, 1.6)
        // o morcego some de vez em 2.3 (mesmo tempo do .set acima) — e ali,
        // nao antes, que a Nav deve aparecer.
        .addLabel("navReveal", 2.3)
        // travadinha: trecho morto no fim da timeline. O conteudo ja
        // terminou de revelar, mas o pino ainda segura a Hero por mais um
        // tanto de scroll — da um instante de pausa antes de soltar pra
        // Chronicle, em vez de emendar a saida do morcego direto no proximo
        // scroll do usuario.
        .to({}, { duration: 1 });

      const navRevealProgress = diveTl.labels.navReveal / diveTl.duration();

      return () => {
        intro.kill();
        loops.kill();
        revertSplits(splits);
      };
    }
  );

  return () => {
    mm.revert();
  };
}
