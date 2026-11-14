// Bandas de texto que van arriba del demo. Una por tramo, para que el pie
// cambie sin recortar la grabación. 1080x110, se superponen en y=250.
// Un idioma por reel: `montaje.sh en` exporta IDIOMA=en.
type Ctx = { proyecto: string; esc: (t: string) => string };

const TEXTOS = {
  es: [
    "Tu catálogo, ordenado",
    "Precio y detalles a la vista",
    "Y el pedido te llega escrito",
  ],
  en: [
    "Your catalog, sorted",
    "Price and details in sight",
    "And the order arrives written",
  ],
};

export default (ctx: Ctx) =>
  TEXTOS[process.env.IDIOMA === "en" ? "en" : "es"].map((texto, i) => ({
    nombre: `banda-${i + 1}`,
    ancho: 1080,
    alto: 110,
    html: `<div class="slide banda">
  <p class="texto">${ctx.esc(texto)}</p>
</div>`,
    css: `
.banda {
  position: relative;
  background: #2f2e2b;
  font-family: -apple-system, system-ui, "Inter", sans-serif;
  -webkit-font-smoothing: antialiased;
}
.texto {
  position: absolute;
  left: 68px;
  top: 16px;
  width: 944px;
  font-size: 50px;
  font-weight: 600;
  line-height: 1.2;
  color: #d9d9d9;
}
`,
  }));
