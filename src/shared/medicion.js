// @motor
// INTOCABLE: lo que mide el avance de cada alumno. Avisa a src/Puerta.jsx por window.__medir / __medirLote.

// medir-1 (8-nov-2026): cada respuesta suma al resumen del día del alumno (src/Puerta.jsx y public/cuenta/medir.js).
export function medir(ej,bien,pc){ try{ window.__medir&&window.__medir(ej,bien,pc); }catch(e){} }

export function medirLote(ej,a,f){ try{ window.__medirLote&&window.__medirLote(ej,a,f); }catch(e){} }
