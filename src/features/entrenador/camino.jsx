// El camino sobre los teclados (escalas, arpegios y la distribución de voces con su cifrado): pintar, tocar con metrónomo y repartir notas, sacado tal cual en la fase 6.

import { CHROMATIC, nombreLat } from "./shared/teoria/notas.js";
import { nc } from "./shared/teoria/color.js";
import { getCtx, playBandDur, playClick } from "./shared/audio/audio.js";
import { BTN_SIZE } from "./shared/bandoneon/layouts.js";
import { FIGURAS, octDeMidi, vozCifrar, vozLeer } from "./shared/bandoneon/camino.js";
import { CROM_SIMPLE } from "./shared/teoria/etiquetas.js";

export function useCaminoEntrenador({ acorde, bellows, cam, camBpm, camBus, camFig, camMapa, camMetro, camParar, camSent, camSuena, camTimers, flechasModo, itemDe, modo, setCamElige, setCamSuena, setVoz, setVozMsg, tocarItem, view, voz, vozNotas, vozTxt }) {
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
  return { camEscuchar, camFlechas, camNotaTxt, camStateOf, camTap, vozAcorde, vozCargar, vozCfg, vozCif, vozCopiar, vozSet };
}
