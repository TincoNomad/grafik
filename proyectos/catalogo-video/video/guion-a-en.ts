// Tramo A en inglés. Mismo orden y misma duración que `guion-a.ts`: los cortes
// caen en los mismos segundos, así que `montaje.sh` no cambia.
export default [
  {
    plantilla: "burbujas",
    duracion: 3.4,
    rotulo: "WhatsApp · Instagram",
    burbujas: ["price?", "any info?", "how much?", "got it in black?"],
    texto: "You sell on WhatsApp\nand get this\nall day long",
  },
  {
    plantilla: "catalogo",
    duracion: 2.6,
    rotulo: "Catalog",
    texto: "What if your catalog\nanswered for you?",
    // El panel dura 0.7s: arranca 0.35s antes del final y a los 2.6s está
    // centrado, tapando el lienzo entero.
    figura: "panel",
    ritmo: 0.7,
    barrido: 2.25,
  },
];
