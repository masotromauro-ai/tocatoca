import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { YIN } from "pitchfinder";
import { CHROMATIC, LAT, buildScale, enh, nombreLat, noteIdx, spell } from "./shared/teoria/notas.js";
import { NC, hexToRgb, mixLuzRaizDominante, nc, rgbToHex } from "./shared/teoria/color.js";
import { UI_FONT, uiGhost, uiLabel, uiMarcar, uiPill, uiPlay, uiTool, uiVista } from "./shared/ui/tema.js";
import { getCtx, playBand, playBandDur, playChord, playClick, playTone } from "./shared/audio/audio.js";
import { COF, DN, DQ, MODE_BY_DEGREE, MSI, tNote } from "./shared/teoria/escalas.js";
import { FORMULAS, GRUPOS_ACORDE, QUAL_TXT, buildVoicing, getFns, parseChord } from "./shared/teoria/acordes.js";
import { ES_MENORQ, FAMILIAS, QBASE, SUF_CORTO, SUF_ES, TONICAS_MAYOR, TONICAS_MENOR, acordesDeNotas, acordesDiatonicos, computeProg, dondeVive, nombreAcordeEs, raizDefecto, romSept, romTri } from "./shared/teoria/progresiones.js";
import { BIBLIOTECA } from "./features/herramientas/biblioteca/datos.js";
import { OCT_C, itemsMano } from "./shared/bandoneon/tablas.js";
import { PATRONES_VOZ, ROL_TXT, voicingsDe } from "./shared/bandoneon/voicings.js";
import { Nota, NotaDot, TensionChip, fmtNota } from "./shared/ui/teoria/notas.jsx";
import { FnCard, TablaComparativa } from "./shared/ui/teoria/Funciones.jsx";
import { Circulo } from "./shared/ui/teoria/Circulo.jsx";
import { BTN_SIZE, buildOctMaps } from "./shared/bandoneon/layouts.js";
import { STORAGE_KEY_L, clearBtns, loadBtns, saveBtns } from "./shared/bandoneon/almacen.js";
import { downloadCSV, generateCSS } from "./shared/bandoneon/csv.js";
import { BandCanvas, MapaAlturas } from "./shared/bandoneon/Teclado.jsx";
import { ImportModal, SavedModal } from "./shared/bandoneon/Modales.jsx";
import { BandEditor } from "./shared/bandoneon/Editor.jsx";
import { cifEstilo, cifGuardarPropios, cifPropios } from "./shared/almacen/preferencias.js";
import { RAIZ_NOM, analizarAcorde } from "./shared/teoria/cifrado.js";
import { micEstimar } from "./shared/audio/mic.js";
import { GrupoCtl, PanelMarcadas, segS } from "./shared/ui/controles.jsx";
import { ESC_ENT, FIGURAS, VOZ_RAICES, armarVoz, caminoArpegio, caminoEscala, caminoNotas, octDeMidi, rutaEscala, vozCifrar, vozLeer } from "./shared/bandoneon/camino.js";
import { PaintCanvas } from "./features/entrenador/ayudas/lienzo.jsx";
import { Desplegable, GrupoMini, LeyendaCamino, NotaPicker, Seccion, SelectoresAcorde } from "./shared/ui/ayudas.jsx";
import { FORMA_NIVELES, FORMA_TOL, FormaCanvas, LIN_COLS, LIN_TEXTO, LIN_TIPOS, lineasDe, matchForma } from "./features/entrenador/ayudas/formas.jsx";
import { ACORDE_BASES, ACORDE_INI, ACORDE_NOV, ACORDE_RAICES, ACORDE_SEPT, ACORDE_TRE, ACORDE_UND } from "./shared/bandoneon/acordes-base.js";
import { CROM_SIMPLE, GRADO_LABEL, txtSobre } from "./shared/teoria/etiquetas.js";
import { PopoverAnclado } from "./shared/ui/Popover.jsx";
import { ElCodigoTab, HojaDeColor } from "./features/codigo/ElCodigoTab.jsx";
import { CirculoQuintas } from "./features/herramientas/quintas/CirculoQuintas.jsx";
import { medirLote } from "./shared/medicion.js";
import { inpS, nomDedo, registrar } from "./features/clases/org.jsx";
import { OrganizadorTab } from "./features/clases/OrganizadorTab.jsx";
import { MisTareasTab } from "./features/clases/MisTareasTab.jsx";
import { DondeVive, ModosTab } from "./features/herramientas/modos/ModosTab.jsx";
import { ColoresTab } from "./features/herramientas/colores/ColoresTab.jsx";
import { TeoriaTab } from "./features/teoria/TeoriaTab.jsx";
import { aRomano } from "./shared/teoria/romanos.js";
import { calcAcorde } from "./shared/bandoneon/acorde.js";
import { useRomanos } from "./shared/almacen/romanos.js";
import { ESCALAS_HERO } from "./shared/ui/codigo/paleta.jsx";

function useAcorde(romano=false,setRomano=()=>{}){
  const [ac,setAc]     = useState(ACORDE_INI);
  const [open,setOpen] = useState(false);
  const set   = (k,v)=>setAc(p=>({...p,[k]:v}));
  const reset = ()=>setAc(ACORDE_INI);
  const setAll = (obj)=>setAc({...ACORDE_INI,...obj});
  const calc = useMemo(()=>calcAcorde(ac,romano),[ac,romano]);
  return {ac,set,reset,setAll,open,setOpen,romano,setRomano,...calc,key:JSON.stringify(ac)};
}

const tocarAcordeBand = (A)=>{
  A.tones.forEach((t,i)=>{
    const a = A.rootIdx + t.iv + (t.up?12:0);
    setTimeout(()=>playBand(CHROMATIC[a%12], 3+Math.floor(a/12)), i*35);
  });
};

function ArmadorAcordes({ a, collapsible=true, children }){
  const UI={bg:"#121212",line:"#2a2a2a",text:"#e6e6e6",mute:"#8a8a8a"};
  const pill=(on)=>uiPill(on);
  const Fila=({titulo,list,campo})=>(
    <div className="mb-3">
      <p style={{fontSize:10,letterSpacing:"0.14em",color:UI.mute,textTransform:"uppercase",marginBottom:6}}>{titulo}</p>
      <div className="flex flex-wrap gap-1.5">
        {list.map(o=>(<button key={o.id} style={pill(a.ac[campo]===o.id)} onClick={()=>a.set(campo,o.id)}>{o.label}</button>))}
      </div>
    </div>
  );
  const abierto = !collapsible || a.open;
  return(
    <div className="rounded-xl mb-3" style={{background:UI.bg,border:`1px solid ${UI.line}`,padding:"10px 12px"}}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div style={{minWidth:0}}>
          <p style={{fontSize:10,letterSpacing:"0.14em",color:UI.mute,textTransform:"uppercase"}}>🎼 Armar acorde</p>
          {(abierto||!collapsible) ? null : <p style={{fontSize:12,color:UI.text,marginTop:2}}>{a.name}</p>}
        </div>
        {collapsible && (
          <button onClick={()=>a.setOpen(!a.open)} style={{...pill(a.open),padding:"5px 12px"}}>{a.open?"Ocultar":"Abrir"}</button>
        )}
      </div>

      {abierto && (
        <div className="mt-3">
          <div className="mb-3">
            <p style={{fontSize:10,letterSpacing:"0.14em",color:UI.mute,textTransform:"uppercase",marginBottom:6}}>1 · Fundamental</p>
            <div className="flex flex-wrap gap-1.5">
              {ACORDE_RAICES.map(x=>(<button key={x} style={pill(a.ac.root===x)} onClick={()=>a.set("root",x)}>{nombreLat(x)}</button>))}
            </div>
          </div>
          <Fila titulo="2 · Tipo de acorde" list={ACORDE_BASES} campo="base"/>
          <Fila titulo="3 · Séptima" list={ACORDE_SEPT} campo="sept"/>
          <div className="grid sm:grid-cols-3 gap-x-4">
            <Fila titulo="4 · Novena" list={ACORDE_NOV} campo="nov"/>
            <Fila titulo="Oncena" list={ACORDE_UND} campo="und"/>
            <Fila titulo="Trecena" list={ACORDE_TRE} campo="tre"/>
          </div>
          <div className="mb-3">
            <p style={{fontSize:10,letterSpacing:"0.14em",color:UI.mute,textTransform:"uppercase",marginBottom:6}}>Extras</p>
            <div className="flex flex-wrap gap-1.5">
              <button style={pill(a.ac.seis)} onClick={()=>a.set("seis",!a.ac.seis)}>Sexta (6)</button>
              <button style={pill(a.ac.sin5)} onClick={()=>a.set("sin5",!a.ac.sin5)}>Sin quinta</button>
              <button style={{...pill(false),marginLeft:"auto"}} onClick={a.reset}>⟳ Limpiar</button>
            </div>
          </div>

          {/* Resultado */}
          <div style={{borderTop:`1px solid ${UI.line}`,paddingTop:10}}>
            <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
              <p style={{fontSize:14,fontFamily:"'Libre Baskerville',serif",fontWeight:700,color:UI.text}}>{a.name}</p>
              <button onClick={()=>tocarAcordeBand(a)} style={uiPlay(false,{padding:"7px 14px"})}>▶ Tocar acorde</button>
            </div>
            <div className="flex gap-1.5 mb-2 items-center">
              <span style={{fontSize:10,letterSpacing:"0.14em",color:UI.mute,textTransform:"uppercase",marginRight:4}}>Función</span>
              <button style={pill(a.romano)} onClick={()=>a.setRomano(true)}>I · III · V</button>
              <button style={pill(!a.romano)} onClick={()=>a.setRomano(false)}>1 · 3 · 5</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {a.tones.map(t=>(
                <div key={t.pc} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                  <div style={{width:44,height:44,borderRadius:10,background:nc(t.pc),border:"2px solid rgba(255,255,255,.2)",display:"flex",alignItems:"center",justifyContent:"center",
                    color:txtSobre(nc(t.pc)),fontFamily:"serif",fontWeight:900,fontSize:13}}>{t.nombre}</div>
                  <span style={{fontSize:10,fontFamily:"monospace",color:UI.mute}}>{t.lab}</span>
                </div>
              ))}
            </div>
          </div>
          {children}
        </div>
      )}
    </div>
  );
}

// Voicing recomendado sobre el teclado real (alturas del CSV).
// Mano izquierda: bajo (fundamental más grave) + 7ª justo encima + resto del acorde desde el Do3.
// Mano derecha: las notas del acorde en orden ascendente desde el Do3; la inversión rota qué nota va abajo.
function armarVoicing(btns, bellows, tones, mano, inv){
  const items=itemsMano(btns,bellows), DO3=48;
  const occ=(pc)=>{ const n=typeof pc==="number"?pc:noteIdx(pc); return items.filter(i=>i.pc===n).sort((a,b)=>a.midi-b.midi); };
  const mk=(it,t,rol)=>({pc:it.pc,oct:it.oct,midi:it.midi,b:it.b.id,esc:t.esc,nombre:t.nombre,lab:t.lab,rol});
  const out=[], faltan=[], es7=(t)=>["b7","7","bb7"].includes(t.raw);
  const raiz=tones[0]; if(!raiz) return {notas:[],faltan:[]};
  let piso=-1;
  const poner=(lista,primeroDesde)=>{ let prev=-1; lista.forEach((t,idx)=>{
      const c=occ(t.pc); const hit = idx===0 ? (c.find(i=>i.midi>=primeroDesde&&i.midi>piso)||c.find(i=>i.midi>piso)) : c.find(i=>i.midi>prev);
      if(hit){ out.push(mk(hit,t,t.lab)); prev=hit.midi; } else faltan.push(t.nombre+" ("+t.lab+")"); }); };
  if(mano==="izq"){
    const r=occ(raiz.pc)[0];
    if(r){ out.push(mk(r,raiz,"Bajo")); piso=r.midi; } else faltan.push(raiz.nombre+" (bajo)");
    const s=tones.find(es7);
    if(s){ const c=occ(s.pc).find(i=>i.midi>piso); if(c){ out.push(mk(c,s,"7ª")); piso=Math.max(piso,c.midi); } else faltan.push(s.nombre+" (7ª)"); }
    let U=tones.filter(t=>t!==raiz&&!es7(t)); const k=U.length?inv%U.length:0; U=[...U.slice(k),...U.slice(0,k)];
    poner(U,DO3);
  } else {
    let T=[...tones]; const k=T.length?inv%T.length:0; T=[...T.slice(k),...T.slice(0,k)];
    poner(T,DO3);
  }
  return {notas:out,faltan};
}
const octLista=(items,pc)=>{ const n=typeof pc==="number"?pc:noteIdx(pc); const m={}; items.filter(i=>i.pc===n).forEach(i=>{ m[i.oct]=(m[i.oct]||0)+1; });
  return Object.keys(m).map(Number).sort((a,b)=>a-b).map(o=>m[o]>1?`${o}×${m[o]}`:String(o)).join(" · "); };

// Dónde está cada nota del acorde (por octava) y cómo armarlo
function DisponibilidadAcorde({ tones, leftBtns, rightBtns, bellows, voz }){
  const cols=[["izq","abre","IZQ ▷",leftBtns],["izq","cierra","IZQ ◁",leftBtns],["der","abre","DER ▷",rightBtns],["der","cierra","DER ◁",rightBtns]];
  const itemsDe={}; cols.forEach(c=>{ itemsDe[c[0]+c[1]]=itemsMano(c[3],c[1]); });
  const sec={fontSize:10,letterSpacing:"0.14em",color:"#8a8a8a",textTransform:"uppercase",marginBottom:8,fontWeight:600,fontFamily:UI_FONT};
  const peq=(on)=>uiPill(on,{padding:"4px 10px",fontSize:11});
  return(
    <div className="mt-3" style={{borderTop:"1px solid #2a2a2a",paddingTop:10}}>
      <p style={sec}>Dónde está cada nota (octavas disponibles)</p>
      <div className="overflow-x-auto">
        <table style={{borderCollapse:"collapse",fontSize:12,fontFamily:"monospace",width:"100%"}}>
          <thead><tr>
            <th style={{textAlign:"left",padding:"3px 6px",color:"#8a8a8a",fontWeight:600}}>Nota</th>
            {cols.map(c=>(<th key={c[2]} style={{padding:"3px 6px",color:c[1]===bellows?"#e6e6e6":"#555",fontWeight:700}}>{c[2]}</th>))}
          </tr></thead>
          <tbody>
            {tones.map(t=>(
              <tr key={t.pc} style={{borderTop:"1px solid #1a1a1a"}}>
                <td style={{padding:"4px 6px",whiteSpace:"nowrap"}}><NotaDot note={t.esc} size={20}/> <span style={{color:"#8a8a8a",marginLeft:4}}>{t.lab}</span></td>
                {cols.map(c=>{ const l=octLista(itemsDe[c[0]+c[1]],t.pc); return(
                  <td key={c[2]} style={{textAlign:"center",padding:"4px 6px",color:l?(c[1]===bellows?"#e6e6e6":"#8a8a8a"):"#444"}}>{l||"—"}</td>
                );})}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{fontSize:10,color:"#555",margin:"6px 0 12px",lineHeight:1.5}}>Los números son las octavas donde existe esa nota (2×3 = dos teclas en la octava 3). Columna clara = fuelle actual.</p>

      {voz && (<>
        <p style={sec}>Cómo armarlo · voicing recomendado</p>
        <div className="flex flex-wrap gap-1.5 mb-2 items-center">
          <span style={{fontSize:11,color:"#8a8a8a",marginRight:4}}>Mano</span>
          <button style={peq(voz.mano==="izq")} onClick={()=>{voz.setMano("izq");voz.setInv(0);}}>Izquierda</button>
          <button style={peq(voz.mano==="der")} onClick={()=>{voz.setMano("der");voz.setInv(0);}}>Derecha</button>
          <span style={{width:10}}/>
          <span style={{fontSize:11,color:"#8a8a8a",marginRight:4}}>Inversión</span>
          {["Fundamental","1ª","2ª","3ª"].slice(0,Math.max(2,Math.min(4,tones.length))).map((l,i)=>(<button key={i} style={peq(voz.inv===i)} onClick={()=>voz.setInv(i)}>{l}</button>))}
        </div>
        {voz.res.notas.length>0 ? (
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:8}}>
            {voz.res.notas.map((n,i)=>(
              <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,minWidth:58,padding:"6px 6px 5px",borderRadius:10,background:"#0e0e10",border:"1px solid #26262a"}}>
                <NotaDot note={n.esc} size={30}/>
                <span style={{fontFamily:"'Libre Baskerville',serif",fontWeight:700,fontSize:13,color:"#ececec"}}>{n.nombre}{n.oct}</span>
                <span style={{fontSize:10,color:"#a0a0a6"}}>{n.rol}</span>
                <span style={{fontSize:9,fontFamily:"monospace",color:"#6a6a70"}}>tecla {n.b}</span>
              </div>
            ))}
          </div>
        ) : <p style={{fontSize:12,color:"#c9a25a",margin:"0 0 8px"}}>Con este fuelle y esta mano no hay notas del acorde para armar.</p>}
        {voz.res.faltan.length>0 && <p style={{fontSize:11.5,color:"#c9a25a",margin:"0 0 8px"}}>⚠ No hay en esta mano y con este fuelle: {voz.res.faltan.join(", ")}. Probá el otro sentido del fuelle, la otra mano u otra inversión.</p>}
        <div className="flex flex-wrap gap-1.5 items-center">
          <button style={uiPlay(false,{padding:"6px 14px"})} onClick={()=>voz.res.notas.forEach((n,i)=>setTimeout(()=>playBand(CHROMATIC[n.pc],n.oct),i*45))}>▶ Tocar este voicing</button>
          <button style={uiPill(voz.solo,{padding:"6px 14px"})} onClick={()=>voz.setSolo(!voz.solo)}>{voz.solo?"Mostrando solo estas teclas":"Resaltar solo estas teclas"}</button>
          {voz.onMarcar && voz.res.notas.length>0 && <button style={uiMarcar(false)} onClick={voz.onMarcar} title="Pasa estas notas a Notas marcadas, para escucharlas y modificarlas sobre el teclado">◎ Marcar estas teclas</button>}
        </div>
        <p style={{fontSize:10.5,color:"#6a6a70",margin:"8px 0 0",lineHeight:1.5}}>
          {voz.mano==="izq" ? "Mano izquierda: el bajo es la fundamental más grave; la séptima va justo encima y el resto del acorde desde el Do3. Ejemplo: La menor = La1 (bajo) + Do3 + Mi3; con séptima, Sol2 entre el bajo y el Do3."
                            : "Mano derecha: las notas del acorde de abajo hacia arriba desde el Do3. Cada inversión pone una nota distinta en la base."}
        </p>
      </>)}
    </div>
  );
}

// Mide el ancho real de un contenedor aunque aparezca después (p. ej. tras cargar los botones).
function useAnchoMedido(){
  const [w,setW]=useState(0);
  const roRef=useRef(null);
  const ref=useCallback((el)=>{
    if(roRef.current){ roRef.current.disconnect(); roRef.current=null; }
    if(!el) return;
    const upd=()=>setW(Math.floor(el.getBoundingClientRect().width)||el.clientWidth||0);
    upd();
    if(typeof ResizeObserver!=="undefined"){ const ro=new ResizeObserver(upd); ro.observe(el); roRef.current=ro; }
  },[]);
  return [ref,w];
}

// ─── DISPOSICIÓN DE LOS TECLADOS: lado a lado (izquierda a la izquierda) o apilados ─────────
const anchoMano = (btns)=> btns.length ? Math.max(...btns.map(b=>b.x))+BTN_SIZE+16 : 740;
function useDisposicion(){
  const [lado,setLadoS]=useState(()=>{ try{ return localStorage.getItem("bandomaps_lado")!=="0"; }catch(e){ return true; } });
  const setLado=(v)=>{ setLadoS(v); try{ localStorage.setItem("bandomaps_lado",v?"1":"0"); }catch(e){} };
  const [full,setFull]=useState(false);
  const [invertir,setInvertirS]=useState(()=>{ try{ return localStorage.getItem("bandomaps_invertir")==="1"; }catch(e){ return false; } });
  const setInvertir=(v)=>{ setInvertirS(v); try{ localStorage.setItem("bandomaps_invertir",v?"1":"0"); }catch(e){} };
  useEffect(()=>{
    const f=()=>setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange",f);
    return ()=>document.removeEventListener("fullscreenchange",f);
  },[]);
  const toggleFull=()=>{ try{ if(document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen(); }catch(e){} };
  return {lado,setLado,full,toggleFull,invertir,setInvertir};
}
// Con ambos teclados y modo "lado a lado", los dos usan la misma escala y llenan todo el ancho.
function calcAnchos(wrapWidth,L,R,ambas,lado,isMobile){
  const gap=14, WL=anchoMano(L), WR=anchoMano(R), k=(wrapWidth-gap)/(WL+WR);
  if(ambas && lado && !isMobile) return {fila:true,gap,aL:Math.floor(WL*k),aR:Math.floor(WR*k)};
  if(isMobile) return {fila:false,gap:18,aL:wrapWidth,aR:wrapWidth};
  // Apilados (o una sola mano): apenas más grandes que lado a lado, sin ocupar todo el ancho
  const f=1.15;
  return {fila:false,gap:18,aL:Math.min(wrapWidth,Math.floor(WL*k*f)),aR:Math.min(wrapWidth,Math.floor(WR*k*f))};
}
function ControlesDisposicion({d,isMobile}){
  const on=(v)=>uiVista(v);
  return(
    <div style={{display:"flex",background:"#121212",border:"1.5px solid #333333",borderRadius:10,padding:3,gap:2}}>
      {!isMobile && <button style={on(d.lado)} onClick={()=>d.setLado(true)} title="Izquierda a la izquierda, derecha a la derecha">◫ Lado a lado</button>}
      {!isMobile && <button style={on(!d.lado)} onClick={()=>d.setLado(false)} title="Uno debajo del otro, más grandes">☰ Apilados</button>}
      {(isMobile||!d.lado) && <button style={on(d.invertir)} onClick={()=>d.setInvertir(!d.invertir)} title="Apilados: derecha arriba e izquierda abajo">⇅ Derecha arriba</button>}
      <button style={on(d.full)} onClick={d.toggleFull} title="Usa toda la pantalla">{d.full?"⛶ Salir":"⛶ Pantalla completa"}</button>
    </div>
  );
}

function BandoneonTab() {
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
  const activeAudioRef = useRef({}); // { [btnId]: {gainMain, oscs[]} }
  const MIDI_B={C:60,"C#":61,D:62,"D#":63,E:64,F:65,"F#":66,G:67,"G#":68,A:69,"A#":70,B:71};

  const startNote = useCallback((id, eng, oct)=>{
    try{
      const ctx=getCtx();if(!ctx)return;
      if(ctx.state==="suspended")ctx.resume();
      if(activeAudioRef.current[id]) return; // ya está sonando (evita doble-disparo)
      // Altura científica: Do4 = 60 (Do central). midi = 12·(octava+1) + semitono
      const midi=(MIDI_B[eng]??60)+(oct-4)*12;
      const freq=440*Math.pow(2,(midi-69)/12);
      const gainMain=ctx.createGain();
      gainMain.gain.setValueAtTime(0,ctx.currentTime);
      gainMain.gain.linearRampToValueAtTime(1,ctx.currentTime+0.012); // ataque breve, sin click
      gainMain.connect(ctx.destination);
      // En las notas graves se refuerzan los armónicos para que se oigan también en parlantes chicos
      const grave = freq<140;
      const parciales = grave ? [1,2,3,4,5,6] : [1,2,3];
      const ganancias = grave ? [0.20,0.16,0.12,0.09,0.06,0.04] : [0.22,0.10,0.05];
      const oscs=parciales.map((h,i)=>{
        const osc=ctx.createOscillator(),g=ctx.createGain();
        osc.type="sawtooth";
        osc.frequency.value=freq*h;
        g.gain.value=ganancias[i];
        osc.connect(g);g.connect(gainMain);
        osc.start();
        return osc;
      });
      activeAudioRef.current[id]={gainMain,oscs};
    }catch(e){}
  },[]);

  const stopNote = useCallback((id)=>{
    const n=activeAudioRef.current[id];
    if(!n)return;
    try{
      const ctx=getCtx();if(!ctx)return;
      const t=ctx.currentTime;
      n.gainMain.gain.cancelScheduledValues(t);
      n.gainMain.gain.setValueAtTime(n.gainMain.gain.value,t);
      n.gainMain.gain.linearRampToValueAtTime(0.0001,t+0.09); // release corto, natural
      n.oscs.forEach(o=>o.stop(t+0.11));
    }catch(e){}
    delete activeAudioRef.current[id];
  },[]);

  const stopAllNotes = useCallback(()=>{
    Object.keys(activeAudioRef.current).forEach(stopNote);
  },[stopNote]);

  // Corta todo lo que esté sonando si el componente se desmonta
  useEffect(()=>()=>stopAllNotes(),[stopAllNotes]);

  // ─── Escucha física: varias notas a la vez, acotadas a lo que el teclado puede producir ───
  const micCandsH=useMemo(()=>{
    const set=new Set(), add=(btns)=>btns.forEach(b=>{ const lat=bellows==="abre"?b.abre:b.cierra, pc=noteIdxB(LAT[lat]||lat); if(pc<0) return; set.add(12*(getOct(b,bellows)+1)+pc-12*micOct); });
    if(micMano!=="der") add(leftBtns); if(micMano!=="izq") add(rightBtns); return set;
  },[leftBtns,rightBtns,bellows,micMano,micOct,getOct]);
  const micRef=useRef({}); micRef.current={modo:micModo,cands:micCandsH,shift:micOct};
  useEffect(()=>{
    if(!isListening){ setHeardMidis([]); return; }
    let audioCtx=null, stream=null, rafId=null, alive=true, ultimo=0; const hist=[];
    async function start(){
      try{
        // sin control automático de ganancia, supresión de ruido ni cancelación de eco: alteran el sonido sostenido
        stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false},video:false});
        if(!alive){ stream.getTracks().forEach(t=>t.stop()); return; }
        const AC=window.AudioContext||window.webkitAudioContext; audioCtx=new AC();
        if(audioCtx.state==="suspended") await audioCtx.resume();
        if(!alive){ audioCtx.close(); stream.getTracks().forEach(t=>t.stop()); return; }
        const src=audioCtx.createMediaStreamSource(stream), analyser=audioCtx.createAnalyser();
        analyser.fftSize=16384; analyser.smoothingTimeConstant=0.3; analyser.minDecibels=-110; analyser.maxDecibels=-5;
        src.connect(analyser);
        const N=analyser.fftSize, db=new Float32Array(N/2), mag=new Float32Array(N/2);
        function tick(t){
          if(!alive) return;
          rafId=requestAnimationFrame(tick);
          if(t-ultimo<70) return; ultimo=t;
          analyser.getFloatFrequencyData(db);
          for(let i=0;i<db.length;i++) mag[i]=Math.pow(10,db[i]/20);
          const {modo,cands,shift}=micRef.current;
          hist.push(micEstimar(mag,audioCtx.sampleRate,N,cands,modo==="nota"?1:5)); if(hist.length>6) hist.shift();
          const cuenta=new Map(); hist.forEach(a=>a.forEach(m=>cuenta.set(m,(cuenta.get(m)||0)+1)));
          const necesito=Math.min(4,Math.ceil(hist.length*0.6));
          const fin=[...cuenta].filter(([,c])=>c>=necesito).map(([m])=>m+12*shift).sort((x,y)=>x-y);
          setHeardMidis(prev=>(prev.length===fin.length&&prev.every((v,i)=>v===fin[i]))?prev:fin);
        }
        rafId=requestAnimationFrame(tick);
      }catch(err){
        if(alive){ setErrorAudio("Error de micrófono: "+(err?.message??"permisos denegados")); setIsListening(false); }
      }
    }
    start();
    return()=>{ alive=false; if(rafId) cancelAnimationFrame(rafId); if(stream) stream.getTracks().forEach(t=>t.stop()); if(audioCtx&&audioCtx.state!=="closed") audioCtx.close(); };
  },[isListening]);
  const heardPcs=useMemo(()=>new Set(heardMidis.map(m=>((m%12)+12)%12)),[heardMidis]);
  const heardIdsDe=(btns)=>{
    if(!heardMidis.length) return [];
    return btns.filter(b=>{ const lat=bellows==="abre"?b.abre:b.cierra, pc=noteIdxB(LAT[lat]||lat); if(pc<0) return false;
      return micExacta ? heardMidis.includes(12*(getOct(b,bellows)+1)+pc) : heardPcs.has(pc); }).map(b=>b.id);
  };
  const heardIdsL=useMemo(()=>micMano==="der"?[]:heardIdsDe(leftBtns),[heardMidis,micExacta,micMano,bellows,leftBtns,getOct]);
  const heardIdsR=useMemo(()=>micMano==="izq"?[]:heardIdsDe(rightBtns),[heardMidis,micExacta,micMano,bellows,rightBtns,getOct]);
  const heardAn=(micModo==="acorde"&&heardPcs.size>=2)?analizarAcorde([...heardPcs],((heardMidis[0]%12)+12)%12,{}):null;
  const heardNotas=heardMidis.map(m=>{ const pc=((m%12)+12)%12; return {m,txt:((heardAn&&heardAn.nombres&&heardAn.nombres[pc])||nombreLat(RAIZ_NOM[pc]))+(Math.floor(m/12)-1),pc}; });
  const heardAcorde=heardAn?heardAn.nombre:null;
  const heardTxt=heardNotas.map(n=>n.txt).join(" · ");

  // ─── MARCAR: elegir notas sobre el teclado para armar un acorde ───────────
  const [marcar,setMarcar]=useState(false);
  const [marks,setMarks]=useState({abre:[],cierra:[]});
  const marksB=marks[bellows];
  const toggleMark=useCallback((btn)=>{
    setMarks(m=>{ const cur=m[bellows]; return {...m,[bellows]:cur.includes(btn.id)?cur.filter(x=>x!==btn.id):[...cur,btn.id]}; });
  },[bellows]);
  const quitarMark=useCallback((id)=>setMarks(m=>({...m,[bellows]:m[bellows].filter(x=>x!==id)})),[bellows]);
  const marcadas=useMemo(()=>{
    const all=[...leftBtns,...rightBtns];
    return marksB.map((id,k)=>{ const b=all.find(x=>x.id===id); if(!b) return null;
      const lat=bellows==="abre"?b.abre:b.cierra, pc=noteIdxB(LAT[lat]||lat), oct=getOct(b,bellows);
      return {id,orden:k+1,pc,oct,midi:12*(oct+1)+pc,mano:id.startsWith("L")?"Izq.":"Der."};
    }).filter(x=>x&&x.pc>=0);
  },[marksB,bellows,leftBtns,rightBtns,getOct]);
  const markIds=useMemo(()=>marksB.length?Object.fromEntries(marksB.map((id,k)=>[id,k+1])):null,[marksB]);
  const marcarTecla=(btn)=>{ const note=bellows==="abre"?btn.abre:btn.cierra; playBandDur(note,getOct(btn,bellows),0.6); toggleMark(btn); };

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
  const [vozMano,setVozMano]=useState("izq"), [vozInv,setVozInv]=useState(0), [vozSolo,setVozSolo]=useState(false);
  const vozRes = useMemo(()=> acorde.open && leftBtns.length ? armarVoicing(vozMano==="izq"?leftBtns:rightBtns, bellows, acorde.tones, vozMano, vozInv) : {notas:[],faltan:[]}, [acorde.open,acorde.key,acorde.romano,leftBtns,rightBtns,bellows,vozMano,vozInv]);
  const chordIds = (acorde.open && vozSolo) ? Object.fromEntries(vozRes.notas.map(n=>[n.b,n.lab])) : null;
  const chordMap = acorde.open ? acorde.labelByPc : null;
  const canvasMaxWidth = wrapWidth; // cada teclado usa todo el ancho (apilados) para verse lo más grande posible
  const disp = useDisposicion();
  const an = calcAnchos(wrapWidth,leftBtns,rightBtns,view==="ambas",disp.lado,isMobile);

  if (!leftBtns.length) return <div style={{color:"#555",padding:20,fontSize:13}}>Cargando...</div>;

  if (editMode) return (
    <BandEditor initialLeft={leftBtns} initialRight={rightBtns} onSave={handleSave} onCancel={()=>setEditMode(false)}/>
  );

  const cardS={background:"#121214",border:"1px solid #26262a",borderRadius:12,padding:"12px 14px"};
  const vozProp={mano:vozMano,setMano:setVozMano,inv:vozInv,setInv:setVozInv,solo:vozSolo,setSolo:setVozSolo,res:vozRes,
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
  const bArm = (
        <ArmadorAcordes a={acorde}>
          <DisponibilidadAcorde tones={acorde.tones} leftBtns={leftBtns} rightBtns={rightBtns} bellows={bellows} voz={vozProp}/>
        </ArmadorAcordes>
  );
  const bKbW = view==="ambas" ? Math.max(an.aL,an.aR) : view==="izquierda" ? an.aL : an.aR;
  const bSideW = Math.floor((wrapWidth-bKbW-36)/2);
  const bLateral = !isMobile && !an.fila && bSideW>=220;
  const bAsideS = {flex:"1 1 0",minWidth:0};

  return (
    <div style={{fontFamily:UI_FONT}}>

      {/* Barra de control: todo lo que cambia el teclado, en una sola fila */}
      <div style={{...cardS,display:"flex",gap:"10px 18px",flexWrap:"wrap",alignItems:"flex-end",marginBottom:12,padding:"10px 14px"}}>
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
        <GrupoCtl t="Marcar notas">
          <div style={segS}>
            <button style={uiMarcar(marcar)} onClick={()=>{stopAllNotes();setPressedL([]);setPressedR([]);setMarcar(v=>!v);}}
              title="Con Marcar activo, tocar una tecla la agrega o la saca del acorde">◎ Marcar{marksB.length?` · ${marksB.length}`:""}</button>
          </div>
        </GrupoCtl>
        <button onClick={()=>{stopAllNotes();setPressedL([]);setPressedR([]);}} title="Soltar todas las teclas"
          style={{...uiGhost,marginLeft:"auto"}}>✕ Soltar</button>
      </div>

      {/* Notas que suenan + acorde detectado — altura fija para no desplazar el teclado */}
      <div style={{minHeight:40,marginBottom:6}}>
      {(activeNotes.length>0||heardMidis.length>0)&&(
        <div style={{padding:isMobile?"6px 10px":"6px 12px",background:"#121214",border:"1px solid #26262a",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:5}}>
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
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:8,color:"#7c7c82"}}>Acorde</div>
              <div style={{fontSize:isMobile?17:20,fontWeight:900,color:"#e6e6e6",fontFamily:"serif"}}>{detected}</div>
            </div>
          )}
        </div>
      )}
      </div>

      {/* Teclados — se mide el ancho real disponible y se reparte entre los visibles */}
      <div ref={canvasWrapRef} style={bLateral?{display:"flex",gap:18,alignItems:"flex-start",paddingBottom:8,width:"100%",minWidth:0}:{
        display: "flex",
        flexDirection: an.fila ? "row" : (disp.invertir ? "column-reverse" : "column"),
        gap: an.gap,
        alignItems: an.fila ? "flex-start" : "center",
        paddingBottom: 8,
      }}>
        {bLateral && <aside style={bAsideS}><div style={{display:"flex",flexDirection:"column",gap:12}}>{bPM}{bMic}</div></aside>}
        <div style={bLateral?{display:"flex",flexDirection:disp.invertir?"column-reverse":"column",gap:an.gap,alignItems:"center",width:bKbW,flexShrink:0}:{display:"contents"}}>
        {(view==="ambas"||view==="izquierda")&&(
          <div style={{width: an.aL, flexShrink:0}}>
            <div style={{fontSize:11,color:"#8a8a8a",marginBottom:5,letterSpacing:"0.12em",
              display:"flex",alignItems:"center",gap:6}}>
              <span>MANO IZQUIERDA · {leftBtns.length} botones</span>
              {isMobile&&<span style={{opacity:.5,fontSize:8}}>↑ abre / cierra ↓</span>}
            </div>
            <BandCanvas buttons={leftBtns} bellows={bellows}
              pressed={pressedL} heardIds={heardIdsL}
              onDown={downL} onUp={upL} mobile={isMobile}
              maxWidth={an.aL} maxScale={3.6} chordMap={chordMap} chordIds={chordIds} markIds={markIds}
              octMap={bellows==="abre" ? OCT_L_OPEN : OCT_L_CLOSE}/>
          </div>
        )}
        {(view==="ambas"||view==="derecha")&&(
          <div style={{width: an.aR, flexShrink:0}}>
            <div style={{fontSize:11,color:"#8a8a8a",marginBottom:5,letterSpacing:"0.12em"}}>
              MANO DERECHA · {rightBtns.length} botones
            </div>
            <BandCanvas buttons={rightBtns} bellows={bellows}
              pressed={pressedR} heardIds={heardIdsR}
              onDown={downR} onUp={upR} mobile={isMobile}
              maxWidth={an.aR} maxScale={3.6} chordMap={chordMap} chordIds={chordIds} markIds={markIds}
              octMap={bellows==="abre" ? OCT_R_OPEN : OCT_R_CLOSE}/>
          </div>
        )}
        </div>
        {bLateral && <aside style={bAsideS}>{bArm}</aside>}
      </div>

      {/* Paneles: al costado del teclado si hay lugar; si no, debajo en dos columnas */}
      {bLateral ? <div style={{marginTop:8}}>{bMapa}</div> : (
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",gap:12,alignItems:"start",marginTop:8}}>
        <div style={{display:"grid",gap:12}}>{bPM}{bMic}{bMapa}</div>
        {bArm}
      </div>)}

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

function EntrenadorTab({preset}={}){
  const [leftBtns, setLeftBtns]   = useState([]);
  const [rightBtns, setRightBtns] = useState([]);
  useEffect(()=>{ const {left,right}=loadBtns(); setLeftBtns(left); setRightBtns(right); },[]);

  const [bellows, setBellows] = useState("abre");
  const [view, setView]       = useState("ambas");
  const [guesses, setGuesses] = useState({}); // `${id}|${bellows}` -> hex
  const [checked, setChecked] = useState(false);
  const [picker, setPicker]   = useState(null); // botón abierto en la hoja de color
  const [copied, setCopied]   = useState(false);
  const [modo, setModo]       = useState("forma");   // "colores" | "acordes" | "escalas" | "forma" | "notas" | "camino"
  const [chordSel, setChordSel] = useState({});         // `${id}|${bellows}` -> true
  const [reveal, setReveal]     = useState(false);
  const [formaPts, setFormaPts] = useState({L:[],R:[]});   // círculos puestos de memoria (ejercicio "Armar el teclado")
  const [formaGrid, setFormaGrid] = useState(true);
  const [formaTol, setFormaTol] = useState(FORMA_TOL);   // margen de error al corregir
  const [notaGuess, setNotaGuess] = useState({});          // `${id}|${bellows}` -> {pc, oct}   (ejercicio "Poner las notas")
  const [notaPicker, setNotaPicker] = useState(null);
  const [pedirOct, setPedirOct]   = useState(false);
  const [romano,setRomano]=useRomanos();
  const acorde = useAcorde(romano,setRomano);
  useEffect(()=>{ setChecked(false); setReveal(false); },[acorde.key, modo]);
  useEffect(()=>{ setNotaPicker(null); },[modo,bellows,view]);
  useEffect(()=>{ if(modo==="notas"){ setChecked(false); setReveal(false); } },[bellows,pedirOct]);
  // — Escalas —
  const [escRoot,setEscRoot]=useState("C"), [escTipo,setEscTipo]=useState("mayor"), [escMano,setEscMano]=useState("der");
  const [escDir,setEscDir]=useState("sube"), [escStart,setEscStart]=useState(-1), [escModo,setEscModo]=useState("ver");
  // — Camino de las escalas —
  const [camOctL,setCamOctL]=useState(3), [camOctR,setCamOctR]=useState(4), [camLong,setCamLong]=useState(1);
  const [camFig,setCamFig]=useState("negra"), [camBpm,setCamBpm]=useState(80), [camSent,setCamSent]=useState("sube"), [camMetro,setCamMetro]=useState("negra");
  const [camElige,setCamElige]=useState({}), [camSuena,setCamSuena]=useState(null), [camLey,setCamLey]=useState(false);
  const esCam = modo==="camino" || modo==="arpegio" || modo==="voz";       // vistas "Ver y escuchar" (escalas y acordes)
  const [acoInv,setAcoInv]=useState(0), [acoUltimo,setAcoUltimo]=useState("arpegio");   // inversión y última vista de la pestaña Acordes
  useEffect(()=>{ if(modo==="arpegio"||modo==="acordes"||modo==="construir"||modo==="armonizar") setAcoUltimo(modo); },[modo]);
  const nTonosArp=acorde.tones.filter(t=>!t.up).length, acoInvOk=Math.min(acoInv,Math.max(0,nTonosArp-1),3);
  const [escUltimo,setEscUltimo]=useState("camino");   // última vista de la pestaña Escalas
  useEffect(()=>{ if(modo==="camino"||modo==="escalas") setEscUltimo(modo); },[modo]);
  useEffect(()=>{ if(modo==="escalas" && !ESC_ENT.some(e=>e.id===escTipo)) setEscTipo("mayor"); },[modo,escTipo]);   // Practicar solo tiene las escalas de 7 notas y la cromática
  const camTimers=useRef([]), camBus=useRef(null);
  const camDef=ESCALAS_HERO.find(e=>e.id===escTipo)||ESCALAS_HERO[0];
  // octavas que realmente tiene cada mano (según la tabla del teclado)
  const rg=useMemo(()=>{ if(!leftBtns.length||!rightBtns.length) return {L:[2,3,4],R:[3,4,5,6]};
    const f=(btns)=>{ const m=[...itemsMano(btns,"abre"),...itemsMano(btns,"cierra")].map(i=>i.midi), a=Math.floor(Math.min(...m)/12)-1, b=Math.floor(Math.max(...m)/12)-1; return Array.from({length:b-a+1},(_,k)=>a+k); };
    return {L:f(leftBtns),R:f(rightBtns)}; },[leftBtns,rightBtns]);
  const [voz,setVoz]=useState({preset:"bajo",bajoOct:2,relOct:4,inv:0,man:{},soloLista:false}), [vozTxt,setVozTxt]=useState(""), [vozMsg,setVozMsg]=useState("");
  const vozNotas=useMemo(()=>armarVoz(acorde,voz),[acorde.tones,acorde.rootIdx,voz]);
  const dispo=useMemo(()=>{ const f=bel=>({L:new Set(itemsMano(leftBtns,bel).map(i=>i.midi)),R:new Set(itemsMano(rightBtns,bel).map(i=>i.midi))}); return {abre:f("abre"),cierra:f("cierra")}; },[leftBtns,rightBtns]);
  const cam=useMemo(()=> !leftBtns.length ? null
      : modo==="camino" ? caminoEscala(leftBtns,rightBtns,bellows,noteIdx(escRoot),camDef.ivs,escRoot,camOctL,camOctR,camLong,camElige)
      : modo==="arpegio" ? caminoArpegio(leftBtns,rightBtns,bellows,acorde,acoInvOk,camOctL,camOctR,camLong,camElige)
      : modo==="voz" ? caminoNotas(leftBtns,rightBtns,bellows,
          vozNotas.filter(n=>n.mano==="L").map(n=>({midi:n.midi,name:n.name,lab:n.lab,deg:0})),
          vozNotas.filter(n=>n.mano==="R").map(n=>({midi:n.midi,name:n.name,lab:n.lab,deg:0})),camElige) : null,
                    [modo,leftBtns,rightBtns,bellows,escRoot,escTipo,camOctL,camOctR,camLong,camElige,acorde.tones,acoInvOk,vozNotas]);
  const camMapa=useMemo(()=>{ const m={}; if(!cam) return m;
    ["L","R"].forEach(h=>{ const nodos=cam.manos[h].nodos;
      nodos.forEach(nd=>{ if(!nd.falta) m[nd.item.b.id]={t:"nodo",nd,hand:h}; });
      nodos.forEach(nd=>{ if(!nd.falta) nd.alts.forEach(a=>{ if(!m[a.b.id]) m[a.b.id]={t:"alt",nd,hand:h}; }); }); });
    return m; },[cam]);
  const camParar=()=>{ camTimers.current.forEach(clearTimeout); camTimers.current=[]; setCamSuena(null);
    const b=camBus.current; if(b){ try{ b.gain.setTargetAtTime(0,getCtx().currentTime,0.012); setTimeout(()=>{ try{ b.disconnect(); }catch(e){} },250); }catch(e){} camBus.current=null; } };
  useEffect(()=>{ camParar(); },[modo,view,bellows,escRoot,escTipo,camOctL,camOctR,camLong,camSent,camFig,camBpm,camMetro,camElige,acorde.tones,acoInvOk,voz]);
  useEffect(()=>()=>{ camTimers.current.forEach(clearTimeout); },[]);
  const [prog,setProg]=useState({i:1,err:0,hint:false,wrong:null});
  const escTimers=useRef([]);
  const [info,setInfo]=useState(null);   // ventana de la tecla (escalas)
  useEffect(()=>()=>escTimers.current.forEach(clearTimeout),[]);
  // Ejercicio asignado por el profesor: deja el entrenador listo para practicarlo
  useEffect(()=>{
    if(!preset) return;
    setBellows(preset.fuelle==="cierra"?"cierra":"abre");
    if(preset.tipo==="escala"){
      setModo("escalas"); setEscRoot(preset.root||"C"); setEscTipo(preset.escala||"mayor"); setEscMano(preset.mano==="izq"?"izq":"der");
      setEscDir(preset.dir==="baja"?"baja":"sube"); setEscStart(preset.inicio===undefined?-1:preset.inicio); setEscModo(preset.modoEj==="practica"?"practica":"ver");
      setView(preset.mano==="izq"?"izquierda":"derecha");
    } else if(preset.tipo==="acorde"){
      setModo("acordes"); acorde.setAll(preset.ac||{}); setView("ambas");
    }
  },[preset&&preset.nonce]);
  useEffect(()=>{ setProg({i:1,err:0,hint:false,wrong:null}); setInfo(null); },[escRoot,escTipo,escMano,escDir,escStart,escModo,bellows,modo]);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(()=>{
    const check=()=>setIsMobile(window.innerWidth<640);
    check(); window.addEventListener("resize",check);
    return ()=>window.removeEventListener("resize",check);
  },[]);

  const [wrapRef, wrapMedido] = useAnchoMedido();
  const wrapWidth = wrapMedido || 900;
  const bothVisible = view==="ambas";
  const maxW = wrapWidth; // cada teclado usa todo el ancho (apilados), así se ven lo más grandes posible
  const disp = useDisposicion();
  const an = calcAnchos(wrapWidth,leftBtns,rightBtns,view==="ambas",disp.lado,isMobile);
  // Pantallas anchas con teclados apilados o de una mano: los controles pasan a los márgenes (izquierda: recorrido; derecha: escala y sonido)
  const kbW = view==="ambas" ? Math.max(an.aL,an.aR) : view==="izquierda" ? an.aL : an.aR;
  const sideW = Math.floor((wrapWidth-kbW-36)/2);
  const lateral = !isMobile && !an.fila && sideW>=220 && (modo==="camino"||modo==="arpegio");

  const keyOf = useCallback((id)=>`${id}|${bellows}`,[bellows]);
  const correctOf = useCallback((btn)=>{
    const noteLat = bellows==="abre" ? btn.abre : btn.cierra;
    return nc(LAT[noteLat]||noteLat);
  },[bellows]);

  const openPicker = (btn, rect)=> setPicker({btn, rect});
  const closePicker = useCallback(()=>setPicker(null),[]);
  const pickColor = (hex)=>{
    setGuesses(g=>({...g, [keyOf(picker.btn.id)]: hex}));
    setPicker(null);
  };
  const erase = ()=>{
    setGuesses(g=>{ const n={...g}; delete n[keyOf(picker.btn.id)]; return n; });
    setPicker(null);
  };

  const allButtons = useMemo(()=>[...leftBtns, ...rightBtns],[leftBtns,rightBtns]);
  const vis = [...(view!=="derecha"?leftBtns:[]), ...(view!=="izquierda"?rightBtns:[])];   // botones de las manos que se están viendo
  const pcOf = (btn)=>{ const n = bellows==="abre" ? btn.abre : btn.cierra; return LAT[n]||n; };
  const isSel = (btn)=>!!chordSel[keyOf(btn.id)];
  const chordLabelOf = (btn)=>acorde.labelByPc[pcOf(btn)]||null;
  const toggleSel = (btn)=>{ setChordSel(s=>{ const n={...s}; const k=keyOf(btn.id); if(n[k]) delete n[k]; else n[k]=true; return n; }); setChecked(false); };
  const selected  = allButtons.filter(isSel);
  const selOk     = selected.filter(b=>chordLabelOf(b));
  const selBad    = selected.filter(b=>!chordLabelOf(b));
  const coveredPcs = new Set(selOk.map(pcOf));
  const faltanTones = acorde.tones.filter(tn=>!coveredPcs.has(tn.pc));
  const faltanPcs = new Set(faltanTones.map(tn=>tn.pc));
  const chordProps = modo==="acordes" ? { isSel, labelOf:chordLabelOf, isMissed:(btn)=>faltanPcs.has(pcOf(btn)), reveal } : null;
  const escDef   = ESC_ENT.find(e=>e.id===escTipo)||ESC_ENT[0];
  const escIvs   = (escTipo==="menorM" && escDir==="baja") ? ESC_ENT[1].ivs : escDef.ivs;   // melódica: baja como natural
  const escRootPc = noteIdx(escRoot);
  const escNombres = buildScale(escRoot, escIvs);
  const escPcSet = new Set(escNombres.map(noteIdx));
  const escDeletreo = {}; escNombres.forEach(n=>{ escDeletreo[noteIdx(n)] = nombreLat(n); });
  const escBtns  = escMano==="izq" ? leftBtns : rightBtns;
  const escR     = useMemo(()=> modo==="escalas" && escBtns.length ? rutaEscala(escBtns,bellows,escRootPc,escIvs,escDir,escStart) : {route:[],missing:[],tonics:[],items:[]},
                           [modo,escBtns,bellows,escRootPc,escTipo,escDir,escStart]);
  const escIdxById = {}; escR.route.forEach((r,i)=>{ escIdxById[r.item.b.id]=i; });
  const itemDe = (btn)=> itemsMano([btn],bellows)[0];
  const etiqueta = (it)=> (escDeletreo[it.pc]||CROM_SIMPLE[CHROMATIC[it.pc]]) + it.oct;
  const tocarItem = (it)=> playBand(CHROMATIC[it.pc], it.oct);
  // Construir un acorde directamente sobre el teclado
  const [conSel,setConSel]=useState({abre:[],cierra:[]}), [conRaiz,setConRaiz]=useState(null), [conVer,setConVer]=useState(0), [conTxt,setConTxt]=useState(""), [conMsg,setConMsg]=useState("");
  const conIds=conSel[bellows];
  const conBy=useMemo(()=>Object.fromEntries([...leftBtns,...rightBtns].map(b=>[b.id,b])),[leftBtns,rightBtns]);
  const conItems=useMemo(()=>conIds.map((id,k)=>conBy[id]?{...itemsMano([conBy[id]],bellows)[0],orden:k+1,mano:id.startsWith("L")?"Izq.":"Der."}:null).filter(Boolean),[conIds,conBy,bellows]);
  const conPrimera=conItems.length?conItems[0].pc:null;
  const conRaizUso=(conRaiz!=null&&conItems.some(i=>i.pc===conRaiz))?conRaiz:conPrimera;
  const conAn=useMemo(()=>{ if(conItems.length<2) return null; const bajo=[...conItems].sort((a,b)=>a.midi-b.midi)[0].pc; return analizarAcorde(conItems.map(i=>i.pc),bajo,{raiz:conRaizUso}); },[conItems,conRaizUso,conVer]);
  useEffect(()=>{ setConTxt(conAn&&!conAn.intervalo?conAn.suf:""); setConMsg(""); },[conAn&&conAn.key,conAn&&conAn.suf]);
  // raíz, 3ª, 5ª y 7ª del acorde que se está armando (si las tiene) para sugerir formas
  const conRoles=useMemo(()=>{
    if(!conAn||conAn.intervalo) return null;
    const r=conAn.rootPc, set=[...new Set(conItems.map(i=>i.pc))], iv=p=>(p-r+12)%12, de=(ivs)=>{ const h=set.find(p=>ivs.includes(iv(p))); return h===undefined?null:h; };
    const t=de([3,4]), q=de([7,6,8]), sp=de([10,11,9]); if(t===null||q===null) return null;
    const pcs=[r,t,q,...(sp!==null?[sp]:[])];
    return {pcs,nombres:pcs.map(p=>(conAn.nombres&&conAn.nombres[p])||CROM_SIMPLE[CHROMATIC[p]])};
  },[conAn,conItems]);
  const conVoicings=useMemo(()=>conRoles?voicingsDe(conRoles.pcs,conRoles.nombres,leftBtns,rightBtns,bellows):null,[conRoles,leftBtns,rightBtns,bellows]);
  const conStateOf=(btn)=>{
    const it=itemDe(btn), nt=CHROMATIC[it.pc], col=nc(nt), k=conIds.indexOf(btn.id);
    if(k<0) return {bg:col+"30",border:`2px solid ${col}70`,glow:"none",content:<span style={{fontSize:8.5,fontWeight:700,color:"#ffffffa0",textShadow:"0 1px 2px #000"}}>{CROM_SIMPLE[nt]}</span>};
    const gr=conAn&&conAn.grados[(it.pc-conAn.rootPc+12)%12], nom=(conAn&&conAn.nombres&&conAn.nombres[it.pc])||nombreLat(RAIZ_NOM[it.pc]);
    return {bg:col,border:"3px solid #fff",glow:`0 0 0 3px #ffffff55, 0 0 14px ${col}`,
      content:<span style={{display:"flex",flexDirection:"column",alignItems:"center",lineHeight:1.05,color:"#fff",textShadow:"0 1px 3px rgba(0,0,0,.95)"}}>
        <b style={{fontSize:nom.length>3?10.5:13}}>{nom}</b><span style={{fontSize:9.5,fontWeight:800,fontFamily:"monospace"}}>{gr||k+1}</span></span>};
  };
  const conTap=(btn)=>{ tocarItem(itemDe(btn)); setConSel(m=>{ const cur=m[bellows]; return {...m,[bellows]:cur.includes(btn.id)?cur.filter(x=>x!==btn.id):[...cur,btn.id]}; }); };
  const conQuitar=(id)=>setConSel(m=>({...m,[bellows]:m[bellows].filter(x=>x!==id)}));
  const conTocar=(arp)=>{ const o=[...conItems].sort((a,b)=>a.midi-b.midi); o.forEach((it,i)=>playBandDur(CHROMATIC[it.pc],it.oct,arp?0.38:1.8,arp?i*0.32:i*0.012)); };
  const conGuardar=()=>{ if(!conAn||conAn.intervalo) return; const p={...cifPropios()}, t=conTxt.trim(); if(t===""||t===conAn.defaultSuf) delete p[conAn.key]; else p[conAn.key]=t; cifGuardarPropios(p); setConVer(v=>v+1); setConMsg(t===""||t===conAn.defaultSuf?"Volvió al nombre automático.":"Guardado. Se usará siempre que armes esta estructura, en cualquier tonalidad."); };
  const conCopiar=()=>{ const p=cifPropios(), txt=Object.keys(p).map(k=>k+" = "+p[k]).join("\n"); try{ navigator.clipboard.writeText("Mis nombres de acordes (intervalos en semitonos desde la raíz = sufijo)\n"+txt); setConMsg("Copiado: pegalo para pasármelo."); }catch(e){ setConMsg("No se pudo copiar."); } };
  const [flechasModo,setFlechasModo]=useState("recta");
  // Armonizar una escala + Mis acordes (tarjetas guardadas en este dispositivo)
  const [armGrado,setArmGrado]=useState(0), [armCuat,setArmCuat]=useState(false), [conNota,setConNota]=useState("");
  const [vozSel,setVozSel]=useState(null), [armPatron,setArmPatron]=useState("cerrado"), [armMatriz,setArmMatriz]=useState(false);
  const [misAcordes,setMisAcordes]=useState(()=>{ try{ const v=JSON.parse(localStorage.getItem("bandomaps_mis_acordes")||"[]"); return Array.isArray(v)?v:[]; }catch(e){ return []; } });
  useEffect(()=>{ try{ localStorage.setItem("bandomaps_mis_acordes",JSON.stringify(misAcordes)); }catch(e){} },[misAcordes]);
  const escTipo7 = ESC_ENT.slice(0,4).some(e=>e.id===escTipo) ? escTipo : "mayor";
  const famArm = {mayor:"mayor",menor:"menor",menorA:"armonica",menorM:"melodica"}[escTipo7];
  const armMenor = escTipo7!=="mayor";
  const tonicasArm = armMenor ? TONICAS_MENOR : TONICAS_MAYOR;
  const armTonica = tonicasArm.includes(escRoot) ? escRoot : tonicasArm[((noteIdx(escRoot)%12)+12)%12];   // tonalidades usuales: La mayor, Do♯ menor…
  const armNotas = buildScale(armTonica, FAMILIAS.find(f=>f.id===famArm).ivs);
  const armPcs = armNotas.map(noteIdx);
  const armNombres = Object.fromEntries(armNotas.map(n=>[noteIdx(n),nombreLat(n)]));   // pc → nombre escrito según la tonalidad
  const armAcordes = useMemo(()=>acordesDeNotas(buildScale(armTonica, FAMILIAS.find(f=>f.id===famArm).ivs)).map(d=>{
    const q=armCuat?d.sq:d.tq, pcs=armCuat?d.pcs:d.pcs.slice(0,3), notas=armCuat?d.sept:d.tri;
    return {i:d.i,pc:d.pc,pcs,notas,q,nombre:nombreAcordeEs(d.raiz,q),num:armCuat?romSept(d.i,d.sq):romTri(d.i,d.tq)};
  }),[armTonica,famArm,armCuat]);
  const armSel = armAcordes[Math.min(armGrado,6)];
  const nombresRol = armSel.notas.map(nombreLat);
  const armVoicings = useMemo(()=>voicingsDe(armSel.pcs,nombresRol,leftBtns,rightBtns,bellows),[armSel,leftBtns,rightBtns,bellows]);
  const matrizFilas = useMemo(()=>{
    if(!armMatriz||!FORMULAS[armSel.q]) return [];
    const f=FORMULAS[armSel.q], menorQ=ES_MENORQ(armSel.q), pi=PATRONES_VOZ.findIndex(p=>p.id===armPatron);
    return TONICAS_MAYOR.map((_,pc)=>{
      const rootEng=raizDefecto(pc,menorQ), pcs=f.intervals.map(iv=>(pc+iv)%12), nombres=f.intervals.map((iv,k)=>nombreLat(spell(rootEng,iv,f.degs[k])));
      return {pc,nombre:nombreAcordeEs(rootEng,armSel.q),nombres,pcs,v:voicingsDe(pcs,nombres,leftBtns,rightBtns,bellows)[pi]};
    });
  },[armMatriz,armSel.q,armPatron,leftBtns,rightBtns,bellows]);
  const formasUI=(lista,{onVer,activoIds,btnVer,guardar})=>(
<div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {lista.map(v=>{
            const on=activoIds&&v.ids&&activoIds.join()===v.ids.join();
            return (
              <div key={v.id} style={{flex:"1 1 220px",maxWidth:340,padding:"9px 11px",borderRadius:12,background:on?"#1b1b20":"#0e0e10",border:`1px solid ${on?"#cfcfd4":"#2c2c30"}`}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:6,alignItems:"baseline"}}>
                  <b style={{fontFamily:"'Libre Baskerville',serif",fontSize:14,color:"#ececec"}}>{v.nombre}</b>
                  {v.fuelle&&<span style={{fontSize:10,color:"#7c7c82"}}>{v.fuelle==="abre"?"abriendo":"cerrando"}{v.fuelle!==bellows?" (cambia el fuelle)":""}</span>}
                </div>
                <div style={{fontSize:10.5,color:"#8a8a90",margin:"2px 0 6px"}}>{v.uso}</div>
                {v.vacio ? <div style={{fontSize:11.5,color:"#c9a25a"}}>No hay botones para armarlo así en este teclado.</div> : (<>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:4}}>
                    {v.notas.map(n=>{ const col=nc(CHROMATIC[n.pc]); return (<span key={n.id} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"1px 7px 1px 3px",borderRadius:999,background:"#16161a",border:"1px solid #2c2c30",fontSize:11.5,color:"#ececec"}}>
                      <span style={{width:16,height:16,borderRadius:"50%",background:col,color:txtSobre(col),fontSize:8.5,fontWeight:800,fontFamily:"monospace",display:"inline-flex",alignItems:"center",justifyContent:"center"}}>{ROL_TXT[n.rol]}</span>
                      <span style={{fontFamily:"'Libre Baskerville',serif",fontWeight:700}}>{n.nombre}{n.oct}</span><span style={{fontSize:9,color:"#6a6a70"}}>{n.hand==="L"?"izq":"der"}</span></span>); })}
                  </div>
                  <div style={{fontSize:10,color:"#6a6a70",marginBottom:6}}>{v.manos.L?`${v.manos.L} en la izquierda`:""}{v.manos.L&&v.manos.R?" · ":""}{v.manos.R?`${v.manos.R} en la derecha`:""}</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    <button style={uiPlay(false,{padding:"3px 11px",fontSize:11.5})} onClick={()=>tocarVoicing(v,false)}>▶</button>
                    <button style={uiTool(on)} onClick={()=>onVer(v)}>{btnVer}</button>
                    <button style={uiTool(false)} onClick={()=>guardar(v)}>★</button>
                  </div>
                </>)}
              </div>);
          })}
        </div>
  );
  const verVoicing=(v,titulo,nombres)=>{ if(!v||v.vacio) return; setBellows(v.fuelle); setVozSel({ids:v.ids,fuelle:v.fuelle,titulo,nom:Object.fromEntries(v.notas.map(n=>[n.id,n.nombre])),rol:Object.fromEntries(v.notas.map(n=>[n.id,n.rol]))}); };
  const vozItems=(v)=>v.notas.map(n=>conBy[n.id]).filter(Boolean).map(b=>itemsMano([b],v.fuelle)[0]);
  const tocarVoicing=(v,arp)=>{ const o=vozItems(v).sort((a,b)=>a.midi-b.midi); o.forEach((it,i)=>playBandDur(CHROMATIC[it.pc],it.oct,arp?0.38:1.8,arp?i*0.32:i*0.012)); };
  const guardarVoicing=(v,titulo)=>cardGuardar(titulo,"",v.ids,v.fuelle,Object.fromEntries(v.notas.map(n=>[n.pc,n.nombre])));
  const armVoz = (pcs)=>{ const v=voicingsDe(pcs,[],leftBtns,rightBtns,bellows)[1]; return v&&!v.vacio?v.ids:[]; };   // por defecto: la forma «cerrado» sugerida
  const armItems = (pcs)=>armVoz(pcs).map(id=>conBy[id]).filter(Boolean).map(b=>itemsMano([b],bellows)[0]);
  const armTocar = (arp)=>{ const o=(vozSel?vozItems({fuelle:vozSel.fuelle,notas:vozSel.ids.map(id=>({id}))}):armItems(armSel.pcs)).sort((a,b)=>a.midi-b.midi); o.forEach((it,i)=>playBandDur(CHROMATIC[it.pc],it.oct,arp?0.38:1.8,arp?i*0.32:i*0.012)); };
  const armRecorrer = ()=>{ armAcordes.forEach((a,k)=>{ armItems(a.pcs).sort((x,y)=>x.midi-y.midi).forEach(it=>playBandDur(CHROMATIC[it.pc],it.oct,1.1,k*1.25)); }); };
  const armStateOf=(btn)=>{
    const it=itemDe(btn), nt=CHROMATIC[it.pc], col=nc(nt), k=armSel.pcs.indexOf(it.pc), enEsc=armPcs.includes(it.pc);
    if(vozSel){
      if(vozSel.ids.includes(btn.id)) return {bg:col,border:"3px solid #fff",glow:`0 0 0 3px #ffffff66, 0 0 16px ${col}`,
        content:<span style={{display:"flex",flexDirection:"column",alignItems:"center",lineHeight:1.05,color:"#fff",textShadow:"0 1px 3px rgba(0,0,0,.95)"}}><b style={{fontSize:12}}>{vozSel.nom[btn.id]}</b><span style={{fontSize:9,fontWeight:800,fontFamily:"monospace"}}>{ROL_TXT[vozSel.rol[btn.id]]}</span></span>};
      return {bg:k>=0?col+"26":"#141416",border:`2px solid ${k>=0?col+"55":"#232326"}`,glow:"none",content:null};
    }
    if(k>=0) return {bg:col,border:"3px solid #fff",glow:`0 0 0 3px #ffffff55, 0 0 14px ${col}`,
      content:<span style={{display:"flex",flexDirection:"column",alignItems:"center",lineHeight:1.05,color:"#fff",textShadow:"0 1px 3px rgba(0,0,0,.95)"}}>
        <b style={{fontSize:12}}>{armNombres[it.pc]}</b><span style={{fontSize:9,fontWeight:800,fontFamily:"monospace"}}>{GRADO_LABEL[(it.pc-armSel.pc+12)%12]}</span></span>};
    if(enEsc) return {bg:col+"55",border:`2px solid ${col}aa`,glow:"none",content:<span style={{fontSize:9,fontWeight:700,color:"#ffffffc0",textShadow:"0 1px 2px #000"}}>{armNombres[it.pc]}</span>};
    return {bg:"#17171a",border:"2px solid #26262a",glow:"none",content:null};
  };
  const armTap=(btn)=>{ const it=itemDe(btn); tocarItem(it); const i=armPcs.indexOf(it.pc); if(i>=0){ setArmGrado(i); setVozSel(null); } };
  const cardGuardar=(nombre,nota,ids,bel,nm)=>{ if(!ids||!ids.length) return; setMisAcordes(l=>[{id:Date.now().toString(36),nombre,nota:(nota||"").trim(),bellows:bel,ids:[...ids],nm:nm||null},...l]); };
  const cardItems=(c)=>c.ids.map(id=>conBy[id]).filter(Boolean).map(b=>itemsMano([b],c.bellows)[0]);
  const cardTocar=(c)=>{ cardItems(c).sort((a,b)=>a.midi-b.midi).forEach((it,i)=>playBandDur(CHROMATIC[it.pc],it.oct,1.8,i*0.012)); };
  const cardAbrir=(c)=>{ setBellows(c.bellows); setConSel(m=>({...m,[c.bellows]:c.ids.filter(id=>conBy[id])})); setConRaiz(null); setModo("construir"); cardTocar(c); };
  // Ubicar líneas
  const [linTipo,setLinTipo]=useState("filas"), [linSel,setLinSel]=useState(-1), [linRot,setLinRot]=useState("pos");
  const linL=useMemo(()=>lineasDe("L",leftBtns,linTipo,bellows),[leftBtns,linTipo,bellows]);
  const linR=useMemo(()=>lineasDe("R",rightBtns,linTipo,bellows),[rightBtns,linTipo,bellows]);
  const linMapa=useMemo(()=>{ const m={}; [linL,linR].forEach(ls=>ls.forEach((l,li)=>l.ids.forEach((id,pos)=>{ m[id]={li,pos,n:l.ids.length}; }))); return m; },[linL,linR]);
  useEffect(()=>{ setLinSel(-1); },[linTipo]);
  const linStateOf=(btn)=>{
    const e=linMapa[btn.id]; if(!e) return {bg:"#1a1a1a",border:"2px solid #444",glow:"none",content:null};
    const it=itemDe(btn), txt=linRot==="pos"?String(e.pos+1):linRot==="nota"?CROM_SIMPLE[CHROMATIC[it.pc]]:null;
    const todas=linSel<0, esta=linSel===e.li, col=LIN_COLS[e.li%LIN_COLS.length];
    if(!todas&&!esta) return {bg:"#151517",border:"2px solid #2c2c30",glow:"none",content:txt?<span style={{fontSize:10,fontWeight:700,color:"#55555b"}}>{txt}</span>:null};
    const bg=todas?col:"#f2f2f2";
    return {bg,border:esta?"3px solid #ffffff":"3px solid rgba(255,255,255,.35)",glow:esta?"0 0 0 3px #ffffff55, 0 0 16px #ffffffaa":"none",
      content:txt?<span style={{fontSize:txt.length>2?10.5:14,fontWeight:800,color:txtSobre(bg),fontFamily:linRot==="pos"?"monospace":"inherit"}}>{txt}</span>:null};
  };
  const linTap=(btn)=>{ const e=linMapa[btn.id]; if(!e) return; tocarItem(itemDe(btn)); setLinSel(p=>p===e.li?-1:e.li); };
  const linFlechas=(h)=>{ if(linSel<0||flechasModo==="no") return null; const l=(h==="L"?linL:linR)[linSel]; if(!l) return null; const by=Object.fromEntries((h==="L"?leftBtns:rightBtns).map(b=>[b.id,b])), out=[];
    for(let i=0;i<l.ids.length-1;i++){ const a=by[l.ids[i]], b=by[l.ids[i+1]]; out.push({a:{x:a.x+BTN_SIZE/2,y:a.y+BTN_SIZE/2},b:{x:b.x+BTN_SIZE/2,y:b.y+BTN_SIZE/2},dash:false}); }
    return out; };
  const linEscuchar=(h)=>{ const l=(h==="L"?linL:linR)[linSel]; if(!l) return; const by=Object.fromEntries((h==="L"?leftBtns:rightBtns).map(b=>[b.id,b]));
    l.ids.forEach((id,i)=>{ const it=itemDe(by[id]); playBandDur(CHROMATIC[it.pc],it.oct,0.4,i*0.38); }); };
  // Digitación: viene dentro del ejercicio asignado (solo si la configuración sigue siendo la del ejercicio)
  const sigAct = [escTipo,escRoot,escMano,escDir,bellows,escStart].join("|");
  const sigPre = (preset&&preset.tipo==="escala") ? [preset.escala||"mayor",preset.root||"C",preset.mano==="izq"?"izq":"der",preset.dir==="baja"?"baja":"sube",preset.fuelle==="cierra"?"cierra":"abre",preset.inicio===undefined?-1:preset.inicio].join("|") : "";
  const dedos  = (preset&&preset.dedos&&sigAct===sigPre) ? preset.dedos : (preset&&preset.ruta&&sigAct===sigPre ? preset.ruta.map(p=>p.d||"") : []);
  const notaOct = (btn)=>{ const it=itemDe(btn); return CROM_SIMPLE[CHROMATIC[it.pc]]+it.oct; };
  const funcionDe = (pc)=>{ const k=escNombres.findIndex(n=>noteIdx(n)===pc); if(k<0) return null; const lab=GRADO_LABEL[escIvs[k]]; return romano?aRomano(lab):lab; };
  const verDedo = (i)=> escModo==="ver" || i<prog.i || (prog.hint && i===prog.i);
  const gradoTxt = (r,i)=>{ const n=escIvs.length; const esOct = escR.route.length===n+1 && (escDir!=="baja" ? i===n : i===0); const lab = esOct ? "8" : GRADO_LABEL[escIvs[r.deg]]; return romano ? aRomano(lab) : lab; };
  const escEscuchar = ()=>{
    escTimers.current.forEach(clearTimeout); escTimers.current=[];
    escR.route.forEach((r,i)=>escTimers.current.push(setTimeout(()=>tocarItem(r.item), i*430)));
  };
  const escTap = (btn, rect)=>{
    const it = itemDe(btn); tocarItem(it);
    if(escModo==="ver"){ setInfo({btn,rect}); return; }
    if(escModo!=="practica" || prog.i>=escR.route.length) return;
    const exp = escR.route[prog.i].item;
    const enMano = escBtns.some(x=>x.id===btn.id);
    if(enMano && it.midi===exp.midi){ setProg(p=>({...p,i:p.i+1,hint:false,wrong:null})); }
    else {
      setProg(p=>({...p,err:p.err+1,wrong:btn.id}));
      escTimers.current.push(setTimeout(()=>setProg(p=>({...p,wrong:null})),700));
    }
  };
  const escStateOf = (btn)=>{
    const it = itemDe(btn), col = nc(CHROMATIC[it.pc]), ri = escIdxById[btn.id], enEsc = escPcSet.has(it.pc);
    const num = (n,sub,bg,ded)=> <span style={{display:"flex",flexDirection:"column",alignItems:"center",lineHeight:1.05,color:txtSobre(bg)}}>
        <b style={{fontSize:String(n).length>2?11:14}}>{n}</b><span style={{fontSize:8.5,fontWeight:800,fontFamily:"monospace"}}>{sub}</span>
        {ded ? <span style={{position:"absolute",top:-8,right:-8,minWidth:18,height:18,padding:"0 3px",borderRadius:9,background:"#fff",color:"#111",fontSize:11,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 1px 4px rgba(0,0,0,.7)"}}>{ded}</span> : null}</span>;
    if(escModo==="ver"){
      if(ri!==undefined) return {bg:col, border:"3px solid #fff", glow:`0 0 14px ${col}cc`, content:num(gradoTxt(escR.route[ri],ri),etiqueta(it),col,verDedo(ri)?dedos[ri]:0)};
      if(enEsc) return {bg:col+"55", border:`2px solid ${col}`, glow:"none", content:<span style={{fontSize:8.5,fontWeight:700,color:"#ddd",fontFamily:"monospace"}}>{etiqueta(it)}</span>};
      return {bg:"#121212", border:"3px solid #262626", glow:"none", content:null};
    }
    // práctica: no se regalan los colores hasta acertar
    if(ri!==undefined && ri<prog.i) return {bg:col, border:"3px solid #6b9c7c", glow:`0 0 12px ${col}aa`, content:num(gradoTxt(escR.route[ri],ri),etiqueta(it),col,verDedo(ri)?dedos[ri]:0)};
    const esProx = prog.hint && escR.route[prog.i] && escR.route[prog.i].item.b.id===btn.id;
    if(prog.wrong===btn.id) return {bg:"#3a1a1a", border:"3px solid #b5564f", glow:"0 0 10px #b5564f", content:<span style={{color:"#fff",fontWeight:800}}>✕</span>};
    if(esProx) return {bg:"#1a1a1a", border:"3px dashed #fff", glow:"0 0 10px #ffffff88", content:null};
    return {bg:"#1a1a1a", border:"3px solid #555", glow:"none", content:null};
  };
  // — Ejercicio "Poner las notas": círculos vacíos y se le dice a cada uno qué nota es —
  const guessCompleto = (g)=> !!(g && g.pc && (!pedirOct || g.oct));
  const guessOk = (b)=>{ const g=notaGuess[keyOf(b.id)], it=itemDe(b); return guessCompleto(g) && g.pc===CHROMATIC[it.pc] && (!pedirOct || g.oct===it.oct); };
  const setNota = (patch)=>{
    const k = keyOf(notaPicker.btn.id), nuevo = {...(notaGuess[k]||{}), ...patch};
    setNotaGuess(g=>({...g,[k]:nuevo})); setChecked(false);
    if(!pedirOct || (nuevo.pc && nuevo.oct)) setNotaPicker(null);
  };
  const borrarNota = ()=>{ const k=keyOf(notaPicker.btn.id); setNotaGuess(g=>{ const n={...g}; delete n[k]; return n; }); setChecked(false); setNotaPicker(null); };
  const notaStateOf = (btn)=>{
    const g = notaGuess[keyOf(btn.id)], it = itemDe(btn), real = CHROMATIC[it.pc];
    const act = !!(notaPicker && notaPicker.btn.id===btn.id);
    const lab = (pc,oct)=> CROM_SIMPLE[pc] + (pedirOct && oct ? oct : "");
    const dot = (t,sub)=> <span style={{display:"flex",flexDirection:"column",alignItems:"center",lineHeight:1.05,color:"#fff",textShadow:"0 1px 3px rgba(0,0,0,.95)"}}>
      <b style={{fontSize:t.length>4?9.5:t.length>3?11:13}}>{t}</b>{sub?<span style={{fontSize:8.5,fontWeight:800,fontFamily:"monospace"}}>{sub}</span>:null}</span>;
    if(!g || !g.pc){
      if(reveal) return {bg:nc(real)+"55", border:`2px dashed ${nc(real)}`, glow:"none", content:<span style={{fontSize:10,fontWeight:700,color:"#ddd",fontFamily:"monospace"}}>{lab(real,it.oct)}</span>};
      return {bg:"#1a1a1a", border:act?"3px solid #fff":"3px solid #555", glow:act?"0 0 0 4px #e6e6e6":"none", content:null};
    }
    const col = nc(g.pc);
    if(checked){
      const ok = guessOk(btn);
      return ok ? {bg:col, border:"3px solid #6b9c7c", glow:`0 0 10px ${col}99`, content:dot(lab(g.pc,g.oct),"✓")}
                : {bg:col, border:"3px solid #b5564f", glow:"0 0 10px #b5564faa", content:dot(lab(g.pc,g.oct),"→ "+lab(real,it.oct))};
    }
    return {bg:col, border:act?"3px solid #fff":"3px solid rgba(255,255,255,.5)", glow:act?"0 0 0 4px #e6e6e6":`0 0 10px ${col}99`, content:dot(lab(g.pc,g.oct))};
  };
  const notaPuestas = vis.filter(b=>guessCompleto(notaGuess[keyOf(b.id)]));
  const notaBien = notaPuestas.filter(guessOk);
  // — Ejercicio "Armar el teclado" —
  const setFormaH = (h,lista)=>{ setFormaPts(f=>({...f,[h]:lista})); setChecked(false); };
  const formaStat = (modo==="forma") ? [["L",leftBtns,view!=="derecha"],["R",rightBtns,view!=="izquierda"]].filter(x=>x[2]).map(([h,real])=>({h,real,m:matchForma(real,formaPts[h],formaTol),n:formaPts[h].length})) : [];
  const formaBien = formaStat.reduce((a,x)=>a+x.m.okB.size,0), formaTot = formaStat.reduce((a,x)=>a+x.real.length,0);
  const formaExtra = formaStat.reduce((a,x)=>a+x.m.extra,0), formaFalta = formaStat.reduce((a,x)=>a+x.m.falta.length,0);
  const formaPuestos = formaStat.reduce((a,x)=>a+x.n,0);

  // — Camino de las escalas: cada mano muestra su propio camino —
  const camStateOf = (btn)=>{
    const e=camMapa[btn.id];
    if(!e){ const nt=CHROMATIC[itemDe(btn).pc], col=nc(nt);
      return {bg:col+"30",border:`2px solid ${col}70`,glow:"none",content:<span style={{fontSize:8.5,fontWeight:700,color:"#ffffffa0",textShadow:"0 1px 2px #000"}}>{CROM_SIMPLE[nt]}</span>}; }
    if(e.t==="alt") return {bg:"#3a3a3a",border:"3px dashed #9a9a9a",glow:"none",content:<span style={{fontSize:10,fontWeight:800,color:"#cfcfcf"}}>{e.nd.k}?</span>};
    const col=nc(CHROMATIC[e.nd.item.pc]), suena=!!camSuena && camSuena.includes(btn.id), nom=nombreLat(e.nd.name);
    return {bg:col,border:suena?"3px solid #fff":"3px solid rgba(255,255,255,.55)",glow:suena?"0 0 0 4px #fff, 0 0 18px #fff":`0 0 10px ${col}99`,
      content:<span style={{display:"flex",flexDirection:"column",alignItems:"center",lineHeight:1.05,color:"#fff",textShadow:"0 1px 3px rgba(0,0,0,.95)"}}>
        <b style={{fontSize:nom.length>3?10.5:13}}>{nom}</b><span style={{fontSize:9,fontWeight:800,fontFamily:"monospace"}}>{e.nd.lab!==undefined?e.nd.lab:e.nd.k}</span></span>};
  };
  const camTap = (btn)=>{
    const e=camMapa[btn.id];
    if(e && e.t==="alt"){ setCamElige(s=>({...s,[bellows+":"+e.hand+":"+e.nd.midi]:btn.id})); return; }
    tocarItem(itemDe(btn));
  };
  const camCentro = (b)=>({x:b.x+BTN_SIZE/2,y:b.y+BTN_SIZE/2});
  const camFlechas = (h)=>{ if(!cam||modo==="voz"||flechasModo==="no") return null; const nodos=cam.manos[h].nodos, out=[];
    for(let i=0;i<nodos.length-1;i++){ const a=nodos[i], b=nodos[i+1]; if(a.falta||b.falta) continue;
      out.push({a:camCentro(a.item.b),b:camCentro(b.item.b),dash:bellows==="cierra"}); }
    return out; };
  // Suena lo que está a la vista: IZQ o DER = esa mano; Ambas = las dos juntas, paso a paso
  const camPasos = ()=>{ if(!cam) return [];
    if(modo==="voz"){ const hs=view==="izquierda"?["L"]:view==="derecha"?["R"]:["L","R"];
      return hs.flatMap(h=>cam.manos[h].nodos.filter(n=>!n.falta)).sort((a,b)=>a.midi-b.midi).map(nd=>({partes:[nd]})); } const hs=view==="izquierda"?["L"]:view==="derecha"?["R"]:["L","R"];
    const n=Math.max(...hs.map(h=>cam.manos[h].nodos.length)), out=[];
    for(let i=0;i<n;i++){ const partes=hs.map(h=>cam.manos[h].nodos[i]).filter(nd=>nd&&!nd.falta); if(partes.length) out.push({partes}); }
    return out; };
  const camSecuencia = ()=>{ const ok=camPasos();
    return camSent==="baja" ? [...ok].reverse() : camSent==="ida" ? [...ok,...[...ok].reverse().slice(1)] : ok; };
  // Reproduce pasos (cada paso = notas juntas). Sonido y metrónomo se programan en el reloj de audio: el tempo es exacto.
  const camTocar = (sec,ms)=>{
    camParar(); if(!sec.length) return; const ctx=getCtx(); if(!ctx) return;
    if(ctx.state==="suspended") ctx.resume();
    const bus=ctx.createGain(); bus.connect(ctx.destination); camBus.current=bus;
    const a0=0.12, total=sec.length*ms/1000;
    sec.forEach((p,i)=>{ p.partes.forEach(nd=>playBandDur(CHROMATIC[nd.item.pc],nd.item.oct,Math.min(ms/1000*0.94,6),a0+i*ms/1000,bus));
      camTimers.current.push(setTimeout(()=>setCamSuena(p.partes.map(nd=>nd.item.b.id)),a0*1000+i*ms)); });
    if(camMetro!=="no"){ const u=FIGURAS.find(f=>f.id===camMetro).beats, bm=u*60/camBpm, cada=Math.max(1,Math.round(4/u));
      for(let j=0;j<Math.ceil(total/bm-1e-6);j++) playClick(a0+j*bm,j%cada===0,bus); }
    camTimers.current.push(setTimeout(()=>setCamSuena(null),a0*1000+total*1000));
  };
  const camEscuchar = ()=>camTocar(camSecuencia(),FIGURAS.find(f=>f.id===camFig).beats*60000/camBpm);
  const vozCfg=(patch)=>setVoz(v=>({...v,...patch,man:{},soloLista:false}));
  const vozSet=(n,patch)=>setVoz(v=>{ const bass=12*(v.bajoOct+1)+acorde.rootIdx; return {...v,man:{...v.man,[n.key]:{mano:patch.mano??n.mano,ex:patch.ex??Math.round((n.midi-bass-n.key)/12)}}}; });
  const vozAcorde=()=>{ if(!cam) return; const hs=view==="izquierda"?["L"]:view==="derecha"?["R"]:["L","R"];
    const nds=hs.flatMap(h=>cam.manos[h].nodos.filter(n=>!n.falta)); if(nds.length) camTocar([{partes:nds}],2200); };
  const vozCif=vozCifrar(acorde,voz,vozNotas);
  const vozCopiar=()=>{ (navigator.clipboard?navigator.clipboard.writeText(vozCif):Promise.reject()).then(()=>setVozMsg("Copiado."),()=>setVozMsg("Seleccioná el texto y copialo.")); };
  const vozCargar=()=>{ const c=vozLeer(vozTxt); if(!c){ setVozMsg("No pude leer ese cifrado: tiene que empezar con HM1|…"); return; }
    const man={}; [["L",c.L],["R",c.R]].forEach(([h,l])=>l.forEach(d=>{ man[d%12]={mano:h,ex:Math.floor(d/12)}; }));
    acorde.setAll(c.ac); setVoz(v=>({...v,bajoOct:c.bajoOct,man,soloLista:true})); setVozMsg("Cifrado cargado."); };
  const camNotaTxt = (nd)=> nombreLat(nd.name)+octDeMidi(nd.midi);

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

// ─── Aviso inicial: alcance de la plataforma y papel del profesor ───
const AVISO_VISTAS_SIN_OPCION = 3;   // las primeras veces no se puede ocultar; después aparece "No mostrar más"
function AvisoInicial({n,manual,onClose,onNunca}){
  const puedeOcultar = !manual && n>AVISO_VISTAS_SIN_OPCION;
  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(4,4,5,.78)",backdropFilter:"blur(3px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}} role="dialog" aria-modal="true" aria-label="Importante">
      <div style={{width:"100%",maxWidth:580,maxHeight:"88vh",display:"flex",flexDirection:"column",background:"#121214",border:"1px solid #2f2f35",borderRadius:16,boxShadow:"0 20px 60px rgba(0,0,0,.6)",overflow:"hidden"}}>
        <div style={{padding:"18px 22px 12px",borderBottom:"1px solid #232326"}}>
          <p style={{margin:0,fontFamily:UI_FONT,fontSize:10,fontWeight:800,letterSpacing:"0.28em",color:"#f2c14e"}}>IMPORTANTE</p>
          <h2 style={{margin:"6px 0 0",fontFamily:"'Libre Baskerville',serif",fontSize:21,fontWeight:700,color:"#ececec"}}>Antes de empezar</h2>
        </div>
        <div style={{padding:"16px 22px",overflowY:"auto",fontFamily:"'Crimson Text',Georgia,serif",fontSize:16,lineHeight:1.6,color:"#cfcfd4"}}>
          <p style={{margin:"0 0 14px",padding:"10px 14px",borderLeft:"3px solid #f2c14e",background:"#1b1810",color:"#f3e3b5",fontFamily:UI_FONT,fontSize:13.5,lineHeight:1.5}}>BandoMaps entrena la mecánica del instrumento. La música, el fraseo y el aire los guía tu profesor.</p>
          <p style={{margin:"0 0 12px"}}>Bienvenido a BandoMaps, una plataforma concebida de manera integral para acompañar y sistematizar la práctica del bandoneón desde su dimensión puramente técnica y estructural.</p>
          <p style={{margin:"0 0 12px"}}>El propósito fundamental de esta herramienta es ofrecer un método de ejercitación enfocado en la asimilación mecánica, la memoria topográfica de los teclados y la intuición gráfica del instrumento. A través de este entorno, el estudiante podrá abordar de manera clara y progresiva el mapa del bandoneón, la soltura de ambas manos, la digitación y la coordinación motriz.</p>
          <p style={{margin:"0 0 12px"}}>Es indispensable señalar los límites de este recurso: BandoMaps no abarca los aspectos expresivos, el fraseo, los acentos, el manejo del aire ni las sutilezas melódicas y estilísticas propias de cada género. Todo el desarrollo interpretativo, la musicalidad y el criterio artístico quedan bajo la tutela, guía y supervisión directa de un profesor.</p>
          <p style={{margin:0}}>Te invitamos a utilizar esta plataforma como una herramienta práctica y un soporte visual diario para dominar la mecánica del instrumento, complementando siempre tu estudio con la enseñanza de tu docente.</p>
        </div>
        <div style={{padding:"12px 22px 16px",borderTop:"1px solid #232326",display:"flex",gap:10,alignItems:"center",justifyContent:"flex-end",flexWrap:"wrap"}}>
          {puedeOcultar && <button onClick={onNunca} style={uiGhost}>No mostrar más</button>}
          <button onClick={onClose} style={uiPill(true,{padding:"9px 24px",fontSize:13})} autoFocus>{manual?"Cerrar":"Entendido"}</button>
        </div>
      </div>
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
              <div className="space-y-5 stagger">
                <div className="flex gap-2">
                  <input value={chordInput} onChange={e=>setChordInput(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&analyzeChord()}
                    placeholder="Ej: Dm7, G7, Cmaj7, Am7b5, Bb7alt…"
                    className="glow-input flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-lg text-gray-100"
                    style={{fontFamily:"monospace"}}/>
                  <button onClick={analyzeChord}
                    className="px-5 py-3 rounded-xl text-sm font-bold"
                    style={{background:"#1a1a1a",border:"1px solid #e6e6e6",color:"#e6e6e6",whiteSpace:"nowrap"}}>
                    Analizar
                  </button>
                </div>

                <div style={{background:"#121214",border:"1px solid #26262a",borderRadius:14,padding:"12px 14px"}}>
                  <p style={{...uiLabel,marginBottom:8}}>O armalo con un toque · raíz</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
                    {ACORDE_RAICES.map(x=>(<button key={x} style={uiPill(pickRoot===x,{padding:"5px 11px"})} onClick={()=>elegirAcorde(x,pickQ||"maj")}>{nombreLat(x)}</button>))}
                  </div>
                  {GRUPOS_ACORDE.map(([tit,lista])=>(
                    <div key={tit} style={{marginBottom:10}}>
                      <p style={{...uiLabel,fontSize:9.5,marginBottom:6,color:tit==="Disminuidos"?"#cfcfd4":undefined}}>{tit}</p>
                      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                        {lista.map(([q,l])=>(<button key={q} style={uiPill(pickQ===q,{padding:"5px 11px"})} onClick={()=>elegirAcorde(pickRoot,q)}>{l}</button>))}
                      </div>
                    </div>
                  ))}
                  <p style={{fontSize:11,color:"#6a6a70",margin:"4px 0 0"}}>También podés escribirlo: Bdim, B°7, Bø7, Bm7b5, C7sus4, Cm6, Cmmaj7, C7#5, Cmaj7#11…</p>
                </div>

                {chord&&<>
                  <div className="rounded-2xl p-5 border border-gray-700" style={{background:"#121212"}}>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Acorde</p>
                    <div className="flex items-baseline gap-3 mb-4 flex-wrap">
                      <h2 className="text-3xl font-bold" style={{fontFamily:"'Libre Baskerville',serif"}}>
                        {chord.root}<span className="text-gray-400">{chord.formula.symbol}</span>
                      </h2>
                      <span className="text-lg text-gray-400 italic">{chord.formula.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {chord.notes.map(n=><Nota key={n} note={n} size="lg"/>)}
                    </div>
                                        <button onClick={()=>playChord(chord.notes)}
                      className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold border"
                      style={{background:"#1a1a1a",borderColor:"#333333",color:"#e6e6e6"}}>
                      ▶ Escuchar acorde
                    </button>
                  </div>

                  <DondeVive chord={chord}/>

                  <div className="flex items-center gap-3">
                    <p className="text-xs text-gray-500 uppercase tracking-widest">
                      Funciones armónicas <span className="text-gray-700">({fns.length})</span>
                    </p>
                    <div className="flex gap-1 ml-auto">
                      {["Detalle","Tabla"].map((v,vi)=>(
                        <button key={v} onClick={()=>setShowTable(vi===1)}
                          className="px-3 py-1 rounded-lg text-xs border"
                          style={{background:showTable===(vi===1)?"#1a1a1a":"transparent",
                            borderColor:showTable===(vi===1)?"#e6e6e6":"#333",
                            color:showTable===(vi===1)?"#e6e6e6":"#666"}}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {showTable
                    ?<TablaComparativa fns={fns} root={chord.root}/>
                    :<div className="space-y-2">
                        {fns.map((f,i)=>(
                          <FnCard key={i} fn={f} root={chord.root} intervalos={chord.formula.intervals}
                            isOpen={openFns.includes(i)} onToggle={()=>toggleFn(i)}/>
                        ))}
                      </div>
                  }

                  <div className="rounded-xl p-4 border border-gray-800" style={{background:"#121212"}}>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Círculo de Quintas</p>
                    <Circulo highlighted={[chord.root]}/>
                  </div>
                </>}
              </div>
            )}

            {/* ══ PROGRESIÓN ══ */}
            {tab==="prog"&&(
              <div className="space-y-5 stagger">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Acordes separados por guion, coma o espacio</p>
                  <div className="flex gap-2">
                    <input value={progInput} onChange={e=>setProgInput(e.target.value)}
                      onKeyDown={e=>e.key==="Enter"&&analyzeProg()}
                      placeholder="Ej: Dm7 – G7 – Cmaj7"
                      className="glow-input flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-lg"
                      style={{fontFamily:"monospace"}}/>
                    <button onClick={analyzeProg}
                      className="px-5 py-3 rounded-xl text-sm font-bold"
                      style={{background:"#1a1a1a",border:"1px solid #e6e6e6",color:"#e6e6e6"}}>
                      Analizar
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["Dm7 – G7 – Cmaj7","Am7b5 – D7b9 – Gm","Cmaj7 – A7 – Dm7 – G7","Am – E7 – Am – Dm"].map(ex=>(
                      <button key={ex} onClick={()=>setProgInput(ex)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-700 text-gray-500 hover:text-gray-300">
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>

                {progression&&(
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 uppercase tracking-widest">
                      Tonalidad probable:
                      <span className="ml-2 text-[#d4d4d4] font-bold text-base">{progression[0]?.key}</span>
                      {progression.alternativa&&<span className="ml-3 text-xs normal-case tracking-normal text-gray-500">también se puede leer en {progression.alternativa}</span>}
                    </p>
                    {progression.map((ch,i)=>{
                      const f=ch.fn;
                      const scale=f?.modeIvs?buildScale(ch.root,f.modeIvs):[];
                      const twn=(f?.tensions||[]).map(t=>({label:t,note:tNote(ch.root,t)}));
                      const v=buildVoicing(ch.root,ch.quality);
                      // Acordes diatónicos de la escala del modo (calidad calculada con las notas reales)
                      const padre=["Jónico","Dórico","Frigio","Lidio","Mixolidio","Eólico","Locrio"].indexOf(f?.mode);
                      const dia=scale.length===7?acordesDeNotas(scale).map((d,si)=>{
                        const md=padre>=0?MODE_BY_DEGREE[(padre+si)%7]:null;
                        return{root:d.raiz,degree:romSept(si,d.sq),qid:d.sq,quality:SUF_CORTO[d.sq]??"",mode:md?md.name:"",chNotes:d.sept,
                          tens:md?md.tensions.map(t=>({label:t,note:tNote(d.raiz,t)})):[],avd:md?md.avoid.map(t=>({label:t,note:tNote(d.raiz,t)})):[]};
                      }):[];

                      return(
                        <div key={i} className="rounded-2xl border border-gray-700 overflow-hidden" style={{background:"#121212"}}>
                          <div className="px-4 pt-4 pb-3 border-b border-gray-800">
                            <div className="flex items-baseline gap-3 mb-3 flex-wrap">
                              <span className="text-2xl font-bold" style={{fontFamily:"'Libre Baskerville',serif"}}>{ch.raw}</span>
                              <button onClick={()=>playChord(ch.notes)} className="text-sm text-gray-600 hover:text-[#d4d4d4]">▶</button>
                              <span className="text-xs px-2.5 py-1 rounded-full border"
                                style={{background:"#232323",borderColor:"#e6e6e6",color:"#e6e6e6"}}>
                                {ch.degree} en {ch.key}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {ch.notes.map(n=><Nota key={n} note={n} size="sm"/>)}
                            </div>
                            {f&&(
                              <div className="text-sm flex flex-wrap gap-x-4 gap-y-1">
                                <span><span className="text-[#a3a3a3]">Modo: </span><span className="text-white font-semibold">{f.mode}</span></span>
                                {twn.length>0&&(
                                  <span className="flex gap-1.5 flex-wrap items-center">
                                    <span className="text-gray-500">Tensiones:</span>
                                    {twn.map(({label,note},j)=>{
                                      const color=note?nc(note):"#888";
                                      return(
                                        <span key={j} className="font-mono text-xs px-1.5 py-0.5 rounded border"
                                          style={{background:color+"18",borderColor:color+"55",color}}>
                                          {label}{note?`→${note}`:""}
                                        </span>
                                      );
                                    })}
                                  </span>
                                )}
                                {f.avoid?.length>0&&(
                                  <span className="text-xs text-red-400">
                                    Evitar: {f.avoid.map(t=>{const n=tNote(ch.root,t);return n?`${t}→${n}`:t;}).join(" · ")}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Acordes diatónicos */}
                          {dia.length>0&&(
                            <div className="px-4 py-3">
                              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
                                Acordes diatónicos — {scale.join(" · ")}
                              </p>
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs" style={{minWidth:"460px"}}>
                                  <thead>
                                    <tr style={{borderBottom:"1px solid #1a1a1a"}}>
                                      {["Gr.","Acorde","Notas","Modo","Tensiones","Evitar"].map(h=>(
                                        <th key={h} className="text-left pb-1.5 text-gray-600 font-normal">{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {dia.map((dc,di)=>{
                                      const rc=nc(dc.root);
                                      return(
                                        <tr key={di} style={{borderBottom:"1px solid #121212",background:di%2===0?"transparent":"#0a0a0a"}}>
                                          <td className="py-1.5 pr-2">
                                            <span className="font-mono font-bold px-1.5 py-0.5 rounded"
                                              style={{background:"#1a1a1a",color:"#e6e6e6",border:"1px solid #2a2a2e"}}>{dc.degree}</span>
                                          </td>
                                          <td className="py-1.5 pr-2">
                                            <button className="font-bold hover:opacity-75" style={{color:"#ececec",fontSize:13}}
                                              onClick={()=>{const c=parseChord(`${dc.root}${QUAL_TXT[dc.qid]||""}`);if(c)playChord(c.notes);}}>
                                              {fmtNota(dc.root)}{dc.quality||(dc.qid==="?"?"":"")} ▶
                                            </button>
                                          </td>
                                          <td className="py-1.5 pr-2">
                                            <div className="flex gap-1 flex-wrap">
                                              {dc.chNotes.map((n,ni)=>(<NotaDot key={ni} note={n} size={24}/>))}
                                            </div>
                                          </td>
                                          <td className="py-1.5 pr-2 text-[#a3a3a3] whitespace-nowrap">{dc.mode}</td>
                                          <td className="py-1.5 pr-2">
                                            <div className="flex gap-0.5 flex-wrap">
                                              {dc.tens.map(({label,note},ti)=>(<TensionChip key={ti} label={label} note={note} tipo="ok"/>))}
                                              {!dc.tens.length&&<span className="text-gray-700">—</span>}
                                            </div>
                                          </td>
                                          <td className="py-1.5">
                                            <div className="flex gap-0.5 flex-wrap">
                                              {dc.avd.map(({label,note},ai)=>(<TensionChip key={ai} label={label} note={note} tipo="no"/>))}
                                              {!dc.avd.length&&<span className="text-gray-700">—</span>}
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ══ BIBLIOTECA ══ */}
            {tab==="biblioteca"&&(
              <div className="space-y-4 stagger">
                <div>
                  <h2 className="text-xl font-bold mb-1" style={{fontFamily:"'Libre Baskerville',serif"}}>
                    <span style={{color:"#e6e6e6"}}>📚</span>
                    <span className="ml-2">Biblioteca de Progresiones</span>
                  </h2>
                  <p className="text-sm text-gray-500">Progresiones del tango, jazz y música latinoamericana. Hacé click para analizar.</p>
                </div>

                {/* Selector de género */}
                <div className="flex gap-2 flex-wrap">
                  {BIBLIOTECA.map(g=>(
                    <button key={g.genero} onClick={()=>setBibGenero(g.genero)}
                      className="px-3 py-1.5 rounded-xl text-sm font-semibold border"
                      style={{
                        background:bibGenero===g.genero?g.color+"33":"transparent",
                        borderColor:bibGenero===g.genero?g.color:"#333",
                        color:bibGenero===g.genero?g.color:"#666",
                      }}>
                      {g.icon} {g.genero}
                    </button>
                  ))}
                </div>

                {/* Progresiones del género */}
                {BIBLIOTECA.filter(g=>g.genero===bibGenero).map(g=>(
                  <div key={g.genero} className="space-y-3">
                    {g.items.map((item,i)=>{
                      const parts=item.prog.split(/[\s–\-,|]+/).filter(Boolean);
                      const parsed=parts.map(p=>parseChord(p)).filter(Boolean);
                      return(
                        <div key={i} className="rounded-xl border border-gray-700 overflow-hidden" style={{background:"#121212"}}>
                          <div className="px-4 py-3">
                            <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                              <div className="min-w-0">
                                <p className="font-bold text-sm text-gray-200">{item.titulo}</p>
                                {item.nota&&<p className="text-xs text-gray-500 italic mt-0.5">{item.nota}</p>}
                              </div>
                              <div className="flex gap-1.5 flex-shrink-0">
                                <button onClick={()=>{
                                  let d=0;
                                  parsed.forEach(ch=>{setTimeout(()=>playChord(ch.notes),d);d+=700;});
                                }}
                                  className="px-2.5 py-1 rounded-lg text-xs border"
                                  style={{background:"#1a1a1a",borderColor:"#333333",color:"#e6e6e6"}}>
                                  ▶
                                </button>
                                <button onClick={()=>{
                                  setProgInput(item.prog);
                                  setTab("prog");
                                  setTimeout(()=>{
                                    const prs=item.prog.split(/[\s–\-,|]+/).filter(Boolean).map(p=>parseChord(p)).filter(Boolean);
                                    if(prs.length>0)setProgression(computeProg(prs));
                                  },50);
                                }}
                                  className="px-2.5 py-1 rounded-lg text-xs border font-semibold"
                                  style={{background:"#1a1a1a",borderColor:"#e6e6e6",color:"#e6e6e6"}}>
                                  Analizar →
                                </button>
                              </div>
                            </div>
                            {/* Acordes con colores */}
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {parsed.map((ch,ci)=>(
                                <button key={ci} onClick={()=>playChord(ch.notes)}
                                  className="px-2.5 py-1 rounded-lg border font-bold text-xs"
                                  style={{backgroundColor:nc(ch.root)+"22",borderColor:nc(ch.root)+"66",color:nc(ch.root)}}>
                                  {ch.raw}
                                </button>
                              ))}
                            </div>
                            {/* Puntos de notas */}
                            <div className="flex gap-1 flex-wrap">
                              {parsed.map((ch,ci)=>(
                                <div key={ci} className="flex gap-0.5 items-center">
                                  {ch.notes.map((n,ni)=>(
                                    <div key={ni} className="w-2 h-2 rounded-full"
                                      style={{background:nc(n)}} title={n}/>
                                  ))}
                                  {ci<parsed.length-1&&<span className="text-gray-700 mx-1 text-xs">–</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
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
