import { asCubic, circle } from "@thi.ng/geom";
import { map, mapcat, range } from "@thi.ng/transducers";
import { maddN2, mulN2, normalize } from "@thi.ng/vectors";
import { readFileSync, writeFileSync } from "fs";
import { Font, Glyph, Path } from "opentype.js";

// dot radius
const R = 50;
const D = 2 * R;
const GAP = 33;
const COL_WIDTH = D + GAP;
const X_HEIGHT = 6 * R + 5 * GAP;
const DIR = normalize(null, [COL_WIDTH, X_HEIGHT]);
const MIN = mulN2([], DIR, -4 * R - 3 * GAP);

const rowPoint = (row: number) =>
    maddN2([], DIR, row * R + (row - 1) * GAP, MIN);

const GRID = [...map(rowPoint, range(15))];
const DOTGRID = [
    ...map((i) => {
        const p = rowPoint(i + 0.5);
        return [p[0] + R, p[1]];
    }, range(15))
];

const line = (x: number, y1: number, y2: number) => {
    const path = new Path();
    const [ax, ay] = GRID[y1];
    const [bx, by] = GRID[y2];
    path.moveTo(x + ax, ay);
    path.lineTo(x + bx, by);
    path.lineTo(x + D + bx, by);
    path.lineTo(x + D + ax, ay);
    path.close();
    return path;
};

const bridge = (x: number, y: number, span: number) => {
    const path = new Path();
    const [ax, ay] = GRID[y];
    const [bx, by] = GRID[y + 1];
    const span2 = span >> 1;
    const w = span * R + (span2 - (span & 1 ? 0 : 1)) * GAP;
    path.moveTo(x + ax, ay);
    path.lineTo(x + bx, by);
    path.lineTo(x + w + bx, by);
    path.lineTo(x + w + ax, ay);
    path.close();
    return path;
};

const dot = (x: number, y: number) => {
    const path = new Path();
    const segments = asCubic(circle([x, y], R));
    path.moveTo(segments[0].points[0][0], segments[0].points[0][1]);
    for (let s of segments) {
        const [_, b, c, d] = s.points;
        path.bezierCurveTo(b[0], b[1], c[0], c[1], d[0], d[1]);
    }
    return path;
};

// grammar:
// all coords as 4bit hex
// 0a => vertical line from row 0 -> row a
// .6 => dot at row 6
// > => forward x
// hb3 => h bridge @ row b span=3 (3x R)
// Hb3 => like `h` but shifted right by R

interface GlyphDef {
    id: number;
    g: string;
    x?: number;
    width?: number;
}

const defGlyph = ({ id, g, x, width }: GlyphDef) => {
    x = x || 0;
    const path = new Path();
    for (let i = 0; i < g.length; ) {
        switch (g[i]) {
            case ">":
                x += COL_WIDTH;
                i++;
                break;
            case ".": {
                const [ox, oy] = DOTGRID[parseInt(g[i + 1], 16)];
                path.extend(dot(x + ox, oy));
                i += 2;
                break;
            }
            case "h":
            case "H": {
                const y = parseInt(g.substr(i + 1, 2), 16);
                path.extend(
                    bridge(x + (g[i] === "H" ? R : 0), y >> 4, y & 0xf)
                );
                i += 3;
                break;
            }
            default: {
                const y = parseInt(g.substr(i, 2), 16);
                path.extend(line(x, y >> 4, y & 0xf));
                i += 2;
            }
        }
    }
    return new Glyph({
        name: String.fromCharCode(id),
        unicode: id,
        advanceWidth: width || x + COL_WIDTH,
        path
    });
};

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
    ascender: COL_WIDTH * 6,
    descender: -COL_WIDTH * 3,
    glyphs: glyphs
});

writeFileSync(
    `build/thing-regular-${pkg.version}-${(Date.now() / 1000) | 0}.otf`,
    Buffer.from(font.toArrayBuffer())
);
