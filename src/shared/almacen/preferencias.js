// Preferencias de cifrado guardadas en el teléfono.
import { CLAVES } from "../claves.js";

export const cifEstilo=()=>{ try{ return localStorage.getItem(CLAVES.estiloCifrado)==="amer"?"amer":"jazz"; }catch(e){ return "jazz"; } };

export const cifPropios=()=>{ try{ return JSON.parse(localStorage.getItem(CLAVES.nombresAcordes)||"{}")||{}; }catch(e){ return {}; } };

export const cifGuardarPropios=(o)=>{ try{ localStorage.setItem(CLAVES.nombresAcordes,JSON.stringify(o)); }catch(e){} };
