# catalogo-video

Reel de 29.4 s para vender el catálogo con pedido por WhatsApp. Sin audio: el
video se manda mudo y la música se pone al publicar.

El motor de motion graphics es `../..`. Aquí solo vive el contenido, la
placa donde entra la grabación del demo y el script que pega todo.

## Armar

```bash
./montaje.sh          # deja build/reel-20s.mp4
```

Requiere `bun`, `ffmpeg` y las grabaciones en `~/Movies/demo_2_*.mp4`.

## Cómo se compone

```
tramo A (grafik)   0.0 –  3.4s   burbujas
                  3.4 –  6.0s   catálogo, y el panel dorado entra al final
toma 1 (ffmpeg)    6.0 – 11.4s   catálogo, filtros; el panel dorado sale
toma 2 (ffmpeg)   11.4 – 15.8s   ficha con precio
toma 3 (ffmpeg)   15.8 – 19.2s   el pedido ya escrito; la escalera entra al final
tramo B (grafik)  19.2 – 22.6s   filtro (la escalera sale)
                  22.6 – 25.6s   confianza: garantías, envíos y pagos
                  25.6 – 29.4s   cierre con WhatsApp y redes
```

El fondo de estrellas es `video/fondo.png`, pero ya no es una imagen suelta: lo
genera `grafik/piezas/00-fondo.ts` en cada build. Se cambió porque el fondo de
ejemplo traía pegada una maqueta de interfaz de TikTok (SEGUIR · LIKE · GUARDAR
· COMENTAR · COMPARTIR) que salía en el cierre. Se genera con una semilla fija,
así que sale idéntico en cada build.

Hay cuatro transiciones. Las tres del medio son puertas de carbón: dos paneles
de 540x1920 que entran desde cada lado, se juntan en el centro —ahí cae el
corte— y se vuelven a separar.

| Dónde | Elemento | Colores |
|---|---|---|
| catálogo → demo 1 | Panel de pantalla completa, diagonal | Cinco bandas de 80px: oro, carbón, terracota, naranja, oro. Centro macizo de carbón |
| demo 1 → demo 2 | Puertas: dos paneles de media pantalla | Carbón |
| demo 2 → demo 3 | Puertas | Carbón |
| demo 3 → sellos | Escalera de seis bandas, de izquierda a derecha | Un color por nivel |

Cada una vive en los **dos lados** del corte: la mitad en la escena de `grafik`
(CSS) y la mitad en el clip del demo (`overlay` de ffmpeg, en `montaje.sh`). El
truco es que en el frame del corte el elemento tapa el lienzo entero, así que el
fotograma se ve igual a los dos lados. Si se quita una de las dos mitades, el
empalme aparece como un salto.

Las puertas no tocan ninguna escena de `grafik`: van entre dos clips de video,
así que los dos lados salen de la misma fuente de color y coinciden exactos.

Los colores de los marcos y de los seis niveles están escritos en dos lugares:
`grafik/plantillas-video/barrido.ts` (lado CSS) y `montaje.sh` (lado ffmpeg).
Si cambias uno, cambia el otro o el corte se ve como un salto de color.

Los colores de ffmpeg (`ORO` y `TERRACOTA` en el script) están corridos a
propósito: el `color` de ffmpeg y el PNG que sale de Chrome no convierten igual a
YUV, y los valores exactos de la marca salían ~8 puntos más oscuros. Eso hacía
un escalón justo en el corte. El carbón de las puertas no lleva corrección porque
no cruza esa frontera.

Las tomas del demo no son MP4 sueltos: ffmpeg pone la grabación encima de
`build/placa.png`, en la ventana de 944x1360 que arranca en y=380. Así los tres
clips quedan del mismo tamaño aunque se grabaron distinto (2_2 y 2_3 traen 88 px
de negro arriba y abajo; 2_1 es pantalla completa).

La banda de texto va aparte, en y=250, para que el pie cambie sin recortar la
grabación. Los 180 px de abajo del lienzo quedan vacíos a propósito: TikTok e
Instagram los tapan con la descripción y los botones.

## Archivos

| Qué | Dónde |
|---|---|
| Guion de cada tramo | `video/guion-a.ts`, `video/guion-b.ts` |
| `video/guion.ts` | copia del tramo que se está renderizando; lo escribe `montaje.sh` |
| Placa y bandas | `grafik/piezas/01-placa.ts`, `02-bandas.ts` |
| Fondo y logo | `grafik/piezas/00-fondo.ts`, `video/logo.png` |
| Plantillas nuevas | `../../plantillas-video/burbujas.ts`, `catalogo.ts`, `cortinilla.ts`, `sellos.ts` |

## Pendientes

- Las grabaciones son de la paleta vieja: el botón de la cabecera y el "Catálogo"
  siguen en rosa y rojo neón. La página ya está en oro (`marketplace/src/data/site.ts`),
  así que regrabar los tres clips y cambiar los `-ss` de `montaje.sh` lo arregla sin
  tocar nada más.
- El tramo 2 es casi estático: la página no se mueve en esos 3 segundos. Si aburre,
  el corte va a 2.2s y el sobrante al cierre.
- En la toma 3 se ven dos avisos de WhatsApp Web en inglés ("messages to yourself").
  No se pueden recortar sin cortarle los bordes al mensaje.
