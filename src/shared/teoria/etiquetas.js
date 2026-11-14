// Rótulos de grados y notas, y el color de texto que se lee sobre un color de fondo.

import { hexToRgb } from "./color.js";

export const CROM_SIMPLE = {C:"Do", "C#":"Do#", D:"Re", "D#":"Re#", E:"Mi", F:"Fa",
  "F#":"Fa#", G:"Sol", "G#":"Sol#", A:"La", "A#":"Sib", B:"Si"};

export const GRADO_LABEL = {0:"1",1:"b2",2:"2",3:"b3",4:"3",5:"4",6:"b5",7:"5",8:"b6",9:"6",10:"b7",11:"7"};

export const txtSobre = hex => { const [r,g,b]=hexToRgb(hex); return (0.299*r+0.587*g+0.114*b)>150 ? "#14110a" : "#ffffff"; };
