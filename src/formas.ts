// Polígono y estrella regulares como path SVG.
// Las coordenadas van centradas en (0,0): el llamador decide el viewBox.
// Se escriben a mano porque la versión de remotion arrastraba ~60 KB de su motor
// de paths solo para calcular el bounding box de estas dos figuras.

const aPath = (puntos: [number, number][]) =>
  puntos.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(" L ");

/** Polígono regular de `lados` vértices y radio `r`. */
export const poligono = (lados: number, r: number): string => {
  if (lados < 3) throw new Error("poligono: mínimo 3 lados");
  const vertices: [number, number][] = [];
  for (let i = 0; i < lados; i++) {
    const angulo = (2 * Math.PI * i) / lados - Math.PI / 2;
    vertices.push([r * Math.cos(angulo), r * Math.sin(angulo)]);
  }
  return `M ${aPath(vertices)} Z`;
};

/** Estrella de `puntas` picos. `rInterior` es el radio de los valles. */
export const estrella = (puntas: number, r: number, rInterior = r * 0.5): string => {
  if (puntas < 3) throw new Error("estrella: mínimo 3 puntas");
  if (!(rInterior > 0 && rInterior < r)) {
    throw new Error("estrella: rInterior debe estar entre 0 y r");
  }
  const vertices: [number, number][] = [];
  for (let i = 0; i < puntas * 2; i++) {
    const radio = i % 2 === 0 ? r : rInterior;
    const angulo = (Math.PI * i) / puntas - Math.PI / 2;
    vertices.push([radio * Math.cos(angulo), radio * Math.sin(angulo)]);
  }
  return `M ${aPath(vertices)} Z`;
};

if (import.meta.main) {
  // Autochequeo: los paths cierran y la primera punta apunta hacia arriba.
  const pares = [
    ["estrella", estrella(5, 100)],
    ["poligono", poligono(6, 100)],
  ] as const;
  for (const [nombre, d] of pares) {
    if (!d.startsWith("M ") || !d.endsWith(" Z")) throw new Error(`${nombre}: path abierto`);
  }
  if (!estrella(5, 100).startsWith("M 0.00 -100.00")) {
    throw new Error("estrella: la primera punta no apunta hacia arriba");
  }
  console.log("formas OK");
}
