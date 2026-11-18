---
name: grafik
description: Converts HTML into PNG carousels and vertical 1080x1920 video with Bun and ffmpeg, and applies a brand palette through one tema.css. Use it when the user wants a vertical video, a reel, Instagram carousels, clips from a recording, or their brand colors applied to a video.
---

# grafik

HTML in, PNG carousels and vertical video out. TypeScript run by Bun, Chrome
headless draws, ffmpeg encodes. No framework, no `node_modules`.

Two independent outputs:

```
src/build.ts  → PNG  (Instagram carousels, 1080x1350 or 1080x1080)
src/video.ts  → MP4  (reels, 1080x1920)
```

## Requirements

| Tool | Install | Why |
|---|---|---|
| `bun` | `curl -fsSL https://bun.sh/install \| bash` | runs the TypeScript |
| Chrome | `bunx playwright install chromium`, or Google Chrome in `/Applications` | renders the frames |
| `ffmpeg` | `brew install ffmpeg` | encodes the MP4 |

`ffmpeg` from Homebrew lacks `drawtext` (no libfreetype), so all text is drawn
in HTML. ffmpeg only encodes.

## Project layout for video

```
mi-video/
├── tema.css          optional: brand palette, overrides the defaults
└── video/
    ├── guion.ts      required: the scenes
    ├── fondo.png     optional: background, also .jpg and .webp
    ├── logo.png      optional: logo on the closing scene, also .svg
    └── audio.wav     optional: soundtrack, also .mp3 and .m4a
```

The command receives the project folder, not `video/`.

## Brand palette: `tema.css`

The templates never contain brand colors, only roles. Ship the brand as a CSS
file with variables:

```css
/* tema.css */
:root {
  --acento: #2563eb;
  --acento-2: #7c3aed;
  --acento-3: #db2777;
  --fondo: #0b0b0f;
  --superficie: #16161d;
  --texto: #e5e7eb;
  --ok: #22c55e;
  --sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}
```

| Variable | Role |
|---|---|
| `--acento` | titles, links, bars |
| `--acento-2` | diagrams and emphasis |
| `--acento-3` | closing scene |
| `--fondo` | canvas background |
| `--superficie` | contrast plate over the background |
| `--texto` | body text |
| `--ok` | correct, confirmed |
| `--sans` | font stack |

It is injected **after** `src/wiracocha.css`, so it only needs the variables you
want to change. A custom font needs its `@font-face` in the same file with an
absolute `.woff2` path: the HTML is served from `file://`, so there is no base URL.

### Hex only

Ask for colors in hexadecimal (`#rrggbb`). **Do not invent or eyeball them.**

- If the user provides a brand manual with swatches or names ("corporate blue"),
  the value is missing. Ask for the hex, or propose a palette and get it
  confirmed before writing `tema.css`.
- A near-miss color is invisible in isolation and obvious in a video. It reads
  as "badly calibrated" and nobody knows why.
- If the user has no manual, have them fill `marca.md` from this same skill.

Three places do **not** follow the theme, by design:

- `barrido`: its palette is kept in sync with `pipelines/montaje.sh`, which
  paints half the ladder with ffmpeg. ffmpeg cannot read CSS.
- `bot`: a chat mockup with its own grays.
- `src/pixel.ts`: sprites and illustrations, not brand color.

## The guion

`video/guion.ts` default-exports an array of scenes (a single object also works).
Each scene names a template and passes its data:

```ts
export default [
  {
    plantilla: "hook",
    duracion: 4,
    rotulo: "Rust · 01",
    texto: "Un dueño\npor valor",
    acento: "Y eso es a propósito.",
  },
  {
    plantilla: "cierre",
    duracion: 5,
    texto: "Eso es todo",
    cta: "Comenta qué te trabó",
    redes: "@wiracocha_labs",
  },
];
```

Rules:

- `plantilla` and `duracion` (seconds) are the only required fields.
- `\n` inside `texto` splits lines. In `hook`, the last line uses the accent.
- `tono` accepts `primario`, `secundario` or `cierre`. Defaults per template.
- Everything below y=1620 in a 1080x1920 canvas sits under the TikTok and
  Instagram UI. Keep text above it.

## Templates

| Template | Fields | For |
|---|---|---|
| `hook` | `texto`, `rotulo`, `acento` | The first line, full bleed |
| `concepto` | `texto`, `sub`, `rotulo` | One idea and its explanation |
| `diagrama` | `pasos[3]`, `texto`, `rotulo` | Three steps drawn in SVG |
| `cierre` | `texto`, `cta`, `rotulo`, `redes` | Closing, call to action, handles |
| `burbujas` | `burbujas[]`, `texto`, `rotulo`, `barrido`, `figura`, `ritmo` | Messages piling up |
| `catalogo` | `texto`, `rotulo`, `barrido`, `figura`, `ritmo` | A grid assembled cell by cell |
| `sellos` | `sellos[{icono,texto}]`, `texto`, `rotulo` | Three objections answered |
| `filtro` | `texto`, `sub`, `rotulo`, `etiquetas[2]`, `barrido` | A path that forks and drops one branch |
| `bot` | `rotulo`, `texto`, `caliente`, `frio` | Two conversations with a verdict |
| `doble` | `a`, `datosA`, `b`, `datosB`, `figura`, `barrido`, `ritmo` | Two map scenes in one frame |

All accept `duracion` and `tono`.

## Commands

```bash
# full video, 30 fps, writes to ~/Movies/grafik/ with date and time
bun src/video.ts proyectos/mi-video

# half resolution, 12 fps: for review only, never to deliver
bun src/video.ts proyectos/mi-video --rapido --solo hook

# PNG pieces, writes to ~/Downloads
bun src/build.ts proyectos/mi-pieza
```

`--solo <plantilla>` renders one scene. `--out <carpeta>` changes the destination.
`build.ts` accepts `--tamano post|story|cuadrado`.

## Verify

After editing templates, CSS or the renderer:

```bash
bun src/prueba-video.ts   # renders two scenes and checks duration, audio, frames
bun src/prueba.ts         # renders two PNG pieces and checks their size
```

Both launch Chrome and take seconds. There is no linter, typecheck or unit test:
these two are the whole verification.

## Animations

The timing contract matters when adding a template:

1. The animation lives in a class (`.entra`, `.aparece`, `.emerge`, `.trazo`)
   from `src/wiracocha.css`. Never inline in `style`: the `animation` shorthand
   resets the delay to 0.
2. The when lives in `--d`: `style="--d: 1.2s"`.

The renderer freezes the page at instant `t` and the CSS resolves
`animation-delay: calc(var(--d) - t)`, so the output is identical on every run.

A new animation is a `@keyframes` plus a class in `src/wiracocha.css`.
