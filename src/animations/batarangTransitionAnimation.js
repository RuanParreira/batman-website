import { gsap, ScrollTrigger } from "../lib/gsap";
import {
  batarangScroll,
  EDGE_OVERSHOOT,
} from "../components/Transition/batarangTransitionStore";

/**
 * Corte Cronica -> Dossie: o batarang atravessa a tela girando enquanto a
 * imagem de fundo troca (clip-path acompanhando a posicao dele na tela).
 * Mesmo principio da Garagem: o scrub escreve em `batarangScroll.progress`
 * (lido pelo useFrame do R3F) em vez de setState, e o mesmo trigger
 * liga/desliga o frameloop do canvas.
 *
 * O wipe NAO usa `self.progress` bruto: o batarang nasce e morre fora da
 * tela (ver `EDGE_OVERSHOOT` em `BatarangScene`), entao o progresso do
 * scroll e a posicao dele na tela sao curvas diferentes. `screenX()`
 * reproduz exatamente a mesma formula usada no R3F pra achar a fracao de
 * tela onde o batarang esta AGORA — e o wipe corta ali, nao num ritmo
 * proprio. Sem isso o corte e o batarang ficam fora de sincronia.
 *
 * `prefers-reduced-motion`: sem pin e sem 3D — vira um crossfade simples ao
 * longo do scroll normal (o R3F nem chega a montar; ver `BatarangTransition`).
 */
function screenX(t) {
  const reveal = (1 + EDGE_OVERSHOOT) * (t - 0.5) + 0.5;
  return gsap.utils.clamp(0, 1, reveal);
}
export function createBatarangTransitionAnimation(root, { onActiveChange } = {}) {
  const q = gsap.utils.selector(root);
  const mm = gsap.matchMedia();

  const stage = q('[data-batarang="stage"]')[0];
  const incoming = q('[data-batarang="incoming"]')[0];
  const outgoing = q('[data-batarang="outgoing"]')[0];

  mm.add(
    {
      isMobile: "(max-width: 767px)",
      isDesktop: "(min-width: 768px)",
      isReduced: "(prefers-reduced-motion: reduce)",
    },
    (context) => {
      const { isMobile, isReduced } = context.conditions;

      if (isReduced) {
        gsap.fromTo(
          incoming,
          { clipPath: "inset(0% 100% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",
            scrollTrigger: { trigger: root, start: "top 70%", end: "bottom 60%", scrub: true },
          }
        );
        gsap.to(outgoing, {
          opacity: 0,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top 70%", end: "bottom 60%", scrub: true },
        });
        return undefined;
      }

      const travel = isMobile ? "+=100%" : "+=140%";

      const drive = ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: travel,
        pin: stage,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          batarangScroll.progress = self.progress;
          const reveal = screenX(self.progress);
          gsap.set(incoming, { clipPath: `inset(0% ${100 - reveal * 100}% 0% 0%)` });
          gsap.set(outgoing, { opacity: 1 - reveal });
        },
        onToggle: (self) => {
          batarangScroll.active = self.isActive;
          onActiveChange?.(self.isActive);
        },
      });

      const warmup = ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          batarangScroll.active = self.isActive;
          onActiveChange?.(self.isActive);
        },
      });

      return () => {
        drive.kill();
        warmup.kill();
        batarangScroll.active = false;
        batarangScroll.progress = 0;
      };
    }
  );

  return () => {
    mm.revert();
  };
}
