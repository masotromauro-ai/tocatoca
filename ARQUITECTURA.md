# BandoMaps — cómo partir App.jsx (propuesta de arquitectura y plan)

Propuesta del 10-nov-2026. **No se cambió ni una línea de código para escribirla**: lo único
nuevo que existe es el mapa de áreas (`areas.json`), la herramienta que lo lee
(`herramientas/areas.mjs`) y su prueba (`pruebas/areas.mjs`). Todo lo demás es plan.

## En una página

- `src/App.jsx` tiene **7.322 líneas y 293 declaraciones** en un solo archivo, unas **165 mil
  unidades de lectura** (tokens): ningún chat gratuito lo abre entero, y cualquier cambio
  puede pisar otra cosa (pasó el 9-nov).
- Propuesta: **carpetas por tema (features) + una base compartida (shared)**, con una sola
  dirección de dependencias, archivos de **hasta 300–400 líneas** y una **ficha LEEME.md por
  carpeta**. Cada área se puede entender, probar y cambiar sola.
- Se hace **moviendo, no reescribiendo**: cada paso mueve código tal cual, con una red de
  seguridad que comprueba que la pantalla y los datos no cambiaron.
- Del total, **22 de 23 áreas pesan hasta unas 14 mil unidades**: caben en un chat gratuito con
  lugar para la guía. La única grande es el Entrenador (30 mil), que se parte al final.
- **Lo primero que se vuelve trabajable**: las formas recomendadas (47 líneas de lógica pura).

## Revisión del 10-nov: qué cambió en el plan

Se contrastó con las apps parecidas y con las tendencias de 2026 (detalle y fuentes en
`TENDENCIAS.md`). La base del plan se sostiene: carpetas chicas por tema, lógica separada de la
pantalla y pruebas que vigilan las reglas no dependen de ninguna moda. Cambian tres cosas:

1. **Se suma una fase 7, «la plataforma al día»**, que va **después** de partir el archivo (en
   archivos chicos cada cambio se prueba mejor): React 19 con el React Compiler (saca a mano los
   38 `useMemo` de hoy), la app instalable y que anda sin conexión, y la escucha con AudioWorklet.
2. **Se abre un carril de producto para los alumnos**, en paralelo desde que termina la fase 1, con
   lo que hacen las mejores apps y BandoMaps todavía no: la práctica del día (corta, armada con lo
   que más falla cada uno), nada que dependa sólo del color, el dedo en el botón, ayudas que se
   apagan a medida que se avanza, y láminas del teclado para imprimir.
3. **Se escribe qué NO se adopta** (componentes de servidor, Next.js, microfrontends, un tutor de
   IA para los alumnos), para que nadie lo agregue por moda.

## El problema, medido

| | Hoy |
|---|---|
| `src/App.jsx` | 7.322 líneas · 547 KB · ~165 mil tokens |
| Declaraciones de primer nivel | 293 (todas en el mismo archivo) |
| `EntrenadorTab` | 1.129 líneas · 34 estados · 18 cálculos guardados · 16 efectos |
| `BandoMapsApp` (la raíz) | 565 líneas · 15 estados · **tres herramientas adentro** (Acorde, Progresión y Biblioteca, unas 330 líneas) |
| Archivos de `src/components`, `theory`, `audio` | 36, **ninguno se usa**: son copias viejas de lo que está adentro de App.jsx |

Consecuencias reales: el 9-nov una subida entera de `App.jsx` devolvió las claves de guardado
a su nombre viejo y sacó la medición del avance de los alumnos, sin que ningún aviso saltara.

## Qué tomamos de las arquitecturas de referencia (y qué no)

- **[Bulletproof React](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md)**:
  carpetas por *feature* más una base compartida. Dos reglas que se hacen cumplir: **un feature
  no importa de otro**, y las dependencias van **en un solo sentido** (shared → features → app).
  Cada feature usa sólo las subcarpetas que necesita. Su propio
  [AGENTS.md](https://github.com/alan2207/bulletproof-react/blob/master/AGENTS.md) es el modelo de
  nuestras fichas `LEEME.md`: un renglón por carpeta, qué es y qué reglas tiene.
- **Feature-Sliced Design**: nos quedamos con la idea de fondo —capas con dependencia en una
  sola dirección, vigiladas por una herramienta y no por la memoria de alguien— y **dejamos sus
  siete capas**: para una persona y su asistente son más indirección de la que se necesita.
  (Hay equipos que migraron de FSD a Bulletproof justamente por ese exceso.)
- **Núcleo funcional, cáscara con efectos** (la misma que ya usa el resto del ecosistema: la
  lógica pura va en archivos `.js` sin pantalla ni red, con su prueba de `node`; la pantalla
  los llama).
- **Una ficha por carpeta para el asistente**: el archivo corto que dice qué hay y qué no se
  toca. Es lo que permite pedir un cambio chico sin darle el proyecto entero.

**No hacemos:** pasar a TypeScript, meter un manejador de estado global, ni reescribir la
lógica. Esta propuesta cambia *dónde* vive el código, no *qué* hace.

## La estructura propuesta

```
src/
  main.jsx · Puerta.jsx           (ya existen; no se tocan)
  App.jsx                         ← sólo el esquema: pestañas y estado compartido (≤ 250 líneas)
  shared/                         ← lo que usan varias pestañas; NO importa de features
    teoria/    notas.js · color.js · escalas.js · acordes.js · progresiones.js · cifrado.js
    audio/     audio.js · mic.js
    ui/        tema.js · (piezas de teoría: Piano, FnCard, Circulo…)
    bandoneon/ tablas.js · layouts.js · almacen.js · csv.js · camino.js · voicings.js
               BandBtn.jsx · BandCanvas.jsx · BandEditor.jsx · modales
  features/                       ← una carpeta por pestaña; NO importan unas de otras
    codigo/        ElCodigoTab · rueda · práctica · capitulos.js (el texto del manual, solo datos)
    teoria/        las seis lecciones
    bandoneon/     la pestaña Bandoneón
    entrenador/    useEntrenador.js + un panel por modo (forma, notas, camino, colores, acordes,
                   escalas, líneas, construir, armonizar)
    herramientas/  acorde/ · progresion/ · biblioteca/ · quintas/ · modos/ · colores/
    clases/        Organizador · Mis tareas · ingresos · registro de lo que se practica
```

Cada carpeta lleva un `LEEME.md` de **hasta 40 líneas**: qué hace, qué archivos tiene, qué otras
carpetas usa, qué **no** se toca y cómo se prueba. Cada feature se publica con un `index.js`;
sólo `App.jsx` los importa. Cuando una pestaña necesita ir a otra (por ejemplo «Practicar» abre
el Entrenador), lo pide por una función que le pasa `App.jsx`, no importando al otro feature.

## Seis reglas (las vigila una prueba, no la buena voluntad)

1. **Un archivo, un tema, hasta 300 líneas** (400 como máximo duro; los archivos de datos
   —como el manual— pueden pasar y lo declaran con `// @datos`).
2. **Dependencias en un solo sentido**: `shared` no importa de `features`; un feature no importa
   de otro; sólo `App.jsx` conoce a todos.
3. **La lógica pura no sabe de pantalla**: nada de React, `window` ni `localStorage` en
   `shared/teoria`, `shared/audio` (lo que no sea el motor de sonido) ni `voicings.js`. Cada
   archivo así tiene su prueba de `node`.
4. **Lo que se guarda en el teléfono tiene un solo dueño**: las claves `bandomaps_*` se
   declaran en un archivo y nadie escribe una a mano en otro lado.
5. **Lo intocable está nombrado** en la ficha de cada carpeta (la medición `medir()`,
   `window.__tab`, `__ALUMNO`, `__USUARIO`, las claves de guardado, `Puerta.jsx`, `public/cuenta/`).
6. **Una subida nunca es el archivo entero de un área grande**: se entregan archivos completos
   *de un módulo chico*. (Es la respuesta al problema del 9-nov; depende de la decisión V8.)

La prueba que las vigila (`pruebas/arquitectura.mjs`, sin npm) se escribe en la fase 0 y empieza a
exigir desde que existe la primera carpeta nueva.

## Cómo se parte sin romper nada

**Mover, no reescribir.** En cada paso se corta un tramo de `App.jsx`, se lo pega tal cual en su
archivo nuevo, se agregan los `import`/`export` y nada más. Tres controles automáticos:

- **`pruebas/mover.mjs`** *(a construir)*: compara el conjunto de renglones de código antes y
  después, ignorando `import`/`export`. Si un renglón cambió o desapareció, falla: es la prueba de
  que sólo se movió.
- **`pruebas/humo.mjs`** *(a construir)*: abre la app en un navegador, entra a cada pestaña,
  guarda el HTML que dibuja y lo compara con el de antes del paso. Falla si aparece un error en la
  consola o si cambia lo que se ve. Corre en el chat de Claude; Mariano no instala nada.
- **Los bancos de siempre** (`codigo`, `gestos`, `medir`, `puerta`, `registro`, `usuarios`) y
  `vite build`.

Una fase se publica **sólo si los tres pasan**. Cada fase es una subida chica y se puede deshacer
sola.

## El plan, fase por fase

Los tamaños salen de `areas.json` (se pueden recalcular con `node pruebas/areas.mjs`).

| Fase | Qué se mueve | Líneas | Queda | Riesgo | Lo que se gana |
|---|---|---:|---|---|---|
| **0** | **Nada del código.** Se escriben `humo`, `mover`, `arquitectura`; se decide V8–V11 | 0 | la red de seguridad | ninguno | Se puede empezar a mover sin miedo |
| **1** | Lo puro, sin pantalla: notas y color, estilos, sonido, teoría de acordes, biblioteca (datos), tablas del teclado, texto del manual, **formas recomendadas** | 997 | `shared/teoria`, `shared/audio`, `shared/ui/tema`, `shared/bandoneon/{tablas,voicings}.js` | bajo | **Las formas recomendadas se vuelven un archivo de ~50 líneas con su prueba**: se pueden rehacer con el criterio del profesor sin abrir el resto |
| **2** | Piezas compartidas con pantalla: dibujo y editor del teclado, guardado del teclado, piezas visuales de teoría, ayudas del Entrenador, cifrado y micrófono | 1.955 | `shared/bandoneon/*`, `shared/ui/teoria/*` | medio | Un cambio en el teclado se prueba en un lugar |
| **3** | Pestañas chicas: El Código, Teoría, Quintas, Modos, Colores, Clases y registro | 1.882 | `features/codigo`, `teoria`, `herramientas/{quintas,modos,colores}`, `clases` | medio (clases: alto, toca datos de alumnos) | Cada pestaña es una carpeta que un chat gratuito abre entera |
| **4** | La raíz y el armador de acordes: las tres herramientas de adentro de `BandoMapsApp` pasan a su carpeta; `App.jsx` queda como esquema | 866 | `App.jsx` ≤ 250 líneas, `features/herramientas/{acorde,progresion,biblioteca}` | alto (es el centro) | Se ve de un vistazo qué pestañas hay y qué estado comparten |
| **5** | Pestaña Bandoneón | 491 | `features/bandoneon/` (4 archivos) | alto | Se toca la escucha física sin mover el mapa |
| **6** | **Entrenador**: un hook `useEntrenador` con el estado y **un panel por modo** | 1.129 | `features/entrenador/` (~10 archivos) | alto | El archivo más grande del proyecto deja de existir; las formas recomendadas se enchufan en un panel |
| **7** | **La plataforma al día**: React 19 + React Compiler; app instalable que anda sin conexión (como el panel); escucha con AudioWorklet; caché persistente de la base | — | `vite.config.js`, `public/manifest`, `sw.js`, `shared/audio/mic.js` | medio | Menos código a mano, se practica sin señal, la escucha no se traba |

**Unas 19 subidas chicas** en total (0: 2 · 1: 2 · 2: 2 · 3: 3 · 4: 2 · 5: 1 · 6: 4 · 7: 3). Se puede
frenar entre fases sin perder nada: después de la fase 1 el proyecto ya anda mejor que hoy.

**Por qué este orden:** primero lo que no tiene pantalla (no hay nada que romper a la vista),
después lo que usan varias pestañas, después cada pestaña sola, y al final el Entrenador, que
depende de todo lo anterior y es el más enredado (34 estados que se reparten entre modos).

## El carril de producto: lo que los alumnos notan

Corre en paralelo a las fases 2 a 7, de a una mejora por vez y siempre en una carpeta nueva y
chica (así nunca vuelve a crecer un archivo gigante). En orden de valor para el alumno:

| | Qué | De dónde sale | Necesita |
|---|---|---|---|
| A | **La práctica del día**: 5 a 10 minutos con lo que más le falla a cada uno, que se repite espaciado | Las apps de mayor uso y el aprendizaje en sesiones cortas; los datos ya se miden desde el 8-nov | fase 1 + la pestaña «Alumnos» |
| B | **Nunca sólo color**: nombre de la nota o una marca en cada botón, y un modo que lo garantice | Accesibilidad: hay quien no distingue bien algunos colores | fase 1 (`shared/ui/tema.js`) |
| C | **El dedo en el botón** y **ayudas que se apagan** con el avance | Apps de acordeón de botones (dedos, nombres que se ocultan) | fase 2 (teclado) |
| D | **Formas recomendadas** del profesor, con «ver todas las notas» aparte | El pedido de Mariano | fase 1 + respuestas V6, V7, V11 |
| E | **Láminas del teclado para imprimir** | Herramientas web de bandoneón | fase 2 |
| F | **Metas del docente** en vez de puntos («3 prácticas con 80 %»), con una racha suave y medida | El juego liviano ayuda a volver; no hay pruebas serias de que las rachas enseñen | tareas con meta (plan de BandoMaps) |
| G | **Escucha que corrige al tocar**, probada con un bandoneón real | Yousician y Skoove escuchan y corrigen | fase 7 (AudioWorklet) |

Lo que decide el orden real es el profesor: está como pregunta en su panel.

## Qué gana el desarrollo: potencia por áreas

- **Trabajo en paralelo sin pisarse**: Mariano puede afinar *El Código* mientras otro cambio
  toca *Quintas*; ninguna subida lleva más que su carpeta.
- **Cada área es una conversación completa con un asistente**: la ficha + los archivos de la
  carpeta suman entre 1 y 14 mil unidades. Entra en el cupo gratuito con lugar para pensar y
  contestar. Hoy no entra.
- **Contenido separado de lógica**: el texto del manual (`capitulos.js`) y la biblioteca de
  progresiones son datos; se corrigen sin tocar código que suena o dibuja.
- **Cada cambio de lógica trae su prueba**: la teoría, el sonido y las formas se prueban con
  `node`, sin abrir un navegador.
- **Menos riesgo para los alumnos**: una subida chica cambia poco; si algo falla, se deshace esa.

## Trabajar con poco cupo: una intervención enfocada

Mientras `App.jsx` siga entero (fase 0 a 6), cada área se baja como un **paquete**: la guía
general + la ficha del área + el código de esa área recortado del archivo. Desde el panel de
Mariano: *Trabajar con tu propio chat → Paquete de un área*. Cuando una área ya sea carpeta, el
paquete trae sus archivos reales; lo que ve Mariano no cambia.

La regla de la intervención: **un área, hasta tres archivos, hasta 400 líneas tocadas**, y se
devuelve **código completo de lo que cambió** (la función o el archivo entero, nunca «…» ni
fragmentos sueltos) más cómo probarlo. Lo analiza Claude contra el resto del proyecto antes de
publicar, porque un cambio chico puede chocar con otra área.

## Decisiones que necesito (están en el panel de Mariano)

- **V8** — cómo llegan sus cambios al código. Define cómo se hace todo lo demás.
- **V9** — si se parte `App.jsx` según este plan (y a qué ritmo).
- **V10** — si se borran los 36 archivos viejos sin uso (`src/components`, `theory`, `audio`).
- **V11** — dónde viven las formas recomendadas: en la base de datos o en un archivo.

Mientras no estén contestadas, **no se toca `App.jsx`**.
