// Escena de gancho: los mensajes que se repiten todo el día, amontonados.
// Las burbujas entran una tras otra; la frase entra cuando ya se leyó el patrón.
import type { Ctx } from "../render.ts";
import { barrido as elementoBarrido, type Figura } from "./barrido.ts";

export default (
  datos: {
    burbujas?: string[];
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
  const burbujas = datos.burbujas ?? ["precio?", "info?", "cuánto?", "tienes en negro?"];
  const globos = burbujas
    .map((b, i) => `<div class="globo anim entra" style="--d: ${(0.12 + i * 0.19).toFixed(2)}s">${
      ctx.esc(b)
    }</div>`)
    .join("");

  const lineas = ctx.esc(datos.texto).split("\n");
  const cuerpo = lineas
    .map((linea, i) =>
      i === lineas.length - 1 && lineas.length > 1 ? `<span class="acento">${linea}</span>` : linea
    )
    .join("<br>");

  const barrido = elementoBarrido(datos);

  return {
    nombre: "burbujas",
    duracion: datos.duracion ?? 3,
    html: `<div class="tarjeta chat">
  <div class="rotulo anim aparece" style="--d: .05s">${ctx.esc(datos.rotulo ?? "WhatsApp")}</div>
  <div class="globos">${globos}</div>
  <p class="titulo anim entra" style="--d: 1.05s">${cuerpo}</p>
</div>${barrido}`,
    css: `
.chat .titulo { font-size: 68px; margin-top: 56px; }
.globos { display: flex; flex-direction: column; gap: 18px; margin-top: 34px; }
.globo {
  align-self: flex-start;
  padding: 24px 34px;
  border-radius: 30px 30px 30px 10px;
  background: color-mix(in srgb, var(--texto) 11%, transparent);
  border: 1px solid color-mix(in srgb, var(--texto) 16%, transparent);
  font-size: 44px;
  color: var(--texto);
}
.globo:nth-child(even) { align-self: flex-end; border-radius: 30px 30px 10px 30px; }
`,
  };
};
