// Escena de código: las líneas entran una por una.
// Colorea solo las palabras que le pases en `clave`; no hay resaltador de
// sintaxis completo, para no equivocarse con lenguajes que no conoce.
// `iconos` pone la fila 🐍 🤝 🦀 para marcar quién habla en cada pantalla.
import type { Ctx } from "../render.ts";

export default (
  datos: {
    lineas: string[];
    clave?: string[];
    iconos?: boolean;
    texto?: string;
    rotulo?: string;
    duracion?: number;
  },
  ctx: Ctx,
) => {
  // Las más largas primero: si una clave contiene a otra, gana la específica.
  const claves = [...(datos.clave ?? [])].sort((a, b) => b.length - a.length);

  const pintar = (linea: string) => {
    // `# ` es comentario en Python, pero `#[` es un atributo de Rust.
    if (/^\s*(\/\/|#\s|#$)/.test(linea)) return `<span class="com">${ctx.esc(linea)}</span>`;
    let salida = ctx.esc(linea);
    for (const palabra of claves) {
      const buscado = ctx.esc(palabra).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      salida = salida.replace(new RegExp(buscado, "g"), `<span class="clave">${buscado}</span>`);
    }
    return salida || "&nbsp;";
  };

  const lineas = datos.lineas
    .map(
      (linea, i) =>
        `<span class="ln anim aparece" style="--d: ${0.35 + i * 0.14}s">${pintar(linea)}</span>`,
    )
    .join("");

  const iconos = datos.iconos
    ? `<div class="iconos anim aparece" style="--d: .05s">
         <span>🐍</span><span class="junta">🤝</span><span>🦀</span>
       </div>`
    : "";

  return {
    nombre: "codigo",
    duracion: datos.duracion ?? 5,
    html: `<div class="tarjeta codigo">
  ${iconos}
  <div class="rotulo anim aparece" style="--d: .1s">${ctx.esc(datos.rotulo ?? "El enchufe")}</div>
  ${datos.texto ? `<h2 class="titulo anim entra" style="--d: .25s">${ctx.esc(datos.texto)}</h2>` : ""}
  <pre>${lineas}</pre>
</div>`,
    css: `
.codigo .titulo { font-size: 58px; margin: 16px 0 0; }
.codigo .iconos {
  display: flex;
  align-items: center;
  gap: 18px;
  font-size: 52px;
  line-height: 1;
  margin-bottom: 26px;
}
.codigo .iconos .junta { font-size: 40px; }
`,
  };
};
