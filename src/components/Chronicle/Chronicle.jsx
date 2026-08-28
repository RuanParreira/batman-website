import { useRef } from "react";
import { useGSAP } from "../../lib/gsap";
import { ChroniclePanel } from "./ChroniclePanel";
import { CHAPTERS } from "./chapters";
import { createChronicleAnimation } from "../../animations/chronicleAnimation";
import { asset } from "../../lib/asset";

export function Chronicle({ ready, tier }) {
  const root = useRef(null);

  useGSAP(
    () => {
      if (!ready) return undefined;
      return createChronicleAnimation(root.current, { tier });
    },
    { scope: root, dependencies: [ready, tier], revertOnUpdate: true }
  );

  return (
    <section
      id="chronicle"
      ref={root}
      className="relative w-full bg-void"
      data-section="chronicle"
    >
      {/* transicao de fundo ao longo da secao */}
      <div
        data-chronicle="wash"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(4,5,10,1) 0%, rgba(45,4,9,0.55) 42%, rgba(4,5,10,1) 100%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-16">
        {/* abertura da secao: muito espaco negativo */}
        <header className="grid min-h-[70svh] grid-cols-1 items-end gap-8 pt-[18vh] pb-[14vh] lg:min-h-[86svh] lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p data-chronicle="label" className="label mb-8 text-blood">
              A crônica
            </p>
            <h2
              data-chronicle="title"
              className="display text-[clamp(2.6rem,8.4vw,7.6rem)] text-bone"
            >
              Gotham não precisa de um herói
            </h2>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <p
              data-chronicle="lead"
              className="max-w-[38ch] text-base leading-relaxed text-fog"
            >
              Precisa de alguém disposto a ficar acordado. A história a seguir é
              contada em fragmentos — cada rolagem revela uma página do arquivo.
            </p>
          </div>
        </header>

        {/* capítulos */}
        <div className="flex flex-col gap-[16vh] pb-[18vh] lg:gap-[26vh]">
          {CHAPTERS.map((chapter, index) => (
            <ChroniclePanel key={chapter.id} chapter={chapter} index={index} />
          ))}
        </div>
      </div>

      {/* faixa de citação full-bleed */}
      <div
        data-chronicle="quote-band"
        className="relative flex min-h-[80svh] w-full items-center overflow-hidden"
      >
        <img
          data-chronicle="quote-image"
          src={asset("/imgs/foto6.jpg")}
          alt="Batman de costas diante de um letreiro monumental"
          loading="lazy"
          decoding="async"
          draggable="false"
          className="layer h-full w-full object-cover opacity-45"
        />
        <div
          className="layer"
          style={{
            background:
              "linear-gradient(180deg, var(--color-void) 0%, rgba(4,5,10,0.35) 42%, var(--color-void) 100%)",
          }}
        />
        <div className="layer vignette" />

        <blockquote className="relative mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-16">
          <p
            data-chronicle="quote"
            className="display max-w-[16ch] text-[clamp(2.2rem,6.4vw,5.6rem)] text-bone"
          >
            Eles pensam que estou escondido nas sombras
          </p>
          <cite
            data-chronicle="quote-cite"
            className="label mt-8 block text-gold not-italic"
          >
            Registro pessoal — noite 731
          </cite>
        </blockquote>
      </div>
    </section>
  );
}
