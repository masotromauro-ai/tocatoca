// Prueba del marcato por regla. Se corre con:  node pruebas/voicings.mjs   (sin navegador ni npm)
import { DEFS_L, DEFS_R } from "../src/shared/bandoneon/layouts.js";
import { voicingsDe } from "../src/shared/bandoneon/voicings.js";
const N=["Do","Do#","Re","Re#","Mi","Fa","Fa#","Sol","Sol#","La","La#","Si"];
const nom=n=>N[n.pc]+n.oct;
const marcato=(pcs,fuelle="abre")=>voicingsDe(pcs,["R","3","5","7"],DEFS_L,DEFS_R,fuelle).find(v=>v.id==="marcato");
let fallas=0;
const igual=(titulo,pcs,esperado)=>{
  const v=marcato(pcs), got=v.vacio?"(vacío)":v.notas.map(nom).join(" ");
  const ok=got===esperado; if(!ok) fallas++;
  console.log((ok?"✓":"✗")+" "+titulo+": "+got+(ok?"":"   ← esperado "+esperado));
};
// Casos del profesor, en la numeración del teclado actual (CSV 2026-11-11: izquierda de la octava 1 a la 3)
igual("Do △7",[0,4,7,11],"Do1 Si2 Mi3");
igual("Do 7 ",[0,4,7,10],"Do1 La#2 Mi3");
igual("La m  ",[9,0,4],"La1 Do3 Mi3");
igual("La m7 ",[9,0,4,7],"La1 Sol2 Do3 Mi3");
igual("Do (mayor) — a confirmar con el profesor",[0,4,7],"Do1 Sol2 Mi3");
// Las doce tonalidades: siempre mano izquierda y el bajo en la raíz más grave
for(const tipo of [[0,4,7,11],[0,4,7,10],[0,3,7],[0,3,7,10],[0,4,7]]){
  for(let r=0;r<12;r++){
    const pcs=tipo.map(i=>(r+i)%12); // pcs: raíz, 3ª, 5ª, 7ª
    const ordenado=tipo.length===4?[pcs[0],pcs[1],pcs[2],pcs[3]]:pcs;
    const v=marcato(ordenado);
    const bien=!v.vacio&&v.manos.R===0&&v.notas[0].pc===r;
    if(!bien){ fallas++; console.log("✗ "+N[r]+" tipo "+tipo.join(",")+": "+(v.vacio?"vacío":v.notas.map(nom).join(" "))); }
  }
}
console.log(fallas?("\nFALLAS: "+fallas):"\nTodo bien.");
process.exit(fallas?1:0);
