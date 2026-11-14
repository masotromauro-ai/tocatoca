// El círculo de armonía.

import { useMemo } from "react";
import { NotaDot, TensionChip, fmtNota } from "./notas.jsx";
import { CHROMATIC, enh, noteIdx } from "../../teoria/notas.js";
import { nc } from "../../teoria/color.js";
import { playChord, playTone } from "../../audio/audio.js";
import { COF, DN, DQ, MODE_BY_DEGREE, MSI, tNote } from "../../teoria/escalas.js";
import { parseChord } from "../../teoria/acordes.js";

// Círculo de quintas interactivo completo
export const Circulo=({highlighted=[],onSelect=null,selectedKey=null})=>{
  const cx=180,cy=180,R=140,Rm=96,Ri=58;
  const scaleData=useMemo(()=>{
    if(!selectedKey) return null;
    const ri=noteIdx(selectedKey);if(ri===-1)return null;
    const notes=MSI.map(i=>CHROMATIC[(ri+i)%12]);
    return notes.map((n,i)=>({
      note:n,degree:DN[i],quality:DQ[i],
      mode:MODE_BY_DEGREE[i],
      tensions:(MODE_BY_DEGREE[i].tensions||[]).map(t=>({label:t,note:tNote(n,t)})),
    }));
  },[selectedKey]);

  return(
    <div>
      <svg viewBox="0 0 360 360" className="w-full max-w-sm mx-auto select-none">
        <defs>
          <radialGradient id="bgCOF" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#1a1a1a"/>
            <stop offset="100%" stopColor="#0a0a0a"/>
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={175} fill="url(#bgCOF)" stroke="#232323" strokeWidth="1"/>

        {/* Anillo externo: mayores */}
        {COF.map(({note,deg})=>{
          const angle=(deg-90)*(Math.PI/180);
          const ox=cx+R*Math.cos(angle),oy=cy+R*Math.sin(angle);
          const isSel=selectedKey===note;
          const isHi=highlighted.includes(note)||highlighted.includes(enh(note));
          const color=nc(note);
          return(
            <g key={"M"+note} style={{cursor:onSelect?"pointer":"default"}}
              onClick={()=>onSelect&&onSelect(isSel?null:note)}>
              <circle cx={ox} cy={oy} r={isSel?22:19}
                fill={isSel?color:isHi?color+"cc":"#1a1a1a"}
                stroke={isSel||isHi?color:"#e6e6e6"}
                strokeWidth={isSel?3:isHi?2:1}
                opacity={isSel||isHi?1:0.7}/>
              <text x={ox} y={oy+1} textAnchor="middle" dominantBaseline="middle"
                fontSize={isSel?11:10} fontWeight="bold"
                fill={isSel||isHi?"#fff":"#aaa"} fontFamily="serif">{note}</text>
            </g>
          );
        })}

        {/* Anillo medio: menores */}
        {COF.map(({note,minor,deg})=>{
          const angle=(deg-90)*(Math.PI/180);
          const mx=cx+Rm*Math.cos(angle),my=cy+Rm*Math.sin(angle);
          const isHi=highlighted.includes(note);
          const color=nc(note);
          return(
            <g key={"m"+note}>
              <circle cx={mx} cy={my} r={13}
                fill={isHi?color+"22":"transparent"}
                stroke={isHi?color+"88":"#333333"} strokeWidth="1"/>
              <text x={mx} y={my+1} textAnchor="middle" dominantBaseline="middle"
                fontSize="7.5" fill={isHi?"#ccc":"#555"} fontFamily="serif">{minor}</text>
            </g>
          );
        })}

        {/* Anillo interior: grados de la escala seleccionada */}
        {selectedKey&&scaleData&&scaleData.map((sd,i)=>{
          const angle=(i*(360/7)-90)*(Math.PI/180);
          const ix=cx+Ri*Math.cos(angle),iy=cy+Ri*Math.sin(angle);
          const color=nc(sd.note);
          return(
            <g key={"g"+i} style={{cursor:"pointer"}} onClick={()=>playTone(sd.note,4,0.6)}>
              <circle cx={ix} cy={iy} r={15} fill={color+"33"} stroke={color} strokeWidth="1.5"/>
              <text x={ix} y={iy-3} textAnchor="middle" dominantBaseline="middle"
                fontSize="8" fontWeight="bold" fill={color} fontFamily="serif">{sd.degree}</text>
              <text x={ix} y={iy+5} textAnchor="middle" dominantBaseline="middle"
                fontSize="6.5" fill={color+"cc"} fontFamily="serif">{sd.note}</text>
            </g>
          );
        })}

        {/* Centro */}
        <circle cx={cx} cy={cy} r={42} fill="#0a0a0a" stroke="#2a2a2a" strokeWidth="1"/>
        {selectedKey?(
          <>
            <text x={cx} y={cy-12} textAnchor="middle" fontSize="14" fontWeight="bold"
              fill={nc(selectedKey)} fontFamily="serif">{selectedKey}</text>
            <text x={cx} y={cy+2} textAnchor="middle" fontSize="9"
              fill="#888" fontFamily="serif">Mayor</text>
            <text x={cx} y={cy+14} textAnchor="middle" fontSize="7"
              fill="#555" fontFamily="serif">{COF.find(c=>c.note===selectedKey)?.sig}</text>
          </>
        ):(
          <>
            <text x={cx} y={cy-6}  textAnchor="middle" fontSize="9" fill="#444" fontFamily="serif">Círculo</text>
            <text x={cx} y={cy+6}  textAnchor="middle" fontSize="9" fill="#444" fontFamily="serif">de Quintas</text>
          </>
        )}
      </svg>

      {/* Panel interactivo cuando hay tonalidad seleccionada */}
      {selectedKey&&scaleData&&(
        <div className="mt-4 space-y-3">
          {/* Notas de la escala */}
          <div className="rounded-xl p-3 border border-gray-800" style={{background:"#121212"}}>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
              Escala de {selectedKey} Mayor — {COF.find(c=>c.note===selectedKey)?.sig}
            </p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {scaleData.map((sd,i)=>(
                <button key={i} onClick={()=>playTone(sd.note,4,0.6)}
                  className="flex flex-col items-center px-2.5 py-2 rounded-xl border font-bold"
                  style={{backgroundColor:nc(sd.note)+"18",borderColor:nc(sd.note)+"55",
                    color:nc(sd.note),minWidth:"36px"}}>
                  <span className="text-sm">{sd.note}</span>
                  <span style={{fontSize:"9px",opacity:0.6}}>{sd.degree}</span>
                </button>
              ))}
            </div>
            <button onClick={()=>playChord(scaleData.map(s=>s.note))}
              className="text-xs px-3 py-1 rounded border mt-1"
              style={{background:"#1a1a1a",borderColor:"#333333",color:"#e6e6e6"}}>
              ▶ Escuchar escala
            </button>
          </div>

          {/* Tabla completa: grados, modos, tensiones */}
          <div className="rounded-xl border border-gray-800 overflow-hidden" style={{background:"#121212"}}>
            <p className="text-xs text-gray-500 uppercase tracking-widest px-4 py-2 border-b border-gray-800">
              Grados · Modos · Tensiones disponibles
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{minWidth:"480px"}}>
                <thead>
                  <tr style={{background:"#1a1a1a",borderBottom:"1px solid #333333"}}>
                    {["Gr.","Nota","Acorde","Modo","Tensiones","Evitar"].map(h=>(
                      <th key={h} className="text-left px-3 py-2 text-gray-600 font-normal uppercase tracking-widest text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scaleData.map((sd,i)=>{
                    const color=nc(sd.note);
                    const twn=sd.tensions.map(({label,note})=>({label,note}));
                    const awn=(sd.mode.avoid||[]).map(t=>({label:t,note:tNote(sd.note,t)}));
                    return(
                      <tr key={i} style={{borderBottom:"1px solid #2a2a2a",background:i%2===0?"transparent":"#1a1a1a"}}>
                        <td className="px-3 py-2">
                          <span className="font-mono font-bold px-1.5 py-0.5 rounded text-xs"
                            style={{background:"#1a1a1a",color:"#e6e6e6",border:"1px solid #2a2a2e"}}>{sd.degree}</span>
                        </td>
                        <td className="px-3 py-2">
                          <NotaDot note={sd.note} size={26}/>
                        </td>
                        <td className="px-3 py-2">
                          <button onClick={()=>{const c=parseChord(`${sd.note}${sd.quality}`);if(c)playChord(c.notes);}}
                            className="font-bold hover:opacity-75" style={{color:"#ececec",fontSize:"13px"}}>
                            {fmtNota(sd.note)}{sd.quality} ▶
                          </button>
                        </td>
                        <td className="px-3 py-2 text-[#a3a3a3] whitespace-nowrap">{sd.mode.name}</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            {twn.map((t,j)=>(<TensionChip key={j} label={t.label} note={t.note} tipo="ok"/>))}
                            {!twn.length&&<span className="text-gray-700">—</span>}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            {awn.map((t,j)=>(<TensionChip key={j} label={t.label} note={t.note} tipo="no"/>))}
                            {!awn.length&&<span className="text-gray-700">—</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Acordes diatónicos escuchables */}
          <div className="rounded-xl p-3 border border-gray-800" style={{background:"#121212"}}>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Acordes diatónicos — escuchá cada uno</p>
            <div className="flex flex-wrap gap-2">
              {scaleData.map((sd,i)=>{
                const color=nc(sd.note);
                return(
                  <button key={i}
                    onClick={()=>{const c=parseChord(`${sd.note}${sd.quality}`);if(c)playChord(c.notes);}}
                    className="flex flex-col items-center px-3 py-2 rounded-xl border font-bold"
                    style={{backgroundColor:color+"18",borderColor:color+"66",color,minWidth:"44px"}}>
                    <span className="text-xs opacity-60">{sd.degree}</span>
                    <span className="text-sm">{sd.note}</span>
                    <span className="text-xs opacity-75">{sd.quality}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tonalidades vecinas para navegación */}
          <div className="rounded-xl p-3 border border-gray-800" style={{background:"#121212"}}>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Tonalidades vecinas</p>
            <div className="flex gap-2 flex-wrap">
              {[
                {label:"← Subdominante",note:COF[(COF.findIndex(c=>c.note===selectedKey)+11)%12]?.note},
                {label:"Dominante →",note:COF[(COF.findIndex(c=>c.note===selectedKey)+1)%12]?.note},
                {label:"Relativa menor",note:COF.find(c=>c.note===selectedKey)?.minor?.replace("m","")},
              ].filter(v=>v.note).map((v,i)=>{
                const color=nc(v.note);
                return(
                  <button key={i} onClick={()=>onSelect&&onSelect(v.note)}
                    className="flex flex-col items-center px-3 py-2 rounded-xl border text-xs"
                    style={{backgroundColor:color+"18",borderColor:color+"55",color}}>
                    <span className="opacity-60 mb-0.5">{v.label}</span>
                    <span className="font-bold text-sm">{v.note}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={()=>onSelect&&onSelect(null)}
            className="text-xs text-gray-600 hover:text-gray-400">✕ Cerrar tonalidad</button>
        </div>
      )}
    </div>
  );
};
