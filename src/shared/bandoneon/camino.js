// Caminos de notas, escalas y arpegios sobre el teclado; armado de voces.

import { ACORDE_BASES, ACORDE_NOV, ACORDE_RAICES, ACORDE_SEPT, ACORDE_TRE, ACORDE_UND } from "./acordes-base.js";
import { buildScale } from "../teoria/notas.js";
import { itemsMano } from "./tablas.js";

// ─── ESCALAS PARA EL ENTRENADOR ──────────────────────────────────────────────
export const ESC_ENT = [
  {id:"mayor",  nombre:"Mayor",          ivs:[0,2,4,5,7,9,11]},
  {id:"menor",  nombre:"Menor natural",  ivs:[0,2,3,5,7,8,10]},
  {id:"menorA", nombre:"Menor armónica", ivs:[0,2,3,5,7,8,11]},
  {id:"menorM", nombre:"Menor melódica", ivs:[0,2,3,5,7,9,11]},
  {id:"crom",   nombre:"Cromática",      ivs:[0,1,2,3,4,5,6,7,8,9,10,11]},
];

// Camino de la escala sobre una mano: la nota siguiente es la más cercana por encima (o por debajo), a no más de 4 semitonos.
// startIdx < 0 = automático: elige el primer punto de partida desde el que la escala sale completa.
export function rutaEscala(btns, bellows, rootPc, ivs, dir, startIdx){
  const items = itemsMano(btns, bellows);
  const asc = [...new Map(items.filter(i=>i.pc===rootPc).sort((a,b)=>a.midi-b.midi).map(i=>[i.midi,i])).values()];
  const sube = dir!=="baja";
  const tonics = sube ? asc : [...asc].reverse();
  if(!tonics.length) return {route:[], missing:[rootPc], tonics, items, startUsed:0};
  const n = ivs.length;
  const grados = sube ? [...Array(n).keys(),0] : [0,...[...Array(n-1).keys()].map(k=>n-1-k),0];
  const pcs = grados.map(k=>(rootPc+ivs[k])%12);
  const build = (start)=>{
    const route=[{item:start,deg:0}], missing=[]; let cur=start.midi;
    for(let k=1;k<pcs.length;k++){
      const cand = items.filter(i=>i.pc===pcs[k] && (sube ? (i.midi>cur && i.midi-cur<=4) : (i.midi<cur && cur-i.midi<=4)));
      if(!cand.length){ missing.push(pcs[k]); break; }
      const it = cand.reduce((a,b)=> sube ? (b.midi<a.midi?b:a) : (b.midi>a.midi?b:a));
      route.push({item:it,deg:grados[k]}); cur=it.midi;
    }
    return {route,missing};
  };
  let used = startIdx;
  if(startIdx<0){ used = tonics.findIndex(t=>build(t).missing.length===0); if(used<0) used=0; }
  used = Math.min(used, tonics.length-1);
  const r = build(tonics[used]);
  return {route:r.route, missing:r.missing, tonics, items, startUsed:used};
}

// ─── CAMINO DE LAS ESCALAS EN LOS DOS TECLADOS ────────────────────────────────
export const FIGURAS = [{id:"redonda",nombre:"Redonda",beats:4},{id:"blanca",nombre:"Blanca",beats:2},{id:"negra",nombre:"Negra",beats:1},{id:"corchea",nombre:"Corchea",beats:0.5},{id:"semicorchea",nombre:"Semicorchea",beats:0.25}];

// Camino de una lista de notas (objetivos por mano) para un sentido del fuelle. CADA MANO muestra su propio camino.
// Si una mano no tiene una nota, queda sin marcar y se avisa. Dentro de una misma mano, si una nota está en dos botones,
// se elige el más cercano a la nota anterior y el otro se ofrece como alternativa.
export function caminoNotas(leftBtns,rightBtns,bellows,objL,objR,elige){
  const dist=(a,b)=>Math.hypot(a.b.x-b.b.x,a.b.y-b.b.y);
  const manos={};
  [["L",leftBtns,objL],["R",rightBtns,objR]].forEach(([h,btns,obj])=>{
    const items=itemsMano(btns,bellows).map(i=>({...i,hand:h}));
    const nodos=[], faltan=[]; let prev=null;
    obj.forEach((ob,idx)=>{
      const k=idx+1, cands=items.filter(i=>i.midi===ob.midi);
      if(!cands.length){ faltan.push({...ob,k}); nodos.push({...ob,k,falta:true}); return; }
      let el=null; const forzado=elige && elige[bellows+":"+h+":"+ob.midi];
      if(forzado) el=cands.find(c=>c.b.id===forzado)||null;
      if(!el) el = prev ? cands.reduce((a,b)=>dist(prev,b)<dist(prev,a)?b:a) : cands[0];
      nodos.push({...ob,k,item:el,alts:cands.filter(c=>c!==el)}); prev=el;
    });
    manos[h]={obj,nodos,faltan};
  });
  return {manos};
}

// Escala: desde la tónica de la octava de partida de cada mano hasta la tónica `nOct` octavas más arriba.
export function caminoEscala(leftBtns,rightBtns,bellows,rootPc,ivs,rootName,octL,octR,nOct,elige){
  const nombres=buildScale(rootName,ivs);
  const armar=(octIni)=>{ const t0=12*(octIni+1)+rootPc, obj=[];
    for(let o=0;o<nOct;o++) ivs.forEach((iv,g)=>obj.push({midi:t0+12*o+iv,name:nombres[g],deg:g}));
    obj.push({midi:t0+12*nOct,name:nombres[0],deg:0}); return obj; };
  return caminoNotas(leftBtns,rightBtns,bellows,armar(octL),armar(octR),elige);
}

// Arpegio: el acorde se arma desde la raíz (octava de partida de cada mano) y se puede invertir: la inversión k arranca en la k-ésima nota
// del acorde (raíz, tercera, quinta, séptima) y las anteriores pasan una octava arriba. Las tensiones (9, 11, 13) se suman arriba, una octava más alta que
// su grado simple, y todo el arpegio sube en orden. Termina en la nota inicial una octava más arriba, salvo que alguna tensión ya pase de ahí.
export function caminoArpegio(leftBtns,rightBtns,bellows,A,inv,octL,octR,nOct,elige){
  const base=A.tones.filter(t=>!t.up).map(t=>({...t,off:t.iv})).sort((a,b)=>a.off-b.off);
  const tens=A.tones.filter(t=>t.up).map(t=>({...t,off:t.iv+12}));
  if(!base.length) return {manos:{L:{obj:[],nodos:[],faltan:[]},R:{obj:[],nodos:[],faltan:[]}}};
  const k=Math.min(inv,base.length-1);
  const rot=[...base.slice(k),...base.slice(0,k).map(t=>({...t,off:t.off+12})),...tens].sort((a,b)=>a.off-b.off);
  const armar=(octIni)=>{ const b0=12*(octIni+1)+A.rootIdx, todas=[];
    for(let o=0;o<nOct;o++) rot.forEach(t=>todas.push({midi:b0+t.off+12*o,name:t.esc,lab:t.lab,deg:0}));
    todas.sort((a,b)=>a.midi-b.midi);
    const obj=[]; todas.forEach(n=>{ if(!obj.some(x=>x.midi===n.midi)) obj.push(n); });
    const cierre=b0+rot[0].off+12*nOct;
    if(cierre>obj[obj.length-1].midi) obj.push({midi:cierre,name:rot[0].esc,lab:rot[0].lab,deg:0});
    return obj; };
  return caminoNotas(leftBtns,rightBtns,bellows,armar(octL),armar(octR),elige);
}

export const octDeMidi=(m)=>Math.floor(m/12)-1;

// ─── DISTRIBUCIÓN DEL ACORDE ENTRE LAS DOS MANOS ─────────────────────────────
export const VOZ_RAICES=["C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B"];

// La raíz es el bajo (mano izquierda, octava `bajoOct`). El resto se apila hacia arriba desde la octava `relOct`, con la inversión `inv`.
// Cada nota queda como "distancia en semitonos al bajo" (d) + mano: esa forma se puede mover a cualquier tonalidad.
// `man` guarda cambios nota por nota (por intervalo del acorde): mano y octava sobre el bajo.
export function armarVoz(A,cfg){
  const bass=12*(cfg.bajoOct+1)+A.rootIdx;
  const ts=A.tones.map(t=>({t,off:t.iv+(t.up?12:0)})).sort((a,b)=>a.off-b.off);
  const otros=ts.filter(x=>x.off!==0), k=Math.min(cfg.inv,Math.max(0,otros.length-1));
  const rot=[...otros.slice(k),...otros.slice(0,k)], mano=cfg.preset==="izq"?"L":"R", out=[];
  const raiz=ts.find(x=>x.off===0); if(raiz) out.push({key:0,midi:bass,mano:"L",name:raiz.t.esc,lab:raiz.t.lab});
  let prev=bass;
  rot.forEach((x,j)=>{ const pc=(A.rootIdx+x.t.iv)%12; let m=j===0?12*(cfg.relOct+1)+pc:pc+12*Math.floor(prev/12); while(m<=prev) m+=12; prev=m; out.push({key:x.t.iv,midi:m,mano,name:x.t.esc,lab:x.t.lab}); });
  return out.map(n=>{ const o=cfg.man&&cfg.man[n.key], midi=o?bass+n.key+12*o.ex:n.midi;
    return {...n,midi,d:midi-bass,mano:o?o.mano:(cfg.soloLista?"-":n.mano)}; }).sort((a,b)=>a.midi-b.midi);
}

export const vozCifrar=(A,cfg,notas)=>["HM1",A.ac.root,A.ac.base,A.ac.sept,A.ac.nov,A.ac.und,A.ac.tre,A.ac.seis?1:0,A.ac.sin5?1:0,"bajo"+cfg.bajoOct,
  "I:"+notas.filter(n=>n.mano==="L").map(n=>n.d).join(","),"D:"+notas.filter(n=>n.mano==="R").map(n=>n.d).join(",")].join("|");

export function vozLeer(txt){
  const p=String(txt).trim().split("|"); if(p.length!==12||p[0]!=="HM1") return null;
  const [,root,base,sept,nov,und,tre,seis,sin5,bajo,I,D]=p, ids=(L,v)=>L.some(x=>x.id===v);
  if(!ACORDE_RAICES.includes(root)||!ids(ACORDE_BASES,base)||!ids(ACORDE_SEPT,sept)||!ids(ACORDE_NOV,nov)||!ids(ACORDE_UND,und)||!ids(ACORDE_TRE,tre)) return null;
  const bo=Number(bajo.replace("bajo","")), num=x=>x.split(",").filter(Boolean).map(Number), L=num(I.replace(/^I:/,"")), R=num(D.replace(/^D:/,""));
  if(!(bo>=1&&bo<=5)||[...L,...R].some(v=>!Number.isInteger(v)||v<0||v>70)) return null;
  return {ac:{root,base,sept,nov,und,tre,seis:seis==="1",sin5:sin5==="1"},bajoOct:bo,L,R};
}
