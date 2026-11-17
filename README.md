# grafik

Convierte HTML en piezas gráficas y en video vertical, con el contenido de
cualquier proyecto.

No impone diseño: resuelve el render, los tamaños, el tiempo y el orden de los
archivos.

```
src/build.ts  → PNG  (carruseles de Instagram)
src/video.ts  → MP4  (reels y TikTok)
pipelines/    → corte y montaje de una grabación larga con ffmpeg
```

Las dos primeras comparten `render.ts`, `base.css` y el mismo contexto de
plantilla. La tercera es shell y no usa el motor: parte de un video maestro y
devuelve un proyecto Kdenlive o clips verticales.

## Estructura

```
src/               el motor: render, tamaños, tiempo y orden
plantillas/        plantillas de imagen, listas para copiar a un proyecto
plantillas-video/  plantillas de video, las carga `video.ts` por nombre
proyectos/         el contenido de cada video
pipelines/         scripts de shell: corte de clases y clips verticales
```

`src/formas.ts` no lo importa nadie todavía: expone `poligono(lados, r)` y
`estrella(puntas, r)` como path SVG, para la plantilla que las necesite. Tiene
su propio chequeo: `bun src/formas.ts`.

Un proyecto vive en `proyectos/<nombre>/` y tiene `video/guion.ts` más sus
assets. `proyectos/catalogo-video` es el ejemplo completo: mezcla tramos de
grafik con grabaciones de pantalla y por eso trae su propio `montaje.sh`.

---

# Video

## Uso

```bash
bun src/video.ts ../mi-video                 # 1080x1920 a 30fps
bun src/video.ts ../mi-video --rapido        # 540x960 a 12fps, para revisar
bun src/video.ts ../mi-video --solo hook     # una sola escena
bun src/video.ts ../mi-video --out ./salida
```

El MP4 queda en `~/Movies/grafik/`, y el script imprime la ruta:

```
ejemplo-20261110-171305.mp4        render completo
ejemplo-20261110-171305-rapido.mp4 el de `--rapido`, a media resolución
```

El nombre lleva la fecha y la hora (`AAAAMMDD-HHMMSS`), así que el más reciente
es el último al ordenar la carpeta, y dos renders del mismo proyecto nunca se
pisan. El sufijo `-rapido` distingue el preview del definitivo.

| Flag | Qué hace |
|---|---|
| `--rapido` | Mitad de resolución y 12fps. Un video de 2 min tarda ~30s en vez de ~5 min |
| `--solo <plantilla>` | Renderiza solo las escenas de esa plantilla |
| `--fps 24` | Cambia los fps de salida (default 30) |
| `--out <carpeta>` | Cambia la carpeta de salida |

## El guion

Un video es una carpeta con un archivo:

```
mi-video/
  video/
    guion.ts
```

```ts
export default [
  { plantilla: "hook", duracion: 6, texto: "Rust no te deja\nprestar mal" },
  { plantilla: "concepto", duracion: 9, texto: "Un dueño\npor valor" },
  { plantilla: "cierre", duracion: 6, texto: "Fin" },
];
```

`duracion` está en segundos y es del guion, no de la plantilla. Cuando haya voz,
se pone ahí lo que dure su audio y las animaciones se reacomodan solas.

## Fondo, logo y audio

Los tres assets son opcionales y se buscan por nombre:

```
mi-video/
  video/
    guion.ts
    fondo.png     ← cualquier imagen. Se recorta con `cover` a 1080x1920
    logo.png      ← aparece como escudo en la escena de cierre
    audio.wav     ← banda sonora. También acepta audio.mp3 y audio.m4a
```

Sin audio, la pista va en silencio (`anullsrc`): algunas redes rechazan un MP4
que no tiene ninguna pista. Con audio, si la pista dura **menos** que el video se
rellena con silencio hasta el final; si dura más, se corta en el último frame.

Si no están, el fondo es el carbón `#2f2e2b`, no hay escudo y no hay sonido.

Todo el contenido vive dentro de una `.tarjeta`: placa del carbón de la marca
(`--fondo`, `#2f2e2b`) con 920px de alto mínimo, borde de 1px oro y una barra
de acento a la izquierda. Es lo que hace legible el texto sobre un fondo con
textura.

**Un acento por escena**, no tres compitiendo. El color de la barra se elige en
el guion:

```ts
{ plantilla: "diagrama", duracion: 14, tono: "naranja", pasos: [...] }
```

| `tono` | Color |
|---|---|
| `oro` (default) | `#d4af37` |
| `naranja` | `#f27d42` |
| `terracota` | `#a9442b` |

Los defaults por plantilla son: `hook` y `concepto` en oro, `diagrama` en
naranja, `cierre` en terracota.

## Plantillas

| Plantilla | Campos | Para |
|---|---|---|
| `hook` | `texto`, `rotulo`, `acento` | La primera frase. La última línea sale en oro |
| `concepto` | `texto`, `sub`, `rotulo` | Una idea y su explicación |
| `diagrama` | `pasos[3]`, `texto`, `rotulo` | Tres pasos con flechas que se dibujan (SVG) |
| `cierre` | `texto`, `cta`, `rotulo`, `redes` | Conclusión, llamada a la acción y redes |
| `burbujas` | `burbujas[]`, `texto`, `rotulo`, `barrido`, `figura`, `ritmo` | Mensajes que se acumulan: sirve para mostrar una molestia |
| `catalogo` | `texto`, `rotulo`, `barrido`, `figura`, `ritmo` | Una rejilla que se arma celda por celda |
| `sellos` | `sellos[{icono,texto}]`, `texto`, `rotulo` | Tres dudas del comprador resueltas con íconos |
| `filtro` | `texto`, `sub`, `rotulo`, `etiquetas[2]`, `barrido` | Un camino que se abre en dos y descarta una rama |
| `bot` | `rotulo`, `texto`, `caliente`, `frio` | Dos conversaciones con su veredicto, para mostrar un filtro en acción |
| `doble` | `a`, `datosA`, `b`, `datosB`, `figura`, `barrido`, `ritmo` | Dos escenas del mapa en un solo cuadro |

Todas aceptan `duracion` y `tono`.

Una plantilla es una función que recibe los datos y el contexto, y devuelve
`{ nombre, html, css }`. Ver `plantillas-video/hook.ts`.

## Cómo se anima

Dos reglas, y con eso basta:

1. **La animación va en una clase.** `.entra`, `.aparece`, `.emerge`, `.trazo`
   están en `wiracocha.css`. Nunca en un `style` inline: el shorthand
   `animation` reinicia el delay a 0.
2. **El cuándo va en `--d`.** Es un tiempo: `style="--d: 1.2s"`.

```html
<h1 class="titulo anim entra" style="--d: .35s">Hola</h1>
```

`video.ts` congela la página en un instante `t` y el CSS calcula
`animation-delay: calc(var(--d) - t)`. Un elemento con `--d: 1.2s` a `t = 2s`
queda como si faltaran 0.8s para entrar. Por eso el resultado es idéntico en
cada render.

Para animaciones nuevas: un `@keyframes` y una clase en `wiracocha.css`.

## Aprovechar el alto y el ancho

El lienzo es de 1080x1920, pero el espacio **de diseño** es menor: TikTok e
Instagram tapan el 13% de arriba y el 19% de abajo. Quedan **1305 px útiles**.

Ese es el techo. Cuando el chequeo avisa que algo "se sale arriba" o "se sale
abajo", no está pidiendo que lo muevas: está diciendo que no cabe.

Tres palancas, en este orden de preferencia:

**1. El ancho viene del padding.** `.escena` trae `0 165px` a cada lado. Si el
contenido es ancho, se reduce: en `doble` está a `82px` y el área pasó de 750 a
916 px, un 22% más sin tocar nada adentro.

**2. El alto se gana con `scale` y `translateY`.** No hay padding vertical: la
escena centra el contenido. Para que ocupe más arriba se escala y se desplaza:

```css
transform: translateY(-100px) scale(.79);
```

Anclar con `transform-origin: bottom` **no funciona**: el bloque sin escalar es
más alto que el lienzo, así que su borde inferior queda fuera y el contenido se
sale igual. Escalar desde el centro y desplazar es predecible; anclar abajo, no.

**3. Los laterales, con `align-self`.** En una columna flex,
`flex-start` y `flex-end` pegan cada bloque a un borde. Ojo: angostar un bloque
parte el texto en más líneas, crece en alto y choca con la zona segura. Las tres
cosas no se pueden maximizar a la vez; hay que elegir dos.

### Dos escenas en un cuadro

`doble` llama a dos plantillas y pega su HTML y su CSS. Dos cosas que rompen si
se ignoran:

- **El barrido se arma fuera del bloque escalado.** `transform` crea un bloque
  contenedor, así que el barrido se posicionaría contra el bloque de texto en vez
  de contra el lienzo. `doble` desactiva el de la segunda escena y lo rearma
  aparte, como hermano.
- **El CSS es uno solo.** Todo va bajo la clase de su plantilla, o los dos
  bloques se pisan.

### Una escena sin cortar

Un `animation-delay` en el contenedor de un bloque **se lee como escena nueva**.
Como los hijos ya tenían sus propias animaciones, cuando el contenedor aparece
éstas ya terminaron: el bloque entra entero, no armándose.

```css
.apilado > :last-child { animation: aparece .5s ease-out both; animation-delay: 3.8s; }
```

## Barrido entre escenas

Un elemento cruza la pantalla y la tapa entera justo en la mitad del recorrido.
Ahí cae el corte, y como el fotograma es el mismo a los dos lados, el empalme no
se ve. Va en las dos escenas que une, con `barrido` en segundos:

```ts
{ plantilla: "burbujas", duracion: 3.4, figura: "escalera", ritmo: 1.2, barrido: 2.8 }
{ plantilla: "catalogo", duracion: 2.6, figura: "escalera", ritmo: 1.2, barrido: -0.6 }
```

`barrido` es cuándo arranca dentro de la escena: `duracion - ritmo/2` en la que
sale y `-ritmo/2` en la que entra. Si cambias `ritmo`, esos dos números cambian
con él.

Dos figuras:

| `figura` | Qué es |
|---|---|
| `panel` | Rectángulo de 1080x1920 con cinco bandas de 80px —oro, carbón, terracota, naranja, oro— y centro macizo de carbón. Cruza en diagonal desde la esquina inferior derecha |
| `escalera` | Seis bandas de 320px corridas 180px cada una, cruzando de izquierda a derecha |

### Todas las transiciones

Están dispersas porque cada mitad la pinta un motor distinto. Esta tabla es el
mapa:

| Nombre | Tipo | Dirección | Dónde se declara |
|---|---|---|---|
| `panel` | Rectángulo con cinco bandas y centro macizo | Diagonal: entra por abajo-derecha, sale por arriba-izquierda | `figura: "panel"` |
| `escalera` | Seis bandas escalonadas | Horizontal, de izquierda a derecha | `figura: "escalera"` |
| puertas | Dos paneles de carbón de media pantalla | Del borde al centro, se juntan y se separan | **Solo en `proyectos/catalogo-video/montaje.sh`** |

La escalera mide 1984px de ancho por banda y recorre 3964px. No es un capricho:
a cada altura de la pantalla hay una sola banda, así que en el momento del
corte **cada banda tiene que cruzar el lienzo entero por su cuenta**. Con bandas
de 1080px el corte dejaría media pantalla de cada escena a la vista.

### Figuras candidatas

Ideas para una tercera figura. Todas se dibujan con bandas anchas de color, como
`panel` y `escalera`. La regla que comparten es la misma: en el instante del
corte la figura tiene que tapar el lienzo entero.

| Idea | Cómo se movería | Lo que la complica |
|---|---|---|
| Anillos | Círculo de bandas concéntricas que crece desde el centro | Necesita 2203px de diámetro para tapar las esquinas, no 1080 |
| Persianas | Lamas horizontales paralelas que se cierran sobre sí mismas | Cada lama tiene que ser más alta que el lienzo a mitad del recorrido |
| Cebra | Franjas a 45° que barren de esquina a esquina | El recorrido crece con la diagonal: ~3050px, no 1920 |
| Damero | Cuadros de dos colores que se cierran hasta llenar la pantalla | Son dos ejes animados a la vez; el más lento manda |
| Espiral | Una banda continua que gira y se enrolla hacia el centro | Casi imposible de replicar en `drawbox`; pide geometría generada |

Antes de construir una, hay que decidir si se puede replicar del lado de ffmpeg.
El panel se replica con tres `drawbox` y un `t=fill`; una espiral no se puede.

El empalme solo funciona si el elemento existe a los dos lados del corte. Entre
dos escenas de HTML eso es CSS a ambos lados. Entre una escena y un clip de
video hay que replicar el elemento dentro del clip: `montaje.sh` lo hace con
`overlay` de un `color` que se mueve, porque `drawbox` en ffmpeg 9 no acepta
expresiones con `t`.

**El congelado va al final del archivo.** `animation-play-state: paused` está en
la última regla de `wiracocha.css` a propósito: las clases de animación usan el
shorthand `animation`, que vuelve a ponerlo en `running`. Si esa regla sube, las
animaciones corren en tiempo real y el render las captura ya terminadas.

## Transición entre escenas

Fundido al fondo de 0.25s en las dos puntas: la escena sale disolviéndose en
`--fondo` y la siguiente emerge del mismo color. Como solo se pinta una escena a
la vez, un crossfade real no es posible sin pintar dos capas; esto se le parece
sin ese costo. La última escena lleva la clase `final` y no se disuelve, para
que el video no termine en un frame vacío.

Se ajusta en un solo lugar: `.escena` en `wiracocha.css`.

## Chequeos automáticos

Antes de codificar, cada escena se mide en su estado final:

- Elementos fuera de la zona que tapa la interfaz de TikTok (13% arriba, 19% abajo).
  Ese borde no es un aviso cosmético: es el límite de diseño, 1305 px de alto.
- Textos más anchos que su caja (`scrollWidth`), que es como se escapa un
  título largo sin que la caja lo delate.

Los avisos salen al final del render, con la escena y el elemento.

## Rendimiento medido en este Mac (M1 Pro)

| Modo | Frames | Tiempo |
|---|---|---|
| 1080x1920 a 30fps, 36s de video | 1080 | ~80s |
| `--rapido`, los mismos 36s | 432 | ~23s |

El costo es casi todo el frame que devuelve Chrome. Un video de 2 minutos son
~5 minutos de render, y ~30s con `--rapido`.

Con fondo fotográfico el formato de captura cambia solo a JPEG q97:

| Captura | Por frame | Un video de 36s |
|---|---|---|
| PNG sin fondo | 50 ms / 11 KB | 80s |
| PNG con fondo | **684 ms / 2 MB** | 12 min |
| JPEG q97 con fondo | 75 ms / 471 KB | 80s |

Un campo de estrellas es ruido puro: PNG no lo comprime. El H.264 final va en
4:2:0 de todas formas, así que la pérdida extra es despreciable.

No se escribe ningún frame a disco: van por tubería a `ffmpeg`.

## Requisitos

- Bun
- `ffmpeg` y `ffprobe` (Homebrew)
- Chrome: usa el de Playwright (`~/Library/Caches/ms-playwright/chromium-*`)
  o el que esté en `/Applications`. Si no hay ninguno:
  `bunx playwright install chromium`

El `ffmpeg` de Homebrew no trae `drawtext` ni `subtitles` (le falta libfreetype),
así que **todo el texto se dibuja en HTML**. ffmpeg solo codifica.

## Verificar

```bash
bun src/prueba-video.ts
```

Crea un proyecto temporal, renderiza dos escenas y revisa duración, tamaño,
pista de audio, que los frames cambien y que el aviso de desborde salte.

---

# Imágenes

## Uso

```bash
bun src/build.ts ../mi-proyecto
bun src/build.ts ../mi-proyecto --tamano story
bun src/build.ts ../mi-proyecto --out ./grafica
```

| Tamaño | Píxeles | Para |
|---|---|---|
| `post` (por defecto) | 1080×1350 | Feed de Instagram (4:5) |
| `story` | 1080×1920 | Historias y reels (9:16) |
| `cuadrado` | 1080×1080 | Grid de perfil |

Los PNG se guardan en `~/Downloads` como `<proyecto>-01-<nombre>.png`.

## Crear una pieza

1. Copia una plantilla a tu proyecto:

   ```bash
   mkdir -p mi-proyecto/grafik/piezas
   cp grafik/plantillas/{lista,kpis,cita}.ts mi-proyecto/grafik/piezas/
   ```

2. Edita los datos y el CSS dentro del archivo.

3. Corre `bun src/build.ts ../mi-proyecto`.

Cada pieza exporta una función que recibe un contexto y devuelve una pieza o un
arreglo de piezas. **El arreglo es el carrusel**: el orden en que lo devuelves es
el orden de las imágenes.

```ts
export default ({ asset, esc }: Ctx) => [
  { nombre: "portada", html: `<div class="slide">…</div>`, css: `.slide { … }` },
  { nombre: "detalle", html: `<div class="slide">…</div>`, css: `.slide { … }` },
];
```

| Campo | Obligatorio | Qué hace |
|---|---|---|
| `nombre` | sí | Nombre del archivo de salida |
| `html` | sí | Markup de la imagen. El primer elemento debería ser `.slide` |
| `css` | no | Se inyecta después de `base.css`, así que puede sobrescribirlo |
| `ancho` / `alto` | no | Fuerza otro tamaño solo para esa pieza |

Contexto:

- `asset("public/logo.svg")` → ruta `file://` absoluta del proyecto, para usar en `src`.
- `esc(texto)` → escapa `&`, `<` y `>`.
- `proyecto` → ruta absoluta del proyecto.

## Qué te da y qué no

**Te da:** `base.css` con el reset y `.slide` (ocupa el lienzo exacto, sin scroll,
sin desbordes), la búsqueda del binario de Chrome, los tamaños y el nombrado
ordenado de los archivos.

**No te da:** diseño, layout ni validación de que el contenido quepa. Si un texto
largo se sale del lienzo, la imagen sale mal y solo te enteras mirándola. (En
video sí se avisa: es el chequeo de desbordes.)

## Fuentes

Las plantillas usan la pila del sistema (`-apple-system`), que ya está instalada y
no depende de internet. Es lo mismo que hace wiracocha-web: su `tokens.css`
declara Oswald e Inter pero nunca las carga. Si quieres una fuente propia, guarda
el `.woff2` en tu proyecto y declara `@font-face` en el `css` de la pieza con
`src: url("…")`; como el HTML se sirve por `file://`, usa la ruta absoluta del
archivo.

## Verificar

```bash
bun src/prueba.ts
```

Crea un proyecto temporal, renderiza una pieza y revisa que el PNG salga con el
tamaño correcto.

---

# Pipelines

Dos scripts de shell, independientes entre sí, que comparten el mismo video maestro.

```
master .mkv ──┬──► editor1.sh ──► .kdenlive horizontal (YouTube)
              └──► clips.sh    ──► clips verticales 1080x1920 (TikTok / IG / Shorts)
```

Ninguno de los dos toca el video original. Todos los derivados se escriben al lado
del master o en la carpeta de salida que se indique.

## Requisitos

| Herramienta | Instalación | Para qué |
|---|---|---|
| `ffmpeg` | `brew install ffmpeg` | extraer audio, cortar y componer |
| `mlx-whisper` | `uv tool install mlx-whisper` | transcribir con timestamps |
| `auto-editor` | ver abajo | detectar silencios y exportar `.kdenlive` |
| `Kdenlive` | `brew install --cask kdenlive` | abrir el `.kdenlive` y exportar el horizontal (macOS 13+) |
| `opencode` | ya instalado | elegir qué tramos cortar |

`auto-editor` se instala como binario suelto porque el paquete de PyPI intenta
descargarlo y falla por certificados SSL en este Mac:

```bash
curl -sL -o ~/.local/bin/auto-editor \
  https://github.com/WyattBlue/auto-editor/releases/latest/download/auto-editor-macos-arm64
chmod +x ~/.local/bin/auto-editor
```

**Nota:** el `ffmpeg` de Homebrew no incluye el filtro `drawtext` (falta
libfreetype). Por eso el fondo de los clips verticales es un PNG generado aparte,
no un texto dibujado por ffmpeg.

---

## Pipeline 1 — `editor1.sh`

Transcribe el video con timestamps y genera un proyecto Kdenlive con los silencios
ya quitados.

```bash
./pipelines/editor1.sh ~/Movies/clase.mkv              # con LLM: silencios + tramos muertos
./pipelines/editor1.sh ~/Movies/clase.mkv --sin-ia     # solo silencios (gratis, sin tokens)
./pipelines/editor1.sh ~/Movies/clase.mkv --preview    # calibra, no escribe nada
```

### Qué genera (junto al video)

| Archivo | Contenido |
|---|---|
| `<base>.srt` | transcripción con timestamps |
| `<base>.cortes.txt` | lo que respondió el LLM |
| `<base>.kdenlive` | proyecto horizontal ya cortado |

El `.kdenlive` **no renderiza nada**: apunta al video original y guarda solo los
cortes. Se abre en Kdenlive y se exporta desde ahí.

### Qué hace por dentro

1. `ffmpeg` extrae el audio a WAV mono 16 kHz (formato que espera Whisper).
2. `mlx_whisper` transcribe a `.srt`.
3. `opencode run` lee el `.srt` y devuelve líneas `CORTE mm:ss mm:ss`.
4. `auto-editor` aplica todo en una sola pasada y exporta el `.kdenlive`.

### Variables de entorno

| Variable | Default | Qué controla |
|---|---|---|
| `UMBRAL` | `-40dB` | debajo de esto se considera silencio |
| `MARGEN` | `0.15s,0.35s` | aire que se deja antes y después de cada frase |
| `SUAVE` | `0.8s,0.3s` | no cortar pausas menores a 0.8 s |
| `MODELO` | `opencode-go/deepseek-v4.1-flash` | modelo que elige los cortes |

```bash
UMBRAL=-45dB ./pipelines/editor1.sh ~/Movies/clase.mkv
```

### Calibrar antes de correrlo en serio

```bash
./pipelines/editor1.sh ~/Movies/clase.mkv --preview
```

`--preview` imprime cuánto se cortaría. Para una clase hablada, **30–40%** es
normal. Si pasa de 50%, sube el umbral (más negativo). Si baja de 10%, está
demasiado alto.

### Conversión de tiempos

`auto-editor --cut-out` **no acepta el formato `mm:ss`**. Acepta segundos con
unidad: `90s`, `1.5s`. `1m30s` falla. Por eso el script convierte cada respuesta
del LLM a segundos antes de pasarla.

---

## Pipeline 2 — `clips.sh`

Corta fragmentos verticales de 1080x1920 con el sticker del canal arriba y dos
líneas de texto abajo.

```bash
./pipelines/clips.sh ~/Movies/clase.mkv ~/Movies/clips
```

### La lista de cortes está dentro del script

En el array `cortes`, cada línea es `inicio duracion nombre`:

```bash
cortes=(
  "32:48.7 54.6 es-como-cocinar-clase5.mp4"
)
```

- `inicio`: minuto del **video maestro**, no del renderizado. Se le restan 0.3 s de margen.
- `duracion`: segundos con un decimal (duración real + 0.6 s de margen).
- `nombre`: lleva el sufijo `-claseN` para saber de qué clase salió.

**Al cambiar de clase hay que reescribir este array.** Los minutos de una clase no
sirven para otra.

### El fondo es un asset fijo

`_fondo.png` vive **junto a `clips.sh`**, no en la carpeta de salida. Es un solo
archivo para todas las clases: la carpeta de salida solo recibe `.mp4`.

```
pipelines/
├── clips.sh
├── editor1.sh
└── _fondo.png    ← 1080x1920 con sticker y texto
```

Si el archivo no existe, `clips.sh` se niega a correr. Para regenerarlo (solo si
cambias el diseño), desde `pipelines/`:

```bash
uv run --with pillow python - <<'EOF'
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
fondo = Image.new("RGB", (W, H), (0, 0, 0))
png = Path.home() / "Downloads" / "wiracocha_tiktok_stiker.png"
sticker = Image.open(png).convert("RGBA").resize((602, 117), Image.LANCZOS)
fondo.paste(sticker, (239, 300), sticker)

d = ImageDraw.Draw(fondo)
ttf = "/System/Library/Fonts/Supplemental/DIN Condensed Bold.ttf"
for texto, tam, y, color in [
    ("VIDEO COMPLETO EN YOUTUBE", 58, 1380, (255, 255, 255)),
    ("EN VIVO \u00b7 LUNES Y MI\u00c9RCOLES 7PM", 42, 1462, (170, 170, 170)),
]:
    f = ImageFont.truetype(ttf, tam)
    d.text(((W - d.textlength(texto, font=f)) / 2, y), texto, font=f, fill=color)

fondo.save("_fondo.png")
EOF
```

Se puede apuntar a otro fondo con `FONDO=/ruta/otro.png ./pipelines/clips.sh ...`,
pero no hace falta.

### Layout

| Elemento | Posición | Tamaño |
|---|---|---|
| Sticker | x=239, y=300 | 602x117 (tamaño nativo, sin reescalar) |
| Video 16:9 | x=0, y=656 | 1080x607 |
| Texto inferior | centrado, y=1380 | — |
| Límite de zona tapada por TikTok/IG | y=1620 | — |

Todo lo que pase de y=1620 queda debajo de la descripción, la música y los botones
de la app.

---

## Flujo completo para una clase nueva

```bash
# 1. preparar la clase (transcribe + proyecto horizontal)
./pipelines/editor1.sh ~/Movies/2026-11-02\ 19-41-01.mkv

# 2. abrir en Kdenlive, revisar y exportar el horizontal
open -a kdenlive ~/Movies/2026-11-02\ 19-41-01.kdenlive

# 3. elegir los clips (esto requiere leer el .srt y decidir; no es automático)
#    se reescribe el array `cortes` de clips.sh con las ventanas nuevas

# 4. generar los verticales
./pipelines/clips.sh ~/Movies/2026-11-02\ 19-41-01.mkv ~/Movies/clips
```

Después, agregar una tarjeta por clip al Backlog del Kanban en
`Proyecto/Redes sociales/Publicaciones de redes sociales.md`, con la ruta del `.mp4`.

---

## Problemas conocidos

**Whisper alucina en silencios largos.** Sin `--condition-on-previous-text False`
inventa texto y lo repite cientos de veces (se vio 117 veces la misma frase en una
clase). El script ya lo incluye. Si vuelve a pasar, revisar primero esa opción.

**Los timestamps del `.srt` no coinciden al 100% con el audio.** Puede haber hasta
0.3 s de desfase en los extremos de cada bloque. Por eso los clips llevan 0.3 s de
margen.

**El código en pantalla no se lee en vertical.** Un video 720p dentro de un lienzo
de 1080 de ancho queda con el texto del editor a un par de píxeles. Afecta a los
clips donde el contenido es el código; no afecta a los de cámara. Solución
pendiente: zoom 2x a la región del código en esos clips.

**`auto-editor --cut-out` no acepta `mm:ss`.** Solo segundos con unidad: `90s`,
`1.5s`. `1m30s` falla.

## Pendientes

- `clips.sh` debería leer la lista de cortes de un `_cortes.tsv` en vez de tenerla
  en el array.
- Paso de descripciones: una sola llamada al LLM con los fragmentos del `.srt` y
  que devuelva título, descripción y hashtags por clip.
- Zoom automático en los clips cuyo contenido es código.
