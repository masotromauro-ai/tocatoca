// El armador de acordes: de las piezas elegidas a las notas con su escritura correcta.

import { GRADO_LAB, aRomano } from "../teoria/romanos.js";
import { CHROMATIC, nombreLat, noteIdx, spell } from "../teoria/notas.js";
import { ACORDE_BASES, ACORDE_NOV, ACORDE_SEPT, ACORDE_TRE, ACORDE_UND } from "./acordes-base.js";

export function calcAcorde(ac,romano){
    const r = noteIdx(ac.root);
    const base = ACORDE_BASES.find(b=>b.id===ac.base);
    let items = base.ivs.map((iv,i)=>({iv,lab:base.lab[i],up:false}));
    if(ac.sin5) items = items.filter((_,i)=>i!==2);
    const add=(list,id,up)=>{ const o=list.find(x=>x.id===id); if(o&&o.iv!==undefined) items.push({iv:o.iv,lab:o.lab,up}); };
    if(ac.seis) items.push({iv:9,lab:"6",up:false});
    add(ACORDE_SEPT,ac.sept,false); add(ACORDE_NOV,ac.nov,true); add(ACORDE_UND,ac.und,true); add(ACORDE_TRE,ac.tre,true);
    const seen=new Set(), tones=[];
    items.forEach(it=>{
      const esc = spell(ac.root, it.iv, GRADO_LAB[it.lab]);          // escritura correcta: 3ª = otra letra, etc.
      const pc  = CHROMATIC[noteIdx(esc)];
      if(seen.has(pc)) return; seen.add(pc);
      tones.push({...it,pc,esc,nombre:nombreLat(esc)});
    });
    const tonesF=tones.map(t=>({...t,raw:t.lab,lab:romano?aRomano(t.lab):t.lab}));
    const labelByPc={}; tonesF.forEach(t=>{labelByPc[t.pc]=t.lab;});
    const partes=[];
    if(ac.seis) partes.push("6");
    if(ac.sept!=="none") partes.push(ACORDE_SEPT.find(x=>x.id===ac.sept).label);
    if(ac.nov!=="none") partes.push(ac.nov);
    if(ac.und!=="none") partes.push(ac.und);
    if(ac.tre!=="none") partes.push(ac.tre);
    const name = `${nombreLat(ac.root)} ${base.label}`+(ac.sin5?" (sin 5ª)":"")+(partes.length?" + "+partes.join(" + "):"");
    return {tones:tonesF,labelByPc,name,rootIdx:r};
  }
