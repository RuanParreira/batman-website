/**
 * O site roda sob um subpath no GitHub Pages (github.io/batman-website/),
 * nao na raiz do dominio — um `src="/imgs/foto.jpg"` cru resolveria contra
 * a raiz e quebraria em produção. `import.meta.env.BASE_URL` e o mesmo
 * `base` configurado em vite.config.js ("/" em dev, "/batman-website/" no
 * build); prefixa qualquer caminho de `public/` com ele.
 */
export function asset(path) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}
