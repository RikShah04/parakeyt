import sys
import json
import os
import subprocess
from pcbgen.generate import generate
from routing.label_switches import label_switches
from routing.router import routePCB
from termcolor import colored
from casegen.build import build

_DIR = os.path.dirname(__file__)
output_dir = os.path.join(_DIR, "output")
routing_attempts = 2


if len(sys.argv) < 2:
    print("Usage: parakeyt_pipeline.py <config.json>")
    sys.exit(1)

with open(sys.argv[1], "r") as f:
    config = json.load(f)

#config = json.load("config.json")
os.makedirs(output_dir, exist_ok=True)
generate(config, output_dir) # generate pcb file from json.
pcb = os.path.join(output_dir, "output.kicad_pcb")
label_switches(pcb) # add fingerprint labels to switches
while(True):
    try:
        routing_attempts -= 1
        routePCB(pcb) # sends pcb to autorouter
    except subprocess.TimeoutExpired:
        print(colored("Autorouter timed out."), "red")
        if routing_attempts > 0:
            print(colored("Trying again. %s attempt(s) remaining", str(routing_attempts)), "yellow")
            continue
        else:
            print(colored("[ERROR]: No attempts remaining. Adjust PCB and try again, or route board manually.\nReturning unrouted PCB."), "red")
    break

build(pcb, output_dir) # builds the keyboard case

