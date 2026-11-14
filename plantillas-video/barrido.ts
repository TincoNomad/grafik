// Elemento de empalme entre dos escenas. Cruza la pantalla y la tapa entera en
// la mitad del recorrido: ahí cae el corte, y como el fotograma es el mismo a
// los dos lados, el empalme no se ve.
//
// `barrido` es el segundo en que arranca dentro de la escena:
//   escena que sale   → duracion - ritmo/2
//   escena que entra  → -ritmo/2
//
// No es una plantilla: `video.ts` solo carga los archivos que el guion nombra.
export type Figura = "panel" | "escalera";

const BANDAS = 6;
const ALTO_BANDA = 320;
const CORRIDA = 180;
const ANCHO_BANDA = 1984;

// Un escalón, un color, alternando claro y oscuro para que cada nivel se lea.
// Están repetidos en `montaje.sh` porque la otra mitad de la escalera la pinta
// ffmpeg: si cambias uno, cambia el otro o el corte se ve como un salto.
const COLORES = ["#e8e4d9", "#a9442b", "#d4af37", "#7a2f1d", "#f27d42", "#7a6a4f"];

// Marcos internos del panel: [separación del borde, grosor, color].
// También replicados en `montaje.sh` con drawbox.
const MARCOS: [number, number, string][] = [
  [80, 80, "#2f2e2b"],
  [160, 80, "#a9442b"],
  [240, 80, "#f27d42"],
];

// El centro va macizo y encima del fondo dorado: el panel cierra en carbón.
const CENTRO: [number, string] = [400, "#2f2e2b"];

export const barrido = (datos: {
  barrido?: number;
  figura?: Figura;
  ritmo?: number;
}): string => {
  if (datos.barrido === undefined) return "";

  const figura = datos.figura ?? "panel";
  const ritmo = datos.ritmo ?? (figura === "escalera" ? 1.2 : 0.7);
  const estilo = `--d: ${datos.barrido}s; --db: ${ritmo}s`;

  if (figura === "panel") {
    const marcos = MARCOS.map(
      ([separacion, grosor, color]) =>
        `<i style="inset: ${separacion}px; border: ${grosor}px solid ${color}"></i>`,
    ).join("");
    const centro = `<i style="inset: ${CENTRO[0]}px; background: ${CENTRO[1]}"></i>`;
    return `<div class="barrido panel" style="${estilo}">${marcos}${centro}</div>`;
  }

  // Los 2px de sobra evitan que un redondeo deje una línea sin tapar en el corte.
  const bandas = Array.from(
    { length: BANDAS },
    (_, i) =>
      `<i style="left: ${-CORRIDA * i - 2}px; top: ${ALTO_BANDA * i}px;` +
      ` background: ${COLORES[i]}"></i>`,
  ).join("");
  return `<div class="barrido escalera" style="${estilo}">${bandas}</div>`;
};
