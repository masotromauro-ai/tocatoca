# shared/audio — el motor de sonido

`audio.js` (marcado `@motor`): Web Audio. Es lo único de `shared/` que puede usar `window`. Tiene `playTone`, `playBand`, `playBandDur`, `playClick`, `playChord` y el contexto compartido.

Usa: `shared/teoria/notas.js`.

Ojo: `public/gestos/audio.js` es otro motor, de otra página, que no pasa por el build; no se mezclan.

Cómo se prueba: `node pruebas/humo.mjs` (compila y recorre las pestañas); el sonido en sí se oye en el navegador.

`mic.js` (también `@motor`): la escucha por micrófono, `micEstimar`, con el detector de tono `pitchfinder`.

`tocar.js` (`@motor`): `tocarNombres`, toca una lista de notas con nombre una tras otra.
