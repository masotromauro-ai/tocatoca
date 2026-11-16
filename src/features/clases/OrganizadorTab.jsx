// La pestaña Organizador.

import { useState, useMemo } from "react";
import { aRomano } from "../../shared/teoria/romanos.js";
import { useRomanos } from "../../shared/almacen/romanos.js";
import { DEDO_OPC, EJ_NUEVO, OPT_DIR, OPT_FUELLE, OPT_MANO, OPT_MODO, ORG_KEY, Sel, cargarOrg, descEj, fmtHz, idn, rutaDeEjercicio } from "./org.jsx";
import { inpS } from "../../shared/ui/tema.js";
import { PanelIngresos } from "./PanelIngresos.jsx";
import { CHROMATIC, nombreLat } from "../../shared/teoria/notas.js";
import { nc } from "../../shared/teoria/color.js";
import { uiLabel, uiPill } from "../../shared/ui/tema.js";
import { playBand } from "../../shared/audio/audio.js";
import { loadBtns } from "../../shared/bandoneon/almacen.js";
import { ESC_ENT } from "../../shared/bandoneon/camino.js";
import { ACORDE_BASES, ACORDE_NOV, ACORDE_RAICES, ACORDE_SEPT, ACORDE_TRE, ACORDE_UND } from "../../shared/bandoneon/acordes-base.js";

export function OrganizadorTab({onProbar}){
  const [org,setOrg]=useState(cargarOrg);
  const btns=useMemo(()=>loadBtns(),[]);
  const [romano]=useRomanos();
  const [nuevoAl,setNuevoAl]=useState("");
  const [abierta,setAbierta]=useState(null);
  const [ej,setEj]=useState(EJ_NUEVO);
  const [conf,setConf]=useState(null);
  const [msg,setMsg]=useState("");
  const guardar=(o)=>{ setOrg(o); try{ localStorage.setItem(ORG_KEY,JSON.stringify(o)); }catch(e){} };
  const aviso=(t)=>{ setMsg(t); setTimeout(()=>setMsg(""),3500); };

  const addAlumno=()=>{ const n=nuevoAl.trim();
    if(!/^[A-Za-z0-9._-]{2,30}$/.test(n)) return aviso("Usá el mismo usuario con el que entra el alumno (2 a 30 letras o números, sin espacios).");
    if(org.alumnos.some(a=>a.toLowerCase()===n.toLowerCase())) return aviso("Ese alumno ya está en la lista.");
    guardar({...org,alumnos:[...org.alumnos,n]}); setNuevoAl(""); };
  const delAlumno=(n)=>{ if(conf!=="a"+n){ setConf("a"+n); return; } setConf(null);
    const asign={...org.asign}; delete asign[n]; guardar({...org,alumnos:org.alumnos.filter(a=>a!==n),asign}); };
  const importarUsuarios=async(file)=>{ if(!file) return; try{ const j=JSON.parse(await file.text()); const us=(j.users||[]).map(u=>u.u).filter(Boolean);
      // los nombres se llevan a la escritura exacta del usuario real (las mayúsculas importan para asignar bien)
      const canon=(n)=>us.find(x=>x.toLowerCase()===n.toLowerCase())||n;
      const alumnos=[...new Set([...org.alumnos.map(canon),...us])];
      const asign={}; Object.entries(org.asign).forEach(([k,l])=>{ const c=canon(k); asign[c]=[...new Set([...(asign[c]||[]),...l])]; });
      guardar({...org,alumnos,asign,usuarios:us}); aviso(`Lista actualizada: ${us.length} usuario(s) de usuarios.json.`);
    }catch(e){ aviso("Ese archivo no es un usuarios.json válido."); } };
  const sinMatch=(n)=>org.usuarios&&org.usuarios.length>0&&!org.usuarios.includes(n);
  const cuenta=(n)=>(org.asign[n]||[]).filter(id=>org.clases.some(c=>c.id===id)).length;

  const addClase=()=>{ const n=org.clases.length+1; guardar({...org,clases:[...org.clases,{id:idn(),nombre:`Clase ${n}`,titulo:"",ejercicios:[]}]}); };
  const updClase=(id,patch)=>guardar({...org,clases:org.clases.map(c=>c.id===id?{...c,...patch}:c)});
  const moverClase=(id,d)=>{ const a=[...org.clases], i=a.findIndex(c=>c.id===id), j=i+d; if(j<0||j>=a.length) return; [a[i],a[j]]=[a[j],a[i]]; guardar({...org,clases:a}); };
  const delClase=(id)=>{ if(conf!=="c"+id){ setConf("c"+id); return; } setConf(null);
    const asign={}; Object.entries(org.asign).forEach(([u,l])=>{ asign[u]=l.filter(x=>x!==id); });
    guardar({...org,clases:org.clases.filter(c=>c.id!==id),asign}); };

  // ejercicio: formulario, guardado (nuevo o editado) y borrado
  const setP=(patch,reiniciaDedos=true)=>setEj(e=>({...e,...patch,...(reiniciaDedos?{dedos:[]}:{})}));
  const rutaForm = ej.tipo==="escala" ? rutaDeEjercicio(ej,btns) : null;
  const guardarEj=(cid)=>{
    let nuevo={...ej,id:ej.id||idn()};
    if(nuevo.tipo==="texto"&&!nuevo.texto.trim()) return aviso("Escribí la consigna de la tarea.");
    if(nuevo.tipo==="escala"){
      if(!rutaForm||!rutaForm.pasos.length) return aviso("Con este fuelle y esta mano no hay camino para esa escala. Probá otro fuelle, otra mano u otra nota de inicio.");
      nuevo.ruta=rutaForm.pasos.map((p,i)=>({...p,d:(ej.dedos&&ej.dedos[i])||""}));
    }
    const c=org.clases.find(x=>x.id===cid), ya=c.ejercicios.some(x=>x.id===nuevo.id);
    updClase(cid,{ejercicios:ya?c.ejercicios.map(x=>x.id===nuevo.id?nuevo:x):[...c.ejercicios,nuevo]});
    setAbierta(null); setEj(EJ_NUEVO); aviso(ya?"Ejercicio actualizado.":"Ejercicio agregado a la clase."); };
  const editarEj=(cid,e)=>{ setAbierta(cid); setEj({...EJ_NUEVO,...e,dedos:e.ruta?e.ruta.map(p=>p.d||""):[]}); };
  const delEj=(cid,eid)=>updClase(cid,{ejercicios:org.clases.find(c=>c.id===cid).ejercicios.filter(e=>e.id!==eid)});

  // asignación
  const tiene=(u,cid)=>(org.asign[u]||[]).includes(cid);
  const todosAsig=(cid)=>org.alumnos.length>0&&org.alumnos.every(u=>tiene(u,cid));
  const toggle=(u,cid)=>{ const l=org.asign[u]||[]; guardar({...org,asign:{...org.asign,[u]:l.includes(cid)?l.filter(x=>x!==cid):[...l,cid]}}); };
  const toggleTodos=(cid)=>{ const todos=todosAsig(cid); const asign={...org.asign};
    org.alumnos.forEach(u=>{ const l=(asign[u]||[]).filter(x=>x!==cid); asign[u]=todos?l:[...l,cid]; }); guardar({...org,asign}); };

  const descargar=()=>{ const data={version:2,clases:org.clases,asignaciones:org.asign};
    const b=new Blob([JSON.stringify(data,null,1)],{type:"application/json"}), a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download="clases.json"; document.body.appendChild(a); a.click(); a.remove(); };
  const cargar=async(file)=>{ if(!file) return; try{ const j=JSON.parse(await file.text()); if(!Array.isArray(j.clases)) throw 0;
      const asign=j.asignaciones||{}; const alumnos=[...new Set([...org.alumnos,...Object.keys(asign)])]; guardar({...org,alumnos,clases:j.clases,asign,registroUrl:org.registroUrl||""}); aviso("Clases cargadas."); }catch(e){ aviso("Ese archivo no es un clases.json válido."); } };

  const card={background:"#121212",border:"1px solid #2a2a2a",borderRadius:12,padding:"12px 14px",marginBottom:12};
  const peq={...uiPill(false),padding:"4px 10px",fontSize:11};
  return(
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-1" style={{fontFamily:"'Libre Baskerville',serif"}}>Organizador de clases</h2>
        <p className="text-xs text-gray-500">Solo vos ves esta pestaña. Cada ejercicio de escala sale completo para el alumno: notas con su octava, frecuencia y dedos sugeridos.</p>
      </div>

      <PanelIngresos org={org} guardar={guardar} card={card} peq={peq}/>

      <div style={{...card,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        <button style={uiPill(true)} onClick={descargar}>⬇ Descargar clases.json</button>
        <label style={{...uiPill(false),display:"inline-block"}}>⬆ Cargar clases.json<input type="file" accept=".json,application/json" style={{display:"none"}} onChange={e=>{cargar(e.target.files[0]);e.target.value="";}}/></label>
        <span style={{fontSize:11,color:"#8a8a8a",flex:"1 1 260px"}}>Cuando termines, descargá el archivo y copialo junto a <b>index.html</b> (Netlify: carpeta para-subir · Vercel: carpeta public). Todo se guarda también en este navegador.</span>
        {msg && <span style={{fontSize:12,color:"#c9a25a",width:"100%"}}>{msg}</span>}
      </div>

      {/* 1 · alumnos */}
      <div style={card}>
        <p style={uiLabel}>1 · Alumnos</p>
        <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
          {org.alumnos.length===0 && <span style={{fontSize:12,color:"#8a8a8a"}}>Todavía no cargaste alumnos.</span>}
          {org.alumnos.map(n=>(<span key={n} title={sinMatch(n)?"Este nombre no coincide con ningún usuario de usuarios.json: el alumno no verá sus tareas":""} style={{...uiPill(false),display:"inline-flex",gap:8,alignItems:"center",cursor:"default",borderColor:sinMatch(n)?"#c0615a":undefined}}>{sinMatch(n)?"⚠ ":""}{n}<span style={{fontSize:10,color:"#8a8a8a"}}>{cuenta(n)} clase{cuenta(n)===1?"":"s"}</span>
            <button onClick={()=>delAlumno(n)} style={{background:"none",border:"none",color:conf==="a"+n?"#c0615a":"#8a8a8a",cursor:"pointer",fontSize:11,padding:0}}>{conf==="a"+n?"¿Seguro?":"✕"}</button></span>))}
        </div>
        <div className="flex flex-wrap gap-2">
          <input style={{...inpS,flex:"1 1 180px"}} placeholder="usuario del alumno (ej: maria)" value={nuevoAl} onChange={e=>setNuevoAl(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter") addAlumno(); }} autoCapitalize="none"/>
          <button style={uiPill(true)} onClick={addAlumno}>Agregar</button>
          <label style={{...uiPill(false),display:"inline-block"}}>Importar de usuarios.json<input type="file" accept=".json,application/json" style={{display:"none"}} onChange={e=>{importarUsuarios(e.target.files[0]);e.target.value="";}}/></label>
        </div>
        <p style={{fontSize:11,color:"#8a8a8a",margin:"8px 0 0"}}>El nombre tiene que ser exactamente el usuario con el que el alumno entra. Usá "Importar de usuarios.json" para evitar errores: marca con ⚠ los nombres que no coinciden. Al lado de cada nombre ves cuántas clases tiene asignadas.</p>
      </div>

      {/* 2 · clases */}
      <div style={card}>
        <div className="flex items-center justify-between mb-2"><p style={uiLabel}>2 · Clases, ejercicios y a quién se asignan</p><button style={uiPill(true,{padding:"5px 12px"})} onClick={addClase}>＋ Nueva clase</button></div>
        {org.clases.length===0 && <p style={{fontSize:12,color:"#8a8a8a",margin:"6px 0 0"}}>Creá la primera clase, por ejemplo "Clase 1 · Escala de Do mayor".</p>}
        {org.clases.map((c,ci)=>(
          <div key={c.id} style={{border:"1px solid #2a2a2a",borderRadius:10,padding:"10px 12px",marginTop:10,background:"#0e0e10"}}>
            <div className="flex flex-wrap gap-2 items-center mb-2">
              <input style={{...inpS,width:110,fontWeight:700}} value={c.nombre} onChange={e=>updClase(c.id,{nombre:e.target.value})}/>
              <input style={{...inpS,flex:"1 1 200px"}} placeholder="título (ej: Escala de Do mayor, mano derecha)" value={c.titulo} onChange={e=>updClase(c.id,{titulo:e.target.value})}/>
              <button style={peq} disabled={ci===0} onClick={()=>moverClase(c.id,-1)}>↑</button>
              <button style={peq} disabled={ci===org.clases.length-1} onClick={()=>moverClase(c.id,1)}>↓</button>
              <button style={{...peq,color:conf==="c"+c.id?"#c0615a":"#a0a0a6"}} onClick={()=>delClase(c.id)}>{conf==="c"+c.id?"¿Seguro?":"Eliminar"}</button>
            </div>
            {/* a quién */}
            <div className="flex flex-wrap gap-1.5 items-center mb-2">
              <span style={{...uiLabel,marginRight:4}}>Asignada a</span>
              <button style={uiPill(todosAsig(c.id),{padding:"4px 10px",fontSize:11})} onClick={()=>toggleTodos(c.id)}>Todos</button>
              {org.alumnos.map(u=>(<button key={u} style={uiPill(tiene(u,c.id),{padding:"4px 10px",fontSize:11})} onClick={()=>toggle(u,c.id)}>{u}</button>))}
              {org.alumnos.length===0 && <span style={{fontSize:11,color:"#8a8a8a"}}>cargá alumnos arriba para poder asignarla</span>}
            </div>
            {c.ejercicios.length===0 && <p style={{fontSize:12,color:"#8a8a8a",margin:"4px 0 8px"}}>Sin ejercicios todavía.</p>}
            {c.ejercicios.map((e,k)=>(
              <div key={e.id} style={{padding:"6px 0",borderTop:k?"1px solid #1c1c1f":"none"}}>
                <div className="flex flex-wrap gap-2 items-center">
                  <span style={{fontSize:12.5,flex:"1 1 260px"}}><b style={{color:"#8a8a8a",marginRight:6}}>{k+1}.</b>{descEj(e)}</span>
                  {e.tipo!=="texto" && <button style={peq} onClick={()=>onProbar(e)}>▶ Probar</button>}
                  <button style={peq} onClick={()=>editarEj(c.id,e)}>✎ Editar</button>
                  <button style={peq} onClick={()=>delEj(c.id,e.id)}>✕</button>
                </div>
                {e.ruta && <div style={{fontSize:11,color:"#8a8a8a",margin:"4px 0 0 20px",fontFamily:"monospace"}}>{e.ruta.map(p=>`${romano?aRomano(p.g):p.g} ${p.n}${p.d?" ☝"+p.d:""}`).join(" · ")}</div>}
              </div>
            ))}
            {abierta===c.id ? (
              <div style={{marginTop:10,padding:10,border:"1px dashed #333",borderRadius:10}}>
                <p style={{...uiLabel,marginBottom:8}}>{ej.id?"Editar ejercicio":"Nuevo ejercicio"}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Sel v={ej.tipo} set={v=>setP({tipo:v})} opts={[["escala","Escala"],["acorde","Acorde"],["texto","Tarea libre (texto)"]]}/>
                  {ej.tipo==="escala" && <>
                    <Sel v={ej.root} set={v=>setP({root:v,inicio:-1})} opts={ACORDE_RAICES.map(x=>[x,nombreLat(x)])}/>
                    <Sel v={ej.escala} set={v=>setP({escala:v,inicio:-1})} opts={ESC_ENT.map(x=>[x.id,x.nombre])}/>
                    <Sel v={ej.mano} set={v=>setP({mano:v,inicio:-1})} opts={OPT_MANO}/>
                    <Sel v={ej.dir} set={v=>setP({dir:v,inicio:-1})} opts={OPT_DIR}/>
                    <Sel v={ej.fuelle} set={v=>setP({fuelle:v,inicio:-1})} opts={OPT_FUELLE}/>
                    <Sel v={ej.modoEj} set={v=>setP({modoEj:v},false)} opts={OPT_MODO}/>
                  </>}
                  {ej.tipo==="acorde" && <>
                    <Sel v={ej.ac.root} set={v=>setP({ac:{...ej.ac,root:v}},false)} opts={ACORDE_RAICES.map(x=>[x,nombreLat(x)])}/>
                    <Sel v={ej.ac.base} set={v=>setP({ac:{...ej.ac,base:v}},false)} opts={ACORDE_BASES.map(x=>[x.id,x.label])}/>
                    <Sel v={ej.ac.sept} set={v=>setP({ac:{...ej.ac,sept:v}},false)} opts={ACORDE_SEPT.map(x=>[x.id,x.label])}/>
                    <Sel v={ej.ac.nov} set={v=>setP({ac:{...ej.ac,nov:v}},false)} opts={ACORDE_NOV.map(x=>[x.id,"Novena "+x.label])}/>
                    <Sel v={ej.ac.und} set={v=>setP({ac:{...ej.ac,und:v}},false)} opts={ACORDE_UND.map(x=>[x.id,"Oncena "+x.label])}/>
                    <Sel v={ej.ac.tre} set={v=>setP({ac:{...ej.ac,tre:v}},false)} opts={ACORDE_TRE.map(x=>[x.id,"Trecena "+x.label])}/>
                    <button style={uiPill(ej.ac.seis,{padding:"6px 10px"})} onClick={()=>setP({ac:{...ej.ac,seis:!ej.ac.seis}},false)}>Sexta</button>
                    <button style={uiPill(ej.ac.sin5,{padding:"6px 10px"})} onClick={()=>setP({ac:{...ej.ac,sin5:!ej.ac.sin5}},false)}>Sin quinta</button>
                    <Sel v={ej.fuelle} set={v=>setP({fuelle:v},false)} opts={OPT_FUELLE}/>
                  </>}
                  {ej.tipo==="texto" && <textarea style={{...inpS,width:"100%"}} rows={2} placeholder="Consigna (ej: tocar la escala con metrónomo a 60, dos veces sin errores)" value={ej.texto} onChange={e=>setP({texto:e.target.value},false)}/>}
                </div>

                {/* camino + digitación */}
                {ej.tipo==="escala" && rutaForm && (
                  <div style={{marginBottom:10}}>
                    {rutaForm.inicios.length>1 && (
                      <div className="flex flex-wrap gap-1.5 items-center mb-2">
                        <span style={{...uiLabel,marginRight:4}}>Empezar en</span>
                        {rutaForm.inicios.map((n,i)=>(<button key={n+i} style={uiPill(rutaForm.usado===i,{padding:"4px 10px",fontSize:11})} onClick={()=>setP({inicio:i})}>{n}</button>))}
                      </div>
                    )}
                    {rutaForm.pasos.length===0 ? (
                      <p style={{fontSize:12,color:"#c9a25a",margin:0}}>Con este fuelle y esta mano esa escala no tiene camino. Probá otro fuelle, otra mano u otra escala.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table style={{borderCollapse:"collapse",width:"100%",fontSize:12.5}}>
                          <thead><tr style={{color:"#8a8a8a",fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase"}}>
                            {["Función","Nota","Frecuencia","Tecla","Dedo",""].map(h=>(<th key={h} style={{textAlign:"left",padding:"4px 8px",fontWeight:600}}>{h}</th>))}
                          </tr></thead>
                          <tbody>
                            {rutaForm.pasos.map((p,i)=>(
                              <tr key={i} style={{borderTop:"1px solid #1c1c1f"}}>
                                <td style={{padding:"4px 8px",fontWeight:700}}>{romano?aRomano(p.g):p.g}</td>
                                <td style={{padding:"4px 8px"}}><span style={{display:"inline-block",width:10,height:10,borderRadius:3,background:nc(CHROMATIC[p.pc]),marginRight:7}}/>{p.n}</td>
                                <td style={{padding:"4px 8px",fontFamily:"monospace",color:"#a0a0a6"}}>{fmtHz(p.hz)} Hz</td>
                                <td style={{padding:"4px 8px",fontFamily:"monospace",color:"#a0a0a6"}}>{p.b}</td>
                                <td style={{padding:"3px 8px"}}><Sel v={(ej.dedos&&ej.dedos[i])||""} set={v=>{ const d=rutaForm.pasos.map((_,k)=>(ej.dedos&&ej.dedos[k])||""); d[i]=v; setEj({...ej,dedos:d}); }} opts={DEDO_OPC} w={86}/></td>
                                <td style={{padding:"3px 8px"}}><button style={peq} onClick={()=>playBand(CHROMATIC[p.pc],parseInt(p.n.slice(-1),10))}>▶</button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p style={{fontSize:11,color:"#8a8a8a",margin:"6px 0 0"}}>Dedo: 1 índice · 2 medio · 3 anular · 4 meñique. Con "1 o 2" sugerís dos opciones para esa nota.</p>
                      </div>
                    )}
                    {rutaForm.faltan.length>0 && <p style={{fontSize:11.5,color:"#c9a25a",margin:"6px 0 0"}}>⚠ Falta en este camino: {rutaForm.faltan.join(", ")}.</p>}
                  </div>
                )}
                <textarea style={{...inpS,width:"100%",marginBottom:8}} rows={2} placeholder="Indicaciones para el alumno (opcional): tempo, articulación, cuántas repeticiones…" value={ej.indic||""} onChange={e=>setP({indic:e.target.value},false)}/>
                <div className="flex gap-2"><button style={uiPill(true)} onClick={()=>guardarEj(c.id)}>{ej.id?"Guardar cambios":"Agregar a la clase"}</button><button style={uiPill(false)} onClick={()=>{ setAbierta(null); setEj(EJ_NUEVO); }}>Cancelar</button></div>
              </div>
            ) : (
              <button style={{...peq,marginTop:8}} onClick={()=>{ setAbierta(c.id); setEj(EJ_NUEVO); }}>＋ Agregar ejercicio</button>
            )}
          </div>
        ))}
      </div>

      {/* 3 · resumen */}
      <details style={card}>
        <summary style={{cursor:"pointer",...uiLabel}}>3 · Resumen de asignaciones</summary>
        {(org.alumnos.length===0||org.clases.length===0) ? (
          <p style={{fontSize:12,color:"#8a8a8a",margin:"8px 0 0"}}>Cargá al menos un alumno y una clase.</p>
        ) : (
          <div className="overflow-x-auto mt-2">
            <table style={{borderCollapse:"collapse",fontSize:12.5,width:"100%"}}>
              <thead><tr>
                <th style={{textAlign:"left",padding:"6px 8px",color:"#8a8a8a",fontWeight:600}}>Alumno</th>
                {org.clases.map(c=>(<th key={c.id} title={c.titulo} style={{padding:"6px 8px",fontWeight:700,whiteSpace:"nowrap"}}>{c.nombre}</th>))}
              </tr></thead>
              <tbody>
                {org.alumnos.map(u=>(<tr key={u} style={{borderTop:"1px solid #1c1c1f"}}>
                  <td style={{padding:"7px 8px",fontWeight:600}}>{u}</td>
                  {org.clases.map(c=>(<td key={c.id} style={{textAlign:"center",padding:"7px 8px"}}>
                    <input type="checkbox" checked={tiene(u,c.id)} onChange={()=>toggle(u,c.id)} style={{width:18,height:18,cursor:"pointer"}}/></td>))}
                </tr>))}
              </tbody>
            </table>
          </div>
        )}
      </details>
      <p style={{fontSize:11,color:"#6a6a6a",lineHeight:1.5}}>Aviso: clases.json es un archivo público de tu sitio: quien tenga el enlace podría leerlo. No incluyas datos personales. Desde acá no ves qué ejercicios hace el alumno; solo cuántas veces entra y abre una tarea (panel "Ingresos de los alumnos", si lo configurás).</p>
    </div>
  );
}
