#!/bin/bash
# clips.sh — corta clips verticales 1080x1920 (sticker + texto) desde un video maestro.
#
#   ./clips.sh "/ruta/master.mkv" "/ruta/salida"
#
# El fondo es un asset fijo junto al script (_fondo.png); la carpeta de salida solo recibe mp4.
set -uo pipefail

FUENTE="${1:?falta el video maestro}"
DESTINO="${2:?falta la carpeta de salida}"
# El fondo vive junto a este script: es un asset fijo, no uno por carpeta de salida.
AQUI="$(cd "$(dirname "$0")" && pwd)"
FONDO="${FONDO:-$AQUI/_fondo.png}"

[ -f "$FUENTE" ] || { echo "error: no existe $FUENTE" >&2; exit 1; }
[ -f "$FONDO" ]  || { echo "error: falta $FONDO" >&2; exit 1; }
mkdir -p "$DESTINO" || exit 1
master="$(cd "$(dirname "$FUENTE")" && pwd)/$(basename "$FUENTE")"

# inicio (con 0.3s de margen)  duracion      nombre
cortes=(
  "32:48.7 54.6 es-como-cocinar-clase5.mp4"
  "1:06:22.7 69.6 aparecen-las-figuras-clase5.mp4"
  "20:12.7 68.6 rust-es-estricto-clase5.mp4"
  "11:43.7 46.6 no-vamos-a-vibe-codear-clase5.mp4"
  "09:25.7 56.6 golden-retriever-clase5.mp4"
  "45:33.7 47.6 magia-de-los-tutoriales-clase5.mp4"
  "38:50.7 61.6 tests-cuando-usas-ia-clase5.mp4"
  "59:45.7 44.6 el-loop-furro-clase5.mp4"
  "53:46.7 33.6 bootcamp-de-rust-clase5.mp4"
)

# El fondo 1080x1920 (negro + sticker + texto) es un asset fijo junto al script.

fallos=0
for linea in "${cortes[@]}"; do
  read -r ini dur nombre <<< "$linea"
  echo "-> $nombre"
  ffmpeg -y -v error -ss "$ini" -t "$dur" -i "$master" \
    -loop 1 -i "$FONDO" \
    -filter_complex "[0:v]scale=1080:607,setsar=1[v];[1:v][v]overlay=0:656:shortest=1[o]" \
    -map "[o]" -map 0:a -t "$dur" \
    -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p \
    -c:a aac -b:a 192k -movflags +faststart \
    "$DESTINO/$nombre" || { echo "   FALLO: $nombre" >&2; fallos=$(( fallos + 1 )); }
done

echo
echo "listo: $(( ${#cortes[@]} - fallos ))/${#cortes[@]} en $DESTINO"
