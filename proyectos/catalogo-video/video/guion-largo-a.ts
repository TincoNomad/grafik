// Tramo A del corte: el problema y el giro en un solo cuadro. Los dos bloques
// caben juntos en la altura del lienzo, así que compartir un solo tiempo deja de
// haber medio cuadro vacío entre ellos.
// El catálogo cierra con el panel: la otra mitad la pinta ffmpeg.
export default [
  {
    plantilla: "doble",
    duracion: 6.0,
    a: "burbujas",
    datosA: {
      rotulo: "WhatsApp · Instagram",
      burbujas: ["precio?", "info, porfa", "cuánto?", "tienes en negro?"],
      texto: "Vendes por WhatsApp\ny te escriben esto\ntodo el día",
    },
    b: "catalogo",
    datosB: {
      rotulo: "Catálogo",
      texto: "Y si tu catálogo\ncontestara por ti?",
    },
    // El panel tapa a los 7.96s, el último frame de la escena.
    figura: "panel",
    ritmo: 0.7,
    barrido: 5.61,
  },
];
