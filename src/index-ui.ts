import { line, svg } from "@thi.ng/hiccup-svg";
import { map, range2d, pairs } from "@thi.ng/transducers";
import { updateDOM } from "@thi.ng/transducers-hdom";
import { Atom } from "@thi.ng/atom";
import { setIn } from "@thi.ng/paths";
import { fromAtom } from "@thi.ng/rstream";
import { Path } from "opentype.js";
import { MAX_Y, MIN_Y, R, HGAP, GRID, D } from "./api";
import { defGlyph } from "./gen";
import { data } from "./data";

type GlyphSpec = {
    name: string;
    id: number;
    g: string;
    x?: number;
    width?: number;
};

function hash(item: GlyphSpec) {
    return `${item.id}-${item.name}`;
}

const dataObj = data.slice(23, 24).reduce((acc, item) => {
    // const dataObj = data..reduce((acc, item) => {
    acc[hash(item)] = item;
    return acc;
}, <{ [k: string]: GlyphSpec }>{});

const db = new Atom({
    glyphs: dataObj
});
(window as any).db = db;

const cachedGlyphsUi = db.addView("glyphs", (glyphs) => [
    ...map(
        ([_, glyph]) => glyphEditor(glyph),
        pairs(<{ [k: string]: GlyphSpec }>glyphs)
    )
]);

const setGlyphValue = (item: GlyphSpec, g: string) => {
    db.swap((state) => setIn(state, ["glyphs", hash(item), "g"], g));
};

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
                    fill: "silver",
                    stroke: "none",
                    "font-size": "2rem",
                    "font-family": "monospace"
                },
                `${xi.toString(16)},${yi}`
            ]
        ];
    }, range2d(14, 6))
];

function glyphEditor(item: GlyphSpec) {
    const { name, id, g } = item;
    const glyph = defGlyph({ id, g });
    const pathString = (glyph.path as Path).toSVG(4);
    return [
        "div.ba.ma2.pa2.b--silver",
        { style: { width: "400px" } },
        ["p.ma0", ["span.silver.sub", id], ["span.b.ml2", name]],
        [
            "input",
            {
                type: "text",
                value: g,
                onchange: (event: InputEvent) =>
                    setGlyphValue(item, (<any>event.target).value),
                onblur: (event: InputEvent) =>
                    setGlyphValue(item, (<any>event.target).value)
            }
        ],
        [
            "svg",
            { viewBox: `-100 0 1300 ${MAX_Y - MIN_Y}`, width: 400 },
            [
                "g",
                { transform: `matrix(1 0 0 -1 0 ${MAX_Y - 10})` },
                [wrapper, pathString],
                ["g", { fill: "none", stroke: "silver" }, ...gridElements]
            ]
        ]
    ];
}

const wrapper = innerHtmlWrapperSvg();
const app = () => {
    return ["div.flex.flex-wrap.code", ...cachedGlyphsUi.deref()!];
};

const streamAtomChange = fromAtom(db);
streamAtomChange.transform(map(app), updateDOM());

if (process.env.NODE_ENV !== "production") {
    const hot = (<any>module).hot;
    hot && hot.dispose(() => streamAtomChange.done());
}
