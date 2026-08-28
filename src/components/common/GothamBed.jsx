/**
 * "Cama visual" de Gotham.
 *
 * A MESMA composicao e usada como fundo da Opening (atras da janela do
 * simbolo) e como fundo da Hero. Isso e o que torna a transicao continua:
 * ao final da abertura o usuario ja esta olhando exatamente para o fundo da
 * Hero, so que ainda emoldurado pelo simbolo.
 *
 * Cada camada carrega um data-attribute para ser alvo de parallax.
 */
export function GothamBed({ className = "", intensity = 1 }) {
  return (
    <div className={`layer overflow-hidden ${className}`} data-bed="root" aria-hidden="true">
      {/* Profundidade 3 — brasa distante */}
      <div
        className="layer"
        data-bed="glow"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 42%, rgba(225,16,33,0.30) 0%, rgba(109,9,18,0.16) 38%, rgba(4,5,10,0) 72%)",
          opacity: 0.9 * intensity,
        }}
      />

      {/* Profundidade 2 — textura de cidade / chuva vermelha */}
      <div
        className="layer bg-cover bg-center"
        data-bed="texture"
        style={{
          backgroundImage: "url('/imgs/foto10.jpg')",
          opacity: 0.24 * intensity,
          filter: "blur(6px) saturate(0.8) contrast(1.25)",
          transform: "scale(1.2)",
        }}
      />

      {/* Profundidade 1 — chuva em movimento */}
      <div
        className="layer"
        data-bed="rain"
        style={{
          backgroundImage:
            "repeating-linear-gradient(101deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 9px)",
          opacity: 0.22 * intensity,
          transform: "scale(1.4)",
        }}
      />

      {/* Assentamento tonal — puxa tudo para o preto */}
      <div
        className="layer"
        style={{
          background:
            "linear-gradient(180deg, rgba(4,5,10,0.92) 0%, rgba(4,5,10,0.30) 34%, rgba(4,5,10,0.55) 72%, var(--color-void) 100%)",
        }}
      />

      <div className="layer vignette" />
      <div className="layer grain" />
    </div>
  );
}
