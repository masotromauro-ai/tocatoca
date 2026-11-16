// Las piezas de pantalla que el Entrenador comparte entre modos (cabeceras, controles del camino, el panel Armonizar y «mis acordes»), sacadas tal cual en la fase 6.

import { CHROMATIC, nombreLat } from "../../shared/teoria/notas.js";
import { nc } from "../../shared/teoria/color.js";
import { UI_FONT, uiGhost, uiLabel, uiPill, uiPlay, uiTool, uiVista } from "../../shared/ui/tema.js";
import { FORMULAS } from "../../shared/teoria/acordes.js";
import { SUF_ES } from "../../shared/teoria/progresiones.js";
import { PATRONES_VOZ } from "../../shared/bandoneon/voicings.js";
import { RAIZ_NOM } from "../../shared/teoria/cifrado.js";
import { ESC_ENT, FIGURAS } from "../../shared/bandoneon/camino.js";
import { Desplegable, GrupoMini, SelectoresAcorde } from "../../shared/ui/ayudas.jsx";
import { ACORDE_RAICES } from "../../shared/bandoneon/acordes-base.js";
import { txtSobre } from "../../shared/teoria/etiquetas.js";
import { ESCALAS_HERO } from "../../shared/ui/codigo/paleta.jsx";

export function usePiezasEntrenador({ cam, camBpm, camEscuchar, camNotaTxt, camParar, camSuena, escRoot, escTipo, modo, setCamBpm, setEscRoot, setEscStart, setEscTipo, setModo, tocarItem }) {
  const escPills = (
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        <button style={uiPill(modo==="camino",{padding:"5px 12px"})} onClick={()=>setModo("camino")}>🧭 Ver y escuchar</button>
        <button style={uiPill(modo==="escalas",{padding:"5px 12px"})} onClick={()=>setModo("escalas")}>✋ Practicar</button>
      </div>
  );
  const escSelects = (
      <GrupoMini t="Escala">
        <Desplegable ancho={80} etiqueta="Tónica" valor={escRoot} opciones={ACORDE_RAICES.map(x=>[x,nombreLat(x)])} onChange={v=>{setEscRoot(v);setEscStart(-1);}}/>
        <Desplegable ancho={150} etiqueta="Escala" valor={escTipo} opciones={modo==="camino"?ESCALAS_HERO.map(e=>[e.id,e.corto]):ESC_ENT.map(e=>[e.id,e.nombre])} onChange={setEscTipo}/>
      </GrupoMini>
  );
  const escCab = (<>{escPills}<div style={{marginTop:8,marginBottom:8}}>{escSelects}</div></>);
  // Parte común de las vistas "Ver y escuchar": velocidad, escuchar, tira de notas por mano y avisos
  const camControles = (
    <GrupoMini t="Escuchar">
      <input type="range" min="30" max="220" step="1" value={camBpm} onChange={e=>setCamBpm(Number(e.target.value))} style={{width:104,alignSelf:"center"}}/>
      <span style={{fontSize:11.5,color:"#ececec",fontFamily:"monospace",minWidth:58,alignSelf:"center"}}>♩ = {camBpm}</span>
      <button style={uiPlay(!!camSuena,{padding:"5px 14px"})} onClick={camSuena?camParar:camEscuchar}>{camSuena?"■ Detener":"▶ Escuchar"}</button>
    </GrupoMini>
  );
  const camTiras = (
    <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:5}}>
          {cam && [["L","IZQ"],["R","DER"]].map(([h,nombre])=>{
            const m=cam.manos[h], nada=m.nodos.every(n=>n.falta);
            return (
              <div key={h} style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
                <span style={{...uiLabel,fontSize:8.5,minWidth:24,color:"#6a6a72"}}>{nombre}</span>
                {m.nodos.map(nd=> nd.falta
                  ? <span key={nd.k} style={{fontSize:10,color:"#6a6a6e",textDecoration:"line-through",border:"1px dashed #444",borderRadius:6,padding:"1px 6px"}}>✕ {camNotaTxt(nd)}</span>
                  : <button key={nd.k} onClick={()=>tocarItem(nd.item)}
                      style={{border:"1px solid rgba(255,255,255,.35)",background:nc(CHROMATIC[nd.item.pc]),color:"#fff",textShadow:"0 1px 3px #000",borderRadius:6,padding:"1px 6px",cursor:"pointer",fontSize:10,fontWeight:800,fontFamily:"monospace",lineHeight:1.35}}>
                      {nd.lab!==undefined?nd.lab:nd.k} {camNotaTxt(nd)}</button>)}
                <span style={{fontSize:10,color:m.faltan.length||nada?"#c9a25a":"#6f8f7f"}} title={nada?"No hay botones para este tramo":m.faltan.length?"No tiene "+m.faltan.map(camNotaTxt).join(", "):"Completa"}>
                  {nada?"sin botones":m.faltan.length?"faltan "+m.faltan.map(camNotaTxt).join(", "):"✓ completa"}</span>
              </div>
            );
          })}
    </div>
  );
  const camAbajo = (<>{camControles}{camTiras}</>);
  // Cabecera de la vista de acordes: Ver y escuchar / Armar
  const acoVistas = (
    <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
      <button style={uiPill(modo==="arpegio",{padding:"7px 16px"})} onClick={()=>setModo("arpegio")}>🧭 Ver y escuchar</button>
      <button style={uiPill(modo==="armonizar",{padding:"7px 16px"})} onClick={()=>setModo("armonizar")}>🎹 Armonizar</button>
      <button style={uiPill(modo==="construir"||modo==="acordes",{padding:"7px 16px"})} onClick={()=>setModo(modo==="acordes"?"acordes":"construir")}>🎼 Armar acordes</button>
    </div>
  );
  // Dentro de «Armar acordes»: dos maneras de trabajar con el mismo teclado
  const armarToggle = (
    <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
      <span style={{...uiLabel,fontSize:9}}>Cómo querés armar</span>
      <div style={{display:"flex",background:"#0e0e10",border:"1px solid #2f2f35",borderRadius:8,padding:2,gap:2,flexWrap:"wrap"}}>
        {[["construir","Libre · toco y la app lo nombra"],["acordes","Ejercicio · me dan el acorde y lo marco"]].map(([m,l])=>(<button key={m} style={uiVista(modo===m,{padding:"4px 12px"})} onClick={()=>setModo(m)}>{l}</button>))}
      </div>
    </div>
  );
  return { acoVistas, armarToggle, camAbajo, camControles, camTiras, escCab, escPills, escSelects };
}

export function usePanelesAcordes({ acoInvOk, acoVistas, acorde, armAcordes, armCuat, armPatron, armRecorrer, armSel, armTocar, armTonica, armVoicings, armVoz, bellows, camControles, camFig, camLong, camMetro, camOctL, camOctR, camSent, camTiras, cardAbrir, cardGuardar, cardItems, cardTocar, escRoot, escSelects, escTipo7, formasUI, guardarVoicing, matrizFilas, misAcordes, modo, nTonosArp, rg, setAcoInv, setArmCuat, setArmGrado, setArmMatriz, setArmPatron, setCamFig, setCamLong, setCamMetro, setCamOctL, setCamOctR, setCamSent, setConRaiz, setConSel, setEscRoot, setEscTipo, setMisAcordes, setModo, setVozSel, tocarVoicing, tonicasArm, verVoicing, vozSel }) {
  const camRecorrido = (<GrupoMini t="Recorrido">
            <Desplegable ancho={84} etiqueta="Izq. desde" valor={camOctL} opciones={rg.L.map(o=>[o,nombreLat(escRoot)+o])} onChange={v=>setCamOctL(Number(v))}/>
            <Desplegable ancho={84} etiqueta="Der. desde" valor={camOctR} opciones={rg.R.map(o=>[o,nombreLat(escRoot)+o])} onChange={v=>setCamOctR(Number(v))}/>
            <Desplegable ancho={98} etiqueta="Largo" valor={camLong} opciones={[[1,"1 octava"],[2,"2 octavas"]]} onChange={v=>setCamLong(Number(v))}/>
          </GrupoMini>);
  const camSonido = (<GrupoMini t="Sonido">
            <Desplegable ancho={116} etiqueta="Sentido" valor={camSent} opciones={[["sube","↑ Sube"],["baja","↓ Baja"],["ida","↕ Sube y baja"]]} onChange={setCamSent}/>
            <Desplegable ancho={100} etiqueta="Figura" valor={camFig} opciones={FIGURAS.map(f=>[f.id,f.nombre])} onChange={setCamFig}/>
            <Desplegable ancho={104} etiqueta="Metrónomo" valor={camMetro} opciones={[["no","Apagado"],["negra","Negra"],["blanca","Blanca"],["redonda","Redonda"]]} onChange={setCamMetro}/>
          </GrupoMini>);
  const arpAcorde = (<GrupoMini t="Acorde">
          <div>
            <SelectoresAcorde a={acorde}/>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{fontSize:13,fontFamily:"'Libre Baskerville',serif",fontWeight:700,color:"#e6e6e6"}}>{acorde.name}</span>
              {acorde.tones.map(t=>(
                <span key={t.pc} style={{display:"inline-flex",flexDirection:"column",alignItems:"center",lineHeight:1.05}}>
                  <span style={{minWidth:28,padding:"2px 5px",borderRadius:6,background:nc(t.pc),color:txtSobre(nc(t.pc)),fontFamily:"serif",fontWeight:900,fontSize:11,textAlign:"center",border:"1px solid rgba(255,255,255,.25)"}}>{t.nombre}</span>
                  <span style={{fontSize:8.5,fontFamily:"monospace",color:"#8a8a8a"}}>{t.lab}</span>
                </span>
              ))}
            </div>
            {acorde.ac.und==="11" && (acorde.ac.base==="M"||acorde.ac.base==="aug") && <p style={{fontSize:10.5,color:"#c9a25a",margin:"6px 0 0",lineHeight:1.4}}>La oncena natural choca con la tercera mayor: suele usarse como suspendido (sus4) o como oncena aumentada (#11).</p>}
          </div>
          </GrupoMini>);
  const arpRecorrido = (<GrupoMini t="Recorrido">
            <Desplegable ancho={112} etiqueta="Inversión" valor={acoInvOk} opciones={[[0,"Fundamental"],[1,"1ª inversión"],[2,"2ª inversión"],[3,"3ª inversión"]].filter(([v])=>v<=Math.max(0,nTonosArp-1))} onChange={v=>setAcoInv(Number(v))}/>
            <Desplegable ancho={84} etiqueta="Raíz izq." valor={camOctL} opciones={rg.L.map(o=>[o,nombreLat(acorde.ac.root)+o])} onChange={v=>setCamOctL(Number(v))}/>
            <Desplegable ancho={84} etiqueta="Raíz der." valor={camOctR} opciones={rg.R.map(o=>[o,nombreLat(acorde.ac.root)+o])} onChange={v=>setCamOctR(Number(v))}/>
            <Desplegable ancho={98} etiqueta="Largo" valor={camLong} opciones={[[1,"1 octava"],[2,"2 octavas"]]} onChange={v=>setCamLong(Number(v))}/>
          </GrupoMini>);
  const arpSonido = camSonido;
  const asideS={flex:"1 1 0",minWidth:0,background:"#121212",border:"1px solid #2a2a2a",borderRadius:12,padding:"12px 14px"};
  const lateralIzq = <div style={{display:"flex",flexDirection:"column",gap:10}}>{modo==="camino"?camRecorrido:arpRecorrido}{camTiras}</div>;
  const lateralDer = modo==="camino"
    ? <div style={{display:"flex",flexDirection:"column",gap:10}}>{escSelects}{camSonido}{camControles}</div>
    : <div style={{display:"flex",flexDirection:"column",gap:10}}>{arpAcorde}{arpSonido}{camControles}</div>;

  const misAcordesPanel = (
    <details open={misAcordes.length>0} style={{background:"#121212",border:"1px solid #2a2a2a",borderRadius:12,padding:"8px 12px",marginBottom:12}}>
      <summary style={{cursor:"pointer",fontFamily:UI_FONT,fontSize:12,fontWeight:700,color:"#e6e6e6"}}>★ Mis acordes ({misAcordes.length})</summary>
      <div style={{marginTop:8}}>
        {misAcordes.length===0
          ? <p style={{fontSize:11.5,color:"#7c7c82",margin:0,lineHeight:1.5}}>Todavía no guardaste ninguno. Armá un acorde y tocá "★ Guardar en mis acordes": queda anotado en este dispositivo y lo abrís cuando quieras.</p>
          : misAcordes.map(c=>(
              <div key={c.id} style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",padding:"6px 0",borderTop:"1px solid #1c1c1f"}}>
                <div style={{flex:"1 1 220px",minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#ececec",fontFamily:"'Libre Baskerville',serif"}}>{c.nombre} <span style={{fontFamily:UI_FONT,fontSize:10,fontWeight:600,color:"#7c7c82"}}>· {c.bellows==="abre"?"abre":"cierra"}</span></div>
                  <div style={{fontSize:11,color:"#9a9aa2"}}>{cardItems(c).sort((a,b)=>a.midi-b.midi).map(it=>((c.nm&&c.nm[it.pc])||nombreLat(RAIZ_NOM[it.pc]))+it.oct).join(" · ")}</div>
                  {c.nota ? <div style={{fontSize:11,color:"#c9a25a",fontStyle:"italic"}}>{c.nota}</div> : null}
                </div>
                <button style={uiPlay(false,{padding:"4px 12px",fontSize:11.5})} onClick={()=>cardTocar(c)}>▶</button>
                <button style={uiTool(false)} onClick={()=>cardAbrir(c)}>Abrir en Construir</button>
                <button style={uiGhost} onClick={()=>setMisAcordes(l=>l.filter(x=>x.id!==c.id))} title="Borrar">✕</button>
              </div>))}
      </div>
    </details>
  );
  const panelArmonizar = (
    <div className="rounded-xl mb-3" style={{background:"#121212",border:"1px solid #2a2a2a",padding:"8px 12px"}}>
      {acoVistas}
      <div style={{display:"flex",flexWrap:"wrap",gap:"8px 20px",alignItems:"flex-end",marginBottom:10}}>
        <GrupoMini t="Escala">
          <Desplegable ancho={80} etiqueta="Tónica" valor={armTonica} opciones={tonicasArm.map(x=>[x,nombreLat(x)])} onChange={v=>{setEscRoot(v);}}/>
          <Desplegable ancho={140} etiqueta="Escala" valor={escTipo7} opciones={ESC_ENT.slice(0,4).map(e=>[e.id,e.nombre])} onChange={v=>{setEscTipo(v);}}/>
        </GrupoMini>
        <GrupoMini t="Acordes de">
          <div style={{display:"flex",background:"#0e0e10",border:"1px solid #2f2f35",borderRadius:8,padding:2,gap:2}}>
            {[[false,"3 sonidos"],[true,"4 sonidos (7ª)"]].map(([v,l])=>(<button key={String(v)} style={uiVista(armCuat===v,{padding:"4px 10px"})} onClick={()=>setArmCuat(v)}>{l}</button>))}
          </div>
        </GrupoMini>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
        {armAcordes.map(a=>{ const col=nc(CHROMATIC[a.pc]), on=a.i===armSel.i; return (
          <button key={a.i} onClick={()=>{setArmGrado(a.i);setVozSel(null);}} style={{minWidth:86,padding:"5px 10px 6px",borderRadius:10,cursor:"pointer",textAlign:"center",
            background:on?"#26262b":"#0e0e10",border:`1px solid ${on?"#cfcfd4":"#2c2c30"}`,borderTop:`4px solid ${col}`,color:"#ececec"}}>
            <div style={{fontSize:10,fontFamily:"monospace",color:"#9a9aa2",fontWeight:700}}>{a.num}</div>
            <div style={{fontSize:12.5,fontWeight:700,fontFamily:"'Libre Baskerville',serif"}}>{a.nombre}</div>
          </button>); })}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}>
        <span style={{fontSize:12,color:"#cfcfd4",marginRight:4}}><b style={{fontFamily:"'Libre Baskerville',serif"}}>{armSel.nombre}</b> · {armSel.notas.map(nombreLat).join(" · ")}</span>
        <button style={uiPlay(false,{padding:"5px 14px"})} onClick={()=>armTocar(false)}>▶ Escuchar acorde</button>
        <button style={uiPlay(false,{padding:"5px 14px"})} onClick={()=>armTocar(true)}>▶ Arpegio</button>
        <button style={uiPlay(false,{padding:"5px 14px"})} onClick={armRecorrer}>▶ Recorrer los siete</button>
        <button style={uiTool(false,{marginLeft:"auto"})} onClick={()=>{ const ids=vozSel?vozSel.ids:armVoz(armSel.pcs); setConSel(m=>({...m,[bellows]:ids})); setConRaiz(null); setModo("construir"); }}>→ Llevar a Construir</button>
        <button style={uiTool(false)} onClick={()=>cardGuardar(armSel.nombre+(vozSel?" · "+vozSel.titulo:""),"",vozSel?vozSel.ids:armVoz(armSel.pcs),bellows,Object.fromEntries(armSel.pcs.map((pc,k)=>[pc,nombreLat(armSel.notas[k])])))}>★ Guardar en mis acordes</button>
      </div>
      <div style={{marginTop:12,paddingTop:10,borderTop:"1px solid #232326"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",flexWrap:"wrap",gap:6,marginBottom:6}}>
          <p style={{...uiLabel,margin:0}}>Formas sugeridas · {armSel.nombre}</p>
          {vozSel && <button style={uiGhost} onClick={()=>setVozSel(null)}>↺ Ver todas las notas</button>}
        </div>
        {formasUI(armVoicings,{onVer:(v)=>{ setArmPatron(v.id); verVoicing(v,v.nombre); },activoIds:vozSel&&vozSel.ids,btnVer:"Ver en el teclado",guardar:(v)=>guardarVoicing(v,armSel.nombre+" · "+v.nombre)})}
        <details style={{marginTop:10}} onToggle={e=>setArmMatriz(e.currentTarget.open)}>
          <summary style={{cursor:"pointer",fontFamily:UI_FONT,fontSize:12,fontWeight:600,color:"#cfcfd4"}}>Esta misma forma en las doce tonalidades ({PATRONES_VOZ.find(p=>p.id===armPatron).nombre}, {SUF_ES[armSel.q]||armSel.q})</summary>
          <div style={{display:"flex",gap:6,margin:"8px 0"}}>
            {PATRONES_VOZ.map(p=>(<button key={p.id} style={uiVista(armPatron===p.id)} onClick={()=>setArmPatron(p.id)}>{p.nombre}</button>))}
          </div>
          {!FORMULAS[armSel.q] ? <div style={{fontSize:11.5,color:"#8a8a90"}}>Este tipo de acorde todavía no tiene tabla por tonalidades.</div> :
            matrizFilas.map(r=>(
              <div key={r.pc} style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",padding:"5px 0",borderTop:"1px solid #1c1c1f"}}>
                <b style={{minWidth:92,fontSize:12.5,fontFamily:"'Libre Baskerville',serif",color:"#ececec"}}>{r.nombre}</b>
                <span style={{flex:"1 1 200px",fontSize:11,color:"#9a9aa2"}}>{r.v.vacio?"sin forma posible en este teclado":r.v.notas.map(n=>n.nombre+n.oct+(n.hand==="L"?"":"ᴰ")).join(" · ")+(r.v.fuelle!==bellows?"  ("+(r.v.fuelle==="abre"?"abriendo":"cerrando")+")":"")}</span>
                {!r.v.vacio&&<>
                  <button style={uiPlay(false,{padding:"2px 10px",fontSize:11})} onClick={()=>tocarVoicing(r.v,false)}>▶</button>
                  <button style={uiTool(false)} onClick={()=>verVoicing(r.v,r.nombre)}>Ver</button></>}
              </div>))}
          <div style={{fontSize:10,color:"#6a6a70",marginTop:6}}>ᴰ = nota de la mano derecha. El resto, de la izquierda.</div>
        </details>
      </div>
      <p style={{fontSize:10.5,color:"#6a6a70",margin:"8px 0 0"}}>Tocá una nota resaltada del teclado para ver el acorde de ese grado. El acorde se arma en posición cerrada desde la raíz grave; en Construir lo podés modificar.</p>
    </div>
  );
  return { arpAcorde, arpRecorrido, arpSonido, asideS, camRecorrido, camSonido, lateralDer, lateralIzq, misAcordesPanel, panelArmonizar };
}
