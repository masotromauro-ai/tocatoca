# shared/audio — el motor de sonido

`audio.js` (marcado `@motor`): Web Audio. Es lo único de `shared/` que puede usar `window`. Tiene `playTone`, `playBand`, `playBandDur`, `playClick`, `playChord` y el contexto compartido.

Usa: `shared/teoria/notas.js`.

Ojo: `public/gestos/audio.js` es otro motor, de otra página, que no pasa por el build; no se mezclan.

Cómo se prueba: `node pruebas/humo.mjs` (compila y recorre las pestañas); el sonido en sí se oye en el navegador.

`mic.js` (también `@motor`): la escucha por micrófono. `micEstimar` estima las notas de un espectro; desde la fase 7 (17-nov-2026) también trae `fftEnLugar`, `espectroComoAnalizador` (el MISMO espectro que un AnalyserNode: Blackman, |X|/N y su suavizado) y `fuenteWorklet()`, que arma el código del AudioWorklet con esas mismas funciones: la escucha corre en el hilo del audio. Funciones sin nada de afuera (se copian al worklet tal cual). Lo prueba `node pruebas/escucha.mjs`.

`tocar.js` (`@motor`): `tocarNombres`, toca una lista de notas con nombre una tras otra.

**Las muestras reales** (`public/muestras/*.wav` + `indice.json`): cada una suena desde el principio y, mientras la tecla está apretada, repite el tramo `loopStart`–`loopEnd`. **Sostenida, la nota tiene que sonar continua** (22-nov-2026, Mauro, en tres pasos: «un clic», «un corte y continuación», «una caída y una subida repentina»). Las grabaciones son recortes del medio de notas de videos, sin el arranque ni el cierre reales de la tecla; al repetir el tramo había tres cosas que se oían: la **onda** que saltaba en la costura (tic), el **volumen** que se hundía en el fundido (dos ondas desfasadas se restan) y el **color**: el tramo empezaba antes de que el timbre se asentara, los armónicos altos laten solos (las lengüetas) y en el fundido algunos armónicos se cancelaban. `pruebas/coser-muestras.py` lo resuelve **siempre desde las grabaciones originales** (las de antes de `f50684e`): empareja volumen y, donde ayuda, color de la parte sostenida; elige comienzo y final del tramo donde el sonido está en el mismo estado (armónico por armónico) y la onda coincide; y funde 60 períodos (80–300 ms) con el nivel corregido frecuencia por frecuencia. `node pruebas/muestras.mjs` falla si al dar la vuelta la onda salta, el volumen sale de 0,8–1,25 o el color cambia más que en el resto de la nota. **Una muestra nueva se cose antes de subirla.** Si algún día se graban notas enteras (silencio, apretar, sostener, soltar), el arranque y el cierre reales se pueden sumar como tercera parte; hoy al soltar se baja el volumen en 90 ms.
