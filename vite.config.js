import fs from "node:fs";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

/**
 * O site nao tem router client-side — a unica rota valida e "/". Sem isso,
 * o fallback SPA padrao do Vite serve o index.html pra QUALQUER URL
 * digitada (e' assim que ele suporta apps com router client-side), o que
 * esconde erro de digitacao/link quebrado atras da home.
 *
 * So intercepta pedidos de NAVEGACAO (Accept: text/html) que nao sejam "/"
 * — pedidos de asset (imagem, modelo, modulo JS/CSS) nunca carregam esse
 * Accept e passam direto. Precisa rodar ANTES do fallback interno do Vite
 * (por isso NAO retorna uma funcao aqui — isso adicionaria o middleware no
 * fim da fila; sem retornar, ele entra no INICIO).
 *
 * O HTML e lido uma unica vez, na inicializacao (nao a cada request): um
 * `fs.readFileSync` por request travava o dev server inteiro apos poucas
 * requisicoes neste ambiente Windows — sintoma exigia reiniciar o server.
 * Ler uma vez e cachear evita o problema e ainda poupa I/O de disco.
 */
function notFoundFallback() {
  const html = fs.readFileSync(path.resolve(process.cwd(), "public/404.html"), "utf-8");

  const serve = (req, res, next) => {
    if (req.method !== "GET") return next();
    const pathname = (req.url || "").split("?")[0];
    if (pathname === "/" || pathname === "/index.html") return next();
    if (!(req.headers.accept || "").includes("text/html")) return next();

    res.statusCode = 404;
    res.setHeader("Content-Type", "text/html");
    res.end(html);
  };

  return {
    name: "not-found-fallback",
    configureServer(server) {
      server.middlewares.use(serve);
    },
    configurePreviewServer(server) {
      server.middlewares.use(serve);
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Repo de projeto no GitHub Pages (nao <usuario>.github.io): o build de
  // producao fica em github.io/batman-website/, nao na raiz do dominio.
  // So no build — em dev o server continua servindo em "/". Caminhos de
  // asset em runtime usam `asset()` (src/lib/asset.js), que le esse mesmo
  // valor via import.meta.env.BASE_URL.
  base: command === "build" ? "/batman-website/" : "/",
  plugins: [react(), tailwindcss(), notFoundFallback()],
  build: {
    // Chunks separados por dominio. O grafo do WebGL so e alcancado pelo
    // import dinamico da Garage, entao three/drei/postprocessing ficam fora
    // do primeiro paint — e o GSAP mantem cache proprio entre deploys.
    rollupOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "three", test: /[\\/]node_modules[\\/]three[\\/]/, priority: 40 },
            { name: "postfx", test: /[\\/]node_modules[\\/]postprocessing[\\/]/, priority: 30 },
            { name: "r3f", test: /[\\/]node_modules[\\/]@react-three[\\/]/, priority: 20 },
            { name: "gsap", test: /[\\/]node_modules[\\/]@?gsap[\\/]/, priority: 10 },
          ],
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
}));
