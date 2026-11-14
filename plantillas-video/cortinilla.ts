// Cortinilla: 0.7s de geometría entre dos tomas distintas.
// No es transición encima del video (grafik no saca alfa): es un plano propio
// que tapa el salto de tamaño y el cambio de paleta entre los demos.
import type { Ctx } from "../render.ts";

export default (
  datos: { duracion?: number },
  _ctx: Ctx,
) => {
  const barras = [0, 1, 2, 3, 4]
    .map((i) =>
      `<div class="barra" style="top: ${180 + i * 380}px; --d: ${(i * 0.06).toFixed(2)}s"></div>`
    )
    .join("");

  return {
    nombre: "cortinilla",
    tipo: "transicion",
    duracion: datos.duracion ?? 0.72,
    html: `<div class="cortinilla-lienzo">
  ${barras}
  <div class="anillo"></div>
  <div class="punto"></div>
</div>`,
    css: `
.cortinilla-lienzo {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: var(--fondo);
}
/* La cortinilla entra en fundido pero sale en corte: si se disuelve, las barras
   desaparecen a mitad del barrido y se pierde el golpe. */
.escena:has(.cortinilla-lienzo) {
  animation: fundidoEntra .25s linear both;
  animation-delay: calc(var(--t, 0) * -1s);
  animation-play-state: paused;
}
.barra {
  position: absolute;
  left: 0;
  width: 100%;
  height: 150px;
  background: linear-gradient(90deg, rgba(212, 175, 55, .55), rgba(212, 175, 55, 0) 78%);
  transform-origin: left center;
  animation: barre .42s cubic-bezier(.22, 1, .36, 1) both;
  animation-delay: calc(var(--d, 0s) - var(--t, 0) * 1s);
  animation-play-state: paused;
}
.anillo {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 620px;
  height: 620px;
  margin: -310px 0 0 -310px;
  border: 3px solid var(--oro);
  border-radius: 50%;
  animation: emerge .5s cubic-bezier(.22, 1, .36, 1) both;
  animation-delay: calc(.1s - var(--t, 0) * 1s);
  animation-play-state: paused;
}
.punto {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 26px;
  height: 26px;
  margin: -13px 0 0 -13px;
  border-radius: 50%;
  background: var(--oro);
  animation: aparece .3s ease-out both;
  animation-delay: calc(.05s - var(--t, 0) * 1s);
  animation-play-state: paused;
}
`,
  };
};
