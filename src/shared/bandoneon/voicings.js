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
    for(const bel of [fuellePref,fuellePref==="abre"?"cierra":"abre"]){
      const r=elegirVoicing(p.id,pcs,items(bel));
      if(r) return {...p,fuelle:bel,...r,notas:r.sel.map(x=>({id:x.it.id,pc:x.it.pc,oct:x.it.oct,hand:x.it.hand,rol:x.rol,nombre:nombres[x.rol]}))};
    }
    return {...p,fuelle:null,vacio:true};
  });
}
