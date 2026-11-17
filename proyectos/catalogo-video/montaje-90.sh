#!/usr/bin/env bash
# Corte de 89 s del catálogo, para Shorts, Reels y TikTok.
#
#   ./montaje-90.sh
#
# Los demos van a pantalla completa (LLENO=1): la grabación entra entera, sin
# recortar, centrada sobre el fondo de estrellas. Las franjas negras de 88px que
# traen las grabaciones quedan tapadas por ese fondo.
#
# Transiciones:
#   tramo A   → landing 1   panel (arriba-izquierda)
#   landing 1 → landing 2   panel regreso (arriba-derecha → abajo-izquierda)
#   landing 2 → catálogo    panel inverso (abajo-izquierda → arriba-derecha)
#   catálogo  → filtros     puertas de carbón
#   filtros   → ficha       puertas
#   ficha     → WhatsApp    corte directo
#   WhatsApp  → tramo B     escalera
set -euo pipefail
cd "$(dirname "$0")"

# shellcheck source=montaje-lib.sh
source ./montaje-lib.sh

build_assets

render "guion-largo-a.ts" largo-a.mp4
render "guion-largo-b.ts" largo-b.mp4

MARCO=1
# 2_2 y 2_3 se grabaron con 88px negros arriba y abajo; 2_1 es pantalla completa.
DEMO_ALTA="crop=1080:1742:0:88,"

# Las puertas que CIERRAN se recortan con min/max. Sin eso, cualquier frame de
# más las pasa de largo: se cruzan en el centro y dejan los dos extremos
# abiertos justo en el frame del corte. La duración real del clip casi nunca es
# un múltiplo exacto de 1/25, así que el desborde es la regla, no la excepción.
CIERRA_IZQ="min(0,-540+540*(t-\$C)/0.4)"
CIERRA_DER="max(540,1080-540*(t-\$C)/0.4)"

# --- Landing 1 (8.4s a 1.25x). Arranca en 6.5s y termina en 17.0s: de 17.0 a
#     18.9 la grabación está quieta, es una pausa del original. Si se deja
#     dentro, el video parece congelado. Panel a la entrada, panel regreso a la
#     salida. ---
DUR=6.4
CIERRA=6.01
VELOCIDAD=1.25
EXTRA=()
panel_fuente   # entrada 3
panel_fuente   # entrada 4
P1=3
P2=4
TRANSICION="[$P1:v]${PANEL_MARCOS}[m1];"
TRANSICION+="[$P2:v]${PANEL_MARCOS}[m2];"
TRANSICION+="[o2][m1]overlay=x='-1080*t/0.35':y='-1920*t/0.35'[q];"
TRANSICION+="[q][m2]overlay=x='1080-1080*(t-$CIERRA)/0.35'"
TRANSICION+=":y='-1920+1920*(t-$CIERRA)/0.35',format=yuv420p[v]"
demo demo_2_2.mp4 6.5 1 centro "$DEMO_ALTA" largo-landing1

# --- Landing 2 (4.0s a 1.25x). Arranca en 19.0s, justo cuando la página vuelve
#     a moverse. Panel regreso a la entrada, panel inverso a la salida. Consume
#     de 19.0s a 24.0s. ---
DUR=2.0
CIERRA=1.61
VELOCIDAD=1.25
EXTRA=()
panel_fuente   # entrada 3
panel_fuente   # entrada 4
P1=3
P2=4
TRANSICION="[$P1:v]${PANEL_MARCOS}[m1];"
TRANSICION+="[$P2:v]${PANEL_MARCOS}[m2];"
TRANSICION+="[o2][m1]overlay=x='-1080*t/0.35':y='1920*t/0.35'[q];"
TRANSICION+="[q][m2]overlay=x='-1080+1080*(t-$CIERRA)/0.35'"
TRANSICION+=":y='1920-1920*(t-$CIERRA)/0.35',format=yuv420p[v]"
demo demo_2_2.mp4 19.0 1 centro "$DEMO_ALTA" largo-landing2

# --- Catálogo (8.1s). Arranca en 32.5s y dura 1.5s menos al final. Panel
#     inverso a la entrada, puertas a la salida. ---
DUR=6.1
CIERRA=5.66
VELOCIDAD=1
EXTRA=()
panel_fuente   # entrada 3
puerta         # entradas 4 y 5
P1=3
TRANSICION="[$P1:v]${PANEL_MARCOS}[m1];"
TRANSICION+="[o2][m1]overlay=x='1080*t/0.35':y='-1920*t/0.35'[q];"
TRANSICION+="[q][4:v]overlay=x='${CIERRA_IZQ//\$C/$CIERRA}':y=0[r];"
TRANSICION+="[r][5:v]overlay=x='${CIERRA_DER//\$C/$CIERRA}':y=0,format=yuv420p[v]"
demo demo_2_2.mp4 32.5 1 centro "$DEMO_ALTA" largo-catalogo

# --- Filtros (4.82s). Arranca en 6.5s, no en 6.0: en 6.28 hay un clic y la
#     tarjeta del producto aparece vacía un par de frames mientras la página se
#     re-renderiza. Eso se veía como un corte. 6.5 + 4.82 es todo el material. ---
DUR=2.82
CIERRA=2.38
VELOCIDAD=1
EXTRA=()
puerta
puerta
TRANSICION="[o2][3:v]overlay=x='-540*t/0.4':y=0[q1];"
TRANSICION+="[q1][4:v]overlay=x='540+540*t/0.4':y=0[q2];"
TRANSICION+="[q2][5:v]overlay=x='${CIERRA_IZQ//\$C/$CIERRA}':y=0[q3];"
TRANSICION+="[q3][6:v]overlay=x='${CIERRA_DER//\$C/$CIERRA}':y=0,format=yuv420p[v]"
demo demo_2_3.mp4 6.5 2 centro "$DEMO_ALTA" largo-filtros

# --- Ficha del producto (6.6s). Arranca en 7.0s: 2s menos al inicio. Termina
#     en 13.6, justo antes de la animación del teléfono y la pantalla "WhatsApp
#     Locked" que va de 13.7 a 14.1. Si el corte cae ahí, se ve el bloqueo en
#     medio. Puertas a la entrada, corte directo a la salida. ---
DUR=4.6
VELOCIDAD=1
EXTRA=()
puerta
TRANSICION="[o2][3:v]overlay=x='-540*t/0.4':y=0[q1];"
TRANSICION+="[q1][4:v]overlay=x='540+540*t/0.4':y=0,format=yuv420p[v]"
demo demo_2_1.mp4 7.0 2 centro "" largo-producto

# --- WhatsApp (4.4s). Entra en 14.2s, ya con el chat cargado, y sale con la
#     escalera. 14.2 + 4.4 = 18.6, el final del clip. ---
DUR=2.4
ENTRA=1.76
EXTRA=()
for color in "${NIVELES[@]}"; do
  EXTRA+=(-f lavfi -i "color=c=$color:s=1984x320:r=25")
done
TRANSICION=""
for i in 0 1 2 3 4 5; do
  anterior="o2"
  [ "$i" -gt 0 ] && anterior="b$((i - 1))"
  TRANSICION+="[$anterior][$((3 + i)):v]"
  TRANSICION+="overlay=x='-1982+1982*(t-$ENTRA)/0.6-180*$i-2':y=$((320 * i))[b$i];"
done
TRANSICION+="[b5]format=yuv420p[v]"
demo demo_2_1.mp4 14.2 3 centro "" largo-whatsapp

# --- Pegado final. ---
ffmpeg -hide_banner -v error -y \
  -i build/largo-a.mp4 \
  -i build/largo-landing1.mp4 \
  -i build/largo-landing2.mp4 \
  -i build/largo-catalogo.mp4 \
  -i build/largo-filtros.mp4 \
  -i build/largo-producto.mp4 \
  -i build/largo-whatsapp.mp4 \
  -i build/largo-b.mp4 \
  -filter_complex \
  "[0:v][1:v][2:v][3:v][4:v][5:v][6:v][7:v]concat=n=8:v=1:a=0[v]" \
  -map "[v]" \
  -c:v libx264 -preset medium -crf 18 \
  -pix_fmt yuv420p -bf 0 -g 25 -profile:v high -level 4.0 \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -movflags +faststart \
  "build/reel-90s.mp4"

ffprobe -v error -show_entries format=duration,size -of default=nw=1 "build/reel-90s.mp4"
echo "✓ $PWD/build/reel-90s.mp4"
