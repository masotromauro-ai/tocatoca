# Cose el bucle de cada muestra para que la nota sostenida suene CONTINUA: sin tic, sin bajón, sin cambio de color y sin
# que se desafine al dar la vuelta.
#
# Mientras la tecla está apretada la app repite loopStart–loopEnd. Lo que aprendimos el 22-nov-2026 (Mauro lo oyó cada vez):
#   · v1 (f50684e): el «tic» era la onda que saltaba en la costura → se fundió el final con el comienzo.
#   · v2 (647905f): ese fundido restaba dos ondas que no coincidían y el VOLUMEN se hundía → se emparejó el volumen.
#   · v3 (ésta): igual quedaba «una caída y una subida»: el COLOR. El tramo arrancaba a los 0,35 s, cuando el timbre todavía no
#     se había asentado, y además los armónicos altos laten solos (las lengüetas del bandoneón: un ciclo lento, ~0,8 s en RE♯2).
#     En cada vuelta el sonido saltaba de un estado a otro: el 5.º armónico de SOL♯4 caía 11 dB de golpe; en RE♯2 el 6.º
#     pasaba de −9 a 0 dB y la altura se hundía 20 cents en el fundido.
# Cómo cose ahora:
#   1. Empareja el COLOR y el volumen de la parte sostenida (desde 0,1 s; el arranque queda como se grabó): cada frecuencia
#      se lleva a su nivel típico con ganancias lentas (200 ms), y después el volumen (dos pasadas, 120 y 60 ms). La nota
#      sostenida queda pareja, como pidió Mauro («constante, sin ningún tipo de interrupción»): sin el fuelle que afloja ni el
#      latido lento de los armónicos altos, que eran lo que hacía notar la vuelta.
#   2. Elige el COMIENZO y el FINAL del tramo juntos: donde el sonido está en el mismo estado (el nivel de cada armónico, del 1
#      al 10, pesado por cuánto suena), mirando 90 ms a cada lado. Así el latido de los armónicos empalma con su mismo momento.
#   3. De los 60 mejores por estado, elige el que además tiene la ONDA igual (mirando la fundamental y los primeros armónicos),
#      afina el final (±1,5 períodos) y funde 60 períodos (entre 80 y 300 ms) con el nivel corregido frecuencia por frecuencia.
#   4. Nivela: lleva el volumen PERCIBIDO del tramo (curva A del oído y el corte de un parlante de teléfono) a NIVEL, el
#      mismo para todas: así los graves no quedan bajos.
# Y lo mide como suena en la app (arranque y cuatro vueltas): volumen, el cambio de color de 20 en 20 ms y la altura,
# alrededor de cada costura contra el resto de la nota.
#
# Uso (desde la raíz del repositorio, necesita Python 3 con numpy; nada más):
#   python3 -I pruebas/coser-muestras.py                         informa de las 71 (no cambia nada)
#   python3 -I pruebas/coser-muestras.py --solo <archivo.wav>    informa de UNA
#   python3 -I pruebas/coser-muestras.py --solo <archivo.wav> --aplicar
#        cose esa una: escribe public/muestras/<archivo.wav> y su loopStart/loopEnd (y duracion/centesimas si faltan)
#        en public/muestras/indice.json. Sin --aplicar no escribe nada.
#   Opcionales: --originales <carpeta> (public/muestras-originales) · --destino <carpeta> (public/muestras) · --informe <x.json>
# Se cose SIEMPRE desde la grabación original (public/muestras-originales/<archivo>), nunca sobre una ya cosida.
# Una nota nueva: su grabación va a public/muestras-originales/ y su ficha a public/muestras/indice.json (ver MUESTRAS.md):
# lo que falte de la ficha (duracion, centesimas, loopStart, loopEnd) lo calcula esto.
import json, sys, wave, numpy as np

def opcion(nombre, defecto=None):
    return sys.argv[sys.argv.index(nombre) + 1] if nombre in sys.argv else defecto

origen = opcion("--originales", "public/muestras-originales")
destino = opcion("--destino", "public/muestras")
informe = opcion("--informe")
solo = opcion("--solo")
aplicar = "--aplicar" in sys.argv
idx = json.load(open(destino + "/indice.json"))
orig = {o["archivo"]: o for o in json.load(open(origen + "/indice.json"))["muestras"]}

FUNDIDO = 0.080      # s, como mínimo (ver el fundido, abajo)
DESDE = 0.100        # s: desde dónde se empareja el volumen (antes, el arranque tal cual)
COMIENZO = (0.30, 0.80)   # s: dónde puede empezar el tramo
LARGO_MIN = 0.55     # s: un tramo más corto se oye como zumbido
COLA = 0.09          # s: lo último de la grabación es un fundido de salida, no se usa
PASO = 0.010         # s: resolución del perfil de armónicos
ARM = 10             # armónicos que se miran
NIVEL = -21.0        # dB: el volumen percibido al que se llevan TODAS las notas (nivel_percibido del tramo que se repite).
                     # 22-nov-2026, Mauro: «algunas, sobre todo los bajos, suenan con muy poco volumen». Entre la más baja y la
                     # más alta había 11 dB (SOL♯1, L01, −6,8; SI5, R01, +4,3). −21 queda apenas abajo de la mediana: ningún
                     # pico pasa del 80 %.

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

def perfil(y, sr, f0):
    """Cada PASO s: el nivel (dB) de los armónicos 1..ARM y la altura fina (Hz). El tiempo es el centro de la ventana."""
    N = 8192 if f0 < 110 else 4096
    win = np.hanning(N); hop = int(PASO * sr); df = sr / N
    t, P, F = [], [], []
    for i in range(0, len(y) - N, hop):
        X = np.abs(np.fft.rfft(y[i:i + N] * win)) + 1e-9
        k0 = int(round(f0 / df)); k = k0 - 3 + int(np.argmax(X[k0 - 3:k0 + 4]))
        a, b, c = np.log(X[k - 1]), np.log(X[k]), np.log(X[k + 1])
        f = (k + 0.5 * (a - c) / (a - 2 * b + c)) * df
        niv = []
        for h in range(1, ARM + 1):
            kk = int(round(h * f / df))
            niv.append(20 * np.log10(X[max(kk - 2, 1):kk + 3].max()) if kk + 3 < len(X) else -200.0)
        t.append((i + N / 2) / sr); P.append(niv); F.append(f)
    return np.array(t), np.array(P), np.array(F)

def pesos(P):
    lin = 10 ** (np.median(P, axis=0) / 20)
    return lin / lin.sum()

def distancia(Pa, Pb, w):
    return float(np.sum(w * np.clip(np.abs(Pa - Pb), 0, 15), axis=-1).mean())

def sostenida(y, s, e, vueltas=4):
    return np.concatenate([y[:e]] + [y[s:e]] * vueltas)

def medir(y, s, e, sr, f0):
    """Como suena en la app. Alrededor de cada costura (±150 ms) contra el resto de la parte sostenida:
    volumen (mín/máx, ventanas de 3 períodos), cambio de color de 20 ms en 20 ms (dB pesados) y altura (cents)."""
    z = sostenida(y, s, e)
    costuras = np.array([e + k * (e - s) for k in range(4)]) / sr
    h = max(int(0.01 * sr), int(3 * sr / f0))
    tv = np.arange(int(DESDE * sr), len(z) - h, h // 2)
    v = np.array([np.sqrt(np.mean(z[i:i + h] ** 2)) for i in tv]); v = v / np.median(v)
    cerca_v = np.array([np.min(np.abs(costuras - (i + h / 2) / sr)) < 0.15 for i in tv])
    t, P, F = perfil(z, sr, f0)
    w = pesos(P[t > 0.4])
    salto = np.sum(w * np.clip(np.abs(P[2:] - P[:-2]), 0, 15), axis=1)     # 20 ms
    ts = t[1:-1]
    sost = ts > max(0.4, s / sr)
    cerca = np.array([np.min(np.abs(costuras - q)) < 0.15 for q in ts]) & sost
    cents = 1200 * np.log2(F / np.median(F[t > 0.4]))
    cerca_f = np.array([np.min(np.abs(costuras - q)) < 0.15 for q in t]) & (t > 0.4)
    lejos_f = (~cerca_f) & (t > 0.4)
    return dict(vol_min=round(float(v[cerca_v].min()), 2), vol_max=round(float(v[cerca_v].max()), 2),
                color_costura=round(float(salto[cerca].max()), 2), color_resto=round(float(np.percentile(salto[sost & ~cerca], 99)), 2),
                altura_costura=round(float(np.abs(cents[cerca_f]).max()), 1), altura_resto=round(float(np.percentile(np.abs(cents[lejos_f]), 99)), 1))

def emparejar_volumen(x, sr, s, e):
    t = np.arange(len(x)) / sr
    paso = np.clip((t - DESDE / 2) / (DESDE / 2), 0, 1)          # de 0,05 a 0,1 s entra el emparejado
    y = x
    for vent in (0.120, 0.060):                                  # lo lento y después los pozos cortos (un apretón del fuelle)
        env = envolvente(y, sr, vent)
        meta = np.median(env[s:e])
        g = np.clip(meta / np.maximum(env, 1e-9), 0.4, 2.5)
        y = y * (1 + paso * (g - 1))
    return y

def emparejar_color(x, sr, s, e):
    """Lleva cada frecuencia a su nivel típico de la parte sostenida (STFT, ventanas de ~93 ms), con ganancias que cambian
    despacio (promedio de 200 ms y de 5 bandas vecinas): saca el cambio lento de color (el fuelle que afloja, el latido lento
    de los armónicos altos) sin tocar la onda. Entra de a poco entre 0,05 y 0,1 s: el arranque queda como se grabó."""
    N = 4096; hop = N // 4; win = np.hanning(N)
    pad = np.concatenate([np.zeros(N), x, np.zeros(N)])
    marcos = range(0, len(pad) - N, hop)
    S = np.array([np.fft.rfft(pad[i:i + N] * win) for i in marcos])
    M = np.abs(S) + 1e-9
    k = max(1, int(round(0.2 / (hop / sr))))
    nucleo = np.ones(k) / k
    lento = np.apply_along_axis(lambda c: np.convolve(c, nucleo, mode="same"), 0, M)
    lento = np.apply_along_axis(lambda f: np.convolve(f, np.ones(5) / 5, mode="same"), 1, lento)
    tc = (np.array(list(marcos)) + N / 2 - N) / sr
    zona = (tc * sr >= s) & (tc * sr <= e)
    tipico = np.median(lento[zona], axis=0)
    g = np.clip(tipico / lento, 0.5, 2.0)
    entra = np.clip((tc - DESDE / 2) / (DESDE / 2), 0, 1)[:, None]
    S = S * (1 + entra * (g - 1))
    y = np.zeros(len(pad)); norma = np.zeros(len(pad))
    for n, i in enumerate(marcos):
        y[i:i + N] += np.fft.irfft(S[n], N) * win; norma[i:i + N] += win * win
    y = y / np.maximum(norma, 1e-9)
    return y[N:N + len(x)]

def mezcla_pareja(A, B, k):
    """El fundido de A hacia B, corregido FRECUENCIA POR FRECUENCIA: en cada instante cada frecuencia tiene el nivel que cae
    entre el de A y el de B. Sumar dos ondas que no están en fase hunde algunos armónicos aunque el volumen total esté bien
    (FA♯3, der-66: el 3.º, 4.º y 5.º caían 8 a 11 dB en el fundido); corregir sólo el volumen no lo veía."""
    n = 1024; hop = n // 4; win = np.hanning(n)
    M0 = (1 - k) * A + k * B
    pad = lambda v: np.concatenate([np.zeros(n), v, np.zeros(n)])
    pa, pb, pm, pk = pad(A), pad(B), pad(M0), np.concatenate([np.zeros(n), k, np.ones(n)])
    out = np.zeros(len(pm)); norma = np.zeros(len(pm))
    for i in range(0, len(pm) - n, hop):
        SA, SB, SM = (np.fft.rfft(v[i:i + n] * win) for v in (pa, pb, pm))
        kk = pk[i + n // 2]
        meta = (1 - kk) * np.abs(SA) + kk * np.abs(SB)
        g = np.clip(meta / (np.abs(SM) + 1e-9), 0.25, 4.0)
        g = np.convolve(g, np.ones(3) / 3, mode="same")
        out[i:i + n] += np.fft.irfft(SM * g, n) * win; norma[i:i + n] += win * win
    out = out / np.maximum(norma, 1e-9)
    return out[n:n + len(A)]

def nivel_percibido(seg, sr):
    """Cuánto suena un tramo para el oído, por el parlante de un teléfono (dB): la energía pesada con la curva A (el oído) y
    un corte de 4.º orden en 250 Hz (lo que un parlante chico no da). Ventana de Hann, sin depender del largo del tramo.
    La MISMA cuenta está en pruebas/muestras.mjs (nivelPercibido): si cambia una, cambia la otra."""
    n = 1 << int(np.ceil(np.log2(len(seg))))
    w = np.hanning(len(seg))
    X = np.fft.rfft(seg / 32768 * w, n); f = np.fft.rfftfreq(n, 1 / sr)
    f2 = f * f
    ra = (12194 ** 2 * f2 ** 2) / ((f2 + 20.6 ** 2) * np.sqrt((f2 + 107.7 ** 2) * (f2 + 737.9 ** 2)) * (f2 + 12194 ** 2)) * 10 ** (2.0 / 20)
    parl = 1 / np.sqrt(1 + (250.0 / np.maximum(f, 1e-9)) ** 8)
    P = np.abs(X) ** 2 * (ra * parl) ** 2
    P[1:-1] *= 2
    return float(10 * np.log10(P.sum() / (n * np.sum(w * w)) + 1e-20))

def coser(x, sr, s0, f0, con_color):
    fin_util = len(x) - int(COLA * sr)
    y = emparejar_color(x, sr, int(COMIENZO[0] * sr), fin_util) if con_color else x
    y = emparejar_volumen(y, sr, s0, fin_util)

    # 2) comienzo y final juntos, por el estado del sonido
    t, P, F = perfil(y, sr, f0)
    f0 = float(np.median(F[t > 0.4]))                            # la altura medida manda sobre la nominal
    t, P, F = perfil(y, sr, f0)
    w = pesos(P[(t > COMIENZO[0]) & (t < fin_util / sr)])
    K = int(round(0.09 / PASO))
    # el fundido: 80 ms o 30 períodos, lo que sea más largo (en las graves, un desfase chico en un fundido corto mueve mucho la
    # altura: medio período de diferencia en 80 ms a 92 Hz son ~100 cents por un instante; repartido en 60 períodos no se oye; con 30 todavía se notaba en SI2, izq-59)
    N = int(min(max(FUNDIDO, 60 / f0), 0.30) * sr)
    # para elegir la costura se mira la onda sin lo agudo (la fundamental y los primeros armónicos: lo que el oído toma por altura)
    grave = np.fft.irfft(np.fft.rfft(y) * (np.fft.rfftfreq(len(y), 1 / sr) < 4.5 * f0), len(y))
    cand = []
    for i in range(len(t)):
        ts_ = t[i]
        if not (COMIENZO[0] <= ts_ <= COMIENZO[1]) or i - K < 0 or ts_ * sr - N < 1: continue
        if (len(y) - ts_ * sr) < 0: continue
        for j in range(i + 1, len(t)):
            te = t[j]
            if te - ts_ < LARGO_MIN: continue
            if te * sr > fin_util - 2 * sr / f0 or j + K >= len(t): break
            cand.append((distancia(P[i - K:i + K + 1], P[j - K:j + K + 1], w), i, j))
    cand.sort()
    # 3) de los mejores por estado, el que además tiene la ONDA igual: se afina el final (±1,5 períodos) y se mide la
    #    coincidencia de lo que suena antes del final con lo que suena antes del comienzo (en las graves la forma de la onda
    #    cambia mucho: con el estado solo, fundir dos ondas distintas hacía temblar la altura en la costura)
    per = sr / f0; elegido = None; usados = []
    for d, i, j in cand:
        if len(usados) >= 60: break
        if any(abs(i - a) <= 2 and abs(j - b) <= 2 for a, b in usados): continue
        usados.append((i, j))
        s_ = int(round(t[i] * sr)); e_ = int(round(t[j] * sr))
        if e_ - N < s_ + N: continue                             # el fundido no puede comerse el comienzo del tramo
        B = grave[s_ - N:s_]; nb = np.linalg.norm(B)
        corr, me_ = -2.0, e_
        for c in range(int(e_ - 1.5 * per), int(e_ + 1.5 * per) + 1):
            if c + 3 > fin_util: break
            A = grave[c - N:c]; r = float(np.dot(A, B) / (np.linalg.norm(A) * nb + 1e-9))
            if r > corr: corr, me_ = r, c
        puntaje = d + 4 * (1 - corr)
        if elegido is None or puntaje < elegido[0]: elegido = (puntaje, d, corr, s_, me_)
    _, dist_estado, corr, s, me = elegido
    B = y[s - N:s]
    mejor = (dist_estado,)
    A = y[me - N:me].copy()
    k = 0.5 - 0.5 * np.cos(np.pi * np.arange(N) / N)
    mezcla = (1 - k) * A + k * B
    y[me - N:me] = mezcla_pareja(A, B, k)

    despues = medir(y, s, me, sr, f0)
    return y, s, me, despues, mejor[0], corr

archivos = {}
for m in idx["muestras"]: archivos.setdefault(m["archivo"], []).append(m)
if solo:
    if solo not in archivos:
        sys.exit(f"✗ {solo} no está en {destino}/indice.json: primero se agrega su ficha (mano, fuelle, boton, pc, nota, "
                 "nota_app, midi_referencia, archivo). Ver MUESTRAS.md.")
    archivos = {solo: archivos[solo]}

res = []
for a, ms in sorted(archivos.items()):
    m = ms[0]
    x, sr = leer(origen, a)
    # la grabación original: si es nueva (no está en el índice de originales) se mide con un tramo de prueba
    mo = orig.get(a) or {"loopStart": 0.35, "loopEnd": round(len(x) / sr - 0.2, 3)}
    if len(x) / sr < 1.2:
        sys.exit(f"✗ {a}: dura {len(x) / sr:.2f} s; hace falta al menos 1,2 s de nota sostenida (ideal 1,5 a 3 s).")
    s0 = int(round(mo["loopStart"] * sr)); e0 = int(round(mo["loopEnd"] * sr))
    if "centesimas" not in m:                                   # nota nueva: se mide cuánto más alta que La 440 está
        f_nom = 440 * 2 ** ((m["midi_referencia"] - 69) / 12)
        _, _, F = perfil(x[int(0.3 * sr):], sr, f_nom)
        # La altura medida: la nota más fuerte en la zona de la fundamental, buscada en ±1 semitono (sin el control de abajo,
        # una grabación de otra nota se cosería igual y sonaría desafinada en ese botón)
        N = 8192 if f_nom < 110 else 4096; Z = x[int(0.3 * sr):int(0.3 * sr) + 4 * N]
        X = np.abs(np.fft.rfft(Z[:len(Z) // N * N].reshape(-1, N) * np.hanning(N), axis=1)).mean(axis=0)
        fr = np.fft.rfftfreq(N, 1 / sr); zona = (fr > f_nom * 2 ** (-1 / 12)) & (fr < f_nom * 2 ** (1 / 12))
        f_med = fr[zona][np.argmax(X[zona])]
        cents = 1200 * np.log2(np.median(F) / f_nom) if abs(1200 * np.log2(f_med / f_nom)) < 50 else 1200 * np.log2(f_med / f_nom)
        if abs(cents) > 50:
            sys.exit(f"✗ {a}: la grabación no es {m.get('nota_app', '')} (midi {m['midi_referencia']}): suena {cents:+.0f} cents "
                     "corrida. Revisá que la grabación y la ficha sean del mismo botón y fuelle.")
        for o in ms: o["centesimas"] = round(float(cents), 1)
    for o in ms: o["duracion"] = round(len(x) / sr, 3)
    f0 = 440 * 2 ** ((m["midi_referencia"] - 69) / 12) * 2 ** (m.get("centesimas", 0) / 1200)
    antes = medir(x, s0, e0, sr, f0)

    # Se cose de dos maneras (con y sin emparejar el color) y se queda la mejor: emparejar el color arregla las que cambian
    # de color despacio (izq-59, izq-44), pero en algunas graves hace temblar toda la nota (izq-42, izq-38). Vale la que no deja
    # el resto de la nota peor que la grabación y, de ésas, la que menos se nota al dar la vuelta.
    def nota(r):
        return max(r["color_costura"] - r["color_resto"], 0) + 0.1 * max(r["altura_costura"] - r["altura_resto"], 0)
    def sana(r):
        return r["color_resto"] <= 1.5 * antes["color_resto"] + 0.3 and r["altura_resto"] <= 1.5 * antes["altura_resto"] + 2
    opciones = [coser(x, sr, s0, f0, c) + (c,) for c in (False, True)]
    buenas = [o for o in opciones if sana(o[3])] or opciones
    y, s, me, despues, estado, corr, con_color = min(buenas, key=lambda o: nota(o[3]))
    # 4) nivelar: el volumen percibido del tramo que se repite, a NIVEL (sin que ningún pico pase de 0,95)
    nivel_antes = nivel_percibido(y[s:me], sr)
    g_db = NIVEL - nivel_antes
    tope = 20 * np.log10(0.95 * 32768 / np.abs(y).max())
    if g_db > tope: g_db = tope
    y = y * 10 ** (g_db / 20)
    nivel_despues = nivel_percibido(y[s:me], sr)
    res.append(dict(archivo=a, botones=[f'{o["mano"]}/{o["fuelle"]}/{o["boton"]}' for o in ms],
                    antes=antes, despues=despues, loopStart=round(s / sr, 6), loopEnd=round(me / sr, 6),
                    estado=round(estado, 2), parecido_onda=round(corr, 3), color_emparejado=con_color,
                    nivel_antes=round(nivel_antes, 1), ganancia_db=round(g_db, 1), nivel=round(nivel_despues, 1)))
    if aplicar:
        escribir(a, y, sr)
        for o in ms: o["loopStart"] = round(s / sr, 6); o["loopEnd"] = round(me / sr, 6)

if aplicar:
    json.dump(idx, open(destino + "/indice.json", "w"), ensure_ascii=False, indent=1); open(destino + "/indice.json", "a").write("\n")
if informe: json.dump(res, open(informe, "w"), ensure_ascii=False, indent=1)
print(f'{"archivo":24s} {"bucle":>13s} │ color costura/resto │ altura costura/resto (cents) │ volumen')
for r in res:
    A, D = r["antes"], r["despues"]
    print(f'{r["archivo"]:24s} {r["loopStart"]:.2f}–{r["loopEnd"]:.2f} │ {A["color_costura"]:4.1f}/{A["color_resto"]:3.1f} → {D["color_costura"]:4.1f}/{D["color_resto"]:3.1f} │ '
          f'{A["altura_costura"]:5.1f}/{A["altura_resto"]:4.1f} → {D["altura_costura"]:4.1f}/{D["altura_resto"]:4.1f} │ {D["vol_min"]:.2f}–{D["vol_max"]:.2f}')

# El veredicto, con la misma vara que pruebas/muestras.mjs: al dar la vuelta, la nota no puede cambiar de color ni de altura
# más que lo que cambia sola en el resto, ni el volumen salir de 0,8–1,25.
def veredicto(D):
    malo = []
    if D["color_costura"] > 1.5 * D["color_resto"] + 0.3: malo.append(f'el color cambia {D["color_costura"]} dB (el resto, {D["color_resto"]})')
    if D["altura_costura"] > 2 * D["altura_resto"] + 2: malo.append(f'la altura se mueve {D["altura_costura"]} cents (el resto, {D["altura_resto"]})')
    if D["vol_min"] < 0.8 or D["vol_max"] > 1.25: malo.append(f'el volumen va de {D["vol_min"]} a {D["vol_max"]}')
    return malo
def veredicto_nivel(r):
    return [] if abs(r["nivel"] - NIVEL) <= 1.0 else [f'suena {r["nivel"] - NIVEL:+.1f} dB respecto de las demás (no se pudo nivelar sin saturar)']
print()
for r in res:
    malo = veredicto(r["despues"]) + veredicto_nivel(r)
    print(("✗ " + r["archivo"] + ": " + "; ".join(malo)) if malo else ("✓ " + r["archivo"] + ": al dar la vuelta no se nota" + (" — escrita, lista para subir" if aplicar else " (sin --aplicar no se escribió nada)")))
if any(veredicto(r["despues"]) + veredicto_nivel(r) for r in res):
    print("  Si una nota no queda bien, la grabación no da: conviene grabarla de nuevo (MUESTRAS.md, «Cómo grabar»)."); sys.exit(1)
