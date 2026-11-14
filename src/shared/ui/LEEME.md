# shared/ui — estilos compartidos

`tema.js`: tipografía y estilos de botones (`UI_FONT`, `uiPill`, `uiPlay`, `uiMarcar`, `uiVista`, `uiTool`, `uiGhost`, `uiLabel`). Sólo datos de estilo.

También: `controles.jsx` (panel de notas marcadas y grupos), `Popover.jsx` (ventana chica anclada a una tecla) y `teoria/` (piezas visuales de teoría, con su propia ficha).

Para el alumno: **nada puede depender sólo del color** (cada nota lleva también su nombre o una marca). Cuando se haga el modo que lo garantiza, va acá.

Cómo se prueba: `node pruebas/humo.mjs` (si un estilo cambia, la foto de las pestañas cambia a propósito y se rehace con `--guardar`).
