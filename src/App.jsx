import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { CHROMATIC, nombreLat } from "./shared/teoria/notas.js";
import { nc } from "./shared/teoria/color.js";
import { UI_FONT, uiGhost, uiLabel, uiPill, uiPlay, uiVista } from "./shared/ui/tema.js";
import { playChord } from "./shared/audio/audio.js";
import { QUAL_TXT, getFns, parseChord } from "./shared/teoria/acordes.js";
import { computeProg } from "./shared/teoria/progresiones.js";
import { BIBLIOTECA } from "./features/herramientas/biblioteca/datos.js";
import { Nota } from "./shared/ui/teoria/notas.jsx";
import { ESC_ENT } from "./shared/bandoneon/camino.js";
import { PaintCanvas } from "./features/entrenador/ayudas/lienzo.jsx";
import { NotaPicker } from "./shared/ui/ayudas.jsx";
import { FORMA_NIVELES, FormaCanvas, LIN_TIPOS } from "./features/entrenador/ayudas/formas.jsx";
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
import { ArmadorAcordes } from "./shared/bandoneon/armador.jsx";
import { ControlesDisposicion } from "./shared/bandoneon/disposicion.jsx";
import { AvisoInicial } from "./features/aviso/AvisoInicial.jsx";
import { BandoneonTab } from "./features/bandoneon/BandoneonTab.jsx";
import { EjecucionTab } from "./features/bandoneon/EjecucionTab.jsx";
import { AcordeTab } from "./features/herramientas/acorde/AcordeTab.jsx";
import { ProgresionTab } from "./features/herramientas/progresion/ProgresionTab.jsx";
import { BibliotecaTab } from "./features/herramientas/biblioteca/BibliotecaTab.jsx";
import { useEntrenador, useEscalasEntrenador, useLineasEntrenador, usePracticaEscalas, useNotasYForma } from "./features/entrenador/hooks.jsx";
import { useAcordesEntrenador } from "./features/entrenador/acordes.jsx";
import { useCaminoEntrenador } from "./features/entrenador/camino.jsx";
import { PanelEscalas } from "./features/entrenador/paneles/escalas.jsx";
import { PanelCamino } from "./features/entrenador/paneles/camino.jsx";
import { PanelArpegio } from "./features/entrenador/paneles/arpegio.jsx";
import { PanelVoz } from "./features/entrenador/paneles/voz.jsx";
import { PanelConstruir } from "./features/entrenador/paneles/construir.jsx";
import { PanelLineas } from "./features/entrenador/paneles/lineas.jsx";
import { usePiezasEntrenador, usePanelesAcordes } from "./features/entrenador/piezas.jsx";
import { EntrenadorTab } from "./features/entrenador/EntrenadorTab.jsx";

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
    {id:"ejecucion",label:"Ejecución",icon:"▣"},
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

            {/* ══ EJECUCIÓN (pantalla completa) ══ */}
            {tab==="ejecucion"&&<EjecucionTab onSalir={()=>setTab("bandoneon")}/>}

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
