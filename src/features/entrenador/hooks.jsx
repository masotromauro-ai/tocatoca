// El estado del Entrenador y la lógica de sus ejercicios (teclado, escalas, líneas, práctica, notas y forma), sacados tal cual en la fase 6 para que ningún archivo pase de 400 líneas.

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { CHROMATIC, LAT, buildScale, nombreLat, noteIdx } from "./shared/teoria/notas.js";
import { nc } from "./shared/teoria/color.js";
import { getCtx, playBand, playBandDur } from "./shared/audio/audio.js";
import { itemsMano } from "./shared/bandoneon/tablas.js";
import { BTN_SIZE } from "./shared/bandoneon/layouts.js";
import { loadBtns } from "./shared/bandoneon/almacen.js";
import { ESC_ENT, armarVoz, caminoArpegio, caminoEscala, caminoNotas, rutaEscala } from "./shared/bandoneon/camino.js";
import { FORMA_TOL, LIN_COLS, lineasDe, matchForma } from "./features/entrenador/ayudas/formas.jsx";
import { CROM_SIMPLE, GRADO_LABEL, txtSobre } from "./shared/teoria/etiquetas.js";
import { aRomano } from "./shared/teoria/romanos.js";
import { useRomanos } from "./shared/almacen/romanos.js";
import { ESCALAS_HERO } from "./shared/ui/codigo/paleta.jsx";
import { useAcorde } from "./shared/bandoneon/armador.jsx";
import { calcAnchos, useAnchoMedido, useDisposicion } from "./shared/bandoneon/disposicion.jsx";

export function useEntrenador({ preset }) {
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
  return { acoInvOk, acoUltimo, acorde, allButtons, an, bellows, cam, camBpm, camBus, camDef, camFig, camLey, camLong, camMapa, camMetro, camOctL, camOctR, camParar, camSent, camSuena, camTimers, checked, chordProps, closePicker, copied, correctOf, disp, dispo, erase, esCam, escDir, escMano, escModo, escRoot, escStart, escTimers, escTipo, escUltimo, faltanTones, formaGrid, formaPts, formaTol, guesses, info, isMobile, kbW, keyOf, lateral, leftBtns, modo, nTonosArp, notaGuess, notaPicker, openPicker, pedirOct, pickColor, picker, prog, reveal, rg, rightBtns, romano, selBad, selected, setAcoInv, setBellows, setCamBpm, setCamElige, setCamFig, setCamLey, setCamLong, setCamMetro, setCamOctL, setCamOctR, setCamSent, setCamSuena, setChecked, setChordSel, setCopied, setEscDir, setEscMano, setEscModo, setEscRoot, setEscStart, setEscTipo, setFormaGrid, setFormaPts, setFormaTol, setGuesses, setInfo, setModo, setNotaGuess, setNotaPicker, setPedirOct, setProg, setReveal, setRomano, setView, setVoz, setVozMsg, setVozTxt, toggleSel, view, vis, voz, vozMsg, vozNotas, vozTxt, wrapRef };
}

export function useEscalasEntrenador({ bellows, escDir, escMano, escRoot, escStart, escTipo, leftBtns, modo, rightBtns }) {
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
  return { escBtns, escDef, escDeletreo, escIdxById, escIvs, escNombres, escPcSet, escR, etiqueta, itemDe, tocarItem };
}

export function useLineasEntrenador({ bellows, flechasModo, itemDe, leftBtns, rightBtns, tocarItem }) {
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
  return { linEscuchar, linFlechas, linL, linR, linRot, linSel, linStateOf, linTap, linTipo, setLinRot, setLinSel, setLinTipo };
}

export function usePracticaEscalas({ bellows, escBtns, escDir, escIdxById, escIvs, escMano, escModo, escNombres, escPcSet, escR, escRoot, escStart, escTimers, escTipo, etiqueta, itemDe, preset, prog, romano, setInfo, setProg, tocarItem }) {
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
  return { dedos, escEscuchar, escStateOf, escTap, funcionDe, gradoTxt, notaOct, verDedo };
}

export function useNotasYForma({ checked, formaPts, formaTol, itemDe, keyOf, leftBtns, modo, notaGuess, notaPicker, pedirOct, reveal, rightBtns, setChecked, setFormaPts, setNotaGuess, setNotaPicker, view, vis }) {
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
  return { borrarNota, formaBien, formaExtra, formaFalta, formaPuestos, formaTot, notaBien, notaPuestas, notaStateOf, setFormaH, setNota };
}
