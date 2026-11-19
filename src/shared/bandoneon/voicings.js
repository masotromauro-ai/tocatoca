// Formas recomendadas: patrones por función de cada nota (raíz, 3ª, 5ª, 7ª) aplicados a los botones reales. Lógica pura.

import { itemsMano } from "./tablas.js";

// ─── Voicings sugeridos: patrones definidos por la función de cada nota (raíz, 3ª, 5ª, 7ª) y aplicados a los botones reales ───
export const PATRONES_VOZ=[
  {id:"marcato",nombre:"Marcato",uso:"mano izquierda, firme y rápido"},
  {id:"cerrado",nombre:"Cerrado",uso:"todas las notas juntas, compacto"},
  {id:"abierto",nombre:"Abierto",uso:"bajo y 5ª a la izquierda; 3ª y 7ª a la derecha"},
];

export const ROL_TXT=["R","3","5","7"];

function dispFisica(sel){ let t=0; ["L","R"].forEach(h=>{ const p=sel.filter(i=>i.hand===h); if(p.length>1){ const xs=p.map(i=>i.x), ys=p.map(i=>i.y); t+=Math.hypot(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)); } }); return t; }


// ─── Marcato por regla del profesor (mano izquierda) ───────────────────────────
// Las zonas se miden desde el Do de la octava más grave de la izquierda (así no dependen de cómo esté numerado el teclado):
// séptima y quinta del mayor: desde una octava arriba; tercera y quinta del menor: desde dos octavas arriba.
// Bajo: la raíz más grave de la izquierda. Con 7ª mayor o dominante se omite la quinta; con 7ª menor se la deja.
// Para cambiar una zona se cambia un número de esta tabla (en octavas sobre el Do más grave). Si el acorde no es de este tipo
// o falta un botón, devuelve null y se usa el cálculo anterior.
export const ZONAS_MARCATO={ septima:1, tercera:2, quinta:2, quintaMayor:1 };

function marcatoPorRegla(pcs,items){
  const n=pcs.length; if(n<3||n>4) return null;
  const i3=(pcs[1]-pcs[0]+12)%12, i5=(pcs[2]-pcs[0]+12)%12;
  if(i5!==7||(i3!==3&&i3!==4)) return null;
  const menor=i3===3, Z=ZONAS_MARCATO;
  const izq=items.filter(i=>i.hand==="L"); if(!izq.length) return null;
  const base=12*Math.floor(Math.min(...izq.map(i=>i.midi))/12), z=k=>base+12*Z[k];
  const regla = n===3 ? {roles:[0,2,1], desde:{2:menor?z("quinta"):z("quintaMayor"),1:z("tercera")}}
              : menor ? {roles:[0,3,1,2], desde:{3:z("septima"),1:z("tercera"),2:z("quinta")}}
              :         {roles:[0,3,1], desde:{3:z("septima"),1:z("tercera")}};
  const bajo=izq.filter(i=>i.pc===pcs[0]).sort((a,b)=>a.midi-b.midi)[0]; if(!bajo) return null;
  const sel=[{it:bajo,rol:0}];
  for(const r of regla.roles.slice(1)){
    const c=izq.filter(i=>i.pc===pcs[r]&&i.midi>=Math.max(regla.desde[r],bajo.midi+1)&&!sel.some(s=>s.it.id===i.id))
      .sort((a,b)=>(a.midi-b.midi)||(Math.hypot(a.x-bajo.x,a.y-bajo.y)-Math.hypot(b.x-bajo.x,b.y-bajo.y)));
    if(!c.length) return null;
    sel.push({it:c[0],rol:r});
  }
  const ord=sel.sort((a,b)=>a.it.midi-b.it.midi);
  return {sel:ord,ids:ord.map(x=>x.it.id),manos:{L:ord.length,R:0}};
}

// items: [{id,hand,pc,midi,oct,x,y}]; pcs: [raíz, 3ª, 5ª, (7ª)]
function elegirVoicing(patron,pcs,items){
  const n=pcs.length, bajos=items.filter(i=>i.hand==="L"&&i.pc===pcs[0]); if(!bajos.length) return null;
  const roles=patron==="marcato"?(n>=4?[0,1,3]:[0,1,2]):[...Array(n).keys()];
  let mejor=null; const bajoMin=Math.min(...bajos.map(b=>b.midi));
  bajos.forEach(bajo=>{
    const listas=roles.slice(1).map(r=>items.filter(i=>{
      if(i.pc!==pcs[r]||i.id===bajo.id||i.midi<=bajo.midi) return false;
      if(patron==="marcato") return i.hand==="L"&&i.midi<=bajo.midi+19;
      if(patron==="cerrado") return i.midi<=bajo.midi+14;
      // abierto: raíz y 5ª a la izquierda; 3ª y 7ª a la derecha, por encima de la octava del bajo
      return (r===2)?(i.hand==="L"&&i.midi<=bajo.midi+12):(i.hand==="R"&&i.midi>=bajo.midi+12&&i.midi<=bajo.midi+31);
    }));
    if(listas.some(l=>!l.length)) return;
    const comb=(k,acc)=>{ if(k===listas.length){ evaluar(acc); return; } listas[k].forEach(it=>{ if(!acc.some(a=>a.id===it.id)) comb(k+1,[...acc,it]); }); };
    const evaluar=(acc)=>{
      const sel=[bajo,...acc], tope=Math.max(...sel.map(i=>i.midi))-bajo.midi, disp=dispFisica(sel), nR=sel.filter(i=>i.hand==="R").length;
      const costo=(patron==="abierto"?(bajo.midi-bajoMin)*4:Math.abs(bajo.midi-50)*2)+(patron==="marcato"?disp+0.8*tope:patron==="cerrado"?6*tope+0.05*disp+25*nR:0.05*disp+1.5*tope);   // abierto: bajo lo más grave posible; marcato y cerrado: bajo en el registro medio-grave (cerca de Re3)
      if(!mejor||costo<mejor.costo) mejor={costo,sel:sel.map((it,k)=>({it,rol:roles[k]}))};
    };
    comb(0,[]);
  });
  if(!mejor) return null;
  const ord=[...mejor.sel].sort((a,b)=>a.it.midi-b.it.midi);
  return {sel:ord,ids:ord.map(x=>x.it.id),manos:{L:ord.filter(x=>x.it.hand==="L").length,R:ord.filter(x=>x.it.hand==="R").length}};
}

export function voicingsDe(pcs,nombres,leftBtns,rightBtns,fuellePref){
  const mk=(btns,bel,h)=>itemsMano(btns,bel).map(i=>({id:i.b.id,hand:h,pc:i.pc,midi:i.midi,oct:i.oct,x:i.b.x,y:i.b.y}));
  const cache={};
  const items=(bel)=>cache[bel]||(cache[bel]=[...mk(leftBtns,bel,"L"),...mk(rightBtns,bel,"R")]);
  return PATRONES_VOZ.map(p=>{
    const fuelles=[fuellePref,fuellePref==="abre"?"cierra":"abre"];
    const armar=(bel,r)=>({...p,fuelle:bel,...r,notas:r.sel.map(x=>({id:x.it.id,pc:x.it.pc,oct:x.it.oct,hand:x.it.hand,rol:x.rol,nombre:nombres[x.rol]}))});
    if(p.id==="marcato"){   // primero la regla del profesor, en el fuelle pedido y después en el otro; si no aplica, el cálculo anterior
      for(const bel of fuelles){ const r=marcatoPorRegla(pcs,items(bel)); if(r) return armar(bel,r); }
    }
    for(const bel of fuelles){
      const r=elegirVoicing(p.id,pcs,items(bel));
      if(r) return armar(bel,r);
    }
    return {...p,fuelle:null,vacio:true};
  });
}
