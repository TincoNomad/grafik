// Escena de gancho: a sangre, sin tarjeta. La tipografía ocupa el cuadro.
// Con `sprite`, el dibujo se pone a la derecha y el texto se achica para
// convivir; sin sprite, el título va solo y grande.
import type { Ctx } from "../render.ts";
import { pixel, SPRITES, type NombreSprite } from "../src/pixel.ts";

export default (
  datos: {
    texto: string;
    rotulo?: string;
    acento?: string;
    sprite?: NombreSprite;
    duracion?: number;
  },
  ctx: Ctx,
) => {
  const lineas = ctx.esc(datos.texto).split("\n");
  const cuerpo = lineas
    .map((linea, i) => {
      // La última línea se pinta en oro: da un punto de entrada a la vista.
      if (i === lineas.length - 1 && lineas.length > 1) return `<span class="oro">${linea}</span>`;
      return linea;
    })
    .join("<br>");

  const rotulo = ctx.esc(datos.rotulo ?? "Wiracocha Labs");
  const acento = datos.acento
    ? `<p class="subtitulo anim entra" style="--d: .9s">${ctx.esc(datos.acento)}</p>`
    : "";
  const dibujo = datos.sprite
    ? `<div class="dibujo anim emerge" style="--d: .35s">${pixel(SPRITES[datos.sprite], 15)}</div>`
    : "";

  return {
    nombre: "hook",
    duracion: datos.duracion ?? 4,
    html: `<div class="lleno hook${datos.sprite ? " con-dibujo" : ""}">
  ${dibujo}
  <div class="texto">
    <div class="rotulo anim aparece" style="--d: .1s">${rotulo}</div>
    <h1 class="titulo anim entra" style="--d: .3s">${cuerpo}</h1>
    ${acento}
    <div class="filete anim" style="--d: 1.15s"></div>
  </div>
</div>`,
    css: `
.hook .titulo { font-size: 138px; }
.hook .dibujo { line-height: 0; margin-bottom: 34px; }
.hook.con-dibujo .titulo { font-size: 96px; }
`,
  };
};
