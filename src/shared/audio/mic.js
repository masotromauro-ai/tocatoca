// @motor
// Escucha por micrófono: estima la nota.

// ─── Escucha por micrófono: detector de varias notas por espectro, acotado a las notas que el teclado puede producir ───
export function micEstimar(mag,sr,N,cands,maxN){
  const binHz=sr/N, nb=mag.length;
  const res=Float32Array.from(mag);
  const win=(f)=>{ const k=f/binHz; return [Math.max(1,Math.floor(k*0.985-0.5)),Math.min(nb-2,Math.ceil(k*1.015+0.5))]; };
  const peak=(f)=>{ const [a,b]=win(f); let m=0; for(let i=a;i<=b;i++) if(res[i]>m) m=res[i]; return m; };
  let maxAll=0; for(let i=Math.floor(40/binHz);i<Math.min(nb,Math.floor(3000/binHz));i++) if(res[i]>maxAll) maxAll=res[i];
  if(maxAll<1e-3) return [];
  const W=[1,.7,.5,.35,.25,.18], salida=[]; let primero=0;
  const puntaje=new Map();
  const score=(m)=>{ const f=440*Math.pow(2,(m-69)/12); if(f<55||f>1800) return 0;
    const p=[]; for(let h=1;h<=6;h++){ p.push(f*h>4000?0:peak(f*h)); }
    let s=0; for(let h=0;h<6;h++) s+=W[h]*p[h];
    s*=Math.min(1,0.15+2.5*p[0]/Math.max(p[0],p[1],p[2],1e-9));   // la fundamental pesa, pero puede ser débil
    return s; };
  for(let it=0;it<maxN;it++){
    let best=null,bs=0; const sc=new Map();
    for(const m of cands){ if(salida.includes(m)) continue; const s=score(m); sc.set(m,s); if(s>bs){bs=s;best=m;} }
    if(best===null) break;
    // si la octava de abajo explica casi igual de bien, es esa (las lengüetas duplican la octava de arriba)
    const baja=best-12; if(cands.has(baja)){ const sb=sc.has(baja)?sc.get(baja):score(baja); if(sb>=0.8*bs){ best=baja; bs=sb; } }
    if(it===0){ if(bs<0.6*maxAll) break; primero=bs; } else if(bs<0.4*primero) break;
    salida.push(best);
    const f=440*Math.pow(2,(best-69)/12);
    for(let h=1;h<=8;h++){ if(f*h>4000) break; const [a,b]=win(f*h); for(let i=a;i<=b;i++) res[i]*=0.03; }
  }
  return salida.sort((a,b)=>a-b);
}

// ─── La escucha en su propio hilo (fase 7 de ARQUITECTURA.md, 17-nov-2026) ───────────────────────────────
// Hasta la fase 7 el espectro lo calculaba un AnalyserNode y la estimación corría en la pantalla, una vez por
// cuadro (requestAnimationFrame): si React estaba dibujando, la escucha esperaba. Ahora todo corre en un
// AudioWorklet, el hilo del audio. El espectro es EL MISMO que da el AnalyserNode (ventana de Blackman,
// |X|/N y el suavizado entre cuadros de la especificación de Web Audio), así que micEstimar recibe los mismos
// números y detecta igual. Las funciones de abajo no usan nada de afuera: se copian tal cual al worklet.

// FFT de base 2 en el lugar (re, im de largo N, potencia de 2).
export function fftEnLugar(re, im) {
  const N = re.length;
  for (let i = 1, j = 0; i < N; i++) {
    let b = N >> 1; for (; j & b; b >>= 1) j ^= b; j ^= b;
    if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
  }
  for (let len = 2; len <= N; len <<= 1) {
    const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang), mitad = len >> 1;
    for (let i = 0; i < N; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < mitad; k++) {
        const a = i + k, b = a + mitad;
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
        const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
      }
    }
  }
}

// El espectro de un AnalyserNode: ventana de Blackman, |X[k]|/N y X̂ = τ·X̂anterior + (1−τ)·|X|/N.
// Devuelve las magnitudes lineales (lo que micEstimar recibía de 10^(dB/20)).
export function espectroComoAnalizador(x, anterior, tau) {
  const N = x.length, re = new Float32Array(N), im = new Float32Array(N), a0 = 0.42, a1 = 0.5, a2 = 0.08;
  for (let n = 0; n < N; n++) re[n] = x[n] * (a0 - a1 * Math.cos(2 * Math.PI * n / N) + a2 * Math.cos(4 * Math.PI * n / N));
  fftEnLugar(re, im);
  const mag = new Float32Array(N / 2);
  for (let k = 0; k < N / 2; k++) {
    const m = Math.hypot(re[k], im[k]) / N;
    mag[k] = anterior ? tau * anterior[k] + (1 - tau) * m : m;
  }
  return mag;
}

// El procesador del worklet: junta las últimas N muestras y, cada `cada` segundos, manda lo que estimó.
// Recibe por su puerto las notas candidatas y cuántas buscar ({cands:[…], maxN}).
function procesadorEscucha() {
  class EscuchaBandoMaps extends AudioWorkletProcessor {
    constructor() {
      super();
      this.N = 16384; this.buf = new Float32Array(this.N); this.pos = 0; this.lleno = 0;
      this.cada = Math.round(sampleRate * 0.07); this.desde = 0; this.anterior = null;
      this.cands = new Set(); this.maxN = 1;
      this.port.onmessage = (e) => { const d = e.data || {}; if (Array.isArray(d.cands)) this.cands = new Set(d.cands); if (d.maxN) this.maxN = d.maxN; };
    }
    process(inputs) {
      const ch = inputs[0] && inputs[0][0];
      if (!ch) return true;
      for (let i = 0; i < ch.length; i++) { this.buf[this.pos] = ch[i]; this.pos = (this.pos + 1) % this.N; }
      this.lleno = Math.min(this.N, this.lleno + ch.length); this.desde += ch.length;
      if (this.lleno >= this.N && this.desde >= this.cada) {
        this.desde = 0;
        const x = new Float32Array(this.N);
        x.set(this.buf.subarray(this.pos)); x.set(this.buf.subarray(0, this.pos), this.N - this.pos);
        this.anterior = espectroComoAnalizador(x, this.anterior, 0.3);
        this.port.postMessage(micEstimar(this.anterior, sampleRate, this.N, this.cands, this.maxN));
      }
      return true;
    }
  }
  registerProcessor("escucha-bandomaps", EscuchaBandoMaps);
}

// El código del worklet, armado con las MISMAS funciones de este archivo (una sola copia de la lógica).
export function fuenteWorklet() {
  return [fftEnLugar, espectroComoAnalizador, micEstimar].map(String).join("\n") + "\n(" + String(procesadorEscucha) + ")();\n";
}
