// La pestaña Acorde. El estado vive en la raíz (no se pierde al cambiar de pestaña) y llega como props.

import { nombreLat } from "../../../shared/teoria/notas.js";
import { uiLabel, uiPill } from "../../../shared/ui/tema.js";
import { playChord } from "../../../shared/audio/audio.js";
import { GRUPOS_ACORDE } from "../../../shared/teoria/acordes.js";
import { Nota } from "../../../shared/ui/teoria/notas.jsx";
import { FnCard, TablaComparativa } from "../../../shared/ui/teoria/Funciones.jsx";
import { Circulo } from "../../../shared/ui/teoria/Circulo.jsx";
import { ACORDE_RAICES } from "../../../shared/bandoneon/acordes-base.js";
import { DondeVive } from "../modos/ModosTab.jsx";

export function AcordeTab({ analyzeChord, chord, chordInput, elegirAcorde, fns, openFns, pickQ, pickRoot, setChordInput, setShowTable, showTable, toggleFn }) {
  return (
    <div className="space-y-5 stagger">
                <div className="flex gap-2">
                  <input value={chordInput} onChange={e=>setChordInput(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&analyzeChord()}
                    placeholder="Ej: Dm7, G7, Cmaj7, Am7b5, Bb7alt…"
                    className="glow-input flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-lg text-gray-100"
                    style={{fontFamily:"monospace"}}/>
                  <button onClick={analyzeChord}
                    className="px-5 py-3 rounded-xl text-sm font-bold"
                    style={{background:"#1a1a1a",border:"1px solid #e6e6e6",color:"#e6e6e6",whiteSpace:"nowrap"}}>
                    Analizar
                  </button>
                </div>

                <div style={{background:"#121214",border:"1px solid #26262a",borderRadius:14,padding:"12px 14px"}}>
                  <p style={{...uiLabel,marginBottom:8}}>O armalo con un toque · raíz</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
                    {ACORDE_RAICES.map(x=>(<button key={x} style={uiPill(pickRoot===x,{padding:"5px 11px"})} onClick={()=>elegirAcorde(x,pickQ||"maj")}>{nombreLat(x)}</button>))}
                  </div>
                  {GRUPOS_ACORDE.map(([tit,lista])=>(
                    <div key={tit} style={{marginBottom:10}}>
                      <p style={{...uiLabel,fontSize:9.5,marginBottom:6,color:tit==="Disminuidos"?"#cfcfd4":undefined}}>{tit}</p>
                      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                        {lista.map(([q,l])=>(<button key={q} style={uiPill(pickQ===q,{padding:"5px 11px"})} onClick={()=>elegirAcorde(pickRoot,q)}>{l}</button>))}
                      </div>
                    </div>
                  ))}
                  <p style={{fontSize:11,color:"#6a6a70",margin:"4px 0 0"}}>También podés escribirlo: Bdim, B°7, Bø7, Bm7b5, C7sus4, Cm6, Cmmaj7, C7#5, Cmaj7#11…</p>
                </div>

                {chord&&<>
                  <div className="rounded-2xl p-5 border border-gray-700" style={{background:"#121212"}}>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Acorde</p>
                    <div className="flex items-baseline gap-3 mb-4 flex-wrap">
                      <h2 className="text-3xl font-bold" style={{fontFamily:"'Libre Baskerville',serif"}}>
                        {chord.root}<span className="text-gray-400">{chord.formula.symbol}</span>
                      </h2>
                      <span className="text-lg text-gray-400 italic">{chord.formula.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {chord.notes.map(n=><Nota key={n} note={n} size="lg"/>)}
                    </div>
                                        <button onClick={()=>playChord(chord.notes)}
                      className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold border"
                      style={{background:"#1a1a1a",borderColor:"#333333",color:"#e6e6e6"}}>
                      ▶ Escuchar acorde
                    </button>
                  </div>

                  <DondeVive chord={chord}/>

                  <div className="flex items-center gap-3">
                    <p className="text-xs text-gray-500 uppercase tracking-widest">
                      Funciones armónicas <span className="text-gray-700">({fns.length})</span>
                    </p>
                    <div className="flex gap-1 ml-auto">
                      {["Detalle","Tabla"].map((v,vi)=>(
                        <button key={v} onClick={()=>setShowTable(vi===1)}
                          className="px-3 py-1 rounded-lg text-xs border"
                          style={{background:showTable===(vi===1)?"#1a1a1a":"transparent",
                            borderColor:showTable===(vi===1)?"#e6e6e6":"#333",
                            color:showTable===(vi===1)?"#e6e6e6":"#666"}}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {showTable
                    ?<TablaComparativa fns={fns} root={chord.root}/>
                    :<div className="space-y-2">
                        {fns.map((f,i)=>(
                          <FnCard key={i} fn={f} root={chord.root} intervalos={chord.formula.intervals}
                            isOpen={openFns.includes(i)} onToggle={()=>toggleFn(i)}/>
                        ))}
                      </div>
                  }

                  <div className="rounded-xl p-4 border border-gray-800" style={{background:"#121212"}}>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Círculo de Quintas</p>
                    <Circulo highlighted={[chord.root]}/>
                  </div>
                </>}
              </div>
  );
}
