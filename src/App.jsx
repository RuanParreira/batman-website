import { useCallback, useState } from "react";
import { useDeviceTier } from "./hooks/useDeviceTier";
import { useSmoothScroller } from "./hooks/useSmoothScroller";
import { Preloader } from "./components/layout/Preloader";
import { Nav } from "./components/layout/Nav";
import { Outro } from "./components/layout/Outro";
import { Opening } from "./components/Opening/Opening";
import { Hero } from "./components/Hero/Hero";
import { Chronicle } from "./components/Chronicle/Chronicle";
import { BatarangTransition } from "./components/Transition/BatarangTransition";
import { About } from "./components/About/About";
import { Garage } from "./components/Garage/Garage";
import { Signal } from "./components/Signal/Signal";

/**
 * Arvore da experiencia.
 *
 * Tudo o que rola vive dentro de #smooth-content. Tudo o que e fixo
 * (navegacao, preloader, grao) fica FORA dele — elementos fixos dentro de um
 * container transformado pelo ScrollSmoother rolariam junto com a pagina.
 */
export default function App() {
  const tier = useDeviceTier();
  const [ready, setReady] = useState(false);

  const handleReady = useCallback(() => setReady(true), []);

  useSmoothScroller();

  return (
    <>
      <Preloader onComplete={handleReady} />
      <Nav />
      <Opening ready={ready} tier={tier} />

      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <Hero ready={ready} tier={tier} />
            <Chronicle ready={ready} tier={tier} />
            <BatarangTransition ready={ready} tier={tier} />
            <About ready={ready} />
            <Garage ready={ready} tier={tier} />
            <Signal ready={ready} tier={tier} />
            <Outro ready={ready} />
          </main>
        </div>
      </div>

      {/* grão global — uma única camada para a página inteira */}
      <div className="grain pointer-events-none fixed inset-0 z-40" aria-hidden="true" />
    </>
  );
}
