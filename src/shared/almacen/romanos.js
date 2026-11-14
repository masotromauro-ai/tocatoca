// Preferencias guardadas en el teléfono: romanos o números.

import { useState } from "react";
import { CLAVES } from "../claves.js";

export function useRomanos(){
  const [r,setR]=useState(()=>{ try{ const v=localStorage.getItem(CLAVES.romanos); return v===null?true:v==="1"; }catch(e){ return true; } });
  const set=(v)=>{ setR(v); try{ localStorage.setItem(CLAVES.romanos,v?"1":"0"); }catch(e){} };
  return [r,set];
}
