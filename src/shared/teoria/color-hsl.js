// Cuentas de color: HSL, mezcla de tonos y paleta real.

import { CHROMATIC } from "./notas.js";
import { NC, hexToRgb, rgbToHex } from "./color.js";

export const CROM_DOBLE = {C:"Do", "C#":"Do#/Reb", D:"Re", "D#":"Re#/Mib", E:"Mi", F:"Fa",
  "F#":"Fa#/Solb", G:"Sol", "G#":"Sol#/Lab", A:"La", "A#":"Sib/La#", B:"Si"};

// ─── paleta "real" (cap. 5bis): interpolación continua de matiz entre las
// tres anclas innegociables — Do (azul), Sol (amarillo), La (rojo) — en sus
// posiciones reales sobre la rueda. Se calcula en vivo, no es una paleta fija.
function hexToHsl(hex){
  let [r,g,b]=hexToRgb(hex).map(v=>v/255);
  const max=Math.max(r,g,b), min=Math.min(r,g,b);
  let h,s,l=(max+min)/2;
  if(max===min){h=s=0;}
  else{
    const d=max-min;
    s = l>0.5 ? d/(2-max-min) : d/(max+min);
    switch(max){
      case r: h=(g-b)/d+(g<b?6:0); break;
      case g: h=(b-r)/d+2; break;
      default: h=(r-g)/d+4;
    }
    h/=6;
  }
  return [h*360,s,l];
}

function hslToHex(h,s,l){
  h=((h%360)+360)%360; h/=360;
  const hue2rgb=(p,q,t)=>{
    if(t<0)t+=1; if(t>1)t-=1;
    if(t<1/6) return p+(q-p)*6*t;
    if(t<1/2) return q;
    if(t<2/3) return p+(q-p)*(2/3-t)*6;
    return p;
  };
  let r,g,b;
  if(s===0){ r=g=b=l; }
  else{
    const q = l<0.5 ? l*(1+s) : l+s-l*s;
    const p = 2*l-q;
    r=hue2rgb(p,q,h+1/3); g=hue2rgb(p,q,h); b=hue2rgb(p,q,h-1/3);
  }
  return rgbToHex(r*255,g*255,b*255);
}

function circularLerpHue(h1,h2,t){
  const diff = ((h2-h1+540)%360)-180;
  return h1 + diff*t;
}

export const paletteReal = (()=>{
  const idxDo=0, idxSol=7, idxLa=9;
  const [hDo] = hexToHsl(NC.C);
  const [hSol] = hexToHsl(NC.G);
  const [hLa] = hexToHsl(NC.A);
  const sAvg=0.62, lAvg=0.40;
  const out={};
  CHROMATIC.forEach((n,i)=>{
    let h;
    if(i<=idxSol) h=circularLerpHue(hDo,hSol,(i-idxDo)/(idxSol-idxDo));
    else if(i<=idxLa) h=circularLerpHue(hSol,hLa,(i-idxSol)/(idxLa-idxSol));
    else h=circularLerpHue(hLa,hDo+360,(i-idxLa)/(12-idxLa));
    out[n]=hslToHex(h,sAvg,lAvg);
  });
  return out;
})();
