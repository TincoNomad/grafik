// Tramo B: el filtro, la confianza y el cierre.
// La escalera entra al final del demo 3 (la pone ffmpeg) y aquí termina de
// salir, revelando el filtro.
export default [
  {
    plantilla: "filtro",
    duracion: 3.4,
    rotulo: "Lo que no llega",
    texto: "Separa al que pregunta\ndel que compra",
    sub: "Te ahorra el tiempo",
    etiquetas: ["pregunta", "compra"],
    figura: "escalera",
    ritmo: 1.2,
    barrido: -0.6,
  },
  {
    plantilla: "sellos",
    duracion: 3,
    rotulo: "Tu página muestra, por ejemplo",
    sellos: [
      { icono: "escudo", texto: "Garantías" },
      { icono: "caja", texto: "Tipos de envío" },
      { icono: "pago", texto: "Formas de pago" },
    ],
    texto: "Compra sin preguntar, con más confianza",
  },
  {
    plantilla: "cierre",
    duracion: 3.8,
    rotulo: "Catálogo + pedido",
    texto: "Te armo\nel tuyo",
    cta: "Escríbeme por WhatsApp",
  },
];
