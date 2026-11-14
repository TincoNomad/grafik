// Pixel art en código: una rejilla de caracteres, un color por carácter.
// Cada carácter es un píxel y `.` es transparente.
// Los sprites de Ferris son CC0 (dominio público).
export type Paleta = Record<string, string>;

export const PALETA: Paleta = {
  O: "#e8552b", // cuerpo Ferris
  D: "#8b2500", // contorno Ferris
  E: "#111111", // ojos
  W: "#ffffff", // brillo del ojo y cuerpo del cohete
  K: "#1b1b2f", // contorno del cohete
  B: "#7a4b1e", // borde del cartel
  P: "#f5e6c8", // crema del cartel
  R: "#d9372b", // X, nariz y aletas
  S: "#b0b8c4", // gris del cohete
  C: "#4fc3f7", // cian de la ventana
  Y: "#ffd93d", // llama interior
  G: "#3ecf6a", // check verde
  F: "#ff8c1a", // llama
};

/** Convierte una rejilla de caracteres en un SVG de rectángulos. */
export const pixel = (filas: string[], px = 16, paleta: Paleta = PALETA): string => {
  const ancho = Math.max(...filas.map((f) => f.length));
  const alto = filas.length;
  const rects: string[] = [];

  filas.forEach((fila, y) => {
    [...fila].forEach((caracter, x) => {
      const color = paleta[caracter];
      if (!color) return;
      rects.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>`);
    });
  });

  return (
    `<svg viewBox="0 0 ${ancho} ${alto}" width="${ancho * px}" height="${alto * px}" ` +
    `style="shape-rendering:crispEdges">${rects.join("")}</svg>`
  );
};

/** Ferris normal, 26x15. */
export const FERRIS = [
  ".DD.DD..............DD.DD.",
  "DOODOOD............DOODOOD",
  "DOOOOOD............DOOOOOD",
  ".DOOOD..............DOOOD.",
  "..DOD................DOD..",
  "...DOD.DDDDDDDDDDDD.DOD...",
  "....DODOOOOOOOOOOOODOD....",
  "....DOOOWEOOOOOOEWOOOD....",
  "....DOOOEEOOOOOOEEOOOD....",
  "....DOOOOOOOOOOOOOOOOD....",
  "....DOOOOOOOOOOOOOOOOD....",
  ".....DOOOOOOOOOOOOOOD.....",
  "......DOOOOOOOOOOOOD......",
  "..D.D.DDDDDDDDDDDDDD.D.D..",
  "..D.D.D............D.D.D..",
];

/** Ferris sosteniendo un cartel con una X roja, 26x19. */
export const FERRIS_CARTEL = [
  ".......BBBBBBBBBBBB.......",
  ".......BPRRPPPPRRPB.......",
  ".......BPPRRPPRRPPB.......",
  ".......BPPPRRRRPPPB.......",
  ".DD.DD.BPPPPRRPPPPB.DD.DD.",
  "DOODOODBPPPRRRRPPPBDOODOOD",
  "DOOOOODBPPRRPPRRPPBDOOOOOD",
  ".DOOOD.BPRRPPPPRRPB.DOOOD.",
  "..DOD..BBBBBBBBBBBB..DOD..",
  "...DOD.DDDDDDDDDDDD.DOD...",
  "....DODOOOOOOOOOOOODOD....",
  "....DOOOWEOOOOOOEWOOOD....",
  "....DOOOEEOOOOOOEEOOOD....",
  "....DOOOOOOOOOOOOOOOOD....",
  "....DOOOOOOOOOOOOOOOOD....",
  ".....DOOOOOOOOOOOOOOD.....",
  "......DOOOOOOOOOOOOD......",
  "..D.D.DDDDDDDDDDDDDD.D.D..",
  "..D.D.D............D.D.D..",
];

/** Ferris sosteniendo un cartel blanco con un check verde, 26x19. */
export const FERRIS_CHECK = [
  ".......BBBBBBBBBBBB.......",
  ".......BWWWWWWWWWWB.......",
  ".......BWWWWWWWGGWB.......",
  ".......BWWWWWWGWWWB.......",
  ".......BWGWWWGWWWWB.......",
  ".......BWWGWGWWWWWB.......",
  ".......BWWWGWWWWWWB.......",
  ".......BWWWWWWWWWWB.......",
  "..DOD..BBBBBBBBBBBB..DOD..",
  "...DOD.DDDDDDDDDDDD.DOD...",
  "....DODOOOOOOOOOOOODOD....",
  "....DOOOWEOOOOOOEWOOOD....",
  "....DOOOEEOOOOOOEEOOOD....",
  "....DOOOOOOOOOOOOOOOOD....",
  "....DOOOOOOOOOOOOOOOOD....",
  ".....DOOOOOOOOOOOOOOD.....",
  "......DOOOOOOOOOOOOD......",
  "..D.D.DDDDDDDDDDDDDD.D.D..",
  "..D.D.D............D.D.D..",
];

/** Ferris sosteniendo un portapapeles con renglones, 26x19. */
export const FERRIS_TABLA = [
  ".........SSSSSS...........",
  ".......BBBBBBBBBBBB.......",
  ".......BWWWWWWWWWWB.......",
  ".......BWSSSSSSSSWB.......",
  ".DD.DD.BWWWWWWWWWWB.DD.DD.",
  "DOODOODBWSSSSSSSSWBDOODOOD",
  "DOOOOODBWWWWWWWWWWBDOOOOOD",
  ".DOOOD.BWSSSSSSWWWB.DOOOD.",
  "..DOD..BBBBBBBBBBBB..DOD..",
  "...DOD.DDDDDDDDDDDD.DOD...",
  "....DODOOOOOOOOOOOODOD....",
  "....DOOOWEOOOOOOEWOOOD....",
  "....DOOOEEOOOOOOEEOOOD....",
  "....DOOOOOOOOOOOOOOOOD....",
  "....DOOOOOOOOOOOOOOOOD....",
  ".....DOOOOOOOOOOOOOOD.....",
  "......DOOOOOOOOOOOOD......",
  "..D.D.DDDDDDDDDDDDDD.D.D..",
  "..D.D.D............D.D.D..",
];

/** Ferris sobre un cohete horizontal con llama, 36x23. */
export const FERRIS_COHETE = [
  ".........DD.DD..............DD.DD...",
  "........DOODOOD............DOODOOD..",
  "........DOOOOOD............DOOOOOD..",
  ".........DOOOD..............DOOOD...",
  "..........DOD................DOD....",
  "...........DOD.DDDDDDDDDDDD.DOD.....",
  "............DODOOOOOOOOOOOODOD......",
  "............DOOOWEOOOOOOEWOOOD......",
  "............DOOOEEOOOOOOEEOOOD......",
  "............DOOOOOOOOOOOOOOOOD......",
  "............DOOOOOOOOOOOOOOOOD......",
  ".............DOOOOOOOOOOOOOOD.......",
  "..............DOOOOOOOOOOOOD........",
  ".....KKK..DKDKDDDDDDDDDDDDDDKDKD....",
  "...KKFFFKKDWDWDWRRWWWWWWWWWDWDRDKK..",
  ".KKFFYYYSSWWWWWWRRWWWWCCWWWWWWRRRRK.",
  "KFFFYYYYSSWWWWWWRRWWWCCCWWWWWWRRRRRK",
  ".KKFFYYYSSWWWWWWRRWWWCCCWWWWWWRRRRK.",
  "...KKFFFKKSSSSSSRRSSSSSSSSSSSSRRKK..",
  ".....KKK.KRRRRRRKKKKKKKKKKKKKKKK....",
  ".........KRRRRKK....................",
  ".........KRRKK......................",
  "..........KK........................",
];


/** Centra una fila corta en un lienzo más ancho, rellenando con transparente. */
const centrar = (fila: string, ancho: number): string => {
  const hueco = ancho - fila.length;
  const izq = Math.floor(hueco / 2);
  return ".".repeat(izq) + fila + ".".repeat(hueco - izq);
};

/** Ferris con un signo de interrogación dorado encima, 26x23. */
const DUDA = [
  ".OOOO.",
  "OO..OO",
  "....OO",
  "...OO.",
  "..OO..",
  "......",
  "..OO..",
  "......",
];

export const FERRIS_DUDA = [...DUDA.map((f) => centrar(f, 26)), ...FERRIS];

/** Sprites con nombre, para que las plantillas pidan uno por clave. */
export const SPRITES = {
  ferris: FERRIS,
  cartel: FERRIS_CARTEL,
  cohete: FERRIS_COHETE,
  duda: FERRIS_DUDA,
  check: FERRIS_CHECK,
  tabla: FERRIS_TABLA,
} as const;

export type NombreSprite = keyof typeof SPRITES;
