// Plantilla: frase o cita de marca.
// Copia este archivo a <proyecto>/grafik/piezas/ y cambia los datos.
type Ctx = { asset: (r: string) => string; esc: (t: string) => string; proyecto: string };

const citas = [
  {
    texto: "La primera frase de la cita. Que sea corta: si pasa de tres líneas hay que achicar la tipografía.",
    autor: "Nombre Apellido",
    cargo: "Rol en la organización",
    fondo: "#FEFBD4",
    tinta: "#16181c",
    acento: "#FFCC01",
  },
  {
    texto: "Una segunda cita, si el carrusel lleva más de una.",
    autor: "Otra Persona",
    cargo: "Rol",
    fondo: "#16181c",
    tinta: "#f5f6f8",
    acento: "#3186FD",
  },
];

const css = `
  .slide {
    font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
    padding: 96px 72px;
    justify-content: space-between;
  }

  .marca {
    font-size: 24px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    opacity: 0.6;
  }

  .centro { flex: 1; display: flex; align-items: center; }

  blockquote { font-size: 76px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.1; }

  .autor { display: flex; flex-direction: column; gap: 8px; }

  .guion { width: 120px; height: 8px; border-radius: 999px; margin-bottom: 24px; }

  .autor strong { font-size: 30px; font-weight: 700; }

  .autor span { font-size: 26px; opacity: 0.65; }
`;

export default ({ esc }: Ctx) =>
  citas.map((cita) => ({
    nombre: cita.autor,
    css,
    html: `
      <div class="slide" style="background:${cita.fondo};color:${cita.tinta}">
        <span class="marca">Marca</span>
        <div class="centro"><blockquote>${esc(cita.texto)}</blockquote></div>
        <div class="autor">
          <span class="guion" style="background:${cita.acento}"></span>
          <strong>${esc(cita.autor)}</strong>
          <span>${esc(cita.cargo)}</span>
        </div>
      </div>`,
  }));
