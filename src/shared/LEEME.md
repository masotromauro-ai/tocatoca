# shared/ — lo que usan varias pestañas

Base compartida de BandoMaps. **No importa nada de `features/` ni de `App.jsx`** (lo vigila `pruebas/arquitectura.mjs`).

| Carpeta | Qué tiene |
|---|---|
| `teoria/` | notas, color, escalas, acordes, progresiones. Lógica pura |
| `audio/` | el motor de sonido (único que puede usar `window`) |
| `ui/` | estilos compartidos |
| `bandoneon/` | tablas del teclado y formas recomendadas |

Reglas: un archivo, un tema, hasta 300 líneas; la lógica pura no usa React, `window`, `document` ni `localStorage`; las claves de guardado `bandomaps_*` no se escriben acá (van a `shared/claves.js` cuando exista).

**Intocable** (no está en esta carpeta, pero no hay que sacarlo de `App.jsx`): `medir()`, `medirLote()`, `window.__tab`, `__ALUMNO`, `__USUARIO`, `Puerta.jsx`, `public/cuenta/`.

Historia: salió de `src/App.jsx` en la fase 1 (14-nov-2026), moviendo sin reescribir. Plan: `ARQUITECTURA.md`.

`medicion.js` (`@motor`): **INTOCABLE.** `medir()` y `medirLote()` avisan a `src/Puerta.jsx` qué se practicó; sacarlas no da error, sólo deja de medirse. `claves.js`: el único lugar donde se escriben las claves `bandomaps_…`.
