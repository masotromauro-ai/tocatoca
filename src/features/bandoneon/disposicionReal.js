// Posiciones REALES de los agujeros de cada teclado del bandoneón, en milímetros.
// Salen de los dibujos a lápiz del profesor (derecha: 38 teclas, izquierda: 33), orientados como se ve desde arriba,
// con el origen en el centro más a la izquierda y el más arriba de cada mano. Cada botón de la app (R01…R38, L01…L33)
// está emparejado con su agujero por cercanía (columna «tecla_app_probable» de los CSV): conviene confirmarlo tocando
// unas cuantas teclas. Se comprobó contra fotos del instrumento: el patrón coincide (error medio 0,6 mm a la izquierda
// y 0,9 mm a la derecha). Más datos en DISPOSICION-REAL.md.
//
// AJUSTE es un factor por mano para corregir la medida si hiciera falta (1 = tal cual se midió).

export const AGUJERO_MM = 10.6;            // diámetro del agujero (se midió en los dibujos)
export const AJUSTE = { der: 1, izq: 1 };

export const REAL = {
  der: {
    R01:[38.2,0.9], R02:[60.2,0.0], R03:[81.9,1.5], R04:[103.8,4.6],
    R05:[50.0,8.9], R06:[70.4,8.7], R07:[91.6,11.1], R08:[29.1,11.1],
    R09:[111.6,15.6], R10:[21.5,21.1], R11:[41.0,18.9], R12:[60.6,18.2],
    R13:[80.3,19.3], R14:[99.2,22.4], R15:[119.2,27.2], R16:[13.3,33.2],
    R17:[32.8,29.7], R18:[51.2,28.4], R19:[69.5,28.9], R20:[87.9,30.8],
    R21:[106.2,34.7], R22:[125.1,39.5], R23:[0.0,51.9], R24:[20.0,46.3],
    R25:[38.6,43.2], R26:[57.1,41.7], R27:[75.6,42.4], R28:[94.0,44.1],
    R29:[113.3,48.0], R30:[131.4,53.2], R31:[6.1,64.3], R32:[26.1,59.3],
    R33:[44.7,56.7], R34:[63.4,55.2], R35:[82.3,56.2], R36:[100.3,57.8],
    R37:[119.2,61.9], R38:[138.1,66.9],
  },
  izq: {
    L01:[44.5,2.3], L02:[69.0,0.0], L03:[92.6,1.2], L04:[116.7,5.4],
    L05:[139.5,11.4], L06:[11.4,16.0], L07:[33.9,12.3], L08:[57.2,8.7],
    L09:[80.3,8.8], L10:[102.9,10.8], L11:[125.4,16.5], L12:[147.3,23.8],
    L13:[24.7,22.9], L14:[46.7,19.7], L15:[68.9,18.0], L16:[90.3,19.2],
    L17:[111.7,22.8], L18:[133.0,28.8], L19:[10.4,41.2], L20:[32.2,35.8],
    L21:[54.5,33.0], L22:[76.2,31.3], L23:[97.4,32.8], L24:[118.9,36.4],
    L25:[139.8,42.6], L26:[0.0,59.1], L27:[17.4,54.1], L28:[39.4,48.6],
    L29:[61.5,45.6], L30:[83.3,45.1], L31:[105.4,46.1], L32:[125.8,50.4],
    L33:[147.5,55.8],
  },
};
