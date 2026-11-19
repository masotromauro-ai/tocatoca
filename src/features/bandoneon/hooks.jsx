// Los tres bloques de lógica de la pestaña Bandoneón (sonido, escucha por micrófono y marcas), sacados tal cual para que ningún archivo pase de 400 líneas.

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { LAT, nombreLat } from "../../shared/teoria/notas.js";
import { getCtx, playBandDur, buscarMuestra, muestraVale, fuenteMuestra, precargarMuestras } from "../../shared/audio/audio.js";
import { RAIZ_NOM, analizarAcorde } from "../../shared/teoria/cifrado.js";
import { micEstimar, fuenteWorklet } from "../../shared/audio/mic.js";

export function useSonidoBandoneon({ bellows }) {
  const activeAudioRef = useRef({}); // { [btnId]: {gainMain, oscs[]} }
  const fuelleRef = useRef(bellows); fuelleRef.current = bellows;   // el fuelle de ahora, sin recrear startNote
  useEffect(()=>{ precargarMuestras(); },[]);                          // baja las muestras reales una sola vez
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
      // Si el botón tiene muestra real (mano + fuelle + botón), suena esa y se sostiene mientras el botón esté apretado
      const muestra=buscarMuestra(id.startsWith("L")?"izq":"der",fuelleRef.current,id);
      if(muestraVale(muestra,midi)){
        const src=fuenteMuestra(ctx,muestra);src.connect(gainMain);
        activeAudioRef.current[id]={gainMain,oscs:[src]};
        return;
      }
      // Sin muestra: el sintetizador de siempre. En las notas graves se refuerzan los armónicos para que se oigan también en parlantes chicos
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
  return { startNote, stopAllNotes, stopNote };
}

export function useEscuchaBandoneon({ LAT, bellows, getOct, heardMidis, isListening, leftBtns, micExacta, micMano, micModo, micOct, noteIdxB, rightBtns, setErrorAudio, setHeardMidis, setIsListening }) {
  const micCandsH=useMemo(()=>{
    const set=new Set(), add=(btns)=>btns.forEach(b=>{ const lat=bellows==="abre"?b.abre:b.cierra, pc=noteIdxB(LAT[lat]||lat); if(pc<0) return; set.add(12*(getOct(b,bellows)+1)+pc-12*micOct); });
    if(micMano!=="der") add(leftBtns); if(micMano!=="izq") add(rightBtns); return set;
  },[leftBtns,rightBtns,bellows,micMano,micOct,getOct]);
  const micRef=useRef({}); micRef.current={modo:micModo,cands:micCandsH,shift:micOct};
  // Fase 7: el worklet de la escucha recibe las notas candidatas cada vez que cambian.
  const nodoRef=useRef(null);
  useEffect(()=>{ if(nodoRef.current) nodoRef.current.port.postMessage({cands:[...micCandsH],maxN:micModo==="nota"?1:5}); },[micCandsH,micModo]);
  useEffect(()=>{
    if(!isListening){ setHeardMidis([]); return; }
    let audioCtx=null, stream=null, rafId=null, alive=true, ultimo=0, nodo=null; const hist=[];
    // Lo que se estimó en un cuadro: se confirma con los últimos 6 (igual con worklet o sin él)
    const recibir=(est)=>{
      if(!alive) return;
      hist.push(est); if(hist.length>6) hist.shift();
      const {shift}=micRef.current;
      const cuenta=new Map(); hist.forEach(a=>a.forEach(m=>cuenta.set(m,(cuenta.get(m)||0)+1)));
      const necesito=Math.min(4,Math.ceil(hist.length*0.6));
      const fin=[...cuenta].filter(([,c])=>c>=necesito).map(([m])=>m+12*shift).sort((x,y)=>x-y);
      setHeardMidis(prev=>(prev.length===fin.length&&prev.every((v,i)=>v===fin[i]))?prev:fin);
    };
    async function start(){
      try{
        // sin control automático de ganancia, supresión de ruido ni cancelación de eco: alteran el sonido sostenido
        stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false},video:false});
        if(!alive){ stream.getTracks().forEach(t=>t.stop()); return; }
        const AC=window.AudioContext||window.webkitAudioContext; audioCtx=new AC();
        if(audioCtx.state==="suspended") await audioCtx.resume();
        if(!alive){ audioCtx.close(); stream.getTracks().forEach(t=>t.stop()); return; }
        const src=audioCtx.createMediaStreamSource(stream);
        // Fase 7 (17-nov-2026): la escucha corre en un AudioWorklet, el hilo del audio, y no espera a que la
        // pantalla termine de dibujar. Si el navegador no lo tiene, sigue el camino de antes (más abajo).
        if(audioCtx.audioWorklet&&window.AudioWorkletNode){
          try{
            const url=URL.createObjectURL(new Blob([fuenteWorklet()],{type:"text/javascript"}));
            try{ await audioCtx.audioWorklet.addModule(url); } finally { URL.revokeObjectURL(url); }
            if(!alive) return;
            nodo=new AudioWorkletNode(audioCtx,"escucha-bandomaps",{numberOfInputs:1,numberOfOutputs:1,outputChannelCount:[1]});
            const mudo=audioCtx.createGain(); mudo.gain.value=0;
            src.connect(nodo); nodo.connect(mudo); mudo.connect(audioCtx.destination);   // conectado para que corra; no suena
            nodo.port.onmessage=(e)=>recibir(Array.isArray(e.data)?e.data:[]);
            const {modo,cands}=micRef.current; nodo.port.postMessage({cands:[...cands],maxN:modo==="nota"?1:5});
            nodoRef.current=nodo;
            return;
          }catch(e){ nodo=null; console.warn("Sin AudioWorklet, la escucha va por el camino de antes:",e); }
        }
        const analyser=audioCtx.createAnalyser();
        analyser.fftSize=16384; analyser.smoothingTimeConstant=0.3; analyser.minDecibels=-110; analyser.maxDecibels=-5;
        src.connect(analyser);
        const N=analyser.fftSize, db=new Float32Array(N/2), mag=new Float32Array(N/2);
        function tick(t){
          if(!alive) return;
          rafId=requestAnimationFrame(tick);
          if(t-ultimo<70) return; ultimo=t;
          analyser.getFloatFrequencyData(db);
          for(let i=0;i<db.length;i++) mag[i]=Math.pow(10,db[i]/20);
          const {modo,cands}=micRef.current;
          recibir(micEstimar(mag,audioCtx.sampleRate,N,cands,modo==="nota"?1:5));
        }
        rafId=requestAnimationFrame(tick);
      }catch(err){
        if(alive){ setErrorAudio("Error de micrófono: "+(err?.message??"permisos denegados")); setIsListening(false); }
      }
    }
    start();
    return()=>{ alive=false; nodoRef.current=null; if(nodo){ nodo.port.onmessage=null; try{ nodo.disconnect(); }catch(e){} } if(rafId) cancelAnimationFrame(rafId); if(stream) stream.getTracks().forEach(t=>t.stop()); if(audioCtx&&audioCtx.state!=="closed") audioCtx.close(); };
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
  return { heardAcorde, heardIdsL, heardIdsR, heardNotas, heardTxt };
}

export function useMarcasBandoneon({ LAT, bellows, getOct, leftBtns, noteIdxB, rightBtns }) {
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
  const marcarTecla=(btn)=>{ const note=bellows==="abre"?btn.abre:btn.cierra; playBandDur(note,getOct(btn,bellows),0.6,0,null,{mano:btn.id.startsWith("L")?"izq":"der",fuelle:bellows,boton:btn.id}); toggleMark(btn); };
  return { marcadas, marcar, marcarTecla, markIds, marksB, quitarMark, setMarcar, setMarks, toggleMark };
}
