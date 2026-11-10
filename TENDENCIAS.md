# BandoMaps — referencias y tendencias (revisión del plan, 10-nov-2026)

Para que la reestructura no quede vieja en un año y que la app sea agradable para los alumnos.
Se buscó qué hacen hoy las apps parecidas y hacia dónde va el desarrollo de aplicaciones. **Ojo
con la calidad de las fuentes**: casi todo lo que se encuentra son reseñas y blogs, varios con
interés comercial; donde un dato no tiene respaldo serio, se dice.

## 1. Qué hacen las apps parecidas

### Apps para aprender un instrumento (las más usadas)

| App | Lo que la distingue | Qué nos sirve |
|---|---|---|
| Yousician | Juego: puntos, niveles y desafíos, con puntaje en tiempo real escuchando por el micrófono. Es la más descargada y la de nivel gratuito más usable | La respuesta inmediata al tocar; los niveles como camino |
| Simply Piano | Mezcla de juego y método; pensada para quien aprende mirando | Sesiones cortas y guiadas |
| Skoove | Escucha en tiempo real **y** lectura desde el primer día; menos «juego» | Que la respuesta enseñe, no sólo puntúe |
| flowkey | Primero las canciones, con la partitura sincronizada | Motivación por repertorio: tocar algo que uno quiere |

Fuentes: [Skoove (blog propio)](https://www.skoove.com/blog/best-piano-apps/),
[American Songwriter](https://americansongwriter.com/best-piano-learning-apps/),
[HackerNoon](https://hackernoon.com/best-piano-learning-apps-in-2026-an-in-depth-comparison-of-music-education-technology),
[Preply](https://preply.com/en/blog/best-piano-learning-apps/). Varias son de las propias empresas o
patrocinadas: se toman las ideas, no los rankings.

### Apps de bandoneón y acordeón de botones

| App | Lo que tiene |
|---|---|
| [Bandoneon (iOS)](https://apps.apple.com/us/app/bandoneon/id546330120) | Las dos manos por separado, mostrar u ocultar el nombre de las notas, cambia con el fuelle |
| [Mezquite Diatonic Accordion](https://apps.apple.com/us/app/mezquite-diatonic-accordion/id1060954956) | Enciende los botones que hay que tocar **y dice con qué dedo** |
| [Accordion Diatonic Cassoto](https://apps.apple.com/us/app/accordion-diatonic-cassoto/id1074109980) | Enciende lo que se toca, aprendizaje por niveles, se conecta a un teclado externo |
| [Bandoneon 144 (web)](https://behinger.github.io/bandoneon/) | Mapa del Arnold de 142 botones y **láminas para imprimir** en PDF |
| [Acordeón Virtual (web)](https://acordeonvirtual.com/en/) | Simulador en el navegador, también tipo bandoneón, en teléfono y tableta |

**Lo que no encontramos en ninguna y BandoMaps sí tiene:** el código de colores como método, un profesor de carne y
hueso que deja tareas, y la medición del avance de cada alumno para ese profesor. Es la mezcla de
clase con persona y práctica con app: **ése es el lugar de BandoMaps**, no competir con Yousician.

**Lo que conviene tomar:** enseñar el dedo junto con el botón (el docente ya puede indicar los
dedos de un ejercicio en el Organizador, `DEDO_OPC`; falta que el alumno los vea en el teclado), retirar de a poco las ayudas (nombres de notas que se apagan a medida que el alumno
mejora), niveles claros, láminas del teclado para imprimir, y la escucha que corrige al tocar.

## 2. Hacia dónde va el aprendizaje con apps

Las fuentes son mayormente blogs de tendencias
([TTMS](https://ttms.com/10-gamechanging-elearning-trends-to-watch/),
[EasyB](https://easyb.org/learning-trends-2026/),
[Exploding Topics](https://explodingtopics.com/blog/education-trends)); se repiten tres ideas:

- **Sesiones cortas** de pocos minutos, que se repiten espaciadas (lo que se olvida vuelve antes).
  BandoMaps ya lo hace en la práctica de «El Código» (lo que se falla vuelve más seguido) y desde
  el 8-nov **mide los aciertos por nota de cada alumno**: con eso se puede armar la práctica del día.
- **Respuesta inmediata y que se adapta**: la dificultad sigue a lo que el alumno ya domina.
- **Juego liviano** (rachas, metas, desafíos). **No hay evidencia seria de que las rachas ayuden a
  aprender a largo plazo**: se usan como apoyo, se miden, y se prefieren las metas que pone el
  docente («3 prácticas con 80 %») a los puntos y rankings.

**Accesibilidad, que en esta app importa el doble:** el método usa color, y una parte de la gente
(sobre todo varones) no distingue bien algunos colores. **Nada puede depender sólo del color**:
cada nota lleva también su nombre o una marca, y hace falta un modo que lo garantice.

## 3. Hacia dónde va el desarrollo de aplicaciones web

Fuentes: [LogRocket](https://blog.logrocket.com/8-trends-web-dev-2026/),
[Netguru («adoptar, mirar, saltear»)](https://www.netguru.com/blog/front-end-trends),
[OpenReplay](https://blog.openreplay.com/technologies-worth-watching-2026/). Para el sonido:
[Web Audio API 1.1 (W3C)](https://www.w3.org/TR/webaudio-1.1/),
[AudioWorklet en el mapa de la plataforma web](https://web-platform-dx.github.io/web-features-explorer/features/audio-worklet/),
[cómo funciona la detección de altura en el navegador](https://www.musicalboard.com/blog/2026-05-05-pitch-detection/),
[qué latencia esperar](https://pitchdetector.com/real-time-browser-pitch-detection-explained/).

| | Qué es | Para BandoMaps | Hoy |
|---|---|---|---|
| **Adoptar** | **Vite** como base de proyectos React | Ya lo usamos (v6). Se mantiene | ✔ |
| **Adoptar** | **React 19 + React Compiler** (versión 1.0 desde octubre de 2025, integrado a Vite): optimiza solo y saca los `useMemo` a mano | El Entrenador tiene 18 `useMemo`: código más simple de leer para una persona y para un chat | React 18: falta |
| **Adoptar** | **App instalable que anda sin conexión** (PWA): ícono en el teléfono, abre sin señal | Un alumno practica en el colectivo o sin datos | **No es instalable**: falta |
| **Adoptar** | **AudioWorklet** para escuchar: el análisis corre en el hilo del sonido, no en el de la pantalla | La escucha física hoy usa el método viejo (`AnalyserNode` en el hilo de la pantalla): con el teclado dibujándose, se traba. Aun así, del micrófono a la pantalla siempre hay unos 60–100 ms | Falta |
| **Adoptar** | **Fichas de contexto para asistentes de IA** (AGENTS.md, archivos chicos) | Es el plan de las fichas `LEEME.md` y los paquetes por área | En marcha |
| **Mirar** | **Web MIDI**: conectar un bandoneón o teclado digital | Útil para quien tenga uno; no anda en todos los navegadores | — |
| **Mirar** | **Local-first** (los datos viven en el teléfono y se sincronizan) | Firestore ya guarda copia local; falta encender su caché persistente | — |
| **Mirar** | **Tailwind 4** | La app casi no usa Tailwind (usa estilos propios); no apura | — |
| **Saltear** | Componentes de servidor, Next.js, microfrontends, Web Components | Son para sitios con servidor o equipos grandes. BandoMaps es una app del navegador: agregarían peso sin ganar nada | — |
| **Saltear (por ahora)** | Un tutor de IA para el alumno | Costo, privacidad de menores y el cupo gratuito (Gemini sin facturación usa lo que recibe) | — |

**Lo que hace que la propuesta no envejezca:** no está atada a una moda sino a tres cosas que no
cambian: **archivos chicos con un solo tema**, **lógica separada de la pantalla**, y **pruebas que
vigilan las reglas**. Cambiar React, Tailwind o el modo de publicar se vuelve un cambio de una
fase, no una reescritura.
