import { asCubic, circle } from "@thi.ng/geom";
import { map, range } from "@thi.ng/transducers";
import { readFileSync, writeFileSync } from "fs";
import { Font, Glyph, Path } from "opentype.js";

const R = 50;
const D = 2 * R;
const GAP = 12;
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
    const a = OFFSETS[y1];
    const b = OFFSETS[y2];
    path.moveTo(x + a[0], a[1]);
    path.lineTo(x + b[0], b[1]);
    path.lineTo(x + D + b[0], b[1]);
    path.lineTo(x + D + a[0], a[1]);
    path.close();
    return path;
};

const bridge = (x: number, y: number, w: number) => {
    const path = new Path();
    const a = OFFSETS[y];
    const b = OFFSETS[y + 1];
    w = w * D - (w - 1) * GAP;
    path.moveTo(x + a[0], a[1]);
    path.lineTo(x + b[0], b[1]);
    path.lineTo(x + w + b[0], b[1]);
    path.lineTo(x + w + a[0], a[1]);
    path.close();
    return path;
};

const dot = (x: number, y: number) => {
    const segments = asCubic(circle([x, y], R));
    const path = new Path();
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

const defGlyph = (id: number, fmt: string, x = 0) => {
    const path = new Path();
    for (let i = 0; i < fmt.length; ) {
        const f = fmt[i];
        if (f === ">") {
            x += DGAP;
            i++;
        } else if (f === ".") {
            const [ox, oy] = OFFSETS[parseInt(fmt[i + 1], 16)];
            path.extend(dot(x + ox + R, oy));
            i += 2;
        } else if (f === "h") {
            const y = parseInt(fmt.substr(i + 1, 2), 16);
            path.extend(bridge(x, y >> 4, y & 0xf));
            i += 3;
        } else {
            const y = parseInt(fmt.substr(i, 2), 16);
            path.extend(line(x, y >> 4, y & 0xf));
            i += 2;
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
    defGlyph(0x2e, ".5"),
    defGlyph(0x3a, ".6.8"),
    defGlyph(0x41, "48h42h92>4a"),
    defGlyph(0x42, "4eh42>4a"),
    defGlyph(0x43, "4ah42h92>468a"),
    defGlyph(0x44, "4ah42>4e"),
    defGlyph(0x45, "4ah42h92>456a"),
    defGlyph(0x46, "4eh92hd2>ce"),
    defGlyph(0x47, "4a02h02h92>0a"),
    defGlyph(0x48, "4eh92>4a"),
    defGlyph(0x49, "4a.b"),
    defGlyph(0x4a, "029ah02h92>0a.b"),
    defGlyph(0x4b, "4eh72>8a47"),
    defGlyph(0x4c, "4e"),
    defGlyph(0x4d, "4ah93>4a>4a"),
    defGlyph(0x4e, "4ah92>4a"),
    defGlyph(0x4f, "4ah42h92>4a"),
    defGlyph(0x50, "0ah92>4a"),
    defGlyph(0x51, "4ah92>0a"),
    defGlyph(0x52, "4ah92>8a"),
    defGlyph(0x53, "7ah42h92>47"),
    defGlyph(0x54, "hb2>4e", -DGAP),
    defGlyph(0x55, "4ah42>4a"),
    defGlyph(0x56, "4ah42>5a"),
    defGlyph(0x57, "4ah43>4a>4a"),
    defGlyph(0x58, "478ah72>478a"),
    defGlyph(0x59, "4ah42>0a"),
    defGlyph(0x5a, "47h42h92>7a")
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
