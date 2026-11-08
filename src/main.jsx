import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Puerta from "./Puerta.jsx";

// Sin cuenta no se entra (8-nov-2026): la Puerta decide y la app recién se
// monta adentro, con window.__ALUMNO y window.__USUARIO ya puestos.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Puerta>
      <App />
    </Puerta>
  </StrictMode>
);
