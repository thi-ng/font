import { serialize } from "@thi.ng/hiccup";
import { line, svg } from "@thi.ng/hiccup-svg";
import { map, range } from "@thi.ng/transducers";
import { writeFileSync } from "fs";
import { Path } from "opentype.js";
import {
    COL_WIDTH,
    GRID,
    HGAP,
    MAX_Y,
    MIN_Y,
    R,
    VGAP
} from "./api";
import { defGlyph } from "./gen";

const glyphs = [
    {
        id: 0x22,
        g: "4a.b>.4"
    },
    {
        id: 0x21,
        g:
            ".0.1.2.3.5.6.7.8.9.a.b.c.d>04>14>24>34>45>46>47>48>49>4a>4b>4c>4d>4e"
    }
].map(defGlyph);

writeFileSync(
    `build/diagram-${(Date.now() / 1000) | 0}.svg`,
    serialize(
        svg(
            {
                fill: "none",
                stroke: "black",
                viewBox: `-10 0 2300 ${MAX_Y - MIN_Y}`
            },
            [
                "g",
                { transform: `matrix(1 0 0 -1 0 ${MAX_Y - 10})` },
                [
                    "g",
                    { stroke: "#666" },
                    ...map(
                        (x) =>
                            line(
                                [x * COL_WIDTH, MIN_Y - VGAP],
                                [x * COL_WIDTH, MAX_Y]
                            ),
                        range(0, 18)
                    ),
                    ...map(
                        (g) => line([-10, g[1]], [18 * COL_WIDTH, g[1]]),
                        GRID
                    )
                ],
                [
                    "g",
                    { stroke: "#f66" },
                    ...map(
                        (x) =>
                            line(
                                [x * COL_WIDTH - HGAP, MIN_Y - VGAP],
                                [x * COL_WIDTH - HGAP, MAX_Y]
                            ),
                        range(0, 18)
                    ),
                    ...map(
                        (g) =>
                            line([-10, g[1] + R], [18 * COL_WIDTH, g[1] + R]),
                        GRID
                    )
                ],
                [
                    "g",
                    { stroke: "none", fill: "#000" },
                    (<Path>glyphs[0].path).toSVG(3)
                ],
                [
                    "g",
                    {
                        transform: `translate(${COL_WIDTH},0)`,
                        "stroke-width": 5
                    },
                    (<Path>glyphs[1].path).toSVG(3)
                ]
            ]
        )
    )
);
