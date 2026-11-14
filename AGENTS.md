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

## Reglas que rompen el render si se ignoran

- `animation-play-state: paused` va **al final** de `wiracocha.css`. Si se sube,
  las animaciones corren en tiempo real y cada frame se captura terminado.
- La animación va en una clase, nunca en `style` inline: el shorthand
  `animation` borra el delay. El *cuándo* va en `--d`.
- Los tamaños viven solo en `TAMANOS` (`src/render.ts`). No los escribas a mano.
- Una plantilla nueva es un archivo en `plantillas-video/` que exporta por
  defecto `(datos, ctx) => { nombre, html, css }`. `src/video.ts` la busca por
  nombre, no hay registro que actualizar.

## Barridos

Un barrido cruza la pantalla y la tapa entera justo a mitad del recorrido; el
corte cae en ese frame. Por eso **existe a los dos lados del corte**: entre dos
escenas HTML va en las dos (`barrido` en el guion); entre una escena y un clip
de video, la mitad del clip se replica en ffmpeg con `overlay` y `drawbox`.

Los colores de `montaje.sh` están corridos ~8 puntos respecto a los del CSS a
propósito: ffmpeg y Chrome convierten a YUV distinto. Si se "corrigen", aparece
un escalón de color justo en el empalme.

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
