// Escena de cita: una frase sola, centrada, con comillas grandes en oro.
// Baja el ritmo antes del cierre; no lleva gráfico a propósito.
import type { Ctx } from "../render.ts";

export default (
  datos: { texto: string; sub?: string; rotulo?: string; duracion?: number },
  ctx: Ctx,
) => ({
  nombre: "cita",
  duracion: datos.duracion ?? 4,
  html: `<div class="lleno cita">
  <div class="comilla anim aparece" style="--d: .1s">“</div>
  <p class="frase anim entra" style="--d: .3s">
    ${ctx.esc(datos.texto).replace(/\n/g, "<br>")}
  </p>
  ${datos.sub ? `<p class="sub anim aparece" style="--d: .85s">${ctx.esc(datos.sub)}</p>` : ""}
</div>`,
  css: `
.cita {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: center;
}
.cita .comilla {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 260px;
  line-height: 0.62;
  color: var(--acento);
  opacity: 0.45;
  margin-bottom: 10px;
}
.cita .frase {
  font-size: 104px;
  font-weight: 600;
  line-height: 1.06;
  letter-spacing: -0.025em;
  max-width: 840px;
}
.cita .sub {
  margin-top: 44px;
  font-size: 42px;
  line-height: 1.35;
  max-width: 760px;
  color: color-mix(in srgb, var(--texto) 62%, transparent);
}
`,
});
