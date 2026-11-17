#!/usr/bin/env bash
# Piezas compartidas por los montajes de este proyecto. No se corre sola:
# la cargan `montaje.sh` y los montajes largos con `source`.
#
# El guion de cada video no vive aquí: cada archivo declara sus tramos en orden,
# porque cada corte tiene su propia transición y no hay formato que las describa
# todas sin volverse un lenguaje.

GRAFIK="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DEMOS="$HOME/Movies"

# Los mismos hexadecimales que `grafik/plantillas-video/barrido.ts`.
ORO="0xd4af37"
CARBON="0x2f2e2b"
NIVELES=(0xe8e4d9 0xa9442b 0xd4af37 0x7a2f1d 0xf27d42 0x7a6a4f)

# 1. Fondo, placa y bandas de texto. Se mueven por glob y no por número:
#    agregar una pieza nueva corre la numeración de todas.
build_assets() {
  bun "$GRAFIK/src/build.ts" . --tamano story --out build >/dev/null
  mv build/catalogo-video-*-fondo.png video/fondo.png
  mv build/catalogo-video-*-placa.png build/placa.png
  mv build/catalogo-video-*-banda-1.png build/banda-1.png
  mv build/catalogo-video-*-banda-2.png build/banda-2.png
  mv build/catalogo-video-*-banda-3.png build/banda-3.png
}

# 2. Tramos de motion graphics. video.ts siempre lee video/guion.ts, así que
#    cada tramo se copia encima justo antes de renderizar.
#    $1 guion · $2 nombre del mp4 de salida
render() {
  cp "video/$1" video/guion.ts
  local ruta
  ruta=$(bun "$GRAFIK/src/video.ts" . --fps 25 --out build/render |
    sed -n 's/^✓ \(.*\) — .*/\1/p')
  mv "${ruta/#\~/$HOME}" "build/$2"
}

# Marcos concéntricos del panel, replicados con drawbox. Termina sin coma para
# encadenar el overlay; el llamador cierra en `[p]`.
PANEL_MARCOS="drawbox=x=80:y=80:w=920:h=1760:color=$CARBON:t=80,"
PANEL_MARCOS+="drawbox=x=160:y=160:w=760:h=1600:color=0xa9442b:t=80,"
PANEL_MARCOS+="drawbox=x=240:y=240:w=600:h=1440:color=0xf27d42:t=80,"
PANEL_MARCOS+="drawbox=x=400:y=400:w=280:h=1120:color=$CARBON:t=fill"

# Añade a EXTRA un lienzo dorado para pintar el panel. El índice lo pone el
# llamador: `EXTRA+=(-f lavfi -i ...)` suma cuatro palabras al arreglo, no una,
# así que contar elementos no sirve para numerar entradas.
panel_fuente() {
  EXTRA+=(-f lavfi -i "color=c=$ORO:s=1080x1920:r=25")
}

# Las puertas son dos paneles de carbón de 540x1920: juntos cubren el lienzo
# entero. Abren de 0 a 0.4s y cierran en los últimos 0.4s de la toma.
puerta() {
  EXTRA+=(-f lavfi -i "color=c=$CARBON:s=540x1920:r=25")
  EXTRA+=(-f lavfi -i "color=c=$CARBON:s=540x1920:r=25")
}

# 3. Tomas del demo. La placa va debajo, la grabación encima en su ventana de
#    944x1360, la banda de texto arriba y al final las transiciones.
#
#    Lee tres globales que el llamador pone antes: `DUR` (segundos), `EXTRA`
#    (fuentes de color para las transiciones) y `TRANSICION` (el grafo que las
#    compone). Sin TRANSICION la toma sale limpia, para cuando el corte ya lo
#    tapa una figura del lado de grafik.
#    `$5` es el recorte previo, para las tomas con bandas negras.
#    $1 video · $2 inicio · $3 banda · $4 encuadre · $5 recorte previo · $6 salida
#    Tres layouts:
#      MARCO=1  → carbón macizo, la grabación entera centrada en 800x1280 y el
#                 título arriba, fuera del video. Deja margen arriba y abajo para
#                 que TikTok e Instagram no tapen nada.
#      LLENO=1  → la grabación al lienzo entero sobre el fondo de estrellas.
#      (ninguno)→ dentro de la placa de 944x1360, como el reel corto.
#    `VELOCIDAD` acelera la reproducción sin cambiar la duración del tramo: el
#    tramo sigue midiendo DUR, pero consume DUR x VELOCIDAD de la grabación.
demo() {
  local ajuste pos burbuja fondo_args
  fondo_args=(-loop 1 -framerate 25 -i build/placa.png)
  if [ "${MARCO:-0}" = "1" ]; then
    # Carbón macizo y la grabación entera, sin recortar. El alto es fijo: 1540.
    # El anclaje va abajo (el borde inferior queda en 1750), así que al crecer
    # sube y se ensancha, que es lo que se pidió. Antes eran 1280 de alto.
    ajuste="scale=980:1540:force_original_aspect_ratio=decrease"
    pos="x='(W-w)/2':y='1750-h'"
    burbuja="70:60"
    fondo_args=(-f lavfi -i "color=c=0x2f2e2b:s=1080x1920:r=25")
  elif [ "${LLENO:-0}" = "1" ]; then
    # `decrease` mete la grabación entera sin recortar; el fondo de estrellas
    # llena lo que sobra arriba y abajo, que es justo la franja negra que traen
    # las grabaciones.
    ajuste="scale=1080:1920:force_original_aspect_ratio=decrease"
    # Las expresiones van entre comillas simples o el parser de ffmpeg corta
    # en los dos puntos.
    pos="x='(W-w)/2':y='(H-h)/2'"
    burbuja="70:180"
    fondo_args=(-loop 1 -framerate 25 -i video/fondo.png)
  else
    local encuadre="crop=944:1360:0:$4"
    [ "$4" = "abajo" ] && encuadre="crop=944:1360:0:ih-1360"
    [ "$4" = "arriba" ] && encuadre="crop=944:1360:0:0"
    [ "$4" = "centro" ] && encuadre="crop=944:1360"
    ajuste="scale=944:1360:force_original_aspect_ratio=increase,$encuadre"
    pos="68:380"
    burbuja="70:200"
  fi
  local cola="${TRANSICION:-[o2]format=yuv420p[v]}"
  # La entrada tiene que dar DUR x VELOCIDAD segundos de grabación; si se pide
  # sólo DUR, con velocidad >1 la toma se queda congelada al final porque el
  # overlay repite el último frame mientras el fondo sigue corriendo.
  local entra
  entra=$(awk "BEGIN{printf \"%.3f\", $DUR * ${VELOCIDAD:-1}}")

  ffmpeg -hide_banner -v error -y \
    "${fondo_args[@]}" \
    -ss "$2" -t "$entra" -i "$DEMOS/$1" \
    -loop 1 -framerate 25 -i "build/banda-$3.png" \
    ${EXTRA[@]+"${EXTRA[@]}"} \
    -filter_complex "
      [1:v]${5}${ajuste},setsar=1,fps=25,setpts=(PTS-STARTPTS)/${VELOCIDAD:-1}[d];
      [0:v]setpts=PTS-STARTPTS[bg];
      [bg][d]overlay=${pos}[o1];
      [o1][2:v]overlay=${burbuja}[o2];
      ${cola}" \
    -map "[v]" -t "$DUR" -r 25 \
    -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p \
    -movflags +faststart \
    "build/${6:-toma-$3}.mp4"
}
