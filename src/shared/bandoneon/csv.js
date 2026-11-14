// Importar y exportar el teclado como CSV y como CSS.

function btnsToCSV(left, right) {
  const h = "id,row,x,y,abre,cierra,color_abre,color_cierra,oct_abre,oct_cierra";
  const rows = [...left,...right].map(b=>
    `${b.id},${b.row},${b.x},${b.y},${b.abre},${b.cierra},${b.color_abre},${b.color_cierra},${b.oct_abre??3},${b.oct_cierra??3}`
  );
  return [h,...rows].join("\n");
}

export function downloadCSV(left, right) {
  const blob = new Blob([btnsToCSV(left,right)], {type:"text/csv"});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url;
  a.download = `bandoneon_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

export function generateCSS(left, right) {
  return [...left,...right].map(b=>
    `/* ${b.id} */ [data-btn="${b.id}"]{position:absolute;left:${b.x}px;top:${b.y}px;--ca:${b.color_abre};--cc:${b.color_cierra};}`
  ).join("\n");
}

export function parseCSV(text) {
  try {
    const lines = text.trim().split("\n").filter(l=>l.trim());
    const data  = lines[0].toLowerCase().startsWith("id") ? lines.slice(1) : lines;
    const all   = data.map(line => {
      const [id,row,x,y,abre,cierra,color_abre,color_cierra,oct_abre,oct_cierra] = line.split(",").map(s=>s.trim());
      if (!id||!abre) return null;
      return {id, row:parseInt(row)||0, x:parseInt(x)||0, y:parseInt(y)||0,
        abre:abre||"DO", cierra:cierra||"DO", color_abre:color_abre||"", color_cierra:color_cierra||"",
        oct_abre: oct_abre!==undefined&&oct_abre!=="" ? parseInt(oct_abre) : 3,
        oct_cierra: oct_cierra!==undefined&&oct_cierra!=="" ? parseInt(oct_cierra) : 3};
    }).filter(Boolean);
    return { left: all.filter(b=>b.id.startsWith("L")), right: all.filter(b=>b.id.startsWith("R")) };
  } catch { return null; }
}
