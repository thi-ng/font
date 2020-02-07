import { asCubic, circle } from "@thi.ng/geom";
import { Glyph, Path } from "opentype.js";
import {
    COL_WIDTH,
    D,
    DOTGRID,
    GlyphDef,
    GRID,
    HGAP,
    R
} from "./api";

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

const diag = (x: number, y1: number, y2: number) => {
    const path = new Path();
    const [ax, ay] = GRID[y1];
    const [bx, by] = GRID[y2];
    if (y1 < y2) {
        path.moveTo(x + ax, ay);
        path.lineTo(x + COL_WIDTH + bx, by);
        path.lineTo(x + COL_WIDTH + D + bx, by);
        path.lineTo(x + D + ax, ay);
    } else {
        path.moveTo(x + COL_WIDTH + bx, by);
        path.lineTo(x + ax, ay);
        path.lineTo(x + D + ax, ay);
        path.lineTo(x + COL_WIDTH + D + bx, by);
    }
    path.close();
    return path;
};

const bridge = (x: number, y: number, span: number, xoff = 0) => {
    const path = new Path();
    const [ax, ay] = GRID[y];
    const [bx, by] = GRID[y + 1];
    const span2 = span >> 1;
    const numGaps = span2 - (span & 1 || xoff !== 0 ? 0 : 1);
    const w = span * R + numGaps * HGAP;
    x += xoff;
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

export const defGlyph = ({ id, name, g, x, width }: GlyphDef) => {
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
                path.extend(bridge(x, y >> 4, y & 0xf, g[i] === "H" ? R : 0));
                i += 3;
                break;
            }
            case "/": {
                const y = parseInt(g.substr(i + 1, 2), 16);
                path.extend(diag(x, y >> 4, y & 0xf));
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
        name: name || String.fromCharCode(id),
        unicode: id,
        advanceWidth: width || x + COL_WIDTH,
        path
    });
};
