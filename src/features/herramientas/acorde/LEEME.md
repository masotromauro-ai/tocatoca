# features/herramientas/acorde — la pestaña Acorde

`AcordeTab.jsx`: escribir o elegir un acorde y ver sus funciones. **El estado (`chord`, `chordInput`, `openFns`…) vive en `App.jsx` y llega como props**: así lo que el alumno escribió no se pierde al cambiar de pestaña. Si se mudara el estado acá, se reiniciaría en cada cambio. El armador de acordes que usa también la pestaña Bandoneón está en `shared/bandoneon/`.

Cómo se prueba: `node pruebas/humo.mjs`.
