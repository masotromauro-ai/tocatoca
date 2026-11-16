// El panel de Ubicar líneas: filas y diagonales del teclado, contadas y escuchadas (fase 6, movido tal cual).

import { CHROMATIC } from "../../../shared/teoria/notas.js";
import { nc } from "../../../shared/teoria/color.js";
import { uiLabel, uiPill, uiPlay } from "../../../shared/ui/tema.js";
import { itemsMano } from "../../../shared/bandoneon/tablas.js";
import { Desplegable } from "../../../shared/ui/ayudas.jsx";
import { LIN_TEXTO, LIN_TIPOS } from "../ayudas/formas.jsx";
import { CROM_SIMPLE, txtSobre } from "../../../shared/teoria/etiquetas.js";

export function PanelLineas({ bellows, leftBtns, linEscuchar, linL, linR, linRot, linSel, linTipo, rightBtns, setLinRot, setLinSel, setLinTipo, tocarItem, view }) {
  return (
    (()=>{
        const manos=[...(view!=="derecha"?[["L","Mano izquierda",linL,leftBtns]]:[]),...(view!=="izquierda"?[["R","Mano derecha",linR,rightBtns]]:[])];
        const maxL=Math.max(0,...manos.map(m=>m[2].length));
        return (
        <div className="rounded-xl mb-3" style={{background:"#121212",border:"1px solid #2a2a2a",padding:"12px 14px"}}>
          <p className="text-xs text-gray-500" style={{margin:"0 0 10px"}}>{LIN_TEXTO[linTipo]} Tocá un botón (o elegí un número) para ver su línea completa; tocalo de nuevo para volver a ver todas.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:12,marginBottom:12}}>
            <Desplegable etiqueta="Patrón" valor={linTipo} opciones={LIN_TIPOS} onChange={setLinTipo}/>
            <Desplegable etiqueta="Rótulo en los botones" valor={linRot} opciones={[["pos","Número para contar (1, 2, 3…)"],["nota","Nombre de la nota"],["no","Sin rótulo"]]} onChange={setLinRot}/>
          </div>
          <p style={{...uiLabel,marginBottom:6}}>Línea</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
            <button style={uiPill(linSel<0,{padding:"5px 12px"})} onClick={()=>setLinSel(-1)}>Todas</button>
            {Array.from({length:maxL},(_,i)=>(<button key={i} style={uiPill(linSel===i,{padding:"5px 12px",minWidth:36})} onClick={()=>setLinSel(i)}>{i+1}</button>))}
          </div>
          {linSel>=0 && manos.map(([h,tit,ls,bt])=>{
            const l=ls[linSel];
            if(!l) return (<p key={h} style={{fontSize:12,color:"#8a8a8a",margin:"0 0 8px"}}>{tit}: no tiene una línea {linSel+1} en este patrón.</p>);
            const by=Object.fromEntries(bt.map(b=>[b.id,b])), its=l.ids.map(id=>itemsMano([by[id]],bellows)[0]);
            return (
              <div key={h} style={{borderTop:"1px solid #232326",paddingTop:10,marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:8}}>
                  <p style={{margin:0,fontSize:13,color:"#ececec"}}><b>{tit}</b> · {l.nombre} · {its.length} {its.length===1?"botón":"botones"}</p>
                  <button style={uiPlay(false,{padding:"6px 14px"})} onClick={()=>linEscuchar(h)}>▶ Escuchar en orden</button>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}>
                  {its.map((it,i)=>{ const col=nc(CHROMATIC[it.pc]); return (
                    <span key={it.b.id} style={{display:"contents"}}>
                      {i>0 && <span style={{fontSize:10.5,fontFamily:"monospace",color:"#8a8a8a"}}>{(it.midi-its[i-1].midi>0?"+":"")+(it.midi-its[i-1].midi)}</span>}
                      <button onClick={()=>tocarItem(it)} title={"Tecla "+it.b.id} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 9px 3px 4px",borderRadius:999,cursor:"pointer",background:"#0e0e10",border:"1px solid #2c2c30",color:"#ececec"}}>
                        <span style={{width:22,height:22,borderRadius:"50%",background:col,color:txtSobre(col),display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,fontFamily:"monospace"}}>{i+1}</span>
                        <span style={{fontFamily:"'Libre Baskerville',serif",fontWeight:700,fontSize:13}}>{CROM_SIMPLE[CHROMATIC[it.pc]]}{it.oct}</span>
                      </button>
                    </span>); })}
                </div>
                <p style={{fontSize:10.5,color:"#6a6a70",margin:"6px 0 0"}}>Los números entre las notas son los saltos en semitonos de un botón al siguiente ({bellows==="abre"?"abriendo":"cerrando"}).</p>
              </div>);
          })}
        </div>);
      })()
  );
}
