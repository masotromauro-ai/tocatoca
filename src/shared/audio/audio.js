// @motor — el motor de sonido (Web Audio). Es lo único de shared/ que puede usar window.

import { LAT, noteIdx } from "../teoria/notas.js";

// ─── AUDIO ────────────────────────────────────────────────────────────────────
let _ctx=null;

export const getCtx=()=>{if(!_ctx)try{_ctx=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}return _ctx;};

const MIDI={C:60,"C#":61,"Db":61,D:62,"D#":63,"Eb":63,E:64,F:65,"F#":66,"Gb":66,G:67,"G#":68,"Ab":68,A:69,"A#":70,"Bb":70,B:71};

export const playTone=(note,octave=4,dur=0.7)=>{
  try{
    const ctx=getCtx();if(!ctx)return;
    if(ctx.state==="suspended")ctx.resume();
    const midi=(noteIdx(note)>=0?60+noteIdx(note):60)+(octave-4)*12;
    const freq=440*Math.pow(2,(midi-69)/12);
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
  [1,2,3].forEach((h,i)=>{
    try{
      const ctx=getCtx();if(!ctx)return;
      if(ctx.state==="suspended")ctx.resume();
      const midi=(noteIdx(eng)>=0?60+noteIdx(eng):60)+(octave-4)*12;
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
export const playBandDur=(noteLat,octave,dur,at=0,dest=null)=>{
  const eng=LAT[noteLat]||noteLat, d=Math.max(0.08,dur);
  [1,2,3].forEach((h,i)=>{
    try{
      const ctx=getCtx();if(!ctx)return;
      if(ctx.state==="suspended")ctx.resume();
      const midi=(noteIdx(eng)>=0?60+noteIdx(eng):60)+(octave-4)*12;
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
