// Los nombres de los dedos (1 índice · 2 medio · 3 anular · 4 meñique).
// Vivían en features/clases/org.jsx y subieron a shared/ en la fase 6: los
// usan el Organizador y el Entrenador, y un feature no importa de otro (regla 2).
const NOM_DEDO_1={1:"índice",2:"medio",3:"anular",4:"meñique"};

export const nomDedo = (d)=>String(d).split("/").map(x=>NOM_DEDO_1[x]||x).join(" o ");
