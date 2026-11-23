# features/bandoneon — la pestaña Bandoneón

| Archivo | Qué es |
|---|---|
| `BandoneonTab.jsx` | la pestaña: el teclado, los dos lados, el editor y las tarjetas de acordes |
| `EjecucionTab.jsx` | la pestaña **Ejecución** (Mariano, 22-nov-2026): el instrumento virtual en pantalla completa, «Piano» (teclados horizontales) o «Real» (verticales, uno a cada lado), una mano o ambas, con cada teclado fijable a una medida calibrada en centímetros (para la capa de silicona sobre la pantalla). Sus ajustes van en `CLAVES.ejecucion` (`shared/claves.js`), no escritos a mano |
| `hooks.jsx` | tres bloques de lógica sacados tal cual de la pestaña: sonido (`useSonidoBandoneon`), escucha por micrófono (`useEscuchaBandoneon`) y marcas (`useMarcasBandoneon`) |

Se partió en `hooks.jsx` sólo para no pasar las 400 líneas: el texto de adentro es el mismo y cada hook recibe lo que necesita del componente (`herramientas/hook.mjs`). El armador de acordes que usa vive en `shared/bandoneon/` (`armador.jsx`, `disposicion.jsx`).

**El toque en el teléfono (22-nov-2026, «las teclas suenan a veces y otras no; si dejás apretado salta el selector de texto»):** cada tecla se suelta también con `touchcancel` (el teléfono corta un toque largo o cuando entra otra app; antes la nota quedaba «sonando» por dentro y esa tecla no volvía a sonar nunca), `startNote` vuelve a tocar una nota que quedó colgada en vez de ignorarla, el sonido se despierta al LEVANTAR el dedo (`desbloquearAudio` de `shared/audio/audio.js`: Chrome no deja despertarlo al apoyarlo, y Bluetooth u otra app lo vuelven a dormir), y el teclado con sus títulos no se selecciona ni abre menú con el toque largo. No se saca ninguna de las cuatro.

**Dónde se toca (22-nov-2026, «el espacio que percibe la tocada es muy pequeño»):** en el teléfono cada botón queda de unos 20 px, así que el toque NO lo atiende cada botón sino el lienzo (`BandCanvas` de `shared/bandoneon/Teclado.jsx`): va al botón **más cercano** al dedo, hasta medio botón más allá de su borde (`ALCANCE`), con varios dedos a la vez. El editor de teclado sigue con el toque en cada botón (ahí se arrastran). No se vuelve a poner el toque en el botón: el círculo solo es muy chico para un dedo.

**El interruptor «Sonido» (22-nov-2026, Mauro: «un switch que active la nota grabada o la modificada»):** «Cosido» toca `public/muestras/` (continuo y nivelado); «Grabación original» toca `public/muestras-originales/` tal cual, entera y sin repetir (`setFuenteMuestras` de `shared/audio/audio.js`; se baja recién al elegirla). Y `useSonidoBandoneon` recibe `{ bellows }`: desde el 14-nov le llegaba vacío y 25 de las 142 fichas sonaban con la grabación de otro botón de la misma altura.

Cómo se prueba: `node pruebas/humo.mjs` (pestaña Bandoneón) y, para el sonido y el micrófono, abrirla y tocar un botón.
