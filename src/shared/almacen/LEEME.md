# shared/almacen — lo que se guarda en el teléfono

| Archivo | Qué es |
|---|---|
| `preferencias.js` | el estilo de cifrado (△7 o maj7) y los nombres propios de acordes |

Las claves de `localStorage` no se escriben acá: salen de `shared/claves.js` (regla 4).
Usa: `shared/claves.js`. Lo usan `shared/teoria/cifrado.js` y la app.

Cómo se prueba: `node pruebas/humo.mjs` y `node pruebas/arquitectura.mjs`.

`romanos.js`: `useRomanos`, la preferencia de ver los grados en romanos o en números.
