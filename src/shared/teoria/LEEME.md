# shared/teoria — la teoría musical, sin pantalla

| Archivo | Qué es |
|---|---|
| `notas.js` | nombres de notas, enarmónicos, `spell` (cómo se escribe cada nota según la tonalidad), escalas, `LAT` (nombres latinos) |
| `color.js` | la paleta oficial `NC` (la del manual) y las mezclas de luz |
| `escalas.js` | modos, círculo de quintas, grados |
| `acordes.js` | fórmulas de acordes, sus funciones, `parseChord` |
| `progresiones.js` | grados romanos, familias, análisis y cálculo de progresiones |

Usa: sólo `notas.js` y entre sí (notas → color/escalas → acordes → progresiones; sin ciclos).

**No tocar sin pensar:** `NC` está **copiada** en `public/gestos/musica.js` (esa página no pasa por el build): si cambia una, cambia la otra. Las notas se escriben **según la tonalidad** (La mayor → Do♯, no Re♭): nunca con una tabla fija.

Cómo se prueba: `node pruebas/codigo.mjs` y `node pruebas/humo.mjs`.
