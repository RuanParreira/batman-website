import { useScrollTo } from "../../hooks/useScrollTo";
import { BatMark } from "../Opening/BatMark";

const LINKS = [
  { label: "Crônica", target: "#chronicle" },
  { label: "Dossiê", target: "#about" },
  { label: "Garagem", target: "#garage" },
];

/**
 * Navegacao fixa. Fica fora do #smooth-content (nao deve ser transformada
 * pelo ScrollSmoother). Quem controla quando ela aparece e some e
 * `createOpeningAnimation` (via `[data-nav="root"]`) — o mesmo pin que sabe
 * exatamente quando a transicao do morcego termina, em vez de um segundo
 * ScrollTrigger tentando adivinhar a mesma distancia por conta propria. As
 * classes abaixo so cobrem o instante antes do JS assumir.
 *
 * Capsula flutuante e centralizada em vez de barra full-width: o vidro
 * (blur + fundo semi-opaco) garante leitura sobre qualquer fundo por conta
 * propria, entao dispensa o mix-blend-difference que a versao anterior
 * usava pra isso.
 */
export function Nav() {
  const scrollTo = useScrollTo();

  return (
    <header
      data-nav="root"
      /* Sem classe estatica de translate: Tailwind v4 usa a propriedade CSS
         `translate` (separada de `transform`) pra isso, e o GSAP so escreve
         em `transform` (via yPercent) — as duas coexistem em vez de uma
         substituir a outra, entao o header ficaria empurrado pra fora pra
         sempre. O `opacity-0` cobre o instante antes do JS assumir (fica
         atras do Preloader de qualquer forma). */
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 opacity-0 sm:pt-6"
    >
      <div className="flex w-full max-w-xl items-center gap-1 rounded-full border border-smoke/50 bg-void/60 py-1.5 pr-2 pl-1.5 shadow-[0_8px_40px_rgba(0,0,0,0.55)] backdrop-blur-md sm:gap-2 sm:pr-3">
        <button
          type="button"
          onClick={() => scrollTo("#hero")}
          className="group flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-3 py-2 transition-colors duration-500 hover:bg-smoke/30"
          aria-label="Voltar ao início"
        >
          <BatMark
            className="h-3.5 w-auto text-bone transition-colors duration-500 group-hover:text-blood sm:h-4"
            strokeWidth={16}
          />
          <span className="label hidden text-bone sm:inline">The Batman</span>
        </button>

        <span aria-hidden="true" className="h-5 w-px shrink-0 bg-smoke/60" />

        <nav className="flex flex-1 items-center justify-center gap-0.5 sm:gap-1">
          {LINKS.map((link) => (
            <button
              key={link.target}
              type="button"
              onClick={() => scrollTo(link.target)}
              className="label cursor-pointer rounded-full px-2.5 py-2 text-bone/75 transition-colors duration-500 hover:bg-smoke/30 hover:text-bone sm:px-3.5"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <span
          aria-hidden="true"
          className="mr-1 hidden size-1.5 shrink-0 animate-pulse rounded-full bg-blood sm:block"
        />
      </div>
    </header>
  );
}
