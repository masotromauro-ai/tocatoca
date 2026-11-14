# shared/ui/teoria — las piezas visuales de teoría

| Archivo | Qué es |
|---|---|
| `notas.jsx` | `NotaDot`, `Nota`, `TensionChip`: la nota como círculo del color tonal |
| `Piano.jsx` | piano de tres octavas con el color de cada tecla |
| `Funciones.jsx` | tarjeta de función armónica y tabla comparativa |
| `Circulo.jsx` | el círculo de armonía |

Las usan Acorde, Progresión, Biblioteca y Modos. Usa: `shared/teoria/`, `shared/ui/tema.js` y `shared/audio/`.
Se movió sin reescribir: no cambia lo que dibuja.

Cómo se prueba: `node pruebas/humo.mjs`.
