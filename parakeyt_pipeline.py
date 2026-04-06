#!/usr/bin/python3
import sys, json, os, subprocess, argparse, shutil

# depends on: git, kicad
# python libs: pcbnew, kiutils

# args
parser = argparse.ArgumentParser()
parser.add_argument("-o", "--out_dir", help="output directory", required=True)
parser.add_argument("-v", "--verbose", help="verbose output")
parser.add_argument("-i", "--input_file", help="input config.json file", required=True)
args = parser.parse_args()

# consts
SCRIPT_DIR = os.path.dirname(__file__) + "/"
OUTPUT_DIR = os.path.realpath(args.out_dir) + "/"
INPUT_FILE = os.path.realpath(args.input_file)

CONFIG_FILE = OUTPUT_DIR + "config.json"

PCB_REPO_DIR = SCRIPT_DIR + "pcb/"
PCB_MAIN_FILE = PCB_REPO_DIR + "main.py"
PCB_CONFIG_FILE = PCB_REPO_DIR + "config.json"
PCB_OUTPUT_FILE = PCB_REPO_DIR + "test.kicad_pcb"

CASE_REPO_DIR = SCRIPT_DIR + "case/"
CASE_MAIN_FILE = CASE_REPO_DIR + "build.py"
CASE_OUTPUT_DIR = CASE_REPO_DIR + "output"

FIRMWARE_REPO_DIR = SCRIPT_DIR + "firmware/"
FIRMWARE_CONFIGURE_FILE = FIRMWARE_REPO_DIR + "config/generate.py"
FIRMWARE_CFG_FILE = FIRMWARE_REPO_DIR + "config/config.h"
FIRMWARE_BUILD_FILE = FIRMWARE_REPO_DIR + "build.sh"

print("Starting pipeline:")
print(f"  Input: {INPUT_FILE}")
print(f"  Output: {OUTPUT_DIR}")
print()

print(f"Creating {OUTPUT_DIR}")
os.makedirs(OUTPUT_DIR, exist_ok=True)
print()

print("Copying files")
shutil.copyfile(INPUT_FILE, CONFIG_FILE)
os.chdir(OUTPUT_DIR)
print()

# download dependencies
print("Checking dependencies")


def check_or_clone_repo(url: str, dir: str):
    if os.path.isdir(dir):
        print(f"Dependency {dir} exists!")
    else:
        print(f"{dir} does not exist, cloning!")
        subprocess.run(["git", "clone", "--depth", "1", url, dir])


check_or_clone_repo("https://github.com/parakeyt/parakeyt-pcb-gen", PCB_REPO_DIR)
check_or_clone_repo("https://github.com/parakeyt/parakeyt-case", CASE_REPO_DIR)
check_or_clone_repo("https://github.com/parakeyt/parakeyt-firmware", FIRMWARE_REPO_DIR)
print()

# generate pcb
print("Generating PCB")
os.chdir(PCB_REPO_DIR)
shutil.copyfile(CONFIG_FILE, PCB_CONFIG_FILE)
subprocess.run(["python3", PCB_MAIN_FILE])
os.chdir(OUTPUT_DIR)
shutil.copyfile(PCB_OUTPUT_FILE, OUTPUT_DIR + "placed.kicad_pcb")
print()

# route
# TODO get working on loonix
# print("Routing Board")
# subprocess.run(["python3", SCRIPT_DIR + "pipeline/routing/main.py"])
# print

# case
print("Generating Case")
os.chdir(CASE_REPO_DIR)
subprocess.run(["python3", CASE_MAIN_FILE, PCB_OUTPUT_FILE])
os.chdir(OUTPUT_DIR)
shutil.copytree(CASE_OUTPUT_DIR, OUTPUT_DIR + "case", dirs_exist_ok=True)
print()

# firmware
print("Compiling Firmware")
subprocess.run(
    [
        "python3",
        FIRMWARE_CONFIGURE_FILE,
        "-i",
        OUTPUT_DIR + "config.json",
        "-o",
        OUTPUT_DIR + "config.h",
    ]
)
shutil.copyfile(OUTPUT_DIR + "config.h", FIRMWARE_CFG_FILE)
subprocess.run(["bash", "-c", FIRMWARE_BUILD_FILE])
shutil.copyfile(
    FIRMWARE_REPO_DIR + "build/parakeyt_fw.uf2", OUTPUT_DIR + "firmware.uf2"
)
shutil.copyfile(
    FIRMWARE_REPO_DIR + "build/testing/bus_scan.uf2", OUTPUT_DIR + "bus_scan.uf2"
)
shutil.copyfile(
    FIRMWARE_REPO_DIR + "build/testing/printer.uf2", OUTPUT_DIR + "printer.uf2"
)
print()

quit()
