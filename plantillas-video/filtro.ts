// Escena del filtro: un camino que se abre en dos.
// El tronco baja, las ramas se dibujan, la que solo pregunta se apaga y se cae,
// y la que compra se queda encendida en oro. El movimiento es la idea: no hace
// falta explicar qué filtra.
import type { Ctx } from "../render.ts";
import { barrido as elementoBarrido, type Figura } from "./barrido.ts";

export default (
  datos: {
    texto: string;
    sub?: string;
    rotulo?: string;
    duracion?: number;
    etiquetas?: [string, string];
    barrido?: number;
    figura?: Figura;
    ritmo?: number;
  },
  ctx: Ctx,
) => {
  const [mala, buena] = datos.etiquetas ?? ["pregunta", "compra"];

  const lineas = ctx.esc(datos.texto).split("\n");
  const cuerpo = lineas
    .map((linea, i) =>
      i === lineas.length - 1 && lineas.length > 1 ? `<span class="acento">${linea}</span>` : linea
    )
    .join("<br>");

  return {
    nombre: "filtro",
    duracion: datos.duracion ?? 3.4,
    html: `<div class="tarjeta filtro">
  <div class="rotulo anim aparece" style="--d: .05s">${ctx.esc(datos.rotulo ?? "Filtro")}</div>

  <svg class="camino" viewBox="0 0 620 636" aria-hidden="true">
    <path class="tronco trazo anim" pathLength="1" style="--d: .05s" d="M310 8 V214" />

    <g class="mala">
      <path class="trazo anim" pathLength="1" style="--d: .3s"
        d="M310 214 C310 300 150 300 150 390 V514" />
      <circle cx="150" cy="528" r="14" />
      <text x="150" y="600">${ctx.esc(mala)}</text>
    </g>

    <g class="buena">
      <path class="rama trazo anim" pathLength="1" style="--d: .3s"
        d="M310 214 C310 300 470 300 470 390 V514" />
      <circle cx="470" cy="528" r="14" />
      <path class="check anim aparece" style="--d: 1.1s" d="M462 528 l6 6 l13 -14" />
      <text x="470" y="600">${ctx.esc(buena)}</text>
    </g>
  </svg>

  <p class="titulo anim entra" style="--d: 1.35s">${cuerpo}</p>
  ${datos.sub ? `<p class="chico anim aparece" style="--d: 1.85s">${ctx.esc(datos.sub)}</p>` : ""}
</div>${elementoBarrido(datos)}`,
    css: `
.filtro .titulo { font-size: 62px; margin-top: 20px; }
.filtro .chico { margin-top: 18px; font-size: 32px; }

.camino { width: 620px; height: 636px; display: block; align-self: center; margin-top: 6px; }
.camino path, .camino circle { fill: none; stroke-linecap: round; stroke-linejoin: round; }
.camino .tronco { stroke: color-mix(in srgb, var(--texto) 75%, transparent); stroke-width: 6; }
.mala path, .mala circle { stroke: color-mix(in srgb, var(--texto) 50%, transparent); stroke-width: 6; }
.buena .rama, .buena circle { stroke: var(--acento); stroke-width: 6; }
.buena .check { stroke: var(--acento); stroke-width: 6; }
.camino text {
  fill: color-mix(in srgb, var(--texto) 50%, transparent);
  font-size: 32px;
  font-family: var(--sans);
  text-anchor: middle;
  letter-spacing: .04em;
}
.mala { animation: cae .45s ease-in both; animation-delay: calc(.95s - var(--t, 0) * 1s); animation-play-state: paused; }
.buena text { fill: var(--acento); }

/* El trazo de wiracocha dura 1.1s; aquí el camino tiene que estar listo antes
   de que entre el texto. */
.filtro .tronco, .filtro .rama { animation-duration: .55s; }

@keyframes cae {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: .18; transform: translateY(28px); }
}
`,
  };
};
