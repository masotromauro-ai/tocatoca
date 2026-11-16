// Armar, armonizar y guardar acordes en el Entrenador (construir sobre el teclado, los grados de una escala, las formas sugeridas y «mis acordes»), sacado tal cual en la fase 6.

import { useState, useEffect, useMemo } from "react";
import { CLAVES } from "../../shared/claves.js";
import { CHROMATIC, buildScale, nombreLat, noteIdx, spell } from "../../shared/teoria/notas.js";
import { nc } from "../../shared/teoria/color.js";
import { uiPlay, uiTool } from "../../shared/ui/tema.js";
import { playBandDur } from "../../shared/audio/audio.js";
import { FORMULAS } from "../../shared/teoria/acordes.js";
import { ES_MENORQ, FAMILIAS, TONICAS_MAYOR, TONICAS_MENOR, acordesDeNotas, nombreAcordeEs, raizDefecto, romSept, romTri } from "../../shared/teoria/progresiones.js";
import { itemsMano } from "../../shared/bandoneon/tablas.js";
import { PATRONES_VOZ, ROL_TXT, voicingsDe } from "../../shared/bandoneon/voicings.js";
import { cifGuardarPropios, cifPropios } from "../../shared/almacen/preferencias.js";
import { RAIZ_NOM, analizarAcorde } from "../../shared/teoria/cifrado.js";
import { ESC_ENT } from "../../shared/bandoneon/camino.js";
import { CROM_SIMPLE, GRADO_LABEL, txtSobre } from "../../shared/teoria/etiquetas.js";

export function useAcordesEntrenador({ bellows, escRoot, escTipo, itemDe, leftBtns, rightBtns, setBellows, setModo, tocarItem }) {
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
  const [misAcordes,setMisAcordes]=useState(()=>{ try{ const v=JSON.parse(localStorage.getItem(CLAVES.misAcordes)||"[]"); return Array.isArray(v)?v:[]; }catch(e){ return []; } });
  useEffect(()=>{ try{ localStorage.setItem(CLAVES.misAcordes,JSON.stringify(misAcordes)); }catch(e){} },[misAcordes]);
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
  return { armAcordes, armCuat, armPatron, armRecorrer, armSel, armStateOf, armTap, armTocar, armTonica, armVoicings, armVoz, cardAbrir, cardGuardar, cardItems, cardTocar, conAn, conCopiar, conGuardar, conIds, conItems, conMsg, conNota, conPrimera, conQuitar, conRaiz, conStateOf, conTap, conTocar, conTxt, conVoicings, escTipo7, flechasModo, formasUI, guardarVoicing, matrizFilas, misAcordes, setArmCuat, setArmGrado, setArmMatriz, setArmPatron, setConNota, setConRaiz, setConSel, setConTxt, setConVer, setFlechasModo, setMisAcordes, setVozSel, tocarVoicing, tonicasArm, verVoicing, vozSel };
}
