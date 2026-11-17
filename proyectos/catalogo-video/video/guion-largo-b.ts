// Tramo B del corte: el bot, la conversación que filtra, la confianza y el
// cierre. La escalera entra al final del WhatsApp (la pinta ffmpeg) y aquí
// termina de salir, revelando el concepto del bot.
export default [
  {
    plantilla: "concepto",
    duracion: 4.6,
    rotulo: "🤖 El bot",
    texto: "Pregunta\nantes que tú",
    sub: "💬 Filtra al que solo mira del que ya quiere comprar",
    figura: "escalera",
    ritmo: 1.2,
    barrido: -0.6,
  },
  {
    plantilla: "bot",
    duracion: 7.4,
    rotulo: "Lo que contesta no te llega",
    texto: "Dos conversaciones, dos destinos",
  },
  {
    plantilla: "doble",
    duracion: 7.4,
    a: "filtro",
    datosA: {
      rotulo: "Lo que no llega",
      texto: "Separa al que pregunta\ndel que compra",
      sub: "Te ahorra el tiempo",
      etiquetas: ["pregunta", "compra"],
    },
    b: "sellos",
    datosB: {
      rotulo: "Tu página muestra, por ejemplo",
      sellos: [
        { icono: "escudo", texto: "Garantías" },
        { icono: "caja", texto: "Tipos de envío" },
        { icono: "pago", texto: "Formas de pago" },
      ],
      texto: "Compra sin preguntar, con más confianza",
    },
  },
  {
    plantilla: "cierre",
    duracion: 4.6,
    rotulo: "Catálogo + pedido + bot",
    texto: "Te armo\nel tuyo",
    cta: "Escríbeme por WhatsApp",
    redesTexto: "Sígueme · dale like · guárdalo",
  },
];
