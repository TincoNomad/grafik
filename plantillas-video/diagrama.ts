// Escena de diagrama: tres pasos encadenados, a sangre y en grande.
// Sirve para ownership de Rust, para el DAG de IPFS, para capas de una red.
// `rust: n` resalta el paso que vive en Rust.
import type { Ctx } from "../render.ts";

const CAJA = { ancho: 680, alto: 150, radio: 18 };
const X = 444;
const YS = [20, 380, 740];

export default (
  datos: {
    pasos: string[];
    texto?: string;
    rotulo?: string;
    duracion?: number;
    /** Índice del paso que vive en Rust. Se resalta para mostrar dónde va. */
    rust?: number;
  },
  ctx: Ctx,
) => {
  const pasos = (datos.pasos ?? []).slice(0, 3);
  while (pasos.length < 3) pasos.push("…");

  const cajas = YS.map((y, i) => {
    const esRust = i === datos.rust;
    const relleno = esRust ? "color-mix(in srgb, var(--acento) 16%, transparent)" : "color-mix(in srgb, var(--acento) 7%, transparent)";
    const grosor = esRust ? 4 : 2.5;
    const marca = esRust
      ? `<text x="${X + CAJA.ancho / 2 - 28}" y="${y + 52}" font-size="28"
              fill="var(--tono)" font-weight="700" letter-spacing="3"
              text-anchor="end">RUST</text>`
      : "";
    return `
    <g class="anim emerge" style="--d: ${0.3 + i * 0.7}s">
      <rect x="${X - CAJA.ancho / 2}" y="${y}" width="${CAJA.ancho}" height="${CAJA.alto}"
            rx="${CAJA.radio}" fill="${relleno}" stroke="#d4af37" stroke-width="${grosor}" />
      <text x="${X - CAJA.ancho / 2 + 36}" y="${y + 52}" font-size="30" fill="var(--tono)"
            font-weight="700" letter-spacing="2">0${i + 1}</text>
      <text x="${X}" y="${y + 95}" font-size="44" fill="#d9d9d9" font-weight="600"
            text-anchor="middle">${ctx.esc(pasos[i])}</text>
      ${marca}
    </g>`;
  }).join("");

  const flechas = [0, 1]
    .map((i) => {
      const desde = YS[i] + CAJA.alto + 12;
      const hasta = YS[i + 1] - 12;
      const arranque = 1.1 + i * 0.7;
      return `
    <line x1="${X}" y1="${desde}" x2="${X}" y2="${hasta}" stroke="var(--tono)" stroke-width="4"
          pathLength="1" class="trazo anim" style="--d: ${arranque}s" />
    <polyline points="${X - 15},${hasta - 18} ${X},${hasta} ${X + 15},${hasta - 18}"
              fill="none" stroke="var(--tono)" stroke-width="4" stroke-linecap="round"
              stroke-linejoin="round" pathLength="1" class="trazo anim"
              style="--d: ${arranque + 0.35}s" />`;
    })
    .join("");

  const titulo = datos.texto
    ? `<h2 class="titulo anim entra" style="--d: .25s">${ctx.esc(datos.texto)}</h2>`
    : "";

  return {
    nombre: "diagrama",
    duracion: datos.duracion ?? 12,
    html: `<div class="lleno diagrama">
  <div class="rotulo anim aparece" style="--d: .1s">${ctx.esc(datos.rotulo ?? "Tres pasos")}</div>
  ${titulo}
  <svg viewBox="0 0 888 890" class="lienzo-svg">
    ${cajas}
    ${flechas}
  </svg>
</div>`,
    css: `
.diagrama .titulo { font-size: 78px; margin: 22px 0 0; }
`,
  };
};
