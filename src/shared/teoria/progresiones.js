// Progresiones: grados romanos, familias de acordes, análisis y cálculo. Lógica pura.

import { buildScale, nombreLat, noteIdx } from "./notas.js";
import { getFns } from "./acordes.js";
import { DN } from "./escalas.js";

// ═══ ARMONÍA DIATÓNICA CON ESCRITURA CORRECTA (cada grado usa una letra distinta) ═══
export const TONICAS_MAYOR=["C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B"];

export const TONICAS_MENOR=["C","C#","D","Eb","E","F","F#","G","G#","A","Bb","B"];

export const FAMILIAS=[
  {id:"mayor",   nombre:"mayor",          ivs:[0,2,4,5,7,9,11], menor:false},
  {id:"menor",   nombre:"menor",          ivs:[0,2,3,5,7,8,10], menor:true},
  {id:"armonica",nombre:"menor armónica", ivs:[0,2,3,5,7,8,11], menor:true},
  {id:"melodica",nombre:"menor melódica", ivs:[0,2,3,5,7,9,11], menor:true},
];

export const ES_MENORQ=q=>q==="min"||q==="min7"||q==="dim"||q==="m7b5"||q==="dim7"||q==="mMaj7";

export const SUF_ES={maj:"mayor",min:"menor",dim:"disminuido",aug:"aumentado",maj7:"△7","7":"7",min7:"m7",m7b5:"ø7",dim7:"°7",mMaj7:"m△7","maj7#5":"△7♯5","7#5":"7♯5"};

export const SUF_CORTO={maj:"",min:"m",dim:"°",aug:"+",maj7:"△7","7":"7",min7:"m7",m7b5:"ø7",dim7:"°7",mMaj7:"m△7","maj7#5":"△7♯5","7#5":"7♯5"};

export const nombreAcordeEs=(raiz,q)=>nombreLat(raiz)+" "+(SUF_ES[q]||q);

const SUF_ROM7={maj7:"△7","7":"7",min7:"7",m7b5:"ø7",dim7:"°7",mMaj7:"△7","maj7#5":"△7♯5","7#5":"7♯5"};

const romCaso=(i,q)=>ES_MENORQ(q)?DN[i].toLowerCase():DN[i];

export const romTri=(i,tq)=>romCaso(i,tq)+(tq==="dim"?"°":tq==="aug"?"+":"");

export const romSept=(i,sq)=>romCaso(i,sq)+(SUF_ROM7[sq]||"");

const calTri=(t,f)=>t===4&&f===7?"maj":t===3&&f===7?"min":t===3&&f===6?"dim":t===4&&f===8?"aug":"?";

const calSept=(tq,s)=>tq==="maj"?(s===11?"maj7":s===10?"7":"?"):tq==="min"?(s===10?"min7":s===11?"mMaj7":"?"):tq==="dim"?(s===9?"dim7":s===10?"m7b5":"?"):tq==="aug"?(s===11?"maj7#5":s===10?"7#5":"?"):"?";

// Acordes por terceras sobre cada nota de una escala de 7 notas ya bien escrita
export function acordesDeNotas(notas){
  return notas.map((n,i)=>{
    const nn=[0,2,4,6].map(k=>notas[(i+k)%7]), pcs=nn.map(noteIdx), r=pcs[0];
    const t=(pcs[1]-r+12)%12, f=(pcs[2]-r+12)%12, s=(pcs[3]-r+12)%12, tq=calTri(t,f), sq=calSept(tq,s);
    return {i,raiz:n,pc:r,tq,sq,tri:nn.slice(0,3),sept:nn,pcs};
  });
}

export const acordesDiatonicos=(tonica,famId)=>acordesDeNotas(buildScale(tonica,FAMILIAS.find(f=>f.id===famId).ivs));

const tonicaCanonica=(nombre,menor)=>{ const pc=noteIdx(nombre); return pc<0?nombre:(menor?TONICAS_MENOR:TONICAS_MAYOR)[pc]; };

export const QBASE={maj:"maj",min:"min",dim:"dim",aug:"aug",maj7:"maj7","7":"7",min7:"min7",m7b5:"m7b5",dim7:"dim7",mMaj7:"mMaj7","maj7#5":"maj7#5","7#5":"7#5",
  "9":"7","13":"7","7b9":"7","7#9":"7","7alt":"7","7b13":"7","7#11":"7","7b5":"7","7sus4":"7",maj9:"maj7","maj7#11":"maj7",min9:"min7",min11:"min7",add9:"maj","6":"maj",m6:"min"};

const ES_SEPT=q=>["maj7","7","min7","m7b5","dim7","mMaj7","maj7#5","7#5"].includes(q);

const tieneDobles=(notas)=>notas.some(n=>/##|bb|x/.test(n));

// ¿En qué tonalidades vive este acorde? Grado, tonalidad bien escrita y qué sería ese grado en la tonalidad paralela.
export function dondeVive(rootPc,quality,chordPcs){
  const bq=QBASE[quality]; if(!bq) return null;
  const sept=ES_SEPT(bq), ext=quality!==bq, grupos={};
  FAMILIAS.forEach(fam=>{
    (fam.menor?TONICAS_MENOR:TONICAS_MAYOR).forEach(tn=>{
      const notas=buildScale(tn,fam.ivs), set=new Set(notas.map(noteIdx));
      acordesDeNotas(notas).forEach(d=>{
        if(d.pc!==rootPc||(sept?d.sq:d.tq)!==bq) return;
        if(ext&&!chordPcs.every(p=>set.has(p))) return;
        const k=(fam.menor?"m":"M")+tn+d.i;
        if(!grupos[k]){
          let contraste=null;
          if(fam.id==="mayor"||fam.id==="menor"){
            const par=buildScale(tn,(fam.menor?FAMILIAS[0]:FAMILIAS[1]).ivs);
            if(!tieneDobles(par)){ const dp=acordesDeNotas(par)[d.i], qp=sept?dp.sq:dp.tq;
              if(qp!==bq&&qp!=="?") contraste={tonica:tn,menor:!fam.menor,acorde:nombreAcordeEs(dp.raiz,qp)}; }
          }
          grupos[k]={menor:fam.menor,tonica:tn,grado:d.i,rom:sept?romSept(d.i,d.sq):romTri(d.i,d.tq),nombre:nombreAcordeEs(d.raiz,bq),notas:sept?d.sept:d.tri,fams:[],contraste};
        }
        grupos[k].fams.push(fam.id);
      });
    });
  });
  return Object.values(grupos);
}

// Escritura de la raíz de un acorde cuando no hay tonalidad: menores con sostenidos (Do♯m, Sol♯m), mayores con bemoles (Re♭, La♭)
export const raizDefecto=(pc,menor)=>(menor?TONICAS_MENOR:TONICAS_MAYOR)[((pc%12)+12)%12];

// Grado romano de una raíz respecto a una tonalidad (con alteraciones): ♭II, ♯IV, ♭VII…
const REL_MAYOR=["I","♭II","II","♭III","III","IV","♯IV","V","♭VI","VI","♭VII","VII"];

const REL_MENOR=["I","♭II","II","III","♯III","IV","♯IV","V","VI","♯VI","VII","♯VII"];

const ROM_IDX={"I":0,"II":1,"III":2,"IV":3,"V":4,"VI":5,"VII":6};

function romanoRelativo(semi,menorClave,q){
  const base=(menorClave?REL_MENOR:REL_MAYOR)[((semi%12)+12)%12], acc=/^[♭♯]/.test(base)?base[0]:"", num=base.replace(/^[♭♯]/,"");
  const mn=ES_MENORQ(q), n=mn?num.toLowerCase():num;
  const suf=ES_SEPT(q)?(SUF_ROM7[q]||""):(q==="dim"?"°":q==="aug"?"+":"");
  return acc+n+suf;
}

// Análisis de una progresión: tonalidad (mayor o menor) por coincidencia con los acordes diatónicos, grado de cada acorde y dominantes secundarios.
function analizarProgresion(chords){
  const cands=[];
  [false,true].forEach(menor=>(menor?TONICAS_MENOR:TONICAS_MAYOR).forEach(tn=>{
    const fams=menor?["menor","armonica","melodica"]:["mayor"];
    const dia=fams.flatMap(f=>acordesDiatonicos(tn,f).map(d=>({...d,fam:f})));
    const rel=menor?[0,2,3,5,7,8,9,10,11]:[0,2,4,5,7,9,11], tpc=noteIdx(tn), escPcs=new Set(rel.map(x=>(tpc+x)%12));
    let sc=0;
    chords.forEach(({root,quality},ix)=>{
      const rp=noteIdx(root), bq=QBASE[quality]||"maj", sept=ES_SEPT(bq);
      const m=dia.find(d=>d.pc===rp&&(sept?d.sq:d.tq)===bq);
      if(m){ sc+=3; if(m.i===0){ if(ix===0) sc+=1; if(ix===chords.length-1) sc+=1.5; } if(m.i===4&&bq==="7") sc+=1.5; }
      else if(escPcs.has(rp)) sc+=1;
      else if(bq==="7"&&escPcs.has((rp+5)%12)) sc+=0.5;
    });
    cands.push({tn,menor,sc,dia});
  }));
  cands.sort((a,b)=>b.sc-a.sc||(a.menor?1:0)-(b.menor?1:0));
  const best=cands[0], alt=cands.find(c=>c.menor!==best.menor&&c.sc>=best.sc-3.5&&c.sc>0);
  const keyTxt=(c)=>nombreLat(c.tn)+(c.menor?" menor":" mayor");
  const out=chords.map(ch=>{
    const rp=noteIdx(ch.root), bq=QBASE[ch.quality]||"maj", sept=ES_SEPT(bq), tpc=noteIdx(best.tn);
    const m=best.dia.find(d=>d.pc===rp&&(sept?d.sq:d.tq)===bq);
    let degree;
    if(m) degree=sept?romSept(m.i,m.sq):romTri(m.i,m.tq);
    else {
      let sec=null;
      if(bq==="7"||ES_SEPT(bq)&&bq==="7"){
        const tgt=(rp+5)%12, k=best.dia.find(d=>d.i!==0&&d.pc===tgt&&d.fam!=="melodica");
        if(k){ const tq=(best.menor&&k.i===4)?"maj":(best.dia.find(d=>d.i===k.i&&(d.fam==="mayor"||d.fam==="menor"))||k).tq; sec="V7/"+romTri(k.i,tq); }
      }
      degree=sec||romanoRelativo((rp-tpc+12)%12,best.menor,bq);
    }
    const base=degree.replace(/^[♭♯]/,"").replace(/[°+ø△♯♭\d/].*$/,"").toUpperCase();
    const fns=getFns(ch.quality); const fn=fns.find(f=>f.degree.replace(/^[♭♯]/,"")===base)||fns[0];
    return {raw:ch.raw,root:ch.root,quality:ch.quality,notes:ch.notes,degree,key:keyTxt(best),fn};
  });
  out.alternativa=alt?keyTxt(alt):null;
  return out;
}

export const computeProg=(chords)=>analizarProgresion(chords);
