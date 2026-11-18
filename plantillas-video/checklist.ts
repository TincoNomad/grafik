// Escena de checklist: preguntas con su casilla marcándose una por una.
// Es la parte que convierte el video en algo aplicable: no dice qué hacer,
// dice qué preguntarse antes de copiar lo que hacen otros.
import type { Ctx } from "../render.ts";
import { pixel, SPRITES, type NombreSprite } from "../src/pixel.ts";

export default (
  datos: {
    items: string[];
    texto?: string;
    rotulo?: string;
    sprite?: NombreSprite;
    duracion?: number;
  },
  ctx: Ctx,
) => {
  const filas = datos.items
    .slice(0, 4)
    .map(
      (item, i) => `
    <div class="fila anim entra" style="--d: ${0.45 + i * 0.45}s">
      <span class="caja anim emerge" style="--d: ${0.55 + i * 0.45}s">
        <span class="marca anim aparece" style="--d: ${1.15 + i * 0.45}s"></span>
      </span>
      <span class="pregunta">${ctx.esc(item)}</span>
    </div>`,
    )
    .join("");

  return {
    nombre: "checklist",
    duracion: datos.duracion ?? 6,
    html: `<div class="lleno checklist">
  <div class="rotulo anim aparece" style="--d: .1s">${ctx.esc(datos.rotulo ?? "Antes de copiar")}</div>
  ${datos.texto ? `<h2 class="titulo anim entra" style="--d: .25s">${ctx.esc(datos.texto)}</h2>` : ""}
  <div class="filas">${filas}</div>
  ${
    datos.sprite
      ? `<div class="dibujo anim emerge" style="--d: .7s">${pixel(SPRITES[datos.sprite], 15)}</div>`
      : ""
  }
</div>`,
    css: `
.checklist .titulo { font-size: 92px; margin: 22px 0 0; }
.checklist .filas {
  margin-top: 62px;
  display: flex;
  flex-direction: column;
  gap: 46px;
}
.checklist .fila { display: flex; align-items: center; gap: 30px; }
.checklist .caja {
  flex: none;
  position: relative;
  width: 62px;
  height: 62px;
  border-radius: 12px;
  border: 3px solid color-mix(in srgb, var(--acento) 45%, transparent);
  background: color-mix(in srgb, var(--acento) 6%, transparent);
}
.checklist .marca {
  position: absolute;
  left: 17px;
  top: 7px;
  width: 16px;
  height: 30px;
  border-style: solid;
  border-color: var(--ok);
  border-width: 0 5px 5px 0;
  transform: rotate(42deg);
}
.checklist .dibujo { line-height: 0; margin-top: 40px; }
.checklist .pregunta {
  font-size: 50px;
  line-height: 1.2;
}
`,
  };
};
