// Escena de golpe: una sola palabra a toda pantalla, opcionalmente con un
// sprite pixelado debajo. Rompe el ritmo entre dos escenas explicativas.
import type { Ctx } from "../render.ts";
import { pixel, SPRITES, type NombreSprite } from "../src/pixel.ts";

export default (
  datos: {
    palabra?: string;
    pie?: string;
    sprite?: NombreSprite;
    duracion?: number;
  },
  ctx: Ctx,
) => {
  const dibujo = datos.sprite
    ? `<div class="dibujo anim emerge" style="--d: .45s">${pixel(SPRITES[datos.sprite], 16)}</div>`
    : "";

  return {
    nombre: "golpe",
    duracion: datos.duracion ?? 2,
    html: `<div class="lleno golpe${datos.sprite ? " con-dibujo" : ""}">
  <div class="palabra anim emerge" style="--d: .05s">${ctx.esc(datos.palabra ?? "NO")}<span
    class="punto anim aparece" style="--d: .4s">.</span></div>
  ${datos.pie ? `<div class="pie anim aparece" style="--d: .55s">${ctx.esc(datos.pie)}</div>` : ""}
  ${dibujo}
</div>`,
    css: `
.golpe { text-align: center; justify-content: center; }
.golpe .palabra {
  font-size: 520px;
  font-weight: 800;
  line-height: .8;
  letter-spacing: -.055em;
  color: var(--hueso);
  transform-box: border-box;
}
.golpe .punto { font-size: 250px; color: var(--oro); }
.golpe .pie {
  margin-top: 40px;
  font-size: 40px;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: rgba(217, 217, 217, .55);
}
.golpe.con-dibujo .palabra { font-size: 330px; }
.golpe.con-dibujo .punto { font-size: 160px; }
.golpe.con-dibujo .pie { margin-top: 24px; }
.golpe .dibujo { margin-top: 34px; line-height: 0; }
`,
  };
};
