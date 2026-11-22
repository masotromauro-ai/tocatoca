// El marcato de la mano izquierda por la regla del profesor (Mariano, 18-nov-2026). Lógica pura, sin imports.
// Vive aparte de voicings.js desde el 22-nov-2026, para que el paquete de cada parte siga siendo chico
// (pruebas/areas.mjs) y Mariano pueda ajustar sus zonas sin tocar las demás formas. Lo usa `voicingsDe` de voicings.js.

// ─── Marcato por regla del profesor (mano izquierda) ───────────────────────────
// Las zonas se miden desde el Do de la octava más grave de la izquierda (así no dependen de cómo esté numerado el teclado):
// séptima y quinta del mayor: desde una octava arriba; tercera y quinta del menor: desde dos octavas arriba.
// Bajo: la raíz más grave de la izquierda. Con 7ª mayor o dominante se omite la quinta; con 7ª menor se la deja.
// Para cambiar una zona se cambia un número de esta tabla (en octavas sobre el Do más grave). Si el acorde no es de este tipo
// o falta un botón, devuelve null y se usa el cálculo anterior.
export const ZONAS_MARCATO={ septima:1, tercera:2, quinta:2, quintaMayor:1 };

export function marcatoPorRegla(pcs,items){
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
