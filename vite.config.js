import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Fase 7 de ARQUITECTURA.md (17-nov-2026): React 19 con el React Compiler. El compilador memoriza solo
// lo que hoy se hace a mano con useMemo/useCallback; un componente que no cumple las reglas de React lo
// deja como está (no lo rompe), así que se puede adoptar de una vez.
export default defineConfig({
  plugins: [react({ babel: { plugins: [["babel-plugin-react-compiler", {}]] } })],
});
