// El lienzo de pintar del Entrenador.

import { useMemo } from "react";
import { BTN_SIZE } from "../../../shared/bandoneon/layouts.js";
import { txtSobre } from "../../../shared/teoria/etiquetas.js";

// Teclado en blanco, escalado para entrar siempre en el ancho disponible
// (misma técnica de transform:scale ya usada en BandCanvas).
// ─── Flechas por las canaletas: ruta entre botones siguiendo los bordes de Voronoi (los huecos entre botones) ───
function canalGrafo(P){
  const n=P.length; if(n<3) return null;
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; P.forEach(p=>{x0=Math.min(x0,p.x);x1=Math.max(x1,p.x);y0=Math.min(y0,p.y);y1=Math.max(y1,p.y);});
  const d=Math.max(x1-x0,y1-y0)*20+1, cx=(x0+x1)/2, cy=(y0+y1)/2;
  const pts=[...P,{x:cx-d,y:cy-d},{x:cx,y:cy+d},{x:cx+d,y:cy-d}];
  const circ=(i,j,k)=>{ const a=pts[i],b=pts[j],c=pts[k], D=2*(a.x*(b.y-c.y)+b.x*(c.y-a.y)+c.x*(a.y-b.y)); if(Math.abs(D)<1e-9) return null;
    const A=a.x*a.x+a.y*a.y,B=b.x*b.x+b.y*b.y,C=c.x*c.x+c.y*c.y;
    const ux=(A*(b.y-c.y)+B*(c.y-a.y)+C*(a.y-b.y))/D, uy=(A*(c.x-b.x)+B*(a.x-c.x)+C*(b.x-a.x))/D;
    return {x:ux,y:uy,r2:(a.x-ux)**2+(a.y-uy)**2}; };
  const key=(a,b)=>a<b?a+"_"+b:b+"_"+a;
  let tris=[{v:[n,n+1,n+2],c:circ(n,n+1,n+2)}];
  for(let i=0;i<n;i++){
    const p=pts[i], bad=[], keep=[];
    tris.forEach(t=>{ ((p.x-t.c.x)**2+(p.y-t.c.y)**2 < t.c.r2-1e-9) ? bad.push(t) : keep.push(t); });
    const cnt={}; bad.forEach(t=>{ for(let e=0;e<3;e++){ const k=key(t.v[e],t.v[(e+1)%3]); cnt[k]=(cnt[k]||0)+1; } });
    bad.forEach(t=>{ for(let e=0;e<3;e++){ const a=t.v[e],b=t.v[(e+1)%3]; if(cnt[key(a,b)]===1){ const c=circ(a,b,i); if(c) keep.push({v:[a,b,i],c}); } } });
    tris=keep;
  }
  tris=tris.filter(t=>t.v.every(v=>v<n));
  const nn=P.map((p,i)=>Math.min(...P.map((q,j)=>j===i?1e9:Math.hypot(p.x-q.x,p.y-q.y)))).sort((a,b)=>a-b), d0=nn[Math.floor(nn.length/2)];
  tris=tris.filter(t=>Math.sqrt(t.c.r2)<=d0*0.95);
  const adj=tris.map(()=>[]), pv={}, nb=new Set(), porArista={};
  tris.forEach((t,ti)=>{ t.v.forEach(v=>{ (pv[v]=pv[v]||[]).push(ti); });
    for(let e=0;e<3;e++){ const k=key(t.v[e],t.v[(e+1)%3]); nb.add(k); (porArista[k]=porArista[k]||[]).push(ti); } });
  Object.values(porArista).forEach(l=>{ if(l.length===2){ const [a,b]=l, w=Math.hypot(tris[a].c.x-tris[b].c.x,tris[a].c.y-tris[b].c.y); adj[a].push([b,w]); adj[b].push([a,w]); } });
  return {P,tris,adj,pv,nb,key};
}

function rutaCanal(G,a,b){
  if(!G||G.nb.has(G.key(a,b))) return null;
  const src=G.pv[a]||[], dst=new Set(G.pv[b]||[]); if(!src.length||!dst.size) return null;
  const N=G.tris.length, dist=new Array(N).fill(1e9), prev=new Array(N).fill(-1), done=new Array(N).fill(false);
  src.forEach(t=>{ dist[t]=Math.hypot(G.tris[t].c.x-G.P[a].x,G.tris[t].c.y-G.P[a].y); });
  for(;;){ let u=-1,best=1e9; for(let i=0;i<N;i++) if(!done[i]&&dist[i]<best){best=dist[i];u=i;} if(u<0) return null; done[u]=true;
    if(dst.has(u)){ const path=[]; for(let x=u;x>=0;x=prev[x]) path.push(G.tris[x].c); return path.reverse(); }
    G.adj[u].forEach(([v,w])=>{ if(dist[u]+w<dist[v]){ dist[v]=dist[u]+w; prev[v]=u; } }); }
}

export function PaintCanvas({ buttons, guesses, keyOf, checked, correctOf, onTapButton, maxWidth, maxScale=3, activeId=null, chord=null, escala=null, rotulo=null, flechas=null, rotulos=null, rutaFlechas="recta" }){
  const W = Math.max(...buttons.map(b=>b.x)) + BTN_SIZE + 16;
  const H = Math.max(...buttons.map(b=>b.y)) + BTN_SIZE + 20;
  const target = maxWidth || W;
  // El teclado se ajusta exactamente al ancho disponible (sin scroll lateral).
  const scale = Math.min(maxScale, target / W);
  const scaledW = Math.ceil(W * scale), scaledH = Math.ceil(H * scale);
  const hayFl = !!(flechas && flechas.length>0);
  const G = useMemo(()=> (hayFl && rutaFlechas==="canal") ? canalGrafo(buttons.map(b=>({x:b.x+BTN_SIZE/2,y:b.y+BTN_SIZE/2}))) : null,[buttons,hayFl,rutaFlechas]);
  const idxDe = (pt)=>buttons.findIndex(b=>Math.abs(b.x+BTN_SIZE/2-pt.x)<0.6&&Math.abs(b.y+BTN_SIZE/2-pt.y)<0.6);

  return (
    <div style={{width:"100%", overflow:"hidden"}}>
    <div style={{width:scaledW, height:scaledH, overflow:"hidden", flexShrink:0, margin:"0 auto"}}>
      <div style={{
        position:"relative", width:W, height:H, boxSizing:"border-box",
        transform:`scale(${scale})`, transformOrigin:"top left",
        background:"linear-gradient(145deg,#1d1d1d,#101010)",
        border:"2px solid #3a3a3a", borderRadius:16,
        boxShadow:"0 8px 24px rgba(0,0,0,.7)",
      }}>
        {buttons.map(btn=>{
          let bg, borderCss, glow, content=null;
          if(escala){
            const st=escala.stateOf(btn); bg=st.bg; borderCss=st.border; glow=st.glow; content=st.content;
          } else if(chord){
            const sel = chord.isSel(btn), lab = chord.labelOf(btn);
            const ok = checked && sel && lab, bad = checked && sel && !lab;
            const miss = checked && !sel && lab && chord.isMissed(btn);
            const verResp = chord.reveal && lab;
            bg = verResp ? correctOf(btn) : sel ? "#6a6a6a" : "#1a1a1a";
            borderCss = ok ? "3px solid #6b9c7c" : bad ? "3px solid #b5564f" : miss ? "3px dashed #ffffff"
              : (sel||verResp) ? "3px solid #ffffff" : "3px solid #555";
            glow = btn.id===activeId ? "0 0 0 4px #e6e6e6" : (ok ? "0 0 10px #6b9c7caa" : miss ? "0 0 10px #ffffff88" : "none");
            if(ok) content=<span style={{fontSize:14,color:"#fff",fontWeight:800}}>✓</span>;
            else if(bad) content=<span style={{fontSize:13,color:"#fff",fontWeight:800}}>✕</span>;
            else if(verResp||miss) content=<span style={{fontSize:12,color:miss?"#fff":txtSobre(bg),fontWeight:800,fontFamily:"monospace"}}>{lab}</span>;
          } else {
            const guess = guesses[keyOf(btn.id)];
            const correct = checked ? correctOf(btn) : null;
            const isRight = checked && guess && guess===correct;
            const isWrong = checked && guess && guess!==correct;
            bg = guess || "#1a1a1a";
            borderCss = `3px solid ${isRight?"#6b9c7c":isWrong?"#b5564f":guess?"rgba(255,255,255,.5)":"#555"}`;
            glow = btn.id===activeId ? "0 0 0 4px #e6e6e6" : (guess ? `0 0 10px ${guess}99` : "none");
            const etq = (checked && rotulo && guess) ? rotulo(btn) : null;
            const marca = (m,sz)=> <span style={{display:"flex",flexDirection:"column",alignItems:"center",lineHeight:1.05,color:"#fff",textShadow:"0 1px 3px rgba(0,0,0,.95)"}}>
              <span style={{fontSize:sz,fontWeight:800}}>{m}</span>{etq ? <span style={{fontSize:8.5,fontWeight:800,fontFamily:"monospace"}}>{etq}</span> : null}</span>;
            if(isRight) content=marca("✓",13);
            if(isWrong) content=marca("✕",12);
          }
          return (
            <button key={btn.id} onClick={(e)=>onTapButton(btn, e.currentTarget.getBoundingClientRect())}
              style={{
                position:"absolute", left:btn.x, top:btn.y, width:BTN_SIZE, height:BTN_SIZE, borderRadius:"50%",
                background:bg, border:borderCss, boxShadow:glow,
                cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
              }}>
              {content}
            </button>
          );
        })}
        {flechas && flechas.length>0 && (
          <svg width={W} height={H} style={{position:"absolute",left:0,top:0,pointerEvents:"none",overflow:"visible"}}>
            <defs><marker id="camflecha" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="3.6" markerHeight="3.6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#fff" fillOpacity=".8"/></marker></defs>
            {flechas.map((f,i)=>{
              const dx=f.b.x-f.a.x, dy=f.b.y-f.a.y, d=Math.hypot(dx,dy)||1, r=BTN_SIZE/2+2, rr=BTN_SIZE/2;
              if(d<=2*r+6) return null;
              const ia=idxDe(f.a), ib=idxDe(f.b);
              const libre=(p,q)=>{ const vx=q.x-p.x, vy=q.y-p.y, l2=vx*vx+vy*vy||1;
                for(let k=0;k<buttons.length;k++){ if(k===ia||k===ib) continue; const cx=buttons[k].x+rr, cy=buttons[k].y+rr;
                  const t=Math.max(0,Math.min(1,((cx-p.x)*vx+(cy-p.y)*vy)/l2)), ex=p.x+t*vx-cx, ey=p.y+t*vy-cy;
                  if(ex*ex+ey*ey<(rr+7)*(rr+7)) return false; } return true; };
              const recta=()=>(<line key={i} x1={f.a.x+dx/d*r} y1={f.a.y+dy/d*r} x2={f.b.x-dx/d*(r+1)} y2={f.b.y-dy/d*(r+1)}
                stroke="#fff" strokeOpacity=".5" strokeWidth="1.8" strokeLinecap="round" strokeDasharray={f.dash?"6 5":undefined} markerEnd="url(#camflecha)"/>);
              if(rutaFlechas!=="canal"||!G||ia<0||ib<0||libre(f.a,f.b)) return recta();
              const ruta=rutaCanal(G,ia,ib); if(!ruta||!ruta.length) return recta();
              // se quitan los giros que no hacen falta: queda el menor número de tramos rectos que esquivan los botones
              const wps=[f.a,...ruta,f.b], pts=[wps[0]]; let k0=0;
              while(k0<wps.length-1){ let j=wps.length-1; while(j>k0+1&&!libre(wps[k0],wps[j])) j--; pts.push(wps[j]); k0=j; }
              const u=(p,q,k)=>{ const l=Math.hypot(q.x-p.x,q.y-p.y)||1; return {x:p.x+(q.x-p.x)/l*k,y:p.y+(q.y-p.y)/l*k}; };
              const P=[...pts]; P[0]=u(pts[0],pts[1],r); P[P.length-1]=u(pts[pts.length-1],pts[pts.length-2],r+2);
              let dd=`M${P[0].x},${P[0].y}`;
              for(let k=1;k<P.length-1;k++){ const l1=Math.hypot(P[k].x-P[k-1].x,P[k].y-P[k-1].y), l2=Math.hypot(P[k+1].x-P[k].x,P[k+1].y-P[k].y), kk=Math.min(9,l1/2,l2/2);
                const A=u(P[k],P[k-1],kk), B=u(P[k],P[k+1],kk); dd+=` L${A.x},${A.y} Q${P[k].x},${P[k].y} ${B.x},${B.y}`; }
              dd+=` L${P[P.length-1].x},${P[P.length-1].y}`;
              return <path key={i} d={dd} fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={f.dash?"6 5":undefined} markerEnd="url(#camflecha)"/>;
            })}
          </svg>
        )}
        {rotulos && rotulos.map((t,i)=>(
          <div key={"r"+i} style={{position:"absolute",left:t.x,top:t.y,transform:"translate(-50%,-100%)",pointerEvents:"none",background:"#000d",border:"1px solid #ffffff66",color:"#fff",
            fontSize:9,fontWeight:800,padding:"1px 6px",borderRadius:8,whiteSpace:"nowrap",fontFamily:"monospace"}}>{t.text}</div>
        ))}
      </div>
    </div>
    </div>
  );
}
