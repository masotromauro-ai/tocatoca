# shared/audio — el motor de sonido

`audio.js` (marcado `@motor`): Web Audio. Es lo único de `shared/` que puede usar `window`. Tiene `playTone`, `playBand`, `playBandDur`, `playClick`, `playChord` y el contexto compartido.

Usa: `shared/teoria/notas.js`.

Ojo: `public/gestos/audio.js` es otro motor, de otra página, que no pasa por el build; no se mezclan.

Cómo se prueba: `node pruebas/humo.mjs` (compila y recorre las pestañas); el sonido en sí se oye en el navegador.

`mic.js` (también `@motor`): la escucha por micrófono. `micEstimar` estima las notas de un espectro; desde la fase 7 (17-nov-2026) también trae `fftEnLugar`, `espectroComoAnalizador` (el MISMO espectro que un AnalyserNode: Blackman, |X|/N y su suavizado) y `fuenteWorklet()`, que arma el código del AudioWorklet con esas mismas funciones: la escucha corre en el hilo del audio. Funciones sin nada de afuera (se copian al worklet tal cual). Lo prueba `node pruebas/escucha.mjs`.

`tocar.js` (`@motor`): `tocarNombres`, toca una lista de notas con nombre una tras otra.

**Las muestras reales** (`public/muestras/*.wav` + `indice.json`): cada una suena desde el principio y, mientras la tecla está apretada, repite el tramo `loopStart`–`loopEnd`. **Sostenida, la nota tiene que sonar continua** (22-nov-2026, Mauro): las grabaciones son recortes del medio de notas de videos (sin el arranque ni el cierre reales de la tecla) y al repetir el tramo se oía un «tic» (37 de 71 costuras saltaban) y, con el primer arreglo, «un corte y continuación» (el fundido restaba dos ondas que no coincidían y el volumen caía al 16 % en cada vuelta). Ahora `pruebas/coser-muestras.py`, **siempre desde las grabaciones originales** (las de antes de `f50684e`), empareja el volumen de la parte sostenida, elige el final del tramo donde las ondas coinciden durante todo el fundido y funde 150 ms con el volumen corregido; el `loopEnd` queda con seis decimales (el punto exacto). `node pruebas/muestras.mjs` falla si una costura salta o si el volumen, al dar la vuelta, baja de 0,8 o pasa de 1,25. **Una muestra nueva se cose antes de subirla.** Si algún día se graban notas enteras (silencio, apretar, sostener, soltar), el arranque y el cierre reales se pueden sumar como tercera parte; hoy al soltar se baja el volumen en 90 ms.
