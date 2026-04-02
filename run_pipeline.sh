#!/bin/bash
cd "$(dirname $0)"
KICAD_DIR="$HOME/.local/share/flatpak/app/org.kicad.KiCad/current/active/files/"
KICAD_PYTHON="$KICAD_DIR/bin/python"

if [[ ! -d "./venv" ]]; then
  echo "Get in the venv!!!"
  echo "Use $KICAD_PYTHON"
  exit
fi

cp -r "$KICAD_DIR/lib/" "./venv/"
python3 -X frozen_modules=off ./parakeyt_pipeline.py -i pipeline/config.json -o ./output
