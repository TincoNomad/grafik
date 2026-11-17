// Título del tramo. Va suelto sobre el carbón del marco, sin píldora ni franja:
// el fondo se pinta del mismo #2f2e2b para que se funda con el marco y sólo se
// vea el texto. 940x130, centrado en x=70.
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
    ancho: 940,
    alto: 130,
    html: `<div class="slide burbuja">
  <p class="texto">${ctx.esc(texto)}</p>
</div>`,
    css: `
.burbuja {
  display: flex;
  align-items: center;
  justify-content: center;
  /* El mismo carbón del marco: así el PNG desaparece y sólo queda el texto. */
  background: #2f2e2b;
  font-family: -apple-system, system-ui, "Inter", sans-serif;
  -webkit-font-smoothing: antialiased;
}
.texto {
  margin: 0;
  font-size: 54px;
  font-weight: 600;
  line-height: 1;
  color: #f2efe6;
}
`,
  }));
