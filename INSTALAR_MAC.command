#!/bin/bash
# Instalar ÓRBITA en Mac: copia la bóveda a Documentos/ORBITA y la abre en Obsidian
cd "$(dirname "$0")"
DEST="$HOME/Documents/ORBITA"
echo ""; echo "  Instalando ÓRBITA"; echo ""
if [ ! -d "vault/ORBITA" ]; then echo "No encuentro la carpeta vault. Descomprime el zip entero."; read -r; exit 1; fi
if [ ! -d "/Applications/Obsidian.app" ]; then
  echo "Primero instala Obsidian (se abre la web). Luego vuelve a abrir este archivo."
  open "https://obsidian.md/download"; read -r; exit 1
fi
if [ -d "$DEST/ORBITA" ]; then
  echo "Ya tienes la bóveda en $DEST. Solo actualizo el plugin."
  mkdir -p "$DEST/.obsidian/plugins/orbita"
  cp vault/.obsidian/plugins/orbita/{main.js,styles.css,manifest.json} "$DEST/.obsidian/plugins/orbita/"
else
  mkdir -p "$DEST"; cp -R vault/. "$DEST/"
  echo "Bóveda creada en $DEST"
fi
open -a Obsidian
sleep 2
open "obsidian://open?path=$(python3 -c 'import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))' "$DEST" 2>/dev/null || echo "$DEST")"
echo ""
echo "Listo. En Obsidian pulsa «Confiar en el autor y activar plugins»."
echo "Si no se abre tu bóveda: «Abrir carpeta como bóveda» y elige Documentos/ORBITA."
read -r -p "Pulsa Enter para cerrar"
