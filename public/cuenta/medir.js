/* ═══════════════════════════════════════════════════════════
   cuenta/medir.js — qué practica cada alumno, resumido por día.
   Sello: medir-1 (8-nov-2026)

   Sin pantalla ni Firebase (lo prueba pruebas/medir.mjs). Mauro, 8-nov-2026:
   «los avances y el progreso de cada alumno… en qué ha ejercitado,
   estadísticas de uso, aciertos, cómo ha evolucionado, cantidad de tiempo que
   usó cada herramienta».

   Se guarda UN documento por día, progreso/{uid}/dias/{AAAA-MM-DD}, con la
   forma que exigen las reglas (v2): { min, ingresos, ej, notas, en }.
   · min:   minutos por herramienta (la pestaña de la app, o «practica»)
   · ej:    por ejercicio, { a: aciertos, f: fallos }
   · notas: por nota (0 = Do … 11 = Si), { a, f }
   Lo que se suma se acumula acá y se manda junto cada tanto (con incrementos
   de la base, así dos pestañas abiertas no se pisan). Un resumen, no cada toque.
   ═══════════════════════════════════════════════════════════ */
export const VERSION = "medir-1";

/** Un minuto de uso cuenta sólo si hubo actividad en los últimos 2 minutos. */
export const INACTIVO_MS = 2 * 60 * 1000;
/** Cada cuánto se manda lo acumulado (y siempre al esconder la página). */
export const CADA_MS = 2 * 60 * 1000;

const LIMPIO = /^[a-z0-9-]{1,40}$/;
export const clave = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

/** La fecha local del día, como id del documento. */
export function dia(ms = Date.now()) {
  const d = new Date(ms);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

export function crearAcumulador() {
  let pend = vacio();
  let ultimo = null;          // { ms, tab } del último tic contado
  let actividad = 0;          // último toque o tecla
  function vacio() { return { min: {}, ingresos: 0, ej: {}, notas: {} }; }
  return {
    /** Hubo un toque, una tecla o un desplazamiento. */
    actividad(ms = Date.now()) { actividad = ms; },
    /** Pasa el tiempo: suma a la herramienta en uso lo que corrió desde el tic
        anterior, si en ese tic la página estaba a la vista y hubo actividad
        reciente. Al esconderse la página se llama con visible=false: cierra el
        tramo y no abre otro.
        Nunca más de 2 minutos de un tirón (un teléfono que se durmió). */
    tic(tab, ms = Date.now(), visible = true) {
      if (ultimo && ms - actividad <= INACTIVO_MS) {
        const t = clave(ultimo.tab);
        const dt = Math.min(ms - ultimo.ms, INACTIVO_MS);
        if (t && dt > 0) pend.min[t] = (pend.min[t] || 0) + dt / 60000;
      }
      ultimo = visible ? { ms, tab } : null;
    },
    ingreso() { pend.ingresos++; },
    /** Una respuesta de un ejercicio; pc es la nota (0–11) si la hay. */
    resultado(ejercicio, bien, pc) {
      const e = clave(ejercicio); if (!e) return;
      const r = pend.ej[e] || (pend.ej[e] = { a: 0, f: 0 });
      r[bien ? "a" : "f"]++;
      if (Number.isInteger(pc) && pc >= 0 && pc < 12) {
        const n = pend.notas[pc] || (pend.notas[pc] = { a: 0, f: 0 });
        n[bien ? "a" : "f"]++;
      }
    },
    /** Varias respuestas juntas (el Entrenador corrige un teclado entero). */
    lote(ejercicio, aciertos, fallos) {
      const e = clave(ejercicio); if (!e) return;
      const r = pend.ej[e] || (pend.ej[e] = { a: 0, f: 0 });
      r.a += Math.max(0, aciertos | 0); r.f += Math.max(0, fallos | 0);
    },
    hayAlgo() { return pend.ingresos > 0 || Object.keys(pend.ej).length > 0 || Object.values(pend.min).some((m) => m >= 0.05); },
    /** Lo acumulado, y queda vacío. */
    vaciar() { const p = pend; pend = vacio(); return p; },
    /** Si mandar falló, lo vuelve a sumar para la próxima. */
    devolver(p) {
      for (const [k, v] of Object.entries(p.min)) pend.min[k] = (pend.min[k] || 0) + v;
      pend.ingresos += p.ingresos;
      for (const g of ["ej", "notas"]) for (const [k, v] of Object.entries(p[g])) {
        const r = pend[g][k] || (pend[g][k] = { a: 0, f: 0 }); r.a += v.a; r.f += v.f;
      }
    },
  };
}

/** Lo acumulado, como lo escribe la base: cada número envuelto en `inc`
    (el increment de Firestore) para sumarse a lo que ya había ese día. */
export function aDocumento(p, inc, ms = Date.now()) {
  const d = { en: ms };
  const min = {};
  for (const [k, v] of Object.entries(p.min)) if (LIMPIO.test(k) && v >= 0.05) min[k] = inc(Math.round(v * 10) / 10);
  if (Object.keys(min).length) d.min = min;
  if (p.ingresos) d.ingresos = inc(p.ingresos);
  for (const g of ["ej", "notas"]) {
    const o = {};
    for (const [k, v] of Object.entries(p[g])) { const r = {}; if (v.a) r.a = inc(v.a); if (v.f) r.f = inc(v.f); if (Object.keys(r).length) o[k] = r; }
    if (Object.keys(o).length) d[g] = o;
  }
  return d;
}

/** «Traer lo de este teléfono»: lo que la app vieja guardaba en el navegador
    (tareas marcadas y acordes propios). Devuelve null si no hay nada. */
export function loDelTelefono(leer, usuario) {
  const json = (k) => { try { const v = leer(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } };
  const hechas = usuario ? json("bandomaps_hechas_" + usuario) : null;
  const acordes = json("bandomaps_mis_acordes");
  const out = {};
  if (hechas && typeof hechas === "object" && Object.values(hechas).some(Boolean)) out.hechas = hechas;
  // Como texto: un acorde guardado puede traer listas adentro de listas, que la base no acepta.
  if (Array.isArray(acordes) && acordes.length) out.misAcordesJson = JSON.stringify(acordes.slice(0, 500));
  return Object.keys(out).length ? out : null;
}
