// Verificación end-to-end de video.ts: proyecto temporal, dos escenas, mp4 real.
// Uso: bun prueba-video.ts
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import assert from "node:assert/strict";
import { join } from "node:path";

const VIDEO = join(import.meta.dir, "video.ts");
const raiz = mkdtempSync(join(tmpdir(), "grafik-video-prueba-"));
const proyecto = join(raiz, "proyecto-falso");

const correr = (extra: string[] = []) =>
  execFileSync("bun", [VIDEO, proyecto, "--out", join(raiz, "salida"), ...extra], {
    stdio: "pipe",
    encoding: "utf8",
  });

const dato = (args: string[]) =>
  execFileSync("ffprobe", args, { encoding: "utf8" }).trim();

try {
  mkdirSync(join(proyecto, "video"), { recursive: true });

  writeFileSync(
    join(proyecto, "video", "guion.ts"),
    `export default [
       { plantilla: "hook", duracion: 1.5, texto: "Prueba\\nde video" },
       { plantilla: "cierre", duracion: 1.5, texto: "Fin" },
     ];
    `,
  );

  // 1. Render rápido: dos escenas de 1.5s son 3.0s de video.
  const carpeta = join(raiz, "salida");
  correr(["--rapido"]);

  const archivos = readdirSync(carpeta).filter((f) => f.endsWith(".mp4"));
  assert.equal(archivos.length, 1, `archivos: ${archivos.join(", ")}`);
  assert.match(archivos[0]!, /^proyecto-falso-\d{8}-\d{6}-rapido\.mp4$/);
  const salida = join(carpeta, archivos[0]!);

  const duracion = Number(dato(["-v", "error", "-show_entries", "format=duration",
    "-of", "default=nw=1:nk=1", salida]));
  assert.ok(Math.abs(duracion - 3) < 0.25, `duración ${duracion}, esperaba 3s`);

  const [ancho, alto] = dato(["-v", "error", "-select_streams", "v:0", "-show_entries",
    "stream=width,height", "-of", "csv=p=0", salida]).split(",");
  assert.equal(ancho, "540", `ancho ${ancho}`);
  assert.equal(alto, "960", `alto ${alto}`);

  // 2. Tiene pista de audio: sin eso algunas redes no aceptan el archivo.
  const audios = dato(["-v", "error", "-select_streams", "a", "-show_entries",
    "stream=codec_name", "-of", "csv=p=0", salida]);
  assert.ok(audios.includes("aac"), `audio: "${audios}"`);

  // 3. Los frames cambian: si fueran iguales, la animación no estaría avanzando.
  const frame = (t: string) => {
    const archivo = join(raiz, `t${t}.png`);
    execFileSync("ffmpeg", ["-y", "-v", "error", "-ss", t, "-i", salida, "-frames:v", "1",
      archivo]);
    return readFileSync(archivo);
  };
  assert.notDeepEqual(frame("0.1"), frame("1.2"), "los frames son idénticos");

  // 4. El aviso de desborde salta con un texto que no cabe.
  writeFileSync(
    join(proyecto, "video", "guion.ts"),
    `export default [
       { plantilla: "hook", duracion: 1, texto: "Antidisestablishmentarianismo" },
     ];
    `,
  );
  const conAviso = correr(["--rapido"]);
  assert.ok(conAviso.includes("aviso"), "no avisó del texto que se sale");

  console.log("✓ prueba OK: 3.0s, 540x960, audio aac, frames distintos y aviso de desborde");
} finally {
  rmSync(raiz, { recursive: true, force: true });
}
