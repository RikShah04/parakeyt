import pcbnew

def label_switches(pcb_path: str):
    board = pcbnew.LoadBoard(pcb_path)
    counter = 1

    for fp in board.GetFootprints():
        ref = fp.GetReference()
        if ref.startswith("REF"):
            fp.SetReference(f"SW{counter}")
            counter += 1

    board.Save(pcb_path)
    print(f"Done! {counter - 1} switches renamed.")
