// El panel del modo Acordes · Ver y escuchar: el arpegio con inversiones (fase 6, movido tal cual).

import { nombreLat } from "../../../shared/teoria/notas.js";
import { uiTool } from "../../../shared/ui/tema.js";
import { LeyendaCamino } from "../../../shared/ui/ayudas.jsx";

export function PanelArpegio({ acoVistas, acorde, arpAcorde, arpRecorrido, arpSonido, camControles, camLey, camOctL, camOctR, camTiras, lateral, setCamLey }) {
  return (
    <div className="rounded-xl mb-3" style={{background:"#121212",border:"1px solid #2a2a2a",padding:"8px 12px"}}>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            {acoVistas}
            <button style={uiTool(camLey,{marginLeft:"auto"})} onClick={()=>setCamLey(v=>!v)} title="Explicación y significado de cada señal">❓ Ayuda</button>
          </div>
          {camLey && (<div style={{marginTop:8}}>
            <p className="text-xs text-gray-500" style={{margin:"0 0 8px"}}>Armá el acorde y mirá su arpegio sobre los dos teclados: siempre arranca desde la raíz y lo podés invertir. Los suspendidos están en "Tipo" y las tensiones en Novena, Oncena y Trecena. La raíz parte en {nombreLat(acorde.ac.root)}{camOctL} (izquierda) y {nombreLat(acorde.ac.root)}{camOctR} (derecha); las inversiones usan las notas del acorde, no las tensiones.</p>
            <LeyendaCamino arpegio/></div>)}
          {lateral ? null : (<div style={{display:"flex",flexWrap:"wrap",gap:"8px 20px",alignItems:"flex-end",marginTop:8}}>{arpAcorde}{arpRecorrido}{arpSonido}{camControles}</div>)}
          {lateral ? null : camTiras}
        </div>
  );
}
