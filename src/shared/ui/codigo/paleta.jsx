// La rueda de la paleta de El Código.

import { useState, useEffect, useRef } from "react";
import { aRomano } from "../../teoria/romanos.js";
import { useRomanos } from "../../almacen/romanos.js";
import { cqPol, cqSector } from "../../teoria/quintas.js";
import { medir } from "../../medicion.js";
import { CHROMATIC, buildScale, nombreLat, noteIdx } from "../../teoria/notas.js";
import { nc } from "../../teoria/color.js";
import { UI_FONT, uiGhost, uiLabel, uiPill, uiPlay, uiVista } from "../tema.js";
import { playBand } from "../../audio/audio.js";
import { CROM_SIMPLE, GRADO_LABEL, txtSobre } from "../../teoria/etiquetas.js";

// ─── Tabla piedra / energía / chakra (Parte IV) ──────────────────────────────
export const PIEDRAS = [
  {n:"C",  piedra:"Zafiro",             energia:"Serenidad mental, alineación de los planos físico, cognitivo y espiritual", chakra:"Garganta (azul)"},
  {n:"C#", piedra:"Aguamarina",         energia:"Calma, fluidez, conexión con la intuición", chakra:"Garganta (azul)"},
  {n:"D",  piedra:"Esmeralda",          energia:"Activación del corazón: compasión, amor, coraje para seguir el propio camino", chakra:"Corazón (verde)"},
  {n:"D#", piedra:"Peridoto",           energia:"Liberación del estrés y los celos, renovación, alegría", chakra:"Corazón (verde)"},
  {n:"E",  piedra:"Cuarzo ahumado",     energia:"Arraigo (grounding), protección, disolución de energías negativas", chakra:"— (tierra)"},
  {n:"F",  piedra:"Cuarzo champán",     energia:"Variante suave de la abundancia del citrino, con matiz más terroso", chakra:"Plexo solar (amarillo)"},
  {n:"F#", piedra:"Citrino pálido",     energia:"Variante suave de la abundancia del citrino, con matiz más terroso", chakra:"Plexo solar (amarillo)"},
  {n:"G",  piedra:"Citrino",            energia:"Abundancia, prosperidad, manifestación de objetivos, confianza", chakra:"Plexo solar (amarillo)"},
  {n:"G#", piedra:"Granate espesartina",energia:"Coraje, vitalidad, pasión creativa", chakra:"Sacro (naranja)"},
  {n:"A",  piedra:"Rubí",               energia:"Pasión, fuerza vital, vitalidad", chakra:"Raíz (rojo)"},
  {n:"A#", piedra:"Morganita",          energia:"Amor incondicional, autocompasión", chakra:"Corazón (rosa)"},
  {n:"B",  piedra:"Amatista",           energia:"Calma profunda, claridad, intuición, protección espiritual", chakra:"Tercer ojo (violeta)"},
];

// ─── PRESENTACIÓN: escalas para la paleta ─────────────────────────────────────────
// Los doce colores como cristales. Tocar uno hace sonar la nota con timbre de
// fuelle (el mismo del bandoneón de la app). Abajo se elige la escala y solo
// sus colores quedan encendidos. Interfaz neutra para que lo único con color
// sean las notas.
export const ESCALAS_HERO = [
  {id:"mayor",  corto:"Mayor",       nombre:"mayor",           ivs:[0,2,4,5,7,9,11]},
  {id:"menor",  corto:"Menor",       nombre:"menor natural",   ivs:[0,2,3,5,7,8,10]},
  {id:"menorA", corto:"Menor armónica", nombre:"menor armónica", ivs:[0,2,3,5,7,8,11]},
  {id:"menorM", corto:"Menor melódica", nombre:"menor melódica", ivs:[0,2,3,5,7,9,11]},
  {id:"pentaM", corto:"Pent. mayor", nombre:"pentatónica mayor", ivs:[0,2,4,7,9]},
  {id:"pentam", corto:"Pent. menor", nombre:"pentatónica menor", ivs:[0,3,5,7,10]},
  {id:"blues",  corto:"Blues",       nombre:"blues",           ivs:[0,3,5,6,7,10]},
  {id:"crom",   corto:"Cromática",   nombre:"cromática (los 12 sonidos)", ivs:[0,1,2,3,4,5,6,7,8,9,10,11]},
];

// ─── PALETA: la rueda de los doce colores (primera muestra del código) ───────
export const NOMBRES_PC = ["Do","Do♯ / Re♭","Re","Re♯ / Mi♭","Mi","Fa","Fa♯ / Sol♭","Sol","Sol♯ / La♭","La","La♯ / Si♭","Si"];

const RAICES_HERO = ["C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B"];

export function PaletaRueda({compacta=false}){
  const [root,setRoot]=useState("C");
  const [escId,setEscId]=useState("crom");
  const [playing,setPlaying]=useState(null);
  const [sel,setSel]=useState(null);
  const [juego,setJuego]=useState(null);   // {modo:"nota"|"color", obj, ok, total, racha, res:{pc,bien}|null}
  const [romano]=useRomanos();
  const timers=useRef([]);
  useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);

  const esc=ESCALAS_HERO.find(e=>e.id===escId);
  const escritas=buildScale(root,esc.ivs);
  const pcs=escritas.map(noteIdx);
  // niveles (solo con la escala cromática): 1 naturales · 2 sostenidos · 3 bemoles · 4 todas
  const crom = escId==="crom";
  const NOM_S=["Do","Do♯","Re","Re♯","Mi","Fa","Fa♯","Sol","Sol♯","La","La♯","Si"], NOM_B=["Do","Re♭","Re","Mi♭","Mi","Fa","Sol♭","Sol","La♭","La","Si♭","Si"];
  const NAT=[0,2,4,5,7,9,11], NIV=["","Notas naturales","Sostenidos","Bemoles","Todas las notas"];
  const poolDe=(n)=>crom?(n===1?NAT:[...Array(12).keys()]):pcs;
  const nivel = juego ? juego.nivel : 1;
  const pool = poolDe(nivel);
  const nombreJ=(pc,alt)=>!crom?(nombreDe[pc]||CROM_SIMPLE[CHROMATIC[pc]]):(NAT.includes(pc)||nivel===2)?NOM_S[pc]:nivel===3?NOM_B[pc]:(alt?NOM_B[pc]:NOM_S[pc]);
  const sorteo=(prev,n)=>{ const pl=poolDe(n||nivel); let o=pl[Math.random()*pl.length|0]; if(pl.length>1) while(o===prev) o=pl[Math.random()*pl.length|0]; return o; };
  useEffect(()=>{ if(juego&&juego.obj===null) setJuego(j=>j?{...j,obj:sorteo(-1,j.nivel),alt:Math.random()<0.5,res:null}:j); },[juego]);
  const nombreDe={}; escritas.forEach(n=>{ nombreDe[noteIdx(n)]=nombreLat(n); });
  const gradoDe={}; esc.ivs.forEach((iv,i)=>{ gradoDe[pcs[i]]=GRADO_LABEL[iv]; });
  const pasos=esc.ivs.map((iv,i)=>(i===esc.ivs.length-1?12:esc.ivs[i+1])-iv);
  const fmtG=(g)=>romano?aRomano(g):g;

  const stop=()=>{ timers.current.forEach(clearTimeout); timers.current=[]; setPlaying(null); };
  const tocar=(pc)=>{ setSel(pc); playBand(CHROMATIC[pc],4); };
  const jugar=(modo)=>{ stop(); setSel(null); setJuego({modo:modo||"nota",obj:sorteo(-1,1),alt:false,ok:0,total:0,racha:0,mejor:0,nivel:1,res:null,fin:false,sube:false}); };
  const seguir=()=>{ timers.current.forEach(clearTimeout); timers.current=[]; setJuego(j=>{ const n=j.sube?Math.min(4,j.nivel+1):j.nivel; return {...j,nivel:n,obj:sorteo(-1,n),alt:Math.random()<0.5,ok:0,total:0,res:null,fin:false,sube:false}; }); };
  const salirJuego=()=>{ stop(); setJuego(null); setSel(null); };
  const reiniciaPregunta=()=>{ timers.current.forEach(clearTimeout); timers.current=[]; setJuego(j=>j?{...j,obj:null,res:null}:j); };
  const responder=(pc)=>{
    if(!juego||juego.res||juego.obj===null||juego.fin||!poolDe(juego.nivel).includes(pc)) return;
    const bien=pc===juego.obj; playBand(CHROMATIC[juego.obj],4); medir("colores-"+(juego.modo||"nota"),bien,juego.obj);
    const racha=bien?juego.racha+1:0;
    setJuego({...juego,res:{pc,bien},ok:juego.ok+(bien?1:0),total:juego.total+1,racha,mejor:Math.max(juego.mejor,racha)});
    timers.current.push(setTimeout(()=>setJuego(j=>{
      if(!j) return j;
      if(j.total>=10) return {...j,fin:true,res:null,sube:crom&&j.ok>=8&&j.nivel<4};
      return {...j,obj:sorteo(j.obj,j.nivel),alt:Math.random()<0.5,res:null};
    }),bien?650:1400));
  };
  const tocarEscala=()=>{
    stop(); const seq=[...esc.ivs,12], r=noteIdx(root);
    seq.forEach((iv,i)=>timers.current.push(setTimeout(()=>{ const a=r+iv; playBand(CHROMATIC[a%12],4+Math.floor(a/12)); setPlaying(a%12); setSel(a%12); },i*450)));
    timers.current.push(setTimeout(()=>setPlaying(null),seq.length*450+300));
  };

  const C=220, R0=118, R1=204;
  const UI={line:"#26262a",text:"#ececec",mute:"#8a8a90"};
  const jm = juego ? juego.modo : null, rev = juego && juego.res;
  const centroPc = juego&&juego.obj!==null ? juego.obj : sel!==null ? sel : noteIdx(root);
  const centroNombre = sel!==null ? (nombreDe[sel]||NOMBRES_PC[sel]) : nombreLat(root);
  const centroSub = sel!==null ? (pcs.includes(sel)?`función ${fmtG(gradoDe[sel])}`:"fuera de la escala") : esc.nombre;
  return(
    <div className="rounded-2xl mb-5" style={{background:"radial-gradient(120% 90% at 50% 0%,#17171a 0%,#0e0e10 60%)",border:`1px solid ${UI.line}`,padding:compacta?"14px 10px":"20px 14px"}}>
      <div style={{textAlign:"center",marginBottom:4}}>
        <p style={{fontFamily:"'Libre Baskerville',serif",fontSize:compacta?15:19,fontWeight:700,letterSpacing:"0.04em",color:UI.text,margin:0}}>{juego?(jm==="nota"?"Asigná el color a la nota":"Asigná la nota al color"):"La paleta de los doce colores"}</p>
        {juego ? (
          <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",alignItems:"center",marginTop:8}}>
            {!juego.fin && (<div style={{display:"flex",background:"#0e0e10",border:"1px solid #2f2f35",borderRadius:8,padding:2,gap:2}}>
              {[["nota","Nota → color"],["color","Color → nota"]].map(([v,l])=>(<button key={v} style={uiVista(jm===v,{padding:"4px 10px"})} onClick={()=>{ timers.current.forEach(clearTimeout); timers.current=[]; setJuego(j=>({...j,modo:v,obj:null,res:null})); }}>{l}</button>))}
            </div>)}
            {crom && <span style={{fontSize:11,fontWeight:700,color:"#9fe9dc",border:"1px solid #2b6f64",background:"#0f2a26",borderRadius:999,padding:"2px 10px"}}>Nivel {juego.nivel} · {NIV[juego.nivel]}</span>}
            <span style={{fontFamily:"monospace",fontSize:12,color:UI.text}}>{juego.fin?"Ronda terminada":`${Math.min(juego.total+(juego.res?0:1),10)}/10`} · ✓ {juego.ok} · racha {juego.racha}</span>
            {juego.fin && <button style={uiPlay(false,{padding:"6px 18px",fontSize:13})} onClick={seguir}>▶ Seguir</button>}
            <button style={uiGhost} onClick={salirJuego}>✕ Salir</button>
          </div>
        ) : (
          <p style={{fontFamily:UI_FONT,fontSize:11.5,color:UI.mute,margin:"4px 0 0"}}>Cada nota tiene su color. Tocá un color para escucharlo con timbre de fuelle.</p>
        )}
      </div>

      <div style={{maxWidth:compacta?340:460,margin:"0 auto"}}>
        <svg viewBox="0 0 440 440" width="100%" style={{display:"block",overflow:"visible",userSelect:"none",WebkitUserSelect:"none"}}>
          <circle cx={C} cy={C} r={R1+14} fill="none" stroke={UI.line} strokeWidth="1"/>
          {[...Array(12)].map((_,pc)=>{
            const a=pc*30, on=(juego?pool:pcs).includes(pc), col=nc(CHROMATIC[pc]), son=playing===pc, selx=sel===pc;
            const [tx,ty]=cqPol(C,C,(R0+R1)/2+2,a), gx=tx, gy=ty+(compacta?13:15);
            return(
              <g key={pc} onClick={()=>juego?responder(pc):tocar(pc)} style={{cursor:"pointer",transformOrigin:`${C}px ${C}px`,transform:son?"scale(1.07)":on?"scale(1.025)":"scale(1)",transition:"transform .16s ease, opacity .25s ease",opacity:on?1:0.2,filter:son?`drop-shadow(0 0 14px ${col})`:"none"}}>
                <path d={cqSector(C,C,R0,R1,a-14.4,a+14.4)} fill={jm==="color"&&!(rev&&pc===juego.obj)?"#26262b":col}
                  stroke={rev&&pc===juego.obj?"#ffffff":rev&&!rev.bien&&pc===rev.pc?"#e5645b":on?"rgba(255,255,255,.55)":"rgba(255,255,255,.12)"} strokeWidth={rev&&(pc===juego.obj||pc===rev.pc)?4.5:selx?2.6:1.2}/>
                {jm!=="nota" && !(jm==="color"&&!on) && (()=>{ const t=jm==="color"?((crom&&nivel>=2&&!NAT.includes(pc))?(nivel===2?NOM_S[pc]:nivel===3?NOM_B[pc]:NOM_S[pc]+"/"+NOM_B[pc]):nombreJ(pc,false)):(nombreDe[pc]||CROM_SIMPLE[CHROMATIC[pc]]).split(" ")[0];
                  return <text x={tx} y={on&&!jm?ty-7:ty+1} textAnchor="middle" dominantBaseline="middle" style={{fontFamily:"'Libre Baskerville',serif",fontWeight:700,fontSize:t.length>5?12.5:compacta?17:19,fill:jm==="color"&&!(rev&&pc===juego.obj)?"#ececec":txtSobre(col),pointerEvents:"none"}}>{t}</text>; })()}
                {on && !jm && <text x={gx} y={gy} textAnchor="middle" dominantBaseline="middle" style={{fontFamily:UI_FONT,fontWeight:800,fontSize:11.5,fill:txtSobre(col),opacity:.85,pointerEvents:"none"}}>{fmtG(gradoDe[pc])}</text>}
              </g>
            );
          })}
          <circle cx={C} cy={C} r={R0-8} fill="#0b0b0c" stroke={UI.line} strokeWidth="1.5"/>
          {juego ? (juego.fin ? (<>
              <circle cx={C} cy={C} r={R0-22} fill="none" stroke={juego.ok>=8?"#6b9c7c":"#3a3a3e"} strokeWidth="3"/>
              <text x={C} y={C-14} textAnchor="middle" dominantBaseline="middle" style={{fontFamily:"'Libre Baskerville',serif",fontWeight:700,fontSize:60,fill:UI.text}}>{juego.ok}<tspan style={{fontSize:28,fill:"#6a6a70"}}>/10</tspan></text>
              <text x={C} y={C+30} textAnchor="middle" dominantBaseline="middle" style={{fontFamily:UI_FONT,fontWeight:700,fontSize:14,fill:"#cfcfd4"}}>{juego.ok===10?"¡Perfecto!":juego.ok>=8?"Muy bien":juego.ok>=5?"Vas bien":"Seguí practicando"}</text>
              <text x={C} y={C+52} textAnchor="middle" dominantBaseline="middle" style={{fontFamily:UI_FONT,fontWeight:600,fontSize:11.5,fill:"#8a8a90"}}>{juego.sube?`Subís al nivel ${juego.nivel+1}`:(crom?"Repetí el nivel · ":"")+`racha máxima ${juego.mejor}`}</text>
            </>) : jm==="nota" ? (<>
              <circle cx={C} cy={C} r={R0-22} fill="none" stroke={rev?(rev.bien?"#6b9c7c":"#c0615a"):"#3a3a3e"} strokeWidth="3" style={{transition:"stroke .2s"}}/>
              <text x={C} y={C+2} textAnchor="middle" dominantBaseline="middle" style={{fontFamily:"'Libre Baskerville',serif",fontWeight:700,fontSize:juego.obj!==null&&nombreJ(juego.obj,juego.alt).length>4?36:52,fill:UI.text}}>{juego.obj!==null?nombreJ(juego.obj,juego.alt):""}</text>
            </>) : (<>
              <circle cx={C} cy={C} r={R0-26} fill={juego.obj!==null?nc(CHROMATIC[juego.obj]):"#0b0b0c"} stroke={rev?(rev.bien?"#6b9c7c":"#c0615a"):"rgba(255,255,255,.35)"} strokeWidth="4" style={{transition:"stroke .2s"}}/>
            </>)) : sel===null ? (
            <g onClick={()=>jugar("nota")} style={{cursor:"pointer"}} className="jugar-btn">
              <style>{`.jugar-btn .pr-disc{transition:fill .25s} .jugar-btn:hover .pr-disc{fill:#202026} .jugar-btn .pr-play,.jugar-btn .pr-txt{transition:fill .25s} .jugar-btn:hover .pr-play,.jugar-btn:hover .pr-txt{fill:#2dd4bf}`}</style>
              <defs><radialGradient id="prG" cx="50%" cy="30%" r="80%"><stop offset="0%" stopColor="#27272d"/><stop offset="100%" stopColor="#0d0d0f"/></radialGradient></defs>
              <circle cx={C} cy={C} r={R0-12} fill="#0b0b0c" stroke="#2a2a2e" strokeWidth="1.5"/>
              {[...Array(12)].map((_,i)=>(<path key={i} d={cqSector(C,C,86,95,i*30-13,i*30+13)} fill={nc(CHROMATIC[i])}/>))}
              <circle className="pr-disc" cx={C} cy={C} r="77" fill="url(#prG)" stroke="#3b3b43" strokeWidth="1.2"/>
              <path className="pr-play" d={`M${C-10},${C-36} L${C+21},${C-18} L${C-10},${C+0} Z`} fill="#ececec" style={{pointerEvents:"none"}}/>
              <text className="pr-txt" x={C} y={C+33} textAnchor="middle" dominantBaseline="middle" style={{fontFamily:"'Libre Baskerville',serif",fontWeight:700,fontSize:19,letterSpacing:"0.06em",fill:"#ececec",pointerEvents:"none"}}>Practicar</text>
            </g>
          ) : null}
          {!juego && sel!==null && <circle cx={C} cy={C} r={R0-22} fill="none" stroke={nc(CHROMATIC[centroPc])} strokeWidth="3" style={{transition:"stroke .25s"}}/>}
          {!juego && sel!==null && <text x={C} y={C-12} textAnchor="middle" dominantBaseline="middle" style={{fontFamily:"'Libre Baskerville',serif",fontWeight:700,fontSize:centroNombre.length>4?32:42,fill:UI.text}}>{centroNombre}</text>}
          {!juego && sel!==null && <text x={C} y={C+26} textAnchor="middle" dominantBaseline="middle" style={{fontFamily:UI_FONT,fontWeight:600,fontSize:13,fill:"#b4b4ba"}}>{centroSub}</text>}
        </svg>
      </div>

      <div style={{borderTop:`1px solid ${UI.line}`,paddingTop:12,marginTop:8}}>
        <p style={{...uiLabel,marginBottom:8}}>Tonalidad</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {RAICES_HERO.map(x=>(<button key={x} style={uiPill(x===root,{padding:"5px 11px"})} onClick={()=>{stop();setRoot(x);setSel(null);if(juego)reiniciaPregunta();}}>{nombreLat(x)}</button>))}
        </div>
        <p style={{...uiLabel,marginBottom:8}}>Escala</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {ESCALAS_HERO.map(e=>(<button key={e.id} style={uiPill(e.id===escId,{padding:"5px 11px"})} onClick={()=>{stop();setEscId(e.id);setSel(null);if(juego)reiniciaPregunta();}}>{e.corto}</button>))}
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p style={{fontSize:12,fontFamily:"monospace",color:UI.mute,margin:0,flex:"1 1 220px"}}>
            <b style={{color:UI.text,fontFamily:"'Libre Baskerville',serif",fontSize:14}}>{nombreLat(root)} {esc.nombre}</b><br/>{escritas.map(nombreLat).join(" · ")}
          </p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {!juego && sel!==null && <button onClick={()=>jugar("nota")} style={uiPlay(false,{padding:"8px 16px"})}>▶ Practicar</button>}
            <button onClick={playing!==null?stop:tocarEscala} style={uiPlay(false,{padding:"8px 16px"})}>{playing!==null?"■ Parar":"▶ Tocar escala"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
