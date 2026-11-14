// Plantilla: KPIs o números grandes.
// Copia este archivo a <proyecto>/grafik/piezas/ y cambia los datos.
type Ctx = { asset: (r: string) => string; esc: (t: string) => string; proyecto: string };

const bloques = [
  {
    eyebrow: "Uso",
    filas: [
      { valor: "12.4k", etiqueta: "consultas resueltas este mes", color: "#3186FD" },
      { valor: "98%", etiqueta: "de respuestas con fuente citada", color: "#2BB055" },
    ],
  },
  {
    eyebrow: "Rendimiento",
    filas: [
      { valor: "340ms", etiqueta: "latencia mediana de respuesta", color: "#FC4240" },
      { valor: "4.2x", etiqueta: "más rápido que la versión anterior", color: "#FFCC01" },
    ],
  },
];

const css = `
  .slide {
    background: #0b0c10;
    color: #f5f6f8;
    font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
    padding: 88px 64px;
    justify-content: space-between;
  }

  .eyebrow {
    font-size: 26px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #8b90a0;
  }

  .filas { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 56px; }

  .fila { border-left: 6px solid; padding-left: 28px; }

  .valor { font-size: 148px; font-weight: 800; letter-spacing: -0.045em; line-height: 0.95; }

  .etiqueta { margin-top: 14px; font-size: 30px; line-height: 1.3; color: #9aa0ae; }

  .pie { font-size: 24px; color: #6d7283; }
`;

export default ({ esc }: Ctx) =>
  bloques.map((bloque) => ({
    nombre: bloque.eyebrow,
    css,
    html: `
      <div class="slide">
        <span class="eyebrow">${esc(bloque.eyebrow)}</span>
        <div class="filas">
          ${bloque.filas
            .map(
              (fila) => `
            <div class="fila" style="border-color:${fila.color}">
              <p class="valor" style="color:${fila.color}">${esc(fila.valor)}</p>
              <p class="etiqueta">${esc(fila.etiqueta)}</p>
            </div>`,
            )
            .join("")}
        </div>
        <p class="pie">Datos al cierre del mes</p>
      </div>`,
  }));
