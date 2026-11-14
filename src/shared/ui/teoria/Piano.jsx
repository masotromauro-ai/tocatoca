// Piano de tres octavas (C3-B5) con el color tonal de cada tecla.

import { nc } from "../../teoria/color.js";
import { playTone } from "../../audio/audio.js";

// Piano multi-octava — 3 octavas (C3-B5)
// Colores: cada tecla activa usa su color tonal propio
// Diferencia de mano: barra superior azul=MI, barra color tonal=MD
const Piano=({leftVoice=[],rightVoice=[]})=>{
  const WHITE=["C","D","E","F","G","A","B"];
  const BLACK=[{n:"C#",a:0},{n:"D#",a:1},{n:"F#",a:3},{n:"G#",a:4},{n:"A#",a:5}];
  const OCTS=[3,4,5];
  const ww=30,wh=115,bw=18,bh=71;
  const W=WHITE.length*ww*OCTS.length;

  const key=(note,oct,x,w,h,isBlack)=>{
    const L=leftVoice.find(v=>v.note===note&&v.oct===oct);
    const R=rightVoice.find(v=>v.note===note&&v.oct===oct);
    const tonal=nc(note);
    const active=L||R;
    // fondo: color tonal suave si activo, clásico si no
    const fill=active
      ? tonal+(isBlack?"55":"28")
      : (isBlack?"#1c1c1c":"#f7f5ef");
    const stroke=L?"#e6e6e6":R?tonal:(isBlack?"#444":"#bbb");
    const sw=active?2.5:0.8;
    const dotY=isBlack?h-15:h-25;
    const lblY=isBlack?h-6:h-10;
    return(
      <g key={note+oct} style={{cursor:"pointer"}} onClick={()=>playTone(note,oct,0.7)}>
        <rect x={x+0.5} y={0} width={w-1} height={h} rx={isBlack?2:3}
          fill={fill} stroke={stroke} strokeWidth={sw}/>
        {/* Barra superior: identifica la mano */}
        {L&&<rect x={x+1} y={0} width={w-2} height={4} rx={1} fill="#e6e6e6"/>}
        {R&&<rect x={x+1} y={0} width={w-2} height={4} rx={1} fill={tonal}/>}
        {/* Punto de color tonal */}
        {active&&<circle cx={x+w/2} cy={dotY} r={isBlack?3.5:4.5} fill={tonal}/>}
        {/* Nota */}
        <text x={x+w/2} y={lblY} textAnchor="middle" fontSize={isBlack?5.5:7}
          fill={active?(isBlack?"#eee":"#222"):(isBlack?"#555":"#ccc")}
          fontFamily="serif" fontWeight={active?"bold":"normal"}>{note}</text>
        {/* Rol */}
        {active&&!isBlack&&(L||R).role&&(
          <text x={x+w/2} y={h-30} textAnchor="middle" fontSize="5"
            fill={tonal} fontFamily="sans-serif">
            {(L||R).role.split(" ")[0]}
          </text>
        )}
      </g>
    );
  };

  return(
    <div>
      {/* Labels octava */}
      <div className="flex mb-1">
        {OCTS.map(o=>(
          <div key={o} style={{width:WHITE.length*ww+"px",fontSize:"9px",color:"#666",textAlign:"center"}}>
            Oct.{o}
          </div>
        ))}
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${wh}`} style={{minWidth:W+"px",height:"125px",display:"block"}}>
          {/* Separadores */}
          {OCTS.map((o,oi)=>oi>0&&(
            <line key={"s"+o} x1={oi*WHITE.length*ww} y1={0}
              x2={oi*WHITE.length*ww} y2={wh} stroke="#666" strokeWidth="1"/>
          ))}
          {/* Blancas */}
          {OCTS.map((o,oi)=>WHITE.map((n,i)=>
            key(n,o,oi*WHITE.length*ww+i*ww,ww,wh,false)
          ))}
          {/* Negras */}
          {OCTS.map((o,oi)=>BLACK.map(({n,a})=>
            key(n,o,oi*WHITE.length*ww+(a+1)*ww-bw/2,bw,bh,true)
          ))}
        </svg>
      </div>
      {/* Leyenda */}
      <div className="flex gap-4 mt-2 text-xs text-gray-500 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-6 h-2 rounded" style={{background:"#e6e6e6"}}/>
          M.izquierda — tónica (bajo, oct.2)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-6 h-2 rounded" style={{background:"linear-gradient(90deg,#6b9c7c,#b5564f,#e6e6e6)"}}/>
          M.derecha — 3ª · 7ª · extensiones (oct.4-5)
        </span>
      </div>
      {/* Detalle de voces */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="rounded-lg p-2.5 border" style={{background:"#0a0a0a",borderColor:"#e6e6e6"}}>
          <p className="text-xs font-bold mb-2" style={{color:"#e6e6e6"}}>← Mano izquierda</p>
          <div className="space-y-1">
            {leftVoice.map((v,i)=>(
              <div key={i} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:nc(v.note)}}/>
                <span className="font-bold text-sm" style={{color:nc(v.note)}}>{v.note}</span>
                <span className="text-gray-600 text-xs">oct.{v.oct}</span>
                <span className="text-gray-500 text-xs ml-auto">{v.role}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg p-2.5 border" style={{background:"#0a0a0a",borderColor:"#232323"}}>
          <p className="text-xs font-bold mb-2 text-[#eee6d6]">Mano derecha →</p>
          <div className="space-y-1">
            {rightVoice.map((v,i)=>(
              <div key={i} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:nc(v.note)}}/>
                <span className="font-bold text-sm" style={{color:nc(v.note)}}>{v.note}</span>
                <span className="text-gray-600 text-xs">oct.{v.oct}</span>
                <span className="text-gray-500 text-xs ml-auto">{v.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
