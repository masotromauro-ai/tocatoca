# shared/audio — el motor de sonido

`audio.js` (marcado `@motor`): Web Audio. Es lo único de `shared/` que puede usar `window`. Tiene `playTone`, `playBand`, `playBandDur`, `playClick`, `playChord` y el contexto compartido.

Usa: `shared/teoria/notas.js`.

Ojo: `public/gestos/audio.js` es otro motor, de otra página, que no pasa por el build; no se mezclan.

Cómo se prueba: `node pruebas/humo.mjs` (compila y recorre las pestañas); el sonido en sí se oye en el navegador.

`mic.js` (también `@motor`): la escucha por micrófono. `micEstimar` estima las notas de un espectro; desde la fase 7 (17-nov-2026) también trae `fftEnLugar`, `espectroComoAnalizador` (el MISMO espectro que un AnalyserNode: Blackman, |X|/N y su suavizado) y `fuenteWorklet()`, que arma el código del AudioWorklet con esas mismas funciones: la escucha corre en el hilo del audio. Funciones sin nada de afuera (se copian al worklet tal cual). Lo prueba `node pruebas/escucha.mjs`.

`tocar.js` (`@motor`): `tocarNombres`, toca una lista de notas con nombre una tras otra.
