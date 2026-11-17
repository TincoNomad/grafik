#!/usr/bin/env bash
# Arma el reel: dos tramos de motion graphics de grafik y tres tomas del demo
# dentro de la placa.
#
#   ./montaje.sh
#
# Todas las transiciones viven en los dos lados del corte. En grafik son CSS;
# en las tomas son `overlay` de fuentes de color, porque `drawbox` en este
# ffmpeg no acepta expresiones con tiempo y el parser no respeta comas dentro
# de un if(), así que cada tramo usa una expresión lineal sin condicionales.
#
# Las funciones compartidas (render, demo, puerta) viven en montaje-lib.sh.
set -euo pipefail
cd "$(dirname "$0")"

# shellcheck source=montaje-lib.sh
source ./montaje-lib.sh

# Idioma del reel. Cambia el guion y las bandas de texto; las tomas del demo
# siguen siendo las mismas hasta que se regraben en el otro idioma.
#   ./montaje.sh      español → build/reel-20s.mp4
#   ./montaje.sh en   inglés  → build/reel-20s-en.mp4
IDIOMA="${1:-es}"
SUF=""
[ "$IDIOMA" = "en" ] && SUF="-en"
export IDIOMA

# 1. Fondo, placa y bandas de texto.
build_assets

# 2. Tramos de motion graphics.
render "guion-a$SUF.ts" a.mp4
render "guion-b$SUF.ts" b.mp4

# --- Toma 1 · catálogo (5.4s). El panel dorado con marcos internos sale al
#     inicio y las puertas cierran al final. ---
DUR=5.4
CIERRA=5.0
EXTRA=(-f lavfi -i "color=c=$ORO:s=1080x1920:r=25")
puerta
TRANSICION="[3:v]"
TRANSICION+="drawbox=x=80:y=80:w=920:h=1760:color=$CARBON:t=80,"
TRANSICION+="drawbox=x=160:y=160:w=760:h=1600:color=0xa9442b:t=80,"
TRANSICION+="drawbox=x=240:y=240:w=600:h=1440:color=0xf27d42:t=80,"
TRANSICION+="drawbox=x=400:y=400:w=280:h=1120:color=$CARBON:t=fill[p];"
TRANSICION+="[o2][p]overlay=x='-1080*t/0.35':y='-1920*t/0.35'[q];"
TRANSICION+="[q][4:v]overlay=x='-540+540*(t-$CIERRA)/0.4':y=0[r];"
TRANSICION+="[r][5:v]overlay=x='1080-540*(t-$CIERRA)/0.4':y=0,format=yuv420p[v]"
# 2_2 y 2_3 se grabaron con 88px negros arriba y abajo: se recortan antes de
# escalar para que el contenido no quede más chico que el de 2_1.
demo demo_2_2.mp4 29.6 1 arriba "crop=1080:1742:0:88,"

# --- Toma 2 · ficha con precio (4.4s). Puertas al inicio y al final. ---
DUR=4.4
CIERRA=4.0
EXTRA=()
puerta
puerta
TRANSICION="[o2][3:v]overlay=x='-540*t/0.4':y=0[q1];"
TRANSICION+="[q1][4:v]overlay=x='540+540*t/0.4':y=0[q2];"
TRANSICION+="[q2][5:v]overlay=x='-540+540*(t-$CIERRA)/0.4':y=0[q3];"
TRANSICION+="[q3][6:v]overlay=x='1080-540*(t-$CIERRA)/0.4':y=0,format=yuv420p[v]"
demo demo_2_1.mp4 8.5 2 abajo ""

# --- Toma 3 · pedido escrito (3.4s). Puertas al inicio y la escalera de seis
#     colores entra al final, tapando el lienzo a los 3.4s. ---
DUR=3.4
ENTRA=2.8
EXTRA=()
for color in "${NIVELES[@]}"; do
  EXTRA+=(-f lavfi -i "color=c=$color:s=1984x320:r=25")
done
puerta
TRANSICION=""
for i in 0 1 2 3 4 5; do
  anterior="o2"
  [ "$i" -gt 0 ] && anterior="b$((i - 1))"
  TRANSICION+="[$anterior][$((3 + i)):v]"
  TRANSICION+="overlay=x='-1982+1982*(t-$ENTRA)/0.6-180*$i-2':y=$((320 * i))[b$i];"
done
TRANSICION+="[b5][9:v]overlay=x='-540*t/0.4':y=0[q4];"
TRANSICION+="[q4][10:v]overlay=x='540+540*t/0.4':y=0,format=yuv420p[v]"
demo demo_2_1.mp4 15.2 3 abajo ""

# 4. Pegado final con el filtro concat, no con el demuxer: el demuxer duplica
#    un frame en cada empalme. Se recodifica porque el `-c copy` deja el primer
#    DTS en negativo y QuickTime muestra el video en negro.
ffmpeg -hide_banner -v error -y \
  -i build/a.mp4 -i build/toma-1.mp4 -i build/toma-2.mp4 \
  -i build/toma-3.mp4 -i build/b.mp4 \
  -filter_complex "[0:v][1:v][2:v][3:v][4:v]concat=n=5:v=1:a=0[v]" \
  -map "[v]" \
  -c:v libx264 -preset medium -crf 18 \
  -pix_fmt yuv420p -bf 0 -g 25 -profile:v high -level 4.0 \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -movflags +faststart \
  "build/reel-20s$SUF.mp4"

ffprobe -v error -show_entries format=duration,size -of default=nw=1 "build/reel-20s$SUF.mp4"
echo "✓ $PWD/build/reel-20s$SUF.mp4"
