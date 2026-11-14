// Tramo A: gancho y bisagra. La bisagra termina con el panel dorado entrando:
// el corte al demo 1 cae cuando el lienzo ya está tapado, y la primera toma
// del demo arranca con ese mismo panel saliendo (lo pone ffmpeg).
export default [
  {
    plantilla: "burbujas",
    duracion: 3.4,
    rotulo: "WhatsApp · Instagram",
    burbujas: ["precio?", "info, porfa", "cuánto?", "tienes en negro?"],
    texto: "Vendes por WhatsApp\ny te escriben esto\ntodo el día",
  },
  {
    plantilla: "catalogo",
    duracion: 2.6,
    rotulo: "Catálogo",
    texto: "Y si tu catálogo\ncontestara por ti?",
    // El panel dura 0.7s: arranca 0.35s antes del final y a los 2.6s está
    // centrado, tapando el lienzo entero.
    figura: "panel",
    ritmo: 0.7,
    barrido: 2.25,
  },
];
