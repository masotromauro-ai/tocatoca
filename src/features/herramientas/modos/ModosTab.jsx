// La pestaña Modos y sus tres vistas.

import { useState, useMemo } from "react";
import { aRomano } from "../../../shared/teoria/romanos.js";
import { pasoLabel } from "../../../shared/ui/codigo/figuras.jsx";
import { cqPol, cqSector } from "../../../shared/teoria/quintas.js";
import { tocarNombres } from "../../../shared/audio/tocar.js";
import { CHROMATIC, buildScale, nombreLat, noteIdx } from "../../../shared/teoria/notas.js";
import { nc } from "../../../shared/teoria/color.js";
import { UI_FONT, uiLabel, uiPill, uiPlay } from "../../../shared/ui/tema.js";
import { playBand } from "../../../shared/audio/audio.js";
import { DN, MODE_BY_DEGREE, tNote } from "../../../shared/teoria/escalas.js";
import { FAMILIAS, QBASE, SUF_ES, TONICAS_MAYOR, dondeVive } from "../../../shared/teoria/progresiones.js";
import { NotaDot, TensionChip } from "../../../shared/ui/teoria/notas.jsx";
import { ACORDE_RAICES } from "../../../shared/bandoneon/acordes-base.js";
import { CROM_SIMPLE, GRADO_LABEL, txtSobre } from "../../../shared/teoria/etiquetas.js";

export function ModosTab(){
  const [root,setRoot]=useState("C");
  const [vista,setVista]=useState("rel");      // rel: modos de la escala mayor de X · par: todos desde la misma tónica
  const major=buildScale(root,[0,2,4,5,7,9,11]);
  const usos=["Tónica mayor, jazz, bossa nova, pop","II grado, jazz-funk, tango luminoso","III grado, color oscuro, transición","IV mayor, bossa nova, jazz moderno","V7, dominante de todos los estilos","VI grado, balada, tango en menor","VII°, paso cromático, tango expresivo"];
  return(
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold mb-1" style={{fontFamily:"'Libre Baskerville',serif"}}>Modos</h2>
        <p className="text-xs text-gray-500">Los 7 modos, sus tensiones y su uso en tango y jazz. Elegí la tónica para transportarlos a cualquier tonalidad.</p>
      </div>
      <div style={{background:"#121214",border:"1px solid #26262a",borderRadius:12,padding:"12px 14px"}}>
        <p style={{...uiLabel,marginBottom:8}}>Tónica</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {ACORDE_RAICES.map(x=>(<button key={x} style={uiPill(root===x,{padding:"5px 11px"})} onClick={()=>setRoot(x)}>{nombreLat(x)}</button>))}
        </div>
        <p style={{...uiLabel,marginBottom:8}}>Cómo mostrarlos</p>
        <div className="flex flex-wrap gap-1.5">
          <button style={uiPill(vista==="rel",{padding:"6px 13px"})} onClick={()=>setVista("rel")}>Modos de la escala mayor de {nombreLat(root)}</button>
          <button style={uiPill(vista==="par",{padding:"6px 13px"})} onClick={()=>setVista("par")}>Todos desde {nombreLat(root)} (paralelos)</button>
        </div>
      </div>
      {MODE_BY_DEGREE.map((md,i)=>{
        const modeRoot = vista==="rel" ? major[i] : root;
        const notas=buildScale(modeRoot,md.ivs);
        const twn=md.tensions.map(t=>({label:t,note:tNote(modeRoot,t)}));
        const awn=md.avoid.map(t=>({label:t,note:tNote(modeRoot,t)}));
        return(
          <div key={i} className="rounded-xl overflow-hidden" style={{background:"#121214",border:"1px solid #26262a"}}>
            <div className="px-4 py-3" style={{borderBottom:"1px solid #1f1f22"}}>
              <div className="flex items-center gap-3 flex-wrap">
                <span style={{fontFamily:"monospace",fontWeight:800,fontSize:13,padding:"4px 9px",borderRadius:8,background:"#1a1a1a",color:"#e6e6e6",border:"1px solid #2a2a2e"}}>{DN[i]}</span>
                <div style={{flex:"1 1 200px"}}>
                  <p style={{fontFamily:"'Libre Baskerville',serif",fontWeight:700,fontSize:16,margin:0}}>{nombreLat(modeRoot)} {md.name}</p>
                  <p style={{fontSize:11.5,color:"#8a8a90",margin:"2px 0 0"}}>{md.q} — {vista==="rel"?`grado ${DN[i]} de la escala mayor de ${nombreLat(root)}`:`desde ${nombreLat(root)}`}</p>
                </div>
                <button style={uiPlay(false,{padding:"5px 12px",fontSize:11})} onClick={()=>tocarNombres([...notas,notas[0]])}>▶ Escuchar</button>
              </div>
            </div>
            <div className="px-4 py-3 space-y-3">
              <div className="flex flex-wrap gap-2">
                {notas.map((n,ni)=>(
                  <div key={ni} className="flex flex-col items-center gap-1" style={{minWidth:34}}>
                    <NotaDot note={n} size={32}/>
                    <span style={{fontSize:9,color:"#6a6a70",fontFamily:"monospace"}}>{GRADO_LABEL[md.ivs[ni]]}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div style={{border:"1px solid #1f3a1f",borderRadius:10,padding:"9px 10px",background:"#0a100a"}}>
                  <p style={{fontSize:11,fontWeight:800,color:"#7fcf7f",margin:"0 0 6px"}}>✅ Tensiones</p>
                  <div className="flex flex-wrap gap-1.5">
                    {twn.map((t,j)=>(<TensionChip key={j} label={t.label} note={t.note} tipo="ok"/>))}
                    {!twn.length && <span style={{fontSize:11,color:"#555"}}>Sin tensiones adicionales</span>}
                  </div>
                </div>
                <div style={{border:"1px solid #3a1f1f",borderRadius:10,padding:"9px 10px",background:"#100a0a"}}>
                  <p style={{fontSize:11,fontWeight:800,color:"#d98a8a",margin:"0 0 6px"}}>⚠️ Evitar</p>
                  <div className="flex flex-wrap gap-1.5">
                    {awn.map((t,j)=>(<TensionChip key={j} label={t.label} note={t.note} tipo="no"/>))}
                    {!awn.length && <span style={{fontSize:11,color:"#555"}}>—</span>}
                  </div>
                </div>
              </div>
              <p style={{fontSize:12,color:"#8a8a90",margin:0}}><span style={{color:"#a3a3a3",fontWeight:600}}>Uso típico: </span>{usos[i]}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ¿Dónde vive este acorde? Grados en los que aparece, con cada tonalidad bien escrita
export function DondeVive({chord}){
  const res=useMemo(()=>dondeVive(noteIdx(chord.root),chord.quality,chord.notes.map(noteIdx)),[chord.root,chord.quality]);
  const base=QBASE[chord.quality];
  const orden=(l)=>[...l].sort((a,b)=>a.grado-b.grado||(TONICAS_MAYOR.indexOf(a.tonica)-TONICAS_MAYOR.indexOf(b.tonica)));
  const fila=(x)=>{
    const famTxt=x.menor?(x.fams.includes("menor")?"menor":x.fams.map(f=>FAMILIAS.find(g=>g.id===f).nombre).join(" y ")):"mayor";
    return (
      <div key={(x.menor?"m":"M")+x.tonica+x.grado} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"7px 0",borderTop:"1px solid #1c1c1f"}}>
        <span style={{fontFamily:"monospace",fontWeight:800,fontSize:12,minWidth:46,textAlign:"center",padding:"3px 6px",borderRadius:7,background:"#1a1a1a",border:"1px solid #2a2a2e",color:"#ececec"}}>{x.rom}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,color:"#ececec"}}>de <b style={{fontFamily:"'Libre Baskerville',serif"}}>{nombreLat(x.tonica)} {famTxt}</b>
            {x.menor&&x.fams.length>1&&x.fams.includes("menor")&&<span style={{fontSize:10.5,color:"#7c7c82"}}> · también en la armónica/melódica</span>}</div>
          <div style={{fontSize:11,color:"#9a9aa2"}}>{x.nombre} · {x.notas.map(nombreLat).join(" · ")}</div>
          {x.contraste&&<div style={{fontSize:10.5,color:"#7c7c82",fontStyle:"italic"}}>En {nombreLat(x.contraste.tonica)} {x.contraste.menor?"menor":"mayor"} ese grado es {x.contraste.acorde}.</div>}
        </div>
      </div>);
  };
  const may=res?orden(res.filter(x=>!x.menor)):[], men=res?orden(res.filter(x=>x.menor)):[];
  return (
    <div style={{background:"#121214",border:"1px solid #26262a",borderRadius:14,padding:"12px 14px"}}>
      <p style={{...uiLabel,marginBottom:4}}>¿Dónde vive este acorde?</p>
      {res===null
        ? <p style={{fontSize:12,color:"#8a8a90",margin:"6px 0 0"}}>Este acorde es de color o de paso y no es diatónico en una escala de siete notas. Mirá sus funciones abajo.</p>
        : (<>
            <p style={{fontSize:11,color:"#7c7c82",margin:"0 0 6px"}}>Grados en los que aparece{chord.quality!==base?`, leído como ${SUF_ES[base]||base}`:""}, con cada tonalidad escrita como corresponde.</p>
            {res.length===0 && <p style={{fontSize:12,color:"#8a8a90",margin:0}}>No aparece sin alterar en ninguna tonalidad: es un acorde de paso o de color.</p>}
            {may.length>0 && <p style={{...uiLabel,fontSize:9.5,margin:"8px 0 2px"}}>Tonalidades mayores</p>}
            {may.map(fila)}
            {men.length>0 && <p style={{...uiLabel,fontSize:9.5,margin:"12px 0 2px"}}>Tonalidades menores</p>}
            {men.map(fila)}
          </>)}
    </div>
  );
}

// ── Tres formas de ver una escala ──
export function VistaLineal({root,esc,romano}){
  const r=noteIdx(root), escritas=buildScale(root,esc.ivs), nom={}; escritas.forEach(n=>{ nom[noteIdx(n)]=nombreLat(n); });
  const miembros=[...esc.ivs,12], set=new Set(miembros), W=60, top=34, H=70;
  return(
    <svg viewBox="0 0 780 170" width="100%" style={{display:"block"}}>
      {[...Array(13).keys()].map(j=>{
        const pc=(r+j)%12, on=set.has(j), col=nc(CHROMATIC[pc]), x=j*W+2, g=j===12?"8":GRADO_LABEL[j];
        const a=r+j;
        return(
          <g key={j} onClick={()=>playBand(CHROMATIC[pc],4+Math.floor(a/12))} style={{cursor:"pointer",opacity:on?1:0.17,transition:"opacity .2s"}}>
            {on && <text x={x+28} y={22} textAnchor="middle" style={{fontFamily:UI_FONT,fontWeight:800,fontSize:13,fill:"#cfcfd4"}}>{romano?aRomano(g):g}</text>}
            <rect x={x} y={top} width={56} height={H} rx={11} fill={col} stroke={on?"rgba(255,255,255,.5)":"rgba(255,255,255,.1)"} strokeWidth="1.5"/>
            <text x={x+28} y={top+H/2+1} textAnchor="middle" dominantBaseline="middle" style={{fontFamily:"'Libre Baskerville',serif",fontWeight:700,fontSize:17,fill:txtSobre(col),pointerEvents:"none"}}>{(on?(nom[pc]||CROM_SIMPLE[CHROMATIC[pc]]):CROM_SIMPLE[CHROMATIC[pc]]).split(" ")[0]}</text>
          </g>
        );
      })}
      {miembros.slice(0,-1).map((j,k)=>{
        const b=miembros[k+1], xa=j*W+30, xb=b*W+30, y=top+H+26;
        return(
          <g key={k}>
            <path d={`M${xa} ${y-7} V${y} H${xb} V${y-7}`} fill="none" stroke="#6a6a70" strokeWidth="1.6" strokeLinejoin="round"/>
            <text x={(xa+xb)/2} y={y+17} textAnchor="middle" style={{fontFamily:"monospace",fontWeight:800,fontSize:13,fill:"#a0a0a6"}}>{pasoLabel(b-j)}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function VistaCircular({root,esc,romano}){
  const r=noteIdx(root), escritas=buildScale(root,esc.ivs), pcs=escritas.map(noteIdx), nom={}; escritas.forEach(n=>{ nom[noteIdx(n)]=nombreLat(n); });
  const C=200, R0=96, R1=170;
  const puntos=pcs.map(pc=>cqPol(C,C,R0-14,pc*30));
  const orden=[...pcs].sort((a,b)=>((a-r+12)%12)-((b-r+12)%12));
  const poli=orden.map(pc=>cqPol(C,C,R0-14,pc*30)).map((p,i)=>`${i?"L":"M"}${p[0]} ${p[1]}`).join(" ")+" Z";
  return(
    <svg viewBox="0 0 400 400" width="100%" style={{display:"block",overflow:"visible"}}>
      {[...Array(12).keys()].map(pc=>{
        const a=pc*30, on=pcs.includes(pc), col=nc(CHROMATIC[pc]), [tx,ty]=cqPol(C,C,(R0+R1)/2,a);
        return(
          <g key={pc} onClick={()=>playBand(CHROMATIC[pc],4)} style={{cursor:"pointer",opacity:on?1:0.17,transition:"opacity .2s"}}>
            <path d={cqSector(C,C,R0,R1,a-14.3,a+14.3)} fill={col} stroke={on?"rgba(255,255,255,.5)":"rgba(255,255,255,.1)"} strokeWidth="1.3"/>
            <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" style={{fontFamily:"'Libre Baskerville',serif",fontWeight:700,fontSize:16,fill:txtSobre(col),pointerEvents:"none"}}>{(nom[pc]||CROM_SIMPLE[CHROMATIC[pc]]).split(" ")[0]}</text>
          </g>
        );
      })}
      <path d={poli} fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.55)" strokeWidth="1.5" strokeLinejoin="round"/>
      {pcs.map((pc,i)=>{ const [x,y]=puntos[i]; return(<g key={i} style={{pointerEvents:"none"}}><circle cx={x} cy={y} r={10} fill={nc(CHROMATIC[pc])} stroke="#fff" strokeWidth="1.3"/>
        <text x={x} y={y+0.5} textAnchor="middle" dominantBaseline="middle" style={{fontFamily:UI_FONT,fontWeight:800,fontSize:8.5,fill:txtSobre(nc(CHROMATIC[pc]))}}>{romano?aRomano(GRADO_LABEL[esc.ivs[i]]):GRADO_LABEL[esc.ivs[i]]}</text></g>); })}
      <text x={C} y={C-4} textAnchor="middle" style={{fontFamily:"'Libre Baskerville',serif",fontWeight:700,fontSize:22,fill:"#ececec"}}>{nombreLat(root)}</text>
      <text x={C} y={C+16} textAnchor="middle" style={{fontFamily:UI_FONT,fontSize:10.5,fill:"#8a8a90"}}>{esc.corto.toLowerCase()}</text>
    </svg>
  );
}

export function VistaEspiral({root,esc}){
  const r=noteIdx(root), escritas=buildScale(root,esc.ivs), nom={}; escritas.forEach(n=>{ nom[noteIdx(n)]=nombreLat(n); });
  const set=new Set(esc.ivs), C=240, VUELTAS=3, N=12*VUELTAS;
  const rad=(n)=>34+n*5.3;
  const pt=(n)=>cqPol(C,C,rad(n),n*30);
  let d=""; for(let k=0;k<=N*10;k++){ const n=k/10, [x,y]=cqPol(C,C,rad(n),n*30); d+=(k?"L":"M")+x.toFixed(1)+" "+y.toFixed(1)+" "; }
  return(
    <svg viewBox="0 0 480 480" width="100%" style={{display:"block",overflow:"visible"}}>
      <path d={d} fill="none" stroke="#2c2c30" strokeWidth="2"/>
      {[...Array(N+1).keys()].map(n=>{
        const pc=(r+n)%12, on=set.has(n%12)||(n%12===0), col=nc(CHROMATIC[pc]), [x,y]=pt(n), a=r+n, oct=3+Math.floor(a/12);
        const esRaiz=n%12===0;
        return(
          <g key={n} onClick={()=>playBand(CHROMATIC[pc],oct)} style={{cursor:"pointer"}}>
            {on ? (<>
              <circle cx={x} cy={y} r={esRaiz?16:14} fill={col} stroke={esRaiz?"#fff":"rgba(255,255,255,.45)"} strokeWidth={esRaiz?2.4:1.3}/>
              <text x={x} y={y+0.5} textAnchor="middle" dominantBaseline="middle" style={{fontFamily:"'Libre Baskerville',serif",fontWeight:700,fontSize:11,fill:txtSobre(col),pointerEvents:"none"}}>{(nom[pc]||CROM_SIMPLE[CHROMATIC[pc]]).split(" ")[0]}</text>
              {esRaiz && <text x={x} y={y+27} textAnchor="middle" style={{fontFamily:"monospace",fontSize:10,fill:"#8a8a90",pointerEvents:"none"}}>{oct}</text>}
            </>) : (<circle cx={x} cy={y} r={5} fill={col} opacity=".3"/>)}
          </g>
        );
      })}
    </svg>
  );
}
