#!/usr/bin/env bun
// Compone las escenas de un guion y las renderiza a MP4 vertical.
//
//   bun src/video.ts <ruta-al-proyecto> [--fps 30] [--rapido] [--solo hook] [--out <carpeta>]
//
// Busca `<proyecto>/video/guion.ts`. Cada entrada del guion nombra una plantilla
// de `plantillas-video/` y le pasa sus datos. La duración en segundos vive en el
// guion: cuando haya voz, se cambia ahí y el resto se acomoda solo.
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { renderVideo } from "./render-video.ts";
import type { Ctx } from "./render.ts";

const ANCHO = 1080;
const ALTO = 1920;

// Zona que TikTok e Instagram no tapan con su interfaz. No hay cifra oficial:
// TikTok no publica una, y todas las que circulan son mediciones de terceros.
// Se toma el peor caso y simétrico a los lados para que el mismo video sirva
// en las dos apps: arriba 200, abajo 400, y 165 a cada lado.
const SEGURA = {
  arriba: 200,
  abajo: ALTO - 400,
  izquierda: 165,
  derecha: ANCHO - 165,
};

export interface EscenaVideo {
  nombre: string;
  duracion: number;
  html: string;
  css?: string;
  /** Una transición no es contenido: tapa el lienzo y se salta los chequeos. */
  tipo?: "escena" | "transicion";
}

export interface EntradaGuion {
  plantilla: string;
  duracion: number;
  [dato: string]: unknown;
}

const argv = process.argv.slice(2);
const opciones: Record<string, string> = {};
const libres: string[] = [];

for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  if (!arg.startsWith("--")) {
    libres.push(arg);
    continue;
  }
  const nombre = arg.slice(2);
  const siguiente = argv[i + 1];
  if (siguiente && !siguiente.startsWith("--")) {
    opciones[nombre] = siguiente;
    i++;
  } else {
    opciones[nombre] = "true";
  }
}

const uso =
  "Uso: bun src/video.ts <ruta-al-proyecto> [--fps 30] [--rapido] " +
  "[--solo <plantilla>] [--out <carpeta>]";

const rutaProyecto = libres[0];
if (!rutaProyecto) {
  console.error(uso);
  process.exit(1);
}

const proyecto = resolve(rutaProyecto);
if (!existsSync(proyecto)) {
  console.error(`No existe el proyecto: ${proyecto}`);
  process.exit(1);
}

const rutaGuion = join(proyecto, "video", "guion.ts");
if (!existsSync(rutaGuion)) {
  console.error(`Falta ${rutaGuion}`);
  console.error("Crea esa carpeta y copia el guion de grafik/ejemplo/.");
  process.exit(1);
}

const rapido = opciones.rapido === "true";
const fps = Number(opciones.fps ?? (rapido ? 12 : 30));
const escala = rapido ? 0.5 : 1;

const esc = (texto: string) =>
  texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Fondo y logo son opcionales: si no están en `video/`, la escena va sin ellos. */
const buscar = (nombres: string[]) =>
  nombres.map((n) => join(proyecto, "video", n)).find(existsSync) ?? null;

const rutaFondo = buscar(["fondo.png", "fondo.jpg", "fondo.webp"]);
const rutaLogo = buscar(["logo.png", "logo.svg"]);
const rutaAudio = buscar(["audio.wav", "audio.mp3", "audio.m4a"]);

const ctx: Ctx = {
  proyecto,
  asset: (ruta) => `file://${join(proyecto, ruta)}`,
  esc,
};

// El logo viaja en el contexto para que las plantillas no repitan la ruta.
const ctxVideo = { ...ctx, logo: rutaLogo ? `file://${rutaLogo}` : null };

const importar = async (ruta: string) => (await import(pathToFileURL(ruta).href)).default;

// Un acento por escena, no tres compitiendo. La barra de la tarjeta lo toma.
// Se resuelve por variable CSS, no por hex, para que un tema.css propio cambie
// la paleta sin tocar este archivo.
const TONOS = {
  primario: "var(--acento)",
  secundario: "var(--acento-2)",
  cierre: "var(--acento-3)",
} as const;
const TONO_POR_DEFECTO: Record<string, keyof typeof TONOS> = {
  hook: "primario",
  concepto: "primario",
  diagrama: "secundario",
  cierre: "cierre",
};

const guion: EntradaGuion[] = await importar(rutaGuion);
let entradas = Array.isArray(guion) ? guion : [guion];

if (opciones.solo) {
  entradas = entradas.filter((e) => e.plantilla === opciones.solo);
  if (entradas.length === 0) {
    console.error(`El guion no tiene ninguna escena con plantilla "${opciones.solo}".`);
    process.exit(1);
  }
}

// --- composición ------------------------------------------------------

const escenas: EscenaVideo[] = [];
const cssEscenas: string[] = [];
const tonos: string[] = [];

for (const entrada of entradas) {
  const { plantilla, duracion, ...datos } = entrada;
  if (!plantilla) {
    console.error("Cada entrada del guion necesita una propiedad `plantilla`.");
    process.exit(1);
  }
  if (!duracion || duracion <= 0) {
    console.error(`La escena "${plantilla}" necesita una \`duracion\` en segundos.`);
    process.exit(1);
  }

  const ruta = join(import.meta.dir, "..", "plantillas-video", `${plantilla}.ts`);
  if (!existsSync(ruta)) {
    console.error(`No existe la plantilla ${plantilla} (${ruta}).`);
    process.exit(1);
  }

  const pedido = datos.tono as string | undefined;
  const nombreTono = pedido ?? TONO_POR_DEFECTO[plantilla] ?? "primario";
  const tono = TONOS[nombreTono as keyof typeof TONOS] ?? TONOS.primario;

  const armar = await importar(ruta);
  const escena: EscenaVideo = await armar({ ...datos, duracion }, ctxVideo);
  if (!escena?.html) {
    console.error(`La plantilla ${plantilla} no devolvió html.`);
    process.exit(1);
  }
  escenas.push({ ...escena, duracion });
  cssEscenas.push(escena.css ?? "");
  tonos.push(tono);
}

let inicio = 0;
const metadatos = escenas.map((e, i) => {
  const meta = { nombre: e.nombre, inicio, duracion: e.duracion, indice: i, tipo: e.tipo };
  inicio += e.duracion;
  return meta;
});
const total = inicio;

// Regla de duración: avisa, no bloquea. Un video largo no es un error, pero
// nadie lo decide a propósito, así que se dice en voz alta cada render.
const LIMITE_TOTAL = 180;
const MAX_ESCENA = 15;
const avisosDuracion: string[] = [];
if (total > LIMITE_TOTAL) {
  avisosDuracion.push(`el video dura ${total}s y el límite es ${LIMITE_TOTAL}s`);
}
for (const meta of metadatos) {
  if (meta.duracion > MAX_ESCENA) {
    avisosDuracion.push(`"${meta.nombre}" dura ${meta.duracion}s (máximo ${MAX_ESCENA}s)`);
  }
}

// Manual de marca del proyecto: si hay un tema.css junto al guion, se inyecta
// después de la paleta por defecto y la sobrescribe por cascada. Solo redefine
// variables; las clases de layout siguen viniendo de wiracocha.css.
const rutaTema = join(proyecto, "tema.css");
const cssTema = existsSync(rutaTema) ? readFileSync(rutaTema, "utf8") : "";

const documento = (): string => `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<style>${readFileSync(join(import.meta.dir, "base.css"), "utf8")}</style>
<style>${readFileSync(join(import.meta.dir, "wiracocha.css"), "utf8")}</style>
<style>${cssTema}</style>
<style>${cssEscenas.join("\n")}</style>
<style>
  html, body { background: #000; }
  .lienzo { width: ${ANCHO}px; height: ${ALTO}px; }
</style>
</head><body>
<div class="lienzo"${rutaFondo ? ` style="--fondo-img: url('file://${rutaFondo}')"` : ""}>
${escenas
  .map((e, i) => {
    const clase = i === escenas.length - 1 ? "escena final" : "escena";
    const estilo = `--dur: ${e.duracion}s; --tono: ${tonos[i]}`;
    return `<section class="${clase}" id="e${i}" style="${estilo}">${e.html}</section>`;
  })
  .join("\n")}
</div>
<script>
const ZONAS = ${JSON.stringify(metadatos)};
const SEGURA = ${JSON.stringify(SEGURA)};
window.DUR = ${total};

let activa = -1;
window.seek = (t) => {
  let i = ZONAS.findIndex((z) => t < z.inicio + z.duracion);
  if (i < 0) i = ZONAS.length - 1;
  if (i !== activa) {
    document.querySelectorAll(".escena").forEach((el, k) => {
      el.style.display = k === i ? "flex" : "none";
    });
    activa = i;
  }
  const zona = ZONAS[i];
  document.getElementById("e" + i).style.setProperty("--t", String(t - zona.inicio));
};

// Mide cada escena en su estado final y avisa de lo que se sale de la zona segura.
window.revisar = () => {
  const avisos = [];
  const zonas = [...document.querySelectorAll(".escena")];
  const antes = zonas.map((z) => z.style.display);

  zonas.forEach((zona, i) => {
    // Una transición tapa el lienzo a propósito: medirla contra la zona segura
    // solo produce avisos falsos.
    if (ZONAS[i].tipo === "transicion") return;
    zonas.forEach((z, k) => { z.style.display = k === i ? "flex" : "none"; });
    zona.style.setProperty("--t", String(Math.max(0, ZONAS[i].duracion - 0.35)));

    for (const el of zona.querySelectorAll("*")) {
      const propio = [...el.childNodes].some(
        (n) => n.nodeType === 3 && n.textContent.trim() !== "",
      );
      const grafico = ["IMG", "svg", "SVG", "VIDEO", "CANVAS"].includes(el.tagName);
      if (!propio && !grafico) continue;

      const estilo = getComputedStyle(el);
      if (estilo.visibility === "hidden" || Number(estilo.opacity) < 0.05) continue;

      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) continue;

      const fuera = [];
      const sobra = (borde, exceso) => {
        if (exceso > 0.5) fuera.push(borde + " " + Math.round(exceso) + "px");
      };
      sobra("arriba", SEGURA.arriba - r.top);
      sobra("abajo", r.bottom - SEGURA.abajo);
      sobra("izquierda", SEGURA.izquierda - r.left);
      sobra("derecha", r.right - SEGURA.derecha);

      // Las cajas de bloque no crecen con el texto: se mide el contenido, no la caja.
      if (propio && el.scrollWidth > el.clientWidth + 2) {
        fuera.push("texto más ancho que su caja (" + el.scrollWidth + "px)");
      }
      if (fuera.length) {
        const quien = (el.getAttribute("class") || el.tagName).split(" ")[0];
        avisos.push(ZONAS[i].nombre + " · <" + quien + "> se sale " + fuera.join(", "));
      }
    }
  });

  zonas.forEach((z, i) => { z.style.display = antes[i]; });
  activa = -1;
  return avisos;
};
</script>
</body></html>`;

const carpetaSalida = opciones.out
  ? resolve(opciones.out)
  : join(homedir(), "Movies", "grafik");
mkdirSync(carpetaSalida, { recursive: true });
const slug = basename(proyecto)
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-");

// El nombre lleva fecha y hora para que el más reciente se ordene solo y no se
// confunda con un render anterior del mismo proyecto.
const dos = (n: number) => String(n).padStart(2, "0");
const ahora = new Date();
const sello =
  `${ahora.getFullYear()}${dos(ahora.getMonth() + 1)}${dos(ahora.getDate())}-` +
  `${dos(ahora.getHours())}${dos(ahora.getMinutes())}${dos(ahora.getSeconds())}`;
const sufijo = rapido ? "-rapido" : "";
const salida = join(carpetaSalida, `${slug}-${sello}${sufijo}.mp4`);
const bonita = (ruta: string) => ruta.replace(homedir(), "~");

console.log(
  `${escenas.length} escena(s), ${total.toFixed(1)}s a ${fps}fps ` +
    `(${ANCHO * escala}×${ALTO * escala})`,
);
if (rutaAudio) console.log(`♪ ${basename(rutaAudio)}`);
for (const aviso of avisosDuracion) console.log(`⚠ ${aviso}`);

const resultado = await renderVideo({
  html: documento(),
  ancho: ANCHO,
  alto: ALTO,
  fps,
  escala,
  salida,
  // Un fondo fotográfico es ruido: en PNG cada frame pesa 2 MB y tarda 684 ms.
  // En JPEG q97 baja a 470 KB y 75 ms, y el H.264 final igual va en 4:2:0.
  formato: rutaFondo ? "jpeg" : "png",
  audio: rutaAudio,
});

console.log(`✓ ${bonita(resultado.salida)} — ${resultado.frames} frames`);

if (resultado.avisos.length > 0) {
  console.log(`\n⚠ ${resultado.avisos.length} aviso(s) de acomodo:`);
  for (const aviso of resultado.avisos) console.log(`  ${aviso}`);
} else {
  console.log("✓ nada se sale de la zona segura");
}
