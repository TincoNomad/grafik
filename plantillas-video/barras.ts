// Escena de barras: cuántos núcleos ocupa cada lenguaje.
// Es el argumento del GIL en un solo cuadro, sin una línea de texto técnico.
import type { Ctx } from "../render.ts";

export default (
  datos: {
    filas: { quien: string; activos: number }[];
    nucleos?: number;
    texto?: string;
    rotulo?: string;
    duracion?: number;
  },
  ctx: Ctx,
) => {
  const nucleos = datos.nucleos ?? 4;

  const filas = datos.filas
    .map((fila, i) => {
      const barras = Array.from({ length: nucleos }, (_, k) => {
        const activo = k < fila.activos;
        return `<i class="${activo ? "on" : ""} anim emerge" style="--d: ${
          0.5 + i * 0.35 + k * 0.1
        }s"></i>`;
      }).join("");
      return `
    <div class="linea anim entra" style="--d: ${0.4 + i * 0.35}s">
      <span class="quien">${ctx.esc(fila.quien)}</span>
      <span class="nucleos">${barras}</span>
      <span class="cuenta">${fila.activos} de ${nucleos}</span>
    </div>`;
    })
    .join("");

  return {
    nombre: "barras",
    duracion: datos.duracion ?? 5,
    html: `<div class="lleno barras">
  <div class="rotulo anim aparece" style="--d: .1s">${ctx.esc(datos.rotulo ?? "El GIL")}</div>
  ${datos.texto ? `<h2 class="titulo anim entra" style="--d: .25s">${ctx.esc(datos.texto)}</h2>` : ""}
  <div class="lineas">${filas}</div>
</div>`,
    css: `
.barras .titulo { font-size: 88px; margin: 22px 0 0; }
.barras .lineas { margin-top: 64px; display: flex; flex-direction: column; gap: 54px; }
.barras .linea { display: flex; align-items: center; gap: 24px; }
.barras .quien {
  width: 150px;
  font-size: 40px;
  font-weight: 700;
  letter-spacing: -.01em;
}
/* Las barras se reparten el ancho que queda: así caben con cualquier margen. */
.barras .nucleos { display: flex; gap: 10px; flex: 1; }
.barras .nucleos i {
  display: block;
  flex: 1;
  height: 64px;
  border-radius: 12px;
  border: 3px solid rgba(212, 175, 55, .28);
  background: transparent;
}
.barras .nucleos i.on { background: var(--tono, var(--oro)); border-color: var(--tono, var(--oro)); }
.barras .cuenta { font-size: 28px; white-space: nowrap; color: rgba(217, 217, 217, .55); }
`,
  };
};
