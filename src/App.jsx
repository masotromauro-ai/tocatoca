import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { CHROMATIC, nombreLat, noteIdx } from "./shared/teoria/notas.js";
import { nc } from "./shared/teoria/color.js";
import { UI_FONT, inpS, uiGhost, uiLabel, uiPill, uiPlay, uiTool, uiVista } from "./shared/ui/tema.js";
import { playChord } from "./shared/audio/audio.js";
import { FORMULAS, QUAL_TXT, getFns, parseChord } from "./shared/teoria/acordes.js";
import { SUF_ES, computeProg } from "./shared/teoria/progresiones.js";
import { BIBLIOTECA } from "./features/herramientas/biblioteca/datos.js";
import { itemsMano } from "./shared/bandoneon/tablas.js";
import { PATRONES_VOZ } from "./shared/bandoneon/voicings.js";
import { Nota } from "./shared/ui/teoria/notas.jsx";
import { cifEstilo, cifGuardarPropios, cifPropios } from "./shared/almacen/preferencias.js";
import { RAIZ_NOM } from "./shared/teoria/cifrado.js";
import { ESC_ENT, FIGURAS, VOZ_RAICES } from "./shared/bandoneon/camino.js";
import { PaintCanvas } from "./features/entrenador/ayudas/lienzo.jsx";
import { Desplegable, GrupoMini, LeyendaCamino, NotaPicker, Seccion, SelectoresAcorde } from "./shared/ui/ayudas.jsx";
import { FORMA_NIVELES, FormaCanvas, LIN_TEXTO, LIN_TIPOS } from "./features/entrenador/ayudas/formas.jsx";
import { ACORDE_RAICES } from "./shared/bandoneon/acordes-base.js";
import { CROM_SIMPLE, txtSobre } from "./shared/teoria/etiquetas.js";
import { PopoverAnclado } from "./shared/ui/Popover.jsx";
import { ElCodigoTab } from "./features/codigo/ElCodigoTab.jsx";
import { HojaDeColor } from "./shared/ui/hoja-de-color.jsx";
import { CirculoQuintas } from "./features/herramientas/quintas/CirculoQuintas.jsx";
import { medirLote } from "./shared/medicion.js";
import { registrar } from "./features/clases/org.jsx";
import { nomDedo } from "./shared/ui/dedos.js";
import { OrganizadorTab } from "./features/clases/OrganizadorTab.jsx";
import { MisTareasTab } from "./features/clases/MisTareasTab.jsx";
import { ModosTab } from "./features/herramientas/modos/ModosTab.jsx";
import { ColoresTab } from "./features/herramientas/colores/ColoresTab.jsx";
import { TeoriaTab } from "./features/teoria/TeoriaTab.jsx";
import { ESCALAS_HERO } from "./shared/ui/codigo/paleta.jsx";
import { ArmadorAcordes } from "./shared/bandoneon/armador.jsx";
import { ControlesDisposicion } from "./shared/bandoneon/disposicion.jsx";
import { AvisoInicial } from "./features/aviso/AvisoInicial.jsx";
import { BandoneonTab } from "./features/bandoneon/BandoneonTab.jsx";
import { AcordeTab } from "./features/herramientas/acorde/AcordeTab.jsx";
import { ProgresionTab } from "./features/herramientas/progresion/ProgresionTab.jsx";
import { BibliotecaTab } from "./features/herramientas/biblioteca/BibliotecaTab.jsx";
import { useEntrenador, useEscalasEntrenador, useLineasEntrenador, usePracticaEscalas, useNotasYForma } from "./features/entrenador/hooks.jsx";
import { useAcordesEntrenador } from "./features/entrenador/acordes.jsx";
import { useCaminoEntrenador } from "./features/entrenador/camino.jsx";

function EntrenadorTab({preset}={}){
  const { acoInvOk, acoUltimo, acorde, allButtons, an, bellows, cam, camBpm, camBus, camDef, camFig, camLey, camLong, camMapa, camMetro, camOctL, camOctR, camParar, camSent, camSuena, camTimers, checked, chordProps, closePicker, copied, correctOf, disp, dispo, erase, esCam, escDir, escMano, escModo, escRoot, escStart, escTimers, escTipo, escUltimo, faltanTones, formaGrid, formaPts, formaTol, guesses, info, isMobile, kbW, keyOf, lateral, leftBtns, modo, nTonosArp, notaGuess, notaPicker, openPicker, pedirOct, pickColor, picker, prog, reveal, rg, rightBtns, romano, selBad, selected, setAcoInv, setBellows, setCamBpm, setCamElige, setCamFig, setCamLey, setCamLong, setCamMetro, setCamOctL, setCamOctR, setCamSent, setCamSuena, setChecked, setChordSel, setCopied, setEscDir, setEscMano, setEscModo, setEscRoot, setEscStart, setEscTipo, setFormaGrid, setFormaPts, setFormaTol, setGuesses, setInfo, setModo, setNotaGuess, setNotaPicker, setPedirOct, setProg, setReveal, setRomano, setView, setVoz, setVozMsg, setVozTxt, toggleSel, view, vis, voz, vozMsg, vozNotas, vozTxt, wrapRef } = useEntrenador({ preset });
  const { escBtns, escDef, escDeletreo, escIdxById, escIvs, escNombres, escPcSet, escR, etiqueta, itemDe, tocarItem } = useEscalasEntrenador({ bellows, escDir, escMano, escRoot, escStart, escTipo, leftBtns, modo, rightBtns });
  // Construir un acorde directamente sobre el teclado
  const { armAcordes, armCuat, armPatron, armRecorrer, armSel, armStateOf, armTap, armTocar, armTonica, armVoicings, armVoz, cardAbrir, cardGuardar, cardItems, cardTocar, conAn, conCopiar, conGuardar, conIds, conItems, conMsg, conNota, conPrimera, conQuitar, conRaiz, conStateOf, conTap, conTocar, conTxt, conVoicings, escTipo7, flechasModo, formasUI, guardarVoicing, matrizFilas, misAcordes, setArmCuat, setArmGrado, setArmMatriz, setArmPatron, setConNota, setConRaiz, setConSel, setConTxt, setConVer, setFlechasModo, setMisAcordes, setVozSel, tocarVoicing, tonicasArm, verVoicing, vozSel } = useAcordesEntrenador({ bellows, escRoot, escTipo, itemDe, leftBtns, rightBtns, setBellows, setModo, tocarItem });
  // Ubicar líneas
  const { linEscuchar, linFlechas, linL, linR, linRot, linSel, linStateOf, linTap, linTipo, setLinRot, setLinSel, setLinTipo } = useLineasEntrenador({ bellows, flechasModo, itemDe, leftBtns, rightBtns, tocarItem });
  // Digitación: viene dentro del ejercicio asignado (solo si la configuración sigue siendo la del ejercicio)
  const { dedos, escEscuchar, escStateOf, escTap, funcionDe, gradoTxt, notaOct, verDedo } = usePracticaEscalas({ bellows, escBtns, escDir, escIdxById, escIvs, escMano, escModo, escNombres, escPcSet, escR, escRoot, escStart, escTimers, escTipo, etiqueta, itemDe, preset, prog, romano, setInfo, setProg, tocarItem });
  // — Ejercicio "Poner las notas": círculos vacíos y se le dice a cada uno qué nota es —
  const { borrarNota, formaBien, formaExtra, formaFalta, formaPuestos, formaTot, notaBien, notaPuestas, notaStateOf, setFormaH, setNota } = useNotasYForma({ checked, formaPts, formaTol, itemDe, keyOf, leftBtns, modo, notaGuess, notaPicker, pedirOct, reveal, rightBtns, setChecked, setFormaPts, setNotaGuess, setNotaPicker, view, vis });

  // — Camino de las escalas: cada mano muestra su propio camino —
  const { camEscuchar, camFlechas, camNotaTxt, camStateOf, camTap, vozAcorde, vozCargar, vozCfg, vozCif, vozCopiar, vozSet } = useCaminoEntrenador({ acorde, bellows, cam, camBpm, camBus, camFig, camMapa, camMetro, camParar, camSent, camSuena, camTimers, flechasModo, itemDe, modo, setCamElige, setCamSuena, setVoz, setVozMsg, tocarItem, view, voz, vozNotas, vozTxt });

  // Cabecera compartida de la pestaña Escalas: vista (Ver y escuchar / Practicar), tónica y escala
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
  const scaleProps = modo==="armonizar" ? { stateOf:armStateOf } : modo==="construir" ? { stateOf:conStateOf } : modo==="lineas" ? { stateOf:linStateOf } : modo==="escalas" ? { stateOf:escStateOf } : modo==="notas" ? { stateOf:notaStateOf } : esCam ? { stateOf:camStateOf } : null;
  const tapBtn = (btn, rect)=> modo==="armonizar" ? armTap(btn) : modo==="construir" ? conTap(btn) : modo==="lineas" ? linTap(btn) : modo==="acordes" ? toggleSel(btn) : modo==="escalas" ? escTap(btn, rect) : modo==="notas" ? setNotaPicker({btn,rect}) : esCam ? camTap(btn) : openPicker(btn, rect);
  const painted = allButtons.filter(b=>guesses[keyOf(b.id)]);
  const correctos = painted.filter(b=>guesses[keyOf(b.id)]===correctOf(b));

  const reiniciarFuelle = ()=>{
    if(modo==="lineas"){ setLinSel(-1); return; }
    if(modo==="construir"){ setConSel(m=>({...m,[bellows]:[]})); setConRaiz(null); return; }
    if(modo==="armonizar"){ setArmGrado(0); return; }
    if(modo==="escalas"){ setProg({i:1,err:0,hint:false,wrong:null}); return; }
    if(esCam){ camParar(); setCamElige({}); if(modo==="voz") setVoz(v=>({...v,man:{},soloLista:false})); return; }
    if(modo==="forma"){ setFormaPts(f=>({L:view!=="derecha"?[]:f.L, R:view!=="izquierda"?[]:f.R})); setChecked(false); setReveal(false); return; }
    if(modo==="notas"){ setNotaGuess(g=>{ const n={...g}; vis.forEach(b=>delete n[keyOf(b.id)]); return n; }); setChecked(false); setReveal(false); setNotaPicker(null); return; }
    if(modo==="acordes"){
      setChordSel(s=>{ const n={...s}; allButtons.forEach(b=>delete n[keyOf(b.id)]); return n; });
      setChecked(false); setReveal(false);
      return;
    }
    setGuesses(g=>{
      const n={...g};
      allButtons.forEach(b=>delete n[keyOf(b.id)]);
      return n;
    });
    setChecked(false);
  };

  const buildCSV = ()=>{
    const rows=["boton,mano,fuelle,nota,color_correcto,color_elegido,resultado"];
    allButtons.forEach(b=>{
      const g = guesses[keyOf(b.id)];
      if(!g) return;
      const noteLat = bellows==="abre" ? b.abre : b.cierra;
      const correct = correctOf(b);
      rows.push(`${b.id},${b.id.startsWith("L")?"izquierda":"derecha"},${bellows},${noteLat},${correct},${g},${g===correct?"correcto":"incorrecto"}`);
    });
    return rows.join("\n");
  };

  const descargarCSV = ()=>{
    const blob = new Blob([buildCSV()], {type:"text/csv"});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `ejercicio_bandoneon_${bellows}_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const copiarResumen = ()=>{
    const texto = `🎵 Ejercicio bandoneón — fuelle ${bellows==="abre"?"ABRIENDO":"CERRANDO"}\n`+
      `Pintados: ${painted.length}/${allButtons.length} · Correctos: ${correctos.length}/${painted.length||0}\n\n`+
      painted.map(b=>{
        const g = guesses[keyOf(b.id)];
        const correct = correctOf(b);
        const noteLat = bellows==="abre" ? b.abre : b.cierra;
        return `${b.id} (${noteLat}): ${g===correct ? "✅" : "❌ correcto="+correct}`;
      }).join("\n");
    if(navigator.clipboard?.writeText){
      navigator.clipboard.writeText(texto).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); });
    }
  };

  const pill=(active,v="orange")=>uiPill(active);

  if(!leftBtns.length) return <div style={{color:"#555",padding:20,fontSize:13}}>Cargando...</div>;

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

  return (
    <div style={{fontFamily:UI_FONT}}>
      <div style={{display:"flex",flexWrap:"wrap",alignItems:"baseline",gap:"2px 14px",marginBottom:8}}>
        <h2 className="text-base font-bold" style={{fontFamily:"'Libre Baskerville',serif",margin:0}}>
          🎓 Entrenador — {modo==="lineas"?"Ubicar líneas":modo==="forma"?"Armá el teclado":modo==="notas"?"Poné las notas":(modo==="camino"||modo==="escalas")?"Escalas":(modo==="arpegio"||modo==="acordes"||modo==="voz"||modo==="construir"||modo==="armonizar")?"Acordes":"Pintá el teclado"}
        </h2>
        <p className="text-xs text-gray-500" style={{margin:0,flex:"1 1 320px",fontSize:11,lineHeight:1.4}}>
          {modo==="armonizar" ? "Elegí una escala y mirá el acorde que se forma sobre cada una de sus notas."
            : modo==="construir" ? "Armá un acorde tocando los botones, con las dos manos, y mirá cómo se llama."
            : modo==="lineas" ? "Mirá cómo se ordenan los botones en filas y diagonales, contalos y escuchá cada línea para encontrar la lógica del teclado."
            : modo==="camino" ? "Mirá y escuchá el camino de cada escala sobre los dos teclados, abriendo o cerrando."
            : modo==="escalas" ? "Practicá la escala sobre el teclado, con la guía o de memoria."
            : modo==="voz" ? "Repartí las notas del acorde entre las dos manos, elegí la octava de cada una y guardá la forma."
            : modo==="arpegio" ? "Mirá y escuchá el arpegio de un acorde sobre los dos teclados, desde la raíz y con inversiones."
            : modo==="acordes" ? "Armá el acorde marcando sus notas en el teclado y después tocá \"Corregir\"."
            : modo==="forma" ? "Reconstruí de memoria la forma de cada teclado, con círculos vacíos. Después tocá \"Corregir\"."
            : modo==="notas" ? "Sobre el teclado con los círculos vacíos, decí qué nota corresponde a cada botón, abriendo o cerrando. Después tocá \"Corregir\"."
            : "Tocá cada botón y elegí, de memoria, el color que le corresponde. Después tocá \"Corregir\" para ver qué acertaste."}
        </p>
      </div>

      {/* Modo del ejercicio */}
      <div style={{display:"flex",flexWrap:"wrap",background:"#121212",border:"1.5px solid #2a2a2a",borderRadius:10,padding:3,gap:2,marginBottom:10,width:"fit-content",maxWidth:"100%"}}>
        {[["forma","◯ Armar el teclado"],["lineas","📐 Ubicar líneas"],["notas","♪ Poner las notas"],["colores","🎨 Pintar colores"],["escalas","🎶 Escalas"],["acordes","🎼 Acordes"]].map(([m,l])=>{
          const act=modo===m||(m==="escalas"&&modo==="camino")||(m==="acordes"&&(modo==="arpegio"||modo==="voz"||modo==="construir"||modo==="armonizar"));
          const musical=m==="escalas"||m==="acordes";   // herramientas con finalidad musical: un tono distinto
          return (
            <span key={m} style={{display:"contents"}}>
              {m==="escalas" && <span style={{width:1,alignSelf:"stretch",background:"#34343a",margin:"4px 5px"}}/>}
              <button style={{...pill(act),padding:"6px 14px",fontSize:11,...(musical&&!act?{background:"#1f1f25",border:"1px solid #3a3a43",color:"#d6d6dc"}:{})}} onClick={()=>setModo(m==="escalas"?escUltimo:m==="acordes"?acoUltimo:m)}>{l}</button>
            </span>);
        })}
      </div>

      {modo==="escalas" && (
        <div className="rounded-xl mb-3" style={{background:"#121212",border:"1px solid #2a2a2a",padding:"12px 14px"}}>
          <p className="text-xs text-gray-500 mb-3">Con la guía, el teclado te muestra la escala nota por nota, con su octava real y su color. De memoria, la tocás vos y el color aparece cuando acertás. Usá el botón Abre / Cierra de arriba para cambiar el sentido del fuelle.</p>
          {escCab}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:12}}>
            <Desplegable etiqueta="Mano" valor={escMano} opciones={[["der","Derecha"],["izq","Izquierda"]]} onChange={v=>{setEscMano(v);setEscStart(-1);}}/>
            <Desplegable etiqueta="Sentido" valor={escDir} opciones={[["sube","↑ Sube"],["baja","↓ Baja"]]} onChange={v=>{setEscDir(v);setEscStart(-1);}}/>
            {escR.tonics.length>1 && <Desplegable etiqueta="Empezar en" valor={escR.startUsed} opciones={escR.tonics.map((t,i)=>[i,etiqueta(t)])} onChange={v=>setEscStart(Number(v))}/>}
            <Desplegable etiqueta="Cómo" valor={escModo} opciones={[["ver","👁 Con la guía"],["practica","✋ De memoria"]]} onChange={setEscModo}/>
            <Desplegable etiqueta="Función" valor={romano?"rom":"num"} opciones={[["rom","I · II · III"],["num","1 · 2 · 3"]]} onChange={v=>setRomano(v==="rom")}/>
          </div>
          <div className="flex flex-wrap gap-2 items-center mb-3">
            <button style={uiPlay(false,{padding:"7px 16px"})} onClick={escEscuchar}>▶ Escuchar</button>
            {escModo==="practica" && <button style={uiPill(prog.hint,{padding:"7px 16px"})} onClick={()=>setProg(p=>({...p,hint:!p.hint}))}>💡 Pista</button>}
          </div>
          {/* fila coloreada sugerida */}
          <div style={{display:"flex",gap:6}}>
            {escR.route.map((r,i)=>{ const col=nc(CHROMATIC[r.item.pc]); const hecho = escModo==="ver" || i<prog.i; return(
              <div key={i} style={{flex:"1 1 0",minWidth:0,borderRadius:10,padding:"7px 2px",textAlign:"center",cursor:"default",background:hecho?col:"#161616",border:`2px solid ${hecho?"rgba(255,255,255,.35)":"#2a2a2a"}`,color:hecho?txtSobre(col):"#555",transition:"background .2s"}}>
                <div style={{fontSize:10,fontWeight:800,fontFamily:"monospace",opacity:.85}}>{gradoTxt(r,i)}</div>
                <div style={{fontSize:13,fontWeight:900,fontFamily:"serif"}}>{hecho?etiqueta(r.item):"?"}</div>
                <div style={{marginTop:3,minHeight:16,fontSize:11,fontWeight:900,fontFamily:"monospace",opacity:.9}}>{verDedo(i)?(dedos[i]?("☝"+dedos[i]):"·"):""}</div>
              </div>);})}
          </div>
          <p style={{fontSize:11,color:"#8a8a8a",margin:"8px 0 0"}}>
            {dedos.some(x=>x) ? "Dedos sugeridos (☝): 1 índice · 2 medio · 3 anular · 4 meñique. Con \"1/2\" podés usar cualquiera de los dos. Tocá una tecla para ver su octava y su dedo."
              : "Tocá una tecla del camino para ver su octava y su función. Los dedos aparecen cuando el ejercicio viene de una tarea de tu profesor."}
          </p>
          {escR.missing.length>0 && <p style={{fontSize:11.5,color:"#c9a25a",margin:"10px 0 0"}}>⚠ Con este fuelle y esta mano no hay {escR.missing.length>1?"notas":"una nota"} más arriba/abajo ({escR.missing.map(pc=>escDeletreo[pc]||CROM_SIMPLE[CHROMATIC[pc]]).join(", ")}). Probá el otro sentido del fuelle, la otra mano u otra octava de inicio.</p>}
          {escModo==="practica" && (
            <p style={{fontSize:13,margin:"10px 0 0",color:prog.i>=escR.route.length&&escR.route.length?"#6b9c7c":"#cfcfcf"}}>
              {prog.i>=escR.route.length&&escR.route.length ? `¡Escala completa! Errores: ${prog.err}` : `Tocá la nota ${prog.i+1} de ${escR.route.length}${prog.err?` · errores: ${prog.err}`:""}`}
            </p>)}
        </div>
      )}

      {modo==="camino" && (
        <div className="rounded-xl mb-3" style={{background:"#121212",border:"1px solid #2a2a2a",padding:"8px 12px"}}>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            {escPills}
            <button style={uiTool(camLey,{marginLeft:"auto"})} onClick={()=>setCamLey(v=>!v)} title="Explicación y significado de cada señal">❓ Ayuda</button>
          </div>
          {camLey && (<div style={{marginTop:8}}>
            <p className="text-xs text-gray-500" style={{margin:"0 0 8px"}}>Elegí una escala y un tramo: se dibuja el camino nota por nota en los dos teclados. Con Abre / Cierra cambiás el sentido del fuelle. Cada mano tiene su propia octava de partida. Izquierda: {nombreLat(escRoot)}{camOctL} → {nombreLat(escRoot)}{camOctL+camLong} · Derecha: {nombreLat(escRoot)}{camOctR} → {nombreLat(escRoot)}{camOctR+camLong}.</p>
            <LeyendaCamino/></div>)}
          {lateral ? null : (<div style={{display:"flex",flexWrap:"wrap",gap:"8px 20px",alignItems:"flex-end",marginTop:8}}>{escSelects}{camRecorrido}{camSonido}{camControles}</div>)}
          {lateral ? null : camTiras}
        </div>
      )}

      {modo==="arpegio" && (
        <div className="rounded-xl mb-3" style={{background:"#121212",border:"1px solid #2a2a2a",padding:"8px 12px"}}>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            {acoVistas}
            <button style={uiTool(camLey,{marginLeft:"auto"})} onClick={()=>setCamLey(v=>!v)} title="Explicación y significado de cada señal">❓ Ayuda</button>
          </div>
          {camLey && (<div style={{marginTop:8}}>
            <p className="text-xs text-gray-500" style={{margin:"0 0 8px"}}>Armá el acorde y mirá su arpegio sobre los dos teclados: siempre arranca desde la raíz y lo podés invertir. Los suspendidos están en "Tipo" y las tensiones en Novena, Oncena y Trecena. La raíz parte en {nombreLat(acorde.ac.root)}{camOctL} (izquierda) y {nombreLat(acorde.ac.root)}{camOctR} (derecha); las inversiones usan las notas del acorde, no las tensiones.</p>
            <LeyendaCamino arpegio/></div>)}
          {lateral ? null : (<div style={{display:"flex",flexWrap:"wrap",gap:"8px 20px",alignItems:"flex-end",marginTop:8}}>{arpAcorde}{arpRecorrido}{arpSonido}{camControles}</div>)}
          {lateral ? null : camTiras}
        </div>
      )}

      {modo==="voz" && (()=>{
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
        </div>); })()}

      {modo==="armonizar" && panelArmonizar}
      {(modo==="construir"||modo==="armonizar") && misAcordesPanel}
      {modo==="construir" && (()=>{
        const orden=[...conItems].sort((a,b)=>a.midi-b.midi||a.orden-b.orden), propios=cifPropios(), claves=Object.keys(propios);
        const ejC=(k)=>k.split(",").map(n=>CROM_SIMPLE[CHROMATIC[Number(n)%12]]).join(" · ");
        return (
        <div className="rounded-xl mb-3" style={{background:"#121212",border:"1px solid #2a2a2a",padding:"12px 14px"}}>
          {acoVistas}
          {armarToggle}
          <p className="text-xs text-gray-500" style={{margin:"0 0 12px"}}>Tocá los botones de cualquier mano para armar el acorde. La primera nota que marcás es la raíz; después sumá las que quieras, en cualquier orden, repetidas en otras octavas o con tensiones. Tocá una nota marcada para sacarla.</p>
          <div style={{padding:"10px 12px",borderRadius:12,background:"#0e0e10",border:"1px solid #26262a",marginBottom:10}}>
            <p style={{...uiLabel,margin:"0 0 4px"}}>Acorde</p>
            <p style={{margin:0,fontFamily:"'Libre Baskerville',serif",fontWeight:700,fontSize:22,color:"#ececec"}}>
              {conAn?conAn.nombre:(conItems.length===0?"—":"Marcá otra nota")}
              {conAn&&conAn.custom&&<span style={{marginLeft:8,fontFamily:UI_FONT,fontSize:10,fontWeight:700,color:"#8a8a8a",border:"1px solid #3a3a3e",borderRadius:6,padding:"1px 6px",verticalAlign:"middle"}}>mi nombre</span>}
            </p>
            {conAn&&!conAn.intervalo&&conAn.alts.length>0 && (
              <div style={{display:"flex",flexWrap:"wrap",gap:6,alignItems:"center",marginTop:8}}>
                <span style={{fontSize:11,color:"#8a8a8a"}}>También se puede leer como:</span>
                {conAn.alts.map(x=>(<button key={x.nombre} style={uiPill(false,{padding:"3px 10px",fontSize:11})} onClick={()=>setConRaiz(x.rootPc)}>{x.nombre}</button>))}
                {conRaiz!=null&&conRaiz!==conPrimera&&<button style={uiPill(false,{padding:"3px 10px",fontSize:11})} onClick={()=>setConRaiz(null)}>↺ Raíz = primera nota</button>}
              </div>)}
          </div>
          {orden.length>0 && (
            <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:10}}>
              {orden.map(it=>{ const col=nc(CHROMATIC[it.pc]), gr=conAn&&conAn.grados[(it.pc-conAn.rootPc+12)%12]; return (
                <button key={it.b.id} onClick={()=>conQuitar(it.b.id)} title="Sacar esta nota" style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 8px 4px 5px",borderRadius:999,cursor:"pointer",background:"#0e0e10",border:"1px solid #2c2c30",color:"#ececec"}}>
                  <span style={{minWidth:24,height:24,padding:"0 4px",borderRadius:12,background:col,color:txtSobre(col),display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,fontFamily:"monospace"}}>{gr||it.orden}</span>
                  <span style={{fontFamily:"'Libre Baskerville',serif",fontWeight:700,fontSize:13}}>{(conAn&&conAn.nombres&&conAn.nombres[it.pc])||nombreLat(RAIZ_NOM[it.pc])}{it.oct}</span>
                  <span style={{fontSize:9.5,color:"#7c7c82"}}>{it.mano}</span><span style={{fontSize:12,color:"#8a8a90"}}>✕</span>
                </button>); })}
            </div>)}
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:4}}>
            <button disabled={!orden.length} style={uiPlay(false,{padding:"7px 14px"})} onClick={()=>conTocar(false)}>▶ Escuchar acorde</button>
            <button disabled={!orden.length} style={uiPlay(false,{padding:"7px 14px"})} onClick={()=>conTocar(true)}>▶ Arpegio</button>
            <button disabled={!orden.length} style={uiGhost} onClick={()=>conIds.length&&conQuitar(conIds[conIds.length-1])}>↶ Quitar la última</button>
            <button disabled={!orden.length} style={{...uiGhost,marginLeft:"auto"}} onClick={()=>{setConSel(m=>({...m,[bellows]:[]}));setConRaiz(null);}}>⟳ Limpiar</button>
          </div>
          {conVoicings && (
            <div style={{marginTop:12,paddingTop:10,borderTop:"1px solid #232326"}}>
              <p style={{...uiLabel,margin:"0 0 6px"}}>Formas sugeridas · {conAn.nombre}</p>
              {formasUI(conVoicings,{onVer:(v)=>{ setBellows(v.fuelle); setConSel(m=>({...m,[v.fuelle]:v.ids})); setConRaiz(null); tocarVoicing(v,false); },activoIds:conIds,btnVer:"Usar esta forma",guardar:(v)=>guardarVoicing(v,conAn.nombre+" · "+v.nombre)})}
              <p style={{fontSize:10.5,color:"#6a6a70",margin:"6px 0 0"}}>Usan la raíz, la 3ª, la 5ª y la 7ª (si la tiene). Las demás notas las sumás vos tocando el teclado.</p>
            </div>)}
          {conItems.length>=3 && conAn && !conAn.intervalo && !conVoicings && <p style={{fontSize:11,color:"#7c7c82",margin:"10px 0 0"}}>Para sugerir formas, el acorde necesita raíz, 3ª y 5ª.</p>}
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginTop:10}}>
            <input value={conNota} onChange={e=>setConNota(e.target.value)} placeholder="Anotación opcional (ej.: marcato, mano izquierda)" style={{...inpS,flex:"1 1 220px",fontSize:12,padding:"6px 8px"}}/>
            <button disabled={orden.length<2} style={uiTool(false,{padding:"6px 12px",opacity:orden.length<2?0.45:1})} onClick={()=>{ cardGuardar(conAn?conAn.nombre:"Acorde",conNota,conIds,bellows,conAn&&conAn.nombres); setConNota(""); }}>★ Guardar en mis acordes</button>
          </div>
          <details style={{marginTop:12,borderTop:"1px solid #232326",paddingTop:10}}>
            <summary style={{cursor:"pointer",fontFamily:UI_FONT,fontSize:12,fontWeight:600,color:"#cfcfd4"}}>Nombres: cómo se escribe y nombres propios</summary>
            <div style={{marginTop:10}}>
              <p style={{fontSize:11.5,color:"#8a8a8a",margin:"0 0 10px",lineHeight:1.5}}>El nombre sale de las notas que armaste: tercera, quinta, séptima, tensiones y alteraciones. Si preferís otra forma de escribirlo para este acorde, cambiala acá y se guarda para esa estructura en todas las tonalidades.</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:12,marginBottom:10}}>
                <Desplegable etiqueta="Estilo de cifrado" valor={cifEstilo()} opciones={[["jazz","△7 · m7 · ø7 · °7"],["amer","maj7 · m7 · m7♭5 · dim7"]]} onChange={v=>{ try{localStorage.setItem("bandomaps_estilo_cifrado",v);}catch(e){} setConVer(n=>n+1); }}/>
              </div>
              {conAn&&!conAn.intervalo ? (
                <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"flex-end",marginBottom:6}}>
                  <label style={{display:"flex",flexDirection:"column",gap:5,flex:"1 1 200px"}}>
                    <span style={uiLabel}>Escritura de este acorde (después de la raíz)</span>
                    <input value={conTxt} onChange={e=>setConTxt(e.target.value)} placeholder={conAn.defaultSuf||"mayor"} style={{...inpS,fontFamily:"monospace",fontSize:13}}/>
                  </label>
                  <button style={uiPill(true,{padding:"8px 14px"})} onClick={conGuardar}>Guardar mi nombre</button>
                </div>) : <p style={{fontSize:11.5,color:"#6a6a70",margin:"0 0 6px"}}>Armá un acorde de tres notas o más para poder ponerle tu propio nombre.</p>}
              {conMsg&&<p style={{fontSize:11.5,color:"#8a8a8a",margin:"4px 0 8px"}}>{conMsg}</p>}
              {claves.length>0 && (
                <div style={{marginTop:8}}>
                  <p style={{...uiLabel,margin:"0 0 6px"}}>Mis nombres guardados</p>
                  {claves.map(k=>(
                    <div key={k} style={{display:"flex",gap:8,alignItems:"center",padding:"4px 0",borderTop:"1px solid #1c1c1f",fontSize:12,color:"#cfcfd4"}}>
                      <b style={{minWidth:70}}>Do {propios[k]}</b><span style={{color:"#7c7c82",flex:1}}>{ejC(k)}</span>
                      <button style={uiPill(false,{padding:"2px 9px",fontSize:11})} onClick={()=>{ const p={...cifPropios()}; delete p[k]; cifGuardarPropios(p); setConVer(v=>v+1); }}>Borrar</button>
                    </div>))}
                  <button style={uiPill(false,{padding:"6px 14px",marginTop:8})} onClick={conCopiar}>⧉ Copiar mis nombres</button>
                </div>)}
            </div>
          </details>
        </div>);
      })()}

      {modo==="lineas" && (()=>{
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
      })()}

      {modo==="forma" && (
        <div className="rounded-xl mb-3" style={{background:"#121212",border:"1px solid #2a2a2a",padding:"12px 14px"}}>
          <p className="text-xs text-gray-500 mb-3">Tocá el tablero para poner un círculo donde creas que va un botón. Tocá un círculo para sacarlo y arrastralo para acomodarlo. Hacelo con la mano izquierda, la derecha o las dos. Al corregir, cada círculo cuenta como bien ubicado si queda cerca del botón que le toca (con el margen que elijas abajo; no hace falta que sea exacto): <b>verde</b> = bien ubicado, <b>rojo</b> = sobra; el marcador te dice cuántos faltan. Con <b>Ver respuesta</b> aparecen, con línea punteada, los que te faltan.</p>
          <p style={uiLabel}>Ayuda</p>
          <div className="flex gap-1.5 mt-2 mb-3">{[[true,"Cuadrícula con imán"],[false,"Libre"]].map(([v,l])=>(<button key={String(v)} style={uiPill(formaGrid===v)} onClick={()=>setFormaGrid(v)}>{l}</button>))}</div>
          <p style={uiLabel}>Margen al corregir</p>
          <div className="flex gap-1.5 mt-2">{FORMA_NIVELES.map(([v,l])=>(<button key={v} style={uiPill(formaTol===v)} onClick={()=>{setFormaTol(v);}}>{l}</button>))}</div>
        </div>
      )}

      {modo==="notas" && (
        <div className="rounded-xl mb-3" style={{background:"#121212",border:"1px solid #2a2a2a",padding:"12px 14px"}}>
          <p className="text-xs text-gray-500 mb-3">Tocá un círculo y elegí qué nota es; al elegirla, el círculo toma su color. Usá <b>Abre / Cierra</b> para practicar cada sentido del fuelle. Después tocá "Corregir": en cada error aparece la nota correcta, y en la ventana del círculo podés escucharla.</p>
          <p style={uiLabel}>Qué se pide</p>
          <div className="flex gap-1.5 mt-2">{[[false,"Solo la nota"],[true,"Nota y octava"]].map(([v,l])=>(<button key={String(v)} style={uiPill(pedirOct===v)} onClick={()=>setPedirOct(v)}>{l}</button>))}</div>
        </div>
      )}

      {modo==="acordes" && (
        <>
          {acoVistas}
          {armarToggle}
          <p className="text-xs text-gray-500 mb-2">
            Armá el acorde (fundamental, tipo, séptima, extensiones) y marcá en los teclados los botones que lo forman, con una mano o con las dos. Después tocá "Corregir". Podés ir sumando notas al acorde y seguir marcando.
          </p>
          <ArmadorAcordes a={acorde} collapsible={false}/>
        </>
      )}

      {/* Controles */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10,alignItems:"center"}}>
        {modo!=="forma" && <div style={{display:"flex",background:"#121212",border:"1.5px solid #2a2a2a",borderRadius:10,padding:3,gap:2}}>
          {[["abre","▷ Abre"],["cierra","◁ Cierra"]].map(([b,l])=>(
            <button key={b} style={uiVista(bellows===b)} onClick={()=>setBellows(b)}>{l}</button>
          ))}
        </div>}
        <div style={{display:"flex",background:"#121212",border:"1.5px solid #333333",borderRadius:10,padding:3,gap:2}}>
          {[["ambas","Ambas"],["izquierda","IZQ"],["derecha","DER"]].map(([v,l])=>(
            <button key={v} style={uiVista(view===v)} onClick={()=>setView(v)}>{l}</button>
          ))}
        </div>
        <ControlesDisposicion d={disp} isMobile={isMobile}/>
        <div style={{marginLeft:"auto",display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
          {(esCam||modo==="lineas") && (
            <div style={{display:"inline-flex",alignItems:"center",gap:6}}>
              <span style={{...uiLabel,fontSize:8.5,color:"#6a6a72"}}>Flechas</span>
              <div style={{display:"flex",background:"#121212",border:"1px solid #2f2f35",borderRadius:8,padding:2,gap:2}}>
                {[["recta","╱ Rectas"],["canal","⤳ Canaletas"],["no","✕ Sin"]].map(([v,l])=>(<button key={v} style={uiVista(flechasModo===v,{padding:"3px 8px",fontSize:10.5})} onClick={()=>setFlechasModo(v)}>{l}</button>))}
              </div>
            </div>)}
          {(modo==="acordes"||modo==="forma"||modo==="notas") && (
            <button onClick={()=>setReveal(r=>!r)} style={{padding:"6px 12px",borderRadius:9,border:"1px solid #e6e6e6",background:reveal?"#e6e6e6":"transparent",color:reveal?"#0a0a0a":"#e6e6e6",fontWeight:700,fontSize:10,cursor:"pointer"}}>
              👁 {reveal?"Ocultar respuesta":"Ver respuesta"}
            </button>
          )}
          {modo!=="escalas" && !esCam && modo!=="lineas" && modo!=="construir" && modo!=="armonizar" && <button onClick={()=>{ if(!checked&&painted.length) medirLote("entrenador-"+modo,correctos.length,painted.length-correctos.length); setChecked(true); }} style={{padding:"6px 14px",borderRadius:9,border:"none",background:"#e6e6e6",color:"#0a0a0a",fontWeight:800,fontSize:11,cursor:"pointer"}}>
            ✓ Corregir
          </button>}
          <button onClick={reiniciarFuelle} style={uiGhost}>
            ⟳ Reiniciar
          </button>
        </div>
      </div>

      {/* Marcador */}
      <div style={{marginBottom:10,padding:"8px 12px",background:"#121212",border:"1px solid #333333",borderRadius:10,display:"flex",gap:16,flexWrap:"wrap",fontSize:11}}>
        {esCam ? (
          <>
            <span style={{color:"#8a8a8a"}}>{modo==="voz"?"Acorde":modo==="arpegio"?"Arpegio":"Camino"}: <b style={{color:"#e6e6e6"}}>{modo==="voz" ? acorde.name : modo==="arpegio" ? acorde.name+" · "+(acoInvOk===0?"fundamental":acoInvOk+"ª inversión") : nombreLat(escRoot)+" "+camDef.nombre}</b></span>
            <span style={{color:"#8a8a8a"}}>Fuelle: <b style={{color:"#e6e6e6"}}>{bellows==="abre"?"abriendo":"cerrando"}</b></span>
            {cam && <span style={{color:"#8a8a8a"}}>Izq.: <b style={{color:"#e6e6e6"}}>{cam.manos.L.nodos.length-cam.manos.L.faltan.length}/{cam.manos.L.nodos.length}</b> · Der.: <b style={{color:"#e6e6e6"}}>{cam.manos.R.nodos.length-cam.manos.R.faltan.length}/{cam.manos.R.nodos.length}</b></span>}
          </>
        ) : modo==="armonizar" ? (
          <>
            <span style={{color:"#8a8a8a"}}>Escala: <b style={{color:"#e6e6e6"}}>{nombreLat(armTonica)} {ESC_ENT.find(e=>e.id===escTipo7).nombre.toLowerCase()}</b></span>
            <span style={{color:"#8a8a8a"}}>Acorde: <b style={{color:"#e6e6e6"}}>{armSel.num} · {armSel.nombre}</b></span>
            <span style={{color:"#8a8a8a"}}>Fuelle: <b style={{color:"#e6e6e6"}}>{bellows==="abre"?"abriendo":"cerrando"}</b></span>
          </>
        ) : modo==="construir" ? (
          <>
            <span style={{color:"#8a8a8a"}}>Acorde: <b style={{color:"#e6e6e6"}}>{conAn?conAn.nombre:conItems.length?"(marcá al menos dos notas)":"—"}</b></span>
            <span style={{color:"#8a8a8a"}}>Notas: <b style={{color:"#e6e6e6"}}>{conItems.length}</b></span>
            <span style={{color:"#8a8a8a"}}>Fuelle: <b style={{color:"#e6e6e6"}}>{bellows==="abre"?"abriendo":"cerrando"}</b></span>
          </>
        ) : modo==="lineas" ? (
          <>
            <span style={{color:"#8a8a8a"}}>Patrón: <b style={{color:"#e6e6e6"}}>{LIN_TIPOS.find(t=>t[0]===linTipo)[1]}</b></span>
            <span style={{color:"#8a8a8a"}}>Fuelle: <b style={{color:"#e6e6e6"}}>{bellows==="abre"?"abriendo":"cerrando"}</b></span>
            <span style={{color:"#8a8a8a"}}>Líneas: <b style={{color:"#e6e6e6"}}>Izq. {linL.length} · Der. {linR.length}</b></span>
          </>
        ) : modo==="forma" ? (
          <>
            <span style={{color:"#8a8a8a"}}>Círculos puestos: <b style={{color:"#e6e6e6"}}>{formaPuestos}</b> de {formaTot}</span>
            {checked && <span style={{color:"#8a8a8a"}}>Bien ubicados: <b style={{color:"#e6e6e6"}}>{formaBien}/{formaTot}</b></span>}
            {checked && <span style={{color:"#8a8a8a"}}>Sobran: <b style={{color:formaExtra?"#d98f88":"#e6e6e6"}}>{formaExtra}</b></span>}
            {checked && <span style={{color:"#8a8a8a"}}>Faltan: <b style={{color:formaFalta?"#d98f88":"#e6e6e6"}}>{formaFalta}</b></span>}
          </>
        ) : modo==="notas" ? (
          <>
            <span style={{color:"#8a8a8a"}}>Fuelle: <b style={{color:"#e6e6e6"}}>{bellows==="abre"?"abriendo":"cerrando"}</b></span>
            <span style={{color:"#8a8a8a"}}>Con nota: <b style={{color:"#e6e6e6"}}>{notaPuestas.length}/{vis.length}</b></span>
            {checked && <span style={{color:"#8a8a8a"}}>Correctas: <b style={{color:"#e6e6e6"}}>{notaBien.length}/{notaPuestas.length}</b></span>}
          </>
        ) : modo==="escalas" ? (
          <>
            <span style={{color:"#8a8a8a"}}>Escala: <b style={{color:"#e6e6e6"}}>{nombreLat(escRoot)} {escDef.nombre.toLowerCase()}</b></span>
            <span style={{color:"#8a8a8a"}}>Fuelle: <b style={{color:"#e6e6e6"}}>{bellows==="abre"?"abriendo":"cerrando"}</b></span>
            {escModo==="practica" && <span style={{color:"#8a8a8a"}}>Progreso: <b style={{color:"#e6e6e6"}}>{Math.min(prog.i,escR.route.length)}/{escR.route.length}</b> · errores <b style={{color:prog.err?"#d98f88":"#e6e6e6"}}>{prog.err}</b></span>}
          </>
        ) : modo==="colores" ? (
          <>
            <span style={{color:"#8a8a8a"}}>Pintados: <b style={{color:"#e6e6e6"}}>{painted.length}/{allButtons.length}</b></span>
            {checked && <span style={{color:"#8a8a8a"}}>Correctos: <b style={{color:"#e6e6e6"}}>{correctos.length}/{painted.length}</b></span>}
          </>
        ) : (
          <>
            <span style={{color:"#8a8a8a"}}>Marcados: <b style={{color:"#e6e6e6"}}>{selected.length}</b></span>
            {checked && <span style={{color:"#8a8a8a"}}>Notas del acorde cubiertas: <b style={{color:"#e6e6e6"}}>{acorde.tones.length-faltanTones.length}/{acorde.tones.length}</b></span>}
            {checked && <span style={{color:"#8a8a8a"}}>Botones que no son del acorde: <b style={{color:selBad.length?"#d98f88":"#e6e6e6"}}>{selBad.length}</b></span>}
            {checked && faltanTones.length>0 && <span style={{color:"#8a8a8a"}}>Faltan: <b style={{color:"#e6e6e6"}}>{faltanTones.map(tn=>tn.nombre).join(", ")}</b></span>}
          </>
        )}
      </div>

      {/* Teclados */}
      <div ref={wrapRef} style={lateral?{display:"flex",gap:18,alignItems:"flex-start",paddingBottom:8,width:"100%",minWidth:0}:{display:"flex",flexDirection:an.fila?"row":(disp.invertir?"column-reverse":"column"),gap:an.gap,alignItems:an.fila?"flex-start":"center",paddingBottom:8}}>
        {lateral && <aside style={asideS}>{lateralIzq}</aside>}
        <div style={lateral?{display:"flex",flexDirection:disp.invertir?"column-reverse":"column",gap:an.gap,alignItems:"center",width:kbW,flexShrink:0}:{display:"contents"}}>
        {(view==="ambas"||view==="izquierda")&&(
          <div style={{width: an.aL, flexShrink:0}}>
            <p style={{fontSize:11,color:"#8a8a8a",marginBottom:6,letterSpacing:"0.12em"}}>MANO IZQUIERDA · {modo==="forma" ? `${formaPts.L.length} círculos` : `${leftBtns.length} botones`}</p>
            {modo==="forma"
              ? <FormaCanvas real={leftBtns} pts={formaPts.L} onChange={(l)=>setFormaH("L",l)} checked={checked} reveal={reveal} grid={formaGrid} tol={formaTol} maxWidth={an.aL} maxScale={3.6}/>
              : <PaintCanvas buttons={leftBtns} guesses={guesses} keyOf={keyOf} checked={checked} correctOf={correctOf} onTapButton={tapBtn} maxWidth={an.aL} maxScale={3.6} activeId={modo==="escalas" ? info?.btn.id : picker?.btn.id} chord={chordProps} escala={scaleProps} rotulo={modo==="colores"?notaOct:null} flechas={esCam?camFlechas("L"):modo==="lineas"?linFlechas("L"):null} rutaFlechas={flechasModo}/>}
          </div>
        )}
        {(view==="ambas"||view==="derecha")&&(
          <div style={{width: an.aR, flexShrink:0}}>
            <p style={{fontSize:11,color:"#8a8a8a",marginBottom:6,letterSpacing:"0.12em"}}>MANO DERECHA · {modo==="forma" ? `${formaPts.R.length} círculos` : `${rightBtns.length} botones`}</p>
            {modo==="forma"
              ? <FormaCanvas real={rightBtns} pts={formaPts.R} onChange={(l)=>setFormaH("R",l)} checked={checked} reveal={reveal} grid={formaGrid} tol={formaTol} maxWidth={an.aR} maxScale={3.6}/>
              : <PaintCanvas buttons={rightBtns} guesses={guesses} keyOf={keyOf} checked={checked} correctOf={correctOf} onTapButton={tapBtn} maxWidth={an.aR} maxScale={3.6} activeId={modo==="escalas" ? info?.btn.id : picker?.btn.id} chord={chordProps} escala={scaleProps} rotulo={modo==="colores"?notaOct:null} flechas={esCam?camFlechas("R"):modo==="lineas"?linFlechas("R"):null} rutaFlechas={flechasModo}/>}
          </div>
        )}
        </div>
        {lateral && <aside style={asideS}>{lateralDer}</aside>}
      </div>

      {/* Enviar para revisión */}
      {modo==="colores" && <div style={{marginTop:14,padding:"10px 14px",background:"#121212",border:"1px solid #2a2a2a",borderRadius:10}}>
        <p style={{fontSize:10,color:"#8a8a8a",marginBottom:8,fontWeight:700}}>📤 MANDAR PARA REVISIÓN</p>
        <p style={{fontSize:10,color:"#555",marginBottom:10,lineHeight:1.5}}>
          La app todavía no tiene un servidor donde juntar esto automáticamente. Por ahora: descargá el CSV o copiá el resumen y mandámelo por WhatsApp o mail.
        </p>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button onClick={descargarCSV} disabled={!painted.length} style={{padding:"7px 14px",borderRadius:9,border:"1px solid #e6e6e644",background:"transparent",color:"#e6e6e6",fontWeight:700,fontSize:11,cursor:"pointer",opacity:painted.length?1:0.4}}>
            ↓ Descargar CSV
          </button>
          <button onClick={copiarResumen} disabled={!painted.length} style={{padding:"7px 14px",borderRadius:9,border:"1px solid #e6e6e6",background:"#1a1a1a",color:"#e6e6e6",fontWeight:700,fontSize:11,cursor:"pointer",opacity:painted.length?1:0.4}}>
            {copied?"✓ Copiado":"⧉ Copiar resumen"}
          </button>
        </div>
      </div>}

      {modo==="escalas" && info && (()=>{
        const it=itemDe(info.btn), ri=escIdxById[info.btn.id], col=nc(CHROMATIC[it.pc]);
        const fn = ri!==undefined ? gradoTxt(escR.route[ri],ri) : funcionDe(it.pc);
        const ded = ri!==undefined ? (dedos[ri]||"") : "";
        return (
          <PopoverAnclado rect={info.rect} onClose={()=>setInfo(null)} width={262} estimado={190}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <div style={{width:42,height:42,borderRadius:"50%",background:col,border:"2px solid rgba(255,255,255,.4)",flexShrink:0}}/>
              <div style={{minWidth:0}}>
                <div style={{fontFamily:"'Libre Baskerville',serif",fontWeight:700,fontSize:20,lineHeight:1.1}}>{etiqueta(it)}</div>
                <div style={{fontSize:11,color:"#8a8a8a"}}>Tecla {info.btn.id} · {bellows==="abre"?"abriendo":"cerrando"}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:14,fontSize:12.5,marginBottom:ri!==undefined?10:4}}>
              <span><span style={{color:"#8a8a8a"}}>Octava </span><b>{it.oct}</b></span>
              <span><span style={{color:"#8a8a8a"}}>Función </span><b>{fn||"fuera de la escala"}</b></span>
            </div>
            {ri!==undefined ? (
              <div style={{fontSize:13}}>{ded ? <>Dedo sugerido: <b>{ded.includes("/")?("uno de estos: "+nomDedo(ded)):(ded+" · "+nomDedo(ded))}</b></> : <span style={{color:"#8a8a8a"}}>Sin dedo indicado para esta nota.</span>}</div>
            ) : (
              <div style={{fontSize:11.5,color:"#8a8a8a"}}>Esta tecla no está en el camino sugerido.</div>
            )}
            <div style={{display:"flex",gap:6,marginTop:10}}>
              <button style={uiPlay(false,{flex:1})} onClick={()=>tocarItem(it)}>▶ Escuchar</button>
              <button style={uiPill(false,{flex:1})} onClick={()=>setInfo(null)}>Cerrar</button>
            </div>
          </PopoverAnclado>
        );
      })()}

      {modo==="notas" && notaPicker && (()=>{
        const k=keyOf(notaPicker.btn.id), it=itemDe(notaPicker.btn);
        return <NotaPicker rect={notaPicker.rect} actual={notaGuess[k]} pedirOct={pedirOct} onSet={setNota} onErase={borrarNota} onClose={()=>setNotaPicker(null)}
          onListen={checked ? ()=>tocarItem(it) : null}/>;
      })()}

      {modo==="colores" && picker&&<HojaDeColor rect={picker.rect} actual={guesses[keyOf(picker.btn.id)]} onPick={pickColor} onErase={erase} onClose={closePicker}/>}
    </div>
  );
}

export default function BandoMapsApp(){
  // Aviso inicial (solo en la versión de alumnos): se cuenta cada ingreso; desde el cuarto se puede ocultar
  const avisoN = useRef((()=>{ try{ const n=parseInt(localStorage.getItem("bandomaps_aviso_vistas")||"0",10)||0; return n+1; }catch(e){ return 1; } })());
  const [aviso,setAviso]=useState(()=>{ if(!window.__ALUMNO) return false; try{ if(localStorage.getItem("bandomaps_aviso_no")==="1") return false; }catch(e){} return true; });
  const [avisoManual,setAvisoManual]=useState(false);
  useEffect(()=>{ if(aviso&&!avisoManual){ try{ localStorage.setItem("bandomaps_aviso_vistas",String(avisoN.current)); }catch(e){} } },[]);

  const[tab,setTab]=useState("codigo");
  useEffect(()=>{ window.__tab=tab; },[tab]);   // medir-1: qué herramienta se está usando (src/Puerta.jsx)
  const[navOpen,setNavOpen]=useState(false);
  const[chordInput,setChordInput]=useState("Dm7");
  const[pickRoot,setPickRoot]=useState("D");
  const[pickQ,setPickQ]=useState("min7");
  const[chord,setChord]=useState(null);
  const[openFns,setOpenFns]=useState([0]);
  const[showTable,setShowTable]=useState(false);
  const[progInput,setProgInput]=useState("Dm7 – G7 – Cmaj7");
  const[progression,setProgression]=useState(null);
  const[selectedKey,setSelectedKey]=useState(null);
  const[bibGenero,setBibGenero]=useState("Tango");

  const analyzeChord=useCallback(()=>{
    const c=parseChord(chordInput);
    setChord(c);setOpenFns([0]);setShowTable(false);
    if(c)playChord(c.notes);
  },[chordInput]);

  const elegirAcorde=(r,q)=>{
    const txt=r+(QUAL_TXT[q]||""); setPickRoot(r); setPickQ(q); setChordInput(txt);
    const c=parseChord(txt); setChord(c); setOpenFns([0]); setShowTable(false); if(c) playChord(c.notes);
  };

  const analyzeProg=useCallback(()=>{
    try{
      const parts=progInput.split(/[\s–\-,|]+/).filter(Boolean);
      const parsed=parts.map(p=>parseChord(p)).filter(Boolean);
      if(parsed.length>0)setProgression(computeProg(parsed));
    }catch(e){}
  },[progInput]);

  useEffect(()=>{const c=parseChord("Dm7");setChord(c);},[]);

  const fns=useMemo(()=>chord?getFns(chord.quality):[],[chord]);
  const toggleFn=useCallback(i=>setOpenFns(p=>p.includes(i)?p.filter(x=>x!==i):[...p,i]),[]);

  const [preset,setPreset]=useState(null);
  const ESTUDIO=[
    {id:"codigo",label:"El Código",icon:"◐"},
    {id:"teoria",label:"Teoría",icon:"♩"},
    {id:"bandoneon",label:"Bandoneón",icon:"♬"},
    {id:"entrenador",label:"Entrenador",icon:"◎"},
    window.__ALUMNO ? {id:"tareas",label:"Mis tareas",icon:"✎"} : {id:"organizador",label:"Organizador",icon:"▦"},
  ];
  const HERRAMIENTAS=[
    {id:"chord",label:"Acorde",icon:"♪"},
    {id:"prog",label:"Progresión",icon:"→"},
    {id:"biblioteca",label:"Biblioteca",icon:"▤"},
    {id:"circle",label:"Quintas",icon:"○"},
    {id:"colors",label:"Colores",icon:"●"},
    {id:"modos",label:"Modos",icon:"≋"},
  ];
  const TABS=[...ESTUDIO.map(t=>({...t,grupo:"estudio"})),...HERRAMIENTAS.map(t=>({...t,grupo:"herr"}))];
  const practicar=(e)=>{ registrar("tarea"); setPreset({...e,nonce:Date.now()}); setTab("entrenador"); };

  return(
    <div className="min-h-screen text-gray-100 flex flex-col" style={{
      background:"linear-gradient(160deg,#09090a 0%,#0f0f10 55%,#111113 100%)",
      fontFamily:"'Crimson Text',Georgia,serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Libre+Baskerville:wght@400;700&family=Inter:wght@400;500;600;700&display=swap');
        .glow-input:focus{outline:none;box-shadow:0 0 0 2px #e6e6e655}
        button{transition:background-color .15s,border-color .15s,color .15s,transform .12s,opacity .2s,box-shadow .15s,filter .15s}
        button:not(:disabled):hover{filter:brightness(1.14)}
        button:not(:disabled):active{transform:scale(.97)}
        button:focus-visible,select:focus-visible,input:focus-visible{outline:2px solid #ececec;outline-offset:2px}
        button:disabled{opacity:.4;cursor:default}
        .nav-item{position:relative}
        .nav-item:hover{background:#141416}
        ::selection{background:#ececec;color:#0d0d0e}
        .stagger>*{animation:fadeUp 0.3s ease both}
        .stagger>*:nth-child(1){animation-delay:.03s}.stagger>*:nth-child(2){animation-delay:.08s}
        .stagger>*:nth-child(3){animation-delay:.13s}.stagger>*:nth-child(4){animation-delay:.18s}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        ::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#2c2c30;border-radius:3px}::-webkit-scrollbar-thumb:hover{background:#3d3d42}
      `}</style>

      {/* ── HEADER ── */}
      <div className="px-4 md:px-6 py-3 flex items-center gap-4 flex-shrink-0"
        style={{borderBottom:"1px solid #1f1f22",background:"rgba(10,10,11,.88)",backdropFilter:"blur(10px)",position:"sticky",top:0,zIndex:30}}>
        <button onClick={()=>setNavOpen(o=>!o)} aria-label="Menú"
          className={`${(tab==="bandoneon"||tab==="entrenador")?"":"md:hidden"} flex flex-col gap-1 p-2.5 rounded-lg flex-shrink-0`}
          style={{background:"#121214",border:"1px solid #2a2a2e"}}>
          <span className="block w-4 h-px" style={{background:"#a0a0a6"}}/>
          <span className="block w-4 h-px" style={{background:"#a0a0a6"}}/>
          <span className="block w-4 h-px" style={{background:"#a0a0a6"}}/>
        </button>
        <div style={{lineHeight:1.15}}>
          <h1 style={{fontFamily:"'Libre Baskerville',serif",fontSize:19,fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase",color:"#ececec"}}>BandoMaps</h1>
        </div>
        <div className="ml-auto flex items-center gap-2" style={{fontFamily:UI_FONT,fontSize:12,color:"#9a9aa0",letterSpacing:"0.04em"}}>
          <span style={{opacity:.6}}>{TABS.find(t=>t.id===tab)?.icon}</span>
          <span style={{fontWeight:600,color:"#d6d6da"}}>{TABS.find(t=>t.id===tab)?.label}</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── SIDEBAR VERTICAL ── */}
        <div className={`flex-shrink-0 transition-all duration-200 ${navOpen?"w-52":((tab==="bandoneon"||tab==="entrenador")?"w-0 overflow-hidden":"w-0 overflow-hidden md:w-52")}`}
          style={{background:"#0b0b0c",borderRight:"1px solid #1f1f22"}}>
          <nav className="py-4 px-3 w-52">
            {[["estudio","Estudio","empezá por acá"],["herr","Herramientas","consulta y práctica libre"]].map(([g,tit,sub],gi)=>(
              <div key={g} style={{marginTop:gi?18:0,paddingTop:gi?14:0,borderTop:gi?"1px solid #1f1f22":"none"}}>
                <p style={{...uiLabel,padding:"0 10px",fontSize:9.5,color:g==="estudio"?"#cfcfd4":"#6a6a70"}}>{tit}</p>
                <p style={{fontFamily:UI_FONT,fontSize:10,color:"#5a5a60",padding:"0 10px 8px",margin:0}}>{sub}</p>
                <div className="space-y-0.5">
                  {TABS.filter(t=>t.grupo===g).map((t,k)=>{
                    const act=tab===t.id;
                    return(
                      <button key={t.id}
                        onClick={()=>{setTab(t.id);setNavOpen(false);}}
                        className="nav-item w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3"
                        style={{
                          fontFamily:UI_FONT,fontSize:g==="estudio"?14:13,letterSpacing:"0.01em",
                          background:act?"#17171a":"transparent",
                          color:act?"#f0f0f2":(g==="estudio"?"#a8a8ae":"#7d7d84"),
                          fontWeight:act||g==="estudio"?600:500,
                          boxShadow:act?"inset 2px 0 0 #ececec":"none",
                        }}>
                        {g==="estudio"
                          ? <span style={{width:20,height:20,borderRadius:"50%",border:`1.5px solid ${act?"#ececec":"#4a4a50"}`,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:10.5,fontWeight:800,flexShrink:0}}>{k+1}</span>
                          : <span style={{width:20,textAlign:"center",fontSize:14,opacity:act?1:.55,flexShrink:0}}>{t.icon}</span>}
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* ── CONTENIDO PRINCIPAL ── */}
        <div className="flex-1 overflow-y-auto">
          <div className={`${(tab==="bandoneon"||tab==="entrenador")?"max-w-[1700px]":tab==="codigo"?"max-w-3xl":(tab==="organizador"||tab==="tareas")?"max-w-4xl":"max-w-2xl"} mx-auto ${(tab==="bandoneon"||tab==="entrenador")?"px-2 py-4 md:px-5 md:py-6":"px-3 py-4 md:px-8 md:py-8"}`}>

            {/* ══ EL CÓDIGO ══ */}
            {tab==="codigo"&&<ElCodigoTab irA={setTab}/>}

            {/* ══ TEORÍA BÁSICA ══ */}
            {tab==="teoria"&&<TeoriaTab irA={setTab}/>}

            {/* ══ ACORDE ══ */}
            {tab==="chord"&&(
              <AcordeTab analyzeChord={analyzeChord} chord={chord} chordInput={chordInput} elegirAcorde={elegirAcorde} fns={fns} openFns={openFns} pickQ={pickQ} pickRoot={pickRoot} setChordInput={setChordInput} setShowTable={setShowTable} showTable={showTable} toggleFn={toggleFn}/>
            )}

            {/* ══ PROGRESIÓN ══ */}
            {tab==="prog"&&(
              <ProgresionTab analyzeProg={analyzeProg} progInput={progInput} progression={progression} setProgInput={setProgInput}/>
            )}

            {/* ══ BIBLIOTECA ══ */}
            {tab==="biblioteca"&&(
              <BibliotecaTab bibGenero={bibGenero} setBibGenero={setBibGenero} setProgInput={setProgInput} setProgression={setProgression} setTab={setTab}/>
            )}

            {/* ══ BANDONEÓN ══ */}
            {tab==="bandoneon"&&(
              <div className="stagger">
                <div className="mb-4">
                  <h2 className="text-xl font-bold mb-1" style={{fontFamily:"'Libre Baskerville',serif"}}>
                    <span style={{color:"#e6e6e6"}}>🎵 Bandoneón</span>
                    <span className="text-gray-500 text-sm font-normal ml-2 italic">Rheinische · 71 botones</span>
                  </h2>
                  <p className="text-xs text-gray-500">Tocá los botones para escuchar. Con Marcar elegís notas sobre el teclado para armar un acorde y oírlo completo.</p>
                </div>
                <BandoneonTab/>
              </div>
            )}

            {/* ══ ENTRENADOR ══ */}
            {tab==="entrenador"&&<EntrenadorTab preset={preset}/>}
            {tab==="organizador"&&!window.__ALUMNO&&<>
              <OrganizadorTab onProbar={practicar}/>
              <details style={{marginTop:22,background:"#101012",border:"1px solid #26262a",borderRadius:12,padding:"10px 14px"}}>
                <summary style={{cursor:"pointer",fontFamily:UI_FONT,fontSize:12,fontWeight:600,color:"#cfcfd4"}}>📚 Manual completo (solo para vos)</summary>
                <div style={{marginTop:14}}><ElCodigoTab completo/></div>
              </details>
            </>}
            {tab==="tareas"&&<MisTareasTab onPracticar={practicar}/>}

            {/* ══ QUINTAS ══ */}
            {tab==="circle"&&<CirculoQuintas/>}

            {/* ══ MODOS ══ */}
            {tab==="modos"&&<ModosTab/>}

            {/* ══ COLORES ══ */}
            {tab==="colors"&&<ColoresTab/>}

          </div>
        </div>
      </div>

      {aviso && <AvisoInicial n={avisoN.current} manual={avisoManual} onClose={()=>{setAviso(false);setAvisoManual(false);}} onNunca={()=>{ try{localStorage.setItem("bandomaps_aviso_no","1");}catch(e){} setAviso(false); }}/>}

      {/* Footer */}
      <div className="border-t border-gray-800 px-4 py-2 text-center flex-shrink-0">
        <p className="text-xs text-gray-700 italic">
          BandoMaps · Sistema de color tonal ·{" "}
          <button onClick={()=>{setAvisoManual(true);setAviso(true);}} style={{background:"none",border:"none",padding:0,color:"#8a8a90",textDecoration:"underline",cursor:"pointer",fontStyle:"italic",fontSize:"inherit",fontFamily:"inherit"}}>Importante: antes de empezar</button>
        </p>
      </div>
    </div>
  );
}
