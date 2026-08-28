import { gsap, EASE } from "../lib/gsap";
import { revealChars, revealLines, revertSplits } from "./text";

/**
 * Narrativa por scroll.
 *
 * Regra da secao: nada aparece de uma vez. Cada painel tem tres velocidades
 * diferentes (moldura, imagem interna, bloco de texto), o que produz a
 * sensacao de descoberta em profundidade sem nenhum efeito adicional.
 * O parallax macro fica por conta dos data-speed do ScrollSmoother; aqui
 * tratamos apenas das revelacoes.
 */
export function createChronicleAnimation(root, { tier = "high" } = {}) {
  const q = gsap.utils.selector(root);
  const splits = [];
  const mm = gsap.matchMedia();

  mm.add(
    {
      isMobile: "(max-width: 767px)",
      isDesktop: "(min-width: 768px)",
      isReduced: "(prefers-reduced-motion: reduce)",
    },
    (context) => {
      const { isMobile, isReduced } = context.conditions;
      const softFocus = tier !== "low" && !isReduced;

      const header = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top 72%", once: true },
      });

      header
        .from(q('[data-chronicle="label"]'), { opacity: 0, x: -18, duration: 1 })
        .add(
          revealChars(q('[data-chronicle="title"]')[0], {
            bin: splits,
            stagger: isMobile ? 0.018 : 0.024,
          }),
          0.1
        )
        .add(revealLines(q('[data-chronicle="lead"]')[0], { bin: splits }), 0.55);

      /* --------------------------- capitulos --------------------------- */
      q('[data-chapter="root"]').forEach((panel) => {
        const p = gsap.utils.selector(panel);
        const frame = p('[data-chapter="frame"]')[0];
        const image = p('[data-chapter="image"]')[0];

        gsap
          .timeline({
            scrollTrigger: { trigger: panel, start: "top 78%", once: true },
            defaults: { ease: EASE.cine },
          })
          .fromTo(
            frame,
            { clipPath: "inset(0% 0% 100% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5 },
            0
          )
          .fromTo(
            image,
            { scale: 1.24, filter: softFocus ? "blur(8px)" : "none" },
            { scale: 1, filter: "blur(0px)", duration: 2, clearProps: "filter" },
            0
          )
          .from(p('[data-chapter="index"]'), { opacity: 0, y: 28, duration: 1.2 }, 0.15)
          .add(revealChars(p('[data-chapter="title"]')[0], { bin: splits, stagger: 0.02 }), 0.25)
          .add(revealLines(p('[data-chapter="body"]')[0], { bin: splits }), 0.5)
          .from(p('[data-chapter="rule"]'), { scaleX: 0, duration: 1.4 }, 0.6);

        if (!isReduced) {
          // deriva interna: a imagem anda dentro da propria moldura
          gsap.fromTo(
            image,
            { yPercent: -5 },
            {
              yPercent: 5,
              ease: "none",
              scrollTrigger: {
                trigger: panel,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
              },
            }
          );
        }
      });

      /* ------------------------ faixa de citacao ----------------------- */
      const band = q('[data-chronicle="quote-band"]')[0];

      gsap
        .timeline({ scrollTrigger: { trigger: band, start: "top 68%", once: true } })
        .add(
          revealChars(q('[data-chronicle="quote"]')[0], {
            bin: splits,
            stagger: isMobile ? 0.016 : 0.022,
          })
        )
        .from(q('[data-chronicle="quote-cite"]'), { opacity: 0, y: 18, duration: 1 }, 0.6);

      if (!isReduced) {
        gsap.fromTo(
          q('[data-chronicle="quote-image"]'),
          { scale: 1.18, yPercent: -6 },
          {
            scale: 1.02,
            yPercent: 6,
            ease: "none",
            scrollTrigger: {
              trigger: band,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          }
        );
      }

      return undefined;
    }
  );

  return () => {
    mm.revert();
    revertSplits(splits);
  };
}
