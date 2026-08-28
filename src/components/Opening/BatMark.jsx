import { BAT_PATH, BAT_VIEWBOX } from "./batPath";

/**
 * Simbolo em traco, para o preloader e o logotipo da navegacao.
 * O path e alvo de DrawSVG.
 */
export function BatMark({ className = "", strokeWidth = 6, drawAttr = "data-draw" }) {
  const flag = { [drawAttr]: "" };

  return (
    <svg viewBox={BAT_VIEWBOX} className={className} aria-hidden="true">
      <path
        {...flag}
        d={BAT_PATH}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </svg>
  );
}
