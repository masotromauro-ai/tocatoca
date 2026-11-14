# Guía para tu chat y para subir cambios — BandoMaps

Esta guía es para **Mariano** y para su asistente (el chat de IA que usa). Está escrita para que una persona que no programa la entienda, y para que el chat sepa cómo trabajar sin romper nada.

> **Actualizada el 14-nov-2026.** Cambió lo más importante: **Mariano sube sus cambios directo a GitHub con su cuenta**, y ahora el proyecto está partido en archivos chicos, así que ya no hay que tocar un archivo de 7.000 líneas.

## 1. Qué es BandoMaps

Una web para que alumnos de bandoneón aprendan la **mecánica y la topografía de los teclados**. La música, el fraseo y el aire los guía el profesor. **El usuario que te pide cosas es ese profesor** (Mariano); los usuarios finales son sus alumnos. Respondé en castellano rioplatense (voseo) y sin jerga: el profesor no programa.

Hecha con React + Vite + Tailwind, con `localStorage` y una base en la nube (Firebase) para cuentas y avance. Repositorio público: `masotromauro-ai/tocatoca`.

## 2. Cómo se sube un cambio (el procedimiento, en 6 pasos)

Lo decidió Mauro el 14-nov: Mariano sigue haciendo modificaciones **él mismo**, directo en GitHub, con su cuenta de colaborador. Para que eso no vuelva a pisar el trabajo de nadie:

1. **Bajá la versión de hoy de GitHub antes de editar.** Nunca partas de una copia que tenías guardada. El 9-nov se subió `App.jsx` entero desde una copia vieja y desapareció, sin que nadie lo notara, la medición de lo que practica cada alumno. Entrá al archivo en GitHub, tocá «Raw» o el ícono de descargar, y trabajá sobre eso.
2. **Tocá sólo el archivo de lo que estás cambiando.** Desde la fase 2 casi todo está en carpetas:
   - `src/shared/teoria/` — notas, colores, escalas, acordes, progresiones, **cifrado** (cómo se nombra un acorde)
   - `src/shared/bandoneon/` — las tablas del teclado, las **formas recomendadas** (`voicings.js`), el dibujo del teclado (`Teclado.jsx`), su editor (`Editor.jsx`), guardar y cargar (`almacen.js`, `csv.js`, `Modales.jsx`) y los caminos de notas (`camino.js`)
   - `src/shared/ui/` — estilos, y las piezas visuales de teoría en `teoria/` (piano, círculo, tarjetas de función)
   - `src/shared/audio/` — el sonido y la escucha por micrófono (`mic.js`)
   - `src/features/` — una carpeta por pestaña (por ahora la Biblioteca y las ayudas del Entrenador; el resto sale de `App.jsx` en la fase 3)

   Cada carpeta tiene un `LEEME.md` que dice qué hay, qué usa y **qué no se toca**. Lo que todavía está en `src/App.jsx` (las pestañas) se va a ir pasando a carpetas; hasta entonces, si el cambio es ahí, **volvé a bajar `App.jsx` justo antes de editarlo**.
3. **Subí por la web de GitHub, a `main`**: abrí el archivo → lápiz ✏️ (o «Add file → Upload files») → en el mensaje escribí una línea con lo que hiciste («Formas: agrego la forma lleno») → «Commit changes». **Una cosa por subida**, no cinco juntas. A `main` directo: es lo que decidió Mauro para todo el ecosistema mientras BandoMaps está en desarrollo.
4. **Mirá el sitio de desarrollo** a los 1–2 minutos (Vercel lo publica solo). Si algo no anda, avisá en el panel **antes** de seguir subiendo cosas encima.
5. **El control lo hace el chat de Mauro**, no vos: cada día (y cuando se lo pidan) corre tres comprobaciones sobre lo último que se subió —que la app abra y dibuje las 11 pestañas igual que antes, que se cumplan las reglas de arquitectura, y los bancos de pruebas— y le avisa a Mauro. Si algo falla, Mauro te lo dice con el nombre del archivo y se arregla o se deshace esa subida (con Git no se pierde nada).
6. **Si tu cambio cambia lo que se ve a propósito** (un color, un botón nuevo), está bien: el control lo va a marcar como «cambió» y Mauro/Claude lo revisan y actualizan la foto de referencia. Por eso conviene decirlo en el mensaje de la subida.

**Si en algún momento no sabés si algo es seguro, preguntá en el panel** («Pedido» o tu chat propio). Es mejor una pregunta que una subida que hay que deshacer.

## 3. Cómo trabaja tu chat (el gratuito)

Dale **este archivo y el paquete de UN área** (lo bajás del panel, en «🤖 Trabajar con una sesión gratuita de Claude»), no el proyecto entero. Ahora hay dos formas:

- **Para cambios chicos**: el chat te devuelve el archivo completo de la carpeta nueva (por ejemplo `voicings.js`, 55 líneas) y vos lo subés como en el paso 3.
- **Para lo que sigue en `App.jsx`**: el paquete trae sólo el tramo de esa área. Pedile al chat que te devuelva **el código completo de cada función que cambia**, con su nombre exacto, nunca fragmentos con «…».

Respuesta que tiene que dar el chat:

- **Qué cambia y por qué** (3 renglones, sin jerga).
- **El código completo** de cada archivo o función que cambia. **Nunca** «…» ni «el resto igual»: se pega tal cual y el resto se pierde.
- **Cómo probarlo**: qué pestaña abrir, qué tocar y qué debería verse.
- **Qué NO tocó.**
- **Un área, hasta 3 archivos, hasta 400 líneas tocadas.** Si hace falta más, que lo parta en dos intervenciones.
- **La lógica pura** (teoría, formas, sonido) con una prueba chica de `node` (sin navegador ni npm), como las de `pruebas/` (`teoria.mjs` es el modelo).

Si querés que Claude (el de Mauro) revise o aplique lo que armó tu chat, pegalo (o subí el archivo) en el panel, en «Trabajar con una sesión gratuita de Claude»: lo analiza contra el resto del proyecto antes de publicarlo.

## 4. Vocabulario del dominio

- **Bandoneón bisonoro**: cada botón da **una nota al abrir y otra al cerrar el fuelle**. 71 botones: **33 en la mano izquierda, 38 en la derecha** (sistema Rheinische).
- **No es isomórfico**: la misma forma **no** se transporta a otra tonalidad. Por eso las formas se guardan como **reglas por función de cada nota** (R raíz, 3, 5, 7), registro, mano y fuelle, y se resuelven contra el teclado real.
- **pc** (clase de nota, 0–11), **midi** y **oct** (octava): cómo se identifica una nota en el código.
- **Voicing / «forma»**: cómo se arma un acorde en el teclado. **Marcato**: acompañamiento en la izquierda, cerrado y con inversiones. **Lleno**: para el solo, tenido: bajo + notas guía.
- **Cifrado**: «jazz» (△7, m7, ø7, °7) o «americano» (maj7, m7, m7♭5, dim7). Las notas se escriben **según la tonalidad** (La mayor → Do♯, no Re♭): nunca con una tabla fija.
- **Paleta**: la **oficial** vive en `NC` (`src/shared/teoria/color.js`) y es la única fuente del color de cada nota. Está **copiada** en `public/gestos/musica.js`: si cambia una, cambia la otra.
- **Rol del usuario**: administrador, docente o alumno. La app no se abre sin cuenta.

## 5. Lo que cuida la experiencia del alumno

- **Menos opciones, más claridad.** Ante la duda, mostrar menos; lo avanzado, plegado.
- **Nunca sólo color**: cada nota lleva también su nombre o una marca (hay quien no distingue bien algunos colores).
- **Sesiones cortas** y respuesta inmediata: el alumno sabe al instante si estuvo bien.
- **Pensado para tableta y teléfono**: el teclado grande y legible, también apaisado.
- **Metas del docente antes que puntos.** Nada de rankings entre alumnos.
- Las tendencias y las apps parecidas que se tomaron como referencia están en `TENDENCIAS.md`.

## 6. Lo que no se toca (rompe cosas que ya andan)

- Las claves de guardado `bandomaps_*` en `localStorage`: **no se renombran** (los alumnos perderían lo suyo). No existe ninguna `harmonia_*`: si aparece, es un error.
- `medir()`, `medirLote()`, `window.__tab`, `window.__ALUMNO`, `window.__USUARIO`: son lo que mide el avance de cada alumno. Sacarlos no da error: **sólo deja de medirse**. (Los vigila `pruebas/arquitectura.mjs`.)
- Los `import` del principio de `App.jsx`, `src/Puerta.jsx`, `public/cuenta/` y `firestore.rules`.
- Contraseñas, claves o datos de alumnos: **nunca** en una respuesta ni en un archivo.
- El nombre de las declaraciones que están en `areas.json` (el mapa las usa para armar los paquetes). Si agregás o renombrás una, decilo para que se actualice el mapa.
- **No subas un archivo de más de 400 líneas** ni mezcles dos temas en un archivo: el control de arquitectura lo marca.

## 7. Lo que el profesor ya decidió

**Formas recomendadas (9-nov, contestado en su panel):**
- **Dos por acorde.** *Marcato* (acompañamiento) y *lleno* (para el solo).
- **Se puede omitir la 5ª.** Ejemplos: **Do △7 = Do2 + Mi4 + Si4**; **Sol 7 = Sol2 + Fa4 + Si4** (bajo abajo y las dos notas guía, 3ª y 7ª, en la octava 4).
- **Una regla por tipo de acorde, repetida en las doce tonalidades.** Ajustar las reglas que ya existen (`PATRONES_VOZ`, `elegirVoicing`, `voicingsDe`, ahora en `src/shared/bandoneon/voicings.js`), no reescribir.
- El fuelle: **no son dos fuentes de datos**, es el mismo acorde abriendo o cerrando, y no cambia. Bajo a la izquierda y voces abiertas a la derecha.
- Dónde viven las formas: en la **base de datos de BandoMaps**, con una pantalla para editarlas (se planea aparte, toca reglas de Firestore).

**El plan de partir `App.jsx` (14-nov):** aprobado por Mauro, **una fase por vez con su OK**. Fase 0 (red de seguridad), fase 1 (lo puro: teoría, audio, estilos, tablas y formas) y fase 2 (las piezas con pantalla: piano, círculo, teclado y su editor, cifrado, micrófono, ayudas del Entrenador) **hechas**. Sigue la fase 3 (las pestañas). Detalle y estado en `ARQUITECTURA.md`.

## 8. A dónde va tu respuesta

Si subís vos a GitHub, seguí el apartado 2 (para eso hace falta ser colaborador del repositorio). Si no usás GitHub, o querés que lo revise Claude antes, pegala (o subí el archivo) en el panel, en **«Trabajar con una sesión gratuita de Claude»**. **Nada llega al sitio de los alumnos sin que Mauro lo pase del sitio de desarrollo al estable.**
