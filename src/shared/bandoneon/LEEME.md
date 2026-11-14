# shared/bandoneon — el teclado y las formas

| Archivo | Qué es |
|---|---|
| `tablas.js` | botones del bandoneón (izquierda y derecha, abre y cierra, octavas) e `itemsMano` (la altura real de cada botón) |
| `voicings.js` | formas recomendadas: patrones por función de cada nota aplicados a los botones reales |

Usa: `shared/teoria/notas.js`; `voicings.js` usa `tablas.js`.

**Decisiones del profesor (9-nov):** dos formas por acorde (marcato y lleno), se puede omitir la 5ª, una regla por tipo de acorde repetida en las doce tonalidades. Ajustar `PATRONES_VOZ`, `elegirVoicing` y `voicingsDe`, no reescribir.

Bandoneón **bisonoro**: cada botón da una nota al abrir y otra al cerrar; 33 botones a la izquierda, 38 a la derecha. **No es isomórfico**: la forma no se transporta a otra tonalidad.

Cómo se prueba: `node pruebas/humo.mjs`.
