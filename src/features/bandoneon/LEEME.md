# features/bandoneon — la pestaña Bandoneón

| Archivo | Qué es |
|---|---|
| `BandoneonTab.jsx` | la pestaña: el teclado, los dos lados, el editor y las tarjetas de acordes |
| `hooks.jsx` | tres bloques de lógica sacados tal cual de la pestaña: sonido (`useSonidoBandoneon`), escucha por micrófono (`useEscuchaBandoneon`) y marcas (`useMarcasBandoneon`) |

Se partió en `hooks.jsx` sólo para no pasar las 400 líneas: el texto de adentro es el mismo y cada hook recibe lo que necesita del componente (`herramientas/hook.mjs`). El armador de acordes que usa vive en `shared/bandoneon/` (`armador.jsx`, `disposicion.jsx`).

Cómo se prueba: `node pruebas/humo.mjs` (pestaña Bandoneón) y, para el sonido y el micrófono, abrirla y tocar un botón.
