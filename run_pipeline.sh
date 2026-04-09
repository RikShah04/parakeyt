#!/bin/bash
cd "$(dirname $0)"
if [[ ! -d "./venv" ]]; then
  echo "VENV does not exist! Creating..."
  python3 -m venv ./venv
  . ./venv/bin/activate
  python3 -m pip install kiutils cadquery
else
  echo "Entering VENV"
  . ./venv/bin/activate
fi

python3 ./parakeyt_pipeline.py -i example-boards/tkl/tkl.json -o ./output/
