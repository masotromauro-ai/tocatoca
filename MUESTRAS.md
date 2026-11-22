# Las muestras del bandoneón — cómo corregir o cargar una nota

Para **Mariano** y para su **chat gratuito de Claude** (claude.ai). Escrito el 22-nov-2026, después de arreglar el sonido
del teclado con Mauro. La Parte 1 es para la persona; la Parte 2 es el texto para pegarle al chat; la Parte 3 es la
referencia que el chat consulta.

---

## Parte 1 · Para Mariano

### Qué es una muestra

Cada botón del teclado suena con una **grabación corta** de esa nota (1,5 a 2,3 segundos), que vive en `public/muestras/`.
La app la toca desde el principio y, **mientras dejás el botón apretado, repite un tramo del medio** una y otra vez
(el «bucle»). Al soltar, baja el volumen en 90 milésimas. Qué grabación le toca a cada botón y dónde empieza y termina su
tramo lo dice una lista: `public/muestras/indice.json` (una «ficha» por botón y fuelle).

### Lo que se hizo el 22-nov con el teclado, en pasos

Mauro probó el teclado en el teléfono y fue diciendo lo que no andaba. Cada paso se arregló, se midió y se subió:

1. **«Las teclas suenan a veces y otras no; si dejás apretado salta el selector de texto.»** Cuando el teléfono cortaba
   un toque (el toque largo), la tecla quedaba trabada por dentro y no volvía a sonar. Ahora se suelta siempre, el sonido
   se despierta al levantar el dedo y el teclado no selecciona texto.
2. **«El espacio que percibe la tocada es muy pequeño.»** En el teléfono cada botón mide unos 22 píxeles. Ahora el toque
   va al **botón más cercano al dedo** (todo el círculo y el espacio de alrededor), con varios dedos a la vez.
3. **«Viene grabado un clic.»** No estaba en la grabación: era la **costura del tramo** que se repite. En 37 de las 71
   muestras el final del tramo no empalmaba con el principio y se oía un tic en cada vuelta.
4. **«Hay un corte y continuación.»** El primer arreglo mezclaba el final con el principio, pero las dos ondas no
   coincidían y **el volumen se hundía** en cada vuelta (hasta el 16 %). Se emparejó el volumen.
5. **«Una caída y una subida repentina.»** Lo último era el **color** del sonido (sus armónicos): el tramo empezaba antes de
   que el timbre se asentara, algunos armónicos laten solos (las lengüetas) y en la mezcla algunos se anulaban. Ahora el
   principio y el final del tramo se eligen donde el sonido está **igual, armónico por armónico**, y la mezcla corrige
   cada frecuencia.

6. **«Algunas, sobre todo los bajos, suenan con muy poco volumen.»** Todas tenían la misma energía, pero el oído (y más
   el parlante de un teléfono) no oye igual los graves: entre la más baja y la más alta había 11 dB de diferencia. Ahora
   cada muestra se lleva al mismo **volumen percibido** (los graves de la izquierda subieron hasta 6 dB; los agudos más
   brillantes bajaron hasta 5).

Resultado: las 71 suenan **continuas** mientras se sostienen y **parejas de volumen** de punta a punta del teclado.

**Para comparar** (desde el 22-nov): en la pestaña Bandoneón, el interruptor **«Sonido»** cambia entre **«Cosido»** (lo de
arriba: continuo y nivelado) y **«Grabación original»** (la grabación tal cual, entera, sin repetir ni nivelar: dura lo
que dura la grabación o hasta que soltás). La primera vez que elegís «Original» tarda unos segundos en bajar. Al armar
esto apareció un error de hace una semana: 25 de las 142 fichas no sonaban con su grabación sino con la de otro botón de la
misma altura (casi todas de la mano izquierda); ahora cada botón suena con la suya. Todo eso lo hace un programa que quedó en el repositorio,
`pruebas/coser-muestras.py` («coser» = empalmar el tramo), y una prueba, `pruebas/muestras.mjs`, que avisa si una muestra
vuelve a hacer tic, corte o cambio de color. **Las grabaciones originales, sin tocar, están en `public/muestras-originales/`:
se cose siempre desde ellas.**

### Qué hay grabado hoy (y qué convendría grabar)

| | Abriendo | Cerrando |
|---|---|---|
| Mano derecha (38 botones) | 38 grabadas | **ninguna**: usan la grabación de abriendo de otro botón con la misma nota |
| Mano izquierda (33 botones) | 32 grabadas (L29 usa una de la derecha) | **ninguna**: igual que a la derecha |

Las grabaciones salieron de videos: son recortes del medio de cada nota, **sin el arranque ni el cierre reales de la
tecla**. Si grabás vos, el teclado gana en dos cosas: cada botón **cerrando** con su sonido propio, y (más adelante) el
arranque y el cierre de verdad.

### Cómo grabar una nota

- Lugar callado; el teléfono a 20–30 cm del lado de la mano que toca; **una nota por archivo**.
- Apretá el botón y **sostené la nota pareja 3 segundos** (fuelle constante, sin vibrato ni crescendo).
- Recortá (con Audacity en la compu, o con tu chat): que el archivo **empiece justo cuando arranca el sonido**, sin
  silencio antes, y **termine mientras todavía suena** (antes de soltar). Entre 1,5 y 3 segundos.
- Formato: **WAV, mono, 16 bits, 44 100 Hz** (en Audacity: Archivo → Exportar → WAV, «Pistas → Mezclar a mono» antes).
  Si tu teléfono graba en .m4a o .mp3, tu chat te ayuda a convertirlo; si no puede, usá Audacity.
- Nombre: `bando-<mano>-<fuelle>-<midi>.wav`, por ejemplo `bando-der-cierra-80.wav` (mano `der` o `izq`, fuelle `abre`
  o `cierra`, y el número midi de la altura real; tu chat lo calcula). Si ya hay un archivo con ese nombre de otro botón,
  se le agrega el botón: `bando-der-cierra-80-R35.wav`.

### Cómo corregir o cargar una nota, paso a paso

1. **Bajá de GitHub** (`github.com/masotromauro-ai/tocatoca`; en cada archivo, el botón «Download raw file»):
   - `MUESTRAS.md` (este archivo),
   - `pruebas/coser-muestras.py` (el programa),
   - `public/muestras/indice.json` (la lista de fichas) y `public/muestras-originales/indice.json` (la lista tal como estaba antes de coser),
   - y la grabación: si **corregís** una nota, la original de `public/muestras-originales/` (no la de `public/muestras/`, que ya está
     cosida); si **cargás** una nueva, tu grabación.
2. **Abrí un chat nuevo en claude.ai**, pegale el texto de la **Parte 2** y subile esos archivos. Contale qué querés: «el
   SOL♯ de la derecha cerrando, botón R35, suena raro» o «grabé el R35 cerrando».
3. **Tu chat corre el programa** y te devuelve: la muestra cosida, el `indice.json` actualizado y, si es nueva, tu grabación
   con el nombre correcto. Te dice «✓ al dar la vuelta no se nota» o qué falla (también si no la pudo dejar al volumen de las demás). **Si dice ✗, no subas nada**: casi siempre
   la grabación no da y conviene grabarla de nuevo.
4. **Subí todo junto, en una sola subida.** Armá en tu compu las carpetas con las mismas rutas:
   `public/muestras/<la muestra cosida>.wav`, `public/muestras/indice.json` y, si es nueva, `public/muestras-originales/<tu grabación>.wav`.
   En GitHub, desde la **raíz** del repositorio: «Add file» → «Upload files» → arrastrá la carpeta `public` (adentro van
   las dos: `muestras` y `muestras-originales`) → una línea de qué hiciste («Muestras: R35 cerrando, grabación propia») → «Commit changes».
   (Es lo mismo que en `GUIA-PARA-TU-CHAT.md`, «Cuando el cambio tiene más de un archivo».)
5. **Mirá la ✓ verde** al lado de la subida (1–2 minutos) y **escuchala** en el sitio de desarrollo, en la pestaña
   Bandoneón, dejando el botón apretado unos segundos (con «Sonido» podés comparar con tu grabación original). La ronda del chat de Mauro corre la prueba de las muestras y te avisa
   si algo no cuadra.

### Si tu chat no puede correr el programa

Algunos chats gratuitos no pueden ejecutar programas. Entonces: subí **sólo la grabación original** a
`public/muestras-originales/` (con su nombre) y dejá un pedido en el panel («Ahora» → «Hacer un pedido»): «cosé
`bando-der-cierra-80.wav` para el R35 cerrando». Lo cose el chat de Mauro con el mismo programa y la misma prueba.

---

## Parte 2 · El texto para pegarle a tu chat

Copiá todo lo que está entre las dos rayas y pegalo como primer mensaje; después subí los archivos.

---

```
Sos el asistente de Mariano, profesor de bandoneón, para las muestras de sonido de BandoMaps (una app de React en
GitHub: masotromauro-ai/tocatoca). Mariano no programa: hablale en castellano rioplatense, en pasos cortos y sin jerga.
Te va a subir MUESTRAS.md (leelo entero antes de hacer nada: la Parte 3 es para vos), el programa
pruebas/coser-muestras.py, la lista public/muestras/indice.json y una o más grabaciones .wav.

Qué tenés que hacer:
1. Fijate si podés ejecutar Python con numpy. Si NO podés, decíselo enseguida y pasale el plan B de MUESTRAS.md
   («Si tu chat no puede correr el programa»). No inventes resultados.
2. Armá esta estructura de carpetas y poné cada archivo en su lugar:
     public/muestras-originales/<grabaciones originales .wav>
     public/muestras-originales/indice.json   ← si no te lo dio, creálo con {"muestras": []}
     public/muestras/indice.json
     public/muestras/               ← acá el programa escribe la muestra cosida
     pruebas/coser-muestras.py
3. Si la nota es NUEVA: revisá que el .wav sea mono, 16 bits, 44100 Hz, de 1,2 a 3 s, que arranque sin silencio y
   termine sonando (si no, convertilo o recortalo y mostrale a Mariano qué hiciste). Ponele el nombre que dice
   MUESTRAS.md. En public/muestras/indice.json, buscá la ficha de ese botón y fuelle (mano, fuelle, boton) y dejala con
   sólo estos campos: mano, fuelle, boton, pc, nota, nota_app, midi_referencia, archivo (el nombre nuevo). Sacale
   origen, velocidad, duracion, centesimas, loopStart y loopEnd: el programa los calcula. Si no existe la ficha, creala.
   Cómo llenar cada campo: Parte 3 de MUESTRAS.md. Antes de seguir, mostrale a Mariano la ficha y pedile que confirme
   botón, fuelle y nota.
   Si la nota YA EXISTE y suena mal: no toques la ficha; usá la grabación de public/muestras-originales/ (nunca la cosida).
4. Corré, parado en la carpeta de arriba de todo:
     python3 -I pruebas/coser-muestras.py --solo <archivo.wav>             (sólo mira, no escribe)
     python3 -I pruebas/coser-muestras.py --solo <archivo.wav> --aplicar   (cose y escribe)
   Leé la última línea: «✓ … lista para subir» o «✗ …» con el motivo. Si es ✗, NO entregues archivos para subir:
   explicale a Mariano qué falla en palabras simples y que conviene grabar de nuevo (cómo, en MUESTRAS.md).
5. Si es ✓: devolvele para bajar, con su ruta, public/muestras/<archivo.wav>, public/muestras/indice.json y, si es
   nueva, public/muestras-originales/<archivo.wav>. Idealmente en un .zip que ya tenga la carpeta public/ con
   todo adentro, así la arrastra entera a GitHub. Recordale el paso 4 y el 5 de MUESTRAS.md (una sola
   subida desde la raíz; mirar la ✓ verde; escuchar el botón sostenido).

Lo que NO hacés nunca:
- Coser sobre una muestra ya cosida (siempre desde public/muestras-originales/), ni cambiar el programa coser-muestras.py.
- Tocar otras fichas del índice que no sean las del botón y fuelle pedidos, ni borrar grabaciones.
- Subir nada vos ni pedirle a Mariano contraseñas o claves.
- Tocar código de la app (src/, otras carpetas de public/). Si Mariano pide algo de eso, decile que es otro paquete
  (GUIA-PARA-TU-CHAT.md).
```

---

## Parte 3 · Referencia para el chat

**La ficha** (una por botón y fuelle, en `public/muestras/indice.json` → `muestras`):

| Campo | Qué es | Cómo se llena |
|---|---|---|
| `mano` | `der` o `izq` | lo dice Mariano |
| `fuelle` | `abre` o `cierra` | lo dice Mariano |
| `boton` | `R01`…`R38` (derecha), `L01`…`L33` (izquierda) | lo dice Mariano; se ve en la app con «✏️ Editar teclado» |
| `nota_app` | la nota como la escribe la app, p. ej. `SOL♯4` | del teclado de fábrica: `src/shared/bandoneon/layouts.js`, `DEFS_R` / `DEFS_L`, campos `abre`/`cierra` (nota) y `oct_abre`/`oct_cierra` (octava) |
| `pc` | la clase de nota, 0 a 11 (Do = 0, Do♯ = 1 … Si = 11) | de la nota |
| `midi_referencia` | la **altura real** grabada (Do4 = 60) | **12 × (octava de la app + 2) + pc**. Ej.: SOL♯4 → 12 × 6 + 8 = **80** |
| `nota` | cómo la nombran los videos: una octava arriba de `nota_app` | SOL♯4 → `SOL#5` |
| `archivo` | el nombre del .wav | `bando-<mano>-<fuelle>-<midi>.wav` (con `-<boton>` al final si ese nombre ya existe para otro botón) |
| `duracion`, `centesimas`, `loopStart`, `loopEnd` | duración, afinación respecto de La 440, y el tramo que se repite | **los calcula el programa**: no se escriben a mano |
| `origen`, `velocidad` | sólo para botones que usan la grabación de otro | se sacan cuando el botón tiene grabación propia |

**Lo que el programa controla solo:** que la grabación dure al menos 1,2 s; que sea la nota de la ficha (si está corrida más
de medio semitono, para y lo dice: suele ser botón o fuelle equivocado); que al dar la vuelta no cambien la onda, el
volumen ni el color; y **nivela** la nota al volumen de las demás (si no puede sin saturar, lo dice).

**Lo que no se cambia:** `public/muestras-originales/` es la grabación tal cual (lo único que entra ahí es una grabación nueva);
`pruebas/coser-muestras.py` y `pruebas/muestras.mjs` los mantiene el chat de Mauro. Si el programa no anda o da un error
raro, Mariano lo pide en el panel y no se sube nada.
