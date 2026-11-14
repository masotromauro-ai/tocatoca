# shared/bandoneon — el teclado y las formas

| Archivo | Qué es |
|---|---|
| `tablas.js` | botones del bandoneón (izquierda y derecha, abre y cierra, octavas) e `itemsMano` (la altura real de cada botón) |
| `voicings.js` | formas recomendadas: patrones por función de cada nota aplicados a los botones reales |
| `layouts.js` | posiciones por defecto, tamaños y ajuste a la grilla de los botones |
| `almacen.js` | cómo se guarda el teclado de cada uno en el teléfono |
| `csv.js` | importar y exportar el teclado (CSV y CSS) |
| `Botones.jsx` | `BBtn` y `BGrid`: el botón base y la grilla |
| `Teclado.jsx` | el dibujo del teclado: botón, mapa de alturas y lienzo |
| `Modales.jsx` | guardar y cargar teclados |
| `Editor.jsx` | el editor para mover botones |
| `acordes-base.js` | las piezas con que se arma un acorde en el teclado |
| `camino.js` | caminos de notas, escalas y arpegios sobre el teclado, y armado de voces |

Usa: `shared/teoria/notas.js`; `voicings.js` usa `tablas.js`.

**Decisiones del profesor (9-nov):** dos formas por acorde (marcato y lleno), se puede omitir la 5ª, una regla por tipo de acorde repetida en las doce tonalidades. Ajustar `PATRONES_VOZ`, `elegirVoicing` y `voicingsDe`, no reescribir.

Bandoneón **bisonoro**: cada botón da una nota al abrir y otra al cerrar; 33 botones a la izquierda, 38 a la derecha. **No es isomórfico**: la forma no se transporta a otra tonalidad.

Cómo se prueba: `node pruebas/humo.mjs`.

`acorde.js`: `calcAcorde`, de las piezas elegidas en el armador a las notas con su escritura correcta.

`armador.jsx` y `disposicion.jsx`: el armador de acordes (`ArmadorAcordes`, `useAcorde`, `armarVoicing`) y dónde cae cada acorde en cada mano (`DisponibilidadAcorde`, `useDisposicion`, `calcAnchos`). Los usan la pestaña Acorde y la pestaña Bandoneón.
