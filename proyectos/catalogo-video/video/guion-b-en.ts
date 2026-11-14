// Tramo B en inglés. Misma estructura y duraciones que `guion-b.ts`, para que
// la escalera entre y salga en los mismos frames.
export default [
  {
    plantilla: "filtro",
    duracion: 3.4,
    rotulo: "What never lands",
    texto: "Separates the asker\nfrom the buyer",
    sub: "Saves you the time",
    etiquetas: ["asking", "buying"],
    figura: "escalera",
    ritmo: 1.2,
    barrido: -0.6,
  },
  {
    plantilla: "sellos",
    duracion: 3,
    rotulo: "Your page shows, for example",
    sellos: [
      { icono: "escudo", texto: "Warranty" },
      { icono: "caja", texto: "Shipping options" },
      { icono: "pago", texto: "Payment methods" },
    ],
    texto: "Buy without asking, with more trust",
  },
  {
    plantilla: "cierre",
    duracion: 3.8,
    rotulo: "Catalog + order",
    texto: "I'll build\nyours",
    cta: "Message me on WhatsApp",
    redesTexto: "Follow me on @wiracocha_labs",
  },
];
