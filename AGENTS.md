# grafik

Convierte HTML en PNG y en MP4. TypeScript puro ejecutado con `bun`: no hay
`package.json`, ni dependencias, ni framework. Chrome headless dibuja y ffmpeg
codifica; esos dos binarios son el único requisito externo.

## Comandos

| Qué | Comando |
|---|---|
| Piezas PNG | `bun src/build.ts ../mi-proyecto` |
| Video | `bun src/video.ts ../mi-proyecto` |
| Verificar imágenes | `bun src/prueba.ts` |
| Verificar video | `bun src/prueba-video.ts` |
| Reel completo de ejemplo | `cd proyectos/catalogo-video && ./montaje.sh` |

No hay lint, typecheck ni tests unitarios: los dos `prueba*` son toda la
verificación. Los dos levantan Chrome, así que tardan segundos, no milisegundos.

`--rapido` es mitad de resolución y 12 fps. Sirve para revisar un video, nunca
para entregarlo. Por defecto `build.ts` escribe en `~/Downloads` y `video.ts` en
`~/Movies/grafik/`, con fecha y hora en el nombre.

## Los dos formatos de proyecto

Son distintos y se confunden:

| Tipo | Qué necesita el proyecto | Lo lee |
|---|---|---|
| Imagen | `<proyecto>/grafik/piezas/*.ts` | `src/build.ts` |
| Video | `<proyecto>/video/guion.ts` | `src/video.ts` |

`proyectos/ejemplo` es el más chico de video; `proyectos/catalogo-video` es uno
completo, y además trae `montaje.sh` porque mezcla tramos de grafik con
grabaciones de pantalla.

`video/` también puede traer `fondo.png`, `logo.png` y `audio.wav`. Los tres se
buscan por nombre: si no están, no hay fondo, no hay escudo y la pista va en
silencio. El audio real se rellena con `apad` si dura menos que el video.

## Reglas que rompen el render si se ignoran

- `animation-play-state: paused` va **al final** de `wiracocha.css`. Si se sube,
  las animaciones corren en tiempo real y cada frame se captura terminado.
- La animación va en una clase, nunca en `style` inline: el shorthand
  `animation` borra el delay. El *cuándo* va en `--d`.
- Los tamaños viven solo en `TAMANOS` (`src/render.ts`). No los escribas a mano.
- Una plantilla nueva es un archivo en `plantillas-video/` que exporta por
  defecto `(datos, ctx) => { nombre, html, css }`. `src/video.ts` la busca por
  nombre, no hay registro que actualizar.
- **Los selectores CSS van bajo la clase de la plantilla.** Todas las escenas de
  un video comparten un solo `<style>`, así que un `.barra` suelto se aplica
  también a las demás. Ya pasó con una plantilla que se borró: dos escenas
  chocaban en `.barra` y el gráfico salía deformado solo cuando convivían.
- **El espacio de diseño es 1305 px de alto**, no 1920: TikTok tapa el 13% de
  arriba y el 19% de abajo. Cuando el chequeo avisa "se sale arriba/abajo" no
  pide mover nada, dice que no cabe.
- Para ganar alto se escala y se desplaza (`translateY`), no se ancla abajo:
  con `transform-origin: bottom` el bloque sin escalar ya sobresale del lienzo.
- Si una escena lleva `transform`, su barrido se arma **fuera** de ese bloque.
  `transform` crea un bloque contenedor y el barrido se posiciona contra él en
  vez de contra el lienzo. `doble.ts` es el ejemplo.

## Barridos

Un barrido cruza la pantalla y la tapa entera justo a mitad del recorrido; el
corte cae en ese frame. Por eso **existe a los dos lados del corte**: entre dos
escenas HTML va en las dos (`barrido` en el guion); entre una escena y un clip
de video, la mitad del clip se replica en ffmpeg con `overlay` y `drawbox`.

Los colores de `montaje.sh` y los del CSS son **el mismo hexadecimal** hoy. Una
nota vieja decía que estaban corridos 8 puntos para compensar la conversión a
YUV: se midió y no es cierto. Si algún día hay que corregirlos, se cambia en los
dos lados a la vez y se compara el frame del corte.

## Artefactos

- `build/` y `proyectos/catalogo-video/video/guion.ts` están en `.gitignore`.
  `montaje.sh` copia el tramo encima de `guion.ts` en cada build.
- `./montaje.sh` arma el reel en español y `./montaje.sh en` el inglés. Las dos
  corridas comparten los intermedios, así que reconstruir una pisa los de la
  otra; solo el MP4 final lleva sufijo.

## Licencia

AGPL-3.0. Sin código de terceros: el antiguo `vendor/shapes` (MIT de Remotion)
se borró porque nadie lo importaba; las dos formas que hacían falta viven en
`src/formas.ts`, escritas aquí. Si vuelve a hacer falta una, se copia otra vez
del commit que quedó anotado en el historial de git.
