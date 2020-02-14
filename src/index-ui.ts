import { start } from "@thi.ng/hdom";
import { parse } from "@thi.ng/sax";
import { line, svg } from "@thi.ng/hiccup-svg";
import { Path } from "opentype.js";
import { MAX_Y, MIN_Y, R, HGAP, COL_WIDTH, VGAP, GRID, D } from "./api";
import { defGlyph } from "./gen";
import { map, range2d } from "@thi.ng/transducers";

const glyph = defGlyph({ id: 0x45, g: "5a>h62H72" });
const pathString = (glyph.path as Path).toSVG(4);

const cmdRegEx = /[a-z][^a-z]*/gi;

const innerHtmlWrapperSvg = () =>
    <any>{
        init(el: any, _: any, html: string) {
            this.el = el;
            this.prev = html;
            el.innerHTML = html;
        },
        render(_: any, html: string) {
            if (this.el && this.prev != html) {
                this.el.innerHTML = html;
                this.prev = html;
            }
            return ["g"];
        },
        release() {
            this.el.innerHTML = "";
            delete this.prev;
            delete this.el;
        }
    };

const gridElements = [
    ...map(([xi, yi]) => {
        const x = 0;
        const y1 = xi;
        const y2 = x + 1;
        const [ax, ay] = GRID[y1];
        const [bx, by] = GRID[y2];
        return [
            "g",
            { transform: `translate(${yi * (R * 2 + HGAP)}, 0)` },
            line([x + ax, ay], [x + bx, by]),
            line([x + bx, by], [x + D + bx, by]),
            line([x + D + bx, by], [x + D + ax, ay]),
            line([x + D + ax, ay], [x + ax, ay]),

            [
                "text",
                {
                    transform: `translate(${x + ax} ${ay}) scale(1, -1)`,
                    x: 50,
                    y: -5,
                    fill: "#999",
                    stroke: "none",
                    "font-size": "2rem",
                    "font-family": "monospace"
                },
                `${xi.toString(16)},${yi}`
            ]
        ];
    }, range2d(14, 6))
];

const app = () => {
    const wrapper = innerHtmlWrapperSvg();

    return [
        "svg",
        { viewBox: `-100 0 1300 ${MAX_Y - MIN_Y}`, width: 600 },
        [
            "g",
            { transform: `matrix(1 0 0 -1 0 ${MAX_Y - 10})` },
            [wrapper, pathString],
            ["g", { fill: "none", stroke: "silver" }, ...gridElements]
        ]
    ];
};

const cancel = start(app());

if (process.env.NODE_ENV !== "production") {
    const hot = (<any>module).hot;
    hot && hot.dispose(cancel);
}
