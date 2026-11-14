// Escena de concepto: a sangre, una idea en dos o tres líneas y su explicación.
// Es la que se repite más: cambia el texto, la animación es la misma.
// Con `sprite`, la mascota aparece abajo, sola, como remate de la idea.
import type { Ctx } from "../render.ts";
import { pixel, SPRITES, type NombreSprite } from "../pixel.ts";

export default (
  datos: {
    texto: string;
    sub?: string;
    rotulo?: string;
    sprite?: NombreSprite;
    duracion?: number;
  },
  ctx: Ctx,
) => ({
  nombre: "concepto",
  duracion: datos.duracion ?? 8,
  html: `<div class="lleno concepto${datos.sprite ? " con-dibujo" : ""}">
  <div class="rotulo anim aparece" style="--d: .1s">${ctx.esc(datos.rotulo ?? "Concepto")}</div>
  <h2 class="titulo anim entra" style="--d: .3s">
    ${ctx.esc(datos.texto).replace(/\n/g, "<br>")}
  </h2>
  ${datos.sub ? `<p class="subtitulo anim entra" style="--d: .85s">${ctx.esc(datos.sub)}</p>` : ""}
  <div class="filete anim" style="--d: 1.15s"></div>
  ${
    datos.sprite
      ? `<div class="dibujo anim emerge" style="--d: 1.3s">${pixel(SPRITES[datos.sprite], 17)}</div>`
      : ""
  }
</div>`,
  css: `
.concepto .titulo { font-size: 116px; }
.concepto .subtitulo { max-width: 820px; }
.concepto .dibujo { line-height: 0; margin-top: 52px; }
.concepto.con-dibujo .titulo { font-size: 96px; }
.concepto.con-dibujo .subtitulo { font-size: 46px; }
`,
});
