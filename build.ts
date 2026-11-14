#!/usr/bin/env bun
// Renderiza las piezas gráficas de un proyecto.
//
//   bun build.ts <ruta-al-proyecto> [--tamano post|story|cuadrado] [--out <carpeta>]
//
// Busca `<proyecto>/grafik/piezas/*.ts`, y cada pieza devuelve uno o varios
// slides. El orden del arreglo es el orden del carrusel.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { render, TAMANOS, type Ctx, type Pieza, type Tamano } from "./render.ts";

const BASE = readFileSync(join(import.meta.dir, "base.css"), "utf8");

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

const tamanos = Object.keys(TAMANOS).join("|");
const uso = `Uso: bun build.ts <ruta-al-proyecto> [--tamano ${tamanos}] [--out <carpeta>]`;

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

const tamano = (opciones.tamano ?? "post") as Tamano;
if (!TAMANOS[tamano]) {
  console.error(`Tamaño desconocido: ${tamano}\n${uso}`);
  process.exit(1);
}

const carpetaPiezas = join(proyecto, "grafik", "piezas");
if (!existsSync(carpetaPiezas)) {
  console.error(`Falta ${carpetaPiezas}`);
  console.error(`Crea esa carpeta y copia ahí una plantilla de grafik/plantillas/.`);
  process.exit(1);
}

const carpetaSalida = opciones.out ? resolve(opciones.out) : join(homedir(), "Downloads");
const prefijo = basename(proyecto);

const slug = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const esc = (texto: string) =>
  texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const ctx: Ctx = {
  proyecto,
  asset: (ruta) => `file://${join(proyecto, ruta)}`,
  esc,
};

const documento = (css: string, cuerpo: string) =>
  `<!doctype html><html lang="es"><head><meta charset="utf-8">` +
  `<style>${BASE}${css}</style></head><body>${cuerpo}</body></html>`;

const archivos = readdirSync(carpetaPiezas)
  .filter((f) => /\.(ts|js|mjs)$/.test(f))
  .sort();

if (archivos.length === 0) {
  console.error(`No hay piezas en ${carpetaPiezas}`);
  process.exit(1);
}

let indice = 0;

for (const archivo of archivos) {
  const modulo = await import(pathToFileURL(join(carpetaPiezas, archivo)).href);
  if (typeof modulo.default !== "function") {
    console.error(`${archivo} no exporta una función por defecto.`);
    process.exit(1);
  }

  const devuelto = await modulo.default(ctx);
  const piezas: Pieza[] = Array.isArray(devuelto) ? devuelto : [devuelto];

  for (const pieza of piezas) {
    if (!pieza?.html || !pieza?.nombre) {
      console.error(`${archivo}: cada pieza necesita "nombre" y "html".`);
      process.exit(1);
    }

    indice++;
    const archivoSalida = join(
      carpetaSalida,
      `${prefijo}-${String(indice).padStart(2, "0")}-${slug(pieza.nombre)}.png`,
    );

    render({
      html: documento(pieza.css ?? "", pieza.html),
      ancho: pieza.ancho ?? TAMANOS[tamano].ancho,
      alto: pieza.alto ?? TAMANOS[tamano].alto,
      salida: archivoSalida,
    });

    console.log(`✓ ${archivoSalida}`);
  }
}

console.log(`\n${indice} imagen(es) a ${TAMANOS[tamano].ancho}x${TAMANOS[tamano].alto}`);
