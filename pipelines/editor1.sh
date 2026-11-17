#!/bin/bash
# editor1.sh — video largo -> transcripcion con tiempos + proyecto Kdenlive sin silencios.
#
#   ./editor1.sh ~/Movies/video.mkv            # con LLM: recorta silencios + tramos muertos
#   ./editor1.sh ~/Movies/video.mkv --sin-ia   # solo recorta silencios (gratis, sin tokens)
#   ./editor1.sh ~/Movies/video.mkv --preview  # calibra el umbral, no escribe nada
#
# Genera junto al video: <base>.srt, <base>.cortes.txt y <base>.kdenlive
set -uo pipefail

MODELO="${MODELO:-opencode-go/deepseek-v4.1-flash}"
UMBRAL="${UMBRAL:--40dB}"
MARGEN="${MARGEN:-0.15s,0.35s}"
SUAVE="${SUAVE:-0.8s,0.3s}"

fatal() { echo "error: $*" >&2; exit 1; }

# "1:23", "01:02:03" o "00:12:34,400" -> segundos
a_seg() {
  local t="${1%%,*}" s=0 p
  case "$t" in ''|*[!0-9:]*) return ;; esac
  local IFS=:
  for p in $t; do
    [ -n "$p" ] || continue
    s=$(( s * 60 + 10#$p ))
  done
  echo "$s"
}

[ $# -ge 1 ] || { sed -n '2,8p' "$0"; exit 1; }
video="$1"
shift
ia=1
preview=0
for arg in "$@"; do
  case "$arg" in
    --sin-ia)  ia=0 ;;
    --preview) preview=1 ;;
    *) fatal "opcion desconocida: $arg" ;;
  esac
done

[ -f "$video" ] || fatal "no existe: $video"
cd "$(dirname "$video")" || fatal "no puedo entrar a $(dirname "$video")"
archivo="$(basename "$video")"
base="${archivo%.*}"
trap 'rm -f "$base.wav"' EXIT

if [ "$preview" = 1 ]; then
  auto-editor "$archivo" --edit "audio:$UMBRAL" --margin "$MARGEN" --smooth "$SUAVE" --preview
  exit 0
fi

echo "== 1/4  extrayendo audio"
ffmpeg -y -v error -i "$archivo" -vn -ac 1 -ar 16000 -c:a pcm_s16le "$base.wav" \
  || fatal "ffmpeg fallo"

echo "== 2/4  transcribiendo (varios minutos)"
mlx_whisper "$base.wav" --model mlx-community/whisper-large-v3-turbo \
  --language es --condition-on-previous-text False \
  --output-format srt --output-dir . || fatal "whisper fallo"

cortes=()
if [ "$ia" = 1 ]; then
  echo "== 3/4  pidiendo cortes al LLM ($MODELO)"
  pedido='Adjunto el SRT de una clase grabada. Marca solo los tramos que no aportan:
algo repetido que ya se dijo, una divagacion, o una frase abandonada a medias.
No marques ejemplos, definiciones ni anuncios de lo que viene. Ante la duda, no marques.
Usa los tiempos del SRT. No uses herramientas, no expliques.
Responde solo con lineas "CORTE mm:ss mm:ss", con mm:ss del SRT. Si no hay nada, NADA.'
  opencode run -m "$MODELO" -f "$base.srt" "$pedido" > "$base.cortes.txt" 2>/dev/null
  n=0
  while read -r marca ini fin; do
    [ "$marca" = "CORTE" ] || continue
    a="$(a_seg "$ini")"
    b="$(a_seg "$fin")"
    [ -n "$a" ] && [ -n "$b" ] && [ "$b" -gt "$a" ] || continue
    cortes+=( --cut-out "${a}s,${b}s" )
    n=$(( n + 1 ))
  done < "$base.cortes.txt"
  echo "   $n tramos marcados"
else
  echo "== 3/4  sin LLM"
fi

echo "== 4/4  generando proyecto Kdenlive"
ae=( auto-editor "$archivo" --edit "audio:$UMBRAL" --margin "$MARGEN" --smooth "$SUAVE"
     --export kdenlive -o "$base.kdenlive" --no-open )
if [ ${#cortes[@]} -gt 0 ]; then ae+=( "${cortes[@]}" ); fi
"${ae[@]}" >/dev/null || fatal "auto-editor fallo"

echo
echo "listo:"
ls -1 "$base.srt" "$base.kdenlive"
if [ "$ia" = 1 ]; then echo "$base.cortes.txt"; fi
