# Guía para trabajar con tu chat — BandoMaps

Para **Mariano** y para su chat gratuito de Claude (claude.ai). La primera parte es para la persona; la segunda, para el chat.

> **Actualizada el 22-nov-2026** (cómo subir un cambio de varios archivos sin romper el sitio, abajo). **17-nov-2026:** Un solo camino, en pasos cortos. Reemplaza los procedimientos anteriores (copias guardadas, pegar código en el panel, «App.jsx» entero): ya no hacen falta. El código está partido en archivos chicos, una carpeta por parte.

---

## Parte 1 · Para Mariano: cómo se hace un cambio

1. **Elegí qué querés cambiar.** En el panel, entrá a BandoMaps → pestaña **«Ahora»** → **«🤖 Trabajar con tu chat gratuito»** y tocá el botón de esa parte (por ejemplo «Formas recomendadas»). Se baja un **.zip** con los archivos de esa parte, un `LEEME.md` para tu chat y esta guía.
2. **Abrí un chat nuevo en claude.ai** (gratis), subí el .zip y contale el cambio con tus palabras.
3. **Tu chat te devuelve el archivo entero, ya cambiado.** Bajalo. Si te pide un archivo que no está en el .zip, bajá del panel el paquete de esa otra parte y dáselo.
4. **Subilo a GitHub** con tu cuenta de colaborador:
   - entrá a `github.com/masotromauro-ai/tocatoca` y a la carpeta del archivo (la ruta es la misma que tiene dentro del .zip);
   - «**Add file**» → «**Upload files**» → arrastrá el archivo (con el mismo nombre: reemplaza al viejo);
   - abajo, en una línea, qué cambiaste («Formas: agrego la forma lleno») → «**Commit changes**».
5. **Mirá el sitio de desarrollo** a los 2 minutos. Si algo no anda, avisá en el panel («Ahora» → «Hacer un pedido») antes de subir otra cosa.

### Cuando el cambio tiene más de un archivo (22-nov-2026)

**Qué pasó.** Entre el 17 y el 21 de noviembre, 11 de las 87 subidas dejaron el sitio de desarrollo **sin poder armarse**
(en GitHub, la ✗ roja con «0 / 2» al lado de la subida). Ningún archivo estaba mal: el problema fue el **orden**. Cada
subida a GitHub es una foto completa del código, y Vercel intenta armar el sitio con cada una. Si se sube primero
`BandoneonTab.jsx`, que ya usa algo nuevo (`sugerirVoicing`, `FormaSugerida`, `precargarMuestras`…), y el archivo que
trae eso nuevo (`acorde.js`, `disposicion.jsx`, `audio.js`) se sube un minuto después, durante ese minuto el código pide
algo que todavía no existe y la compilación falla. Con la subida siguiente se arregla solo, pero si uno se queda a mitad
de camino, el sitio queda roto. Los alumnos no lo ven: Vercel sigue mostrando la última versión que sí se armó.

**Cómo se evita, de mejor a peor:**

1. **Todo junto, en una sola subida.** Descomprimí lo que te devolvió el chat en una carpeta que repita las rutas
   (`src/shared/bandoneon/…`, `src/features/bandoneon/…`). En GitHub, desde la **raíz** del repositorio:
   «Add file» → «Upload files» → arrastrá **la carpeta `src` entera**. GitHub respeta las rutas y reemplaza cada archivo en
   su lugar. Un solo «Commit changes» = una sola foto, completa.
2. **Si no se puede todo junto, en orden: primero lo que se USA, después lo que lo llama.** El chat te tiene que decir el
   orden (ver la Parte 2). En general:
   `src/shared/…` (tablas, acorde, disposición, audio) → `src/features/…` (`hooks.jsx`, `Pantalla.jsx`, y **al final**
   `BandoneonTab.jsx`). Y sin pausas en el medio.
3. **Antes de seguir, mirá la marca de la última subida** (en la lista de commits, al lado del nombre): **✓ verde** = el
   sitio se armó; **✗ roja** = no se armó: no subas otra cosa, avisá en el panel. Tarda uno o dos minutos.

**Lo que no se toca, también al apurarse:** `src/Puerta.jsx`, `public/cuenta/` y `firestore.rules` son la puerta de las
cuentas. Un cambio ahí se pide en el panel («Hacer un pedido»): las reglas no hacen nada hasta que Mauro las publica en
Firebase, y antes necesitan sus casos en `pruebas/reglas.mjs`.

**Tres reglas que evitan todos los problemas:**

- **Bajá el .zip de nuevo antes de cada cambio.** Así trabajás siempre sobre la versión de hoy (el 9-nov una copia vieja borró, sin que nadie lo notara, la medición del avance de los alumnos).
- **Un cambio por subida**, y sólo los archivos de ese cambio.
- **Si dudás, preguntá** en el panel («❓ Preguntar»). Es mejor una pregunta que una subida que hay que deshacer.

Cada subida la revisa la ronda del chat de Mauro: que la app abra con sus 11 pestañas, las reglas de arquitectura y los bancos de pruebas. Si algo falla, te avisa con el nombre del archivo y se arregla o se deshace (con GitHub no se pierde nada). **Nada llega a los alumnos sin que Mauro lo pase del sitio de desarrollo al estable.**

Si no querés usar GitHub, en el paso 4 subí el archivo en el panel («Trabajar con tu chat gratuito» → «Subir el archivo que te devolvió») y lo sube Claude.

---

## Parte 2 · Para el chat: cómo trabajar sin romper nada

### Qué es BandoMaps

Una web para que alumnos de bandoneón aprendan la **mecánica y la topografía de los teclados**. La música, el fraseo y el aire los guía el profesor. **Quien te pide cosas es el profesor** (Mariano), que no programa: respondé en castellano rioplatense (voseo) y sin jerga. Hecha con React + Vite + Tailwind, con `localStorage` y una base en la nube (Firebase) para cuentas y avance.

### Cómo responder

- **Devolvé cada archivo que cambies COMPLETO**, con el mismo nombre y la misma ruta que tiene en el .zip. **Nunca** fragmentos, «…» ni «el resto queda igual»: se sube tal cual y lo que falte se pierde.
- Antes del código: **qué cambia y por qué**, en 3 renglones sin jerga.
- Después: **cómo probarlo** (qué pestaña abrir, qué tocar, qué debería verse) y **qué no tocaste**.
- **Una parte, hasta 3 archivos, ningún archivo de más de 400 líneas.** Si hace falta más, proponé partirlo en dos cambios.
- **Si devolvés más de un archivo, decí el ORDEN de subida**, numerado: primero los que traen algo nuevo (una función, un
  componente, un nombre exportado), al final los que lo usan. Y recordale que lo mejor es subirlos **todos juntos en una
  sola subida** (la carpeta `src` desde la raíz). Un archivo que usa algo que todavía no está subido rompe el sitio de
  desarrollo hasta que llega el otro (pasó 11 veces entre el 17 y el 21-nov).
- **Antes de entregar, revisá los nombres**: cada `import { X } from "…"` que agregaste tiene que existir, con ese nombre
  exacto, en el archivo que lo da (y ese archivo tiene que venir en tu respuesta o estar ya subido).
- **Si te falta un archivo, no lo inventes**: decí cuál, y la persona te baja el paquete de esa parte.
- La lógica pura (teoría, formas, sonido) va con una prueba chica de `node`, sin navegador ni npm, como las de `pruebas/` (`teoria.mjs` es el modelo).

### Dónde está cada cosa

`src/App.jsx` es sólo la raíz (el menú, 263 líneas). Todo lo demás está en carpetas, cada una con su `LEEME.md` que dice qué hay, qué usa y qué no se toca:

- `src/shared/teoria/` — notas, colores, escalas, acordes, progresiones, **cifrado**.
- `src/shared/bandoneon/` — las tablas del teclado, las **formas recomendadas** (`voicings.js`), el dibujo del teclado y su editor, guardar y cargar, los caminos de notas.
- `src/shared/ui/` — estilos y piezas visuales (piano, círculo, tarjetas).
- `src/shared/audio/` — el sonido y el micrófono.
- `src/features/` — una carpeta por pestaña: `entrenador/`, `codigo/`, `teoria/`, `clases/`, `herramientas/` (Acorde, Progresión, Biblioteca, Quintas, Modos, Colores), `bandoneon/` y `aviso/`.

### Vocabulario

- **Bandoneón bisonoro**: cada botón da **una nota al abrir y otra al cerrar**. 71 botones: **33 a la izquierda, 38 a la derecha** (sistema Rheinische).
- **No es isomórfico**: la misma forma **no** se transporta. Las formas se guardan como **reglas por función** (R, 3, 5, 7), registro, mano y fuelle, y se resuelven contra el teclado real.
- **pc** (clase de nota, 0–11), **midi** y **oct** (octava).
- **Forma (voicing)**: cómo se arma un acorde en el teclado. **Marcato**: acompañamiento en la izquierda, cerrado y con inversiones. **Lleno**: para el solo, tenido.
- **Cifrado**: «jazz» (△7, m7, ø7, °7) o «americano» (maj7, m7, m7♭5, dim7). Las notas se escriben **según la tonalidad** (La mayor → Do♯, no Re♭).
- **Paleta**: la oficial vive en `NC` (`src/shared/teoria/color.js`), copiada en `public/gestos/musica.js`: si cambia una, cambia la otra.
- **Roles**: administrador, docente, alumno. La app no se abre sin cuenta.

### Lo que cuida la experiencia del alumno

Menos opciones y más claridad (lo avanzado, plegado) · **nunca sólo color**: cada nota con su nombre o una marca · sesiones cortas, con respuesta inmediata · pensado para tableta y teléfono · metas del docente antes que puntos, sin rankings. Referencias en `TENDENCIAS.md`.

### Lo que no se toca

- Las claves `bandomaps_*` de `localStorage` (los alumnos perderían lo suyo).
- `medir()`, `medirLote()`, `window.__tab`, `window.__ALUMNO`, `window.__USUARIO`: miden el avance de cada alumno; sacarlos no da error, **sólo deja de medirse**.
- `src/Puerta.jsx`, `public/cuenta/` y `firestore.rules`.
- Contraseñas, claves o datos de alumnos: **nunca** en una respuesta ni en un archivo.
- El nombre de un archivo o de una pieza que usan otras partes (las de `solo-leer/` del .zip). Si hace falta renombrar o agregar uno, decilo para que se actualice el mapa (`areas.json`).

### Lo que el profesor ya decidió

- **Formas recomendadas:** dos por acorde, *marcato* y *lleno*; se puede omitir la 5ª (Do △7 = Do2 + Mi4 + Si4; Sol 7 = Sol2 + Fa4 + Si4); una regla por tipo de acorde, repetida en las doce tonalidades, ajustando las que ya existen en `voicings.js`.
- **El fuelle:** el mismo acorde abriendo o cerrando, no cambia (es el mismo aire, inspirando o espirando). Conviene un apartado con recomendaciones para el uso del aire.
- **El lleno:** bajo a la izquierda y voces abiertas a la derecha.
- **Dónde viven las formas:** en la base de BandoMaps, con una pantalla para editarlas (se planea aparte).
- **Lo primero que van a notar los alumnos:** la práctica del día, 5 a 10 minutos con lo que más le sirve a cada uno.
- **«El Código»:** las dos correcciones al manual esperan que Mariano las vea antes.
- **Los alumnos pasan a la app con cuenta** cuando esté la pestaña «Alumnos» para seguir su avance.
