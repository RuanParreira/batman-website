import { useRef } from "react";
import { useGSAP } from "../../lib/gsap";
import { asset } from "../../lib/asset";
import { ATTRIBUTES, IDENTITY, PARAGRAPHS } from "./dossier";
import { createAboutAnimation } from "../../animations/aboutAnimation";

/**
 * Dossie — a seccao "sobre".
 *
 * Fecha a Cronica: depois de tres fragmentos de narrativa o leitor quer saber
 * de quem se trata. Aqui o tom muda de cinema para arquivo: retrato de
 * ficha, tabela de identidade e barras de atributo. E o unico momento da
 * pagina com leitura tabular — o contraste com o resto e proposital.
 *
 * Arte: `foto8.jpg` — o unico retrato em formato paisagem com o personagem
 * de perfil e a marca ao fundo desfocada, o que sustenta um recorte alto e
 * estreito sem cortar o rosto.
 */
export function About({ ready }) {
  const root = useRef(null);

  useGSAP(
    () => {
      if (!ready) return undefined;
      return createAboutAnimation(root.current);
    },
    { scope: root, dependencies: [ready], revertOnUpdate: true }
  );

  return (
    <section
      id="about"
      ref={root}
      className="relative w-full overflow-hidden bg-void py-[14vh] lg:py-[20vh]"
      data-section="about"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(52% 44% at 78% 32%, rgba(225,16,33,0.16) 0%, rgba(4,5,10,0) 72%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-16">
        {/* ------------------------- cabeçalho ------------------------- */}
        <header className="mb-[10vh] max-w-[min(92vw,880px)]">
          <p data-about="label" className="label mb-6 text-blood">
            05 — Dossiê
          </p>
          <h2
            data-about="title"
            className="display text-[clamp(2.6rem,11vw,6.4rem)] text-bone"
          >
            Quem veste a máscara
          </h2>
        </header>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* ------------------------ retrato ------------------------ */}
          <div className="lg:col-span-5" data-speed="0.94">
            <figure
              data-about="frame"
              className="relative aspect-[3/4] w-full overflow-hidden bg-ink"
            >
              <img
                data-about="image"
                src={asset("/imgs/foto8.jpg")}
                alt="Batman de perfil diante do letreiro"
                loading="lazy"
                decoding="async"
                draggable="false"
                className="h-full w-full object-cover"
                style={{ objectPosition: "60% 46%" }}
              />
              <div
                className="layer"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(4,5,10,0.35) 0%, rgba(4,5,10,0) 38%, rgba(4,5,10,0.78) 100%)",
                }}
              />
              <div className="layer grain" />

              {/* moldura de ficha */}
              <div className="layer p-4" aria-hidden="true">
                <div className="h-full w-full border border-bone/15" />
              </div>

              <figcaption className="label absolute bottom-5 left-5 text-bone/70">
                Sujeito — Registro 00
              </figcaption>
            </figure>
          </div>

          {/* ------------------------- corpo ------------------------- */}
          <div className="lg:col-span-6 lg:col-start-7" data-speed="1.06">
            <div className="flex flex-col gap-6">
              {PARAGRAPHS.map((text, index) => (
                <p
                  key={text.slice(0, 24)}
                  data-about="paragraph"
                  className={`max-w-[46ch] leading-relaxed ${
                    index === 0 ? "text-lg text-bone sm:text-xl" : "text-base text-fog"
                  }`}
                >
                  {text}
                </p>
              ))}
            </div>

            {/* ------------------ tabela de identidade ------------------ */}
            <dl
              data-about="identity"
              className="mt-12 grid grid-cols-1 gap-x-10 gap-y-4 border-t border-smoke/70 pt-6 sm:grid-cols-2"
            >
              {IDENTITY.map(([term, value]) => (
                <div key={term} data-about="identity-row" className="flex flex-col gap-1">
                  <dt className="label">{term}</dt>
                  <dd className="text-sm text-bone">{value}</dd>
                </div>
              ))}
            </dl>

            {/* -------------------- barras de atributo ------------------- */}
            <div data-about="attributes" className="mt-12 flex flex-col gap-5">
              {ATTRIBUTES.map((attribute) => (
                <div key={attribute.label} data-about="attribute">
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="label text-bone/80">{attribute.label}</span>
                    <span className="font-mono text-xs text-gold">
                      {attribute.value}
                    </span>
                  </div>
                  <div className="relative h-px w-full bg-smoke/80">
                    <span
                      data-about="bar"
                      data-value={attribute.value}
                      className="absolute inset-y-0 left-0 block origin-left bg-blood"
                      style={{ width: `${attribute.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
