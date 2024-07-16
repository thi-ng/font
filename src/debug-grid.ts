import { readJSON, writeText } from "@thi.ng/file-io";
import { serialize } from "@thi.ng/hiccup";
import { line, svg } from "@thi.ng/hiccup-svg";
import { map, range } from "@thi.ng/transducers";
import { Path } from "opentype.js";
import { defGlyph, initConfig } from "./gen.js";

const fontDef = readJSON("specs/base.json");
const config = initConfig(fontDef.config);

const glyphs = [
    {
        id: 0x22,
        g: "4a.b>.4",
    },
    {
        id: 0x21,
        g: ".0.1.2.3.5.6.7.8.9.a.b.c.d>04>14>24>34>45>46>47>48>49>4a>4b>4c>4d>4e",
    },
].map((spec) => defGlyph(config, spec));

writeText(
    `build/diagram-${(Date.now() / 1000) | 0}.svg`,
    serialize(
        svg(
            {
                fill: "none",
                stroke: "black",
                viewBox: `-10 0 2300 ${config.maxY - config.minY}`,
            },
            [
                "g",
                { transform: `matrix(1 0 0 -1 0 ${config.maxY - 10})` },
                [
                    "g",
                    { stroke: "#666" },
                    ...map(
                        (x) =>
                            line(
                                [
                                    x * config.colWidth,
                                    config.minY - config.vgap,
                                ],
                                [x * config.colWidth, config.maxY]
                            ),
                        range(0, 18)
                    ),
                    ...map(
                        (g) => line([-10, g[1]], [18 * config.colWidth, g[1]]),
                        config.grid
                    ),
                ],
                [
                    "g",
                    { stroke: "#f66" },
                    ...map(
                        (x) =>
                            line(
                                [
                                    x * config.colWidth - config.hgap,
                                    config.minY - config.vgap,
                                ],
                                [x * config.colWidth - config.hgap, config.maxY]
                            ),
                        range(0, 18)
                    ),
                    ...map(
                        (g) =>
                            line(
                                [-10, g[1] + config.r],
                                [18 * config.colWidth, g[1] + config.r]
                            ),
                        config.grid
                    ),
                ],
                [
                    "g",
                    { stroke: "none", fill: "#000" },
                    (<Path>glyphs[0].path).toSVG(3),
                ],
                [
                    "g",
                    {
                        transform: `translate(${config.colWidth},0)`,
                        "stroke-width": 5,
                    },
                    (<Path>glyphs[1].path).toSVG(3),
                ],
            ]
        )
    )
);
