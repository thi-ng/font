import { map, mapcat } from "@thi.ng/transducers";
import { readFileSync, writeFileSync } from "fs";
import { Font, Glyph, Path } from "opentype.js";
import {
    COL_WIDTH,
    MAX_Y,
    MIN_Y,
    R
} from "./api";
import { defGlyph } from "./gen";

const glyphs = [
    new Glyph({
        name: ".notdef",
        unicode: 0,
        advanceWidth: 650,
        path: new Path()
    }),
    new Glyph({
        name: "space",
        unicode: 32,
        advanceWidth: 2 * COL_WIDTH,
        path: new Path()
    }),
    ...map(defGlyph, [
        // punctuation
        { id: 0x28, g: "H43Hd35d>" },
        { id: 0x29, g: "h43hd3>5d" },
        { id: 0x2d, g: "h74>" },
        { id: 0x2e, g: ".4" },
        { id: 0x2f, g: "0e" },
        { id: 0x3a, g: ".5.7" },
        { id: 0x3d, g: "h54h74>" },
        { id: 0x5b, g: "h44hd45d>" },
        { id: 0x5d, g: "h44hd4>5d" },
        { id: 0x5f, g: "h44>" },
        // digits
        { id: 0x30, g: "5dh44hd4>5d" },
        { id: 0x31, g: "Hd3>4d", x: -R }
    ]),
    ...mapcat(
        (spec) => [
            // orig
            defGlyph(spec),
            // duplicate as lowercase
            defGlyph({ ...spec, id: spec.id + 0x20 })
        ],
        [
            { id: 0x41, g: "58h44h94>59" },
            { id: 0x42, g: "5eh44>5a" },
            { id: 0x43, g: "5ah44h94>5689" },
            { id: 0x44, g: "5ah44>5e" },
            { id: 0x45, g: "5ah44h94>69" },
            { id: 0x46, g: "49adh93hd4>cd", width: 2 * COL_WIDTH - R },
            { id: 0x47, g: "4912h04h94>19" },
            { id: 0x48, g: "49aeh94>49" },
            { id: 0x49, g: "4a.b" },
            { id: 0x4a, g: "12h04H93>19.b", x: -R },
            { id: 0x4b, g: "478eh73>8a47" },
            { id: 0x4c, g: "4e" },
            { id: 0x4d, g: "49h96>49>49" },
            { id: 0x4e, g: "49h94>49" },
            { id: 0x4f, g: "59h44h94>59" },
            { id: 0x50, g: "09h94>49" },
            { id: 0x51, g: "49h94>09" },
            { id: 0x52, g: "49h94>89" },
            { id: 0x53, g: "5679h44h94>5789" },
            { id: 0x54, g: "Hb3>4bce", x: -COL_WIDTH },
            { id: 0x55, g: "5ah44>5a" },
            { id: 0x56, g: "5ah43>5a" },
            { id: 0x57, g: "5ah46>5a>5a" },
            { id: 0x58, g: "478aH72>478a" },
            { id: 0x59, g: "5ah44>045a" },
            { id: 0x5a, g: "57h44h94>79" }
        ]
    )
];

const pkg = JSON.parse(readFileSync("package.json").toString());

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
