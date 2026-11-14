// @motor
// Escucha por micrófono: estima la nota.

// ─── Escucha por micrófono: detector de varias notas por espectro, acotado a las notas que el teclado puede producir ───
export function micEstimar(mag,sr,N,cands,maxN){
  const binHz=sr/N, nb=mag.length;
  const res=Float32Array.from(mag);
  const win=(f)=>{ const k=f/binHz; return [Math.max(1,Math.floor(k*0.985-0.5)),Math.min(nb-2,Math.ceil(k*1.015+0.5))]; };
  const peak=(f)=>{ const [a,b]=win(f); let m=0; for(let i=a;i<=b;i++) if(res[i]>m) m=res[i]; return m; };
  let maxAll=0; for(let i=Math.floor(40/binHz);i<Math.min(nb,Math.floor(3000/binHz));i++) if(res[i]>maxAll) maxAll=res[i];
  if(maxAll<1e-3) return [];
  const W=[1,.7,.5,.35,.25,.18], salida=[]; let primero=0;
  const puntaje=new Map();
  const score=(m)=>{ const f=440*Math.pow(2,(m-69)/12); if(f<55||f>1800) return 0;
    const p=[]; for(let h=1;h<=6;h++){ p.push(f*h>4000?0:peak(f*h)); }
    let s=0; for(let h=0;h<6;h++) s+=W[h]*p[h];
    s*=Math.min(1,0.15+2.5*p[0]/Math.max(p[0],p[1],p[2],1e-9));   // la fundamental pesa, pero puede ser débil
    return s; };
  for(let it=0;it<maxN;it++){
    let best=null,bs=0; const sc=new Map();
    for(const m of cands){ if(salida.includes(m)) continue; const s=score(m); sc.set(m,s); if(s>bs){bs=s;best=m;} }
    if(best===null) break;
    // si la octava de abajo explica casi igual de bien, es esa (las lengüetas duplican la octava de arriba)
    const baja=best-12; if(cands.has(baja)){ const sb=sc.has(baja)?sc.get(baja):score(baja); if(sb>=0.8*bs){ best=baja; bs=sb; } }
    if(it===0){ if(bs<0.6*maxAll) break; primero=bs; } else if(bs<0.4*primero) break;
    salida.push(best);
    const f=440*Math.pow(2,(best-69)/12);
    for(let h=1;h<=8;h++){ if(f*h>4000) break; const [a,b]=win(f*h); for(let i=a;i<=b;i++) res[i]*=0.03; }
  }
  return salida.sort((a,b)=>a-b);
}
