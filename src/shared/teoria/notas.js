// Notas: nombres, enarmónicos, escalas y cómo se escribe cada nota según la tonalidad. Lógica pura: sin React, sin pantalla, sin guardado.

export const CHROMATIC  = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

const ENHARMONIC = {"C#":"Db","D#":"Eb","F#":"Gb","G#":"Ab","A#":"Bb"};

export const enh = n => ENHARMONIC[n]||n;

const NAT_PC = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};

const LETRAS = ["C","D","E","F","G","A","B"];

const LAT_NOMBRE = {C:"Do",D:"Re",E:"Mi",F:"Fa",G:"Sol",A:"La",B:"Si"};

// Altura (0-11) de cualquier nombre bien escrito: C, C#, Db, F##, Bbb…
export const noteIdx = n => {
  const i=CHROMATIC.indexOf(n); if(i>=0) return i;
  const m=/^([A-G])(#{1,2}|b{1,2}|x)?$/.exec(String(n||"").trim());
  if(!m) return -1;
  const acc = !m[2] ? 0 : m[2]==="x" ? 2 : m[2][0]==="#" ? m[2].length : -m[2].length;
  return ((NAT_PC[m[1]]+acc)%12+12)%12;
};

// Grado (letra) por defecto según la distancia en semitonos, cuando no se conoce el intervalo exacto.
const GRADO_DEF  = {0:0,1:1,2:1,3:2,4:2,5:3,6:4,7:4,8:5,9:5,10:6,11:6};

const GRADO_DEF_SOST = {0:0,1:0,2:1,3:1,4:2,5:3,6:3,7:4,8:4,9:5,10:5,11:6};

// Deletrea respetando la regla: cada grado usa una letra distinta (3ª = dos letras arriba, 7ª = seis, etc.).
export const spell = (root,semi,deg,sost=false) => {
  const ri=noteIdx(root); if(ri<0) return CHROMATIC[((semi%12)+12)%12];
  const sm=((semi%12)+12)%12;
  const d = deg!==undefined ? deg : (sost?GRADO_DEF_SOST:GRADO_DEF)[sm];
  const letter = LETRAS[(LETRAS.indexOf(root[0])+d)%7];
  const target=(ri+sm)%12;
  let diff=((target-NAT_PC[letter])%12+12)%12; if(diff>6) diff-=12;
  if(Math.abs(diff)>2) return CHROMATIC[target];
  return letter+(diff===0?"":diff>0?"#".repeat(diff):"b".repeat(-diff));
};

export const fromRoot = (root,semi,deg) => spell(root,semi,deg);

export const buildScale = (root,ivs) => {
  const key=ivs.join(",");
  if(ivs.length===7) return ivs.map((iv,i)=>spell(root,iv,i));
  if(key==="0,3,5,6,7,10") return ivs.map((iv,i)=>spell(root,iv,[0,2,3,4,4,6][i]));
  if(key==="0,2,3,5,6,8,9,11") return ivs.map((iv,i)=>spell(root,iv,[0,1,2,3,4,5,5,6][i]));
  if(ivs.length===12){ // cromática: sostenidos o bemoles según la tonalidad
    const usaBemoles = /b/.test(root) || root==="F";
    const nombres = usaBemoles ? ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"] : CHROMATIC;
    return ivs.map(iv=>nombres[(noteIdx(root)+iv)%12]);
  }
  return ivs.map(iv=>spell(root,iv));
};

// Nombre en español con símbolos (Si♭, Fa♯, Do𝄪…)
export const nombreLat = (n) => {
  const m=/^([A-G])(.*)$/.exec(String(n||"")); if(!m) return n;
  const acc=m[2].replace(/##/g,"𝄪").replace(/#/g,"♯").replace(/bb/g,"♭♭").replace(/b/g,"♭");
  return LAT_NOMBRE[m[1]]+acc;
};

export const LAT={"DO":"C","DO#":"C#","RE":"D","RE#":"D#","MI":"E","FA":"F","FA#":"F#","SOL":"G","SOL#":"G#","LA":"A","LA#":"A#","SI":"B"};

const ENG_LAT=Object.fromEntries(Object.entries(LAT).map(([k,v])=>[v,k]));
