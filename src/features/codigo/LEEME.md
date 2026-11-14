# features/codigo — la pestaña El Código

| Archivo | Qué es |
|---|---|
| `ElCodigoTab.jsx` | la pestaña y la hoja de color |
| `capitulos.jsx` | el texto del manual, por capítulos (`@datos`) |
| `entrena.jsx` | el entrenador de colores |

Las figuras y la rueda de la paleta que también usan Modos y Colores viven en `shared/ui/codigo/`; las cuentas de color, en `shared/teoria/color-hsl.js`. **Ojo:** `public/codigo.html` es otra versión, paralela, que no pasa por el build y no se mezcla con ésta.

Cómo se prueba: `node pruebas/humo.mjs` y `node pruebas/codigo.mjs`.
