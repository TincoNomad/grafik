// Escena bisagra: el catálogo aparece y la pregunta cambia de dirección.
// La rejilla se arma celda por celda para que se lea "se está ordenando".
import type { Ctx } from "../render.ts";
import { barrido as elementoBarrido, type Figura } from "./barrido.ts";

export default (
  datos: {
    texto: string;
    rotulo?: string;
    duracion?: number;
    /** Segundos desde el inicio de la escena en que arranca el barrido. */
    barrido?: number;
    figura?: Figura;
    ritmo?: number;
  },
  ctx: Ctx,
) => {
  const X = 54;
  const Y = 54;
  const C = 96;
  const hueco = 14;
  const celdas = [0, 1, 2, 3]
    .map((i) => {
      const x = X + (i % 2) * (C + hueco);
      const y = Y + Math.floor(i / 2) * (C + hueco);
      return `<rect class="celda" x="${x}" y="${y}" width="${C}" height="${C}" rx="14"
        style="--d: ${(0.15 + i * 0.12).toFixed(2)}s" />`;
    })
    .join("");

  const lineas = ctx.esc(datos.texto).split("\n");
  const cuerpo = lineas
    .map((linea, i) =>
      i === lineas.length - 1 && lineas.length > 1 ? `<span class="oro">${linea}</span>` : linea
    )
    .join("<br>");

  const barrido = elementoBarrido(datos);

  return {
    nombre: "catalogo",
    duracion: datos.duracion ?? 2.2,
    html: `<div class="tarjeta catalogo">
  <div class="rotulo anim aparece" style="--d: .05s">${ctx.esc(datos.rotulo ?? "Catálogo")}</div>
  <div class="icono anim emerge" style="--d: .05s">
    <svg viewBox="0 0 310 310" width="230" height="230" aria-hidden="true">${celdas}</svg>
  </div>
  <p class="titulo anim entra" style="--d: .35s">${cuerpo}</p>
</div>${barrido}`,
    css: `
.catalogo .titulo { font-size: 76px; }
.icono { margin: 26px 0 8px; }
.celda {
  fill: rgba(212, 175, 55, .12);
  stroke: var(--oro);
  stroke-width: 3;
  transform-box: fill-box;
  transform-origin: center;
  animation: emerge .5s cubic-bezier(.22, 1, .36, 1) both;
  animation-delay: calc(var(--d, 0s) - var(--t, 0) * 1s);
  animation-play-state: paused;
}
`,
  };
};
