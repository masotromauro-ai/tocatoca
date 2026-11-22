# features/bandoneon — la pestaña Bandoneón

| Archivo | Qué es |
|---|---|
| `BandoneonTab.jsx` | la pestaña: el teclado, los dos lados, el editor y las tarjetas de acordes |
| `hooks.jsx` | tres bloques de lógica sacados tal cual de la pestaña: sonido (`useSonidoBandoneon`), escucha por micrófono (`useEscuchaBandoneon`) y marcas (`useMarcasBandoneon`) |

Se partió en `hooks.jsx` sólo para no pasar las 400 líneas: el texto de adentro es el mismo y cada hook recibe lo que necesita del componente (`herramientas/hook.mjs`). El armador de acordes que usa vive en `shared/bandoneon/` (`armador.jsx`, `disposicion.jsx`).

**El toque en el teléfono (22-nov-2026, «las teclas suenan a veces y otras no; si dejás apretado salta el selector de texto»):** cada tecla se suelta también con `touchcancel` (el teléfono corta un toque largo o cuando entra otra app; antes la nota quedaba «sonando» por dentro y esa tecla no volvía a sonar nunca), `startNote` vuelve a tocar una nota que quedó colgada en vez de ignorarla, el sonido se despierta al LEVANTAR el dedo (`desbloquearAudio` de `shared/audio/audio.js`: Chrome no deja despertarlo al apoyarlo, y Bluetooth u otra app lo vuelven a dormir), y el teclado con sus títulos no se selecciona ni abre menú con el toque largo. No se saca ninguna de las cuatro.

Cómo se prueba: `node pruebas/humo.mjs` (pestaña Bandoneón) y, para el sonido y el micrófono, abrirla y tocar un botón.
