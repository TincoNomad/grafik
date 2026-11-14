// Escena de confianza: tres sellos, uno por duda del comprador.
// Se dibujan en SVG porque el ffmpeg de Homebrew no tiene drawtext ni fuentes.
import type { Ctx } from "../render.ts";
import { barrido as elementoBarrido, type Figura } from "./barrido.ts";

const ICONOS: Record<string, string> = {
  escudo:
    `M32 6 L54 15 V32 C54 44 44 54 32 58 C20 54 10 44 10 32 V15 Z`,
  caja:
    `M8 20 L32 8 L56 20 V44 L32 56 L8 44 Z M8 20 L32 32 L56 20 M32 32 V56`,
  pago:
    `M22 10 H44 C48 10 50 12 50 16 V48 C50 52 48 54 44 54 H22 C18 54 16 52 16 48 V16
     C16 12 18 10 22 10 Z M20 44 H46`,
};

export default (
  datos: {
    sellos: { icono: keyof typeof ICONOS | string; texto: string }[];
    texto?: string;
    rotulo?: string;
    duracion?: number;
    /** Segundos desde el inicio de la escena en que arranca el barrido. */
    barrido?: number;
    figura?: Figura;
    ritmo?: number;
  },
  ctx: Ctx,
) => {
  const filas = datos.sellos
    .map((s, i) => {
      const d = (0.12 + i * 0.26).toFixed(2);
      return `<div class="sello anim entra" style="--d: ${d}s">
    <svg viewBox="0 0 64 64" width="70" height="70" aria-hidden="true">
      <path d="${ICONOS[s.icono] ?? ICONOS.escudo}" />
    </svg>
    <span>${ctx.esc(s.texto)}</span>
  </div>`;
    })
    .join("");

  return {
    nombre: "sellos",
    duracion: datos.duracion ?? 3.2,
    html: `<div class="tarjeta confianza">
  <div class="rotulo anim aparece" style="--d: .05s">${ctx.esc(datos.rotulo ?? "Confianza")}</div>
  ${filas}
  ${
      datos.texto
        ? `<p class="chico anim aparece" style="--d: .95s">${ctx.esc(datos.texto)}</p>`
        : ""
    }
</div>${elementoBarrido(datos)}`,
    css: `
.confianza { justify-content: center; }
.confianza .rotulo { margin-bottom: 46px; }
.sello { display: flex; align-items: center; gap: 30px; margin-bottom: 34px; }
.sello svg { flex: none; }
.sello path {
  fill: none;
  stroke: var(--oro);
  stroke-width: 3.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.sello span { font-size: 56px; font-weight: 600; line-height: 1.1; }
.confianza .chico { margin-top: 12px; font-size: 36px; }
`,
  };
};
