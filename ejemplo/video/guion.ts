// Un video completo en un archivo. Esto es lo único que se edita por video.
// La duración de cada escena vive aquí: cuando haya voz, se ajusta a lo que dure
// su audio y las animaciones se reacomodan solas.
//
//   bun video.ts ejemplo
//   bun video.ts ejemplo --rapido
export default [
  {
    plantilla: "hook",
    duracion: 6,
    rotulo: "Rust · 01",
    texto: "Rust no te deja\nprestar mal",
    acento: "Y eso es a propósito.",
  },
  {
    plantilla: "concepto",
    duracion: 9,
    rotulo: "Ownership",
    texto: "Un dueño\npor valor",
    sub: "Cuando el dueño sale del scope, el valor se libera. Sin recolector.",
  },
  {
    plantilla: "diagrama",
    duracion: 15,
    rotulo: "El ciclo",
    texto: "La vida de un String",
    pasos: ["String::from", "lo prestas", "sale del scope"],
  },
  {
    plantilla: "cierre",
    duracion: 6,
    rotulo: "Rust · Ownership",
    texto: "Sin recolector,\nsin fugas.",
    cta: "Sígueme para más Rust",
  },
];
