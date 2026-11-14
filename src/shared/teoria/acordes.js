// Fórmulas de acordes, sus funciones y su escritura. Lógica pura.

import { fromRoot } from "./notas.js";
import { MODES } from "./escalas.js";

// ─── TEORÍA ───────────────────────────────────────────────────────────────────
export const FORMULAS={
  "maj": {intervals:[0,4,7], degs:[0,2,4],          label:"Mayor",      symbol:"△"   },
  "min": {intervals:[0,3,7], degs:[0,2,4],          label:"Menor",      symbol:"m"   },
  "7":   {intervals:[0,4,7,10], degs:[0,2,4,6],       label:"Dom. 7ª",    symbol:"7"   },
  "maj7":{intervals:[0,4,7,11], degs:[0,2,4,6],       label:"Mayor 7ª",   symbol:"△7"  },
  "min7":{intervals:[0,3,7,10], degs:[0,2,4,6],       label:"Menor 7ª",   symbol:"m7"  },
  "dim": {intervals:[0,3,6], degs:[0,2,4],          label:"Disminuido", symbol:"°"   },
  "dim7":{intervals:[0,3,6,9], degs:[0,2,4,6],        label:"Dim. 7ª",    symbol:"°7"  },
  "m7b5":{intervals:[0,3,6,10], degs:[0,2,4,6],       label:"Semidism.",  symbol:"ø7"  },
  "aug": {intervals:[0,4,8], degs:[0,2,4],          label:"Aumentado",  symbol:"+"   },
  "sus2":{intervals:[0,2,7], degs:[0,1,4],          label:"Sus2",       symbol:"sus2"},
  "sus4":{intervals:[0,5,7], degs:[0,3,4],          label:"Sus4",       symbol:"sus4"},
  "9":   {intervals:[0,4,7,10,2], degs:[0,2,4,6,1],     label:"Dom. 9ª",    symbol:"9"   },
  "maj9":{intervals:[0,4,7,11,2], degs:[0,2,4,6,1],     label:"Mayor 9ª",   symbol:"△9"  },
  "min9":{intervals:[0,3,7,10,2], degs:[0,2,4,6,1],     label:"Menor 9ª",   symbol:"m9"  },
  "13":  {intervals:[0,4,7,10,2,9], degs:[0,2,4,6,1,5],   label:"Dom. 13ª",   symbol:"13"  },
  "7b9": {intervals:[0,4,7,10,1], degs:[0,2,4,6,1],     label:"Dom. b9",    symbol:"7b9" },
  "7#9": {intervals:[0,4,7,10,3], degs:[0,2,4,6,1],     label:"Dom. #9",    symbol:"7#9" },
  "7alt":{intervals:[0,4,10,1,3,6,8], degs:[0,2,6,1,1,4,5], label:"Alt.",       symbol:"7alt"},
  "6":      {intervals:[0,4,7,9],    degs:[0,2,4,5],     label:"Mayor 6ª",      symbol:"6"},
  "m6":     {intervals:[0,3,7,9],    degs:[0,2,4,5],     label:"Menor 6ª",      symbol:"m6"},
  "mMaj7":  {intervals:[0,3,7,11],   degs:[0,2,4,6],     label:"Menor 7ª mayor",symbol:"m△7"},
  "7sus4":  {intervals:[0,5,7,10],   degs:[0,3,4,6],     label:"Dom. sus4",     symbol:"7sus4"},
  "7b5":    {intervals:[0,4,6,10],   degs:[0,2,4,6],     label:"Dom. ♭5",       symbol:"7♭5"},
  "7#5":    {intervals:[0,4,8,10],   degs:[0,2,4,6],     label:"Dom. aumentado",symbol:"7♯5"},
  "maj7#5": {intervals:[0,4,8,11],   degs:[0,2,4,6],     label:"Mayor 7ª aum.", symbol:"△7♯5"},
  "maj7#11":{intervals:[0,4,7,11,6], degs:[0,2,4,6,3],   label:"Mayor 7ª ♯11",  symbol:"△7♯11"},
  "7#11":   {intervals:[0,4,7,10,6], degs:[0,2,4,6,3],   label:"Dom. ♯11",      symbol:"7♯11"},
  "7b13":   {intervals:[0,4,7,10,8], degs:[0,2,4,6,5],   label:"Dom. ♭13",      symbol:"7♭13"},
  "add9":   {intervals:[0,4,7,2],    degs:[0,2,4,1],     label:"Mayor add9",    symbol:"add9"},
  "min11":  {intervals:[0,3,7,10,2,5], degs:[0,2,4,6,1,3], label:"Menor 11ª",   symbol:"m11"},
};

const HF={
  "7":[
    {fn:"V7 → I (dominante)",degree:"V",key:"Resuelve a tónica mayor",mode:"Mixolidio",modeIvs:MODES["Mixolidio"],tensions:["9","13"],avoid:["11"],resolutions:["I△7","I"],why:"El tritono (3ª–7ª) se resuelve por semitono. Tensión máxima del sistema tonal."},
    {fn:"V7/IV (hacia menor)",degree:"V",key:"Resuelve a acorde menor",mode:"Alterada",modeIvs:MODES["Alterada"],tensions:["b9","#9","b13"],avoid:["9","13"],resolutions:["I m7","I m"],why:"Tensiones alteradas crean color oscuro. Idiomático del tango en cadencias menores."},
    {fn:"SubV7 (tritonal)",degree:"bII",key:"Reemplaza V7 — bajo por semitono",mode:"Lidio b7",modeIvs:MODES["Lidio b7"],tensions:["9","#11","13"],avoid:[],resolutions:["I△7","I"],why:"Comparte el tritono con V7. El bajo baja un semitono en vez del salto de 5ª."},
    {fn:"Dominante de paso",degree:"?",key:"Conecta cromáticamente",mode:"Mixolidio",modeIvs:MODES["Mixolidio"],tensions:["9","13"],avoid:[],resolutions:["siguiente"],why:"No establece tonalidad. Genera movimiento cromático sin perturbar el centro."},
    {fn:"I7 Blues / tango",degree:"I",key:"Tónica con color blue-tango",mode:"Mixo-blues",modeIvs:MODES["Mixo-blues"],tensions:["9","#9","13"],avoid:[],resolutions:["IV7","V7"],why:"La 7ª menor es constitutiva del sonido, no tensión a resolver."},
  ],
  "maj7":[
    {fn:"I△7 — Tónica mayor",degree:"I",key:"Centro tonal luminoso",mode:"Lidio",modeIvs:MODES["Lidio"],tensions:["9","#11","13"],avoid:["11"],resolutions:["estático"],why:"#11 (Lidio) evita conflicto con la 4ª justa. Color más sofisticado de la función."},
    {fn:"IV△7 — Subdominante",degree:"IV",key:"Color lírico — no resuelve fuerte",mode:"Lidio",modeIvs:MODES["Lidio"],tensions:["9","#11"],avoid:["11"],resolutions:["I△7","V7"],why:"La 11ª justa crea fricción con la 3ª del I. Con Lidio (#11) el movimiento es fluido."},
    {fn:"△7 Modal",degree:"I",key:"Tónica de modo sin función tonal",mode:"Jónico",modeIvs:MODES["Jónico"],tensions:["9","6","13"],avoid:[],resolutions:["estático"],why:"En música modal el △7 es punto de reposo absoluto. Frecuente en tango moderno."},
  ],
  "min7":[
    {fn:"II m7 — Pre-dominante",degree:"II",key:"Pre-dominante en II–V–I",mode:"Dórico",modeIvs:MODES["Dórico"],tensions:["9","11"],avoid:["b9"],resolutions:["V7","V7sus4"],why:"Dórico (6ª mayor) da brillo típico del jazz. Evitar b9 — suena Frigio."},
    {fn:"III m7 — Mediante",degree:"III",key:"Sustituto de tónica, más oscuro",mode:"Frigio",modeIvs:MODES["Frigio"],tensions:["11"],avoid:["b9","b13"],resolutions:["IV△7","II m7"],why:"Tiene b9 (Frigio). Crea tensión suave que impulsa hacia el IV."},
    {fn:"VI m7 — Relativa menor",degree:"VI",key:"Tónica relativa estable",mode:"Eólico",modeIvs:MODES["Eólico"],tensions:["9","11"],avoid:[],resolutions:["estático"],why:"Comparte 3 notas con I△7. Reemplaza la tónica mayor con color oscuro."},
    {fn:"IV m7 — Subdominante menor",degree:"IV",key:"Borrowed del modo menor",mode:"Eólico",modeIvs:MODES["Eólico"],tensions:["9","11","b6"],avoid:[],resolutions:["I△7","V7","bVII△7"],why:"La b6 delata que viene del modo menor. Oscuridad expresiva. Muy usado en tango."},
  ],
  "m7b5":[
    {fn:"IIø7 — Pre-dominante en menor",degree:"II",key:"Supertónica en contexto menor",mode:"Locrio #2",modeIvs:MODES["Locrio #2"],tensions:["9","11","b13"],avoid:[],resolutions:["V7b9","V7alt"],why:"Locrio #2 da 9ª natural, más melódico que Locrio. Clave en ii-V-i del tango."},
    {fn:"ø7 de color modal",degree:"?",key:"Color sin función tonal fija",mode:"Locrio #2",modeIvs:MODES["Locrio #2"],tensions:["9","11"],avoid:[],resolutions:["variable"],why:"Puede flotar ambiguamente en tango moderno y jazz sin necesitar resolver."},
  ],
  "maj":[
    {fn:"I Mayor — Tónica",degree:"I",key:"Centro tonal clásico",mode:"Jónico",modeIvs:MODES["Jónico"],tensions:["9","6"],avoid:["7"],resolutions:["estático"],why:"Sin 7ª el sonido es más abierto y clásico. Frecuente en cierres de tango."},
    {fn:"IV Mayor — Subdominante",degree:"IV",key:"Hacia dominante o tónica",mode:"Lidio",modeIvs:MODES["Lidio"],tensions:["9","#11"],avoid:[],resolutions:["V","I"],why:"Con #11 (Lidio) suena brillante y moderno sin abandonar la función."},
    {fn:"V Mayor — Dominante sin 7ª",degree:"V",key:"Menos tensión que V7",mode:"Mixolidio",modeIvs:MODES["Mixolidio"],tensions:["9","13"],avoid:["11"],resolutions:["I","I△7"],why:"Sin la 7ª la tensión es menor. Común en pasajes clásicos y folclóricos."},
  ],
  "min":[
    {fn:"I menor — Tónica menor",degree:"I",key:"Centro tonal oscuro",mode:"Eólico",modeIvs:MODES["Eólico"],tensions:["9","11","b6"],avoid:[],resolutions:["estático"],why:"La b6 eólica refuerza el color oscuro esencial del tango."},
    {fn:"IV menor — Subdominante menor",degree:"IV",key:"Peso expresivo en modo menor",mode:"Eólico",modeIvs:MODES["Eólico"],tensions:["9","11"],avoid:[],resolutions:["V7","I m","bVII"],why:"Junto al V7 forma la cadencia perfecta menor. Muy frecuente en tango y milonga."},
  ],
  "dim7":[
    {fn:"VII°7 — Sensible disminuido",degree:"VII",key:"Cada nota a semitono de la tónica",mode:"Disminuida",modeIvs:MODES["Disminuida"],tensions:[],avoid:[],resolutions:["I△7","I","I m"],why:"Simétrico: divide la octava en 4 partes. Fundamental en tango como paso cromático."},
    {fn:"°7 cromático de paso",degree:"?",key:"Conecta por movimiento de bajo",mode:"Disminuida",modeIvs:MODES["Disminuida"],tensions:[],avoid:[],resolutions:["acorde a semitono"],why:"Puede transponerse cada 3 semitonos. Ideal para modulaciones rápidas en tango."},
  ],
};

export const GRUPOS_ACORDE=[
  ["Disminuidos",[["dim","° dim"],["dim7","°7"],["m7b5","ø7  (m7♭5)"]]],
  ["Tríadas",[["maj","Mayor"],["min","menor"],["aug","+ aum."],["sus2","sus2"],["sus4","sus4"]]],
  ["Cuatríadas",[["maj7","△7"],["7","7"],["min7","m7"],["mMaj7","m△7"],["6","6"],["m6","m6"],["7sus4","7sus4"],["7b5","7♭5"],["7#5","7♯5"],["maj7#5","△7♯5"]]],
  ["Extendidos y alterados",[["9","9"],["maj9","△9"],["min9","m9"],["13","13"],["min11","m11"],["7b9","7♭9"],["7#9","7♯9"],["7alt","7alt"],["7#11","7♯11"],["7b13","7♭13"],["maj7#11","△7♯11"],["add9","add9"]]],
];

export const QUAL_TXT={maj:"",min:"m",dim:"dim",dim7:"dim7",m7b5:"m7b5",aug:"aug",sus2:"sus2",sus4:"sus4",maj7:"maj7","7":"7",min7:"m7",mMaj7:"mmaj7","6":"6",m6:"m6","7sus4":"7sus4","7b5":"7b5","7#5":"7#5","maj7#5":"maj7#5","9":"9",maj9:"maj9",min9:"m9","13":"13",min11:"m11","7b9":"7b9","7#9":"7#9","7alt":"7alt","7#11":"7#11","7b13":"7b13","maj7#11":"maj7#11",add9:"add9"};

// ─── Funciones tonales de todos los acordes (disminuidos, aumentados, suspendidos, dominantes alterados…) ───
const mkF=(fn,degree,key,mode,tensions,avoid,resolutions,why)=>({fn,degree,key,mode,modeIvs:MODES[mode],tensions,avoid,resolutions,why});
Object.assign(HF,{
  dim7:[
    mkF("VII°7 — Sensible de la menor armónica","VII","Sobre la sensible: resuelve a I menor (o a I mayor)","Disminuida",["9","11","b13","7"],[],["I m","I△7","I"],"Es el VII° de la menor armónica y suena como un V7b9 sin fundamental: apila la 3ª, 5ª, 7ª y 9ª del dominante. La escala simétrica tono–semitono da todas sus tensiones."),
    mkF("♯I°7 — De paso hacia el II","♯I","Entre I y II: el bajo sube por semitono","Disminuida",["9","11","b13","7"],[],["II m7","II m"],"Ejemplo en Do: Do – Do♯°7 – Re m7. El °7 cumple el papel de V7b9 del II sin su fundamental."),
    mkF("♭III°7 — De paso hacia el III","♭III","Entre II y III con bajo ascendente","Disminuida",["9","11","b13","7"],[],["III m7","III m"],"Ejemplo en Do: Re m7 – Mi♭°7 – Mi m7. Une dos acordes menores por semitono."),
    mkF("♯IV°7 — De paso hacia el V","♯IV","Entre IV y V: prepara al dominante","Disminuida",["9","11","b13","7"],[],["V7","I/V"],"Ejemplo en Do: Fa – Fa♯°7 – Sol7. Cadencia típica del tango y el bolero."),
    mkF("I°7 — Auxiliar sobre la tónica","I","Adorno cromático que vuelve al mismo acorde","Disminuida",["9","11","b13","7"],[],["I","I△7"],"I – I°7 – I: una bordadura cromática. Se usa para animar una tónica larga."),
    mkF("°7 simétrico — 4 resoluciones posibles","?","Cada nota puede ser la fundamental","Disminuida",["9","11","b13","7"],[],["I en 4 tonalidades distintas"],"Do°7 = Mi♭°7 = Sol♭°7 = La°7: son las mismas notas. Según cuál se escuche como sensible, resuelve a Re♭, Fa, La o Si♭ (mayores o menores)."),
  ],
  dim:[
    mkF("VII° — Sensible (mayor)","VII","Séptimo grado de la escala mayor","Locrio",["11","b13"],["b9"],["I","I△7"],"Sobre el VII grado mayor es Locrio. Sin séptima suena más suave que el V7: hace de dominante sin fundamental."),
    mkF("II° — Pre-dominante en menor","II","Segundo grado de la escala menor","Locrio",["11","b13"],["b9"],["V","V7"],"En modo menor el II es disminuido y prepara al V. Es el IIø7 sin la séptima."),
    mkF("VII° — Sensible (menor armónica)","VII","Sobre la sensible de la menor armónica","Locrio bb7",["11","b13"],["b9"],["I m"],"Locrio ♭♭7 es el séptimo modo de la menor armónica: el modo exacto del °7 sin su séptima."),
    mkF("° de paso cromático","?","Une dos acordes por semitono","Disminuida",["9","11","b13"],[],["acorde a semitono"],"Funciona como el °7 pero con tres notas: sirve de paso entre dos grados."),
  ],
  aug:[
    mkF("III+ — Menor armónica","III","Tercer grado de la menor armónica (Jónico ♯5)","Jónico #5",["9","13"],["11"],["VI m","IV"],"Aparece al armonizar la menor armónica (en La menor, Do+). Tiende hacia el VI menor o el IV."),
    mkF("V+ — Dominante aumentado","V","Dominante con quinta aumentada","Tonos enteros",["9","#11"],[],["I","I△7"],"La 5ª aumentada sube por semitono hasta la 3ª del I. La escala de tonos enteros le da su color flotante."),
    mkF("I+ — Paso cromático","I","La quinta sube por semitono","Tonos enteros",["9","#11"],[],["I6","I△7"],"Cliché clásico: la quinta asciende cromáticamente (Do – Do+ – Do6 – Do7)."),
  ],
  sus4:[
    mkF("V sus4 → V7","V","Suspensión del dominante","Mixolidio",["9","13"],[],["V7","I"],"La 4ª suspende la 3ª y se resuelve hacia ella por semitono. Evitá tocar la 3ª mientras suena la sus4."),
    mkF("I sus4 — Tónica abierta","I","Tónica sin tercera, color moderno","Jónico",["9","13"],[],["I","V"],"Sin tercera el acorde queda ambiguo. Muy usado en pop y en tango moderno."),
  ],
  sus2:[
    mkF("I sus2 — Tónica abierta","I","Sin tercera: ni mayor ni menor","Jónico",["9","13"],[],["I","IV"],"La 2ª reemplaza a la 3ª. Es abierto y luminoso."),
    mkF("IV sus2 — Subdominante suave","IV","Subdominante sin tercera","Lidio",["9","#11"],[],["V7","I"],"Mantiene el color lidio sin definir mayor o menor."),
  ],
  "9":[
    mkF("V9 → I","V","Dominante con novena","Mixolidio",["9","13"],["11"],["I△7","I"],"La 9ª suaviza el V7 y lo vuelve más jazzístico sin perder la resolución."),
    mkF("I9 — Blues y tango","I","Dominante como tónica","Mixo-blues",["9","#9","13"],[],["IV9","V9"],"En blues los acordes dominantes funcionan en I, IV y V."),
  ],
  "13":[
    mkF("V13 → I","V","Dominante con 13ª","Mixolidio",["9","13"],["11"],["I△7","I△9"],"La 13ª aporta el color de la 6ª mayor del Mixolidio."),
    mkF("♭II13 — Sustituto tritonal","♭II","Comparte 3ª y 7ª con el V7","Lidio b7",["9","#11","13"],[],["I△7","I"],"Re♭13 y Sol7 comparten el tritono (Si–Fa). El bajo baja por semitono."),
  ],
  "7b9":[
    mkF("V7b9 → I menor","V","Dominante hacia tónica menor","Frigio Dom.",["b9","b13"],["9"],["I m","I m7"],"Quinto modo de la menor armónica: la ♭9 y ♭13 tiran hacia la tónica menor. Típico del tango."),
    mkF("V7b9 — Escala disminuida S–T","V","Versión simétrica del dominante","Disminuida S-T",["b9","#9","#11","13"],[],["I m","I"],"La escala semitono–tono ofrece b9, #9, #11 y 13. Se superpone con el °7 de su 3ª."),
  ],
  "7#9":[
    mkF("V7#9 → I","V","Dominante con novena aumentada","Alterada",["#9","b13"],["9"],["I","I m"],"El acorde 'hendrixiano': 3ª mayor y #9 conviven. Muy usado en blues, funk y jazz."),
    mkF("I7#9 — Blues","I","Acorde de blues sobre la tónica","Mixo-blues",["#9","13"],[],["IV7","V7"],"La #9 equivale a la ♭3 del blues: choque típico entre 3ª mayor y menor."),
  ],
  "7alt":[
    mkF("V7alt → I","V","Dominante con máxima tensión","Alterada",["b9","#9","#11","b13"],[],["I","I m"],"La escala alterada (7º modo de la menor melódica) concentra todas las tensiones alteradas."),
    mkF("V7alt/II — Dominante secundario","V","Prepara a un acorde menor","Alterada",["b9","#9","#11","b13"],[],["II m7"],"Cuando resuelve a un menor, la alteración se oye más natural."),
  ],
  "7sus4":[
    mkF("V7sus4 → V7","V","Suspensión del dominante","Mixolidio",["9","13"],[],["V7","I"],"Dominante con 4ª en lugar de 3ª: pide resolver a V7 y luego a I."),
  ],
  "7b5":[
    mkF("V7b5 — Dominante lidio","V","Quinta disminuida (equivale a ♯11)","Lidio b7",["9","13"],[],["I","I△7"],"La b5 es la #11 del modo Lidio b7. Es el dominante simétrico más usado en jazz."),
    mkF("♭II7b5 — Tritonal","♭II","Sustituto tritonal","Lidio b7",["9","13"],[],["I△7","I"],"Comparte el tritono con el V7: el bajo baja por semitono."),
  ],
  "7#5":[
    mkF("V7#5 → I","V","Dominante aumentado","Tonos enteros",["9","#11"],[],["I","I△7"],"Tonos enteros: sonido flotante que se resuelve con fuerza."),
  ],
  "maj7#5":[
    mkF("I△7#5 — Lidio aumentado","I","Tercer modo de la menor melódica","Lidio aumentado",["9","#11","13"],[],["II m7","IV"],"Color brillante y suspendido; sustituye a la tónica mayor."),
  ],
  "maj7#11":[
    mkF("IV△7#11 — Subdominante lidio","IV","Subdominante con #11","Lidio",["9","#11","13"],[],["V7","I△7"],"La #11 es el rasgo del modo Lidio: color moderno sin perder la función."),
    mkF("I△7#11 — Tónica lidia","I","Tónica brillante","Lidio",["9","#11","13"],[],["estático"],"Tónica mayor con #11: más luminosa que el Jónico."),
  ],
  "7#11":[
    mkF("V7#11 — Dominante lidio","V","Lidio b7","Lidio b7",["9","#11","13"],[],["I","I△7"],"Dominante sin tensión de ♭9: usado en jazz moderno."),
    mkF("♭II7#11 — Sustituto tritonal","♭II","Tritonal con color lidio","Lidio b7",["9","#11","13"],[],["I△7"],"Sustituye al V7 con el bajo descendente por semitono."),
  ],
  "7b13":[
    mkF("V7b13 → I","V","Dominante con ♭13","Mixolidio b6",["9","b13"],["11"],["I","I m"],"El Mixolidio ♭6 es el 5º modo de la menor melódica: suena más oscuro que el Mixolidio."),
  ],
  "6":[
    mkF("I6 — Tónica con sexta","I","Cierre clásico y tanguero","Jónico",["9"],[],["estático"],"La 6ª reemplaza a la 7ª: tónica estable, sin la tensión de la sensible."),
    mkF("IV6 — Subdominante suave","IV","Color cálido","Lidio",["9","#11"],[],["V7","I"],"Sirve de preparación suave hacia el dominante."),
  ],
  m6:[
    mkF("I m6 — Tónica menor (melódica)","I","Tónica menor luminosa","Menor melódica",["9","11"],[],["estático"],"La 6ª mayor sobre la menor: sonido del tango y de la bossa."),
    mkF("IV m6 — Subdominante menor","IV","Prestado del modo menor","Dórico",["9","11"],[],["V7","I"],"Dórico: la 6ª natural da color luminoso al subdominante menor."),
  ],
  mMaj7:[
    mkF("I m△7 — Tónica menor armónica","I","Tónica con sensible","Menor armónica",["9","11"],[],["V7","IV m7"],"La 7ª mayor de la menor armónica da el color de 'cine negro' y de muchos tangos."),
    mkF("I m△7 — Cliché descendente","I","m△7 → m7 → m6","Menor melódica",["9","11"],[],["I m7","I m6"],"La nota superior (o el bajo) desciende por semitonos: 7ª mayor, 7ª menor, 6ª."),
  ],
});
HF.add9=HF.maj;
// Funciones derivadas: mismo papel que el acorde de 7ª, con el nombre del acorde real. El III m9/m11 no existe en tonalidad mayor (su 9ª queda fuera de la escala).
HF.min9 = HF.min7.filter(f=>f.degree!=="III").map(f=>({...f,fn:f.fn.replace("m7","m9")}));
HF.min11= HF.min7.filter(f=>f.degree!=="III").map(f=>({...f,fn:f.fn.replace("m7","m11")}));
HF.maj9 = HF.maj7.map(f=>({...f,fn:f.fn.replace("△7","△9")}));
HF.m7b5=[HF.m7b5[0],
  mkF("VIIø7 — Sensible (mayor)","VII","Séptimo grado de la escala mayor","Locrio",["11","b13"],["b9"],["I△7","III m7"],"Equivale a un V9 sin fundamental (Sol9 sin Sol = Siø7). Tiene las mismas notas que un Re m6."),
  HF.m7b5[1]];

export const getFns=(q)=>HF[q]||[{fn:"Acorde de color",degree:"?",key:"Uso libre / modal",mode:"Según contexto",modeIvs:MODES["Jónico"],tensions:["varía"],avoid:[],resolutions:["variable"],why:"Sin función tonal fija. Depende del contexto armónico."}];

// ─── VOICING REAL DE PIANO ────────────────────────────────────────────────────
// MI: tónica sola en bajo (oct 2)
// MD: 3ª + 7ª (guía-notas) en oct 4, extensiones en oct 5
export const buildVoicing=(root,quality)=>{
  const f=FORMULAS[quality]||FORMULAS["maj"];
  const ivs=f.intervals;
  const has=s=>ivs.some(i=>(i%12)===s%12);
  const has7=has(10)||has(11);
  const L=[];
  L.push({note:root,role:"Tónica (bajo)",oct:2});
  if(!has7&&has(7)) L.push({note:fromRoot(root,7,4),role:"Quinta",oct:2});
  if(has(6))        L.push({note:fromRoot(root,6,4),role:"5ª dim.",oct:2});
  if(has(8))        L.push({note:fromRoot(root,8,4),role:"5ª aum.",oct:2});
  const R=[];
  if(has(3))  R.push({note:fromRoot(root,3,2), role:"3ª menor",oct:4});
  if(has(4))  R.push({note:fromRoot(root,4,2), role:"3ª mayor",oct:4});
  if(has(10)) R.push({note:fromRoot(root,10,6),role:"7ª menor", oct:4});
  if(has(11)) R.push({note:fromRoot(root,11,6),role:"7ª mayor", oct:4});
  if(!has7&&has(7)) R.push({note:fromRoot(root,7,4),role:"Quinta",oct:4});
  const extL={1:"b9",2:"9ª",3:"#9",5:"11ª",6:"#11",8:"b13",9:"13ª"};
  ivs.filter(i=>i>11).forEach(i=>{
    const s=i%12;
    R.push({note:fromRoot(root,s),role:extL[s]||"ext.",oct:5});
  });
  return {L,R};
};

const CHORD_RULES=[
  [/^m7b5/,"m7b5"],[/^dim7|^o7/,"dim7"],[/^dim|^o(?![a-z])/,"dim"],
  [/^mmaj7|^mmaj/,"mMaj7"],
  [/^maj7#11/,"maj7#11"],[/^maj7#5|^maj7\+5|^maj7aug/,"maj7#5"],[/^maj9|^maj13/,"maj9"],[/^maj/,"maj7"],
  [/^m11/,"min11"],[/^m9/,"min9"],[/^m7/,"min7"],[/^m6/,"m6"],
  [/^7sus4?|^sus7/,"7sus4"],[/^7b5/,"7b5"],[/^7#5|^7\+|^7aug|^aug7/,"7#5"],
  [/^7b9/,"7b9"],[/^7#9/,"7#9"],[/^7alt|^alt/,"7alt"],[/^7#11/,"7#11"],[/^7b13/,"7b13"],
  [/^13/,"13"],[/^9/,"9"],[/^7/,"7"],
  [/^aug|^\+/,"aug"],[/^sus2/,"sus2"],[/^sus/,"sus4"],
  [/^6/,"6"],[/^add9|^add2|^2/,"add9"],[/^m/,"min"],
];

export const parseChord=(input)=>{
  try{
    const s=input.trim();
    const rm=s.match(/^([A-G][#b]?)/);if(!rm)return null;
    const root=rm[1];
    let rest=s.slice(root.length).replace(/\s/g,"");
    rest=rest.replace(/^M(?=7|9|13|aj)/,"maj");                     // "CM7" = mayor 7ª
    rest=rest.toLowerCase().replace(/[()]/g,"").replace(/[△∆δ]/g,"maj").replace(/ø7?/g,"m7b5").replace(/°/g,"dim")
             .replace(/^-/,"m").replace(/m7-5/,"m7b5").replace(/min/g,"m").replace(/major/g,"maj");
    let q="maj";
    for(const [re,quality] of CHORD_RULES){ if(re.test(rest)){ q=quality; break; } }
    const formula=FORMULAS[q]||FORMULAS["maj"];
    const notes=formula.intervals.map((i,k)=>fromRoot(root,i%12,formula.degs?formula.degs[k]:undefined));
    return{root,quality:q,notes,formula,raw:s};
  }catch(e){return null;}
};
