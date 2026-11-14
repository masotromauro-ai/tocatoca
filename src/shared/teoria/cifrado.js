// Cómo se nombra un acorde y cómo se reconoce uno a partir de notas.

import { cifEstilo, cifPropios } from "../almacen/preferencias.js";
import { nombreLat, spell } from "./notas.js";
import { raizDefecto } from "./progresiones.js";

// ─── BANDONEÓN TAB PRINCIPAL ──────────────────────────────────────────────────
// ─── NOTAS MARCADAS: nombre del acorde a partir de las notas marcadas ─────────
export const RAIZ_NOM=["C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B"];

// Nomenclatura general: nombra CUALQUIER conjunto de notas a partir de una raíz (3ª, 5ª, 7ª, tensiones, alteraciones, sus, add, 6).
const CIF_ESTILOS={jazz:{M7:"△",dim:"°",hdim:"ø",aug:"+",mM:"m△"},amer:{M7:"maj",dim:"dim",hdim:"m7♭5",aug:"aug",mM:"mMaj"}};

const INTERVALOS_NOM=["unísono","segunda menor","segunda mayor","tercera menor","tercera mayor","cuarta justa","tritono","quinta justa","sexta menor","sexta mayor","séptima menor","séptima mayor"];

function cifSufijo(S,est){
  const E=CIF_ESTILOS[est], has=i=>S.has(i);
  const third=has(4)?"M":has(3)?"m":null, p5=has(7), b5=has(6);
  const dimF=third==="m"&&b5&&!p5, d7=dimF&&has(9), m7=has(10), M7=has(11), sev=d7||m7||M7;
  const aug=third!=="m"&&has(8)&&!p5&&!b5;
  const sus4=!third&&has(5), sus2=!third&&has(2)&&!sev&&!has(5), sus24=!third&&has(2)&&has(5)&&!sev;
  const e9=has(2)&&!!(sev||third), e11=has(5)&&!!third&&sev&&!dimF, e13=has(9)&&sev&&!d7&&!dimF;
  const g={0:"1"}, alts=[], extra=[]; let suf="", score=0;
  const num=e13?13:e11?11:e9?9:7;
  if(dimF){
    if(d7) suf=E.dim+"7"; else if(m7) suf=E.hdim+(est==="jazz"?"7":""); else if(M7) suf="m△7(♭5)"; else suf=E.dim;
    if(est==="amer"&&m7) suf="m7♭5";
    if(e9&&sev) extra.push("9"); if(has(5)) extra.push("11");
  } else if(sev){
    const base=M7?(third==="m"?E.mM:E.M7):(third==="m"?"m":"");
    suf=base+num;
    if(e13&&has(5)&&third) extra.push("11");
  } else {
    if(third==="m") suf="m";
    else if(aug) suf=E.aug;
    if(third&&has(9)) suf+=has(2)?"6/9":"6";
    else if(third&&has(2)) suf+="add9";
    if(third&&has(5)) suf+="add11";
  }
  if(sus4&&sus2===false&&has(2)) { /* 9sus4 */ }
  if(sus24) suf+="sus(2,4)"; else if(sus4) suf+="sus4"; else if(sus2) suf+="sus2";
  if(has(1)) alts.push("♭9"); if(has(3)&&third==="M") alts.push("♯9");
  if(has(6)&&!dimF){ alts.push(p5?"♯11":"♭5"); }
  if(has(8)&&!aug){ if(p5||third==="m"||third===null) alts.push("♭13"); }
  if(aug&&sev) alts.push("♯5");
  const parts=[...extra,...alts];
  if(parts.length) suf+="("+parts.join(",")+")";
  if(!third&&!sus4&&!sus2&&!sus24&&S.size>1) suf+="(sin 3ª)";
  if(S.size===1&&p5) suf="5";
  score=alts.length*2+extra.length+(third?0:(sus4||sus2||sus24?3:5))+(has(9)&&!sev&&third?1:0);
  // grados para rotular el teclado
  g[1]="♭9"; g[2]=(sev||third)?"9":"2"; g[3]=third==="M"?"♯9":"♭3"; g[4]="3"; g[5]=(third||sev)?"11":"4";
  g[6]=(p5&&!dimF)?"♯11":"♭5"; g[7]="5"; g[8]=aug?"♯5":"♭13"; g[9]=d7?"♭♭7":sev?"13":"6"; g[10]="♭7"; g[11]="7";
  if(third==="M"&&has(3)) g[3]="♯9";
  return {suf,g,score};
}

export function analizarAcorde(pcs,bajoPc,opt={}){
  const set=[...new Set(pcs)]; if(set.length<2) return null;
  const est=cifEstilo(), propios=cifPropios();
  if(set.length===2){
    const d=((set[1]-set[0])+12)%12, r=set[0];
    if(d===7) return {nombre:nombreLat(RAIZ_NOM[r])+" 5",suf:"5",key:"0,7",rootPc:r,grados:{0:"1",7:"5"},alts:[],custom:false,defaultSuf:"5",nombres:{[r]:nombreLat(RAIZ_NOM[r]),[set[1]]:nombreLat(spell(RAIZ_NOM[r],7,4))},intervalo:false};
    return {nombre:"Intervalo de "+INTERVALOS_NOM[Math.min(d,12-d)===d?d:d]+" ("+nombreLat(RAIZ_NOM[r])+"–"+nombreLat(RAIZ_NOM[set[1]])+")",suf:"",key:"",rootPc:r,grados:{},alts:[],custom:false,defaultSuf:"",intervalo:true};
  }
  const ev=(r)=>{
    const S=new Set(set.filter(p=>p!==r).map(p=>(p-r+12)%12)), key=[0,...[...S].sort((x,y)=>x-y)].join(",");
    const c=cifSufijo(S,est), custom=propios[key]!==undefined, suf=custom?propios[key]:c.suf;
    const menorLike=S.has(3)&&!S.has(4), rootEng=raizDefecto(r,menorLike), raiz=nombreLat(rootEng);
    const cuerpo=suf===""?"mayor":suf==="m"?"menor":suf==="°"?"disminuido":suf==="+"?"aumentado":suf;
    // cada nota se escribe según su función en el acorde (3ª, 5ª, 7ª, 9ª…), no según una tabla fija
    const GD={1:0,2:1,3:2,4:3,5:4,6:5,7:6,9:1,11:3,13:5}, nombres={};
    set.forEach(pc=>{ const iv=(pc-r+12)%12, lab=c.g[iv]||"", num=parseInt((lab.match(/\d+/)||["0"])[0]); nombres[pc]=pc===r?raiz:(GD[num]!==undefined?nombreLat(spell(rootEng,iv,GD[num])):nombreLat(RAIZ_NOM[pc])); });
    const barra=r!==bajoPc?" / "+(nombres[bajoPc]||nombreLat(RAIZ_NOM[bajoPc])):"";
    return {nombre:raiz+" "+cuerpo+barra,suf,key,rootPc:r,grados:c.g,custom,defaultSuf:c.suf,nombres,score:(custom?-10:c.score)+(r===bajoPc?0:3),intervalo:false};
  };
  const todos=set.map(ev).sort((x,y)=>x.score-y.score);
  const elegido=(opt.raiz!=null&&todos.find(x=>x.rootPc===opt.raiz))||todos[0];
  const vistos=new Set([elegido.nombre]), alts=[];
  todos.forEach(x=>{ if(x!==elegido&&x.score<=4&&!/\(|add11|sus/.test(x.nombre)&&!vistos.has(x.nombre)){ vistos.add(x.nombre); alts.push({nombre:x.nombre,rootPc:x.rootPc}); } });
  return {...elegido,alts:alts.slice(0,3)};
}

function nombreAcordePcs(pcs,bajoPc,raiz){ const r=analizarAcorde(pcs,bajoPc,{raiz}); return r?r.nombre:null; }
