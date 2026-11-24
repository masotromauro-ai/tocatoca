// La pestaña Bandoneón.

import { useState, useEffect, useCallback, useMemo } from "react";
import { ArmadorCompacto, armarVoicing, rellenoIzq, useAcorde } from "../../shared/bandoneon/armador.jsx";
import { ControlesDisposicion, FormaSugerida, calcAnchos, useAnchoMedido, useDisposicion } from "../../shared/bandoneon/disposicion.jsx";
import { CHROMATIC, LAT } from "../../shared/teoria/notas.js";
import { nc } from "../../shared/teoria/color.js";
import { UI_FONT, uiLabel, uiMarcar, uiPill, uiPlay, uiVista } from "../../shared/ui/tema.js";
import { buildOctMaps } from "../../shared/bandoneon/layouts.js";
import { STORAGE_KEY_L, clearBtns, loadBtns, saveBtns } from "../../shared/bandoneon/almacen.js";
import { downloadCSV, generateCSS } from "../../shared/bandoneon/csv.js";
import { BandCanvas, MapaAlturas } from "../../shared/bandoneon/Teclado.jsx";
import { ImportModal, SavedModal } from "../../shared/bandoneon/Modales.jsx";
import { BandEditor } from "../../shared/bandoneon/Editor.jsx";
import { GrupoCtl, PanelMarcadas, segS } from "../../shared/ui/controles.jsx";
import { Desplegable } from "../../shared/ui/ayudas.jsx";
import { txtSobre } from "../../shared/teoria/etiquetas.js";
import { useRomanos } from "../../shared/almacen/romanos.js";
import { useSonidoBandoneon, useEscuchaBandoneon, useMarcasBandoneon } from "./hooks.jsx";

export function BandoneonTab() {
  const [leftBtns,    setLeftBtns]    = useState([]);
  const [rightBtns,   setRightBtns]   = useState([]);
  const [editMode,    setEditMode]    = useState(false);

  // Mapas de octava derivados de los botones cargados
  const { OCT_L_OPEN, OCT_L_CLOSE, OCT_R_OPEN, OCT_R_CLOSE } = useMemo(
    () => buildOctMaps(leftBtns, rightBtns),
    [leftBtns, rightBtns]
  );
  const [bellows,     setBellows]     = useState("abre");
  const [view,        setView]        = useState("ambas");
  const [pressedL,    setPressedL]    = useState([]);
  const [pressedR,    setPressedR]    = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [heardMidis,  setHeardMidis]  = useState([]);
  const [micModo,     setMicModo]     = useState("acorde");   // nota | acorde
  const [micMano,     setMicMano]     = useState("ambas");    // ambas | izq | der
  const [micOct,      setMicOct]      = useState(0);          // ajuste de octava del micrófono
  const [micExacta,   setMicExacta]   = useState(true);       // iluminar por octava exacta o solo por nombre
  const [errorAudio,  setErrorAudio]  = useState("");
  const [showSaved,   setShowSaved]   = useState(false);
  const [showImport,  setShowImport]  = useState(false);
  const [cssText,     setCSSText]     = useState("");
  const [fromStorage, setFromStorage] = useState(false);

  const LAT = {"DO":"C","DO#":"C#","RE":"D","RE#":"D#","MI":"E","FA":"F","FA#":"F#","SOL":"G","SOL#":"G#","LA":"A","LA#":"A#","SI":"B"};
  const ENG_TO_LAT = {"C":"DO","C#":"DO#","D":"RE","D#":"RE#","E":"MI","F":"FA","F#":"FA#","G":"SOL","G#":"SOL#","A":"LA","A#":"LA#","B":"SI"};
  const NOTES_ENG = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  const CHROMATIC_B = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

  const noteIdxB = n => {
    const i=CHROMATIC_B.indexOf(n); if(i>=0)return i;
    const m={"Db":"C#","Eb":"D#","Gb":"F#","Ab":"G#","Bb":"A#"};
    return CHROMATIC_B.indexOf(m[n]??"");
  };

  // Cargar al montar
  useEffect(()=>{
    const {left,right}=loadBtns();
    setLeftBtns(left); setRightBtns(right);
    try { setFromStorage(!!localStorage.getItem(STORAGE_KEY_L)); } catch {}
  },[]);

  // Notas activas
  const activeNotes = useMemo(()=>{
    const octL = bellows==="abre" ? OCT_L_OPEN : OCT_L_CLOSE;
    const octR = bellows==="abre" ? OCT_R_OPEN : OCT_R_CLOSE;
    const all=[
      ...pressedL.map(id=>{
        const b=leftBtns.find(x=>x.id===id); if(!b) return "";
        const nota=LAT[bellows==="abre"?b.abre:b.cierra]??"";
        return nota ? nota+(octL[id]??"") : "";
      }),
      ...pressedR.map(id=>{
        const b=rightBtns.find(x=>x.id===id); if(!b) return "";
        const nota=LAT[bellows==="abre"?b.abre:b.cierra]??"";
        return nota ? nota+(octR[id]??"") : "";
      }),
    ].filter(n=>n.trim());
    return[...new Set(all)];
  },[pressedL,pressedR,bellows,leftBtns,rightBtns]);

  // Detección de acorde
  const detected = useMemo(()=>{
    if(activeNotes.length<2)return null;
    // activeNotes ahora es "SOL3" — extraer solo la nota para detectar acorde
    const noteOnly = activeNotes.map(n=>n.replace(/\d+$/,""));
    const idxs=noteOnly.map(n=>noteIdxB(n)).filter(i=>i>=0).sort((a,b)=>a-b);
    const root=CHROMATIC_B[idxs[0]];
    const ivs=idxs.map(i=>(i-idxs[0]+12)%12).sort((a,b)=>a-b);
    const has=i=>ivs.includes(i);
    let q="?";
    if(has(4)&&has(7)&&has(11))q="△7"; else if(has(3)&&has(7)&&has(10))q="m7";
    else if(has(4)&&has(7)&&has(10))q="7"; else if(has(3)&&has(6)&&has(9))q="°7";
    else if(has(3)&&has(6)&&has(10))q="ø7"; else if(has(4)&&has(7))q="△";
    else if(has(3)&&has(7))q="m"; else if(has(3)&&has(6))q="°";
    const rootLat = ENG_TO_LAT[root]??root;
    return`${rootLat}${q}`;
  },[activeNotes]);

  const getOct = useCallback((btn, bellows) => {
    // Usar oct_abre/oct_cierra del botón directamente (editables por el usuario)
    return bellows === "abre"
      ? (btn.oct_abre  ?? (btn.id.startsWith("L") ? 2 : 4))
      : (btn.oct_cierra ?? (btn.id.startsWith("L") ? 2 : 4));
  }, []);

  // ─── AUDIO SOSTENIDO ────────────────────────────────────────────────────
  // Antes cada nota sonaba con duración fija (1s), como un "pip". Un bandoneón
  // real suena mientras el botón está apretado, y varias notas pueden sonar
  // juntas hasta que se sueltan. Acá guardamos los nodos de audio activos por
  // botón (id) en un ref: se crean al presionar y se apagan (con una rampa
  // corta para evitar clicks) al soltar.
  const { startNote, stopAllNotes, stopNote } = useSonidoBandoneon({ bellows });

  // ─── Escucha física: varias notas a la vez, acotadas a lo que el teclado puede producir ───
  const { heardAcorde, heardIdsL, heardIdsR, heardNotas, heardTxt } = useEscuchaBandoneon({ LAT, bellows, getOct, heardMidis, isListening, leftBtns, micExacta, micMano, micModo, micOct, noteIdxB, rightBtns, setErrorAudio, setHeardMidis, setIsListening });

  // ─── MARCAR: elegir notas sobre el teclado para armar un acorde ───────────
  const { marcadas, marcar, marcarTecla, markIds, marksB, quitarMark, setMarcar, setMarks, toggleMark } = useMarcasBandoneon({ LAT, bellows, getOct, leftBtns, noteIdxB, rightBtns });

  const downL=useCallback((btn)=>{
    if(marcar){ marcarTecla(btn); return; }
    const oct = getOct(btn, bellows);
    const note = bellows==='abre' ? btn.abre : btn.cierra;
    startNote(btn.id, LAT[note]||note, oct);
    setPressedL(p=>[...new Set([...p,btn.id])]);
  },[bellows,getOct,startNote,marcar,toggleMark]);
  const upL  =useCallback((id)=>{
    stopNote(id);
    setPressedL(p=>p.filter(x=>x!==id));
  },[stopNote]);
  const downR=useCallback((btn)=>{
    if(marcar){ marcarTecla(btn); return; }
    const oct = getOct(btn, bellows);
    const note = bellows==='abre' ? btn.abre : btn.cierra;
    startNote(btn.id, LAT[note]||note, oct);
    setPressedR(p=>[...new Set([...p,btn.id])]);
  },[bellows,getOct,startNote,marcar,toggleMark]);
  const upR  =useCallback((id)=>{
    stopNote(id);
    setPressedR(p=>p.filter(x=>x!==id));
  },[stopNote]);

  const handleSave=useCallback((left,right)=>{
    setLeftBtns(left); setRightBtns(right);
    saveBtns(left,right); downloadCSV(left,right);
    setCSSText(generateCSS(left,right));
    setEditMode(false); setShowSaved(true); setFromStorage(true);
  },[]);

  const handleImport=useCallback((left,right)=>{
    setLeftBtns(left); setRightBtns(right);
    saveBtns(left,right); setFromStorage(true); setShowImport(false);
  },[]);

  const pill=(active,v="orange")=>uiPill(active);

  // Detectar móvil
  const [isMobile, setIsMobile] = useState(false);
  useEffect(()=>{
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  },[]);

  // Mide el ancho REAL disponible del contenedor (no una suposición fija)
  // y lo reparte entre los teclados visibles, para que los dos entren siempre.
  const [canvasWrapRef, wrapMedido] = useAnchoMedido();
  const wrapWidth = wrapMedido || 900;
  const bothVisible = view==="ambas";
  const [romano,setRomano]=useRomanos();
  const acorde = useAcorde(romano,setRomano);
  const [vozMano,setVozMano]=useState("izq"), [vozInv,setVozInv]=useState(0), [vozTodas,setVozTodas]=useState(false);   // por defecto: la forma sugerida
  const vozRes = useMemo(()=>{
    if(!(acorde.open && leftBtns.length)) return {notas:[],faltan:[]};
    const r=armarVoicing(vozMano==="der"?rightBtns:leftBtns, bellows, acorde.tones, vozMano, vozInv, rightBtns);
    return {...r, variantes:Math.max(1, vozMano==="der" ? acorde.tones.length : rellenoIzq(acorde.tones).length)};   // cuántas inversiones hay
  }, [acorde.open,acorde.key,acorde.romano,leftBtns,rightBtns,bellows,vozMano,vozInv]);
  const chordIds = (acorde.open && !vozTodas && vozRes.notas.length) ? Object.fromEntries(vozRes.notas.map(n=>[n.b,n.lab])) : null;   // teclado: solo la forma sugerida, salvo «Ver todas las notas»
  const chordMap = acorde.open ? acorde.labelByPc : null;
  const canvasMaxWidth = wrapWidth; // cada teclado usa todo el ancho (apilados) para verse lo más grande posible
  const disp = useDisposicion();
  const an = calcAnchos(wrapWidth,leftBtns,rightBtns,view==="ambas",disp.lado,isMobile);

  if (!leftBtns.length) return <div style={{color:"#555",padding:20,fontSize:13}}>Cargando...</div>;

  if (editMode) return (
    <BandEditor initialLeft={leftBtns} initialRight={rightBtns} onSave={handleSave} onCancel={()=>setEditMode(false)}/>
  );

  const cardS={background:"#121214",border:"1px solid #26262a",borderRadius:12,padding:"12px 14px"};
  const tagTeclado={position:"absolute",top:2,left:6,zIndex:2,pointerEvents:"none",fontSize:9,letterSpacing:"0.12em",color:"#8a8a8a",fontFamily:UI_FONT};   // rótulo de la mano, adentro del teclado
  const vozProp={mano:vozMano,setMano:setVozMano,inv:vozInv,setInv:setVozInv,todas:vozTodas,setTodas:setVozTodas,res:vozRes,
    onMarcar:()=>setMarks(m=>({...m,[bellows]:vozRes.notas.map(n=>n.b)}))};

  const bPM = (<PanelMarcadas marcadas={marcadas} marcar={marcar} onRemove={quitarMark} onClear={()=>setMarks(m=>({...m,[bellows]:[]}))}/>);
  const bMic = (
          <div style={cardS}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
                <div style={{width:9,height:9,borderRadius:"50%",background:isListening?"#2dd4bf":"#2c2c30",boxShadow:isListening?"0 0 8px #2dd4bf":"none",flexShrink:0}}/>
                <div>
                  <p style={{...uiLabel,margin:0}}>Escucha física</p>
                  <p style={{fontSize:11,color:"#7c7c82",margin:"2px 0 0"}}>Tocá tu instrumento: las teclas con esas notas brillan en blanco.</p>
                </div>
              </div>
              <button onClick={()=>{setIsListening(p=>!p);setErrorAudio("");}} style={uiPlay(isListening,{padding:"6px 14px"})}>
                {isListening?"■ Apagar mic":"🎙️ Escuchar"}
              </button>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:10,alignItems:"flex-end"}}>
              <Desplegable ancho={104} etiqueta="Reconoce" valor={micModo} opciones={[["nota","Una nota"],["acorde","Acordes"]]} onChange={setMicModo}/>
              <Desplegable ancho={100} etiqueta="Mano" valor={micMano} opciones={[["ambas","Ambas"],["izq","Izquierda"],["der","Derecha"]]} onChange={setMicMano}/>
              <Desplegable ancho={72} etiqueta="Octava" valor={micOct} opciones={[[-1,"−1"],[0,"0"],[1,"+1"]]} onChange={v=>setMicOct(Number(v))}/>
              <Desplegable ancho={124} etiqueta="Teclas" valor={micExacta?"ex":"nom"} opciones={[["ex","Octava exacta"],["nom","Solo el nombre"]]} onChange={v=>setMicExacta(v==="ex")}/>
            </div>
            {isListening && (
              <div style={{marginTop:10,padding:"8px 10px",borderRadius:10,background:"#0e0e10",border:"1px solid #26262a",minHeight:36}}>
                {heardNotas.length===0
                  ? <span style={{fontSize:12,color:"#6a6a70"}}>Escuchando… tocá una nota sostenida.</span>
                  : <div style={{display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}>
                      {heardNotas.map(n=>{ const col=nc(CHROMATIC[n.pc]); return (<span key={n.m} style={{padding:"2px 9px",borderRadius:999,background:col,color:txtSobre(col),fontFamily:"'Libre Baskerville',serif",fontWeight:700,fontSize:13}}>{n.txt}</span>); })}
                      {heardAcorde && <b style={{marginLeft:6,fontFamily:"'Libre Baskerville',serif",fontSize:16,color:"#ececec"}}>{heardAcorde}</b>}
                    </div>}
              </div>)}
            {errorAudio&&<p style={{margin:"8px 0 0",fontSize:11,color:"#d98f88"}}>⚠ {errorAudio}</p>}
          </div>
  );
  const bMapa = (
          <details style={cardS}>
            <summary style={{cursor:"pointer",fontFamily:UI_FONT,fontSize:12,fontWeight:600,color:"#cfcfd4",letterSpacing:"0.03em"}}>
              Mapa de alturas · octavas de cada tecla
            </summary>
            <div style={{marginTop:12}}>
              <p style={{fontFamily:UI_FONT,fontSize:11,color:"#7c7c82",lineHeight:1.5,marginBottom:12}}>
                Las octavas siguen la numeración científica (Do4 es el Do central). Tocá una nota para oírla. Si una altura aparece repetida en dos teclas se marca con borde punteado.
              </p>
              <MapaAlturas btns={leftBtns}  bellows={bellows} titulo="Mano izquierda"/>
              <MapaAlturas btns={rightBtns} bellows={bellows} titulo="Mano derecha"/>
            </div>
          </details>
  );
  const bKbW = view==="ambas" ? Math.max(an.aL,an.aR) : view==="izquierda" ? an.aL : an.aR;
  // Teclados apilados: el teclado en el medio, a la izquierda Marcadas y Escucha, a la derecha el armador (que se desplaza solo)
  const bSideT = wrapWidth-bKbW-38, bSideL = Math.floor(bSideT*0.4);
  const bLateral = !isMobile && !an.fila && bSideT>=500;
  const bAsideL = {flex:"0 0 auto",width:bSideL,minWidth:0};
  const bAsideR = {flex:"0 0 auto",width:bSideT-bSideL,minWidth:0,alignSelf:"stretch"};
  // Armador: debajo de los teclados, a todo el ancho; abierto queda fijo abajo de la pantalla (o arriba, si va al costado)
  const bArm = (
    <ArmadorCompacto a={acorde} pegado={bLateral?"arriba":"abajo"}>
      <FormaSugerida tones={acorde.tones} leftBtns={leftBtns} rightBtns={rightBtns} bellows={bellows} voz={vozProp}/>
    </ArmadorCompacto>
  );

  return (
    <div style={{fontFamily:UI_FONT}}>

      {/* Barra de control: todo lo que cambia el teclado, en una sola fila */}
      <div style={{...cardS,display:"flex",gap:"6px 14px",flexWrap:"wrap",alignItems:"flex-end",marginBottom:6,padding:"6px 10px"}}>
        <GrupoCtl t="Fuelle">
          <div style={segS}>
            {[["abre","▷ Abre"],["cierra","◁ Cierra"]].map(([b,l])=>(
              <button key={b} style={uiVista(bellows===b,{padding:isMobile?"5px 10px":"5px 14px"})}
                onClick={()=>{stopAllNotes();setBellows(b);setPressedL([]);setPressedR([]);}}>{l}</button>
            ))}
          </div>
        </GrupoCtl>
        <GrupoCtl t="Teclado">
          <div style={segS}>
            {[["ambas","Ambas"],["izquierda","Izq."],["derecha","Der."]].map(([v,l])=>(
              <button key={v} style={uiVista(view===v,{padding:isMobile?"5px 8px":"5px 12px"})} onClick={()=>setView(v)}>{l}</button>
            ))}
          </div>
        </GrupoCtl>
        <GrupoCtl t="Disposición"><ControlesDisposicion d={disp} isMobile={isMobile}/></GrupoCtl>
        <GrupoCtl t="Notas">
          <div style={segS}>
            <button style={uiMarcar(marcar)} onClick={()=>{stopAllNotes();setPressedL([]);setPressedR([]);setMarcar(v=>!v);}}
              title="Con Marcar activo, tocar una tecla la agrega o la saca del acorde">◎ Marcar{marksB.length?` · ${marksB.length}`:""}</button>
            <button style={uiVista(false,{padding:isMobile?"5px 8px":"5px 12px"})} onClick={()=>{stopAllNotes();setPressedL([]);setPressedR([]);}} title="Soltar todas las teclas">✕ Soltar</button>
          </div>
        </GrupoCtl>
        {/* Lo que suena y el acorde detectado: altura fija, así el teclado no se mueve al tocar */}
        <div style={{flex:"1 1 220px",minWidth:200,height:44,overflow:"hidden",boxSizing:"border-box",display:"flex",flexWrap:"wrap",alignContent:"center",alignItems:"center",gap:"3px 5px",padding:"0 8px",borderRadius:10,background:"#0e0e10",border:"1px solid #26262a"}}>
          {(activeNotes.length>0||heardMidis.length>0) ? (<>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",flex:"1 1 auto"}}>
            {heardMidis.length>0&&(
              <span style={{padding:"2px 8px",borderRadius:20,background:"#2dd4bf22",border:"1px solid #2dd4bf",color:"#7ff0dd",fontWeight:700,fontSize:isMobile?10:11}}>
                🎙️ {heardTxt}{heardAcorde?" → "+heardAcorde:""}
              </span>
            )}
            {activeNotes.map(n=>{
              const notaPura = n.replace(/\d+$/,"");
              const oct      = (n.match(/\d+$/) || [""])[0];
              const engKey   = LAT[notaPura] || notaPura;
              return (
                <span key={n} style={{padding:"2px 8px",borderRadius:20,background:nc(engKey)+"22",border:`1px solid ${nc(engKey)}`,color:nc(engKey),fontWeight:700,fontSize:isMobile?10:11}}>
                  {notaPura}<span style={{fontSize:"0.75em",opacity:.7,marginLeft:1}}>{oct}</span>
                </span>
              );
            })}
          </div>
          {detected&&(
            <div style={{flexShrink:0,display:"flex",alignItems:"baseline",gap:6}}>
              <span style={{fontSize:9,color:"#7c7c82"}}>Acorde</span>
              <b style={{fontSize:16,fontWeight:900,color:"#e6e6e6",fontFamily:"serif"}}>{detected}</b>
            </div>
          )}
          </>) : <span style={{fontSize:10,color:"#55555b",letterSpacing:"0.04em"}}>Acá se ven las notas que suenan y el acorde</span>}
        </div>
      </div>

      {/* (lo que suena va adentro de la barra de arriba) */}

      {/* Teclados — se mide el ancho real disponible y se reparte entre los visibles */}
      <div ref={canvasWrapRef} style={bLateral?{display:"flex",gap:18,alignItems:"flex-start",paddingBottom:8,width:"100%",minWidth:0}:{
        display: "flex",
        flexDirection: an.fila ? "row" : (disp.invertir ? "column-reverse" : "column"),
        gap: an.gap,
        alignItems: an.fila ? "flex-start" : "center",
        paddingBottom: 4,
      }}>
        {bLateral && <aside style={bAsideL}><div style={{display:"flex",flexDirection:"column",gap:12}}>{bPM}{bMic}</div></aside>}
        <div style={bLateral?{display:"flex",flexDirection:disp.invertir?"column-reverse":"column",gap:an.gap,alignItems:"center",width:bKbW,flexShrink:0}:{display:"contents"}}>
        {(view==="ambas"||view==="izquierda")&&(
          <div style={{width: an.aL, flexShrink:0, position:"relative"}}>
            <span style={tagTeclado}>IZQ · {leftBtns.length}{isMobile?" · ↑ abre / cierra ↓":""}</span>
            <BandCanvas buttons={leftBtns} bellows={bellows}
              pressed={pressedL} heardIds={heardIdsL}
              onDown={downL} onUp={upL} mobile={isMobile}
              maxWidth={an.aL} maxScale={3.6} chordMap={chordMap} chordIds={chordIds} markIds={markIds}
              octMap={bellows==="abre" ? OCT_L_OPEN : OCT_L_CLOSE}/>
          </div>
        )}
        {(view==="ambas"||view==="derecha")&&(
          <div style={{width: an.aR, flexShrink:0, position:"relative"}}>
            <span style={tagTeclado}>DER · {rightBtns.length}</span>
            <BandCanvas buttons={rightBtns} bellows={bellows}
              pressed={pressedR} heardIds={heardIdsR}
              onDown={downR} onUp={upR} mobile={isMobile}
              maxWidth={an.aR} maxScale={3.6} chordMap={chordMap} chordIds={chordIds} markIds={markIds}
              octMap={bellows==="abre" ? OCT_R_OPEN : OCT_R_CLOSE}/>
          </div>
        )}
        </div>
        {bLateral && <aside style={bAsideR}>{bArm}</aside>}
      </div>

      {/* Paneles: al costado del teclado si hay lugar; si no, debajo en dos columnas */}
      {bLateral ? <div style={{marginTop:8}}>{bMapa}</div> : (<>
      <div style={{marginTop:8}}>{bArm}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",gap:12,alignItems:"start"}}>{bPM}{bMic}{bMapa}</div>
      </>)}

      {/* Teclado: edición e importación */}
      <div style={{...cardS,marginTop:12,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",padding:"9px 14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:6,flex:"1 1 auto"}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:fromStorage?"#e6e6e6":"#8a8a8a"}}/>
          <span style={{fontSize:11,color:"#8a8a8a",fontFamily:UI_FONT}}>
            {fromStorage?"Configuración personalizada del teclado":"Configuración por defecto del teclado"} · Sistema Rheinische, 71 botones, bisonoro
          </span>
        </div>
        <button onClick={()=>{stopAllNotes();setIsListening(false);setEditMode(true);}} style={uiPill(false,{padding:"5px 13px"})}>✏️ Editar teclado</button>
        <button onClick={()=>setShowImport(true)} style={uiPill(false,{padding:"5px 13px"})}>↑ Importar CSV</button>
        {fromStorage&&(
          <button
            onClick={()=>{clearBtns();const{left,right}=loadBtns();setLeftBtns(left);setRightBtns(right);setFromStorage(false);}}
            style={uiPill(false,{padding:"5px 12px"})}>
            ⟳ Valores por defecto
          </button>
        )}
      </div>

      {showSaved&&<SavedModal cssText={cssText} onClose={()=>setShowSaved(false)}/>}
      {showImport&&<ImportModal onImport={handleImport} onClose={()=>setShowImport(false)}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── EL CÓDIGO — Manual de teoría musical a través del color ─────────────────
// Contenido íntegro del manual del sistema de color (Toromboto), organizado
// en capítulos navegables. Es la puerta de entrada a toda la app: todo lo
// demás (piano, acordes, bandoneón, círculo de quintas) usa esta paleta.
// ═══════════════════════════════════════════════════════════════════════════
