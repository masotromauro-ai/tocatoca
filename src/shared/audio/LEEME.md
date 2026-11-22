# shared/audio — el motor de sonido

`audio.js` (marcado `@motor`): Web Audio. Es lo único de `shared/` que puede usar `window`. Tiene `playTone`, `playBand`, `playBandDur`, `playClick`, `playChord` y el contexto compartido.

Usa: `shared/teoria/notas.js`.

Ojo: `public/gestos/audio.js` es otro motor, de otra página, que no pasa por el build; no se mezclan.

Cómo se prueba: `node pruebas/humo.mjs` (compila y recorre las pestañas); el sonido en sí se oye en el navegador.

`mic.js` (también `@motor`): la escucha por micrófono. `micEstimar` estima las notas de un espectro; desde la fase 7 (17-nov-2026) también trae `fftEnLugar`, `espectroComoAnalizador` (el MISMO espectro que un AnalyserNode: Blackman, |X|/N y su suavizado) y `fuenteWorklet()`, que arma el código del AudioWorklet con esas mismas funciones: la escucha corre en el hilo del audio. Funciones sin nada de afuera (se copian al worklet tal cual). Lo prueba `node pruebas/escucha.mjs`.

`tocar.js` (`@motor`): `tocarNombres`, toca una lista de notas con nombre una tras otra.

**Las muestras reales** (`public/muestras/*.wav` + `indice.json`): cada una suena desde el principio y, mientras la tecla está apretada, repite el tramo `loopStart`–`loopEnd`. **La costura de ese bucle no puede saltar** (22-nov-2026, Mauro: «hay teclas que en el sonido viene grabado un clic»): 37 de las 71 muestras saltaban al volver del final al comienzo y se oía un «tic» cada vuelta. Se cosieron con `pruebas/coser-muestras.py` (elige el final que más se parece al comienzo y funde los últimos 40 ms con lo que viene antes del comienzo; el `loopEnd` queda con seis decimales, que es el punto exacto) y `node pruebas/muestras.mjs` falla si una costura salta más del doble de lo normal. **Una muestra nueva se cose antes de subirla.**
