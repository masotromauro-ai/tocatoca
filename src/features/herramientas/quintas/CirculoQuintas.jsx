// La pestaña Quintas.

import { useState, useEffect, useRef } from "react";
import { CQ_ESC, CQ_MAJ, CQ_MIN, cqAcc, cqChords, cqPcOfPos, cqPlay, cqPol, cqPosOfPc, cqSector } from "../../../shared/teoria/quintas.js";
import { CHROMATIC, buildScale, nombreLat, noteIdx, spell } from "../../../shared/teoria/notas.js";
import { nc } from "../../../shared/teoria/color.js";
import { UI_FONT, uiLabel, uiPill } from "../../../shared/ui/tema.js";
import { playTone } from "../../../shared/audio/audio.js";
import { GRADO_LABEL, txtSobre } from "../../../shared/teoria/etiquetas.js";

export function CirculoQuintas(){
  const [pos,setPos]     = useState(0);        // posición de la armadura que queda arriba
  const [escId,setEscId] = useState("mayor");
  const [enh6,setEnh6]   = useState(false);   // false: F♯ / D♯   true: G♭ / E♭
  const [solfeo,setSolfeo] = useState(false);
  const [rot,setRot]     = useState(0);
  const [dragging,setDragging] = useState(false);
  const [playing,setPlaying]   = useState(-1);
  const svgRef=useRef(null), moved=useRef(false), timers=useRef([]);
  useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);

  const esc = CQ_ESC.find(e=>e.id===escId);
  const majName = p => p===6 ? (enh6?"Gb":"F#") : CQ_MAJ[p];
  const minName = p => p===6 ? (enh6?"Eb":"D#") : CQ_MIN[p];
  const dimName = p => spell(majName(p),11,6);
  const lbl = n => solfeo ? nombreLat(n) : cqAcc(n);
  const lblChord = (root,sym) => lbl(root)+sym;

  const parentName = majName(pos);
  const tonic = spell(parentName, esc.off, esc.deg);
  const notes = buildScale(tonic, esc.ivs);
  const chords = cqChords(notes, esc.ivs);
  const notePcs = notes.map(noteIdx);
  const posSet = new Set(notePcs.map(cqPosOfPc));

  // ¿las notas ocupan posiciones consecutivas? → se dibuja la "ventana"
  let ventana=null;
  for(let st=0;st<12 && !ventana;st++){
    const run=[...Array(posSet.size)].map((_,k)=>(st+k)%12);
    if(run.every(x=>posSet.has(x))) ventana={start:st,len:posSet.size};
  }

  // armadura
  const sharps = pos<=6 && !(pos===6&&enh6);
  const nAcc = sharps ? pos : (pos===6 ? 6 : 12-pos);
  const ORD_S=["F","C","G","D","A","E","B"], ORD_B=["B","E","A","D","G","C","F"];
  const accList = (sharps?ORD_S.slice(0,nAcc).map(n=>n+"#"):ORD_B.slice(0,nAcc).map(n=>n+"b"));
  const sigTxt = nAcc===0 ? "sin alteraciones" : `${nAcc}${sharps?"♯":"♭"}  (${accList.map(lbl).join(" ")})`;

  // ── giro ──
  const goTo=(np,ne=escId)=>{
    setPos(np); setEscId(ne);
    setRot(r=>{ const cur=((r%360)+360)%360, target=(360-np*30)%360; let d=target-cur; if(d>180)d-=360; if(d<-180)d+=360; return r+d; });
  };
  const mover=(dp)=>goTo(((pos+dp)%12+12)%12);
  const cambiarEsc=(id)=>{ // conserva la tónica y gira hasta su nueva armadura
    const ne=CQ_ESC.find(e=>e.id===id);
    const pc=noteIdx(tonic);
    goTo(cqPosOfPc(pc-ne.off), id);
  };
  const onDown=(e)=>{
    if(e.button!==undefined && e.button!==0) return;
    const rect=svgRef.current.getBoundingClientRect();
    const cx=rect.left+rect.width/2, cy=rect.top+rect.height/2;
    const ang=ev=>Math.atan2(ev.clientX-cx, -(ev.clientY-cy))*180/Math.PI;
    const a0=ang(e), r0=rot, sx=e.clientX, sy=e.clientY;
    moved.current=false; let live=r0;
    const mv=(ev)=>{
      if(!moved.current && Math.hypot(ev.clientX-sx,ev.clientY-sy)<6) return;
      moved.current=true; setDragging(true);
      let d=ang(ev)-a0; if(d>180)d-=360; if(d<-180)d+=360;
      live=r0+d; setRot(live);
    };
    const up=()=>{
      window.removeEventListener("pointermove",mv); window.removeEventListener("pointerup",up); window.removeEventListener("pointercancel",up);
      if(!moved.current) return;
      const snapped=Math.round(live/30)*30;
      const np=(((-Math.round(live/30))%12)+12)%12;
      setDragging(false); setRot(snapped); setPos(np);
    };
    window.addEventListener("pointermove",mv); window.addEventListener("pointerup",up); window.addEventListener("pointercancel",up);
  };
  const clickSeg=(p,ring)=>{
    if(moved.current) return;
    if(ring==="maj"){ const ne="mayor";  goTo(p,ne); playTone(majName(p),4,0.5); }
    if(ring==="min"){ goTo(p,"menor");   playTone(minName(p),4,0.5); }
    if(ring==="dim"){ goTo(p,"locrio");  playTone(dimName(p),4,0.5); }
  };

  const tocarEscala=()=>{
    timers.current.forEach(clearTimeout); timers.current=[];
    const seq=[...esc.ivs,12]; const r=noteIdx(tonic);
    seq.forEach((iv,i)=>{ timers.current.push(setTimeout(()=>{ const a=r+iv; playTone(CHROMATIC[a%12],4+Math.floor(a/12),0.6); setPlaying(i<esc.ivs.length?i:0); },i*420)); });
    timers.current.push(setTimeout(()=>setPlaying(-1),seq.length*420+300));
  };
  const cadencia=(lista)=>{ lista.forEach((c,i)=>setTimeout(()=>cqPlay(c.root,c.ivs,1.6),i*1100)); };

  // acordes diatónicos → anillo/posición
  const chordAt = {maj:{},min:{},dim:{}};
  chords.forEach(c=>{
    if(c.tri==="maj") chordAt.maj[cqPosOfPc(c.rootPc)]=c;
    if(c.tri==="min") chordAt.min[cqPosOfPc(c.rootPc+3)]=c;
    if(c.tri==="dim") chordAt.dim[cqPosOfPc(c.rootPc+1)]=c;
  });

  // relaciones
  const nameOf=(p,e)=>{ const ee=CQ_ESC.find(x=>x.id===e); return spell(majName(p),ee.off,ee.deg); };
  const rels=[];
  if(esc.id==="mayor") rels.push({t:"Relativa menor",   n:lbl(nameOf(pos,"menor"))+" menor",  go:()=>goTo(pos,"menor")});
  else if(esc.fam==="men") rels.push({t:"Relativa mayor", n:lbl(nameOf(pos,"mayor"))+" mayor",  go:()=>goTo(pos,"mayor")});
  else rels.push({t:"Tonalidad madre", n:lbl(parentName)+" mayor", go:()=>goTo(pos,"mayor")});
  if(esc.id==="mayor"||esc.fam==="men"){
    const par = esc.id==="mayor" ? "menor" : "mayor";
    const ne=CQ_ESC.find(x=>x.id===par);
    rels.push({t:esc.id==="mayor"?"Paralela menor":"Paralela mayor", n:lbl(tonic)+(esc.id==="mayor"?" menor":" mayor"), go:()=>goTo(cqPosOfPc(noteIdx(tonic)-ne.off),par)});
  }
  rels.push({t:"Dominante (V)",     n:lbl(nameOf((pos+1)%12,esc.id))+" "+esc.nombre.toLowerCase(),  go:()=>mover(1)});
  rels.push({t:"Subdominante (IV)", n:lbl(nameOf((pos+11)%12,esc.id))+" "+esc.nombre.toLowerCase(), go:()=>mover(-1)});

  // cadencia ii–V–I y dominantes secundarios (mayor / menor natural)
  let cad=null, sec=[];
  if(esc.id==="mayor"||esc.id==="menor"){
    const m=esc.id==="mayor";
    cad=[
      {root:notes[1], ivs:m?[0,3,7,10]:[0,3,6,10], nombre:lblChord(notes[1], m?"m7":"ø7")},
      {root:notes[4], ivs:[0,4,7,10],               nombre:lblChord(notes[4],"7")},
      {root:notes[0], ivs:m?[0,4,7,11]:[0,3,7,10], nombre:lblChord(notes[0], m?"△7":"m7")},
    ];
    chords.forEach((c,i)=>{
      if(i===0||(c.tri!=="maj"&&c.tri!=="min")) return;
      const dom=spell(c.root,7,4);
      sec.push({label:`V7/${c.roman}`, nombre:lblChord(dom,"7"), root:dom, ivs:[0,4,7,10]});
    });
  }

  // ── geometría ──
  const CX=290, CY=290, RO=[230,172], RM=[172,124], RI=[124,90], RB=[236,266], RD=251;
  const rotStyle=(x,y)=>({transform:`rotate(${-rot}deg)`,transformOrigin:`${x}px ${y}px`,transition:dragging?"none":"transform .7s cubic-bezier(.3,.9,.3,1)",pointerEvents:"none"});
  const UI={line:"#2a2a2e",mute:"#8a8a90",text:"#ececec"};

  const segs=(ring,r,nombre,subtxt)=>[...Array(12)].map((_,p)=>{
    const a0=p*30-14.2, a1=p*30+14.2;
    const pc = ring==="maj"?cqPcOfPos(p):ring==="min"?(cqPcOfPos(p)+9)%12:(cqPcOfPos(p)+11)%12;
    const ch = chordAt[ring][p];
    const col = nc(CHROMATIC[pc]);
    const esTonica = ch && ch.deg===0;
    const [x,y]=cqPol(CX,CY,(r[0]+r[1])/2,p*30);
    const fs = ring==="maj"?21:ring==="min"?16:13;
    return(
      <g key={ring+p}>
        <path d={cqSector(CX,CY,r[0],r[1],a0,a1)} onClick={()=>clickSeg(p,ring)} style={{cursor:"pointer",transition:"fill .3s, stroke .3s"}}
          fill={ch?col:"#141416"} fillOpacity={ch?0.88:1} stroke={esTonica?"#ffffff":ch?"#ffffffaa":UI.line} strokeWidth={esTonica?3:ch?1.5:1}/>
        <g style={rotStyle(x,y)}>
          <text x={x} y={ch?y-2:y+(ring==="maj"?-1:4)} textAnchor="middle" dominantBaseline="middle"
            style={{fontFamily:"'Libre Baskerville',serif",fontWeight:700,fontSize:fs,fill:ch?txtSobre(col):"#9a9aa0"}}>{nombre(p)}</text>
          {ch ? (
            <text x={x} y={y+(ring==="maj"?17:14)} textAnchor="middle" dominantBaseline="middle"
              style={{fontFamily:UI_FONT,fontWeight:800,fontSize:ring==="dim"?10:12,fill:txtSobre(col),opacity:.95}}>{ch.roman}</text>
          ) : subtxt ? (
            <text x={x} y={y+16} textAnchor="middle" dominantBaseline="middle" style={{fontFamily:UI_FONT,fontWeight:600,fontSize:10.5,fill:"#5c5c62"}}>{subtxt(p)}</text>
          ) : null}
        </g>
      </g>
    );
  });
  const sigDe=(p)=> p===0?"0" : p<6?`${p}♯` : p===6?(enh6?"6♭":"6♯") : `${12-p}♭`;

  const pill=(on)=>uiPill(on);
  return(
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-1" style={{fontFamily:"'Libre Baskerville',serif"}}>Círculo de Quintas</h2>
        <p className="text-xs text-gray-500">Girá la rueda arrastrándola, tocá una tonalidad o usá las flechas. Elegí la escala y el círculo se reordena solo.</p>
      </div>

      {/* Escalas */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {CQ_ESC.map(e=>(<button key={e.id} style={pill(e.id===escId)} onClick={()=>cambiarEsc(e.id)}>{e.nombre}</button>))}
      </div>

      {/* Rueda */}
      <div style={{position:"relative",maxWidth:560,margin:"0 auto"}}>
        <svg ref={svgRef} viewBox="0 0 580 580" width="100%" onPointerDown={onDown}
          style={{display:"block",touchAction:"pan-y",userSelect:"none",WebkitUserSelect:"none",cursor:dragging?"grabbing":"grab"}}>
          {/* marcador fijo */}
          <polygon points="290,20 281,4 299,4" fill="#ececec"/>
          <g style={{transform:`rotate(${rot}deg)`,transformOrigin:`${CX}px ${CY}px`,transition:dragging?"none":"transform .7s cubic-bezier(.3,.9,.3,1)"}}>
            {/* ventana de notas */}
            {ventana && <path d={cqSector(CX,CY,RB[0],RB[1],ventana.start*30-15,(ventana.start+ventana.len-1)*30+15)} fill="#ffffff" fillOpacity=".07" stroke="#ffffff" strokeOpacity=".28" strokeWidth="1"/>}
            {/* anillos */}
            {segs("maj",RO,p=>lbl(majName(p)),sigDe)}
            {segs("min",RM,p=>lbl(minName(p))+"m",null)}
            {segs("dim",RI,p=>lbl(dimName(p))+"°",null)}
            {/* puntos de notas (grado) */}
            {[...Array(12)].map((_,p)=>{
              const pc=cqPcOfPos(p); const idx=notePcs.indexOf(pc); const [x,y]=cqPol(CX,CY,RD,p*30);
              if(idx<0) return <circle key={"d"+p} cx={x} cy={y} r={2.5} fill="#3a3a40"/>;
              const col=nc(CHROMATIC[pc]); const on=playing===idx;
              return(
                <g key={"d"+p}>
                  <circle cx={x} cy={y} r={on?16:13} fill={col} stroke="#fff" strokeWidth={idx===0?3:1.2} style={{transition:"r .12s"}}/>
                  <g style={rotStyle(x,y)}>
                    <text x={x} y={y+0.5} textAnchor="middle" dominantBaseline="middle" style={{fontFamily:UI_FONT,fontWeight:800,fontSize:idx<=9?11:10,fill:txtSobre(col)}}>{GRADO_LABEL[esc.ivs[idx]]}</text>
                  </g>
                </g>
              );
            })}
          </g>
          {/* centro fijo */}
          <circle cx={CX} cy={CY} r={84} fill="#0e0e10" stroke="#2a2a2e" strokeWidth="1.5"/>
          <text x={CX} y={CY-16} textAnchor="middle" dominantBaseline="middle" style={{fontFamily:"'Libre Baskerville',serif",fontWeight:700,fontSize:38,fill:"#ececec"}}>{lbl(tonic)}</text>
          <text x={CX} y={CY+18} textAnchor="middle" dominantBaseline="middle" style={{fontFamily:UI_FONT,fontWeight:600,fontSize:13,fill:"#b4b4ba"}}>{esc.nombre}</text>
          <text x={CX} y={CY+38} textAnchor="middle" dominantBaseline="middle" style={{fontFamily:UI_FONT,fontSize:11,fill:"#707076"}}>{nAcc===0?"sin alteraciones":`${nAcc}${sharps?"♯":"♭"}`}</text>
        </svg>
      </div>

      {/* Controles */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-3 mb-5">
        <button style={pill(false)} onClick={()=>mover(-1)}>◀ Subdominante</button>
        <button style={pill(false)} onClick={()=>mover(1)}>Dominante ▶</button>
        <button style={pill(solfeo)} onClick={()=>setSolfeo(s=>!s)}>{solfeo?"Do Re Mi":"A B C"}</button>
        <button style={pill(enh6)} onClick={()=>setEnh6(s=>!s)} title="Escritura de la tonalidad de 6 alteraciones">{enh6?"G♭ / E♭":"F♯ / D♯"}</button>
        <button style={{...pill(false),borderColor:"#ececec",color:"#ececec"}} onClick={tocarEscala}>▶ Tocar escala</button>
      </div>

      {/* Escala */}
      <div className="rounded-xl p-4 mb-3" style={{background:"#121214",border:"1px solid #26262a"}}>
        <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
          <p style={uiLabel}>Escala de {lbl(tonic)} {esc.nombre.toLowerCase()}</p>
          <p style={{fontFamily:UI_FONT,fontSize:11,color:UI.mute}}>Armadura: {sigTxt}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {notes.map((n,i)=>{
            const col=nc(n); const on=playing===i;
            return(
              <button key={i} onClick={()=>playTone(n,4,0.6)}
                style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,minWidth:50,padding:"8px 8px 6px",borderRadius:11,cursor:"pointer",
                  background:col,color:txtSobre(col),border:`2px solid ${on?"#fff":"rgba(255,255,255,.2)"}`,transform:on?"translateY(-4px)":"none"}}>
                <span style={{fontFamily:"'Libre Baskerville',serif",fontWeight:700,fontSize:15}}>{lbl(n)}</span>
                <span style={{fontFamily:UI_FONT,fontSize:10,fontWeight:700,opacity:.8}}>{GRADO_LABEL[esc.ivs[i]]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Acordes diatónicos */}
      {chords.length>0 && (
        <div className="rounded-xl p-4 mb-3" style={{background:"#121214",border:"1px solid #26262a"}}>
          <p style={{...uiLabel,marginBottom:10}}>Acordes diatónicos · tocá para oírlos</p>
          <div className="overflow-x-auto">
            <table style={{borderCollapse:"collapse",width:"100%",fontFamily:UI_FONT,fontSize:13}}>
              <thead><tr style={{color:UI.mute,fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase"}}>
                <th style={{textAlign:"left",padding:"4px 8px",fontWeight:600}}>Grado</th>
                <th style={{textAlign:"left",padding:"4px 8px",fontWeight:600}}>Tríada</th>
                <th style={{textAlign:"left",padding:"4px 8px",fontWeight:600}}>Cuatríada</th>
              </tr></thead>
              <tbody>
                {chords.map((c,i)=>{
                  const col=nc(CHROMATIC[c.rootPc]);
                  const tIvs=[0,c.i3,c.i5], sIvs=[0,c.i3,c.i5,c.i7];
                  return(
                    <tr key={i} style={{borderTop:"1px solid #1c1c1f"}}>
                      <td style={{padding:"6px 8px",color:"#cfcfd4",fontWeight:700}}>
                        <span style={{display:"inline-block",width:9,height:9,borderRadius:3,background:col,marginRight:8}}/>{c.roman}
                      </td>
                      <td style={{padding:"4px 8px"}}>
                        <button onClick={()=>cqPlay(c.root,tIvs)} style={{...pill(false),padding:"4px 11px",fontFamily:"'Libre Baskerville',serif",fontSize:13}}>{lblChord(c.root,c.ts)}</button>
                      </td>
                      <td style={{padding:"4px 8px"}}>
                        <button onClick={()=>cqPlay(c.root,sIvs)} style={{...pill(false),padding:"4px 11px",fontFamily:"'Libre Baskerville',serif",fontSize:13}}>{lblChord(c.root,c.sev)}</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tonalidades relacionadas */}
      <div className="rounded-xl p-4 mb-3" style={{background:"#121214",border:"1px solid #26262a"}}>
        <p style={{...uiLabel,marginBottom:10}}>Tonalidades vecinas · tocá para saltar</p>
        <div className="grid grid-cols-2 gap-2">
          {rels.map((r,i)=>(
            <button key={i} onClick={r.go} style={{textAlign:"left",padding:"9px 12px",borderRadius:10,cursor:"pointer",background:"rgba(255,255,255,.02)",border:"1px solid #2a2a2e",color:"#ececec"}}>
              <span style={{display:"block",fontFamily:UI_FONT,fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:UI.mute,marginBottom:3}}>{r.t}</span>
              <span style={{fontFamily:"'Libre Baskerville',serif",fontSize:14,fontWeight:700}}>{r.n}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cadencia y dominantes secundarios */}
      {cad && (
        <div className="rounded-xl p-4" style={{background:"#121214",border:"1px solid #26262a"}}>
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <p style={uiLabel}>Cadencia ii – V – I</p>
            <button style={{...pill(false),borderColor:"#ececec",color:"#ececec"}} onClick={()=>cadencia(cad)}>▶ Escuchar</button>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {cad.map((c,i)=>(
              <span key={i} style={{padding:"6px 12px",borderRadius:9,background:"rgba(255,255,255,.03)",border:"1px solid #2a2a2e",fontFamily:"'Libre Baskerville',serif",fontSize:14,fontWeight:700,color:"#ececec"}}>{c.nombre}</span>
            ))}
          </div>
          <p style={{...uiLabel,marginBottom:8}}>Dominantes secundarias</p>
          <div className="flex flex-wrap gap-2">
            {sec.map((c,i)=>(
              <button key={i} onClick={()=>cqPlay(c.root,c.ivs)} style={{...pill(false),display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"6px 12px"}}>
                <span style={{fontFamily:"'Libre Baskerville',serif",fontSize:14,fontWeight:700,color:"#ececec"}}>{c.nombre}</span>
                <span style={{fontSize:9.5,letterSpacing:"0.08em",color:UI.mute}}>{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
