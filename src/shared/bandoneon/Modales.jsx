// Guardar y cargar teclados.

import { useState, useRef } from "react";
import { DEFS_L, DEFS_R } from "./layouts.js";
import { parseCSV } from "./csv.js";

// ─── MODAL GUARDADO ───────────────────────────────────────────────────────────
export function SavedModal({ cssText, onClose }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}}>
      <div style={{background:"#121212",border:"1.5px solid #e6e6e6",borderRadius:16,padding:"24px 24px 20px",maxWidth:440,width:"100%"}}>
        <div style={{fontSize:28,marginBottom:8}}>✅</div>
        <h3 style={{color:"#e6e6e6",fontWeight:700,fontSize:17,marginBottom:8}}>Configuración guardada</h3>
        <p style={{color:"#8a8a8a",fontSize:13,lineHeight:1.6,marginBottom:14}}>
          Tu configuración se guardó en este dispositivo y se cargará automáticamente la próxima vez.
        </p>
        <div style={{background:"#232323",border:"1px solid #e6e6e644",borderRadius:10,padding:"10px 14px",marginBottom:14}}>
          <p style={{color:"#e6e6e6",fontWeight:700,fontSize:12,marginBottom:5}}>📱 ¿Otro dispositivo?</p>
          <p style={{color:"#8a8a8a",fontSize:12,lineHeight:1.6}}>
            Se descargó un <b style={{color:"#e6e6e6"}}>.csv</b> con tu configuración. En el otro dispositivo usá <b style={{color:"#e6e6e6"}}>↑ Importar CSV</b>.
          </p>
        </div>
        <div style={{background:"#121212",border:"1px solid #2a2a2a",borderRadius:10,padding:"8px 14px",marginBottom:16}}>
          <p style={{color:"#8a8a8a",fontSize:11,lineHeight:1.6}}>
            💡 Para que sea permanente en el código, usá <b style={{color:"#e6e6e6"}}>↓ Ver JS</b> en el editor y pegá el resultado en tu <code style={{color:"#e6e6e6"}}>App.jsx</code> reemplazando <code>DEFS_L</code> y <code>DEFS_R</code>.
          </p>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>navigator.clipboard.writeText(cssText).then(()=>setCopied(true))} style={{
            flex:1,padding:"7px",borderRadius:9,border:"1px solid #2a2a2a",background:"#121212",
            color:copied?"#e6e6e6":"#e6e6e6",fontFamily:"monospace",fontWeight:700,fontSize:11,cursor:"pointer"
          }}>{copied?"✓ CSS copiado":"{} CSS"}</button>
          <button onClick={onClose} style={{
            flex:2,padding:"7px",borderRadius:9,border:"none",
            background:"#e6e6e6",
            color:"#0a0a0a",fontWeight:700,fontSize:13,cursor:"pointer"
          }}>Entendido ✓</button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL IMPORTAR CSV ───────────────────────────────────────────────────────
export function ImportModal({ onImport, onClose }) {
  const fileRef = useRef(null);
  const [error,   setError]   = useState("");
  const [preview, setPreview] = useState(null);
  const [parsed,  setParsed]  = useState(null);

  const handleFile = e => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const result = parseCSV(ev.target.result);
      if (!result||(!result.left.length&&!result.right.length)) { setError("CSV inválido o sin datos."); return; }
      setError(""); setParsed(result); setPreview({left:result.left.length,right:result.right.length});
    };
    reader.readAsText(file); e.target.value="";
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}}>
      <div style={{background:"#121212",border:"1.5px solid #e6e6e644",borderRadius:16,padding:"22px 22px 18px",maxWidth:400,width:"100%"}}>
        <h3 style={{color:"#e6e6e6",fontWeight:700,fontSize:16,marginBottom:8}}>📂 Importar configuración</h3>
        <p style={{color:"#8a8a8a",fontSize:12,lineHeight:1.6,marginBottom:14}}>
          Seleccioná el <b>.csv</b> descargado en una sesión anterior. Reemplazará la configuración actual.
        </p>
        <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} style={{display:"none"}}/>
        <button onClick={()=>fileRef.current?.click()} style={{width:"100%",padding:9,borderRadius:9,border:"1px solid #e6e6e644",background:"#e6e6e6",color:"#e6e6e6",fontWeight:700,fontSize:13,cursor:"pointer",marginBottom:10}}>
          Elegir archivo .csv
        </button>
        {error&&<p style={{color:"#d98f88",fontSize:11,marginBottom:10,background:"#121212",padding:"5px 10px",borderRadius:6}}>⚠ {error}</p>}
        {preview&&(
          <div style={{background:"#0a0a0a",border:"1px solid #e6e6e644",borderRadius:10,padding:"8px 12px",marginBottom:12}}>
            <p style={{color:"#8fc19f",fontWeight:700,fontSize:12,marginBottom:3}}>✓ Archivo válido</p>
            <p style={{color:"#8a8a8a",fontSize:11}}>Izquierda: <b style={{color:"#e6e6e6"}}>{preview.left}</b> · Derecha: <b style={{color:"#e6e6e6"}}>{preview.right}</b></p>
          </div>
        )}
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} style={{flex:1,padding:"7px",borderRadius:9,border:"1px solid #2a2a2a",background:"transparent",color:"#8a8a8a",fontSize:12,cursor:"pointer"}}>Cancelar</button>
          {parsed&&<button onClick={()=>onImport(parsed.left,parsed.right)} style={{flex:2,padding:"7px",borderRadius:9,border:"none",background:"#e6e6e6",color:"#121212",fontWeight:700,fontSize:13,cursor:"pointer"}}>Aplicar y guardar</button>}
        </div>
      </div>
    </div>
  );
}
