#!/bin/bash
cd "$(dirname $0)"
if [[ ! -d "./venv" ]]; then
  python3 -m venv ./venv
  . ./venv/bin/activate
  pip install kiutils cadquery
fi

python3 ./parakeyt_pipeline.py -i pipeline/config.json -o ./output/
