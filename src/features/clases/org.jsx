// El Organizador: guardado, registro de ejercicios y rótulos.

import { calcAcorde } from "../../shared/bandoneon/acorde.js";
import { CHROMATIC, buildScale, nombreLat, noteIdx } from "../../shared/teoria/notas.js";
import { UI_FONT } from "../../shared/ui/tema.js";
import { ESC_ENT, rutaEscala } from "../../shared/bandoneon/camino.js";
import { ACORDE_INI } from "../../shared/bandoneon/acordes-base.js";
import { CROM_SIMPLE, GRADO_LABEL } from "../../shared/teoria/etiquetas.js";
import { CLAVES } from "../../shared/claves.js";

// ═══════════════════════════════════════════════════════════════════════════
// ─── ORGANIZADOR DE CLASES (solo profesor) y MIS TAREAS (alumnos) ────────────
// Cada ejercicio de escala viaja COMPLETO: camino, octavas, frecuencias y digitación.
// Los datos se publican en "clases.json" junto a index.html.
// ═══════════════════════════════════════════════════════════════════════════
export const ORG_KEY = CLAVES.org;

export const idn = ()=>Math.random().toString(36).slice(2,8);

export const cargarOrg = ()=>{ try{ const j=JSON.parse(localStorage.getItem(ORG_KEY)||"null"); if(j&&Array.isArray(j.clases)) return {alumnos:j.alumnos||[],clases:j.clases,asign:j.asign||{},usuarios:j.usuarios||[],registroUrl:j.registroUrl||""}; }catch(e){} return {alumnos:[],clases:[],asign:{},usuarios:[],registroUrl:""}; };

// ─── REGISTRO DE INGRESOS (planilla de Google) ───────────────────────────────
// El alumno avisa solo dos cosas: "ingreso" (abrió la app, una vez por sesión) y "tarea" (tocó Practicar).
// No se envía qué ejercicio ni cuánto tiempo. El aviso va firmado con la sesión verificada (window.__TOKEN),
// así que el script de la planilla sabe quién es sin fiarse de lo que diga el navegador.
export const REG_URL_RE = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/;

const REG_SES = CLAVES.regSesion;

export function registrar(tipo){
  try{
    const url=window.__ACCESO_URL, tok=window.__TOKEN;
    if(!window.__ALUMNO || !tok || !url || !REG_URL_RE.test(url)) return;
    fetch(url,{method:"POST",mode:"no-cors",keepalive:true,body:JSON.stringify({a:"reg",t:tipo,tok:tok})}).catch(()=>{});
  }catch(e){}
}

export const REG_CLAVE_KEY = CLAVES.regClave;   // la clave de lectura queda solo en el navegador del profesor (nunca va en clases.json)

const diaLocal = (ms)=>{ const d=new Date(ms); return new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime(); };

export function haceCuanto(ms, ahora){
  if(!ms) return "nunca";
  const dias = Math.round((diaLocal(ahora)-diaLocal(ms))/86400000);
  if(dias<=0) return "hoy"; if(dias===1) return "ayer"; if(dias<31) return `hace ${dias} días`;
  const m=Math.floor(dias/30); return m===1 ? "hace 1 mes" : `hace ${m} meses`;
}

export const EJ_NUEVO = {tipo:"escala",root:"C",escala:"mayor",mano:"der",dir:"sube",fuelle:"abre",modoEj:"ver",inicio:-1,dedos:[],ac:ACORDE_INI,texto:"",indic:""};

export const inpS = {background:"#0e0e10",border:"1px solid #2a2a2e",borderRadius:9,padding:"7px 10px",color:"#ececec",fontSize:13,fontFamily:UI_FONT,minWidth:0};

export const Sel = ({v,set,opts,w})=>(<select style={{...inpS,width:w}} value={v} onChange={e=>set(e.target.value)}>{opts.map(o=>(<option key={String(o[0])} value={o[0]}>{o[1]}</option>))}</select>);

export const OPT_MANO=[["der","Mano derecha"],["izq","Mano izquierda"]], OPT_DIR=[["sube","Sube"],["baja","Baja"]], OPT_FUELLE=[["abre","Abriendo"],["cierra","Cerrando"]], OPT_MODO=[["ver","Ver la escala"],["practica","Practicar"]];

export const DEDO_OPC=[["","—"],["1","1"],["2","2"],["3","3"],["4","4"],["1/2","1 o 2"],["2/3","2 o 3"],["3/4","3 o 4"]];

const NOM_DEDO_1={1:"índice",2:"medio",3:"anular",4:"meñique"};

export const nomDedo = (d)=>String(d).split("/").map(x=>NOM_DEDO_1[x]||x).join(" o ");

export const fmtHz = (h)=>h.toFixed(2).replace(".",",");

// Camino completo de una escala sobre el teclado del profesor: función, nota con octava, frecuencia y tecla.
export function rutaDeEjercicio(e, btns){
  const esc=ESC_ENT.find(x=>x.id===e.escala)||ESC_ENT[0];
  const ivs=(e.escala==="menorM"&&e.dir==="baja")?ESC_ENT[1].ivs:esc.ivs;
  const root=e.root||"C", rootPc=noteIdx(root), dir=e.dir==="baja"?"baja":"sube";
  const manoBtns=e.mano==="izq"?btns.left:btns.right;
  const r=rutaEscala(manoBtns,e.fuelle==="cierra"?"cierra":"abre",rootPc,ivs,dir,e.inicio===undefined?-1:e.inicio);
  const nom={}; buildScale(root,ivs).forEach(n=>{ nom[noteIdx(n)]=nombreLat(n); });
  const nombreDe=(it)=>(nom[it.pc]||CROM_SIMPLE[CHROMATIC[it.pc]])+it.oct;
  const n=ivs.length;
  const pasos=r.route.map((st,i)=>{
    const esOct=r.route.length===n+1&&(dir!=="baja"?i===n:i===0);
    const it=st.item;
    return {g:esOct?"8":GRADO_LABEL[ivs[st.deg]],pc:it.pc,n:nombreDe(it),hz:Math.round(440*Math.pow(2,(it.midi-69)/12)*100)/100,b:it.b.id};
  });
  return {pasos,inicios:r.tonics.map(nombreDe),faltan:r.missing.map(pc=>nom[pc]||CROM_SIMPLE[CHROMATIC[pc]]),usado:r.startUsed};
}

export function descEj(e){
  if(e.tipo==="escala"){
    const esc=ESC_ENT.find(x=>x.id===e.escala)||ESC_ENT[0];
    const nom = esc.id==="crom" ? `Escala cromática desde ${nombreLat(e.root||"C")}` : `Escala de ${nombreLat(e.root||"C")} ${esc.nombre.toLowerCase()}`;
    const desde = e.ruta&&e.ruta[0] ? ` · desde ${e.ruta[0].n}` : "";
    return `${nom}${desde} · ${e.mano==="izq"?"mano izquierda":"mano derecha"} · ${e.dir==="baja"?"baja":"sube"} · ${e.fuelle==="cierra"?"cerrando":"abriendo"}${e.modoEj==="practica"?" · practicar":""}`;
  }
  if(e.tipo==="acorde") return `Acorde ${calcAcorde({...ACORDE_INI,...(e.ac||{})},false).name} · ${e.fuelle==="cierra"?"cerrando":"abriendo"}`;
  return e.texto||"Tarea";
}
