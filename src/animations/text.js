import { gsap, SplitText, EASE } from "../lib/gsap";

/**
 * Helpers tipograficos compartilhados.
 * Todos retornam uma timeline (nao auto-play quando `paused`), e registram
 * o SplitText no array `bin` para revert no cleanup do gsap.context().
 */

const collect = (bin, split) => {
  if (bin) bin.push(split);
  return split;
};

/** Alvo ausente ou split vazio nao deve poluir o console nem quebrar a timeline. */
const noop = () => gsap.to({}, { duration: 0 });

/**
 * Revelacao por linha, com mascara. Direcao cinematografica padrao do site.
 */
export function revealLines(target, { bin, stagger = 0.09, duration = 1.15, delay = 0, blur = true } = {}) {
  if (!target) return noop();

  const split = collect(
    bin,
    SplitText.create(target, {
      type: "lines",
      mask: "lines",
      linesClass: "split-line",
    })
  );

  return gsap.fromTo(
    split.lines,
    {
      yPercent: 118,
      opacity: 0,
      filter: blur ? "blur(9px)" : "none",
    },
    {
      yPercent: 0,
      opacity: 1,
      filter: "blur(0px)",
      duration,
      delay,
      stagger,
      ease: EASE.cine,
      // Limpa filter e transform residuais: blur(0px) e translate(0,0)
      // mantem uma camada composta viva por linha e ja provocaram falha de
      // pintura dentro do overflow:clip da mascara do SplitText.
      clearProps: "filter,transform",
    }
  );
}

/**
 * Titulo display: caractere a caractere, subindo de dentro de uma mascara,
 * com leve escala e desfoque. Usado apenas em H1/H2 grandes.
 */
export function revealChars(target, { bin, stagger = 0.028, duration = 1.3, delay = 0, from = {} } = {}) {
  if (!target) return noop();

  const split = collect(
    bin,
    SplitText.create(target, {
      type: "chars,words,lines",
      mask: "lines",
      linesClass: "split-line",
    })
  );

  return gsap.fromTo(
    split.chars,
    {
      yPercent: 106,
      opacity: 0,
      scaleY: 1.24,
      filter: "blur(14px)",
      transformOrigin: "50% 100%",
      ...from,
    },
    {
      yPercent: 0,
      opacity: 1,
      scaleY: 1,
      filter: "blur(0px)",
      duration,
      delay,
      stagger: { each: stagger, from: "start" },
      ease: EASE.cine,
      clearProps: "filter,transform",
    }
  );
}

/**
 * Revelacao por palavra — mais contida, para subtitulos e citacoes.
 */
export function revealWords(target, { bin, stagger = 0.05, duration = 1, delay = 0 } = {}) {
  if (!target) return noop();

  const split = collect(
    bin,
    SplitText.create(target, {
      type: "words,lines",
      mask: "lines",
      linesClass: "split-line",
    })
  );

  return gsap.fromTo(
    split.words,
    { yPercent: 100, opacity: 0 },
    { yPercent: 0, opacity: 1, duration, delay, stagger, ease: EASE.cine }
  );
}

/** Revert de todos os SplitText criados dentro de um escopo. */
export function revertSplits(bin) {
  bin.forEach((split) => split.revert());
  bin.length = 0;
}
