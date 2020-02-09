import { assert } from "@thi.ng/api";
import { asCubic, circle } from "@thi.ng/geom";
import { serialize } from "@thi.ng/hiccup";
import { svg } from "@thi.ng/hiccup-svg";
import { map, range } from "@thi.ng/transducers";
import { maddN2, mulN2, normalize } from "@thi.ng/vectors";
import { readFileSync } from "fs";
import { Font, Glyph, Path } from "opentype.js";
import pkg from "../package.json";
import {
    DEFAULT_CONFIG,
    FontConfig,
    GlyphSpec,
    LOGGER,
    RawFontConfig,
    RawFontStyleSpec
} from "./api";

export const initConfig = (raw: RawFontConfig) => {
    raw = { ...DEFAULT_CONFIG, ...raw };
    const r = raw.r;
    const [hgap, vgap] = raw.gap;
    const [rmin, rmax] = raw.extent;
    const d = r * 2;
    const colWidth = d + hgap;
    const dir = normalize(null, [
        raw.slant[0] * colWidth,
        raw.slant[1] * r + (raw.slant[1] - 1) * vgap
    ]);
    const min = mulN2([], dir, rmin * r - (Math.abs(rmin) - 1) * vgap);
    const max = mulN2([], dir, rmax * r + (rmax - 1) * vgap);

    const rowPoint = (row: number) =>
        maddN2([], dir, row * r + (row - 1) * vgap, min);

    const grid = [...map(rowPoint, range(15))];
    const dotGrid = [
        ...map((i) => {
            const p = rowPoint(i + r / (r + vgap));
            return [p[0] + r, p[1]];
        }, range(15))
    ];

    return <FontConfig>{
        r,
        d,
        hgap,
        vgap,
        colWidth,
        dir,
        grid,
        dotGrid,
        minY: min[1],
        maxY: max[1]
    };
};

const line = (config: FontConfig, x: number, y1: number, y2: number) => {
    const path = new Path();
    const [ax, ay] = config.grid[y1];
    const [bx, by] = config.grid[y2];
    path.moveTo(x + ax, ay);
    path.lineTo(x + bx, by);
    path.lineTo(x + config.d + bx, by);
    path.lineTo(x + config.d + ax, ay);
    path.close();
    return path;
};

const diag = (config: FontConfig, x: number, y1: number, y2: number) => {
    const path = new Path();
    const [ax, ay] = config.grid[y1];
    const [bx, by] = config.grid[y2];
    if (y1 < y2) {
        path.moveTo(x + ax, ay);
        path.lineTo(x + config.colWidth + bx, by);
        path.lineTo(x + config.colWidth + config.d + bx, by);
        path.lineTo(x + config.d + ax, ay);
    } else {
        path.moveTo(x + config.colWidth + bx, by);
        path.lineTo(x + ax, ay);
        path.lineTo(x + config.d + ax, ay);
        path.lineTo(x + config.colWidth + config.d + bx, by);
    }
    path.close();
    return path;
};

const bridge = (
    config: FontConfig,
    x: number,
    y: number,
    span: number,
    xoff = 0
) => {
    const path = new Path();
    const [ax, ay] = config.grid[y];
    const [bx, by] = config.grid[y + 1];
    const span2 = span >> 1;
    const numGaps = span2 - (span & 1 || xoff !== 0 ? 0 : 1);
    const w = span * config.r + numGaps * config.hgap;
    x += xoff;
    path.moveTo(x + ax, ay);
    path.lineTo(x + bx, by);
    path.lineTo(x + w + bx, by);
    path.lineTo(x + w + ax, ay);
    path.close();
    return path;
};

const dot = (config: FontConfig, x: number, y: number) => {
    const path = new Path();
    const segments = asCubic(circle([x, y], config.r));
    path.moveTo(segments[0].points[0][0], segments[0].points[0][1]);
    for (let s of segments) {
        const [_, b, c, d] = s.points;
        path.bezierCurveTo(b[0], b[1], c[0], c[1], d[0], d[1]);
    }
    return path;
};

export const defGlyph = (
    config: FontConfig,
    { id, name, g, width, x: _x }: GlyphSpec
) => {
    assert(
        id !== undefined || name !== undefined,
        "missing `id` or `name` in glyph spec"
    );
    if (id === undefined) {
        id = name!.charCodeAt(0);
    } else if (name === undefined) {
        name = String.fromCharCode(id!);
    }
    let x = _x ? _x[0] * config.colWidth + _x[1] * config.r : 0;
    const path = new Path();
    for (let i = 0; i < g.length; ) {
        switch (g[i]) {
            case ">":
                x += config.colWidth;
                i++;
                break;
            case ".": {
                const [ox, oy] = config.dotGrid[parseInt(g[i + 1], 16)];
                path.extend(dot(config, x + ox, oy));
                i += 2;
                break;
            }
            case "h":
            case "H": {
                const y = parseInt(g.substr(i + 1, 2), 16);
                path.extend(
                    bridge(
                        config,
                        x,
                        y >> 4,
                        y & 0xf,
                        g[i] === "H" ? config.r : 0
                    )
                );
                i += 3;
                break;
            }
            case "/": {
                const y = parseInt(g.substr(i + 1, 2), 16);
                path.extend(diag(config, x, y >> 4, y & 0xf));
                i += 3;
                break;
            }
            default: {
                const y = parseInt(g.substr(i, 2), 16);
                path.extend(line(config, x, y >> 4, y & 0xf));
                i += 2;
            }
        }
    }
    return new Glyph({
        unicode: id,
        name: name,
        advanceWidth: width
            ? width[0] * config.colWidth + width[1] * config.r
            : x + config.colWidth,
        path
    });
};

export const defFont = (spec: RawFontStyleSpec) => {
    LOGGER.info(`generating family: ${spec.font.styleName}`);

    const config = initConfig(spec.config);
    const glyphs = [
        {
            name: ".notdef",
            id: 0,
            g: ">"
        },
        ...spec.glyphs
    ].map((spec: GlyphSpec) => defGlyph(config, spec));

    LOGGER.info(`${glyphs.length} glyphs`);

    return new Font({
        ...pkg.font,
        ...spec.font,
        version: pkg.version,
        unitsPerEm: 1024,
        ascender: config.maxY,
        descender: config.minY,
        glyphs: glyphs
    });
};

export const defFontFromFile = (specPath: string) =>
    defFont(JSON.parse(readFileSync(specPath).toString()));

export const renderSvgString = (str: string, font: Font, fontSize = 72) => {
    const paths = font.getPaths(str, 0, fontSize * 0.66, fontSize, {
        kerning: false,
        features: {}
    });
    const union = paths.reduce((acc, p) => (acc.extend(p), acc), new Path());
    const b: any = union.getBoundingBox();
    const width = b.x2 - b.x1;
    const height = b.y2 - b.y1;
    return serialize(
        svg(
            { width, height, viewBox: `${b.x1} ${b.y1} ${width} ${height}` },
            ...paths.map((p) => p.toSVG(3))
        )
    );
};
