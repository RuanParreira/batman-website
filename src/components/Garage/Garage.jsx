import { Suspense, lazy, useCallback, useMemo, useRef, useState } from "react";
import { gsap, useGSAP, EASE } from "../../lib/gsap";

// three + drei + o material customizado saem do bundle inicial: a abertura e
// a Hero carregam sem esperar por ~1 MB de WebGL.
const GarageCanvas = lazy(() => import("./GarageCanvas"));

import { VEHICLES, DEFAULT_VEHICLE_ID } from "./vehicles";
import { createGarageAnimation } from "../../animations/garageAnimation";

/**
 * Garagem interativa.
 *
 * A secao mede 100vh; todo o percurso vem do pinSpacing. O canvas fica em
 * uma camada absoluta dentro do palco pinado — nunca no fluxo — para que
 * nenhuma mudanca de tamanho do WebGL possa alterar a altura do documento.
 */
export function Garage({ ready, tier }) {
  const root = useRef(null);
  const [vehicleId, setVehicleId] = useState(DEFAULT_VEHICLE_ID);
  const [active, setActive] = useState(false);

  const vehicle = useMemo(
    () => VEHICLES.find((item) => item.id === vehicleId) ?? VEHICLES[0],
    [vehicleId]
  );

  const handleActive = useCallback((value) => setActive(value), []);

  useGSAP(
    () => {
      if (!ready) return undefined;
      return createGarageAnimation(root.current, { onActiveChange: handleActive });
    },
    { scope: root, dependencies: [ready, handleActive], revertOnUpdate: true }
  );

  // Reanima o painel de especificacoes a cada troca de veiculo.
  useGSAP(
    () => {
      const panel = root.current?.querySelector('[data-garage="specs"]');
      if (!panel) return;
      const rows = panel.querySelectorAll("[data-spec-row]");
      gsap.fromTo(
        rows,
        { opacity: 0, x: -14 },
        { opacity: 1, x: 0, duration: 0.7, stagger: 0.06, ease: EASE.cine }
      );
    },
    { scope: root, dependencies: [vehicleId] }
  );

  return (
    <section
      id="garage"
      ref={root}
      className="relative w-full bg-void"
      data-section="garage"
    >
      <div
        data-garage="stage"
        className="relative h-screen w-full overflow-hidden"
      >
        {/* -------------------- WebGL -------------------- */}
        <div className="layer cursor-grab active:cursor-grabbing" data-garage="canvas">
          <Suspense fallback={null}>
            <GarageCanvas vehicle={vehicle} tier={tier} active={active} />
          </Suspense>
        </div>

        {/* fundo de segurança enquanto o canvas monta */}
        <div
          className="layer -z-10"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 62%, rgba(225,16,33,0.16) 0%, rgba(4,5,10,1) 70%)",
          }}
        />

        {/* -------------------- HUD -------------------- */}
        <div className="layer flex flex-col justify-between p-6 sm:p-10 lg:p-14">
          <header className="flex items-start justify-between gap-6">
            <div>
              <p data-garage="label" className="label mb-4 text-blood">
                06 — A garagem
              </p>
              <h2
                data-garage="title"
                className="display text-[clamp(2.4rem,7vw,6rem)] text-bone"
              >
                GARAGEM
              </h2>
            </div>

            {/* progresso da travessia — DrawSVG */}
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              className="hidden shrink-0 -rotate-90 sm:block"
              aria-hidden="true"
            >
              <circle cx="32" cy="32" r="28" fill="none" stroke="#24262f" strokeWidth="1" />
              <circle
                data-garage="progress"
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="var(--color-gold)"
                strokeWidth="1.5"
              />
            </svg>
          </header>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            {/* ------------- especificações ------------- */}
            <div data-garage="specs" className="max-w-sm">
              <p className="label mb-1 text-gold">{vehicle.year}</p>
              <p className="display mb-5 text-3xl text-bone sm:text-4xl">{vehicle.name}</p>

              <dl className="flex flex-col gap-2 border-t border-smoke/70 pt-4">
                {vehicle.specs.map(([term, value]) => (
                  <div
                    key={term}
                    data-spec-row
                    className="flex items-baseline justify-between gap-6 text-xs tracking-wide"
                  >
                    <dt className="text-bone/60 uppercase">{term}</dt>
                    <dd className="text-bone">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* ------------- seletor de veículo ------------- */}
            <div
              data-garage="picker"
              className="pointer-events-auto flex flex-col items-end gap-2"
            >
              {VEHICLES.map((item, index) => {
                const selected = item.id === vehicle.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setVehicleId(item.id)}
                    aria-pressed={selected}
                    className={[
                      "group relative flex w-48 cursor-pointer items-center gap-3 border py-3 pl-4 pr-5 backdrop-blur-sm transition-all duration-500 sm:w-56",
                      selected
                        ? "border-transparent"
                        : "border-fog/40 bg-void/85 hover:border-fog",
                    ].join(" ")}
                    style={
                      selected
                        ? {
                            backgroundColor: item.accent,
                            boxShadow: `0 0 28px -8px ${item.accent}`,
                          }
                        : undefined
                    }
                  >
                    {!selected && (
                      <span
                        className="absolute inset-y-0 left-0 w-0.75"
                        style={{ background: item.accent }}
                      />
                    )}
                    <span
                      className={[
                        "label text-[0.6rem]",
                        selected ? "text-void/70" : "text-bone/55",
                      ].join(" ")}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={[
                        "display flex-1 text-left text-base tracking-wide sm:text-lg",
                        selected ? "text-void" : "text-bone",
                      ].join(" ")}
                    >
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* moldura de HUD */}
        <div className="layer" aria-hidden="true">
          <div className="absolute inset-4 border border-smoke/25 sm:inset-8" />
        </div>

        <div className="layer vignette" />
      </div>
    </section>
  );
}
