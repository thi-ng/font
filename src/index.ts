import { asCubic, circle } from "@thi.ng/geom";
import { map, range } from "@thi.ng/transducers";
import { readFileSync, writeFileSync } from "fs";
import { Font, Glyph, Path } from "opentype.js";

// dot radius
const R = 50;
const D = 2 * R;
const GAP = 15;
const DGAP = D + GAP * 2;
const X_HEIGHT = 6 * R + 5 * GAP;
const THETA = Math.atan2(X_HEIGHT, DGAP);

const rowPoint = (row: number) => {
    const y = row * R + Math.sign(row) * Math.max(0, Math.abs(row) - 1) * GAP;
    return [Math.cos(THETA) * y, y];
};

const OFFSETS = [...map(rowPoint, range(-4, 11))];

const line = (x: number, y1: number, y2: number) => {
    const path = new Path();
    const [ax, ay] = OFFSETS[y1];
    const [bx, by] = OFFSETS[y2];
    path.moveTo(x + ax, ay);
    path.lineTo(x + bx, by);
    path.lineTo(x + D + bx, by);
    path.lineTo(x + D + ax, ay);
    path.close();
    return path;
};

const bridge = (x: number, y: number, w: number) => {
    const path = new Path();
    const [ax, ay] = OFFSETS[y];
    const [bx, by] = OFFSETS[y + 1];
    w = w * D - (w - 1) * GAP;
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

// format:
// all coords as 4bit hex
// 0a => vertical line from row 0 -> row a
// .6 => dot at row 6
// > => forward x
// hb3 => h bridge @ row b span=3

interface GlyphDef {
    id: number;
    g: string;
    x?: number;
}

const defGlyph = ({ id, g, x }: GlyphDef) => {
    x = x || 0;
    const path = new Path();
    for (let i = 0; i < g.length; ) {
        switch (g[i]) {
            case ">":
                x += DGAP;
                i++;
                break;
            case ".": {
                const [ox, oy] = OFFSETS[parseInt(g[i + 1], 16)];
                path.extend(dot(x + ox + R, oy));
                i += 2;
                break;
            }
            case "h": {
                const y = parseInt(g.substr(i + 1, 2), 16);
                path.extend(bridge(x, y >> 4, y & 0xf));
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
        advanceWidth: x + DGAP,
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
    ...map(defGlyph, [
        { id: 0x2e, g: ".5" },
        { id: 0x3a, g: ".6.8" },
        { id: 0x41, g: "48h42h92>4a" },
        { id: 0x42, g: "4eh42>4a" },
        { id: 0x43, g: "4ah42h92>468a" },
        { id: 0x44, g: "4ah42>4e" },
        { id: 0x45, g: "4ah42h92>456a" },
        { id: 0x46, g: "4eh92hd2>ce" },
        { id: 0x47, g: "4a02h02h92>0a" },
        { id: 0x48, g: "4eh92>4a" },
        { id: 0x49, g: "4a.b" },
        { id: 0x4a, g: "029ah02h92>0a.b" },
        { id: 0x4b, g: "4eh72>8a47" },
        { id: 0x4c, g: "4e" },
        { id: 0x4d, g: "4ah93>4a>4a" },
        { id: 0x4e, g: "4ah92>4a" },
        { id: 0x4f, g: "4ah42h92>4a" },
        { id: 0x50, g: "0ah92>4a" },
        { id: 0x51, g: "4ah92>0a" },
        { id: 0x52, g: "4ah92>8a" },
        { id: 0x53, g: "467ah42h92>478a" },
        { id: 0x54, g: "hb2>4e", x: -DGAP },
        { id: 0x55, g: "4ah42>4a" },
        { id: 0x56, g: "4ah42>5a" },
        { id: 0x57, g: "4ah43>4a>4a" },
        { id: 0x58, g: "478ah72>478a" },
        { id: 0x59, g: "4ah42>0a" },
        { id: 0x5a, g: "47h42h92>7a" }
    ])
];

const pkg = JSON.parse(readFileSync("package.json").toString());

const font = new Font({
    ...pkg.font,
    version: pkg.version,
    unitsPerEm: 1000,
    ascender: 650,
    descender: -200,
    glyphs: glyphs
});

writeFileSync(
    `build/thing-regular-${pkg.version}-${(Date.now() / 1000) | 0}.otf`,
    Buffer.from(font.toArrayBuffer())
);
