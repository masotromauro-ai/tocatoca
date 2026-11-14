// Estilos compartidos de la interfaz (tipografía y botones). Sólo datos de estilo.

// ─── SISTEMA DE DISEÑO: botones tipo "pill" compartidos ──────────────────────
export const UI_FONT = "'Inter',system-ui,-apple-system,'Segoe UI',sans-serif";

export const uiPill = (on, extra={}) => ({
  padding:"6px 13px", borderRadius:9, fontFamily:UI_FONT, fontSize:11.5, fontWeight:600, letterSpacing:"0.02em",
  cursor:"pointer", lineHeight:1.2,
  border:`1px solid ${on?"#ececec":"#2c2c30"}`,
  background:on?"#ececec":"rgba(255,255,255,.015)",
  color:on?"#0d0d0e":"#a0a0a6",
  boxShadow:on?"0 1px 0 rgba(255,255,255,.35) inset, 0 4px 14px rgba(0,0,0,.35)":"none",
  transition:"background .15s, border-color .15s, color .15s, transform .12s, box-shadow .15s",
  ...extra,
});

// Estilos por función: modos (uiPill, blanco) · vista del teclado (uiVista) · reproducir (uiPlay) · herramientas (uiTool) · limpiar/soltar (uiGhost)
export const uiPlay=(on,extra={})=>({fontFamily:UI_FONT,fontSize:12.5,fontWeight:800,letterSpacing:"0.02em",padding:"7px 16px",borderRadius:999,cursor:"pointer",lineHeight:1.2,
  border:`1px solid ${on?"#f08a82":"#4fe0c4"}`,background:on?"#f2837a":"#2dd4bf",color:"#04211c",boxShadow:`0 0 0 3px ${on?"rgba(242,131,122,.22)":"rgba(45,212,191,.22)"}`,...extra});

export const uiMarcar=(on,extra={})=>({fontFamily:UI_FONT,fontSize:12,fontWeight:800,letterSpacing:"0.02em",padding:"6px 14px",borderRadius:999,cursor:"pointer",lineHeight:1.2,
  border:"1px solid #f2c14e",background:on?"#f2c14e":"#2c2310",color:on?"#251a02":"#f6d57f",boxShadow:on?"0 0 0 3px rgba(242,193,78,.25)":"0 0 0 2px rgba(242,193,78,.12)",...extra});

export const uiVista=(on,extra={})=>({fontFamily:UI_FONT,fontSize:11.5,fontWeight:600,padding:"5px 11px",borderRadius:8,cursor:"pointer",lineHeight:1.2,
  border:`1px solid ${on?"#8f8f98":"transparent"}`,background:on?"#2a2a30":"transparent",color:on?"#ffffff":"#8a8a92",...extra});

export const uiTool=(on,extra={})=>({fontFamily:UI_FONT,fontSize:11,fontWeight:600,padding:"4px 10px",borderRadius:7,cursor:"pointer",lineHeight:1.2,
  border:`1px solid ${on?"#d9c27a":"#34343a"}`,background:on?"#2b2615":"transparent",color:on?"#f0dd9a":"#9a9aa2",...extra});

export const uiGhost={fontFamily:UI_FONT,fontSize:11,fontWeight:600,padding:"4px 8px",borderRadius:7,cursor:"pointer",lineHeight:1.2,border:"1px solid transparent",background:"transparent",color:"#85858d"};

export const uiLabel = {fontFamily:UI_FONT,fontSize:10,letterSpacing:"0.18em",color:"#7c7c82",textTransform:"uppercase",fontWeight:600};
