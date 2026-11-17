import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Puerta from "./Puerta.jsx";

// Sin cuenta no se entra (8-nov-2026): la Puerta decide y la app recién se
// monta adentro, con window.__ALUMNO y window.__USUARIO ya puestos.
// Fase 7 (17-nov-2026): instalable y sin conexión. Sólo en la compilación (en `npm run dev` un service
// worker guardaría lo que se está editando). Si el navegador no lo deja, la app anda igual.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
    // Lo que esta primera visita ya bajó (pedazos de la app, public/cuenta, el SDK de Firebase) se le
    // pasa al service worker para que lo guarde: la próxima vez anda sin señal.
    navigator.serviceWorker.ready.then((reg) => setTimeout(() => {
      const urls = performance.getEntriesByType("resource").map((e) => e.name);
      if (reg.active) reg.active.postMessage({ tipo: "guardar", urls: [location.origin + "/", ...urls] });
    }, 3000)).catch(() => {});
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Puerta>
      <App />
    </Puerta>
  </StrictMode>
);
