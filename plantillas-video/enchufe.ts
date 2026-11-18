// Escena del enchufe: la app entera en una caja, un módulo resaltado y una
// flecha que sale hacia el motor en Rust. Reemplaza a la lista de "se queda /
// se va": el mismo contenido, pero se ve la frontera.
import type { Ctx } from "../render.ts";

const ANCHO = 888;
const CHIP = { ancho: 376, alto: 86 };
const XS = [56, 472];
const YS_CHIP = [104, 206];

export default (
  datos: {
    modulos?: string[];
    modulo?: string;
    motor?: string;
    texto?: string;
    rotulo?: string;
    nota?: string;
    duracion?: number;
  },
  ctx: Ctx,
) => {
  const modulos = datos.modulos ?? ["front", "http", "datos", "auth"];
  const resaltado = datos.modulo ?? "cálculo";
  const motor = datos.motor ?? "motor · Rust";

  const chips = modulos
    .slice(0, 4)
    .map((modulo, i) => {
      const x = XS[i % 2];
      const y = YS_CHIP[Math.floor(i / 2)];
      return `
    <g class="anim emerge" style="--d: ${0.5 + i * 0.12}s">
      <rect x="${x}" y="${y}" width="${CHIP.ancho}" height="${CHIP.alto}" rx="16"
            fill="color-mix(in srgb, var(--texto) 5%, transparent)" stroke="color-mix(in srgb, var(--texto) 22%, transparent)" stroke-width="2" />
      <text x="${x + CHIP.ancho / 2}" y="${y + 55}" font-size="34" fill="color-mix(in srgb, var(--texto) 70%, transparent)"
            text-anchor="middle">${ctx.esc(modulo)}</text>
    </g>`;
    })
    .join("");

  const titulo = datos.texto
    ? `<h2 class="titulo anim entra" style="--d: .25s">${ctx.esc(datos.texto)}</h2>`
    : "";
  const nota = datos.nota ?? "";

  return {
    nombre: "enchufe",
    duracion: datos.duracion ?? 9,
    html: `<div class="lleno enchufe">
  <div class="rotulo anim aparece" style="--d: .1s">${ctx.esc(datos.rotulo ?? "La frontera")}</div>
  ${titulo}
  <svg viewBox="0 0 ${ANCHO} 720" class="lienzo-svg">
    <g class="anim emerge" style="--d: .3s">
      <rect x="20" y="20" width="848" height="470" rx="26"
            fill="color-mix(in srgb, var(--acento) 4%, transparent)" stroke="color-mix(in srgb, var(--acento) 45%, transparent)" stroke-width="2.5" />
      <text x="56" y="78" font-size="26" fill="color-mix(in srgb, var(--texto) 50%, transparent)"
            letter-spacing="5" font-weight="700">TU APP</text>
    </g>
    ${chips}
    <g class="anim emerge" style="--d: 1.15s">
      <rect x="56" y="310" width="776" height="100" rx="16"
            fill="color-mix(in srgb, var(--acento-2) 14%, transparent)" stroke="var(--tono)" stroke-width="3.5" />
      <text x="444" y="372" font-size="40" fill="#f2f2f2" font-weight="600"
            text-anchor="middle">${ctx.esc(resaltado)}</text>
    </g>
    <line x1="444" y1="410" x2="444" y2="556" stroke="var(--tono)" stroke-width="4"
          pathLength="1" class="trazo anim" style="--d: 1.7s" />
    <polyline points="429,538 444,556 459,538" fill="none" stroke="var(--tono)"
              stroke-width="4" stroke-linecap="round" stroke-linejoin="round"
              pathLength="1" class="trazo anim" style="--d: 2.05s" />
    <g class="anim emerge" style="--d: 2.2s">
      <rect x="180" y="580" width="528" height="112" rx="20"
            fill="color-mix(in srgb, var(--acento) 16%, transparent)" stroke="#d4af37" stroke-width="3.5" />
      <text x="444" y="648" font-size="40" fill="#d9d9d9" font-weight="600"
            text-anchor="middle">${ctx.esc(motor)}</text>
    </g>
  </svg>
  ${nota ? `<p class="nota anim aparece" style="--d: 2.6s">${ctx.esc(nota)}</p>` : ""}
</div>`,
    css: `
.enchufe .titulo { font-size: 78px; margin: 22px 0 0; }
.enchufe .nota {
  margin-top: 34px;
  font-size: 30px;
  line-height: 1.4;
  color: color-mix(in srgb, var(--texto) 55%, transparent);
}
`,
  };
};
