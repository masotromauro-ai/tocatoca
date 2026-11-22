# Cose el bucle de cada muestra para que la nota sostenida suene CONTINUA: sin tic, sin bajón y sin escalón de volumen.
#
# Mientras la tecla está apretada la app repite loopStart–loopEnd. Para que esa repetición no se oiga:
#   1. Se empareja el volumen de la parte sostenida (desde 0,1 s): una envolvente lenta (ventanas de 120 ms) se lleva a la
#      mediana del bucle. El arranque queda como se grabó. El temblor rápido de las lengüetas (el batido) se conserva.
#   2. Se elige el final del bucle donde lo que suena ANTES del final se parece más a lo que suena ANTES del comienzo,
#      medido sobre todo el fundido (no sobre unos pocos períodos: si las dos ondas no coinciden en todo el tramo, se restan
#      y el volumen se hunde en cada vuelta — eso pasó con la primera versión de esto, el 22-nov-2026).
#   3. Se funden los últimos 150 ms del bucle con los 150 ms anteriores al comienzo (coseno), y el volumen del fundido se
#      corrige cada 5 ms para que no se hunda aunque las ondas no coincidan del todo.
# Al saltar del final al comienzo, la onda sigue exactamente donde iba.
#
# Uso (desde la raíz, necesita numpy):
#   python3 -I pruebas/coser-muestras.py <carpeta de ORIGINALES> <carpeta de salida (public/muestras)> <informe.json> [--aplicar]
# Los originales son las grabaciones sin coser (git show f50684e^:public/muestras/<archivo>): se cose siempre desde ellos,
# nunca sobre una muestra ya cosida. Sin --aplicar sólo informa.
import json, sys, wave, numpy as np

origen, destino, informe = sys.argv[1], sys.argv[2], sys.argv[3]
aplicar = "--aplicar" in sys.argv
idx = json.load(open(destino + "/indice.json"))

FUNDIDO = 0.150      # s
BUSCAR = 0.300       # s hacia atrás desde el final original
VENT = 0.120         # s, envolvente lenta para emparejar el volumen
DESDE = 0.100        # s, desde dónde se empareja (antes, el arranque tal cual)

def leer(c, a):
    w = wave.open(c + "/" + a); p = w.getparams()
    assert p.sampwidth == 2 and p.nchannels == 1, a
    return np.frombuffer(w.readframes(p.nframes), "<i2").astype(np.float64), p.framerate

def escribir(a, y, sr):
    w = wave.open(destino + "/" + a, "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes(np.clip(np.round(y), -32768, 32767).astype("<i2").tobytes()); w.close()

def envolvente(x, sr, vent):
    """RMS en ventanas de `vent` segundos, cada 5 ms, llevada a cada muestra."""
    h = int(0.005 * sr); n = int(vent * sr)
    centros = np.arange(0, len(x), h)
    c2 = np.concatenate([[0.0], np.cumsum(x * x)])
    lo = np.clip(centros - n // 2, 0, len(x)); hi = np.clip(centros + n // 2, 0, len(x))
    rms = np.sqrt((c2[hi] - c2[lo]) / np.maximum(hi - lo, 1))
    return np.interp(np.arange(len(x)), centros, rms)

def sostenida(y, s, e, vueltas=3):
    return np.concatenate([y[:e]] + [y[s:e]] * vueltas)

def medir(y, s, e, sr, f0):
    """Cómo suena sostenida: volumen alrededor de cada costura (±200 ms) contra la mediana del bucle, y el salto de la onda.
    La ventana es de 3 períodos (al menos 10 ms): más corta, en las notas graves el volumen «tiembla» sólo por la fase."""
    z = sostenida(y, s, e); h = max(int(0.01 * sr), int(3 * sr / f0))
    v = np.array([np.sqrt(np.mean(z[i:i + h] ** 2)) for i in range(int(DESDE * sr), len(z) - h, h // 2)])
    v = v / np.median(v)
    t = (int(DESDE * sr) + np.arange(len(v)) * (h // 2) + h // 2)
    costuras = [e + k * (e - s) for k in range(3)]
    cerca = np.array([min(abs(ti - c) for c in costuras) < 0.2 * sr for ti in t])
    v = v[cerca]
    seg = y[s:e]; d = np.abs(seg[2:] - 2 * seg[1:-1] + seg[:-2]); base = np.percentile(d, 99.9)
    p = np.concatenate([y[e - 3:e], y[s:s + 3]]); junta = np.abs(p[2:] - 2 * p[1:-1] + p[:-2]).max()
    return float(v.min()), float(v.max()), float(junta / base)

archivos = {}
for m in idx["muestras"]: archivos.setdefault(m["archivo"], []).append(m)

res = []
for a, ms in sorted(archivos.items()):
    m = ms[0]
    x, sr = leer(origen, a)
    s = int(round(m["loopStart"] * sr))
    # el final original: lo que dice el índice que viene con los originales
    mo = {o["archivo"]: o for o in json.load(open(origen + "/indice.json"))["muestras"]}[a]
    e0 = int(round(mo["loopEnd"] * sr))
    f0 = 440 * 2 ** ((m["midi_referencia"] - 69) / 12)
    antes = medir(x, s, e0, sr, f0)

    # 1) emparejar el volumen desde DESDE
    # dos pasadas: la de 120 ms saca las subidas y bajadas lentas, la de 60 ms los pozos cortos que deja (un apretón del fuelle)
    t = np.arange(len(x)) / sr
    paso = np.clip((t - DESDE / 2) / (DESDE / 2), 0, 1)          # de 0,05 a 0,1 s entra el emparejado
    y = x
    for vent in (VENT, VENT / 2):
        env = envolvente(y, sr, vent)
        meta = np.median(env[s:e0])
        g = np.clip(meta / np.maximum(env, 1e-9), 0.4, 2.5)
        y = y * (1 + paso * (g - 1))

    # 2) el mejor final: correlación sobre todo el fundido
    N = min(int(FUNDIDO * sr), s - 1)
    B = y[s - N:s]; nb = np.linalg.norm(B)
    mejor, me = -2.0, e0
    for c in range(max(s + 3 * N, s + int(0.55 * sr), e0 - int(BUSCAR * sr)), e0 + 1):   # el bucle nunca más corto que 0,55 s
        A = y[c - N:c]
        r = float(np.dot(A, B) / (np.linalg.norm(A) * nb + 1e-9))
        if r > mejor: mejor, me = r, c

    # 3) fundido con corrección de volumen
    A = y[me - N:me].copy()
    k = 0.5 - 0.5 * np.cos(np.pi * np.arange(N) / N)
    mezcla = (1 - k) * A + k * B
    eA, eB, eM = envolvente(A, sr, 0.02), envolvente(B, sr, 0.02), envolvente(mezcla, sr, 0.02)
    esperado = (1 - k) * eA + k * eB
    corr = np.clip(esperado / np.maximum(eM, 1e-9), 0.5, 3.0)
    y[me - N:me] = mezcla * corr

    despues = medir(y, s, me, sr, f0)
    res.append(dict(archivo=a, botones=[f'{o["mano"]}/{o["fuelle"]}/{o["boton"]}' for o in ms],
                    antes=dict(vol_min=round(antes[0], 2), vol_max=round(antes[1], 2), salto=round(antes[2], 1)),
                    despues=dict(vol_min=round(despues[0], 2), vol_max=round(despues[1], 2), salto=round(despues[2], 1)),
                    loopEnd=round(me / sr, 6), parecido=round(mejor, 3)))
    if aplicar:
        escribir(a, y, sr)
        for o in ms: o["loopEnd"] = round(me / sr, 6)

if aplicar:
    json.dump(idx, open(destino + "/indice.json", "w"), ensure_ascii=False, indent=1); open(destino + "/indice.json", "a").write("\n")
json.dump(res, open(informe, "w"), ensure_ascii=False, indent=1)
for r in res:
    print(f'{r["archivo"]:24s} volumen {r["antes"]["vol_min"]:.2f}–{r["antes"]["vol_max"]:.2f} → {r["despues"]["vol_min"]:.2f}–{r["despues"]["vol_max"]:.2f} · salto {r["antes"]["salto"]:5.1f} → {r["despues"]["salto"]:4.1f} · parecido {r["parecido"]:.3f}')
