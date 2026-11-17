// El bot decide: dos conversaciones cortas, una tibia y una fría, cada una con
// su veredicto. Existe para mostrar el filtro en vez de solo nombrarlo.
import type { Ctx } from "../render.ts";

type Caso = {
  mensajes: { de: "el" | "bot"; texto: string }[];
  veredicto: string;
  tibio: boolean;
};

export default (
  datos: {
    rotulo?: string;
    texto?: string;
    caliente?: Caso;
    frio?: Caso;
    duracion?: number;
  },
  ctx: Ctx,
) => {
  const caliente: Caso = datos.caliente ?? {
    mensajes: [
      { de: "el", texto: "Hola, ¿envían a Cusco?" },
      { de: "bot", texto: "Sí, 2 días." },
      { de: "el", texto: "¿Cómo pago?" },
    ],
    veredicto: "Interesado",
    tibio: true,
  };
  const frio: Caso = datos.frio ?? {
    mensajes: [
      { de: "el", texto: "solo mirando" },
      { de: "bot", texto: "¿Te muestro precios?" },
      { de: "el", texto: "no, gracias" },
    ],
    veredicto: "No interesado",
    tibio: false,
  };

  const chat = (caso: Caso, retraso: number) =>
    `<div class="caso ${caso.tibio ? "tibio" : "frio"} anim entra" style="--d: ${retraso}s">
  ${caso.mensajes
    .map((m, i) => {
      const d = (retraso + 0.18 + i * 0.22).toFixed(2);
      return `<div class="msg ${m.de} anim entra" style="--d: ${d}s">${ctx.esc(m.texto)}</div>`;
    })
    .join("\n  ")}
  <div class="veredicto anim aparece" style="--d: ${(retraso + 0.95).toFixed(2)}s">
    ${caso.tibio ? "✅" : "🚫"} ${ctx.esc(caso.veredicto)}
  </div>
</div>`;

  return {
    nombre: "bot",
    duracion: datos.duracion ?? 8,
    html: `<div class="lleno bot">
  <div class="rotulo anim aparece" style="--d: .05s">${
    ctx.esc(datos.rotulo ?? "El bot decide")
  }</div>
  <p class="cabeza anim entra" style="--d: .15s">${
    ctx.esc(datos.texto ?? "Lo que contesta no te llega")
  }</p>
  <div class="par">
  ${chat(caliente, 0.35)}
  ${chat(frio, 0.55)}
  </div>
</div>`,
    css: `
.bot .cabeza {
  margin: 0 0 44px;
  font-size: 64px;
  font-weight: 600;
  line-height: 1.15;
  color: #f2efe6;
}
.bot .par { display: flex; gap: 28px; align-items: stretch; min-height: 970px; }
.bot .caso {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 40px 30px;
  background: #2f2e2b;
  border: 1px solid #4a4843;
  border-radius: 28px;
}
.bot .caso.tibio { border-color: #d4af37; }
.bot .msg {
  max-width: 92%;
  margin-bottom: 14px;
  padding: 20px 26px;
  font-size: 40px;
  line-height: 1.25;
  border-radius: 20px;
  color: #f2efe6;
}
.bot .msg.el { background: #3c3a35; border-bottom-right-radius: 6px; }
.bot .msg.bot {
  margin-left: auto;
  background: #45423b;
  border-bottom-left-radius: 6px;
  color: #cfc9ba;
}
.bot .veredicto {
  margin-top: auto;
  padding: 28px 12px;
  text-align: center;
  font-size: 42px;
  font-weight: 700;
  border-radius: 16px;
}
.bot .tibio .veredicto { background: #d4af37; color: #2f2e2b; }
.bot .frio .veredicto { background: #3c3a35; color: #8f887a; }
`,
  };
};
