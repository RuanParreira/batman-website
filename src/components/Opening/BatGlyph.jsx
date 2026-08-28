import { BAT_PATH, BAT_VIEWBOX } from "./batPath";

/**
 * O simbolo do primeiro beat: uma placa preta com um recorte na forma do
 * morcego — o fundo so aparece por dentro do recorte, como um holofote. Atras
 * da placa, exatamente na area do recorte, um brilho vermelho da o "sinal" —
 * sem ele o recorte so mostraria a cama de Gotham, escura demais para
 * contrastar com a placa preta. Um segundo brilho, desfocado, contorna a
 * borda do buraco e sangra para o preto ao redor.
 *
 * O retangulo da placa vaza bem alem do viewBox (`overflow: visible`) e e
 * recortado pelo `overflow-hidden` do palco — assim cobre a viewport inteira
 * independente da proporcao da tela.
 */
export function BatGlyph({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox={BAT_VIEWBOX}
      style={{ overflow: "visible" }}
      aria-hidden="true"
      data-opening="glyph"
    >
      <defs>
        <mask
          id="bat-hole"
          maskUnits="userSpaceOnUse"
          x="-6000"
          y="-6000"
          width="14000"
          height="14000"
        >
          <rect x="-6000" y="-6000" width="14000" height="14000" fill="#fff" />
          <path d={BAT_PATH} fill="#000" />
        </mask>

        <radialGradient id="bat-signal" cx="50%" cy="52%" r="62%">
          <stop offset="0%" stopColor="#ffd9c2" />
          <stop offset="18%" stopColor="#ff6a4d" />
          <stop offset="46%" stopColor="var(--color-blood)" />
          <stop offset="100%" stopColor="#5c0710" />
        </radialGradient>

        {/* Dois raios de desfoque (estreito + largo) em vez de duplicar o
            mesmo blur: o path e um poligono (marching squares), nao uma
            curva — um unico blur pesado sobre os vertices produz uma borda
            irregular e "derretida". Duas camadas suaves compõem um brilho
            gradual; a definicao real vem do traco nitido por cima. */}
        <filter id="bat-bloom" x="-60%" y="-220%" width="220%" height="540%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="20" result="wide" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="soft" />
          <feMerge>
            <feMergeNode in="wide" />
            <feMergeNode in="soft" />
          </feMerge>
        </filter>
      </defs>

      <g data-opening="glyph-scale">
        {/* sinal — o brilho que da o "fundo" visto atraves do recorte no
            repouso; some no mergulho para o recorte revelar a cena real */}
        <path data-opening="glyph-signal" d={BAT_PATH} fill="url(#bat-signal)" />
        <rect
          x="-6000"
          y="-6000"
          width="14000"
          height="14000"
          fill="var(--color-void)"
          mask="url(#bat-hole)"
        />
        {/* halo — brilho largo e suave, atras da linha, que sangra para o
            preto ao redor do recorte. strokeLinejoin/Linecap="round" evita
            o serrilhado do blur nos vertices do poligono. */}
        <path
          data-opening="glyph-halo"
          d={BAT_PATH}
          fill="none"
          stroke="var(--color-blood)"
          strokeWidth="7"
          strokeLinejoin="round"
          strokeLinecap="round"
          filter="url(#bat-bloom)"
          opacity="0.6"
        />
        {/* nucleo — linha fina e nitida por cima do brilho, da a borda a
            definicao que o blur sozinho nao entrega. */}
        <path
          data-opening="glyph-core"
          d={BAT_PATH}
          fill="none"
          stroke="var(--color-ember)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity="0.85"
        />
      </g>
    </svg>
  );
}
