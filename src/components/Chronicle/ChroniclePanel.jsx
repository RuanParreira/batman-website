/**
 * Painel de capitulo. Imagem e texto vivem em colunas independentes para que
 * possam receber velocidades de parallax diferentes (ScrollSmoother effects)
 * sem que uma transform interfira na outra.
 */
export function ChroniclePanel({ chapter, index }) {
  const flip = chapter.align === "right";

  return (
    <article
      data-chapter="root"
      className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16"
    >
      {/* -------------------- imagem -------------------- */}
      <div
        className={[
          "lg:col-span-7",
          flip ? "lg:order-2 lg:col-start-6" : "lg:order-1",
        ].join(" ")}
        data-speed={flip ? "0.92" : "0.96"}
      >
        <figure
          data-chapter="frame"
          /* Altura fixa (nao aspect-ratio): a coluna da imagem ocupa 58% da
             largura, entao uma foto em retrato com aspect-ratio ficaria com
             altura = 1.5x a largura — uma caixa enorme, desproporcional ao
             texto ao lado e inconsistente de capitulo pra capitulo (cada
             foto original tem uma proporcao diferente). Altura fixa da o
             mesmo ritmo pra todos, e o crop (object-position) cuida de
             enquadrar o assunto certo de cada imagem dentro dela.
          */
          className="relative w-full overflow-hidden bg-ink aspect-4/5 lg:aspect-auto lg:h-[64vh]"
        >
          <img
            data-chapter="image"
            src={chapter.image}
            alt={chapter.alt}
            loading="lazy"
            decoding="async"
            draggable="false"
            className="h-full w-full object-cover"
            style={{ objectPosition: chapter.objectPosition ?? "50% 50%" }}
          />
          <div
            className="layer"
            style={{
              background:
                "linear-gradient(180deg, rgba(4,5,10,0.28) 0%, rgba(4,5,10,0) 40%, rgba(4,5,10,0.62) 100%)",
            }}
          />
          <div className="layer grain" />
          <figcaption className="label absolute bottom-4 left-4 text-bone/60">
            Arquivo {chapter.id}
          </figcaption>
        </figure>
      </div>

      {/* -------------------- texto --------------------- */}
      <div
        className={[
          "lg:col-span-5",
          flip ? "lg:order-1 lg:col-start-1 lg:row-start-1" : "lg:order-2",
        ].join(" ")}
        data-speed={flip ? "1.06" : "1.1"}
      >
        <p data-chapter="index" className="display mb-6 text-[clamp(3rem,7vw,5.5rem)] text-smoke">
          {chapter.id}
        </p>
        <h3
          data-chapter="title"
          className="display mb-6 text-[clamp(2rem,4.6vw,3.6rem)] text-bone"
        >
          {chapter.title}
        </h3>
        <p data-chapter="body" className="max-w-[42ch] text-base leading-relaxed text-fog">
          {chapter.body}
        </p>

        <div
          data-chapter="rule"
          className="mt-10 h-px w-full origin-left bg-gradient-to-r from-blood via-blood/30 to-transparent"
          aria-hidden="true"
        />
        <span className="sr-only">Capítulo {index + 1}</span>
      </div>
    </article>
  );
}
