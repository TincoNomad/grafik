// Escena de lista: filas con nombre y detalle. Sirve para enumerar evidencia
// y que se sienta como expediente, no como opinión.
import type { Ctx } from "../render.ts";

export default (
  datos: {
    items: { nombre: string; detalle: string }[];
    texto?: string;
    rotulo?: string;
    duracion?: number;
  },
  ctx: Ctx,
) => {
  const filas = datos.items
    .slice(0, 4)
    .map(
      (item, i) => `
    <div class="fila anim entra" style="--d: ${0.45 + i * 0.3}s">
      <span class="nombre">${ctx.esc(item.nombre)}</span>
      <span class="detalle">${ctx.esc(item.detalle)}</span>
    </div>`,
    )
    .join("");

  return {
    nombre: "lista",
    duracion: datos.duracion ?? 4,
    html: `<div class="lleno lista">
  <div class="rotulo anim aparece" style="--d: .1s">${ctx.esc(datos.rotulo ?? "La ola")}</div>
  ${datos.texto ? `<h2 class="titulo anim entra" style="--d: .25s">${ctx.esc(datos.texto)}</h2>` : ""}
  <div class="filas">${filas}</div>
</div>`,
    css: `
.lista .titulo { font-size: 92px; margin: 22px 0 0; }
.lista .filas { margin-top: 56px; }
.lista .fila {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 30px;
  padding: 30px 0;
  border-bottom: 1px solid rgba(212, 175, 55, .18);
}
.lista .fila:last-child { border-bottom: 0; }
.lista .nombre {
  font-size: 62px;
  font-weight: 700;
  letter-spacing: -.02em;
}
.lista .detalle {
  font-size: 32px;
  color: rgba(217, 217, 217, .6);
  text-align: right;
}
`,
  };
};
