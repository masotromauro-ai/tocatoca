// Modos, círculo de quintas y grados. Lógica pura.

import { buildScale, fromRoot, noteIdx } from "./notas.js";

export const MODES={
  "Jónico":     [0,2,4,5,7,9,11],
  "Dórico":     [0,2,3,5,7,9,10],
  "Frigio":     [0,1,3,5,7,8,10],
  "Lidio":      [0,2,4,6,7,9,11],
  "Mixolidio":  [0,2,4,5,7,9,10],
  "Eólico":     [0,2,3,5,7,8,10],
  "Locrio":     [0,1,3,5,6,8,10],
  "Locrio #2":  [0,2,3,5,6,8,10],
  "Lidio b7":   [0,2,4,6,7,9,10],
  "Alterada":   [0,1,3,4,6,8,10],
  "Frigio Dom.":[0,1,4,5,7,8,10],
  "Disminuida": [0,2,3,5,6,8,9,11],
  "Disminuida S-T": [0,1,3,4,6,7,9,10],
  "Menor armónica": [0,2,3,5,7,8,11],
  "Menor melódica": [0,2,3,5,7,9,11],
  "Tonos enteros": [0,2,4,6,8,10],
  "Lidio aumentado": [0,2,4,6,8,9,11],
  "Mixolidio b6": [0,2,4,5,7,8,10],
  "Jónico #5": [0,2,4,5,8,9,11],
  "Locrio bb7": [0,1,3,5,6,8,9],
  "Blues":      [0,3,5,6,7,10],
  "Mixo-blues": [0,2,3,4,5,7,9,10],
};

const T_SEMI={"9":2,"b9":1,"#9":3,"11":5,"#11":6,"13":9,"b13":8,"6":9,"b6":8,"b7":10,"7":11};

const T_DEG={"9":1,"b9":1,"#9":1,"11":3,"#11":3,"13":5,"b13":5,"6":5,"b6":5,"b7":6,"7":6};

export const tNote=(root,t)=>{const s=T_SEMI[t];return s!==undefined?fromRoot(root,s,T_DEG[t]):null;};

export const MODE_BY_DEGREE=[
  {name:"Jónico",   ivs:MODES["Jónico"],   q:"△7", tensions:["9","13"],      avoid:["11"]},
  {name:"Dórico",   ivs:MODES["Dórico"],   q:"m7", tensions:["9","11"],      avoid:["b9"]},
  {name:"Frigio",   ivs:MODES["Frigio"],   q:"m7", tensions:["11"],          avoid:["b9","b13"]},
  {name:"Lidio",    ivs:MODES["Lidio"],    q:"△7", tensions:["9","#11","13"],avoid:["11"]},
  {name:"Mixolidio",ivs:MODES["Mixolidio"],q:"7",  tensions:["9","13"],      avoid:["11"]},
  {name:"Eólico",   ivs:MODES["Eólico"],   q:"m7", tensions:["9","11"],      avoid:["b13"]},
  {name:"Locrio",   ivs:MODES["Locrio"],   q:"ø7", tensions:["11","b13"],    avoid:["b9"]},
];

// ─── CÍRCULO DE QUINTAS ───────────────────────────────────────────────────────
export const COF=[
  {note:"C",  minor:"Am",  deg:0,   sig:"Sin alteraciones", minorFull:"A menor"},
  {note:"G",  minor:"Em",  deg:30,  sig:"1♯ (F#)",         minorFull:"E menor"},
  {note:"D",  minor:"Bm",  deg:60,  sig:"2♯ (F#,C#)",      minorFull:"B menor"},
  {note:"A",  minor:"F#m", deg:90,  sig:"3♯",              minorFull:"F# menor"},
  {note:"E",  minor:"C#m", deg:120, sig:"4♯",              minorFull:"C# menor"},
  {note:"B",  minor:"G#m", deg:150, sig:"5♯",              minorFull:"G# menor"},
  {note:"F#", minor:"D#m", deg:180, sig:"6♯",              minorFull:"D# menor"},
  {note:"Db", minor:"Bbm", deg:210, sig:"5♭",              minorFull:"Bb menor"},
  {note:"Ab", minor:"Fm",  deg:240, sig:"4♭",              minorFull:"F menor"},
  {note:"Eb", minor:"Cm",  deg:270, sig:"3♭ (Bb,Eb,Ab)",   minorFull:"C menor"},
  {note:"Bb", minor:"Gm",  deg:300, sig:"2♭ (Bb,Eb)",      minorFull:"G menor"},
  {note:"F",  minor:"Dm",  deg:330, sig:"1♭ (Bb)",         minorFull:"D menor"},
];

export const MSI=[0,2,4,5,7,9,11];

export const DN=["I","II","III","IV","V","VI","VII"];

export const DQ=["△7","m7","m7","△7","7","m7","ø7"];

const DL=["Tónica","Supertónica","Mediante","Subdominante","Dominante","Relativa m.","Sensible"];

const getMSD=(root)=>{
  const ri=noteIdx(root);if(ri===-1)return null;
  const notes=buildScale(root,MSI);
  return{notes,diatonic:notes.map((n,i)=>({note:n,degree:DN[i],quality:DQ[i],label:DL[i],full:`${n}${DQ[i]}`}))};
};
