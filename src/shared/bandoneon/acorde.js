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


// ─── VOICING SUGERIDO ─────────────────────────────────────────────────────────────────────────────────────────
// Una sola forma recomendada, según qué quiera tocar la persona: mano izquierda, mano derecha o las dos, cerrada o abierta.
// Lógica pura (sin pantalla). Las reglas salen de la partitura «Práctica Armónica 1» y de las que ya había definido el profesor:
//  · Izquierda, cerrada (marcato): el bajo es la fundamental más grave del teclado; arriba, las voces que definen el acorde
//    (séptima y tercera) juntas, dentro de una zona fija: de Sol2 a Fa3 con el teclado actual. Con 7ª mayor o dominante no va la
//    quinta; con 7ª menor se la deja. Una tríada lleva quinta y tercera (Do = Do1 + Sol2 + Mi3).
//  · Las dos manos, cerrada: bajo en la izquierda y, en la derecha, tercera y séptima juntas (zona Do3 a Do4). La quinta ♭ de un ø7 es opcional.
//  · Las dos manos, abierta: bajo y quinta en la izquierda; tercera y séptima en la derecha, por encima de la octava del bajo.
//  · Derecha sola: todas las notas del acorde de abajo hacia arriba desde el Do3.
// Todas las zonas se miden desde el Do más grave de cada teclado, así no dependen de cómo esté numerado.
export const REGLAS_VOICING = { quintaEnMenor7: true };   // false = como la partitura (Dm7 = solo tercera y séptima)

const NOM_ALT=["Do","Do♯","Re","Re♯","Mi","Fa","Fa♯","Sol","Sol♯","La","La♯","Si"];
export const nombreAltura=(midi)=>NOM_ALT[((midi%12)+12)%12]+(Math.floor(midi/12)-1);
const numPc=(t)=>typeof t.pc==="number"?t.pc:noteIdx(t.pc);
const baseDe=(items)=>12*Math.floor(Math.min(...items.map(i=>i.midi))/12);
const teclas=(items,t)=>{ const n=numPc(t); return items.filter(i=>i.pc===n).sort((a,b)=>a.midi-b.midi); };

// Qué función cumple cada nota del acorde y cuáles van en el voicing
export function analizarAcorde(tones){
  const raiz=tones[0]||null, f=(rs)=>tones.find(t=>rs.includes(t.raw));
  const terc=f(["3","b3","2","4"]), quin=f(["5","b5","#5"]), sept=f(["7","b7","bb7"])||f(["6"]);
  const ext=tones.filter(t=>["b9","9","#9","11","#11","b13","13"].includes(t.raw)||(t.raw==="6"&&t!==sept));
  const color=!!sept||ext.length>0, alt=!!quin&&quin.raw!=="5", menor3=!!terc&&terc.raw==="b3";
  const menor7=menor3&&!!sept&&sept.raw==="b7"&&!!quin&&quin.raw==="5";
  const hemi=menor3&&alt&&!!sept;                                     // ø7 y °7: la quinta ♭ ya está dicha en el símbolo
  const mantiene=!!quin&&(!color||(menor7&&REGLAS_VOICING.quintaEnMenor7)||(alt&&!hemi));
  return {raiz,terc,quin,sept,ext,color,mantiene,opcional:(hemi&&quin)?quin:null};
}
// Voces de arriba, de la más grave a la más aguda, para la izquierda sola
const ordenIzq=(a)=>{ const q=a.mantiene?[a.quin]:[];
  return (a.sept?[a.sept,a.terc,...q,...a.ext]:a.color?[a.terc,...q,...a.ext]:[a.quin,a.terc]).filter(Boolean); };
// Voces guía para la derecha: tercera y séptima (y extensiones); una tríada lleva tercera y quinta
const ordenGuia=(a)=>(a.sept?[a.sept,a.terc,...a.ext]:a.color?[a.terc,...a.ext]:[a.terc,a.quin]).filter(Boolean);

// Apila las notas de «orden» hacia arriba: la primera en la tecla más baja desde «suelo», cada una sobre la anterior
function apilar(orden,items,suelo){
  const notas=[],falta=[]; let prev=suelo-1;
  orden.forEach(t=>{ const hit=teclas(items,t).find(i=>i.midi>prev); if(hit){ notas.push({it:hit,t}); prev=hit.midi; } else falta.push(t); });
  return {notas,falta};
}
// Prueba cada inversión (rotación del orden) y las ordena de mejor a peor: sin faltantes, dentro de la zona, compacta, y la 1ª rotación primero
function variantes(orden,items,suelo,tope,usarZona=true){
  const out=[];
  for(let k=0;k<Math.max(1,orden.length);k++){
    const r=apilar([...orden.slice(k),...orden.slice(0,k)],items,suelo), ms=r.notas.map(x=>x.it.midi);
    const top=ms.length?Math.max(...ms):suelo, low=ms.length?Math.min(...ms):suelo;
    out.push({...r,sc:usarZona?[r.falta.length,Math.max(0,top-tope),top-low,k]:[r.falta.length,0,0,k]});
  }
  return out.sort((a,b)=>{ for(let i=0;i<4;i++) if(a.sc[i]!==b.sc[i]) return a.sc[i]-b.sc[i]; return 0; });
}

const TEXTO={
  izq:"Mano izquierda (marcato): abajo la fundamental más grave y arriba las notas que definen el acorde, juntas. Con 7ª mayor o dominante no lleva quinta.",
  der:"Mano derecha: todas las notas del acorde, de abajo hacia arriba desde el Do3.",
  ambasC:"Las dos manos: la izquierda toca el bajo y la derecha la tercera y la séptima, juntas.",
  ambasA:"Las dos manos, abierto: la izquierda toca el bajo y la quinta; la derecha, la tercera y la séptima, por encima de la octava del bajo.",
};

// items: {izq:[{b,pc,oct,midi}], der:[…]} (lo que da itemsMano) · tones: lo que da calcAcorde · opc: {mano:"izq"|"der"|"ambas", forma:"cerrada"|"abierta", inv}
export function sugerirVoicing(items,tones,{mano="izq",forma="cerrada",inv=0}={}){
  const vacio={notas:[],faltan:[],opcional:[],variantes:1,forma:"cerrada",texto:""};
  const IZQ=items.izq||[], DER=items.der||[], a=analizarAcorde(tones);
  if(!a.raiz||(mano!=="der"&&!IZQ.length)||(mano!=="izq"&&!DER.length)) return vacio;
  const abierta=mano==="ambas"&&forma==="abierta";
  const mk=(it,t,rol,m)=>({pc:it.pc,oct:it.oct,midi:it.midi,b:it.b.id,esc:t.esc,nombre:t.nombre,lab:t.lab,rol,mano:m});
  const notas=[],faltan=[]; let nv=1, texto=TEXTO.izq;
  const opcional=a.opcional&&mano!=="der"?[`${a.opcional.nombre} (${a.opcional.lab})`]:[];
  let bajo=null;
  if(mano!=="der"){
    bajo=teclas(IZQ,a.raiz)[0];
    if(bajo) notas.push(mk(bajo,a.raiz,"Bajo","izq")); else faltan.push(`${a.raiz.nombre} (bajo)`);
  }
  if(mano==="izq"){
    const base=baseDe(IZQ), vs=variantes(ordenIzq(a),IZQ,Math.max(base+18,bajo?bajo.midi+1:0),base+30), v=vs[inv%vs.length];
    v.notas.forEach(x=>notas.push(mk(x.it,x.t,x.t.lab,"izq"))); v.falta.forEach(t=>faltan.push(`${t.nombre} (${t.lab})`)); nv=vs.length;
  } else if(mano==="der"){
    const base=baseDe(DER), vs=variantes(tones,DER,base+12,base+24,false), v=vs[inv%vs.length];
    v.notas.forEach(x=>notas.push(mk(x.it,x.t,x.t.lab,"der"))); v.falta.forEach(t=>faltan.push(`${t.nombre} (${t.lab})`)); nv=vs.length; texto=TEXTO.der;
  } else {
    if(abierta&&a.quin&&bajo){ const q=teclas(IZQ,a.quin).find(i=>i.midi>bajo.midi); if(q) notas.push(mk(q,a.quin,a.quin.lab,"izq")); else faltan.push(`${a.quin.nombre} (${a.quin.lab})`); }
    const base=baseDe(DER), suelo=abierta?Math.max(base+12,(bajo?bajo.midi:0)+12):base+12, vs=variantes(ordenGuia(a),DER,suelo,abierta?base+30:base+24), v=vs[inv%vs.length];
    v.notas.forEach(x=>notas.push(mk(x.it,x.t,x.t.lab,"der"))); v.falta.forEach(t=>faltan.push(`${t.nombre} (${t.lab})`)); nv=vs.length;
    texto=abierta?TEXTO.ambasA:TEXTO.ambasC;
  }
  return {notas,faltan,opcional,variantes:nv,forma:abierta?"abierta":"cerrada",texto};
}

