// Plantilla: cronograma / lista de bloques.
// Copia este archivo a <proyecto>/grafik/piezas/ y cambia los datos.
// Cada elemento de `slides` es una imagen del carrusel.
type Ctx = { asset: (r: string) => string; esc: (t: string) => string; proyecto: string };

const ACENTOS = ["#FC4240", "#3186FD", "#2BB055", "#FFCC01"];
const PASTELES = ["#FED4DC", "#E4E7FF", "#D8F1F7", "#FEFBD4"];

// Un slide = un rango de bloques. Ajústalos a tu contenido.
const slides = [
  {
    titulo: "Cronograma",
    rango: "Mañana",
    bloques: [
      { hora: "9:00 – 9:30", titulo: "Apertura", detalle: "Equipo organizador" },
      { hora: "9:30 – 10:15", titulo: "Bloque 1", detalle: "Speaker", sala: "Sala 1" },
      { hora: "10:15 – 10:45", titulo: "Bloque 2", detalle: "Speaker", sala: "Sala 1" },
      { hora: "10:45 – 11:00", titulo: "Break" },
      { hora: "11:00 – 12:00", titulo: "Bloque 3", detalle: "Speaker", sala: "Sala 2" },
    ],
  },
  {
    titulo: "Cronograma",
    rango: "Tarde",
    bloques: [
      { hora: "14:00 – 15:00", titulo: "Sesión tarde", detalle: "Speaker", sala: "Sala 1" },
      { hora: "15:00 – 15:15", titulo: "Break" },
      { hora: "15:15 – 16:15", titulo: "Última sesión", detalle: "Speaker", sala: "Sala 1" },
      { hora: "16:15 – 16:30", titulo: "Cierre", detalle: "Equipo organizador" },
    ],
  },
];

const css = `
  :root {
    --bg: #f4f5f7;
    --ink: #16181c;
    --muted: #5f6368;
    --line: #dcdfe4;
  }

  .slide {
    background: var(--bg);
    color: var(--ink);
    font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
    padding: 64px 56px 72px;
  }

  .head { display: flex; align-items: baseline; justify-content: space-between; gap: 20px; }

  .titulo { font-size: 68px; font-weight: 800; letter-spacing: -0.03em; line-height: 1; }

  .rango { font-size: 32px; font-weight: 500; color: var(--muted); }

  .lista {
    margin-top: 28px;
    flex: 1;
    display: grid;
    gap: 14px;
    min-height: 0;
  }

  .bloque {
    min-height: 0;
    display: grid;
    grid-template-columns: 236px 1fr;
    column-gap: 26px;
    align-items: center;
    padding: 14px 26px;
    border: 3px solid;
    border-radius: 24px;
  }

  .bloque__hora { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; }

  .bloque__hora time { font-size: 30px; font-weight: 700; white-space: nowrap; }

  .sala {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    background: #fff;
    border: 2px solid var(--line);
    border-radius: 999px;
    padding: 2px 11px;
  }

  .bloque h2 { font-size: 32px; font-weight: 700; line-height: 1.14; letter-spacing: -0.01em; }

  .bloque p { margin-top: 8px; font-size: 22px; color: var(--muted); }

  /* Un bloque sin detalle ni sala es un break: se dibuja como franja. */
  .bloque--simple {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    background: #fff;
    border: 2px dashed var(--line);
    border-radius: 999px;
    font-size: 23px;
    color: var(--muted);
  }

  .bloque--simple time { font-weight: 700; }
`;

export default ({ esc }: Ctx) => {
  const clases = (i: number) => ({ borde: ACENTOS[i % 4], fondo: PASTELES[i % 4] });
  const esBreak = (b: { detalle?: string; sala?: string }) => !b.detalle && !b.sala;

  return slides.map((slide) => ({
    nombre: slide.rango,
    css,
    html: `
      <div class="slide">
        <div class="head">
          <h1 class="titulo">${esc(slide.titulo)}</h1>
          <span class="rango">${esc(slide.rango)}</span>
        </div>
        <!-- Filas iguales para que llene el lienzo. Con pocos bloques se estiran:
             si los quieres compactos, cambia "minmax(0, 1fr)" por "auto". -->
        <div class="lista" style="grid-template-rows:${slide.bloques
          .map((b) => (esBreak(b) ? "58px" : "minmax(0, 1fr)"))
          .join(" ")}">
          ${slide.bloques
            .map((bloque, i) => {
              if (esBreak(bloque)) {
                return `<div class="bloque--simple">
                  <time>${esc(bloque.hora)}</time><span>${esc(bloque.titulo)}</span>
                </div>`;
              }
              const { borde, fondo } = clases(i);
              return `
                <div class="bloque" style="border-color:${borde};background:${fondo}">
                  <div class="bloque__hora">
                    <time style="color:${borde}">${esc(bloque.hora)}</time>
                    ${bloque.sala ? `<span class="sala">${esc(bloque.sala)}</span>` : ""}
                  </div>
                  <div>
                    <h2>${esc(bloque.titulo)}</h2>
                    ${bloque.detalle ? `<p>${esc(bloque.detalle)}</p>` : ""}
                  </div>
                </div>`;
            })
            .join("")}
        </div>
      </div>`,
  }));
};
