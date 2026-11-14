// Secciones, selectores y desplegables que usan el Entrenador, Teoría y otras pestañas.

import { ACORDE_BASES, ACORDE_NOV, ACORDE_RAICES, ACORDE_SEPT, ACORDE_TRE, ACORDE_UND } from "../bandoneon/acordes-base.js";
import { CROM_SIMPLE } from "../teoria/etiquetas.js";
import { PopoverAnclado } from "../ui/Popover.jsx";
import { CHROMATIC, nombreLat } from "../teoria/notas.js";
import { nc } from "../teoria/color.js";
import { UI_FONT, uiLabel, uiPill, uiPlay } from "../ui/tema.js";

// Título de sección para ordenar los paneles
export function Seccion({t}){ return <p style={{...uiLabel,color:"#c8c8cc",borderTop:"1px solid #232326",paddingTop:10,margin:"6px 0 10px"}}>{t}</p>; }

// Armado del acorde con desplegables (misma lógica que el armador de botones, más compacto)
export function SelectoresAcorde({a}){
  const op=(lista)=>lista.map(x=>[x.id,x.label]);
  const extras=(a.ac.seis?"seis":"")+(a.ac.sin5?"sin5":"");
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:6}}>
      <Desplegable ancho={92} etiqueta="Fundamental" valor={a.ac.root} opciones={ACORDE_RAICES.map(x=>[x,nombreLat(x)])} onChange={v=>a.set("root",v)}/>
      <Desplegable ancho={116} etiqueta="Tipo" valor={a.ac.base} opciones={op(ACORDE_BASES)} onChange={v=>a.set("base",v)}/>
      <Desplegable ancho={104} etiqueta="Séptima" valor={a.ac.sept} opciones={op(ACORDE_SEPT)} onChange={v=>a.set("sept",v)}/>
      <Desplegable ancho={96} etiqueta="Novena" valor={a.ac.nov} opciones={op(ACORDE_NOV)} onChange={v=>a.set("nov",v)}/>
      <Desplegable ancho={96} etiqueta="Oncena" valor={a.ac.und} opciones={op(ACORDE_UND)} onChange={v=>a.set("und",v)}/>
      <Desplegable ancho={96} etiqueta="Trecena" valor={a.ac.tre} opciones={op(ACORDE_TRE)} onChange={v=>a.set("tre",v)}/>
      <Desplegable ancho={120} etiqueta="Extras" valor={extras||"no"} opciones={[["no","—"],["seis","Con sexta (6)"],["sin5","Sin quinta"],["seissin5","Sexta y sin quinta"]]}
        onChange={v=>{ a.set("seis",v.includes("seis")); a.set("sin5",v.includes("sin5")); }}/>
      <Desplegable ancho={96} etiqueta="Función" valor={a.romano?"rom":"num"} opciones={[["rom","I · III · V"],["num","1 · 3 · 5"]]} onChange={v=>a.setRomano(v==="rom")}/>
    </div>
  );
}

// Lista desplegable con etiqueta (para ordenar los paneles con pocos botones)
export function GrupoMini({t,children}){
  return (<div style={{display:"flex",flexDirection:"column",gap:3,minWidth:0}}>
    <span style={{...uiLabel,fontSize:8.5,letterSpacing:"0.2em",color:"#5f5f66"}}>{t}</span>
    <div style={{display:"flex",flexWrap:"wrap",gap:6,alignItems:"flex-end"}}>{children}</div>
  </div>);
}

export function Desplegable({etiqueta,valor,opciones,onChange,ancho}){
  return (
    <label style={{display:"flex",flexDirection:"column",gap:3,minWidth:0,width:ancho||undefined}}>
      {etiqueta?<span style={{...uiLabel,fontSize:8.5,letterSpacing:"0.16em",color:"#6a6a72"}}>{etiqueta}</span>:null}
      <select value={String(valor)} onChange={e=>onChange(e.target.value)}
        style={{width:"100%",padding:"4px 6px",borderRadius:8,border:"1px solid #2a2a2e",background:"#0e0e10",color:"#ececec",fontSize:12,fontFamily:UI_FONT,colorScheme:"dark",cursor:"pointer"}}>
        {opciones.map(([v,l])=>(<option key={String(v)} value={String(v)}>{l}</option>))}
      </select>
    </label>
  );
}

// Leyenda: qué significa cada señal del dibujo (se amplía cada vez que se suma una señal nueva)
export function LeyendaCamino({arpegio=false}){
  const fila=(icono,titulo,texto)=>(
    <div style={{display:"flex",gap:12,alignItems:"center",padding:"8px 0",borderTop:"1px solid #1c1c1f"}}>
      <div style={{width:92,flexShrink:0,display:"flex",justifyContent:"center",alignItems:"center"}}>{icono}</div>
      <div style={{fontSize:12,lineHeight:1.45,minWidth:0}}><b style={{color:"#ececec"}}>{titulo}</b><br/><span style={{color:"#9a9a9f"}}>{texto}</span></div>
    </div>);
  const circ=(bg,borde,glow,hijo)=>(<span style={{display:"inline-flex",flexDirection:"column",alignItems:"center",justifyContent:"center",width:40,height:40,borderRadius:"50%",background:bg,border:borde,boxShadow:glow||"none",color:"#fff",lineHeight:1.05,textShadow:"0 1px 3px #000"}}>{hijo}</span>);
  const flecha=(dash)=>(<svg width="84" height="18"><defs><marker id={"ley"+(dash?"d":"l")} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#fff"/></marker></defs>
    <line x1="4" y1="9" x2="78" y2="9" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeDasharray={dash?"7 6":undefined} markerEnd={`url(#ley${dash?"d":"l"})`}/></svg>);
  const etq=(t)=>(<span style={{background:"#000d",border:"1px solid #ffffff66",color:"#fff",fontSize:10,fontWeight:800,padding:"1px 7px",borderRadius:8,fontFamily:"monospace"}}>{t}</span>);
  return (
    <div style={{margin:"0 0 12px",padding:"4px 12px",borderRadius:12,background:"#0e0e10",border:"1px solid #2a2a2e"}}>
      {fila(circ(nc("G"),"3px solid rgba(255,255,255,.55)",`0 0 10px ${nc("G")}99`,<><b style={{fontSize:13}}>Sol</b><span style={{fontSize:9,fontWeight:800,fontFamily:"monospace"}}>{arpegio?"V":"5"}</span></>),
        arpegio?"Nota del arpegio":"Nota de la escala",
        arpegio?"Tiene el color de siempre. El nombre arriba y, abajo, su función en el acorde (I raíz, III tercera, V quinta, VII séptima). El orden lo marcan las flechas."
               :"Tiene el color de siempre. El nombre arriba y, abajo, el número de orden en que se toca (1 es la tónica).")}
      {fila(flecha(false),"Flecha con línea llena","Hacia dónde sigue el camino en esa mano cuando el fuelle está ABRIENDO.")}
      {fila(flecha(true),"Flecha con línea punteada","Hacia dónde sigue el camino en esa mano cuando el fuelle está CERRANDO.")}
      {fila(<span style={{display:"inline-flex",gap:6}}>{circ(nc("C"),"3px solid rgba(255,255,255,.55)","",<b style={{fontSize:12}}>Do</b>)}{circ(nc("C"),"3px solid rgba(255,255,255,.55)","",<b style={{fontSize:12}}>Do</b>)}</span>,
        "Las dos manos","Cada teclado tiene su propia octava de partida y muestra su propio camino. Si una mano no tiene alguna nota, queda sin marcar en esa mano y abajo se avisa cuáles faltan.")}
      {fila(circ("#3a3a3a","3px dashed #9a9a9a","",<span style={{fontSize:10,fontWeight:800,color:"#cfcfcf"}}>5?</span>),
        "Círculo gris con borde punteado","Esa misma nota está también en otro botón de esta misma mano. Tocalo para usar este botón en lugar del de color.")}
      {fila(<span style={{fontSize:11,fontWeight:800,fontFamily:"monospace",color:"#fff",border:"2px solid rgba(255,255,255,.35)",background:nc("D"),borderRadius:9,padding:"3px 8px",textShadow:"0 1px 3px #000"}}>2 Re3</span>,
        "Tira de notas","Una fila por mano, con las notas de su tramo y su octava. Tocar una nota la hace sonar.")}
      {fila(circ("#141414","3px solid #333","",null),"Círculo oscuro vacío","Botón que no forma parte de este camino. Tocalo y suena su nota.")}
      {fila(circ(nc("E"),"3px solid #fff","0 0 0 3px #fff, 0 0 14px #fff",<b style={{fontSize:13}}>Mi</b>),"Aro blanco brillante","La nota que está sonando en este momento, mientras escuchás el recorrido.")}
      {fila(<span style={{fontSize:12,color:"#6a6a6e",textDecoration:"line-through",border:"1px dashed #444",borderRadius:8,padding:"3px 8px"}}>✕ Si3</span>,"Nota tachada en la tira",
        "Esa nota no existe en ninguna mano en este sentido del fuelle. No se inventa ningún botón.")}
      {fila(<span style={{fontSize:11,fontWeight:700,border:"1px solid #2a2a2a",borderRadius:9,padding:"5px 9px",color:"#ececec"}}>▶ Escuchar</span>,"Escuchar","Suena lo que está a la vista: con IZQ o DER, solo esa mano; con Ambas, las dos juntas. Con la figura (redonda a semicorchea) y la velocidad que elijas.")}
    </div>
  );
}

// Ventana chica junto al círculo para decir qué nota es (y su octava, si el ejercicio la pide)
export function NotaPicker({ rect, actual, pedirOct, onSet, onErase, onClose, onListen }){
  return (
    <PopoverAnclado rect={rect} onClose={onClose} width={268} estimado={pedirOct?236:176}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:"7px 4px",marginBottom:pedirOct?8:10}}>
        {CHROMATIC.map(n=>{
          const sel = actual && actual.pc===n, t = CROM_SIMPLE[n];
          return (
            <button key={n} onClick={()=>onSet({pc:n})} style={{background:"none",border:"none",padding:0,cursor:"pointer",display:"flex",justifyContent:"center"}}>
              <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:34,height:34,borderRadius:"50%",background:nc(n),color:"#fff",
                fontWeight:800,fontFamily:UI_FONT,fontSize:t.length>3?9.5:t.length>2?11:13,textShadow:"0 1px 2px rgba(0,0,0,.9)",
                border:sel?"3px solid #fff":"2px solid rgba(255,255,255,.25)"}}>{t}</span>
            </button>
          );
        })}
      </div>
      {pedirOct && (
        <div style={{display:"flex",gap:4,marginBottom:10,alignItems:"center"}}>
          <span style={{...uiLabel,marginRight:4}}>Octava</span>
          {[1,2,3,4,5,6].map(o=>(<button key={o} style={uiPill(actual&&actual.oct===o,{flex:1,padding:"5px 0"})} onClick={()=>onSet({oct:o})}>{o}</button>))}
        </div>
      )}
      <div style={{display:"flex",gap:6}}>
        {onListen && <button style={uiPlay(false,{flex:1,padding:"5px"})} onClick={onListen}>▶ Escuchar</button>}
        <button onClick={onErase} style={{flex:1,padding:"5px",borderRadius:8,border:"1px solid #5c2d2d",background:"#1f0a0a",color:"#d98f88",fontWeight:700,fontSize:11,cursor:"pointer"}}>🗑 Borrar</button>
        <button onClick={onClose} style={{flex:1,padding:"5px",borderRadius:8,border:"1px solid #2a2a2a",background:"transparent",color:"#8a8a8a",fontSize:11,cursor:"pointer"}}>Cerrar</button>
      </div>
    </PopoverAnclado>
  );
}
