// @datos
// El círculo de quintas: posiciones, escalas y acordes.

import { CHROMATIC, noteIdx } from "./notas.js";
import { playTone } from "../audio/audio.js";

// ═══════════════════════════════════════════════════════════════════════════
// ─── CÍRCULO DE QUINTAS INTERACTIVO ──────────────────────────────────────────
// Tres anillos (mayores · menores relativas · disminuidos) que giran. Arriba
// siempre queda la "armadura" elegida; el anillo de puntos muestra las notas
// de la escala con su grado y los acordes diatónicos se iluminan con su cifrado.
// ═══════════════════════════════════════════════════════════════════════════
export const CQ_MAJ = ["C","G","D","A","E","B","F#","Db","Ab","Eb","Bb","F"];

export const CQ_MIN = ["A","E","B","F#","C#","G#","D#","Bb","F","C","G","D"];

export const CQ_ESC = [
  {id:"mayor",  nombre:"Mayor",           ivs:[0,2,4,5,7,9,11], off:0,  deg:0, fam:"may"},
  {id:"menor",  nombre:"Menor natural",   ivs:[0,2,3,5,7,8,10], off:9,  deg:5, fam:"men"},
  {id:"menorA", nombre:"Menor armónica",  ivs:[0,2,3,5,7,8,11], off:9,  deg:5, fam:"men"},
  {id:"menorM", nombre:"Menor melódica",  ivs:[0,2,3,5,7,9,11], off:9,  deg:5, fam:"men"},
  {id:"dorico", nombre:"Dórico",          ivs:[0,2,3,5,7,9,10], off:2,  deg:1, fam:"mod"},
  {id:"frigio", nombre:"Frigio",          ivs:[0,1,3,5,7,8,10], off:4,  deg:2, fam:"mod"},
  {id:"lidio",  nombre:"Lidio",           ivs:[0,2,4,6,7,9,11], off:5,  deg:3, fam:"mod"},
  {id:"mixo",   nombre:"Mixolidio",       ivs:[0,2,4,5,7,9,10], off:7,  deg:4, fam:"mod"},
  {id:"locrio", nombre:"Locrio",          ivs:[0,1,3,5,6,8,10], off:11, deg:6, fam:"mod"},
  {id:"pentaM", nombre:"Pent. mayor",     ivs:[0,2,4,7,9],      off:0,  deg:0, fam:"pen"},
  {id:"pentam", nombre:"Pent. menor",     ivs:[0,3,5,7,10],     off:9,  deg:5, fam:"pen"},
];

const CQ_MAJ_IV = [0,2,4,5,7,9,11];

const CQ_NUM = ["I","II","III","IV","V","VI","VII"];

export const cqPcOfPos = p => (p*7)%12;

export const cqPosOfPc = pc => (((pc%12)+12)%12*7)%12;

export const cqAcc = n => String(n).replace(/^([A-G])(##|#|bb|b)/, (m,l,a)=>l+({"#":"♯","##":"𝄪","b":"♭","bb":"♭♭"}[a]));

export const cqPol = (cx,cy,r,deg)=>{ const a=deg*Math.PI/180; return [cx+r*Math.sin(a), cy-r*Math.cos(a)]; };

export const cqSector = (cx,cy,r0,r1,a0,a1)=>{
  const [x0,y0]=cqPol(cx,cy,r1,a0), [x1,y1]=cqPol(cx,cy,r1,a1), [x2,y2]=cqPol(cx,cy,r0,a1), [x3,y3]=cqPol(cx,cy,r0,a0);
  return `M${x0} ${y0} A${r1} ${r1} 0 0 1 ${x1} ${y1} L${x2} ${y2} A${r0} ${r0} 0 0 0 ${x3} ${y3} Z`;
};

export function cqChords(notes, ivs){
  if(ivs.length!==7) return [];
  return ivs.map((iv,i)=>{
    const r=notes[i];
    const i3=(ivs[(i+2)%7]-iv+12)%12, i5=(ivs[(i+4)%7]-iv+12)%12, i7=(ivs[(i+6)%7]-iv+12)%12;
    let tri="?", ts="", sev="7";
    if(i3===4&&i5===7){tri="maj";ts="";   sev=i7===11?"△7":"7";}
    else if(i3===3&&i5===7){tri="min";ts="m"; sev=i7===11?"m△7":"m7";}
    else if(i3===3&&i5===6){tri="dim";ts="°"; sev=i7===9?"°7":"ø7";}
    else if(i3===4&&i5===8){tri="aug";ts="+"; sev=i7===11?"+△7":"+7";}
    const d=iv-CQ_MAJ_IV[i]; const pre=d<0?"♭":d>0?"♯":"";
    let num=CQ_NUM[i]; /* los grados van siempre en mayúscula */
    return {root:r,rootPc:noteIdx(r),tri,ts,sev,roman:pre+num+(tri==="dim"?"°":tri==="aug"?"+":""),i3,i5,i7,deg:i};
  });
}

export const cqPlay = (root, ivs, dur=1.3)=>{
  const r=noteIdx(root); ivs.forEach((iv,k)=>{ const a=r+iv; setTimeout(()=>playTone(CHROMATIC[a%12],3+Math.floor(a/12),dur),k*18); });
};
