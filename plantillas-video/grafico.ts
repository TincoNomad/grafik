// Escena de gráfico: barras horizontales de tiempo por endpoint.
// Sin cifras a propósito: muestra dónde pesa, no cuánto. Poner números
// inventados en un video que pide decidir con datos sería contradecirse.
import type { Ctx } from "../render.ts";

export default (
  datos: {
    filas: { etiqueta: string; valor: number; destacado?: boolean }[];
    texto?: string;
    rotulo?: string;
    nota?: string;
    duracion?: number;
  },
  ctx: Ctx,
) => {
  const filas = datos.filas
    .slice(0, 6)
    .map((fila, i) => {
      const ancho = Math.max(2, Math.min(100, fila.valor));
      return `
    <div class="linea anim aparece" style="--d: ${0.35 + i * 0.16}s">
      <span class="etiqueta">${ctx.esc(fila.etiqueta)}</span>
      <span class="pista">
        <i class="graf-barra barra-corre${fila.destacado ? " fuerte" : ""} anim"
           style="--d: ${0.45 + i * 0.16}s; width: ${ancho}%"></i>
      </span>
    </div>`;
    })
    .join("");

  return {
    nombre: "grafico",
    duracion: datos.duracion ?? 6,
    html: `<div class="lleno grafico">
  <div class="rotulo anim aparece" style="--d: .1s">${ctx.esc(datos.rotulo ?? "Medir primero")}</div>
  ${datos.texto ? `<h2 class="titulo anim entra" style="--d: .25s">${ctx.esc(datos.texto)}</h2>` : ""}
  <div class="lineas">${filas}</div>
  ${datos.nota ? `<p class="nota anim aparece" style="--d: 1.4s">${ctx.esc(datos.nota)}</p>` : ""}
</div>`,
    css: `
.grafico .titulo { font-size: 84px; margin: 22px 0 0; }
.grafico .lineas {
  margin-top: 58px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}
.grafico .linea { display: flex; align-items: center; gap: 26px; }
.grafico .etiqueta {
  flex: none;
  width: 200px;
  font-size: 34px;
  color: rgba(217, 217, 217, 0.72);
  text-align: right;
}
.grafico .pista {
  flex: 1;
  height: 48px;
  overflow: hidden;
  border-radius: 6px;
  background: rgba(217, 217, 217, 0.06);
}
.grafico .graf-barra {
  display: block;
  height: 100%;
  border-radius: 6px;
  background: rgba(217, 217, 217, 0.26);
  transform: translateX(-100%);
}
/* Clase suelta a propósito: .escena .anim tiene dos clases y le gana el
   animation-delay, así el retraso escalonado sigue funcionando. */
.barra-corre {
  animation: entraBarra 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.grafico .graf-barra.fuerte { background: var(--tono, var(--oro)); }
.grafico .nota {
  margin-top: 46px;
  font-size: 30px;
  letter-spacing: 0.06em;
  color: rgba(217, 217, 217, 0.45);
}
@keyframes entraBarra {
  to {
    transform: translateX(0);
  }
}
`,
  };
};
