// Grados en números romanos (I, ♭III, ♯XI…) y su distancia en la escala.

export const GRADO_LAB = {"R":0,"2":1,"3":2,"b3":2,"4":3,"5":4,"b5":4,"#5":4,"6":5,"b7":6,"7":6,"bb7":6,"b9":1,"9":1,"#9":1,"11":3,"#11":3,"b13":5,"13":5};

const ROM_N=["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII"];

// "R","3","b7","9","#11","13","8" → I, III, ♭VII, IX, ♯XI, XIII, VIII
export const aRomano = (lab)=>{
  if(lab==="R") return "I";
  const m=/^(bb|b|#)?(\d+)$/.exec(String(lab));
  if(!m) return lab;
  const acc=m[1]==="bb"?"♭♭":m[1]==="b"?"♭":m[1]==="#"?"♯":"";
  return acc+(ROM_N[+m[2]-1]||m[2]);
};
