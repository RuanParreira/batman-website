import { gsap, ScrollTrigger, EASE } from "../lib/gsap";
import { revealChars, revertSplits } from "./text";
import { garageScroll } from "../components/Garage/garageStore";

/**
 * Garagem: o scroll e o unico controlador da camera 3D.
 *
 * O scrub NAO chama setState — escreve em `garageScroll.progress`, um objeto
 * mutavel lido pelo useFrame do R3F. Isso mantem um unico loop de render e
 * zero re-renders do React durante a rolagem.
 *
 * O mesmo trigger liga/desliga o frameloop do WebGL via `onActiveChange`,
 * entao a GPU fica ociosa enquanto a secao esta fora da viewport.
 */
export function createGarageAnimation(root, { onActiveChange } = {}) {
  const q = gsap.utils.selector(root);
  const splits = [];
  const mm = gsap.matchMedia();

  const stage = q('[data-garage="stage"]')[0];
  const progressRing = q('[data-garage="progress"]')[0];
  const hudTargets = [
    q('[data-garage="label"]')[0],
    q('[data-garage="specs"]')[0],
    q('[data-garage="picker"]')[0],
  ].filter(Boolean);

  // O seletor continua clicavel durante todo o percurso — nao entra no fade.
  const fadeTargets = [
    q('[data-garage="label"]')[0],
    q('[data-garage="title"]')[0],
  ].filter(Boolean);

  mm.add(
    {
      isMobile: "(max-width: 767px)",
      isDesktop: "(min-width: 768px)",
      isReduced: "(prefers-reduced-motion: reduce)",
    },
    (context) => {
      const { isMobile, isReduced } = context.conditions;

      // A orbita da camera e OrbitControls (arrasto do usuario), nao scroll —
      // o pin so precisa segurar a secao o suficiente pro anel de progresso e
      // o fade do HUD acontecerem, sem forcar um scroll longo sem payoff.
      const travel = isMobile ? "+=40%" : "+=60%";

      gsap.set(progressRing, { drawSVG: "0%" });

      /* ------------------- entrada da interface ------------------- */
      const enter = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top 62%", once: true },
        defaults: { ease: EASE.cine },
      });

      enter
        .add(revealChars(q('[data-garage="title"]')[0], { bin: splits, stagger: 0.026 }))
        .from(hudTargets, { opacity: 0, y: 22, stagger: 0.1, duration: 1.1 }, 0.2);

      /* ------------------ scroll -> camera 3D --------------------- */
      const drive = ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: travel,
        pin: stage,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: isReduced ? true : 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          garageScroll.progress = self.progress;
          if (progressRing) {
            gsap.set(progressRing, { drawSVG: `0% ${self.progress * 100}%` });
          }
        },
        onToggle: (self) => {
          garageScroll.active = self.isActive;
          onActiveChange?.(self.isActive);
        },
      });

      // O canvas precisa renderizar tambem enquanto a secao esta apenas
      // proxima, senao o primeiro frame aparece preto no momento do pin.
      const warmup = ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          garageScroll.active = self.isActive;
          onActiveChange?.(self.isActive);
        },
      });

      /* --------------- reacao do HUD ao avanco da camera ---------- */
      if (!isReduced) {
        gsap.to(fadeTargets, {
          opacity: 0.75,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: travel,
            scrub: 0.6,
          },
        });
      }

      return () => {
        drive.kill();
        warmup.kill();
        garageScroll.active = false;
        garageScroll.progress = 0;
      };
    }
  );

  return () => {
    mm.revert();
    revertSplits(splits);
  };
}
