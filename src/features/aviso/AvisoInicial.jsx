// El aviso que ve el alumno al entrar (se cuenta cada ingreso; desde el cuarto se puede ocultar).

import { UI_FONT, uiGhost, uiPill } from "../../shared/ui/tema.js";

// ─── Aviso inicial: alcance de la plataforma y papel del profesor ───
const AVISO_VISTAS_SIN_OPCION = 3;   // las primeras veces no se puede ocultar; después aparece "No mostrar más"

export function AvisoInicial({n,manual,onClose,onNunca}){
  const puedeOcultar = !manual && n>AVISO_VISTAS_SIN_OPCION;
  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(4,4,5,.78)",backdropFilter:"blur(3px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}} role="dialog" aria-modal="true" aria-label="Importante">
      <div style={{width:"100%",maxWidth:580,maxHeight:"88vh",display:"flex",flexDirection:"column",background:"#121214",border:"1px solid #2f2f35",borderRadius:16,boxShadow:"0 20px 60px rgba(0,0,0,.6)",overflow:"hidden"}}>
        <div style={{padding:"18px 22px 12px",borderBottom:"1px solid #232326"}}>
          <p style={{margin:0,fontFamily:UI_FONT,fontSize:10,fontWeight:800,letterSpacing:"0.28em",color:"#f2c14e"}}>IMPORTANTE</p>
          <h2 style={{margin:"6px 0 0",fontFamily:"'Libre Baskerville',serif",fontSize:21,fontWeight:700,color:"#ececec"}}>Antes de empezar</h2>
        </div>
        <div style={{padding:"16px 22px",overflowY:"auto",fontFamily:"'Crimson Text',Georgia,serif",fontSize:16,lineHeight:1.6,color:"#cfcfd4"}}>
          <p style={{margin:"0 0 14px",padding:"10px 14px",borderLeft:"3px solid #f2c14e",background:"#1b1810",color:"#f3e3b5",fontFamily:UI_FONT,fontSize:13.5,lineHeight:1.5}}>BandoMaps entrena la mecánica del instrumento. La música, el fraseo y el aire los guía tu profesor.</p>
          <p style={{margin:"0 0 12px"}}>Bienvenido a BandoMaps, una plataforma concebida de manera integral para acompañar y sistematizar la práctica del bandoneón desde su dimensión puramente técnica y estructural.</p>
          <p style={{margin:"0 0 12px"}}>El propósito fundamental de esta herramienta es ofrecer un método de ejercitación enfocado en la asimilación mecánica, la memoria topográfica de los teclados y la intuición gráfica del instrumento. A través de este entorno, el estudiante podrá abordar de manera clara y progresiva el mapa del bandoneón, la soltura de ambas manos, la digitación y la coordinación motriz.</p>
          <p style={{margin:"0 0 12px"}}>Es indispensable señalar los límites de este recurso: BandoMaps no abarca los aspectos expresivos, el fraseo, los acentos, el manejo del aire ni las sutilezas melódicas y estilísticas propias de cada género. Todo el desarrollo interpretativo, la musicalidad y el criterio artístico quedan bajo la tutela, guía y supervisión directa de un profesor.</p>
          <p style={{margin:0}}>Te invitamos a utilizar esta plataforma como una herramienta práctica y un soporte visual diario para dominar la mecánica del instrumento, complementando siempre tu estudio con la enseñanza de tu docente.</p>
        </div>
        <div style={{padding:"12px 22px 16px",borderTop:"1px solid #232326",display:"flex",gap:10,alignItems:"center",justifyContent:"flex-end",flexWrap:"wrap"}}>
          {puedeOcultar && <button onClick={onNunca} style={uiGhost}>No mostrar más</button>}
          <button onClick={onClose} style={uiPill(true,{padding:"9px 24px",fontSize:13})} autoFocus>{manual?"Cerrar":"Entendido"}</button>
        </div>
      </div>
    </div>
  );
}
