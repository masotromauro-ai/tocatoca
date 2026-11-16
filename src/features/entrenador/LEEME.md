# features/entrenador — el Entrenador de improvisación

| Carpeta | Qué es |
|---|---|
| `ayudas/` | el lienzo de pintar y el cuadro de formas del Entrenador |

| `paneles/` | un panel por modo (escalas, camino, arpegio, voz, construir, líneas) |

Desde la fase 6 (16-nov-2026) la pestaña vive acá entera: `EntrenadorTab.jsx` es el esquema; el estado está en
`hooks.jsx` (y `acordes.jsx`, `camino.jsx`, `piezas.jsx`) y cada modo en su panel, que lo recibe como props.
Un feature no importa de otro: sólo de `shared/` y de sí mismo. Los selectores y desplegables que usan varias
pestañas viven en `shared/ui/ayudas.jsx`; la hoja de color, en `shared/ui/hoja-de-color.jsx`.
