# features/clases — el Organizador y Mis tareas

| Archivo | Qué es |
|---|---|
| `OrganizadorTab.jsx` | la pestaña del docente: clases, alumnos y ejercicios |
| `MisTareasTab.jsx` | la pestaña del alumno: lo que tiene para hacer y lo que ya hizo |
| `PanelIngresos.jsx` | los ingresos de los alumnos |
| `org.jsx` | guardado del Organizador, registro de ejercicios y rótulos |

Las claves de guardado salen de `shared/claves.js`. **Intocables:** `registrar()` (lee las tareas del docente) y que `medir()` / `medirLote()` (en `shared/medicion.js`) sigan llamándose desde cada ejercicio. Si algo de acá cambia lo que se ve, la prueba de humo lo marca.

Cómo se prueba: `node pruebas/humo.mjs`.
