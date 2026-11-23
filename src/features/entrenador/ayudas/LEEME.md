# features/entrenador/ayudas — piezas del Entrenador

| Archivo | Qué es |
|---|---|
| `lienzo.jsx` | `PaintCanvas`: el teclado donde se pintan teclas, con `canalGrafo` y `rutaCanal` |
| `formas.jsx` | el cuadro de formas (`FormaCanvas`, `matchForma`) y las líneas (`lineasDe`) |

Los selectores y desplegables viven en `shared/ui/ayudas.jsx`. Usa: `shared/bandoneon/` (layouts, camino, acordes-base), `shared/teoria/` y `shared/ui/`.
**Intocables:** no cambia lo que dibuja (la prueba de humo compara las 12 pestañas) ni `medir()` / `medirLote()`.

Cómo se prueba: `node pruebas/humo.mjs`.
