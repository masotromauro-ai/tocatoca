# Cose el bucle de cada muestra: elige el final del bucle que más se parece al comienzo (±3 períodos) y funde los últimos
# N ms del bucle con lo que viene justo antes del comienzo, así al saltar del final al comienzo la onda sigue sin corte.
# Uso (desde la raíz, necesita numpy): python3 -I pruebas/coser-muestras.py public/muestras <informe.json> [--aplicar]   (sin --aplicar sólo informa)
import json, sys, wave, numpy as np

carpeta, informe = sys.argv[1], sys.argv[2]
aplicar = "--aplicar" in sys.argv
ruta_idx = carpeta + "/indice.json"
idx = json.load(open(ruta_idx))

def leer(a):
    w = wave.open(carpeta + "/" + a); p = w.getparams()
    assert p.sampwidth == 2 and p.nchannels == 1, a
    return np.frombuffer(w.readframes(p.nframes), "<i2").astype(np.float64), p.framerate

def escribir(a, y, sr):
    w = wave.open(carpeta + "/" + a, "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes(np.clip(np.round(y), -32768, 32767).astype("<i2").tobytes()); w.close()

def costura(x, s, e, sr):
    """Qué tan fuerte es el salto al volver del final (e) al comienzo (s), contra lo normal dentro del bucle."""
    seg = x[s:e]; d = np.abs(seg[2:] - 2 * seg[1:-1] + seg[:-2]); base = np.percentile(d, 99.9)
    pegado = np.concatenate([x[e - 3:e], x[s:s + 3]])
    junta = np.abs(pegado[2:] - 2 * pegado[1:-1] + pegado[:-2]).max()
    w = int(0.02 * sr); nivel = 20 * np.log10(np.sqrt(np.mean(x[e - w:e] ** 2)) / np.sqrt(np.mean(x[s:s + w] ** 2)))
    return float(junta / base), float(nivel)

archivos = {}
for m in idx["muestras"]: archivos.setdefault(m["archivo"], []).append(m)

res = []
for a, ms in sorted(archivos.items()):
    m = ms[0]
    assert all(abs(o["loopStart"] - m["loopStart"]) < 1e-9 and abs(o["loopEnd"] - m["loopEnd"]) < 1e-9 for o in ms), a
    x, sr = leer(a)
    s = int(round(m["loopStart"] * sr)); e = int(round(m["loopEnd"] * sr))
    antes = costura(x, s, e, sr)
    f0 = 440 * 2 ** ((m["midi_referencia"] - 69) / 12) * 2 ** (m.get("centesimas", 0) / 1200)
    P = sr / f0
    # el final que más se parece al comienzo: correlación de 4 períodos antes de cada punto
    W = int(round(4 * P)); mejor, me = -2, e
    for c in range(e - int(3 * P), min(e + int(3 * P), len(x) - 1) + 1):
        a1 = x[c - W:c]; b1 = x[s - W:s]
        r = float(np.dot(a1, b1) / (np.linalg.norm(a1) * np.linalg.norm(b1) + 1e-9))
        if r > mejor: mejor, me = r, c
    # fundido: 40 ms o 6 períodos, lo que sea más largo, y nunca más que lo que hay antes del comienzo
    N = min(max(int(0.04 * sr), int(round(6 * P))), s - 1, (me - s) // 3)
    y = x.copy()
    t = np.arange(N) / N
    g = 0.5 - 0.5 * np.cos(np.pi * t)           # de 0 a 1, suave
    y[me - N:me] = (1 - g) * x[me - N:me] + g * x[s - N:s]
    despues = costura(y, s, me, sr)
    res.append(dict(archivo=a, botones=[f'{o["mano"]}/{o["fuelle"]}/{o["boton"]}' for o in ms],
                    salto_antes=round(antes[0], 1), nivel_antes=round(antes[1], 2),
                    salto_despues=round(despues[0], 1), nivel_despues=round(despues[1], 2),
                    loopEnd_antes=m["loopEnd"], loopEnd_nuevo=round(me / sr, 6), parecido=round(mejor, 3), fundido_ms=round(N / sr * 1000, 1)))
    if aplicar:
        escribir(a, y, sr)
        for o in ms: o["loopEnd"] = round(me / sr, 6)

if aplicar:
    json.dump(idx, open(ruta_idx, "w"), ensure_ascii=False, indent=1); open(ruta_idx, "a").write("\n")
json.dump(res, open(informe, "w"), ensure_ascii=False, indent=1)
for r in res:
    print(f'{r["archivo"]:24s} salto {r["salto_antes"]:5.1f} → {r["salto_despues"]:4.1f} · nivel {r["nivel_antes"]:+.2f} → {r["nivel_despues"]:+.2f} dB · parecido {r["parecido"]:.3f} · fundido {r["fundido_ms"]} ms')
