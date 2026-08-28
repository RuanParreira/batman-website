# The Batman — Gotham Experience

Experiência cinematográfica interativa construída com React + Vite + Tailwind v4,
GSAP (ScrollSmoother / ScrollTrigger / SplitText / DrawSVG / ScrollTo / CustomEase)
e React Three Fiber.

## Scripts

```bash
npm run dev       # servidor de desenvolvimento
npm run build     # build de produção
npm run preview   # serve o build
npm run lint      # eslint
```

## Arquitetura

```
src/
  lib/
    gsap.js               registro ÚNICO dos plugins + eases do projeto (EASE.*)
    device.js             tier do dispositivo, breakpoints, dpr do Canvas
  hooks/
    useSmoothScroller.js  cria/destrói o ScrollSmoother global
    useDeviceTier.js      low | mid | high
    useScrollTo.js        navegação por âncora (smoother.scrollTo / ScrollToPlugin)
  animations/             uma fábrica por seção — nenhum GSAP solto em componente
    text.js               helpers de SplitText (linhas / palavras / caracteres)
    openingAnimation.js
    heroAnimation.js
    chronicleAnimation.js
    aboutAnimation.js
    garageAnimation.js
  components/
    Opening/              abertura + travessia do símbolo (batPath.js = vetor)
    Hero/
    Chronicle/            narrativa por scroll (dados em chapters.js)
    About/                dossiê (dados em dossier.js)
    Garage/               R3F: canvas, cena, luzes, veículos, ponte scroll↔3D
    shaders/              materiais customizados (HoloFloorMaterial)
    common/  layout/
```

### Regras do projeto

1. **Um único ponto de registro do GSAP.** Nenhum arquivo além de `src/lib/gsap.js`
   chama `gsap.registerPlugin()`.
2. **Animação mora em `animations/`.** Componentes só marcam alvos com
   `data-*` e chamam a fábrica dentro de `useGSAP`. A fábrica devolve um
   cleanup que faz `mm.revert()` + revert dos `SplitText`.
3. **Nada de `position: sticky` dentro de `#smooth-content`.** O
   ScrollSmoother transforma esse container; use `pin` do ScrollTrigger.
4. **Seções com pin não têm altura fixa.** O percurso vem do `pinSpacing`;
   `h-screen` na seção anularia o espaçador.
5. **Elementos fixos ficam fora de `#smooth-content`** (nav, preloader, grão).
6. **O scroll não passa por `setState`.** A ponte scroll↔3D é
   `components/Garage/garageStore.js`, um objeto mutável lido no `useFrame`.
7. **Animações só depois de `document.fonts.ready`** (prop `ready`), senão o
   SplitText mede as linhas com a fonte de fallback.
8. **Nunca use `max-w-[Nch]` num container** para limitar um título. `ch` é
   calculado com a fonte do próprio elemento: num `div` em Inter 16px,
   `13ch` vale ~104px e espreme o `h1` em Anton a um caractere por linha.
   Limite em `rem`/`px`, ou aplique o `ch` no próprio elemento de texto.
9. **A Hero sobe com `-mt-[100svh]`** e ocupa o lugar do palco pinado da
   abertura. A Hero fica sempre visível (não há handoff de `autoAlpha`) — como
   ela só entra na viewport no instante exato em que o pino solta, não é
   preciso escondê-la antes disso. `openingAnimation` mergulha o morcego
   (cresce, desfoca, some) e **na mesma janela de scroll** revela o conteúdo
   da Hero (`heroQ` alcança o DOM dela via `#hero`), então ao soltar o pino a
   Hero já está pronta — sem crossfade, sem tela intermediária.

## O símbolo da abertura

`public/imgs/batarang2.png` é, apesar da extensão, um **JPEG**: não tem canal
alpha e o "fundo transparente" é um xadrez pintado no pixel. Por isso o
símbolo foi **vetorizado** para `src/components/Opening/batPath.js` (contorno
por Moore-neighbor, suavizado com Chaikin, simplificado com Douglas-Peucker).

O vetor é usado em três papéis, todos na mesma caixa e no mesmo path, o que
garante alinhamento sem cálculo:

| Componente   | Papel                                                  |
|--------------|--------------------------------------------------------|
| `BatGlyph`   | símbolo sólido e luminoso que mergulha na abertura     |
| `BatMark`    | traço para o preloader e o logotipo (alvo de DrawSVG)   |

Para trocar o símbolo, regenere o path a partir da nova arte e substitua
`BAT_PATH` — nada mais precisa mudar.

## Adicionar um Batmóvel real

Coloque o arquivo em `public/models/` e preencha `model` em
`src/components/Garage/vehicles.js`:

```js
{
  id: "vengeance",
  model: "/models/batmobile-2022.glb",
  transform: { scale: 1, position: [0, 0, 0], rotation: [0, 0, 0] },
}
```

Enquanto `model` for `null`, entra o substituto procedural
(`PlaceholderBatmobile`), que ocupa a mesma caixa envolvente — a trajetória de
câmera não precisa de reajuste.
