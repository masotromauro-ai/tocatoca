// La pestaña Entrenador: el esquema de la pantalla (cabecera, barra de modos, controles, marcador, teclados y ventanas). El estado vive en sus hooks y cada modo en paneles/.

import { CHROMATIC, nombreLat } from "../../shared/teoria/notas.js";
import { nc } from "../../shared/teoria/color.js";
import { UI_FONT, uiGhost, uiLabel, uiPill, uiPlay, uiVista } from "../../shared/ui/tema.js";
import { ESC_ENT } from "../../shared/bandoneon/camino.js";
import { PaintCanvas } from "./ayudas/lienzo.jsx";
import { NotaPicker } from "../../shared/ui/ayudas.jsx";
import { FORMA_NIVELES, FormaCanvas, LIN_TIPOS } from "./ayudas/formas.jsx";
import { PopoverAnclado } from "../../shared/ui/Popover.jsx";
import { HojaDeColor } from "../../shared/ui/hoja-de-color.jsx";
import { medirLote } from "../../shared/medicion.js";
import { nomDedo } from "../../shared/ui/dedos.js";
import { ArmadorAcordes } from "../../shared/bandoneon/armador.jsx";
import { ControlesDisposicion } from "../../shared/bandoneon/disposicion.jsx";
import { useEntrenador, useEscalasEntrenador, useLineasEntrenador, useNotasYForma, usePracticaEscalas } from "./hooks.jsx";
import { useAcordesEntrenador } from "./acordes.jsx";
import { useCaminoEntrenador } from "./camino.jsx";
import { PanelEscalas } from "./paneles/escalas.jsx";
import { PanelCamino } from "./paneles/camino.jsx";
import { PanelArpegio } from "./paneles/arpegio.jsx";
import { PanelVoz } from "./paneles/voz.jsx";
import { PanelConstruir } from "./paneles/construir.jsx";
import { PanelLineas } from "./paneles/lineas.jsx";
import { usePanelesAcordes, usePiezasEntrenador } from "./piezas.jsx";

export function EntrenadorTab({preset}={}){
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
  const { acoVistas, armarToggle, camAbajo, camControles, camTiras, escCab, escPills, escSelects } = usePiezasEntrenador({ cam, camBpm, camEscuchar, camNotaTxt, camParar, camSuena, escRoot, escTipo, modo, setCamBpm, setEscRoot, setEscStart, setEscTipo, setModo, tocarItem });
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

  const { arpAcorde, arpRecorrido, arpSonido, asideS, camRecorrido, camSonido, lateralDer, lateralIzq, misAcordesPanel, panelArmonizar } = usePanelesAcordes({ acoInvOk, acoVistas, acorde, armAcordes, armCuat, armPatron, armRecorrer, armSel, armTocar, armTonica, armVoicings, armVoz, bellows, camControles, camFig, camLong, camMetro, camOctL, camOctR, camSent, camTiras, cardAbrir, cardGuardar, cardItems, cardTocar, escRoot, escSelects, escTipo7, formasUI, guardarVoicing, matrizFilas, misAcordes, modo, nTonosArp, rg, setAcoInv, setArmCuat, setArmGrado, setArmMatriz, setArmPatron, setCamFig, setCamLong, setCamMetro, setCamOctL, setCamOctR, setCamSent, setConRaiz, setConSel, setEscRoot, setEscTipo, setMisAcordes, setModo, setVozSel, tocarVoicing, tonicasArm, verVoicing, vozSel });

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
        <PanelEscalas dedos={dedos} escCab={escCab} escDeletreo={escDeletreo} escDir={escDir} escEscuchar={escEscuchar} escMano={escMano} escModo={escModo} escR={escR} etiqueta={etiqueta} gradoTxt={gradoTxt} prog={prog} romano={romano} setEscDir={setEscDir} setEscMano={setEscMano} setEscModo={setEscModo} setEscStart={setEscStart} setProg={setProg} setRomano={setRomano} verDedo={verDedo}/>
      )}

      {modo==="camino" && (
        <PanelCamino camControles={camControles} camLey={camLey} camLong={camLong} camOctL={camOctL} camOctR={camOctR} camRecorrido={camRecorrido} camSonido={camSonido} camTiras={camTiras} escPills={escPills} escRoot={escRoot} escSelects={escSelects} lateral={lateral} setCamLey={setCamLey}/>
      )}

      {modo==="arpegio" && (
        <PanelArpegio acoVistas={acoVistas} acorde={acorde} arpAcorde={arpAcorde} arpRecorrido={arpRecorrido} arpSonido={arpSonido} camControles={camControles} camLey={camLey} camOctL={camOctL} camOctR={camOctR} camTiras={camTiras} lateral={lateral} setCamLey={setCamLey}/>
      )}

      {modo==="voz" && <PanelVoz acoVistas={acoVistas} acorde={acorde} camAbajo={camAbajo} camFig={camFig} camMetro={camMetro} camSent={camSent} dispo={dispo} rg={rg} setCamFig={setCamFig} setCamMetro={setCamMetro} setCamSent={setCamSent} setVozTxt={setVozTxt} voz={voz} vozAcorde={vozAcorde} vozCargar={vozCargar} vozCfg={vozCfg} vozCif={vozCif} vozCopiar={vozCopiar} vozMsg={vozMsg} vozNotas={vozNotas} vozSet={vozSet} vozTxt={vozTxt}/>}

      {modo==="armonizar" && panelArmonizar}
      {(modo==="construir"||modo==="armonizar") && misAcordesPanel}
      {modo==="construir" && <PanelConstruir acoVistas={acoVistas} armarToggle={armarToggle} bellows={bellows} cardGuardar={cardGuardar} conAn={conAn} conCopiar={conCopiar} conGuardar={conGuardar} conIds={conIds} conItems={conItems} conMsg={conMsg} conNota={conNota} conPrimera={conPrimera} conQuitar={conQuitar} conRaiz={conRaiz} conTocar={conTocar} conTxt={conTxt} conVoicings={conVoicings} formasUI={formasUI} guardarVoicing={guardarVoicing} setBellows={setBellows} setConNota={setConNota} setConRaiz={setConRaiz} setConSel={setConSel} setConTxt={setConTxt} setConVer={setConVer} tocarVoicing={tocarVoicing}/>}

      {modo==="lineas" && <PanelLineas bellows={bellows} leftBtns={leftBtns} linEscuchar={linEscuchar} linL={linL} linR={linR} linRot={linRot} linSel={linSel} linTipo={linTipo} rightBtns={rightBtns} setLinRot={setLinRot} setLinSel={setLinSel} setLinTipo={setLinTipo} tocarItem={tocarItem} view={view}/>}

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
