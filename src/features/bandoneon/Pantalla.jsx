// La pantalla de la pestaña Bandoneón: reparte el teclado y los paneles según el ancho que haya.
// El teclado ocupa TODO el ancho, arriba. Debajo: en pantallas anchas (tableta apaisada, compu) los paneles van lado a lado, todos a la vista;
// en pantallas angostas (celular, tableta vertical) van como pestañas.
// El teclado queda fijo a la vista mientras se usan los paneles, siempre que no ocupe demasiado alto de la pantalla.

import { useState, useEffect, useRef } from "react";
import { useAnchoMedido } from "../../shared/bandoneon/disposicion.jsx";
import { GrupoCtl } from "../../shared/ui/controles.jsx";

// Un grupo de controles con su color arriba, para que se note a qué función pertenece
export function GrupoColor({ t, color, children }) {
  return <div style={{ borderTop: `2px solid ${color}`, paddingTop: 5 }}><GrupoCtl t={t}>{children}</GrupoCtl></div>;
}

function useAlto() {
  const ref = useRef(null); const [h, setH] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const upd = () => setH(el.offsetHeight); upd();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(upd); ro.observe(el); return () => ro.disconnect();
  }, []);
  return [ref, h];
}
export function useAltoVentana() {
  const [vh, setVh] = useState(() => (typeof window !== "undefined" ? window.innerHeight : 800));
  useEffect(() => { const f = () => setVh(window.innerHeight); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, []);
  return vh;
}

const FONDO = "#0b0b0d", BORDE = "#26262a";

// barra: los controles de arriba · notas: lo que suena · teclados: los dos teclados · kbRef: para medir el ancho del teclado
// paneles: [{id, titulo, color, nodo, peso?}] (una pestaña de color cada uno; en pantalla ancha, una columna cada uno: «peso» es su ancho relativo, 1 por defecto)
export function PantallaBandoneon({ barra, notas, teclados, kbRef, paneles }) {
  const [rootRef, rootW] = useAnchoMedido();
  const [bloque, alto] = useAlto();
  const vh = useAltoVentana();
  const [tab, setTab] = useState(paneles[0].id);
  const modo = !rootW ? "tableta" : rootW >= 900 ? "ancho" : rootW >= 620 ? "tableta" : "celular";
  // Se fija solo si deja lugar para los paneles; si el teclado ocupara casi toda la pantalla, no (no se podría llegar a lo de abajo)
  const fijo = alto > 0 && alto <= vh * 0.6;
  const act = paneles.find((p) => p.id === tab) || paneles[0];

  const bloqueTeclado = (
    <div ref={bloque} style={{ background: `linear-gradient(180deg, ${FONDO} 0%, ${FONDO} 84%, transparent 100%)`, borderRadius: 12, padding: "4px 2px 12px",   // sin borde: solo un esfumado abajo
      ...(fijo ? { position: "sticky", top: 0, zIndex: 20 } : {}) }}>
      {notas}
      <div ref={kbRef}>{teclados}</div>
    </div>
  );
  const panel = (
    <div style={{ background: "#121214", border: `1px solid ${BORDE}`, borderRadius: 12, overflow: "hidden" }}>
      <div role="tablist" style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: 6, background: "#0e0e10", borderBottom: `1px solid ${BORDE}` }}>
        {paneles.map((p) => { const on = p.id === act.id; return (
          <button key={p.id} role="tab" aria-selected={on} onClick={() => setTab(p.id)}
            style={{ flex: "1 1 auto", padding: "8px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", color: on ? "#fff" : "#a5a5ad",
              background: on ? p.color + "26" : "transparent", border: `1px solid ${on ? p.color : "#2a2a2e"}`, borderBottom: `3px solid ${p.color}` }}>{p.titulo}</button>
        ); })}
      </div>
      <div role="tabpanel" style={{ padding: 12, borderTop: `3px solid ${act.color}` }}>{act.nodo}</div>
    </div>
  );

  // Pantalla ancha: todos los paneles a la vista, uno al lado del otro (sin pestañas)
  const panelesAncho = (
    <div style={{ display: "grid", gridTemplateColumns: paneles.map((p) => `minmax(0, ${p.peso || 1}fr)`).join(" "), gap: 10, alignItems: "start" }}>
      {paneles.map((p) => (
        <section key={p.id} style={{ background: "#121214", border: `1px solid ${BORDE}`, borderTop: `3px solid ${p.color}`, borderRadius: 12, padding: 12, minWidth: 0 }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: p.color, fontWeight: 700 }}>{p.titulo}</h3>
          {p.nodo}
        </section>
      ))}
    </div>
  );

  return (
    <div ref={rootRef}>
      {barra}
      {bloqueTeclado}
      <div style={{ marginTop: 8 }}>{modo === "ancho" ? panelesAncho : panel}</div>
    </div>
  );
}
