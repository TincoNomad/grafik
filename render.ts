import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, join } from "node:path";

export const TAMANOS = {
  post: { ancho: 1080, alto: 1350 },
  story: { ancho: 1080, alto: 1920 },
  cuadrado: { ancho: 1080, alto: 1080 },
} as const;

export type Tamano = keyof typeof TAMANOS;

/** Contexto que recibe cada pieza. */
export interface Ctx {
  /** Ruta absoluta del proyecto que se está renderizando. */
  proyecto: string;
  /** Convierte una ruta del proyecto en URL para el atributo src. */
  asset: (ruta: string) => string;
  /** Escapa &, < y > dentro del markup. */
  esc: (texto: string) => string;
}

export interface Pieza {
  /** Nombre corto; se usa para el archivo de salida. */
  nombre: string;
  html: string;
  /** CSS propio de la pieza. Se inyecta después de base.css. */
  css?: string;
  /** Sobrescriben el tamaño elegido por consola. */
  ancho?: number;
  alto?: number;
}

const RUTA_CHROME_PLAYWRIGHT = "chrome-mac-arm64/Google Chrome for Testing.app";
const BIN_CHROME_PLAYWRIGHT = `${RUTA_CHROME_PLAYWRIGHT}/Contents/MacOS/Google Chrome for Testing`;

/** Busca el Chrome de Playwright por glob y cae al Chrome instalado en el sistema. */
export const chrome = (): string => {
  const cache = join(homedir(), "Library/Caches/ms-playwright");
  const candidatos: string[] = [];

  if (existsSync(cache)) {
    const versiones = readdirSync(cache)
      .filter((d) => d.startsWith("chromium-"))
      .sort();
    for (const v of versiones) candidatos.push(join(cache, v, BIN_CHROME_PLAYWRIGHT));
  }

  candidatos.push("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome");

  const encontrado = candidatos.find(existsSync);
  if (!encontrado) {
    throw new Error(
      "No encontré un Chrome para renderizar.\n" +
        "Instala el de Playwright con:  bunx playwright install chromium",
    );
  }
  return encontrado;
};

/** Escribe el HTML, le toma la foto con Chrome y la guarda en `salida`. */
export const render = (opciones: {
  html: string;
  ancho: number;
  alto: number;
  salida: string;
}): string => {
  const azar = Math.random().toString(36).slice(2);
  const temporal = join(tmpdir(), `grafik-${Date.now()}-${azar}.html`);
  writeFileSync(temporal, opciones.html);
  mkdirSync(dirname(opciones.salida), { recursive: true });

  try {
    execFileSync(
      chrome(),
      [
        "--headless",
        "--disable-gpu",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        `--window-size=${opciones.ancho},${opciones.alto}`,
        `--screenshot=${opciones.salida}`,
        `file://${temporal}`,
      ],
      { stdio: "ignore" },
    );
  } finally {
    unlinkSync(temporal);
  }

  return opciones.salida;
};
