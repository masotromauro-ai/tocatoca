# Bandoneón · Editor de Posiciones

Editor drag & drop para ajustar la disposición de los botones del bandoneón y exportar las coordenadas exactas.

## Cómo correrlo localmente

```bash
# 1. Instalar dependencias (solo la primera vez)
npm install

# 2. Correr en modo desarrollo
npm run dev

# 3. Abrir en el navegador
# → http://localhost:5173
```

## Cómo publicarlo en GitHub Pages

```bash
# 1. Build
npm run build

# 2. Subir la carpeta /dist a GitHub Pages
# En GitHub → Settings → Pages → Source: "GitHub Actions" o subir /dist manualmente
```

## Estructura

```
bandoneon/
├── index.html          ← entry point
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx        ← monta React
    └── App.jsx         ← toda la lógica
```

## Uso

- **Arrastrá** cada botón a su posición real
- **Flechas del teclado** para ajuste fino (Shift = doble paso)
- **En mobile**: tocá el botón → usá los botones ← → ↑ ↓
- **↓ JS** → exporta código listo para pegar en el visualizador
- **↓ CSV** → tabla con coordenadas `id, row, x, y, abre, cierra`
- **Reset** → vuelve a las posiciones originales del CSV
