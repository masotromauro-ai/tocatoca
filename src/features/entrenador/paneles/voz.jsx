// El panel de la distribución de voces: repartir el acorde entre las manos, el cifrado y las doce tonalidades (fase 6, movido tal cual).

import { CHROMATIC, nombreLat, noteIdx } from "../../../shared/teoria/notas.js";
import { nc } from "../../../shared/teoria/color.js";
import { inpS, uiLabel, uiPill, uiPlay } from "../../../shared/ui/tema.js";
import { Nota } from "../../../shared/ui/teoria/notas.jsx";
import { FIGURAS, VOZ_RAICES } from "../../../shared/bandoneon/camino.js";
import { Desplegable, Seccion, SelectoresAcorde } from "../../../shared/ui/ayudas.jsx";
import { CROM_SIMPLE } from "../../../shared/teoria/etiquetas.js";

export function PanelVoz({ acoVistas, acorde, camAbajo, camFig, camMetro, camSent, dispo, rg, setCamFig, setCamMetro, setCamSent, setVozTxt, voz, vozAcorde, vozCargar, vozCfg, vozCif, vozCopiar, vozMsg, vozNotas, vozSet, vozTxt }) {
  return (
    (()=>{
        const bass=12*(voz.bajoOct+1)+acorde.rootIdx, nOtros=Math.max(0,acorde.tones.length-1), nom=m=>CROM_SIMPLE[CHROMATIC[m%12]]+(Math.floor(m/12)-1);
        const th={textAlign:"left",fontSize:10,letterSpacing:"0.1em",color:"#7c7c82",fontWeight:600,padding:"6px 8px",textTransform:"uppercase"}, td={padding:"6px 8px",fontSize:12,borderTop:"1px solid #1c1c1f"};
        return (
        <div className="rounded-xl mb-3" style={{background:"#121212",border:"1px solid #2a2a2a",padding:"12px 14px"}}>
          <p className="text-xs text-gray-500" style={{margin:"0 0 10px"}}>Armá el acorde y repartilo entre las dos manos: la raíz en la izquierda como bajo y el resto arriba, o como prefieras, nota por nota. Cada nota queda guardada como una forma que se puede mover a las doce tonalidades.</p>
          {acoVistas}
          <Seccion t="Acorde"/>
          <SelectoresAcorde a={acorde}/>
          <Seccion t="Distribución"/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:12}}>
            <Desplegable etiqueta="Modelo" valor={voz.preset} opciones={[["bajo","Bajo izq. + acorde der."],["izq","Todo en la izquierda"]]} onChange={v=>vozCfg({preset:v})}/>
            <Desplegable etiqueta="Bajo (raíz)" valor={voz.bajoOct} opciones={rg.L.map(o=>[o,nombreLat(acorde.ac.root)+o])} onChange={v=>vozCfg({bajoOct:Number(v)})}/>
            <Desplegable etiqueta="Relleno desde" valor={voz.relOct} opciones={[2,3,4,5,6].map(o=>[o,"Octava "+o])} onChange={v=>vozCfg({relOct:Number(v)})}/>
            <Desplegable etiqueta="Inversión del relleno" valor={Math.min(voz.inv,Math.min(3,Math.max(0,nOtros-1)))} opciones={[[0,"Fundamental"],[1,"1ª inversión"],[2,"2ª inversión"],[3,"3ª inversión"]].filter(([v])=>v<=Math.max(0,nOtros-1))} onChange={v=>vozCfg({inv:Number(v)})}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"minmax(84px,1fr) 1fr 1fr",gap:"8px 10px",alignItems:"center",marginBottom:10}}>
            <span style={uiLabel}>Nota</span><span style={uiLabel}>Mano</span><span style={uiLabel}>Octava</span>
            {vozNotas.map(n=>(
              <div key={n.key} style={{display:"contents"}}>
                <span style={{display:"inline-flex",gap:6,alignItems:"center",width:"fit-content",padding:"5px 10px",borderRadius:9,background:nc(CHROMATIC[(acorde.rootIdx+n.key)%12]),color:"#fff",fontWeight:800,fontSize:12,textShadow:"0 1px 3px #000",border:"2px solid rgba(255,255,255,.25)",opacity:n.mano==="-"?.45:1}}>{nombreLat(n.name)}<small style={{opacity:.85,fontFamily:"monospace",fontSize:10}}>{n.lab}</small></span>
                <Desplegable etiqueta="" valor={n.mano} opciones={[["L","Izquierda"],["R","Derecha"],["-","No se toca"]]} onChange={v=>vozSet(n,{mano:v})}/>
                <Desplegable etiqueta="" valor={Math.round((n.midi-bass-n.key)/12)} opciones={[0,1,2,3,4,5,6].map(e=>[e,nombreLat(n.name)+(Math.floor((bass+n.key+12*e)/12)-1)]).filter(([e,l])=>{const o=Math.floor((bass+n.key+12*e)/12)-1;return o>=1&&o<=6;})} onChange={v=>vozSet(n,{ex:Number(v)})}/>
              </div>))}
          </div>
          <Seccion t="Sonido"/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:12}}>
            <Desplegable etiqueta="Sentido al escuchar" valor={camSent} opciones={[["sube","↑ Sube"],["baja","↓ Baja"],["ida","↕ Sube y baja"]]} onChange={setCamSent}/>
            <Desplegable etiqueta="Figura" valor={camFig} opciones={FIGURAS.map(f=>[f.id,f.nombre])} onChange={setCamFig}/>
            <Desplegable etiqueta="Metrónomo" valor={camMetro} opciones={[["no","Apagado"],["negra","Negra"],["blanca","Blanca"],["redonda","Redonda"]]} onChange={setCamMetro}/>
          </div>
          <div style={{marginBottom:10}}><button style={uiPlay(false,{padding:"7px 16px"})} onClick={vozAcorde}>▶ Acorde (notas juntas)</button> <span style={{fontSize:11,color:"#8a8a8a",marginLeft:6}}>El arpegio, abajo, sube nota por nota.</span></div>
          {camAbajo}
          <Seccion t="Cifrado"/>
          <p style={{fontSize:11.5,color:"#8a8a8a",margin:"0 0 8px",lineHeight:1.5}}>Copiá este texto para compartir la forma (por ejemplo, para pasármela). Pegando uno, se carga el acorde y su distribución.</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:8}}>
            <input readOnly value={vozCif} onFocus={e=>e.target.select()} style={{...inpS,flex:1,minWidth:210,fontFamily:"monospace",fontSize:11}}/>
            <button style={uiPill(false,{padding:"7px 14px"})} onClick={vozCopiar}>⧉ Copiar</button>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:6}}>
            <input value={vozTxt} onChange={e=>setVozTxt(e.target.value)} placeholder="Pegá acá un cifrado (HM1|…)" style={{...inpS,flex:1,minWidth:210,fontFamily:"monospace",fontSize:11}}/>
            <button style={uiPill(false,{padding:"7px 14px"})} onClick={vozCargar}>Cargar</button>
          </div>
          {vozMsg && <p style={{fontSize:11.5,color:"#8a8a8a",margin:"2px 0 0"}}>{vozMsg}</p>}
          <Seccion t="Todas las tonalidades"/>
          <p style={{fontSize:11.5,color:"#8a8a8a",margin:"0 0 8px",lineHeight:1.5}}>La misma forma en cada tonalidad. Tocá una fila para verla en los teclados. ✓ = se puede tocar en ese sentido del fuelle.</p>
          <div style={{overflowX:"auto"}}><table style={{borderCollapse:"collapse",width:"100%"}}>
            <thead><tr><th style={th}>Tonalidad</th><th style={th}>Bajo</th><th style={th}>Abriendo</th><th style={th}>Cerrando</th></tr></thead>
            <tbody>{VOZ_RAICES.map(r=>{
              const pc=noteIdx(r), bs=12*(voz.bajoOct+1)+pc, act=noteIdx(acorde.ac.root)===pc, tocables=vozNotas.filter(n=>n.mano!=="-");
              const est=bel=>{ const f=tocables.filter(n=>!dispo[bel][n.mano].has(bs+n.d)); return f.length?<span style={{color:"#c9a25a"}}>falta {f.map(n=>nom(bs+n.d)).join(", ")}</span>:<span style={{color:"#6b9c7c",fontWeight:700}}>✓</span>; };
              return (<tr key={r} onClick={()=>acorde.set("root",r)} style={{cursor:"pointer",background:act?"#ffffff12":"transparent"}}>
                <td style={{...td,fontWeight:700}}>{nombreLat(r)}</td><td style={td}>{nombreLat(r)}{voz.bajoOct}</td><td style={td}>{est("abre")}</td><td style={td}>{est("cierra")}</td></tr>); })}</tbody>
          </table></div>
        </div>); })()
  );
}
