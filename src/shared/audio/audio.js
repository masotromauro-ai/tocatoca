// @motor — el motor de sonido (Web Audio). Es lo único de shared/ que puede usar window.

import { LAT, noteIdx } from "../teoria/notas.js";

// ─── AUDIO ────────────────────────────────────────────────────────────────────
let _ctx=null;

export const getCtx=()=>{if(!_ctx)try{_ctx=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}return _ctx;};

// ─── MUESTRAS REALES (el bandoneón del profesor) ──────────────────────────────
// Los .wav viven en public/muestras/ con un indice.json que dice, para cada BOTÓN del teclado (R01, L01…) y fuelle,
// qué muestra le toca y qué tramo se repite para sostenerla. Se busca por botón y no por el nombre de la octava,
// así no importa cómo tenga guardadas las octavas cada teclado. Si a una nota todavía le falta la muestra (o no terminó de cargar),
// suena el sintetizador de siempre: agregar muestras nunca rompe nada.
const BASE=(import.meta.env&&import.meta.env.BASE_URL)||"/";
const _muestras=new Map();   // "mano|fuelle|botón" → {buf, loopStart, loopEnd, pc}
let _carga=null;

export const claveMuestra=(mano,fuelle,boton)=>mano+"|"+fuelle+"|"+boton;
export const buscarMuestra=(mano,fuelle,boton)=>_muestras.get(claveMuestra(mano,fuelle,boton))||null;
// Control de seguridad: la muestra sólo vale si el botón sigue siendo la misma nota (pc 0–11) que cuando se grabó
export const muestraVale=(m,midi)=>!!m&&m.pc===((midi%12)+12)%12;

// ─── TIMBRES: con qué sonido toca la app una nota cuando sólo se sabe su altura (entrenador, acordes, recorridos…) ───
// «bandoneon» = las muestras reales; «sintetizador» = el sonido electrónico de antes. Para sumar un timbre nuevo (violín, piano)
// se agrega su id en TIMBRES y su banco en _bancos, y se llena en precargarMuestras().
export const TIMBRES=["bandoneon","sintetizador"];
let _timbre="bandoneon";
export const setTimbre=(t)=>{if(TIMBRES.includes(t))_timbre=t;};
export const getTimbre=()=>_timbre;

// El bandoneón grabado suena una octava más agudo que como lo escribe el teclado de BandoMaps (el botón La2 suena como el La3
// del video). Todo lo que se toca por altura suena en altura real, igual que los botones. Con 0 suena tal cual está escrito.
export const OCTAVA_REAL=12;
// Cuántos semitonos se permite estirar una muestra para llegar a otra nota; más allá suena el sintetizador.
export const MAX_TRANSPOSICION=7;
const _bancos={bandoneon:new Map()};   // timbre → Map(altura real, Do4=60 → muestra)

// Pura: elige la muestra más cercana a la altura pedida (midi como la escribe el teclado) y cuánto estirarla, o null.
export function elegirMuestraPorAltura(banco,midi,octavaReal=OCTAVA_REAL,maxSemis=MAX_TRANSPOSICION){
  if(!banco||!banco.size)return null;
  const real=midi+octavaReal;let mejor=null,dist=Infinity;
  for(const k of banco.keys()){const d=Math.abs(real-k);if(d<dist||(d===dist&&k<mejor)){dist=d;mejor=k;}}
  if(mejor===null||dist>maxSemis)return null;
  const m=banco.get(mejor);
  return {...m,rate:(m.rate||1)*Math.pow(2,(real-mejor)/12)};
}
export const muestraPorAltura=(midi)=>elegirMuestraPorAltura(_bancos[_timbre],midi);
// Cuánto se sube el sintetizador de reserva para que suene en la misma altura que las muestras
export const desfaseTimbre=()=>_timbre==="bandoneon"?OCTAVA_REAL:0;

// Baja y decodifica todas las muestras una sola vez (la primera llamada). Nunca lanza error.
export function precargarMuestras(){
  if(_carga)return _carga;
  _carga=(async()=>{
    try{
      const ctx=getCtx();if(!ctx||typeof fetch==="undefined"){_carga=null;return;}
      const idx=await (await fetch(BASE+"muestras/indice.json")).json();
      const bufs=new Map();   // archivo → audio decodificado (varios botones pueden compartir el mismo archivo)
      const bajar=(a)=>{ if(!bufs.has(a))bufs.set(a,fetch(BASE+"muestras/"+a).then(r=>r.arrayBuffer()).then(ab=>ctx.decodeAudioData(ab))); return bufs.get(a); };
      await Promise.all((idx.muestras||[]).map(async m=>{
        try{
          const buf=await bajar(m.archivo);
          _muestras.set(claveMuestra(m.mano,m.fuelle,m.boton),{buf,loopStart:m.loopStart,loopEnd:m.loopEnd,pc:m.pc,rate:m.velocidad||1});
          // Banco por altura: las muestras de abriendo, tal como se grabaron (sin estirar), para tocar cualquier nota.
          // Donde hay las dos manos manda la derecha; la izquierda completa lo grave.
          if(m.fuelle==="abre"&&!m.velocidad&&typeof m.midi_referencia==="number"&&(m.mano==="der"||!_bancos.bandoneon.has(m.midi_referencia)))
            _bancos.bandoneon.set(m.midi_referencia,{buf,loopStart:m.loopStart,loopEnd:m.loopEnd,pc:m.pc,rate:1});
        }catch(e){}
      }));
    }catch(e){_carga=null;}   // si falló, la próxima vez reintenta; mientras tanto suena el sintetizador
  })();
  return _carga;
}

// Fuente de audio lista para una muestra: se repite el tramo del bucle hasta que alguien la detenga.
export function fuenteMuestra(ctx,m,t0=0){
  const src=ctx.createBufferSource();src.buffer=m.buf;
  if(m.rate&&m.rate!==1)src.playbackRate.value=m.rate;   // velocidad 0.5 = una octava más grave
  if(m.loopEnd>m.loopStart){src.loop=true;src.loopStart=m.loopStart;src.loopEnd=m.loopEnd;}
  src.start(t0);return src;
}

const VOL_NOTA=0.7;   // volumen de una nota suelta por altura (deja margen para acordes de 4 o 5 notas)

// Toca una muestra con la duración pedida: entra rápido, se sostiene y se apaga sin clic
function tocarMuestraDur(ctx,m,d,at,dest,vol){
  if(ctx.state==="suspended")ctx.resume();
  const t0=ctx.currentTime+at, gain=ctx.createGain();
  gain.gain.setValueAtTime(0.0001,t0);
  gain.gain.linearRampToValueAtTime(vol,t0+0.015);
  gain.gain.setValueAtTime(vol,t0+Math.max(0.03,d-0.05));
  gain.gain.exponentialRampToValueAtTime(0.001,t0+d+0.06);
  gain.connect(dest||ctx.destination);
  const src=fuenteMuestra(ctx,m,t0);src.connect(gain);src.stop(t0+d+0.08);
}

// Toca la nota (midi como la escribe el teclado) con el timbre elegido. Devuelve true si sonó una muestra; si no, suena el sintetizador.
function tocarPorAltura(midi,d,at,dest){
  try{
    const ctx=getCtx();if(!ctx)return false;
    const m=muestraPorAltura(midi);if(!m)return false;
    tocarMuestraDur(ctx,m,d,at,dest,VOL_NOTA);return true;
  }catch(e){return false;}
}

const MIDI={C:60,"C#":61,"Db":61,D:62,"D#":63,"Eb":63,E:64,F:65,"F#":66,"Gb":66,G:67,"G#":68,"Ab":68,A:69,"A#":70,"Bb":70,B:71};

export const playTone=(note,octave=4,dur=0.7)=>{
  try{
    const ctx=getCtx();if(!ctx)return;
    if(ctx.state==="suspended")ctx.resume();
    const midi0=(noteIdx(note)>=0?60+noteIdx(note):60)+(octave-4)*12;
    if(tocarPorAltura(midi0,dur,0,null))return;
    const freq=440*Math.pow(2,(midi0+desfaseTimbre()-69)/12);
    const osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.connect(gain);gain.connect(ctx.destination);
    osc.type="triangle";osc.frequency.value=freq;
    gain.gain.setValueAtTime(0.22,ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur);
    osc.start();osc.stop(ctx.currentTime+dur);
  }catch(e){}
};

export const playBand=(noteLat,octave)=>{
  const eng=LAT[noteLat]||noteLat;
  if(tocarPorAltura((noteIdx(eng)>=0?60+noteIdx(eng):60)+(octave-4)*12,1.0,0,null))return;
  [1,2,3].forEach((h,i)=>{
    try{
      const ctx=getCtx();if(!ctx)return;
      if(ctx.state==="suspended")ctx.resume();
      const midi=(noteIdx(eng)>=0?60+noteIdx(eng):60)+(octave-4)*12+desfaseTimbre();
      const freq=440*Math.pow(2,(midi-69)/12)*h;
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.connect(gain);gain.connect(ctx.destination);
      osc.type="sawtooth";osc.frequency.value=freq;
      const v=[0.22,0.10,0.05][i];
      gain.gain.setValueAtTime(v,ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+1.0);
      osc.start();osc.stop(ctx.currentTime+1.0);
    }catch(e){}
  });
};

// Nota de bandoneón con duración controlada (para escuchar recorridos con una figura y una velocidad)
// «origen» ({mano:"izq"|"der", fuelle:"abre"|"cierra", boton:"R05"}) es opcional: si viene y el botón tiene muestra real, suena esa.
export const playBandDur=(noteLat,octave,dur,at=0,dest=null,origen=null)=>{
  const eng=LAT[noteLat]||noteLat, d=Math.max(0.08,dur);
  if(origen){
    try{
      const ctx=getCtx();
      const midi=(noteIdx(eng)>=0?60+noteIdx(eng):60)+(octave-4)*12;
      const m=ctx&&buscarMuestra(origen.mano,origen.fuelle,origen.boton);
      if(m&&muestraVale(m,midi)){tocarMuestraDur(ctx,m,d,at,dest,1);return;}
    }catch(e){}
  }
  if(tocarPorAltura((noteIdx(eng)>=0?60+noteIdx(eng):60)+(octave-4)*12,d,at,dest))return;
  [1,2,3].forEach((h,i)=>{
    try{
      const ctx=getCtx();if(!ctx)return;
      if(ctx.state==="suspended")ctx.resume();
      const midi=(noteIdx(eng)>=0?60+noteIdx(eng):60)+(octave-4)*12+desfaseTimbre();
      const freq=440*Math.pow(2,(midi-69)/12)*h, t0=ctx.currentTime+at, v=[0.22,0.10,0.05][i];
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.connect(gain);gain.connect(dest||ctx.destination);
      osc.type="sawtooth";osc.frequency.value=freq;
      gain.gain.setValueAtTime(0.0001,t0);
      gain.gain.linearRampToValueAtTime(v,t0+0.015);
      gain.gain.setValueAtTime(v*0.85,t0+Math.max(0.03,d-0.05));
      gain.gain.exponentialRampToValueAtTime(0.001,t0+d+0.04);
      osc.start(t0);osc.stop(t0+d+0.06);
    }catch(e){}
  });
};

// Clic de metrónomo (acento más agudo en el primer tiempo)
export const playClick=(at=0,acc=false,dest=null)=>{
  try{
    const ctx=getCtx();if(!ctx)return;
    if(ctx.state==="suspended")ctx.resume();
    const t0=ctx.currentTime+at,o=ctx.createOscillator(),g=ctx.createGain();
    o.type="square";o.frequency.value=acc?1700:1150;
    g.gain.setValueAtTime(0.0001,t0);g.gain.linearRampToValueAtTime(acc?0.32:0.2,t0+0.002);g.gain.exponentialRampToValueAtTime(0.001,t0+0.05);
    o.connect(g);g.connect(dest||ctx.destination);o.start(t0);o.stop(t0+0.07);
  }catch(e){}
};

export const playChord=(notes)=>notes.forEach((n,i)=>setTimeout(()=>playTone(n,4,1.2),i*20));

// La descarga de las muestras arranca sola, en segundo plano, poco después de abrir la app (así la primera nota ya suena real)
if(typeof window!=="undefined")setTimeout(precargarMuestras,2000);
