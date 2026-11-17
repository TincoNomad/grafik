// Renderiza un documento HTML animado a MP4, frame por frame.
//
// Un solo Chrome queda abierto y se le pide una captura por frame por CDP.
// Abrir un Chrome por frame costaría ~890 ms cada uno (medido en este Mac);
// así son ~50 ms. Los PNG van por stdin a ffmpeg: no se escribe nada en disco.
import { spawn, type ChildProcess } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chrome } from "./render.ts";

export interface Sesion {
  /** Deja el documento congelado en el instante t (segundos). */
  ir: (t: number) => Promise<void>;
  /** PNG del frame actual. `escala` reduce la salida sin cambiar el layout. */
  foto: (escala?: number, formato?: "png" | "jpeg" | "webp", calidad?: number) => Promise<Buffer>;
  /** Ejecuta JS en la página y devuelve el resultado. */
  evaluar: (js: string) => Promise<unknown>;
  cerrar: () => void;
}

interface Navegador extends Sesion {
  /** Tamaño del lienzo, en píxeles CSS. */
  ancho: number;
  alto: number;
}

const dormir = (ms: number) => new Promise((ok) => setTimeout(ok, ms));

/** Abre Chrome, carga el HTML y devuelve un puente para mover el tiempo. */
export const navegador = async (
  html: string,
  opciones: { ancho: number; alto: number },
): Promise<Navegador> => {
  const { ancho, alto } = opciones;
  const temporal = mkdtempSync(join(tmpdir(), "grafik-video-"));
  const archivo = join(temporal, "index.html");
  const perfil = join(temporal, "perfil");
  writeFileSync(archivo, html);

  const proceso = spawn(chrome(), [
    "--headless",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    "--allow-file-access-from-files",
    "--force-device-scale-factor=1",
    "--remote-debugging-port=0",
    `--user-data-dir=${perfil}`,
    `--window-size=${ancho},${alto}`,
    "about:blank",
  ]);

  const cerrar = (proceso: ChildProcess) => {
    try {
      proceso.kill();
    } catch {}
    try {
      rmSync(temporal, { recursive: true, force: true });
    } catch {}
  };

  // Chrome escribe el puerto real en DevToolsActivePort; así no hay colisiones.
  const rutaPuerto = join(perfil, "DevToolsActivePort");
  let puerto = "";
  for (let i = 0; i < 200 && !puerto; i++) {
    try {
      puerto = readFileSync(rutaPuerto, "utf8").split("\n")[0].trim();
    } catch {
      await dormir(50);
    }
  }
  if (!puerto) {
    cerrar(proceso);
    throw new Error("Chrome no abrió el puerto de depuración.");
  }

  let wsUrl = "";
  for (let i = 0; i < 100 && !wsUrl; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${puerto}/json/version`);
      wsUrl = (await r.json()).webSocketDebuggerUrl;
    } catch {
      await dormir(50);
    }
  }
  if (!wsUrl) {
    cerrar(proceso);
    throw new Error("Chrome no publicó su endpoint CDP.");
  }

  const ws = new WebSocket(wsUrl);
  await new Promise((ok, mal) => {
    ws.onopen = ok;
    ws.onerror = () => mal(new Error("No pude conectar por WebSocket a Chrome."));
  });

  let siguiente = 0;
  const pendientes = new Map<number, (v: unknown) => void>();
  ws.onmessage = (evento) => {
    const mensaje = JSON.parse(String(evento.data));
    const resolver = pendientes.get(mensaje.id);
    if (resolver) {
      pendientes.delete(mensaje.id);
      resolver(mensaje.result);
    }
  };

  const cmd = (method: string, params: object = {}, sessionId?: string) =>
    new Promise<any>((ok) => {
      const id = ++siguiente;
      pendientes.set(id, ok);
      ws.send(JSON.stringify({ id, method, params, sessionId }));
    });

  const { targetId } = await cmd("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await cmd("Target.attachToTarget", { targetId, flatten: true });
  const sesion = (method: string, params: object = {}) => cmd(method, params, sessionId);

  await sesion("Page.enable");
  await sesion("Runtime.enable");
  await sesion("Emulation.setDeviceMetricsOverride", {
    width: ancho,
    height: alto,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await sesion("Page.navigate", { url: `file://${archivo}` });

  // Espera a que el documento declare su duración: significa que el JS ya corrió.
  let dur = 0;
  for (let i = 0; i < 200 && !dur; i++) {
    const r = await sesion("Runtime.evaluate", { expression: "window.DUR || 0" });
    dur = Number(r.result?.value ?? 0);
    if (!dur) await dormir(50);
  }
  if (!dur) {
    ws.close();
    cerrar(proceso);
    throw new Error("El documento nunca definió window.DUR.");
  }

  const evaluar = async (js: string) => {
    const r = await sesion("Runtime.evaluate", { expression: js, returnByValue: true });
    if (r.exceptionDetails) {
      throw new Error(`Error en la página: ${r.exceptionDetails.text}`);
    }
    return r.result?.value;
  };

  return {
    ancho,
    alto,
    ir: async (t) => {
      await evaluar(`window.seek(${t})`);
    },
    foto: async (escala = 1, formato: "png" | "jpeg" | "webp" = "png", calidad = 95) => {
      const r = await sesion("Page.captureScreenshot", {
        format: formato,
        ...(formato === "png" ? {} : { quality: calidad }),
        clip: { x: 0, y: 0, width: ancho, height: alto, scale: escala },
      });
      return Buffer.from(r.data, "base64");
    },
    evaluar,
    cerrar: () => {
      ws.close();
      cerrar(proceso);
    },
  };
};

/** Renderiza el documento a MP4 y devuelve lo que reportó `window.revisar()`. */
export const renderVideo = async (opciones: {
  html: string;
  ancho: number;
  alto: number;
  fps: number;
  salida: string;
  escala?: number;
  formato?: "png" | "jpeg" | "webp";
  /** Ruta a una pista de audio. Si falta, el video lleva silencio. */
  audio?: string | null;
}): Promise<{ salida: string; avisos: string[]; frames: number }> => {
  const { html, ancho, alto, fps, salida } = opciones;
  const escala = opciones.escala ?? 1;
  const formato = opciones.formato ?? "png";
  const audio = opciones.audio ?? null;
  const nav = await navegador(html, { ancho, alto });

  let ffmpeg: ChildProcess | undefined;
  try {
    const avisos = (await nav.evaluar("window.revisar ? window.revisar() : []")) as string[];
    const dur = Number(await nav.evaluar("window.DUR"));
    const total = Math.max(1, Math.round(dur * fps));

    const entrada = { png: "png", jpeg: "mjpeg", webp: "webp" }[formato];
    const ff = spawn(
      "ffmpeg",
      [
        "-y",
        "-v", "error",
        "-f", "image2pipe",
        "-framerate", String(fps),
        "-c:v", entrada,
        "-i", "-",
        // Con audio real `-shortest` no sirve: si la pista dura menos que el
        // video, cortaría el video. `apad` la rellena con silencio y `-t` fija
        // el final en la duración del video.
        ...(audio
          ? ["-i", audio, "-af", "apad", "-t", (total / fps).toFixed(6)]
          : [
              "-f", "lavfi",
              "-i", "anullsrc=channel_layout=stereo:sample_rate=48000",
              "-shortest",
            ]),
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "18",
        // Un frame capturado en JPEG llega como yuvj420p (rango completo). Si se
        // codifica tal cual, el MP4 queda marcado como pc y al mezclarlo con
        // video de teléfono (tv) los dos se ven distintos. Se convierte a tv.
        "-vf", "scale=out_range=tv",
        "-pix_fmt", "yuv420p",
        "-color_range", "tv",
        "-colorspace", "bt709",
        "-color_primaries", "bt709",
        "-color_trc", "bt709",
        "-g", String(fps),
        "-c:a", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
        salida,
      ],
      { stdio: ["pipe", "ignore", "pipe"] },
    );
    ffmpeg = ff;

    let errorFfmpeg = "";
    ff.stderr!.on("data", (trozo) => {
      errorFfmpeg += String(trozo);
    });

    const listo = new Promise<void>((ok, mal) => {
      ff.on("close", (codigo) =>
        codigo === 0 ? ok() : mal(new Error(`ffmpeg salió con ${codigo}\n${errorFfmpeg}`)),
      );
    });

    for (let f = 0; f < total; f++) {
      await nav.ir(f / fps);
      const png = await nav.foto(escala, formato);
      await new Promise<void>((ok, mal) => {
        ff.stdin!.write(png, (error) => (error ? mal(error) : ok()));
      });
    }
    ff.stdin!.end();
    await listo;

    return { salida, avisos, frames: total };
  } finally {
    nav.cerrar();
    if (ffmpeg && !ffmpeg.killed) ffmpeg.kill();
  }
};

/** Duración real de un mp4, leída de ffprobe. */
export const duracion = (archivo: string): number => {
  const salida = Bun.spawnSync([
    "ffprobe",
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=nw=1:nk=1",
    archivo,
  ]);
  const texto = salida.stdout.toString().trim();
  const valor = Number(texto);
  if (!Number.isFinite(valor)) throw new Error(`ffprobe no dio duración de ${archivo}`);
  return valor;
};
