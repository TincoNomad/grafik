// Placa: el marco donde se mete la grabación de pantalla del demo.
// Va aparte del video porque un MP4 opaco no puede tener ventana; ffmpeg
// superpone la grabación encima de esta imagen, en el hueco de 944x1360.
//
// Geometría: la ventana arranca en y=380 y termina en 1740. Los 180px de abajo
// quedan vacíos a propósito: TikTok e Instagram los tapan con la descripción
// y los botones. El texto va arriba, que es donde no hay nada.
type Ctx = { proyecto: string; esc: (t: string) => string };

export default (_ctx: Ctx) => ({
  nombre: "placa",
  html: `<div class="slide placa">
  <div class="ventana"></div>
  <span class="chip">EJEMPLO</span>
</div>`,
  css: `
.placa {
  position: relative;
  background: #2f2e2b;
  font-family: -apple-system, system-ui, "Inter", sans-serif;
  -webkit-font-smoothing: antialiased;
}
.chip {
  position: absolute;
  right: 68px;
  top: 148px;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: .14em;
  color: #d4af37;
  border: 1px solid rgba(212, 175, 55, .5);
  border-radius: 8px;
  padding: 9px 18px;
}
.ventana {
  position: absolute;
  left: 67px;
  top: 379px;
  width: 946px;
  height: 1362px;
  border: 1px solid rgba(212, 175, 55, .35);
}
`,
});
