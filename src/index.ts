import { map } from "@thi.ng/transducers";
import { readFileSync, writeFileSync } from "fs";
import { Font } from "opentype.js";
import { COL_WIDTH, MAX_Y, MIN_Y, R } from "./api";
import { defGlyph } from "./gen";
import * as pkg from "../package.json";

const glyphs = [
    ...map(defGlyph, [
        {
            name: ".notdef",
            id: 0,
            g: ">"
        },
        {
            name: "space",
            id: 0x20,
            g: ">"
        },
        // punctuation
        { id: 0x21, g: ".46e" },
        { id: 0x22, g: "ce>ce" },
        { id: 0x23, g: "H66Hb6>467bce>467bce", x: -R },
        { id: 0x28, g: "H43Hd35d>" },
        { id: 0x29, g: "h43hd3>5d" },
        { id: 0x2c, g: "25" },
        { id: 0x2d, g: "h74>" },
        { id: 0x2e, g: ".4" },
        { id: 0x2f, g: "0e" },
        { id: 0x3a, g: ".5.7" },
        { id: 0x3b, g: "25.7" },
        { id: 0x3d, g: "h54h74>" },
        { id: 0x5b, g: "h44hd45d>" },
        { id: 0x5d, g: "h44hd4>5d" },
        { id: 0x5f, g: "h44>" },
        // digits
        { id: 0x30, g: "5dh44hd4>5d" },
        { id: 0x31, g: "Hd3>4d", x: -R },
        { id: 0x32, g: "56/6ch44hd4>cd" },
        { id: 0x33, g: "h44hd4H93>4d" },
        { id: 0x34, g: "aeh94>49ae" },
        { id: 0x35, g: "adh44h94hd4>59" },
        { id: 0x36, g: "5a/aeh44>5a" },
        { id: 0x37, g: "/4dhd4>" },
        { id: 0x38, g: "48ae/8a/a8h44hd4>48ae" },
        { id: 0x39, g: "9dhd4/49>9d" },

        { id: 0x41 + 0x20, g: "4eHd3H83>4e" }, // A
        { id: 0x42 + 0x20, g: "48ae8aHd3H43/8a/a8>48ad" }, // B
        { id: 0x43 + 0x20, g: "4eHd3H43>ce46" }, //C
        { id: 0x44 + 0x20, g: "4e/ec/46>6c" }, // D
        { id: 0x45 + 0x20, g: "4eH43H82Hd3>" }, // E
        { id: 0x46 + 0x20, g: "4eH82Hd3>" }, // F
        { id: 0x47 + 0x20, g: "4eH43Hd3>49ce" }, // G
        { id: 0x48 + 0x20, g: "4eH83>4e" }, // H
        { id: 0x49 + 0x20, g: "4e>" }, // I
        { id: 0x4a + 0x20, g: "H42>4e", x: -COL_WIDTH }, // J
        { id: 0x4b + 0x20, g: "48ae8a/8a/a8>48ae" }, // K
        { id: 0x4c + 0x20, g: "4eH43>" }, // L
        { id: 0x4d + 0x20, g: "4eHd3>Hd38e>4e" }, // M
        { id: 0x4e + 0x20, g: "4eHd3>4e" }, // N
        { id: 0x4f + 0x20, g: "4eHd3H43>4e" }, // O
        { id: 0x50 + 0x20, g: "4eHd3H83>8e" }, // P
        { id: 0x51 + 0x20, g: "4eHd3H43>4eH42>" }, // Q
        { id: 0x52 + 0x20, g: "4eHd3/8a/a8>ae48" }, // R
        { id: 0x53 + 0x20, g: "46aeHd3/a8h43>48ce" }, // S
        { id: 0x54 + 0x20, g: "hd3>4eHd3>" }, // T
        { id: 0x55 + 0x20, g: "4eH43>4e" }, // U
        { id: 0x56 + 0x20, g: "4e/46>6e" }, // V
        { id: 0x57 + 0x20, g: "4eH43>H4349>4e" }, // W
        { id: 0x58 + 0x20, g: "48ae/8a/a8>48ae" }, // X
        { id: 0x59 + 0x20, g: "8eH83>4e" }, // Y
        { id: 0x5a + 0x20, g: "hd4H43/4d" }, // Z

        { id: 0x41, g: "58h44h94>59" }, //  a
        { id: 0x42, g: "5eh44>5a" }, //  b
        { id: 0x43, g: "5ah44h94>5689" }, //  c
        { id: 0x44, g: "5ah44>5e" }, //  d
        { id: 0x45, g: "5ah44h94>69" }, //  e
        { id: 0x46, g: "49adh93hd4>cd", width: 2 * COL_WIDTH - R }, // f
        { id: 0x47, g: "4912h04h94>19" }, //  g
        { id: 0x48, g: "49aeh94>49" }, //  h
        { id: 0x49, g: "4a.b" }, //  i
        { id: 0x4a, g: "12h04H93>19.b", x: -R }, //  j
        { id: 0x4b, g: "4e/78/76>468a" }, //  k
        { id: 0x4c, g: "4e" }, //  l
        { id: 0x4d, g: "49h96>49>49" }, //  m
        { id: 0x4e, g: "49h94>49" }, //  n
        { id: 0x4f, g: "59h44h94>59" }, //  o
        { id: 0x50, g: "09h94>49" }, //  p
        { id: 0x51, g: "49h94>09" }, //  q
        { id: 0x52, g: "49h94>89" }, //  r
        { id: 0x53, g: "5689/86h44h94>5689" }, //  s
        { id: 0x54, g: "Hb3>4bce", x: -COL_WIDTH }, // t
        { id: 0x55, g: "5ah44>5a" }, //  u
        { id: 0x56, g: "4a/46>6a" }, //  v
        { id: 0x57, g: "5ah46>5a>5a" }, //  w
        { id: 0x58, g: "468a/68/86>468a" }, //  x
        { id: 0x59, g: "5ah44>045a" }, //  y
        { id: 0x5a, g: "/59h44h94>" } //  z
    ])
];

const font = new Font({
    ...pkg.font,
    version: pkg.version,
    unitsPerEm: 1024,
    ascender: MAX_Y,
    descender: MIN_Y,
    glyphs: glyphs
});

const basePath = `build/thing-regular-${pkg.version}-${(Date.now() / 1000) |
    0}`;

// writeFileSync(`${basePath}.json`, JSON.stringify(font.toTables(), null, 4));

writeFileSync(`${basePath}.otf`, Buffer.from(font.toArrayBuffer()));
