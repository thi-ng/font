import { map } from "@thi.ng/transducers";
import { writeFileSync } from "fs";
import { Font } from "opentype.js";
import { MAX_Y, MIN_Y } from "./api";
import { defGlyph } from "./gen";
import { data } from "./data";
import * as pkg from "../package.json";

const glyphs = [...map(defGlyph, data)];

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
