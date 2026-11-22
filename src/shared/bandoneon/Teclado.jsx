// El dibujo del teclado: botón, mapa de alturas y lienzo.

import { useCallback, useRef } from "react";
import { BTN_SIZE, snapV } from "./layouts.js";
import { LAT } from "../teoria/notas.js";
import { nc } from "../teoria/color.js";
import { UI_FONT } from "../ui/tema.js";
import { playBand } from "../audio/audio.js";

function BandBtn({ btn, bellows, pressed, isHeard, onDown, onUp, draggable=false, onMove, oct=null, chordActive=false, chordLabel=null, softLabel=null, markLabel=null, tocaLienzo=false }) {
  const note  = bellows === "abre" ? btn.abre  : btn.cierra;
  const color = draggable ? (bellows === "abre" ? btn.color_abre : btn.color_cierra) : nc(LAT[note]||note);   // paleta real de las notas
  const isOn  = pressed.includes(btn.id);
  const isAct = isOn || isHeard;

  const handleMouseDown = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    if (draggable && onMove) {
      const ox = e.clientX - btn.x, oy = e.clientY - btn.y;
      const move = e2 => onMove(btn.id, snapV(Math.max(0,e2.clientX-ox)), snapV(Math.max(0,e2.clientY-oy)));
      const up   = () => { window.removeEventListener("mousemove",move); window.removeEventListener("mouseup",up); };
      window.addEventListener("mousemove",move); window.addEventListener("mouseup",up);
    } else { onDown && onDown(btn); }
  }, [btn, draggable, onMove, onDown]);

  const handleTouchStart = useCallback((e) => {
    e.stopPropagation();
    if (draggable && onMove) {
      const t=e.touches[0], ox=t.clientX-btn.x, oy=t.clientY-btn.y;
      const move=e2=>{e2.preventDefault();const t2=e2.touches[0];onMove(btn.id,snapV(Math.max(0,t2.clientX-ox)),snapV(Math.max(0,t2.clientY-oy)));};
      const up=()=>{window.removeEventListener("touchmove",move);window.removeEventListener("touchend",up);};
      window.addEventListener("touchmove",move,{passive:false}); window.addEventListener("touchend",up);
    } else { onDown && onDown(btn); }
  }, [btn, draggable, onMove, onDown]);

  // Para tocar, el que atiende es el lienzo (el botón más cercano al dedo): el botón sólo se dibuja
  const manos = tocaLienzo ? {} : {
      onMouseDown: handleMouseDown,
      onMouseUp: ()=>!draggable&&onUp&&onUp(btn.id),
      onMouseLeave: ()=>!draggable&&onUp&&onUp(btn.id),
      onTouchStart: handleTouchStart,
      onTouchEnd: e=>{e.preventDefault();!draggable&&onUp&&onUp(btn.id);},
      onTouchCancel: ()=>!draggable&&onUp&&onUp(btn.id),
  };
  return (
    <div
      {...manos}
      onContextMenu={e=>e.preventDefault()}                // sin el menú del toque largo
      data-btn={btn.id}
      style={{
        position:"absolute", left:btn.x, top:btn.y,
        width:BTN_SIZE, height:BTN_SIZE, borderRadius:"50%",
        cursor:draggable?"grab":"pointer", touchAction:"none", pointerEvents: tocaLienzo ? "none" : "auto", userSelect:"none", WebkitUserSelect:"none", WebkitTouchCallout:"none", WebkitTapHighlightColor:"transparent",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        background: isAct
          ? `radial-gradient(circle at 36% 30%,${color}ff,${color}cc 55%,${color}88)`
          : `radial-gradient(circle at 36% 30%,${color}99,${color}44 60%,${color}22)`,
        border:`2.5px solid ${isAct?(isHeard?"#ffffff":color):color+"aa"}`,
        boxShadow: isAct
          ? isHeard ? `0 0 22px #fff,0 0 44px ${color}` : `0 0 18px ${color}cc`
          : "0 2px 8px rgba(0,0,0,.7)",
        transform: isHeard?"scale(1.1)":isOn?"scale(0.95)":"scale(1)",
        transition:"transform .08s,box-shadow .12s, opacity .2s",
        zIndex: isAct?20:(chordLabel?15:(softLabel?12:1)),
        opacity: chordActive && !chordLabel && !softLabel && !isAct ? 0.25 : 1,
        ...(softLabel ? {opacity:.85,background:`radial-gradient(circle at 36% 30%,${color}cc,${color}77 60%,${color}44)`,border:"2.5px solid #ffffff66",boxShadow:"none"} : {}),
        ...(chordLabel ? {background:`radial-gradient(circle at 36% 30%,${color}ff,${color}ee 55%,${color}bb)`,border:"3px solid #ffffff", boxShadow:`0 0 0 3px #ffffff55, 0 0 18px ${color}`} : {}),
        ...(markLabel ? {zIndex:18,opacity:1,background:`radial-gradient(circle at 36% 30%,${color}ff,${color}ee 55%,${color}bb)`,border:"3px solid #ffffff", boxShadow:`0 0 0 2px #0b0b0c, 0 0 0 5px #ffffff, 0 0 16px ${color}`} : {}),
      }}
    >
      {markLabel && (
        <span style={{position:"absolute",bottom:-7,right:-7,minWidth:18,height:18,padding:"0 4px",borderRadius:9,background:"#0b0b0c",color:"#fff",border:"1.5px solid #fff",
          fontSize:10,fontWeight:800,fontFamily:"monospace",display:"flex",alignItems:"center",justifyContent:"center",zIndex:4}}>{markLabel}</span>
      )}
      {softLabel && (
        <span style={{position:"absolute",top:-5,right:-5,minWidth:15,height:15,padding:"0 3px",borderRadius:8,background:"#ffffffaa",color:"#101010",
          fontSize:8,fontWeight:800,fontFamily:"monospace",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3}}>{softLabel}</span>
      )}
      {chordLabel && (
        <span style={{position:"absolute",top:-6,right:-6,minWidth:17,height:17,padding:"0 3px",borderRadius:9,background:"#fff",color:"#101010",
          fontSize:9,fontWeight:800,fontFamily:"monospace",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3,boxShadow:"0 1px 4px rgba(0,0,0,.6)"}}>{chordLabel}</span>
      )}
      <div style={{position:"absolute",top:5,left:9,width:11,height:7,borderRadius:"50%",background:"rgba(255,255,255,.22)",filter:"blur(1px)",pointerEvents:"none"}}/>
      {oct !== null ? (
        <span title={`${note} · octava ${oct}`} style={{display:"flex",alignItems:"baseline",gap:1,zIndex:1,lineHeight:1,textShadow:"0 1px 3px rgba(0,0,0,.9)"}}>
          <span style={{fontSize:note.length>2?9:11,fontWeight:800,color:"#fff",fontFamily:"'Courier New',monospace"}}>{note}</span>
          <span style={{fontSize:note.length>2?10:12,fontWeight:900,color:"#fff",fontFamily:"'Courier New',monospace",opacity:.95}}>{oct}</span>
        </span>
      ) : (
        <>
          <span style={{fontSize:note.length>2?7:9,fontWeight:800,color:"#fff",fontFamily:"'Courier New',monospace",lineHeight:1,zIndex:1,textShadow:"0 1px 3px rgba(0,0,0,.9)"}}>{note}</span>
          <span style={{fontSize:6.5,color:"rgba(255,255,255,.9)",fontFamily:"monospace",lineHeight:1,zIndex:1,fontWeight:700}}>
            {draggable ? btn.id.replace(/[LRlr]/,"") : ""}
          </span>
        </>
      )}
    </div>
  );
}

// ─── CANVAS RESPONSIVE ───────────────────────────────────────────────────────
// ─── MAPA DE ALTURAS: todas las teclas de una mano ordenadas de grave a agudo ──
// Sirve para estudiar y para verificar que las octavas sean correlativas.
export function MapaAlturas({ btns, bellows, titulo }){
  const PCL={"DO":0,"DO#":1,"RE":2,"RE#":3,"MI":4,"FA":5,"FA#":6,"SOL":7,"SOL#":8,"LA":9,"LA#":10,"SI":11};
  const items = btns.map(b=>{
    const lat = bellows==="abre" ? b.abre : b.cierra;
    const oct = bellows==="abre" ? (b.oct_abre ?? 3) : (b.oct_cierra ?? 3);
    return { id:b.id, lat, oct, midi:12*(oct+1)+PCL[lat] };
  }).sort((x,y)=>x.midi-y.midi || x.id.localeCompare(y.id));
  const cuenta={}; items.forEach(i=>{cuenta[i.midi]=(cuenta[i.midi]||0)+1;});
  const nombre=(lat)=>lat.charAt(0)+lat.slice(1).toLowerCase();
  return(
    <div style={{marginBottom:14}}>
      <p style={{fontFamily:UI_FONT,fontSize:10,letterSpacing:"0.16em",color:"#7c7c82",textTransform:"uppercase",fontWeight:600,marginBottom:8}}>
        {titulo} · {bellows==="abre"?"abriendo":"cerrando"} · de grave a agudo
      </p>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        {items.map((it,k)=>{
          const col=nc(LAT[it.lat]||it.lat), dup=cuenta[it.midi]>1;
          return(
            <button key={it.id+k} onClick={()=>playBand(it.lat,it.oct)} title={`Tecla ${it.id}`}
              style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1,padding:"5px 7px",minWidth:46,borderRadius:9,cursor:"pointer",
                background:col+"26",border:`1.5px ${dup?"dashed":"solid"} ${dup?"#ffffff":col+"aa"}`,color:"#f2f2f2"}}>
              <span style={{fontFamily:"serif",fontWeight:800,fontSize:13}}>{nombre(it.lat)}<span style={{fontSize:13}}>{it.oct}</span></span>
              <span style={{fontFamily:"monospace",fontSize:8.5,opacity:.65}}>{it.id}{dup?" · repetida":""}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function BandCanvas({ buttons, bellows, pressed, heardIds=[], onDown, onUp,
  draggable=false, onMove, showGrid=false, onSelect=null, selected=null, octMap=null, maxWidth=null, maxScale=1, chordMap=null, chordIds=null, chordSoft=false, markIds=null }) {

  const W = Math.max(...buttons.map(b=>b.x)) + BTN_SIZE + 16;
  const H = Math.max(...buttons.map(b=>b.y)) + BTN_SIZE + 20;

  // Escalado con transform (estándar, soporta todos los navegadores —
  // a diferencia de la propiedad CSS "zoom", que en algunos Android/Firefox
  // no funciona y hace que el teclado se corte o desaparezca).
  // Si viene maxWidth, escalamos para que el teclado entre exactamente en ese ancho.
  // Sin maxWidth, se muestra a tamaño real (usado por el editor drag&drop,
  // donde la escala 1:1 es necesaria para que el arrastre calcule bien la posición).
  const target = maxWidth || W;
  const scale  = Math.min(maxScale, target / W);
  const scaledW = Math.ceil(W * scale);
  const scaledH = Math.ceil(H * scale);

  // ─── EL TOQUE: va al botón MÁS CERCANO al dedo (22-nov-2026, Mauro: «el espacio que percibe la tocada es muy pequeño») ───
  // En el teléfono el teclado se achica y cada botón quedaba de unos 20 px: había que acertarle al círculo justo.
  // Ahora responde todo el círculo y el espacio de alrededor hasta la mitad del camino al vecino (los centros están a 60–86
  // unidades y el botón mide 44); más allá de ALCANCE del centro no toca nada (los bordes del lienzo).
  // Cada dedo recuerda su botón (varios a la vez) y se suelta al levantarlo o si el teléfono corta el toque.
  // El editor (draggable) sigue con el toque en cada botón, porque ahí se arrastran.
  const tocaLienzo = !draggable;
  const lienzoRef = useRef(null);
  const dedos = useRef(new Map());          // identificador del dedo → id del botón
  const raton = useRef(null);               // el botón que tiene apretado el mouse
  const ALCANCE = BTN_SIZE * 0.98;          // desde el centro: el botón más medio botón alrededor
  const masCercano = (cx, cy) => {
    const el = lienzoRef.current; if (!el) return null;
    const r = el.getBoundingClientRect(), k = r.width / W;
    const x = (cx - r.left) / k, y = (cy - r.top) / k;
    let mejor = null, dm = ALCANCE;
    for (const b of buttons) {
      const d = Math.hypot(x - (b.x + BTN_SIZE / 2), y - (b.y + BTN_SIZE / 2));
      if (d <= dm) { dm = d; mejor = b; }
    }
    return mejor;
  };
  const apretar = (b) => { onSelect && onSelect(b.id); onDown && onDown(b); };
  const soltar  = (id) => { onUp && onUp(id); };
  const alTocar = (e) => {
    for (const t of e.changedTouches) {
      const b = masCercano(t.clientX, t.clientY);
      if (b) { dedos.current.set(t.identifier, b.id); apretar(b); }
    }
  };
  const alLevantar = (e) => {
    if (e.cancelable) e.preventDefault();   // sin el clic de mentira que el navegador manda después del toque
    for (const t of e.changedTouches) {
      const id = dedos.current.get(t.identifier);
      if (id !== undefined) { dedos.current.delete(t.identifier); soltar(id); }
    }
  };
  const alSoltarRaton = () => { if (raton.current !== null) { const id = raton.current; raton.current = null; soltar(id); } };
  const alApretarRaton = (e) => {
    if (e.button !== 0) return;
    const b = masCercano(e.clientX, e.clientY); if (!b) return;
    e.preventDefault(); raton.current = b.id; apretar(b);
    window.addEventListener("mouseup", alSoltarRaton, { once: true });
  };
  const toques = tocaLienzo ? { onTouchStart: alTocar, onTouchEnd: alLevantar, onTouchCancel: alLevantar,
    onMouseDown: alApretarRaton, onMouseLeave: alSoltarRaton } : {};

  const canvas = (
    <div
      ref={lienzoRef}
      {...toques}
      onClick={()=>onSelect&&onSelect(null)}
      onContextMenu={e=>e.preventDefault()}
      style={{
        position: "relative",
        width: W, height: H, boxSizing: "border-box",
        flexShrink: 0,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        background: showGrid
          ? `repeating-linear-gradient(0deg,transparent,transparent 9px,rgba(255,255,255,.06) 10px),
             repeating-linear-gradient(90deg,transparent,transparent 9px,rgba(255,255,255,.06) 10px),#0c0c0c`
          : draggable ? "linear-gradient(145deg,#1d1d1d,#101010)"
          : "linear-gradient(180deg,#19191b 0%,#131315 70%,rgba(19,19,21,0) 100%)",   // sin recuadro: solo un esfumado abajo
        border: draggable ? "2px solid #e6e6e655" : "none",                          // el editor conserva su borde
        borderRadius: 16,
        boxShadow: draggable ? "0 8px 24px rgba(0,0,0,.7)" : "none",
        touchAction: "none", userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none",
      }}
    >
      {buttons.map(btn=>(
        <BandBtn key={btn.id} btn={btn} bellows={bellows}
          pressed={selected?[selected]:pressed}
          isHeard={heardIds.includes(btn.id)}
          onDown={e=>{onSelect&&onSelect(btn.id); onDown&&onDown(btn);}}
          onUp={onUp} draggable={draggable} onMove={onMove} tocaLienzo={tocaLienzo}
          oct={octMap ? octMap[btn.id] : null}
          markLabel={markIds ? (markIds[btn.id]||null) : null}
          chordActive={!!(chordIds||chordMap)}
          chordLabel={chordIds ? (chordIds[btn.id]||null) : (chordMap ? (chordMap[(()=>{const n=bellows==="abre"?btn.abre:btn.cierra; return LAT[n]||n;})()] || null) : null)}
          softLabel={(chordSoft&&chordIds&&chordMap&&!chordIds[btn.id]) ? (chordMap[(()=>{const n=bellows==="abre"?btn.abre:btn.cierra; return LAT[n]||n;})()] || null) : null}/>
      ))}
    </div>
  );

  // Contenedor con el tamaño YA escalado, para que el layout reserve
  // exactamente ese espacio (el transform no cambia el tamaño en el flujo normal).
  if (maxWidth || scale < 1) {
    return <div style={{width:scaledW, height:scaledH, overflow:"hidden", flexShrink:0}}>{canvas}</div>;
  }
  return <div style={{overflowX:"auto",paddingBottom:4}}>{canvas}</div>;
}
