# Guía para tu chat — BandoMaps

Esta guía es para tu asistente (el chat de IA que usás). Es corta a propósito: dale **este
archivo y el paquete de UN área**, no el proyecto entero. El proyecto entero (`src/App.jsx`)
tiene 7.322 líneas, unas 165 mil unidades de lectura, y no entra en un chat gratuito.

## Qué es BandoMaps

Una web para que alumnos de bandoneón aprendan la **mecánica y la topografía de los teclados**.
La música, el fraseo y el aire los guía el profesor. **El usuario que te pide cosas es ese
profesor** (Mariano); los usuarios finales son sus alumnos. Respondé en castellano rioplatense
(voseo) y sin jerga: el profesor no programa.

Hecha con React + Vite + Tailwind, sin base propia en el navegador más que `localStorage` y
una base en la nube (Firebase) para cuentas y avance. Repositorio público:
`masotromauro-ai/tocatoca`. Cuando se pueda, trabajás sobre `src/` (ver abajo cómo está armado).

## Vocabulario del dominio

- **Bandoneón bisonoro**: cada botón da **una nota al abrir el fuelle y otra al cerrarlo**. 71
  botones: **33 en la mano izquierda, 38 en la derecha** (sistema Rheinische).
- **Fuelle**: «abre» o «cierra». Una misma forma puede existir en un fuelle y no en el otro.
- **No es isomórfico**: la misma forma geométrica **no** se transporta a otra tonalidad. Por eso
  las formas se guardan como **reglas por función de cada nota** (R raíz, 3, 5, 7), registro,
  mano y fuelle, y se resuelven contra el teclado real.
- **pc** (clase de nota, 0–11), **midi** y **oct** (octava): cómo se identifica una nota en el código.
- **Voicing / «forma»**: cómo se arma un acorde en el teclado. **Marcato**: acompañamiento en la
  izquierda, cerrado y con inversiones. **Lleno**: para el solo, tenido: bajo + notas guía.
- **Cifrado**: «jazz» (△7, m7, ø7, °7) o «americano» (maj7, m7, m7♭5, dim7). Las notas se
  escriben **según la tonalidad** (La mayor → Do♯, no Re♭): nunca con una tabla fija.
- **Paleta de estudio vs paleta real**: dos paletas de los doce colores. La **oficial** vive en
  `NC` (`src/App.jsx`) y es la única fuente del color de cada nota.
- **Rol del usuario**: administrador, docente o alumno. La app no se abre sin cuenta.

## Cómo está armado

Hoy casi todo vive en **un solo archivo**, `src/App.jsx`. Está partido en **23 áreas** (mapa en
`areas.json`: cada una dice qué hace, su tamaño, adónde va y cómo probarla). El plan para
partirlo en carpetas está en `ARQUITECTURA.md`. Mientras tanto, **cada área se baja como un
paquete** (esta guía + la ficha del área + su código recortado).

## Cómo trabajar: una intervención = un área

1. **Elegí un área.** Usá sólo su paquete. No pidas ni pegues el archivo entero.
2. **Mirá qué usa y quién la usa.** Si tu cambio renombra o cambia lo que devuelve una función
   que usa otra área, **avisalo antes de cambiarla** y proponé otra salida.
3. **Devolvé la propuesta en este formato:**
   - **Qué cambia y por qué** (3 renglones, sin jerga).
   - **El código completo** de cada función o archivo que cambia, con su nombre exacto. **Nunca**
     fragmentos con «…» ni «el resto igual»: se pega tal cual y el resto se pierde.
   - **Cómo probarlo**: qué pestaña abrir, qué tocar y qué debería verse.
   - **Qué NO tocaste**.
4. **Un área, hasta tres archivos, hasta 400 líneas tocadas.** Si hace falta más, partilo en dos
   intervenciones.
5. **La lógica pura** (teoría, formas, sonido) se entrega con una prueba chica de `node`
   (sin navegador ni npm), como las de `pruebas/`.

## Lo que no se toca (rompe cosas que ya andan)

- Las claves de guardado `bandomaps_*` en `localStorage`: **no se renombran** (los alumnos perderían
  lo suyo). No existe ninguna `harmonia_*`: si aparece, es un error.
- `medir()`, `medirLote()`, `window.__tab`, `window.__ALUMNO`, `window.__USUARIO`: son lo que
  mide el avance de cada alumno. Sacarlos no da error: **sólo deja de medirse**.
- Los `import` del principio, `src/Puerta.jsx`, `public/cuenta/` y `firestore.rules`.
- Contraseñas, claves o datos de alumnos: **nunca** en una respuesta ni en un archivo.
- El nombre de las declaraciones que están en `areas.json`: el mapa las usa para armar los
  paquetes. Si agregás o renombrás una, decilo para que se actualice el mapa.

## Lo que el profesor ya decidió (9-nov-2026, contestado en su panel)

- **Formas recomendadas: dos por acorde.** *Marcato* (acompañamiento) y *lleno* (para el solo).
- **Se puede omitir la 5ª.** Ejemplos: **Do △7 = Do2 + Mi4 + Si4**; **Sol 7 = Sol2 + Fa4 + Si4**
  (bajo abajo y las dos notas guía, 3ª y 7ª, en la octava 4).
- **Una regla por tipo de acorde, repetida en las doce tonalidades.** Ajustar las reglas que ya
  existen (`PATRONES_VOZ`, `elegirVoicing`, `voicingsDe`), no reescribir.
- Lo que sigue abierto (si repite igual en el otro fuelle, si el «lleno» usa las dos manos) está
  en «Te preguntamos» del panel: no lo supongas.

## A dónde va tu respuesta

Pegala (o subí el archivo) en el panel de Mariano, en **«Trabajar con tu propio chat»**. La lee
Claude, la analiza contra el resto del proyecto —estructura, arquitectura, objetivos y que sea
simple para el alumno— y recién después se publica. **Nada llega al sitio de los alumnos sin
pasar por ahí.**
