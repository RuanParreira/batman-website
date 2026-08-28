import { gsap } from "../lib/gsap";

/**
 * Hero.
 *
 * A entrada (materializacao do morcego + revelacao do titulo/retrato/CTA)
 * acontece na Opening, scrubbed junto do mergulho do morcego — ver
 * `createOpeningAnimation`. Quando o pino da abertura solta, a Hero ja esta
 * pronta: aqui so sobra a saida, um parallax scrubbed enquanto a Hero rola
 * para fora — o retrato sobe devagar, a tipografia sobe rapido e desfoca.
 */
export function createHeroAnimation(root, { tier = "high" } = {}) {
  const q = gsap.utils.selector(root);
  const mm = gsap.matchMedia();

  const eyebrow = q('[data-hero="eyebrow"]')[0];
  const title = q('[data-hero="title"]')[0];
  const subtitle = q('[data-hero="subtitle"]')[0];
  const cta = q('[data-hero="cta"]')[0];
  const portrait = q('[data-hero="portrait"]')[0];
  const glow = q('[data-bed="glow"]')[0];

  const softFocus = tier !== "low";

  mm.add(
    { isReduced: "(prefers-reduced-motion: reduce)" },
    (context) => {
      const { isReduced } = context.conditions;

      if (isReduced) return undefined;

      const exit = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom top",
          scrub: 0.9,
          invalidateOnRefresh: true,
        },
        defaults: { ease: "none" },
      });

      exit
        .to(
          [eyebrow, title, subtitle, cta],
          {
            yPercent: -34,
            opacity: 0,
            filter: softFocus ? "blur(10px)" : "none",
            stagger: 0.03,
          },
          0
        )
        .to(portrait, { yPercent: -12, scale: 1.08 }, 0)
        .to(glow, { opacity: 0.25 }, 0);

      return undefined;
    }
  );

  return () => {
    mm.revert();
  };
}
