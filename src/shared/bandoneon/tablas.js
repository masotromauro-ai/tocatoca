// Tablas del teclado del bandoneón (botones, fuelle, octavas) y la altura real de cada botón. Lógica pura.

import { LAT, noteIdx } from "../teoria/notas.js";

// ─── BANDONEÓN — layout leído de imagen ───────────────────────────────────────
const BLO=[ // Izquierda Abriendo
  [{n:"SOL#",o:2},{n:"SOL",o:3},{n:"LA#",o:3},{n:"DO#",o:4},{n:"FA",o:4},{n:"FA",o:4},{n:"SOL",o:4}],
  [{n:"LA",o:2},{n:"LA",o:3},{n:"RE#",o:3},{n:"DO",o:4},{n:"MI",o:4},{n:"LA#",o:4},{n:"FA",o:4}],
  [{n:"MI",o:2},{n:"RE",o:3},{n:"SI",o:3},{n:"RE",o:3},{n:"FA#",o:4},{n:"DO#",o:4}],
  [{n:"SOL#",o:2},{n:"SOL",o:3},{n:"LA",o:3},{n:"RE#",o:3},{n:"FA#",o:3},{n:"DO#",o:3},{n:"DO",o:4}],
  [{n:"SI",o:2},{n:"MI",o:3},{n:"SOL",o:3},{n:"RE",o:3},{n:"RE#",o:2}],
  [{n:"RE",o:2},{n:"SI",o:2},{n:"MI",o:3}],
];

const BLC=[ // Izquierda Cerrando
  [{n:"SOL#",o:2},{n:"LA#",o:3},{n:"RE#",o:3},{n:"DO#",o:3},{n:"RE#",o:3},{n:"SOL",o:4}],
  [{n:"RE",o:2},{n:"RE",o:3},{n:"LA#",o:3},{n:"SI",o:3},{n:"DO",o:4},{n:"DO",o:4},{n:"FA#",o:4}],
  [{n:"SOL",o:2},{n:"SOL",o:3},{n:"SI",o:3},{n:"RE",o:4},{n:"FA",o:4},{n:"DO#",o:4}],
  [{n:"MI",o:2},{n:"LA",o:2},{n:"LA",o:3},{n:"DO#",o:3},{n:"SI",o:3},{n:"FA#",o:4},{n:"SI",o:4}],
  [{n:"LA",o:2},{n:"FA#",o:2},{n:"SOL#",o:2},{n:"SI",o:2}],
  [{n:"MI",o:2},{n:"MI",o:3},{n:"FA",o:3}],
];

const BRO=[ // Derecha Abriendo
  [{n:"SI",o:4},{n:"SOL#",o:4},{n:"SOL",o:5},{n:"SOL",o:4},{n:"SOL",o:5},{n:"FA",o:5},{n:"FA",o:5}],
  [{n:"DO",o:5},{n:"DO#",o:5},{n:"LA",o:4},{n:"RE",o:5},{n:"FA#",o:5},{n:"LA#",o:5},{n:"DO",o:5},{n:"RE#",o:5},{n:"RE",o:5}],
  [{n:"SI",o:4},{n:"MI",o:4},{n:"DO#",o:5},{n:"FA#",o:5},{n:"LA",o:5},{n:"DO",o:6},{n:"RE#",o:6}],
  [{n:"FA",o:4},{n:"SOL#",o:4},{n:"RE#",o:4},{n:"FA#",o:4},{n:"LA",o:4},{n:"RE#",o:5},{n:"FA#",o:5}],
  [{n:"LA",o:4},{n:"MI",o:4},{n:"FA",o:4},{n:"DO",o:5},{n:"RE",o:5},{n:"MI",o:5}],
  [{n:"SOL",o:4},{n:"SI",o:4},{n:"LA#",o:4},{n:"SOL",o:5}],
];

const BRC=[ // Derecha Cerrando
  [{n:"LA",o:4},{n:"SOL#",o:4},{n:"FA#",o:5},{n:"FA",o:5},{n:"DO",o:6},{n:"FA",o:5},{n:"RE#",o:6}],
  [{n:"RE",o:5},{n:"DO#",o:5},{n:"SOL#",o:5},{n:"LA#",o:5},{n:"DO",o:6},{n:"RE#",o:5},{n:"RE",o:6}],
  [{n:"FA#",o:4},{n:"FA#",o:4},{n:"FA#",o:5},{n:"SOL",o:5},{n:"LA",o:5},{n:"RE",o:6}],
  [{n:"SOL#",o:5},{n:"MI",o:5},{n:"RE#",o:5},{n:"FA#",o:5},{n:"LA#",o:5},{n:"SOL#",o:5}],
  [{n:"SOL#",o:4},{n:"MI",o:4},{n:"LA",o:4},{n:"DO#",o:5},{n:"MI",o:5},{n:"SI",o:5}],
  [{n:"SOL",o:4},{n:"LA#",o:4},{n:"SI",o:4},{n:"DO#",o:6}],
];

export const OCT_C={
  2:{bg:"#7c3aed",border:"#6d28d9"},
  3:{bg:"#ea580c",border:"#c2410c"},
  4:{bg:"#059669",border:"#047857"},
  5:{bg:"#db2777",border:"#be185d"},
  6:{bg:"#2563eb",border:"#1d4ed8"},
};

// ─── COMPONENTES ──────────────────────────────────────────────────────────────

// Botones de una mano con su altura real (nota + octava) para el fuelle indicado
export function itemsMano(btns, bellows){
  return btns.map(b=>{
    const lat = bellows==="abre" ? b.abre : b.cierra;
    const eng = LAT[lat]||lat, pc = noteIdx(eng);
    const oct = bellows==="abre" ? (b.oct_abre??3) : (b.oct_cierra??3);
    return {b, pc, oct, midi:12*(oct+1)+pc};
  });
}
