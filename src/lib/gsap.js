/**
 * Ponto unico de registro do GSAP.
 * Nenhum outro arquivo deve chamar gsap.registerPlugin().
 */
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(
  useGSAP,
  ScrollTrigger,
  ScrollSmoother,
  ScrollToPlugin,
  SplitText,
  DrawSVGPlugin,
  CustomEase
);

/* ------------------------------------------------------------------
   Curvas de easing do projeto.
   CustomEase e o plugin extra escolhido: da assinatura cinematografica
   consistente a toda a experiencia sem repetir bezier solto no codigo.
   ------------------------------------------------------------------ */
CustomEase.create("cine", "0.16, 1, 0.3, 1"); // saida longa, chegada suave
CustomEase.create("cineIn", "0.7, 0, 0.84, 0"); // aceleracao de camera
CustomEase.create("shutter", "0.83, 0, 0.17, 1"); // corte seco, tipo obturador
CustomEase.create("drift", "0.33, 0, 0.15, 1"); // deriva lenta de parallax

export const EASE = {
  cine: "cine",
  cineIn: "cineIn",
  shutter: "shutter",
  drift: "drift",
};

gsap.defaults({ ease: EASE.cine, duration: 1 });

// ScrollTrigger nao deve recalcular a cada mudanca de barra de URL no mobile.
ScrollTrigger.config({ ignoreMobileResize: true });

export {
  gsap,
  useGSAP,
  ScrollTrigger,
  ScrollSmoother,
  ScrollToPlugin,
  SplitText,
  DrawSVGPlugin,
  CustomEase,
};
