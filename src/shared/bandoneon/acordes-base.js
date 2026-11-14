// @datos
// Las piezas con que se arma un acorde en el teclado: base, séptima, novenas, oncenas, trecenas y raíces.

// ─── BOTÓN VISUAL ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
// ─── ARMADOR DE ACORDES (compartido por Bandoneón y Entrenador) ──────────────
// Se construye por capas: fundamental → tipo → séptima → novena/oncena/trecena.
// Devuelve las alturas (sin octava) y la etiqueta de intervalo de cada una.
// ═══════════════════════════════════════════════════════════════════════════
export const ACORDE_BASES = [
  {id:"M",   label:"Mayor",      ivs:[0,4,7], lab:["R","3","5"]},
  {id:"m",   label:"menor",      ivs:[0,3,7], lab:["R","b3","5"]},
  {id:"dim", label:"Disminuido", ivs:[0,3,6], lab:["R","b3","b5"]},
  {id:"aug", label:"Aumentado",  ivs:[0,4,8], lab:["R","3","#5"]},
  {id:"sus2",label:"sus2",       ivs:[0,2,7], lab:["R","2","5"]},
  {id:"sus4",label:"sus4",       ivs:[0,5,7], lab:["R","4","5"]},
];

export const ACORDE_SEPT = [{id:"none",label:"Sin 7ª"},{id:"b7",label:"7ª menor",iv:10,lab:"b7"},{id:"M7",label:"7ª mayor",iv:11,lab:"7"},{id:"bb7",label:"7ª disminuida",iv:9,lab:"bb7"}];

export const ACORDE_NOV  = [{id:"none",label:"—"},{id:"b9",label:"b9",iv:1,lab:"b9"},{id:"9",label:"9",iv:2,lab:"9"},{id:"#9",label:"#9",iv:3,lab:"#9"}];

export const ACORDE_UND  = [{id:"none",label:"—"},{id:"11",label:"11",iv:5,lab:"11"},{id:"#11",label:"#11",iv:6,lab:"#11"}];

export const ACORDE_TRE  = [{id:"none",label:"—"},{id:"b13",label:"b13",iv:8,lab:"b13"},{id:"13",label:"13",iv:9,lab:"13"}];

export const ACORDE_INI  = {root:"C",base:"M",sept:"none",nov:"none",und:"none",tre:"none",seis:false,sin5:false};

export const ACORDE_RAICES = ["C","C#","Db","D","D#","Eb","E","F","F#","Gb","G","G#","Ab","A","A#","Bb","B"];
