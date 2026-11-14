# grafik

Convierte HTML en piezas gráficas y en video vertical, con el contenido de
cualquier proyecto.

No impone diseño: resuelve el render, los tamaños, el tiempo y el orden de los
archivos.

```
src/build.ts  → PNG  (carruseles de Instagram)
src/video.ts  → MP4  (reels y TikTok)
```

Los dos comparten `render.ts`, `base.css` y el mismo contexto de plantilla.

## Estructura

```
src/               el motor: render, tamaños, tiempo y orden
plantillas/        plantillas de imagen, listas para copiar a un proyecto
plantillas-video/  plantillas de video, las carga `video.ts` por nombre
proyectos/         el contenido de cada video
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

## Fondo, logo y tarjeta

Los dos assets son opcionales y se buscan por nombre:

```
mi-video/
  video/
    guion.ts
    fondo.png     ← cualquier imagen. Se recorta con `cover` a 1080x1920
    logo.png      ← aparece como escudo en la escena de cierre
```

Si no están, el fondo es el carbón `#2f2e2b` y no hay escudo.

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
| `cortinilla` | `duracion` | 0.7s de geometría entre dos tomas distintas |
| `sellos` | `sellos[{icono,texto}]`, `texto`, `rotulo` | Tres dudas del comprador resueltas con íconos |
| `filtro` | `texto`, `sub`, `rotulo`, `etiquetas[2]`, `barrido` | Un camino que se abre en dos y descarta una rama |

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
bun ~/Documents/Proyectos/grafik/src/build.ts ../mi-proyecto
bun ~/Documents/Proyectos/grafik/src/build.ts ../mi-proyecto --tamano story
bun ~/Documents/Proyectos/grafik/src/build.ts ../mi-proyecto --out ./grafica
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
