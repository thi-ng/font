import argparse
import fontforge
import json

parser = argparse.ArgumentParser()
parser.add_argument("-i", metavar="path", help="Input font path", nargs=1)
parser.add_argument("-k", metavar="path", help="Font JSON spec", nargs=1)
parser.add_argument(
    "-o", required=False, metavar="path", help="Optional output font path", nargs=1
)

args = parser.parse_args()

if args.i is None or args.k is None:
    parser.print_help()
    exit(1)
src_path = args.i[0]

if args.o is None:
    dest_path = args.i[0][:-4] + "-kerned.otf"
else:
    dest_path = args.o[0]

spec = json.load(open(args.k[0], "r", encoding="utf-8"))
r = spec["config"]["r"]
gap = spec["config"]["gap"][0]

print("processing font:", src_path)
font = fontforge.open(src_path)

print("cleaning glyphs...")
font.selection.all()
font.removeOverlap()
font.simplify()
font.correctDirection()

font.addLookup(
    "kern",
    "gpos_pair",
    ("ignore_ligatures", "ignore_marks",),
    (("kern", (("DFLT", ("dflt")),)),),
)
font.addLookupSubtable("kern", "kern-1")

for pair in spec["kern"]:
    advance = pair["xadv"]
    xadv = advance[0] * r + advance[1] * gap
    for id in pair["l"]:
        for id2 in pair["r"]:
            print("add kern pair:", id, id2, xadv)
            glyph = font.createChar(ord(id))
            glyph.addPosSub("kern-1", id2, 0, 0, xadv, 0, 0, 0, 0, 0)

print("writing", dest_path)
font.generate(dest_path)
