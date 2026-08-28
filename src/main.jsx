import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// A abertura depende de comecar no topo (scroll 0) para o pino/mergulho do
// morcego rodar na ordem certa. Sem isso, um reload com scroll restaurado
// pelo navegador cai direto na Hero, e o morcego so aparece depois, fora de
// ordem.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}
window.scrollTo(0, 0)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
