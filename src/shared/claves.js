// Las claves con que se guarda algo en el teléfono (localStorage). Un solo dueño: acá se declaran y de acá se importan.
// Las que todavía están escritas a mano en App.jsx pasan acá a medida que sus áreas salgan de ese archivo.
export const CLAVES = {
  estiloCifrado: "bandomaps_estilo_cifrado",
  nombresAcordes: "bandomaps_nombres_acordes",
  romanos: "bandomaps_romanos",
  org: "bandomaps_org",
  regSesion: "bandomaps_reg_sesion",
  regClave: "bandomaps_reg_clave",
  lado: "bandomaps_lado",
  invertir: "bandomaps_invertir",
  hechas: "bandomaps_hechas_",          // más el usuario: bandomaps_hechas_<usuario>
  misAcordes: "bandomaps_mis_acordes",  // las tarjetas de acordes guardadas en el Entrenador (fase 6)
  ejecucion: "bandomaps_ejecucion",     // los ajustes de la pestaña Ejecución (forma, mano, medida calibrada)
};
