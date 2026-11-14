// La pestaña Progresión. El estado vive en la raíz y llega como props.

import { buildScale } from "../../../shared/teoria/notas.js";
import { nc } from "../../../shared/teoria/color.js";
import { playChord } from "../../../shared/audio/audio.js";
import { MODE_BY_DEGREE, tNote } from "../../../shared/teoria/escalas.js";
import { QUAL_TXT, buildVoicing, parseChord } from "../../../shared/teoria/acordes.js";
import { SUF_CORTO, acordesDeNotas, romSept } from "../../../shared/teoria/progresiones.js";
import { Nota, NotaDot, TensionChip, fmtNota } from "../../../shared/ui/teoria/notas.jsx";

export function ProgresionTab({ analyzeProg, progInput, progression, setProgInput }) {
  return (
    <div className="space-y-5 stagger">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Acordes separados por guion, coma o espacio</p>
                  <div className="flex gap-2">
                    <input value={progInput} onChange={e=>setProgInput(e.target.value)}
                      onKeyDown={e=>e.key==="Enter"&&analyzeProg()}
                      placeholder="Ej: Dm7 – G7 – Cmaj7"
                      className="glow-input flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-lg"
                      style={{fontFamily:"monospace"}}/>
                    <button onClick={analyzeProg}
                      className="px-5 py-3 rounded-xl text-sm font-bold"
                      style={{background:"#1a1a1a",border:"1px solid #e6e6e6",color:"#e6e6e6"}}>
                      Analizar
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["Dm7 – G7 – Cmaj7","Am7b5 – D7b9 – Gm","Cmaj7 – A7 – Dm7 – G7","Am – E7 – Am – Dm"].map(ex=>(
                      <button key={ex} onClick={()=>setProgInput(ex)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-700 text-gray-500 hover:text-gray-300">
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>

                {progression&&(
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 uppercase tracking-widest">
                      Tonalidad probable:
                      <span className="ml-2 text-[#d4d4d4] font-bold text-base">{progression[0]?.key}</span>
                      {progression.alternativa&&<span className="ml-3 text-xs normal-case tracking-normal text-gray-500">también se puede leer en {progression.alternativa}</span>}
                    </p>
                    {progression.map((ch,i)=>{
                      const f=ch.fn;
                      const scale=f?.modeIvs?buildScale(ch.root,f.modeIvs):[];
                      const twn=(f?.tensions||[]).map(t=>({label:t,note:tNote(ch.root,t)}));
                      const v=buildVoicing(ch.root,ch.quality);
                      // Acordes diatónicos de la escala del modo (calidad calculada con las notas reales)
                      const padre=["Jónico","Dórico","Frigio","Lidio","Mixolidio","Eólico","Locrio"].indexOf(f?.mode);
                      const dia=scale.length===7?acordesDeNotas(scale).map((d,si)=>{
                        const md=padre>=0?MODE_BY_DEGREE[(padre+si)%7]:null;
                        return{root:d.raiz,degree:romSept(si,d.sq),qid:d.sq,quality:SUF_CORTO[d.sq]??"",mode:md?md.name:"",chNotes:d.sept,
                          tens:md?md.tensions.map(t=>({label:t,note:tNote(d.raiz,t)})):[],avd:md?md.avoid.map(t=>({label:t,note:tNote(d.raiz,t)})):[]};
                      }):[];

                      return(
                        <div key={i} className="rounded-2xl border border-gray-700 overflow-hidden" style={{background:"#121212"}}>
                          <div className="px-4 pt-4 pb-3 border-b border-gray-800">
                            <div className="flex items-baseline gap-3 mb-3 flex-wrap">
                              <span className="text-2xl font-bold" style={{fontFamily:"'Libre Baskerville',serif"}}>{ch.raw}</span>
                              <button onClick={()=>playChord(ch.notes)} className="text-sm text-gray-600 hover:text-[#d4d4d4]">▶</button>
                              <span className="text-xs px-2.5 py-1 rounded-full border"
                                style={{background:"#232323",borderColor:"#e6e6e6",color:"#e6e6e6"}}>
                                {ch.degree} en {ch.key}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {ch.notes.map(n=><Nota key={n} note={n} size="sm"/>)}
                            </div>
                            {f&&(
                              <div className="text-sm flex flex-wrap gap-x-4 gap-y-1">
                                <span><span className="text-[#a3a3a3]">Modo: </span><span className="text-white font-semibold">{f.mode}</span></span>
                                {twn.length>0&&(
                                  <span className="flex gap-1.5 flex-wrap items-center">
                                    <span className="text-gray-500">Tensiones:</span>
                                    {twn.map(({label,note},j)=>{
                                      const color=note?nc(note):"#888";
                                      return(
                                        <span key={j} className="font-mono text-xs px-1.5 py-0.5 rounded border"
                                          style={{background:color+"18",borderColor:color+"55",color}}>
                                          {label}{note?`→${note}`:""}
                                        </span>
                                      );
                                    })}
                                  </span>
                                )}
                                {f.avoid?.length>0&&(
                                  <span className="text-xs text-red-400">
                                    Evitar: {f.avoid.map(t=>{const n=tNote(ch.root,t);return n?`${t}→${n}`:t;}).join(" · ")}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Acordes diatónicos */}
                          {dia.length>0&&(
                            <div className="px-4 py-3">
                              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
                                Acordes diatónicos — {scale.join(" · ")}
                              </p>
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs" style={{minWidth:"460px"}}>
                                  <thead>
                                    <tr style={{borderBottom:"1px solid #1a1a1a"}}>
                                      {["Gr.","Acorde","Notas","Modo","Tensiones","Evitar"].map(h=>(
                                        <th key={h} className="text-left pb-1.5 text-gray-600 font-normal">{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {dia.map((dc,di)=>{
                                      const rc=nc(dc.root);
                                      return(
                                        <tr key={di} style={{borderBottom:"1px solid #121212",background:di%2===0?"transparent":"#0a0a0a"}}>
                                          <td className="py-1.5 pr-2">
                                            <span className="font-mono font-bold px-1.5 py-0.5 rounded"
                                              style={{background:"#1a1a1a",color:"#e6e6e6",border:"1px solid #2a2a2e"}}>{dc.degree}</span>
                                          </td>
                                          <td className="py-1.5 pr-2">
                                            <button className="font-bold hover:opacity-75" style={{color:"#ececec",fontSize:13}}
                                              onClick={()=>{const c=parseChord(`${dc.root}${QUAL_TXT[dc.qid]||""}`);if(c)playChord(c.notes);}}>
                                              {fmtNota(dc.root)}{dc.quality||(dc.qid==="?"?"":"")} ▶
                                            </button>
                                          </td>
                                          <td className="py-1.5 pr-2">
                                            <div className="flex gap-1 flex-wrap">
                                              {dc.chNotes.map((n,ni)=>(<NotaDot key={ni} note={n} size={24}/>))}
                                            </div>
                                          </td>
                                          <td className="py-1.5 pr-2 text-[#a3a3a3] whitespace-nowrap">{dc.mode}</td>
                                          <td className="py-1.5 pr-2">
                                            <div className="flex gap-0.5 flex-wrap">
                                              {dc.tens.map(({label,note},ti)=>(<TensionChip key={ti} label={label} note={note} tipo="ok"/>))}
                                              {!dc.tens.length&&<span className="text-gray-700">—</span>}
                                            </div>
                                          </td>
                                          <td className="py-1.5">
                                            <div className="flex gap-0.5 flex-wrap">
                                              {dc.avd.map(({label,note},ai)=>(<TensionChip key={ai} label={label} note={note} tipo="no"/>))}
                                              {!dc.avd.length&&<span className="text-gray-700">—</span>}
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
  );
}
