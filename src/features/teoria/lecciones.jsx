// Las seis lecciones de Teoría.

import { useState } from "react";
import { FigSvg, TEO_GRADOS_MAYOR, TEO_GRADOS_MENOR, TeoNota, WCOL_TEO, teoAscender, teoBox, teoP, useTeoSeq } from "./piezas.jsx";
import { CHROMATIC, buildScale, nombreLat, noteIdx } from "../../shared/teoria/notas.js";
import { uiLabel, uiPill, uiPlay, uiVista } from "../../shared/ui/tema.js";
import { playTone } from "../../shared/audio/audio.js";
import { parseChord } from "../../shared/teoria/acordes.js";
import { TONICAS_MAYOR, TONICAS_MENOR, acordesDiatonicos, nombreAcordeEs, romTri } from "../../shared/teoria/progresiones.js";
import { Desplegable } from "../../shared/ui/ayudas.jsx";

export function TeoL1(){
  const {parar,tras}=useTeoSeq(); const [vivo,setVivo]=useState(null);   // {que, i}
  const ritmo=()=>{ parar(); const d=[1,1,.5,.5,1], pulso=0.62; let t=0; d.forEach((x,i)=>{ tras(t*1000,()=>{ playTone("C",5,0.12); setVivo({que:"ritmo",i}); }); t+=x*pulso; }); tras(t*1000,()=>setVivo(null)); };
  const melodia=()=>{ parar(); const n=[0,2,4,7,4,2,0]; n.forEach((pc,i)=>tras(i*430,()=>{ playTone(CHROMATIC[pc],4,0.5); setVivo({que:"melodia",i}); })); tras(n.length*430,()=>setVivo(null)); };
  const armonia=()=>{ parar(); [[0,4,7],[5,9,0],[7,11,2]].forEach((ch,k)=>tras(k*1200,()=>{ setVivo({que:"armonia",i:k}); teoAscender(ch,4).forEach((x,j)=>tras(0,()=>playTone(CHROMATIC[x.pc],x.oct,1.0))); })); tras(3600,()=>setVivo(null)); };
  const on=(q,i)=>vivo&&vivo.que===q&&vivo.i===i;
  const Card=({t,txt,f,children})=>(<div style={{...teoBox,flex:"1 1 190px",marginBottom:0}}><p style={{margin:"0 0 4px",fontFamily:"'Libre Baskerville',serif",fontWeight:700,fontSize:18,color:"#ececec"}}>{t}</p><p style={{...teoP,fontSize:15,margin:"0 0 10px"}}>{txt}</p>{children}<div style={{marginTop:10}}><button style={uiPlay(false,{padding:"5px 14px"})} onClick={f}>▶ Escuchar</button></div></div>);
  return (<div>
    <p style={teoP}>La música es el arte de combinar sonidos y silencios en el tiempo. Se apoya en tres elementos:</p>
    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
      <Card t="Ritmo" txt="Cómo se ordenan los sonidos en el tiempo: pulso y duraciones." f={ritmo}>
        <div style={{display:"flex",gap:4,alignItems:"flex-end",height:46}}>{[1,1,.5,.5,1].map((d,i)=>(<div key={i} style={{width:d*40,height:on("ritmo",i)?44:30,borderRadius:6,background:on("ritmo",i)?"#2dd4bf":"#2e2e34",transition:"all .08s"}}/>))}</div></Card>
      <Card t="Melodía" txt="Sonidos de distinta altura, uno detrás del otro." f={melodia}>
        <div style={{display:"flex",gap:4}}>{[0,2,4,7,4,2,0].map((pc,i)=>(<div key={i} style={{width:24,height:24+(on("melodia",i)?10:0)+[0,1,2,4,2,1,0][i]*4,borderRadius:7,background:WCOL_TEO[pc],opacity:on("melodia",i)?1:.55,alignSelf:"flex-end",transition:"all .1s"}}/>))}</div></Card>
      <Card t="Armonía" txt="Sonidos al mismo tiempo: los acordes." f={armonia}>
        <div style={{display:"flex",gap:10}}>{[[0,4,7],[5,9,0],[7,11,2]].map((ch,k)=>(<div key={k} style={{display:"flex",flexDirection:"column-reverse",gap:3,opacity:on("armonia",k)?1:.5,transition:"opacity .15s"}}>{ch.map(pc=><div key={pc} style={{width:28,height:14,borderRadius:5,background:WCOL_TEO[pc]}}/>)}</div>))}</div></Card>
    </div>
    <p style={{...teoP,marginTop:14}}>Una canción usa los tres a la vez: el <b style={{color:"#ececec"}}>ritmo</b> la hace avanzar, la <b style={{color:"#ececec"}}>melodía</b> es lo que se canta, y la <b style={{color:"#ececec"}}>armonía</b> la acompaña.</p>
  </div>);
}

export function TeoL2(){
  const {parar,tras}=useTeoSeq(); const [bpm,setBpm]=useState(80); const [sono,setSono]=useState(null);
  const FIG=[["redonda","Redonda",4,"4 pulsos"],["blanca","Blanca",2,"2 pulsos"],["negra","Negra",1,"1 pulso"],["corchea","Corchea",.5,"medio pulso"],["semicorchea","Semicorchea",.25,"un cuarto de pulso"]];
  const tocar=(id,p)=>{ parar(); const pul=60/bpm, cuantas=Math.round(4/p); setSono(id); for(let i=0;i<cuantas;i++) tras(i*p*pul*1000,()=>playTone("C",i%(cuantas/Math.min(cuantas,4)||1)===0?5:4,Math.min(p*pul*0.9,1.6))); tras(4*pul*1000+200,()=>setSono(null)); };
  return (<div>
    <p style={teoP}>Cada figura indica cuánto dura un sonido. Se mide en <b style={{color:"#ececec"}}>pulsos</b>: el latido regular que sentís cuando marcás el paso. Tomando la negra como un pulso:</p>
    <div style={teoBox}>
      {FIG.map(([id,nom,p,txt])=>(
        <div key={id} style={{display:"flex",alignItems:"center",gap:12,padding:"7px 0",borderTop:id==="redonda"?"none":"1px solid #1c1c1f",flexWrap:"wrap"}}>
          <FigSvg id={id}/>
          <div style={{width:130}}><b style={{color:"#ececec",fontFamily:"'Libre Baskerville',serif"}}>{nom}</b><div style={{fontSize:12,color:"#8a8a90"}}>dura {txt}</div></div>
          <div style={{flex:"1 1 120px",height:14,background:"#1b1b20",borderRadius:7,overflow:"hidden"}}><div style={{width:`${p/4*100}%`,height:"100%",background:sono===id?"#2dd4bf":"#5a5a64",borderRadius:7,transition:"background .15s"}}/></div>
          <button style={uiPlay(false,{padding:"4px 12px",fontSize:11.5})} onClick={()=>tocar(id,p)}>▶ Un compás</button>
        </div>))}
    </div>
    <div style={{display:"flex",alignItems:"center",gap:12,margin:"0 0 12px",flexWrap:"wrap"}}><span style={{...uiLabel,fontSize:10}}>Velocidad</span><input type="range" min="50" max="140" value={bpm} onChange={e=>setBpm(+e.target.value)} style={{width:180}}/><span style={{fontFamily:"monospace",color:"#ececec"}}>♩ = {bpm}</span></div>
    <p style={teoP}>Los pulsos se agrupan en <b style={{color:"#ececec"}}>compases</b>. En un compás de 4/4 caben cuatro negras, o dos blancas, o una redonda. Cada figura tiene también su <b style={{color:"#ececec"}}>silencio</b>: dura lo mismo, pero no suena.</p>
  </div>);
}

export function TeoL3(){
  const [a,setA]=useState(null); const [b,setB]=useState(null);
  const pick=(pc)=>{ playTone(CHROMATIC[pc],4,0.6); if(a===null||b!==null){ setA(pc); setB(null); } else setB(pc); };
  const d=a!==null&&b!==null?((b-a+12)%12):null;
  const NOMD=["la misma nota","1 semitono","1 tono","1 tono y 1 semitono","2 tonos","2 tonos y 1 semitono","3 tonos (tritono)","3 tonos y 1 semitono","4 tonos menos 1 semitono","4 tonos","5 tonos menos 1 semitono","5 tonos y 1 semitono"];
  return (<div>
    <p style={teoP}>Hay <b style={{color:"#ececec"}}>doce sonidos</b> distintos antes de que todo se repita una octava más arriba. La distancia más chica entre dos de ellos es el <b style={{color:"#ececec"}}>semitono</b>; dos semitonos forman un <b style={{color:"#ececec"}}>tono</b>.</p>
    <div style={teoBox}>
      <div style={{display:"flex",gap:4}}>{CHROMATIC.map((n,pc)=>{ const sel=pc===a||pc===b; return (
        <div key={n} onClick={()=>pick(pc)} style={{flex:1,minWidth:0,cursor:"pointer",textAlign:"center"}}>
          <div style={{height:44,borderRadius:8,background:WCOL_TEO[pc],border:sel?"3px solid #fff":"1px solid rgba(255,255,255,.2)",boxShadow:sel?"0 0 12px rgba(255,255,255,.35)":"none"}}/>
          <div style={{fontSize:10,color:"#bdbdc6",fontFamily:"serif",marginTop:3,whiteSpace:"nowrap"}}>{nombreLat(n)}</div></div>); })}</div>
      <p style={{...teoP,fontSize:15,margin:"12px 0 0",minHeight:24}}>{a===null?"Tocá una nota y después otra para medir la distancia entre las dos.":b===null?`Elegiste ${nombreLat(CHROMATIC[a])}. Ahora tocá otra.`:`De ${nombreLat(CHROMATIC[a])} a ${nombreLat(CHROMATIC[b])} (subiendo) hay ${NOMD[d]}.`}</p>
    </div>
    <p style={teoP}>Un <b style={{color:"#ececec"}}>sostenido</b> (♯) sube la nota un semitono y un <b style={{color:"#ececec"}}>bemol</b> (♭) la baja un semitono. Por eso Do♯ y Re♭ son el mismo sonido con dos nombres: a eso se le llama <i>enarmonía</i>. Entre Mi y Fa, y entre Si y Do, no hay nota en el medio: son semitonos naturales.</p>
  </div>);
}

export function TeoL4(){
  const {parar,tras}=useTeoSeq(); const [menor,setMenor]=useState(false); const [tn,setTn]=useState("C"); const [vivo,setVivo]=useState(-1);
  const lista=menor?TONICAS_MENOR:TONICAS_MAYOR, ton=lista.includes(tn)?tn:lista[noteIdx(tn)];
  const ivs=menor?[0,2,3,5,7,8,10]:[0,2,4,5,7,9,11], notas=buildScale(ton,ivs), pcs=notas.map(noteIdx), gr=menor?TEO_GRADOS_MENOR:TEO_GRADOS_MAYOR;
  const pasos=ivs.map((x,i)=>((ivs[i+1]??12)-x)===2?"T":"S");
  const escuchar=()=>{ parar(); const arr=teoAscender([...pcs,pcs[0]],4); arr.forEach((x,i)=>tras(i*420,()=>{ playTone(CHROMATIC[x.pc],x.oct,0.5); setVivo(i); })); tras(arr.length*420,()=>setVivo(-1)); };
  return (<div>
    <p style={teoP}>Una <b style={{color:"#ececec"}}>escala</b> es una serie ordenada de notas. Cada una es un <b style={{color:"#ececec"}}>grado</b> y se nombra con un número romano; el primero es la <b style={{color:"#ececec"}}>tónica</b>, la nota donde la escala «descansa».</p>
    <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end",marginBottom:10}}>
      <div style={{display:"flex",background:"#0e0e10",border:"1px solid #2f2f35",borderRadius:8,padding:2,gap:2}}>{[[false,"Mayor"],[true,"Menor natural"]].map(([v,l])=>(<button key={l} style={uiVista(menor===v,{padding:"4px 12px"})} onClick={()=>setMenor(v)}>{l}</button>))}</div>
      <Desplegable ancho={90} etiqueta="Tónica" valor={ton} opciones={lista.map(x=>[x,nombreLat(x)])} onChange={setTn}/>
      <button style={uiPlay(false,{padding:"6px 16px"})} onClick={escuchar}>▶ Escuchar la escala</button>
    </div>
    <div style={{...teoBox,overflowX:"auto"}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:0,minWidth:560}}>
        {[...notas,notas[0]].map((n,i)=>(<div key={i} style={{display:"flex",alignItems:"flex-start"}}>
          <div style={{textAlign:"center",width:56,opacity:vivo<0||vivo===i?1:.45,transition:"opacity .1s"}}>
            <TeoNota pc={pcs[i%7]} txt={nombreLat(n)} size={48}/>
            <div style={{fontFamily:"monospace",fontWeight:800,color:"#ececec",fontSize:13,marginTop:4}}>{i===7?"I":gr[i][0]}</div>
            <div style={{fontSize:10,color:"#8a8a90"}}>{i===7?"octava":gr[i][1]}</div></div>
          {i<7&&<div style={{width:20,height:48,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,fontFamily:"monospace",color:pasos[i]==="S"?"#f2c14e":"#9a9aa2"}}>{pasos[i]}</div>}
        </div>))}
      </div>
    </div>
    <p style={teoP}>La fórmula de la escala <b style={{color:"#ececec"}}>mayor</b> es siempre la misma: <b style={{color:"#ececec"}}>T T S T T T S</b> (tono, tono, semitono…). La <b style={{color:"#ececec"}}>menor natural</b> es <b style={{color:"#ececec"}}>T S T T S T T</b>. Cambiando la tónica, la fórmula se traslada a cualquier tonalidad.</p>
  </div>);
}

export function TeoL5({irA}){
  const {parar,tras}=useTeoSeq(); const [raiz,setRaiz]=useState("C");
  const tocarPcs=(pcs,arp)=>{ parar(); teoAscender(pcs,3).forEach((x,i)=>tras(arp?i*380:i*15,()=>playTone(CHROMATIC[x.pc],x.oct,arp?0.6:1.4))); };
  const tipos=[["","Mayor","3ª mayor + 5ª justa"],["m","Menor","3ª menor + 5ª justa"],["maj7","Mayor con 7ª mayor (△7)","tríada mayor + 7ª mayor"],["7","Dominante (7)","tríada mayor + 7ª menor"]];
  const dia=acordesDiatonicos(raiz,"mayor");
  const ROLES=["Raíz","3ª","5ª","7ª"];
  return (<div>
    <p style={teoP}>Un <b style={{color:"#ececec"}}>acorde</b> son tres o más notas sonando juntas. Se arman <b style={{color:"#ececec"}}>apilando terceras</b>: partís de una nota (la <b style={{color:"#ececec"}}>raíz</b>), saltás una nota de la escala y tomás la siguiente, y repetís. Con tres notas es una <b style={{color:"#ececec"}}>tríada</b>: raíz, 3ª y 5ª.</p>
    <div style={{marginBottom:10}}><Desplegable ancho={90} etiqueta="Raíz" valor={raiz} opciones={TONICAS_MAYOR.map(x=>[x,nombreLat(x)])} onChange={setRaiz}/></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:10,marginBottom:12}}>
      {tipos.map(([suf,nom,regla])=>{ const ch=parseChord(raiz+suf); if(!ch) return null; const pcs=ch.notes.map(noteIdx); return (
        <div key={suf||"M"} style={{...teoBox,marginBottom:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:6}}><b style={{fontFamily:"'Libre Baskerville',serif",color:"#ececec",fontSize:16}}>{nombreLat(raiz)} {({"":"mayor",m:"menor",maj7:"△7","7":"7"})[suf]}</b></div>
          <div style={{fontSize:11.5,color:"#8a8a90",margin:"2px 0 10px"}}>{nom} · {regla}</div>
          <div style={{display:"flex",flexDirection:"column-reverse",gap:6}}>
            {ch.notes.map((n,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:10}}><TeoNota pc={pcs[i]} txt={nombreLat(n)} size={34}/><span style={{fontSize:12,color:"#9a9aa2"}}>{ROLES[i]}</span></div>))}
          </div>
          <div style={{display:"flex",gap:6,marginTop:10}}><button style={uiPlay(false,{padding:"4px 12px",fontSize:11.5})} onClick={()=>tocarPcs(pcs,false)}>▶ Juntas</button><button style={uiPlay(false,{padding:"4px 12px",fontSize:11.5})} onClick={()=>tocarPcs(pcs,true)}>▶ Una por una</button></div>
        </div>); })}
    </div>
    <p style={teoP}>Si apilás terceras sobre <b style={{color:"#ececec"}}>cada grado de una escala</b>, obtenés un acorde por grado. En {nombreLat(raiz)} mayor son:</p>
    <div style={{...teoBox,display:"flex",gap:8,flexWrap:"wrap"}}>
      {dia.map(d=>(<button key={d.i} onClick={()=>tocarPcs(d.pcs.slice(0,3),false)} style={{minWidth:78,padding:"6px 8px 7px",borderRadius:10,cursor:"pointer",textAlign:"center",background:"#0e0e10",border:"1px solid #2c2c30",borderTop:`4px solid ${WCOL_TEO[d.pc]}`,color:"#ececec"}}>
        <div style={{fontSize:10,fontFamily:"monospace",color:"#9a9aa2",fontWeight:700}}>{romTri(d.i,d.tq)}</div><div style={{fontSize:12.5,fontWeight:700,fontFamily:"'Libre Baskerville',serif"}}>{nombreAcordeEs(d.raiz,d.tq)}</div></button>))}
    </div>
    <p style={{...teoP,fontSize:15}}>Tocá cada uno para escucharlo. Mayúscula = acorde mayor, minúscula = menor, ° = disminuido. Para verlos en el teclado, andá a <b style={{color:"#ececec"}}>Entrenador → Acordes → Armonizar</b>.</p>
  </div>);
}

export function TeoL6({irA}){
  const GL=[["Pulso","El latido regular de la música."],["Compás","Agrupación de pulsos; en 4/4 caben cuatro negras."],["Figura","Símbolo que indica cuánto dura un sonido."],["Semitono","La distancia más chica entre dos notas."],["Tono","Dos semitonos."],["Escala","Serie ordenada de notas con una fórmula de tonos y semitonos."],["Grado","Cada nota de la escala, con su número romano."],["Tónica","El primer grado: la nota de reposo."],["Acorde","Tres o más notas sonando juntas."],["Tríada","Acorde de tres notas: raíz, 3ª y 5ª."],["Raíz","La nota sobre la que se arma el acorde."],["Enarmonía","Dos nombres para el mismo sonido (Do♯ y Re♭)."]];
  return (<div>
    <p style={teoP}>Con estas nociones ya podés entrar a las escalas y los acordes en el bandoneón.</p>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
      <button style={uiPill(true,{padding:"9px 18px"})} onClick={()=>irA("bandoneon")}>♬ El mapa del bandoneón</button>
      <button style={uiPill(false,{padding:"9px 18px"})} onClick={()=>irA("entrenador")}>◎ Entrenador: escalas y acordes</button>
    </div>
    <div style={teoBox}><p style={{...uiLabel,margin:"0 0 8px"}}>Glosario</p>
      {GL.map(([t,d],i)=>(<div key={t} style={{display:"flex",gap:12,padding:"6px 0",borderTop:i?"1px solid #1c1c1f":"none",flexWrap:"wrap"}}><b style={{minWidth:96,color:"#ececec",fontFamily:"'Libre Baskerville',serif"}}>{t}</b><span style={{flex:"1 1 220px",color:"#b4b4bc",fontSize:14}}>{d}</span></div>))}
    </div>
  </div>);
}
