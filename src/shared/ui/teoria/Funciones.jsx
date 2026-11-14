// Tarjeta de función armónica y tabla comparativa.

import { useMemo } from "react";
import { NotaDot } from "./notas.jsx";
import { GRADO_LABEL } from "../../teoria/etiquetas.js";
import { buildScale, nombreLat, spell } from "../../teoria/notas.js";
import { nc } from "../../teoria/color.js";
import { playTone } from "../../audio/audio.js";
import { tNote } from "../../teoria/escalas.js";

// Card de función armónica desplegable
export const FnCard=({fn,root,isOpen,onToggle,intervalos})=>{
  const scale=useMemo(()=>fn.modeIvs?buildScale(root,fn.modeIvs):[],[root,fn.modeIvs]);
  const twn=useMemo(()=>(fn.tensions||[]).map(t=>({label:t,note:tNote(root,t)})),[root,fn.tensions]);
  const awn=useMemo(()=>(fn.avoid||[]).map(t=>({label:t,note:tNote(root,t)})),[root,fn.avoid]);
  // notas del acorde que no pertenecen al modo (p. ej. la 5ª justa del V7 en la escala alterada)
  const fuera=useMemo(()=>{ const m=(fn.modeIvs||[]).map(x=>x%12), DX={0:0,1:1,2:1,3:2,4:2,5:3,6:4,7:4,8:5,9:5,10:6,11:6};
    return (intervalos||[]).map(x=>x%12).filter(x=>fn.modeIvs&&!m.includes(x)).map(x=>`${GRADO_LABEL[x]} (${nombreLat(spell(root,x,DX[x]))})`); },[root,fn.modeIvs,intervalos]);
  return(
    <div className="rounded-xl border overflow-hidden" style={{borderColor:isOpen?"#e6e6e6":"#1a1a1a"}}>
      <button className="w-full text-left px-4 py-3 flex items-center justify-between gap-2"
        style={{background:isOpen?"#1a1a1a":"#0a0a0a"}} onClick={onToggle}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded border flex-shrink-0"
            style={{background:"#1a1a1a",borderColor:"#333333",color:"#e6e6e6"}}>{fn.degree}</span>
          <div className="min-w-0">
            <p className="font-bold text-sm text-[#d4d4d4] truncate">{fn.fn}</p>
            <p className="text-xs text-gray-500 italic truncate">{fn.key}</p>
          </div>
        </div>
        <span className="text-gray-600 text-xs flex-shrink-0">{isOpen?"▲":"▼"}</span>
      </button>
      {isOpen&&(
        <div className="px-4 pb-4 pt-3 space-y-3" style={{background:"#0a0a0a"}}>
          {/* Modo + Escala */}
          <div className="rounded-lg p-3 border border-gray-800" style={{background:"#121212"}}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-[#a3a3a3] font-semibold">Modo:</span>
              <span className="text-sm font-bold text-white">{fn.mode}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {scale.map((n,i)=>(
                <div key={i} className="flex flex-col items-center gap-1" style={{minWidth:34}}>
                  <NotaDot note={n} size={32}/>
                  <span style={{fontSize:9,color:"#6a6a70",fontFamily:"monospace"}}>{i+1}°</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 font-mono">{scale.join(" — ")}</p>
            {fuera.length>0&&<p style={{fontSize:11,color:"#c9a25a",margin:"8px 0 0",lineHeight:1.45}}>De este acorde no pertenece al modo: {fuera.join(", ")}. Se omite o se altera.</p>}
          </div>
          {/* Tensiones y evitar */}
          <div className="grid grid-cols-2 gap-2">
            {twn.length>0&&(
              <div className="rounded-lg p-3 border border-green-900" style={{background:"#070f07"}}>
                <p className="text-xs font-bold text-green-400 mb-2">✅ Tensiones</p>
                <div className="space-y-1.5">
                  {twn.map(({label,note},i)=>{
                    const color=note?nc(note):"#888";
                    return(
                      <div key={i} className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-green-300 w-7">{label}</span>
                        <span className="text-gray-600 text-xs">→</span>
                        {note?<NotaDot note={note} size={26}/>
                        :<span className="text-gray-600 text-xs italic">varía</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {awn.length>0&&(
              <div className="rounded-lg p-3 border border-red-900" style={{background:"#0f0707"}}>
                <p className="text-xs font-bold text-red-400 mb-2">⚠️ Evitar</p>
                <div className="space-y-1.5">
                  {awn.map(({label,note},i)=>{
                    const color=note?nc(note):"#888";
                    return(
                      <div key={i} className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-red-400 w-7">{label}</span>
                        <span className="text-gray-600 text-xs">→</span>
                        {note&&<NotaDot note={note} size={26}/>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          {fn.resolutions?.length>0&&(
            <div className="rounded-lg p-2.5 border border-[#333333]" style={{background:"#0a0a0a"}}>
              <span className="text-xs text-[#d4d4d4] font-semibold">➜ </span>
              <span className="text-sm text-[#cfcfcf] font-mono">{fn.resolutions.join(" · ")}</span>
            </div>
          )}
          <div className="rounded-lg p-3 border border-gray-800" style={{background:"#0a0a0a"}}>
            <p className="text-xs text-gray-500 mb-1">💡 Por qué funciona</p>
            <p className="text-sm text-gray-300 leading-relaxed">{fn.why}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Tabla comparativa
export const TablaComparativa=({fns,root})=>(
  <div className="overflow-x-auto rounded-xl border border-gray-800" style={{background:"#121212"}}>
    <table className="w-full text-xs" style={{minWidth:"550px"}}>
      <thead>
        <tr style={{background:"#1a1a1a",borderBottom:"1px solid #333333"}}>
          {["Grado","Función","Modo","Escala","Tensiones","Evitar"].map(h=>(
            <th key={h} className="text-left px-3 py-2 text-gray-500 uppercase tracking-widest font-normal text-xs">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {fns.map((f,i)=>{
          const scale=f.modeIvs?buildScale(root,f.modeIvs):[];
          const twn=(f.tensions||[]).map(t=>{const n=tNote(root,t);return n?`${t}→${n}`:t;});
          const awn=(f.avoid||[]).map(t=>{const n=tNote(root,t);return n?`${t}→${n}`:t;});
          return(
            <tr key={i} style={{borderBottom:"1px solid #2a2a2a",background:i%2===0?"transparent":"#1a1a1a"}}>
              <td className="px-3 py-2">
                <span className="font-mono font-bold px-1.5 py-0.5 rounded text-xs"
                  style={{background:"#1a1a1a",color:"#e6e6e6"}}>{f.degree}</span>
              </td>
              <td className="px-3 py-2">
                <p className="font-semibold text-[#d4d4d4]">{f.fn}</p>
                <p className="text-gray-500 italic">{f.key}</p>
              </td>
              <td className="px-3 py-2 text-[#a3a3a3] whitespace-nowrap">{f.mode}</td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap gap-1">
                  {scale.map((n,j)=>(
                    <button key={j} onClick={()=>playTone(n,4,0.5)}
                      className="px-1.5 py-0.5 rounded border font-bold"
                      style={{backgroundColor:nc(n)+"22",borderColor:nc(n)+"55",color:nc(n)}}>
                      {n}
                    </button>
                  ))}
                </div>
              </td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap gap-1">
                  {twn.map((t,j)=>(
                    <span key={j} className="px-1.5 py-0.5 rounded font-mono"
                      style={{background:"#0a1f0a",borderColor:"#2d5c2d",color:"#6dbd6d",border:"1px solid #2d5c2d"}}>{t}</span>
                  ))}
                  {!twn.length&&<span className="text-gray-700">—</span>}
                </div>
              </td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap gap-1">
                  {awn.map((t,j)=>(
                    <span key={j} className="px-1.5 py-0.5 rounded font-mono"
                      style={{background:"#1f0a0a",color:"#bd6d6d",border:"1px solid #5c2d2d"}}>{t}</span>
                  ))}
                  {!awn.length&&<span className="text-gray-700">—</span>}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
