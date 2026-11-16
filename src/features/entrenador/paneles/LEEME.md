# paneles/ — un panel por modo del Entrenador

Qué es: la pantalla de cada modo del Entrenador (Escalas, el camino, el arpegio,
la distribución de voces, Armar acordes y Ubicar líneas), un archivo por modo,
sacados tal cual de `EntrenadorTab` en la fase 6 con `herramientas/vista.mjs`.

Reglas: el ESTADO no vive acá — queda en los hooks del Entrenador y llega como
props (si se mudara con el panel, lo que el alumno escribió se perdería al
cambiar de pestaña). Un panel no importa de otro feature (regla 2) y ninguna
clave `bandomaps_…` se escribe a mano (regla 4: `shared/claves.js`).

Intocable: las props que cada panel recibe son su contrato con los hooks; un
cambio de forma se hace en los dos lados en la misma tanda.
