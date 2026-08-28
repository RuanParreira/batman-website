/**
 * Reticula de HUD da abertura: cantos e crosshair.
 *
 * Os cantos sao quatro SVGs pequenos ancorados por CSS, nao um SVG unico
 * escalado. Com o simbolo ocupando quase toda a viewport, uma reticula presa
 * a um viewBox quadrado cairia por dentro do morcego em telas largas — aqui
 * ela emoldura a tela em qualquer proporcao.
 *
 * Todos os tracos sao alvos de DrawSVG.
 */
const CORNERS = [
  { className: "top-5 left-5 sm:top-9 sm:left-9", d: "M0 34 L0 0 L34 0" },
  { className: "top-5 right-5 sm:top-9 sm:right-9", d: "M34 34 L34 0 L0 0" },
  { className: "bottom-5 left-5 sm:bottom-9 sm:left-9", d: "M0 0 L0 34 L34 34" },
  { className: "right-5 bottom-5 sm:right-9 sm:bottom-9", d: "M34 0 L34 34 L0 34" },
];

export function OpeningHud() {
  return (
    <div className="layer" data-opening="reticle">
      <div data-opening="reticle-scale" className="absolute inset-0">
        {CORNERS.map((corner) => (
          <svg
            key={corner.className}
            width="34"
            height="34"
            viewBox="0 0 34 34"
            className={`absolute ${corner.className}`}
            aria-hidden="true"
          >
            <path
              data-draw
              d={corner.d}
              fill="none"
              stroke="var(--color-blood)"
              strokeWidth="1.4"
            />
          </svg>
        ))}

        <svg
          width="42"
          height="42"
          viewBox="0 0 42 42"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          aria-hidden="true"
        >
          <g fill="none" stroke="var(--color-gold)" strokeWidth="1" opacity="0.6">
            <path data-draw d="M21 0 L21 12" />
            <path data-draw d="M21 42 L21 30" />
            <path data-draw d="M0 21 L12 21" />
            <path data-draw d="M42 21 L30 21" />
          </g>
        </svg>
      </div>
    </div>
  );
}
