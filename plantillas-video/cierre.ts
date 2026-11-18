// Escena de cierre: la conclusión, la llamada a la acción y las redes.
// Es el final de todos los videos, así que solo cambian el rótulo y la frase;
// el resto es fijo.
import type { Ctx } from "../render.ts";

// Las dos redes donde está la marca, en trazo 24x24. Cada valor es un `d` con
// los subcaminos del ícono; el color va por CSS.
const REDES: Record<string, string> = {
  instagram:
    "M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9" +
    "A4.5 4.5 0 0 1 7.5 3z" +
    "M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6z" +
    "M17.1 6.8a1.15 1.15 0 1 0 .1 2.3 1.15 1.15 0 0 0-.1-2.3z",
  tiktok:
    "M14.5 3.4v10.7a4.3 4.3 0 1 1-3.6-4.2" +
    "M14.5 3.4c.5 2.5 2.3 4.3 5 4.6",
};

// La frase cambia en cada video. El tamaño se calcula con la línea más larga
// para que una frase futura no se salga del cuadro, y luego se escala: el
// cierre se mira a tamaño de teléfono y con los tamaños base quedaba chico.
const ESCALA = 1.2;

const tamano = (lineas: string[]): number => {
  const larga = Math.max(...lineas.map((l) => l.length), 1);
  const base = larga > 30 ? 56 : larga > 24 ? 64 : larga > 18 ? 72 : 80;
  return Math.round(base * ESCALA);
};

export default (
  datos: {
    texto?: string;
    cta?: string;
    rotulo?: string;
    redes?: boolean;
    /** Reemplaza "Sígueme en @wiracocha_labs". Para reels en otro idioma. */
    redesTexto?: string;
    duracion?: number;
  },
  ctx: Ctx,
) => {
  const cuerpo = datos.texto ? ctx.esc(datos.texto).replace(/\n/g, "<br>") : "";
  const lineas = datos.texto ? datos.texto.split("\n") : [];
  const tam = tamano(lineas);

  const texto = cuerpo
    ? `<p class="titulo anim entra" style="--d: .35s; font-size: ${tam}px">${cuerpo}</p>`
    : "";
  const rotulo = datos.rotulo
    ? `<div class="rotulo anim aparece" style="--d: .1s">${ctx.esc(datos.rotulo)}</div>`
    : "";
  const escudo = ctx.logo
    ? `<img class="escudo anim emerge" style="--d: 0s" src="${ctx.logo}" alt="">`
    : "";

  // Solo Instagram y TikTok con el usuario. Nada de seguir, like, guardar:
  // esos son botones de la app, no de la marca.
  const redes =
    datos.redes === false
      ? ""
      : `<div class="redes anim aparece" style="--d: 1.4s">
    ${Object.entries(REDES)
      .map(
        ([nombre, camino]) =>
          `<svg class="red" viewBox="0 0 24 24" role="img" aria-label="${nombre}"><path d="${camino}"/></svg>`,
      )
      .join("")}
    <span>${ctx.esc(datos.redesTexto ?? "Sígueme en @wiracocha_labs")}</span>
  </div>`;

  return {
    nombre: "cierre",
    duracion: datos.duracion ?? 4,
    html: `<div class="lleno cierre">
  ${escudo}
  ${rotulo}
  ${texto}
  <div class="filete anim" style="--d: .8s"></div>
  <p class="cta anim aparece" style="--d: 1.05s">${ctx.esc(datos.cta ?? "Escríbeme por WhatsApp")}</p>
  ${redes}
</div>`,
    css: `
.cierre {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.cierre .escudo {
  width: 124px;
  height: 124px;
  margin-bottom: 30px;
}
.cierre .rotulo { font-size: 41px; margin-bottom: 26px; }
.cierre .titulo { margin: 0; }
.cierre .filete { margin: 30px auto 0; }
.cierre .cta { margin-top: 26px; font-size: 46px; letter-spacing: .06em; color: var(--acento); }
/* Las redes son un pie, no una acción: mismo gris que el texto chico y sin
   cajas. El oro se queda para el WhatsApp. */
.cierre .redes {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 40px;
  color: color-mix(in srgb, var(--texto) 62%, transparent);
}
.cierre .red {
  width: 38px;
  height: 38px;
  flex: none;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.cierre .redes span {
  font-size: 31px;
  font-weight: 500;
  letter-spacing: .01em;
}
`,
  };
};
