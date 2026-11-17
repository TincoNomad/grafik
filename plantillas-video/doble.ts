// Dos escenas en un solo cuadro. Cada una conserva su HTML y su CSS; esto solo
// las apila con aire en medio. Sirve cuando dos ideas caben juntas y por
// separado dejaban medio lienzo vacío.
//
// Dos detalles que rompen si se ignoran:
// - El barrido de la segunda escena se arma aquí, FUERA del bloque escalado.
//   `transform` crea un bloque contenedor y el barrido se posicionaría contra
//   el bloque de texto en vez de contra el lienzo.
// - El contenido va escalado porque a tamaño natural dos tarjetas no caben en
//   la altura del lienzo.
import type { Ctx } from "../render.ts";
import { barrido as elementoBarrido, type Figura } from "./barrido.ts";
import burbujas from "./burbujas.ts";
import catalogo from "./catalogo.ts";
import filtro from "./filtro.ts";
import sellos from "./sellos.ts";

const MAPA = { burbujas, catalogo, filtro, sellos };

type Nombre = keyof typeof MAPA;
type Armar = (d: Record<string, unknown>, c: Ctx) => { nombre: string; html: string; css: string };

export default (
  datos: {
    a: Nombre;
    datosA?: Record<string, unknown>;
    b: Nombre;
    datosB?: Record<string, unknown>;
    duracion?: number;
    barrido?: number;
    figura?: Figura;
    ritmo?: number;
  },
  ctx: Ctx,
) => {
  const duracion = datos.duracion ?? 6;

  const uno = (MAPA[datos.a] as unknown as Armar)({ ...datos.datosA, duracion }, ctx);
  // Sin barrido: lo ponemos nosotros afuera del bloque escalado.
  const dos = (MAPA[datos.b] as unknown as Armar)({ ...datos.datosB, duracion }, ctx);
  const figura = elementoBarrido({
    barrido: datos.barrido,
    figura: datos.figura,
    ritmo: datos.ritmo,
  });

  return {
    nombre: "doble",
    duracion,
    html: `<div class="lleno doble">
  <div class="apilado">${uno.html}${dos.html}</div>
</div>${figura}`,
    css: `${uno.css}
${dos.css}
.doble { position: static; }

/* La escena trae 165px de padding a cada lado. Aquí se reduce a la mitad para
   que los bloques lleguen cerca de los extremos sin tener que angostarlos. */
.escena:has(.doble) { padding-left: 82px; padding-right: 82px; }
.apilado {
  display: flex;
  flex-direction: column;
  gap: 36px;
  /* Crece simétrico y luego sube. Un origen abajo no sirve: el bloque sin
     escalar es más alto que el lienzo, así que su borde inferior queda fuera y
     el contenido se sale por abajo. */
  transform: translateY(-100px) scale(.79);
  transform-origin: center center;
}
.apilado .tarjeta { min-height: 0; }

/* Uno a cada lado, ninguno centrado. El segundo entra como si fuera otra
   escena: los bloques de adentro ya animaron mientras estaba oculto, así que
   aparece entero, no armándose. */
.apilado > :first-child {
  align-self: flex-start;
  width: 80%;
}
.apilado > :last-child {
  align-self: flex-end;
  width: 80%;
  animation: aparece .5s ease-out both;
  animation-delay: 3.8s;
}
`,
  };
};
