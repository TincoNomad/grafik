// Muestrario de plantillas: una escena por molde, con datos válidos.
//
// No es un video para publicar. Existe para tres cosas:
//   - ver cómo se ve cada plantilla sin abrir su código;
//   - saber qué datos acepta cada una (este archivo es la referencia);
//   - correr los chequeos de zona segura sobre todas a la vez.
//
//   bun src/video.ts proyectos/indice --rapido --out proyectos/indice/build
//
export default [
  {
    plantilla: "hook",
    duracion: 3,
    rotulo: "Muestra",
    texto: "Un molde\npor escena",
    acento: "Todo en 1080 × 1920",
    sprite: "ferris",
  },
  {
    plantilla: "concepto",
    duracion: 3,
    rotulo: "Concepto",
    texto: "Una idea\ny su explicación",
    sub: "El subtítulo va debajo",
    sprite: "cartel",
  },
  {
    plantilla: "cita",
    duracion: 3,
    rotulo: "Cita",
    texto: "Una frase que\nvale la pena",
    sub: "Alguien que la dijo",
  },
  {
    plantilla: "lista",
    duracion: 3,
    rotulo: "Lista",
    texto: "Tres cosas\nque saber",
    items: [
      { nombre: "Primera", detalle: "Con su explicación" },
      { nombre: "Segunda", detalle: "Con su explicación" },
      { nombre: "Tercera", detalle: "Con su explicación" },
    ],
  },
  {
    plantilla: "diagrama",
    duracion: 3,
    rotulo: "Diagrama",
    texto: "Tres pasos\ncon flechas",
    pasos: ["Entra", "Procesa", "Sale"],
  },
  {
    plantilla: "comparacion",
    duracion: 3,
    rotulo: "Comparación",
    texto: "Dos columnas",
    izquierda: { titulo: "Antes", items: ["Lento", "Manual", "Caro"] },
    derecha: { titulo: "Después", items: ["Rápido", "Solo", "Barato"] },
  },
  {
    plantilla: "checklist",
    duracion: 3,
    rotulo: "Checklist",
    texto: "Cuatro puntos\na revisar",
    sprite: "ferris",
    items: ["Primero", "Segundo", "Tercero", "Cuarto"],
  },
  {
    plantilla: "barras",
    duracion: 3,
    rotulo: "Barras",
    texto: "Comparación\npor barras",
    nucleos: 8,
    filas: [
      { quien: "Uno", activos: 4 },
      { quien: "Dos", activos: 6 },
      { quien: "Tres", activos: 8 },
    ],
  },
  {
    plantilla: "grafico",
    duracion: 3,
    rotulo: "Gráfico",
    texto: "Valores\npor fila",
    nota: "Una nota al pie",
    filas: [
      { etiqueta: "Enero", valor: 40 },
      { etiqueta: "Febrero", valor: 65, destacado: true },
      { etiqueta: "Marzo", valor: 80 },
    ],
  },
  {
    plantilla: "codigo",
    duracion: 3,
    rotulo: "Código",
    texto: "Un bloque\ncon clave",
    iconos: false,
    clave: ["fn main() {"],
    lineas: ["fn main() {", "    let x = 1;", "    println!(\"{x}\");", "}"],
  },
  {
    plantilla: "enchufe",
    duracion: 3,
    rotulo: "Enchufe",
    texto: "Módulos\nsobre un motor",
    motor: "Motor",
    modulo: "Módulo",
    nota: "Una nota abajo",
    modulos: ["Uno", "Dos", "Tres"],
  },
  {
    plantilla: "filtro",
    duracion: 3,
    rotulo: "Filtro",
    texto: "Un camino\nse abre en dos",
    sub: "Y una rama se descarta",
    etiquetas: ["pregunta", "compra"],
  },
  {
    plantilla: "burbujas",
    duracion: 3,
    rotulo: "Burbujas",
    texto: "Mensajes\nque se acumulan",
    burbujas: ["precio?", "info, porfa", "cuánto?", "tienes en negro?"],
  },
  {
    plantilla: "catalogo",
    duracion: 3,
    rotulo: "Catálogo",
    texto: "Una rejilla\nque se arma sola",
  },
  {
    plantilla: "sellos",
    duracion: 3,
    rotulo: "Sellos",
    texto: "Tres dudas\nresueltas",
    sellos: [
      { icono: "escudo", texto: "Garantías" },
      { icono: "caja", texto: "Envíos" },
      { icono: "pago", texto: "Pagos" },
    ],
  },
  {
    plantilla: "golpe",
    duracion: 3,
    palabra: "Golpe",
    pie: "Una sola palabra",
    sprite: "duda",
  },
  {
    plantilla: "cierre",
    duracion: 3,
    rotulo: "Cierre",
    texto: "Te armo\nel tuyo",
    cta: "Escríbeme",
  },
];
