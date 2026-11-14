// El cuadro de formas y las líneas.

import { useRef } from "react";
import { BTN_SIZE } from "../../../shared/bandoneon/layouts.js";
import { CHROMATIC, nombreLat } from "../../../shared/teoria/notas.js";
import { itemsMano } from "../../../shared/bandoneon/tablas.js";

// ─── EJERCICIOS: ARMAR EL TECLADO · PONER LAS NOTAS ───────────────────────────
export const FORMA_TOL = 46, FORMA_GRID = 14;   // 46 ≈ un botón de margen (ver FORMA_NIVELES)

export const FORMA_NIVELES = [[46,"Flexible"],[32,"Normal"],[20,"Exigente"]];

// Empareja cada botón real con el círculo puesto más cercano (a menos de `tol` unidades, medio botón aprox.).
// Lo que queda sin pareja son círculos que sobran y botones que faltan.
export function matchForma(real, pts, tol=FORMA_TOL){
  const pares=[];
  real.forEach(b=>pts.forEach(q=>{ const d=Math.hypot(b.x-q.x,b.y-q.y); if(d<=tol) pares.push({d,b:b.id,p:q.id}); }));
  pares.sort((a,c)=>a.d-c.d);
  const okB=new Set(), okP=new Set();
  pares.forEach(q=>{ if(okB.has(q.b)||okP.has(q.p)) return; okB.add(q.b); okP.add(q.p); });
  return {okB, okP, extra:pts.filter(q=>!okP.has(q.id)).length, falta:real.filter(b=>!okB.has(b.id))};
}

// Tablero vacío: se toca para poner círculos, se toca un círculo para sacarlo y se arrastra para acomodarlo.
export function FormaCanvas({ real, pts, onChange, checked, reveal, grid, tol=FORMA_TOL, maxWidth, maxScale=3 }){
  const W = Math.max(...real.map(b=>b.x)) + BTN_SIZE + 16;
  const H = Math.max(...real.map(b=>b.y)) + BTN_SIZE + 20;
  const scale = Math.min(maxScale, (maxWidth||W)/W);
  const scaledW = Math.ceil(W*scale), scaledH = Math.ceil(H*scale);
  const boardRef = useRef(null), drag = useRef(null), suppress = useRef(false);
  const R = BTN_SIZE/2;
  const snapC = v => grid ? Math.round(v/FORMA_GRID)*FORMA_GRID : v;          // el imán actúa sobre el centro del círculo
  const place = (cx,cy)=>({ x:Math.min(Math.max(snapC(cx)-R,0),W-BTN_SIZE-4), y:Math.min(Math.max(snapC(cy)-R,0),H-BTN_SIZE-4) });
  const m = (checked||reveal) ? matchForma(real, pts, tol) : null;

  const onBoardClick = (e)=>{
    if(e.target!==e.currentTarget) return;
    const r=e.currentTarget.getBoundingClientRect(), kk=r.width/W;
    const pos=place((e.clientX-r.left)/kk-2, (e.clientY-r.top)/kk-2);
    if(pts.some(q=>Math.hypot(q.x-pos.x,q.y-pos.y)<BTN_SIZE*0.8)) return;      // no se montan unos sobre otros
    onChange([...pts,{id:1+Math.max(0,...pts.map(q=>q.id)),...pos}]);
  };
  const down = (e,q)=>{ suppress.current=false; try{ e.currentTarget.setPointerCapture(e.pointerId); }catch(_){}
    drag.current={id:q.id,sx:e.clientX,sy:e.clientY,ox:q.x,oy:q.y,moved:false}; };
  const move = (e,q)=>{ const d=drag.current; if(!d||d.id!==q.id) return;
    if(!d.moved && Math.hypot(e.clientX-d.sx,e.clientY-d.sy)<6) return;
    d.moved=true;
    const kk=boardRef.current.getBoundingClientRect().width/W;
    const pos=place(d.ox+R+(e.clientX-d.sx)/kk, d.oy+R+(e.clientY-d.sy)/kk);
    onChange(pts.map(z=>z.id===q.id?{...z,...pos}:z)); };
  const up = ()=>{ if(drag.current){ if(drag.current.moved) suppress.current=true; drag.current=null; } };
  const tap = (e,q)=>{ e.stopPropagation(); if(suppress.current){ suppress.current=false; return; } onChange(pts.filter(z=>z.id!==q.id)); };

  const fondo = "linear-gradient(145deg,#1d1d1d,#101010)";
  return (
    <div style={{width:"100%",overflow:"hidden"}}>
    <div style={{width:scaledW,height:scaledH,overflow:"hidden",flexShrink:0,margin:"0 auto"}}>
      <div ref={boardRef} onClick={onBoardClick} style={{
        position:"relative",width:W,height:H,boxSizing:"border-box",transform:`scale(${scale})`,transformOrigin:"top left",
        background: grid ? `radial-gradient(circle, rgba(255,255,255,.17) 1.4px, transparent 1.9px) -${FORMA_GRID/2}px -${FORMA_GRID/2}px / ${FORMA_GRID}px ${FORMA_GRID}px, ${fondo}` : fondo,
        border:"2px solid #3a3a3a",borderRadius:16,boxShadow:"0 8px 24px rgba(0,0,0,.7)",cursor:"crosshair"}}>
        {reveal && m && m.falta.map(b=>(
          <div key={"g"+b.id} style={{position:"absolute",left:b.x,top:b.y,width:BTN_SIZE,height:BTN_SIZE,borderRadius:"50%",border:"3px dashed #ffffffcc",pointerEvents:"none",boxShadow:"0 0 10px #ffffff55"}}/>
        ))}
        {pts.map(q=>{
          const ok = m ? m.okP.has(q.id) : null;
          return (
            <button key={q.id} onPointerDown={e=>down(e,q)} onPointerMove={e=>move(e,q)} onPointerUp={up} onPointerCancel={up} onClick={e=>tap(e,q)}
              style={{position:"absolute",left:q.x,top:q.y,width:BTN_SIZE,height:BTN_SIZE,borderRadius:"50%",padding:0,touchAction:"none",cursor:"grab",
                background:"#2a2a2a",display:"flex",alignItems:"center",justifyContent:"center",
                border: checked ? `3px solid ${ok?"#6b9c7c":"#b5564f"}` : "3px solid rgba(255,255,255,.6)",
                boxShadow: checked ? (ok?"0 0 10px #6b9c7caa":"0 0 10px #b5564faa") : "none"}}>
              {checked && <span style={{fontSize:14,color:"#fff",fontWeight:800}}>{ok?"✓":"✕"}</span>}
            </button>
          );
        })}
      </div>
    </div>
    </div>
  );
}

// ─── UBICAR LÍNEAS: hileras, diagonales y otros patrones para entender dónde está cada botón ───
export const LIN_COLS=["#f2f2f2","#7fb3d5","#e6b17e","#a3d9a5","#d7a3d9","#e3dc7a","#f08a8a","#8fd9d2","#aab0ff"];

const LIN_FILAS={L:[[1,5],[6,12],[13,18],[19,25],[26,33]],R:[[1,4],[5,9],[10,15],[16,22],[23,30],[31,38]]};

export const LIN_TIPOS=[["filas","Filas (arcos)"],["diagAbj","Diagonales ↘"],["diagArr","Diagonales ↙"],["octavas","Por octava"],["nombre","Misma nota"]];

export const LIN_TEXTO={
  filas:"Las filas son los arcos de botones: seis en la mano derecha y cinco en la izquierda. Cada fila se cuenta de izquierda a derecha.",
  diagAbj:"Cada botón tiene un vecino abajo y a la derecha: seguirlo arma una diagonal ↘. Se cuenta de arriba hacia abajo.",
  diagArr:"Cada botón tiene un vecino abajo y a la izquierda: seguirlo arma una diagonal ↙. Se cuenta de arriba hacia abajo.",
  octavas:"Agrupa los botones por octava, según el fuelle elegido. Se cuenta de la nota más grave a la más aguda.",
  nombre:"Junta todos los botones que dan la misma nota, según el fuelle elegido. Se cuenta del más grave al más agudo.",
};

export function lineasDe(h,btns,tipo,bellows){
  if(!btns.length) return [];
  const by=Object.fromEntries(btns.map(b=>[b.id,b]));
  const filas=(LIN_FILAS[h]||[]).map(([a,b])=>{ const ids=[]; for(let n=a;n<=b;n++){ const id=h+String(n).padStart(2,"0"); if(by[id]) ids.push(id); } return ids.sort((p,q)=>by[p].x-by[q].x); }).filter(r=>r.length);
  if(tipo==="filas") return filas.map((ids,i)=>({nombre:"Fila "+(i+1),ids}));
  if(tipo==="diagAbj"||tipo==="diagArr"){
    const sg=tipo==="diagAbj"?1:-1, nxt={};
    for(let r=0;r<filas.length-1;r++) for(const a of filas[r]){
      const c=filas[r+1].filter(b=>{ const dx=sg*(by[b].x-by[a].x); return dx>=10&&dx<=85&&by[b].y>by[a].y; });
      if(c.length) nxt[a]=c.reduce((m,b)=>Math.abs(by[b].x-by[a].x)<Math.abs(by[m].x-by[a].x)?b:m);
    }
    const tiene=new Set(Object.values(nxt)), out=[];
    filas.flat().forEach(a=>{ if(!tiene.has(a)){ const l=[a]; while(nxt[l[l.length-1]]) l.push(nxt[l[l.length-1]]); out.push(l); } });
    const mx=l=>l.reduce((t,id)=>t+by[id].x,0)/l.length;
    return out.sort((p,q)=>mx(p)-mx(q)).map((ids,i)=>({nombre:"Diagonal "+(i+1),ids}));
  }
  const its=itemsMano(btns,bellows).sort((p,q)=>p.midi-q.midi||p.b.x-q.b.x), g={};
  its.forEach(it=>{ const k=tipo==="octavas"?it.oct:it.pc; (g[k]=g[k]||[]).push(it.b.id); });
  return Object.keys(g).map(Number).sort((a,b)=>a-b).map(k=>({nombre:tipo==="octavas"?"Octava "+k:nombreLat(CHROMATIC[k]),ids:g[k]}));
}
