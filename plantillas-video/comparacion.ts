// Escena de comparación: dos bloques apilados con una línea en medio.
// Apilados y no en columnas porque en 9:16 dos columnas quedan de 350px y todo
// se parte en dos renglones. Vertical aprovecha el alto del cuadro.
import type { Ctx } from "../render.ts";

export default (
  datos: {
    izquierda: { titulo: string; items: string[] };
    derecha: { titulo: string; items: string[] };
    texto?: string;
    rotulo?: string;
    duracion?: number;
  },
  ctx: Ctx,
) => {
  const bloque = (
    lado: { titulo: string; items: string[] },
    roja: boolean,
    retraso: number,
  ) => `
    <div class="bloque${roja ? " roja" : ""}">
      <div class="cabecera anim aparece" style="--d: ${retraso}s">${ctx.esc(lado.titulo)}</div>
      <ul>
        ${lado.items
          .map(
            (item, k) =>
              `<li class="anim entra" style="--d: ${retraso + 0.2 + k * 0.16}s">
                 ${ctx.esc(item)}
               </li>`,
          )
          .join("")}
      </ul>
    </div>`;

  return {
    nombre: "comparacion",
    duracion: datos.duracion ?? 8,
    html: `<div class="lleno comparacion">
  <div class="rotulo anim aparece" style="--d: .1s">${ctx.esc(datos.rotulo ?? "Dos lados")}</div>
  ${datos.texto ? `<h2 class="titulo anim entra" style="--d: .25s">${ctx.esc(datos.texto)}</h2>` : ""}
  <div class="bloques">
    ${bloque(datos.izquierda, false, 0.6)}
    <div class="division anim aparece" style="--d: 1.1s"></div>
    ${bloque(datos.derecha, true, 1.3)}
  </div>
</div>`,
    css: `
.comparacion .titulo { font-size: 92px; margin: 22px 0 0; }
.bloques { margin-top: 52px; }
.cabecera {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: .16em;
  text-transform: uppercase;
  color: var(--acento);
}
.cabecera.roja, .bloque.roja .cabecera { color: var(--acento-2); }
.bloque ul { list-style: none; display: flex; flex-direction: column; gap: 20px; margin-top: 24px; }
.bloque li { font-size: 54px; line-height: 1.15; padding-left: 34px; position: relative; }
.bloque li::before {
  content: "";
  position: absolute;
  left: 0;
  top: .58em;
  width: 16px;
  height: 4px;
  background: color-mix(in srgb, var(--texto) 45%, transparent);
}
.bloque.roja li::before { background: var(--acento-2); }
.division {
  height: 1px;
  margin: 44px 0;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--acento) 35%, transparent), transparent);
}
`,
  };
};
