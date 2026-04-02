#!/usr/bin/python3
import sys, json, os, subprocess, argparse, shutil
#from pcbgen.generate import generate
#from termcolor import colored
#from casegen.build import build

# depends on: git, kicad
# python libs: pcbnew, kiutils

# consts
SCRIPT_DIR = os.path.dirname(__file__) + "/"
ROUTING_RETRIES = 2

# args
parser = argparse.ArgumentParser()
parser.add_argument("-o", "--out_dir", help="output directory")
parser.add_argument("-v", "--verbose", help="verbose output")
parser.add_argument("-i", "--input_file", help="input config.json file")
args = parser.parse_args()
args.out_dir = os.path.realpath(args.out_dir) + '/'
args.input_file = os.path.realpath(args.input_file)

# verbose print
def vprint(s):
    if args.verbose:
        print(s)

vprint("Starting pipeline")
vprint(f"Input: {args.input_file}")
vprint(f"Output: {args.out_dir}")

vprint(f"Creating {args.out_dir}")
os.makedirs(args.out_dir, exist_ok=True)

vprint("Copying files")
shutil.copyfile(args.input_file, args.out_dir + "config.json")
os.chdir(args.out_dir)

# download dependencies
print("Checking dependencies")
def check_or_clone_repo(url: str, dir: str):
    if os.path.isdir(SCRIPT_DIR + dir):
        print(f"Dependency {dir} exists!")
    else:
        print(f"{dir} does not exist, cloning!")
        subprocess.run(["git", "clone", "--depth", "1", url, SCRIPT_DIR + dir])

check_or_clone_repo("https://github.com/parakeyt/parakeyt-pcb-gen", "pcb")
check_or_clone_repo("https://github.com/parakeyt/parakeyt-case", "case")
check_or_clone_repo("https://github.com/parakeyt/parakeyt-firmware", "firmware")

# read config
print(f"Reading Config {args.input_file}")
with open("./config.json", "r") as f:
    config = json.load(f)

# generate pcb
os.chdir(SCRIPT_DIR + 'pcb')
shutil.copyfile(args.out_dir + 'config.json', SCRIPT_DIR + 'pcb/config.json')
subprocess.run(["python3", SCRIPT_DIR + "pcb/main.py"])
os.chdir(args.out_dir)
shutil.copyfile(SCRIPT_DIR + 'pcb/test.kicad_pcb', args.out_dir + 'placed.kicad_pcb')

# route
# TODO get working on loonix
#subprocess.run(["python3", SCRIPT_DIR + "pipeline/routing/main.py"])

# case
os.chdir(SCRIPT_DIR + 'case')
subprocess.run(["python3", SCRIPT_DIR + 'case/build.py', args.out_dir + '/placed.kicad_pcb'])
os.chdir(args.out_dir)
shutil.copytree(SCRIPT_DIR + 'case/output', args.out_dir + 'case')

# firmware
subprocess.run(['python3', SCRIPT_DIR + 'firmware/config/generate.py', '-i', args.out_dir + 'config.json', '-o', args.out_dir + 'config.h'])
shutil.copyfile(args.out_dir + 'config.h', SCRIPT_DIR + 'firmware/config/config.h')
subprocess.run(['bash', '-c', SCRIPT_DIR + 'firmware/build.sh'])
shutil.copyfile(SCRIPT_DIR + 'firmware/build/parakeyt_fw.uf2', args.out_dir + 'firmware.uf2')
shutil.copyfile(SCRIPT_DIR + 'firmware/build/testing/bus_scan.uf2', args.out_dir + 'bus_scan.uf2')
shutil.copyfile(SCRIPT_DIR + 'firmware/build/testing/printer.uf2', args.out_dir + 'printer.uf2')

quit()


# OLD REMOVE ONCE FEATURE COMEPLETEN

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

