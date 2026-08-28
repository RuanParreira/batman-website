import { gsap, EASE } from "../lib/gsap";
import { revealChars, revealLines, revertSplits } from "./text";

/**
 * Dossie.
 *
 * Ordem de leitura deliberada: titulo -> retrato -> texto -> ficha ->
 * atributos. As barras entram por ultimo e com stagger longo, porque sao o
 * unico elemento quantitativo da pagina e ganham peso ao chegar sozinhas.
 */
export function createAboutAnimation(root) {
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

      const frame = q('[data-about="frame"]')[0];
      const image = q('[data-about="image"]')[0];
      const bars = q('[data-about="bar"]');

      gsap
        .timeline({
          scrollTrigger: { trigger: root, start: "top 74%", once: true },
          defaults: { ease: EASE.cine },
        })
        .from(q('[data-about="label"]'), { opacity: 0, x: -18, duration: 1 }, 0)
        .add(
          revealChars(q('[data-about="title"]')[0], {
            bin: splits,
            stagger: isMobile ? 0.018 : 0.024,
          }),
          0.05
        )
        .fromTo(
          frame,
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5 },
          0.25
        )
        .fromTo(
          image,
          { scale: 1.2 },
          { scale: 1, duration: 2.1 },
          0.25
        )
        .add(
          revealLines(q('[data-about="paragraph"]')[0], { bin: splits }),
          0.5
        )
        .add(
          revealLines(q('[data-about="paragraph"]')[1], { bin: splits }),
          0.7
        )
        .from(
          q('[data-about="identity-row"]'),
          { opacity: 0, y: 16, stagger: 0.08, duration: 1 },
          0.85
        )
        .from(
          q('[data-about="attribute"]'),
          { opacity: 0, y: 16, stagger: 0.1, duration: 1 },
          1.05
        )
        .fromTo(
          bars,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: isReduced ? 0.3 : 1.6,
            stagger: 0.12,
            ease: "power3.out",
          },
          1.15
        );

      if (!isReduced) {
        gsap.fromTo(
          image,
          { yPercent: -4 },
          {
            yPercent: 4,
            ease: "none",
            scrollTrigger: {
              trigger: root,
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
