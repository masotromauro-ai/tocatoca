// El panel del modo Escalas · Ver y escuchar: el camino sobre los teclados (fase 6, movido tal cual).

import { nombreLat } from "../../../shared/teoria/notas.js";
import { uiTool } from "../../../shared/ui/tema.js";
import { LeyendaCamino } from "../../../shared/ui/ayudas.jsx";

export function PanelCamino({ camControles, camLey, camLong, camOctL, camOctR, camRecorrido, camSonido, camTiras, escPills, escRoot, escSelects, lateral, setCamLey }) {
  return (
    <div className="rounded-xl mb-3" style={{background:"#121212",border:"1px solid #2a2a2a",padding:"8px 12px"}}>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            {escPills}
            <button style={uiTool(camLey,{marginLeft:"auto"})} onClick={()=>setCamLey(v=>!v)} title="Explicación y significado de cada señal">❓ Ayuda</button>
          </div>
          {camLey && (<div style={{marginTop:8}}>
            <p className="text-xs text-gray-500" style={{margin:"0 0 8px"}}>Elegí una escala y un tramo: se dibuja el camino nota por nota en los dos teclados. Con Abre / Cierra cambiás el sentido del fuelle. Cada mano tiene su propia octava de partida. Izquierda: {nombreLat(escRoot)}{camOctL} → {nombreLat(escRoot)}{camOctL+camLong} · Derecha: {nombreLat(escRoot)}{camOctR} → {nombreLat(escRoot)}{camOctR+camLong}.</p>
            <LeyendaCamino/></div>)}
          {lateral ? null : (<div style={{display:"flex",flexWrap:"wrap",gap:"8px 20px",alignItems:"flex-end",marginTop:8}}>{escSelects}{camRecorrido}{camSonido}{camControles}</div>)}
          {lateral ? null : camTiras}
        </div>
  );
}
