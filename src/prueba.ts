// Verificación end-to-end del CLI: proyecto temporal, una pieza, dos tamaños.
// Uso: bun prueba.ts
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import assert from "node:assert/strict";
import { join } from "node:path";

const BUILD = join(import.meta.dir, "build.ts");
const raiz = mkdtempSync(join(tmpdir(), "grafik-prueba-"));
const proyecto = join(raiz, "proyecto-falso");
const piezas = join(proyecto, "grafik", "piezas");

const medidas = (archivo: string) => {
  const buf = readFileSync(archivo);
  assert.equal(buf.subarray(1, 4).toString(), "PNG", `${archivo} no es PNG`);
  return { ancho: buf.readUInt32BE(16), alto: buf.readUInt32BE(20) };
};

const correr = (salida: string, extra: string[] = []) =>
  execFileSync("bun", [BUILD, proyecto, "--out", salida, ...extra], { stdio: "pipe" });

try {
  // Proyecto falso: una pieza que importa datos del proyecto, como haría uno real.
  mkdirSync(piezas, { recursive: true });

  writeFileSync(
    join(proyecto, "datos.ts"),
    `export const cifra = "12.4k";\n`,
  );

  writeFileSync(
    join(piezas, "demo.ts"),
    `import { cifra } from "../../datos.ts";
     type Ctx = { asset: (r: string) => string; esc: (t: string) => string };
     export default ({ asset, esc }: Ctx) => [
       { nombre: "kpi", html: '<div class="slide">' + esc(cifra) + '</div>' },
       { nombre: "logo", html: '<div class="slide"><img src="' + asset("datos.ts") + '"></div>' },
     ];
    `,
  );

  // 1. post por defecto
  const salidaPost = join(raiz, "post");
  correr(salidaPost);
  const pngs = readdirSync(salidaPost).sort();
  assert.deepEqual(pngs, ["proyecto-falso-01-kpi.png", "proyecto-falso-02-logo.png"]);

  for (const png of pngs) {
    const { ancho, alto } = medidas(join(salidaPost, png));
    assert.equal(ancho, 1080, `${png}: ancho ${ancho}`);
    assert.equal(alto, 1350, `${png}: alto ${alto}`);
  }

  // 2. tamaño story
  const salidaStory = join(raiz, "story");
  correr(salidaStory, ["--tamano", "story"]);
  const story = medidas(join(salidaStory, "proyecto-falso-01-kpi.png"));
  assert.equal(story.alto, 1920, `story: alto ${story.alto}`);

  console.log("✓ prueba OK: 2 piezas, 1080x1350 y 1080x1920");
} finally {
  rmSync(raiz, { recursive: true, force: true });
}
