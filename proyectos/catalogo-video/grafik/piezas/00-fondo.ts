// Fondo del video: campo de estrellas.
// Reemplaza al `fondo.png` de ejemplo de grafik, que traía pegada una maqueta
// de interfaz de TikTok (SEGUIR · LIKE · GUARDAR · COMENTAR · COMPARTIR).
type Ctx = { proyecto: string; esc: (t: string) => string };

// Generador con semilla: el fondo tiene que salir idéntico en cada build.
const azar = (semilla: number) => () => {
  semilla = (semilla * 1664525 + 1013904223) % 4294967296;
  return semilla / 4294967296;
};

export default (_ctx: Ctx) => {
  const r = azar(20261112);
  const estrellas: string[] = [];

  for (let i = 0; i < 520; i++) {
    const x = (r() * 1080).toFixed(1);
    const y = (r() * 1920).toFixed(1);
    const radio = (r() * 1.5 + 0.4).toFixed(2);
    const opacidad = (r() * 0.5 + 0.08).toFixed(2);
    // Una de cada diez va en oro, como el resto de la marca.
    const color = r() > 0.9 ? "#d4af37" : "#e8e4d9";
    estrellas.push(
      `<circle cx="${x}" cy="${y}" r="${radio}" fill="${color}" opacity="${opacidad}"/>`,
    );
  }

  return {
    nombre: "fondo",
    html: `<div class="slide fondo">
  <svg viewBox="0 0 1080 1920" preserveAspectRatio="none" aria-hidden="true">
    ${estrellas.join("\n    ")}
  </svg>
</div>`,
    css: `
.fondo { position: relative; background: #131211; }
.fondo svg { width: 100%; height: 100%; display: block; }
/* Un brillo apenas más claro al centro para que no sea una pared negra. */
.fondo::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    70% 55% at 50% 45%,
    rgba(217, 217, 217, .05),
    rgba(0, 0, 0, .35) 100%
  );
}
`,
  };
};
