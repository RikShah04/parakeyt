import sys
import json
import os
import subprocess
from pcbgen.generate import generate
from routing.label_switches import label_switches
from routing.router import routePCB, findJava
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

print("Generating PCB from JSON...")
generate(config, output_dir) # generate pcb file from json.
print("Finished generating PCB.")

pcb = os.path.join(output_dir, "output.kicad_pcb")

print("labeling switch fingerprints...")
label_switches(pcb) # add fingerprint labels to switches
print("Finished labeling switched.")

print("Finding Java install...")
java = findJava()

print("Calling routing script...")
while(True):
    try:
        routing_attempts -= 1
        routePCB(pcb, java) # sends pcb to autorouter
    except subprocess.TimeoutExpired:
        print(colored("Autorouter timed out.", "red"))
        if routing_attempts > 0:
            print(colored(f"Trying again. {routing_attempts} attempt(s) remaining.", "yellow"))
            continue
        else:
            print(colored("[ERROR]: No attempts remaining. Adjust PCB and try again, or route board manually.\nReturning unrouted PCB.", "red"))
    break
print("Routing script done.")

print("Generating case files...")
build(pcb, output_dir) # builds the keyboard case
print("Case files generated.")

print()
print("Pipeline script finished!")

