// Ingresos de los alumnos.

import { useState } from "react";
import { REG_CLAVE_KEY, REG_URL_RE, haceCuanto } from "./org.jsx";
import { inpS } from "../../shared/ui/tema.js";
import { uiPill } from "../../shared/ui/tema.js";

export function PanelIngresos({org,guardar,card,peq}){
  const [abierto,setAbierto]=useState(false);
  const [clave,setClave]=useState(()=>{ try{ return localStorage.getItem(REG_CLAVE_KEY)||""; }catch(e){ return ""; } });
  const [res,setRes]=useState(null), [cargando,setCargando]=useState(false), [err,setErr]=useState(""), [info,setInfo]=useState("");
  const url=(org.registroUrl||"").trim(), urlOk=REG_URL_RE.test(url);
  const actualizar=async()=>{
    setErr(""); setCargando(true);
    try{ try{ localStorage.setItem(REG_CLAVE_KEY,clave); }catch(e){}
      setInfo("");
      const r=await fetch(url,{method:"POST",body:JSON.stringify({a:"resumen",clave:clave}),cache:"no-store"}); const j=await r.json();
      if(!j.ok) setErr(j.error==="clave" ? "La clave no coincide con la que pusiste en el script (propiedad CLAVE)." : j.error==="espera" ? "Demasiados intentos con clave equivocada. Esperá unos minutos." : "El registro respondió con un error."); else setRes(j);
    }catch(e){ setErr("No pude leer el registro. Revisá la dirección y que la publicación esté como \"Cualquier persona\"."); }
    setCargando(false); };
  const filas = (()=>{ if(!res) return []; const por={}; (res.alumnos||[]).forEach(a=>{ por[String(a.u).toLowerCase()]=a; });
    const nombres=[...org.alumnos]; [...(res.lista||[]).map(x=>x.u),...(res.alumnos||[]).map(a=>a.u)].forEach(u=>{ if(!nombres.some(n=>n.toLowerCase()===String(u).toLowerCase())) nombres.push(u); });
    return nombres.map(n=>({n, bloq:(res.lista||[]).some(x=>x.u.toLowerCase()===n.toLowerCase()&&x.estado==="bloqueado"), a:por[n.toLowerCase()]||{ing:0,i7:0,i30:0,ult:0,tar:0,t7:0,ultT:0}})).sort((x,y)=>(y.a.ult-x.a.ult)||x.n.localeCompare(y.n)); })();
  // Trae a la lista del Organizador los alumnos de la hoja "Alumnos" (sin claves)
  const traerAlumnos=()=>{ const us=(res.lista||[]).map(x=>x.u); if(!us.length) return setInfo("La hoja Alumnos está vacía.");
    const canon=(n)=>us.find(x=>x.toLowerCase()===n.toLowerCase())||n;
    const alumnos=[...new Set([...org.alumnos.map(canon),...us])];
    const asign={}; Object.entries(org.asign).forEach(([k,l])=>{ const c=canon(k); asign[c]=[...new Set([...(asign[c]||[]),...l])]; });
    guardar({...org,alumnos,asign,usuarios:us}); setInfo(`Lista actualizada: ${us.length} alumno(s) de la planilla.`); };
  const th={textAlign:"left",fontSize:10,letterSpacing:"0.1em",color:"#7c7c82",fontWeight:600,padding:"6px 8px",textTransform:"uppercase",whiteSpace:"nowrap"}, td={padding:"7px 8px",fontSize:12.5,borderTop:"1px solid #1c1c1f",whiteSpace:"nowrap"};
  return(
    <div style={card}>
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <b style={{fontSize:14}}>📊 Ingresos de los alumnos</b>
        <button style={peq} onClick={()=>setAbierto(a=>!a)}>{abierto?"Ocultar":"Mostrar"}</button>
        {!urlOk && <span style={{fontSize:11,color:"#c9a25a"}}>Sin configurar</span>}
      </div>
      {abierto && (
        <div style={{marginTop:10}}>
          <p style={{fontSize:11.5,color:"#8a8a8a",lineHeight:1.5,margin:"0 0 10px"}}>Cuenta cuántas veces entra cada alumno y cuántas veces abre una tarea con "Practicar". No registra qué ejercicio hace ni cuánto tiempo está. Esta dirección y clave son las de tu planilla de Google (hojas Alumnos e Ingresos).</p>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:10}}>
            <label style={{fontSize:11,color:"#8a8a8a"}}>Dirección del registro (termina en /exec)
              <input style={{...inpS,width:"100%",marginTop:4}} value={org.registroUrl||""} placeholder="https://script.google.com/macros/s/…/exec" onChange={e=>guardar({...org,registroUrl:e.target.value.trim()})}/></label>
            {url && !urlOk && <span style={{fontSize:11,color:"#d98f88"}}>Esa dirección no parece la de una publicación de Apps Script (https://script.google.com/macros/s/…/exec).</span>}
            <label style={{fontSize:11,color:"#8a8a8a"}}>Clave de lectura (la que pusiste en la planilla; solo se guarda en este navegador)
              <input type="password" style={{...inpS,width:"100%",marginTop:4}} value={clave} autoComplete="off" onChange={e=>setClave(e.target.value)}/></label>
            <div><button style={uiPill(true,{padding:"6px 14px",opacity:(urlOk&&clave)?1:.45})} disabled={!urlOk||!clave||cargando} onClick={actualizar}>{cargando?"Leyendo…":"↻ Actualizar"}</button></div>
          </div>
          {err && <p style={{fontSize:12,color:"#d98f88",margin:"0 0 8px"}}>{err}</p>}
          {res && <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:8}}>
            <button style={peq} onClick={traerAlumnos}>⇩ Traer alumnos de la planilla al Organizador</button>
            {info && <span style={{fontSize:11,color:"#8a8a8a"}}>{info}</span>}
          </div>}
          {res && (
            <div style={{overflowX:"auto"}}>
              <table style={{borderCollapse:"collapse",width:"100%"}}>
                <thead><tr><th style={th}>Alumno</th><th style={th}>7 días</th><th style={th}>30 días</th><th style={th}>Total</th><th style={th}>Último ingreso</th><th style={th}>Tareas abiertas</th></tr></thead>
                <tbody>{filas.map(f=>(
                  <tr key={f.n}>
                    <td style={{...td,fontWeight:700}}>{f.n}{f.bloq && <span style={{marginLeft:6,fontSize:10,fontWeight:600,color:"#d98f88"}}>bloqueado</span>}</td>
                    <td style={td}>{f.a.i7}</td><td style={td}>{f.a.i30}</td><td style={td}>{f.a.ing}</td>
                    <td style={{...td,color:f.a.ult?"#ececec":"#d98f88"}} title={f.a.ult?new Date(f.a.ult).toLocaleString():""}>{haceCuanto(f.a.ult,res.ahora||Date.now())}</td>
                    <td style={td} title={f.a.ultT?("última: "+new Date(f.a.ultT).toLocaleString()):""}>{f.a.tar}{f.a.t7?` (${f.a.t7} esta semana)`:""}</td>
                  </tr>))}</tbody>
              </table>
              {filas.length===0 && <p style={{fontSize:12,color:"#8a8a8a"}}>Todavía no hay ingresos registrados.</p>}
              <p style={{fontSize:10.5,color:"#6a6a6a",margin:"8px 0 0",lineHeight:1.5}}>Un ingreso es una apertura de la app (se cuenta una vez por sesión del navegador). Es una referencia de uso, no una medida exacta de estudio.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
