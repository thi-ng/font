import { start } from "@thi.ng/hdom";
import { parse } from "@thi.ng/sax";
import { Path } from "opentype.js";
import { MAX_Y, MIN_Y, R, HGAP } from "./api";
import { defGlyph, line } from "./gen";
import { map, range2d } from "@thi.ng/transducers";

// const glyph = defGlyph({ id: 0x45, g: "5ah44h94>69" });
const glyph = defGlyph({ id: 0x45, g: "5a>h62H72" });
const pathString = (glyph.path as Path).toSVG(4);

const cmdRegEx = /[a-z][^a-z]*/gi;

const innerHtmlWrapper = () =>
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

/**
 *
 * @param s string that represents a command with two points in svg path d attribute.
 *          The two numbers can be space-separated
 *          or not (if the second is number is positive):
 *          For example: `M18.4175 62.3362` or `M-55.2525-187.0085`
 * @returns a two numbers array
 */
function toPoint(s: string | null) {
    if (s == null) {
        return [0, 0];
    }
    s = s.slice(1);
    const numbers = [""];
    for (let i = 0; i < s.length; i++) {
        if (i === 0) {
            numbers[numbers.length - 1] += s[i];
            continue;
        }
        if (s[i] === " ") {
            numbers.push("");
            continue;
        }
        if (s[i] === "-") {
            numbers.push("");
            numbers[numbers.length - 1] += s[i];
            continue;
        }
        numbers[numbers.length - 1] += s[i];
    }
    const ret = numbers.filter(Boolean).map((n) => Number(n));
    return ret;
}

const app = () => {
    const wrapper = innerHtmlWrapper();

    return [
        "svg",
        { viewBox: `-100 0 1300 ${MAX_Y - MIN_Y}`, width: 600 },
        [
            "g",
            { transform: `matrix(1 0 0 -1 0 ${MAX_Y - 10})` },
            [wrapper, pathString],
            [
                "g.foo",
                { fill: "none", stroke: "silver" },

                ...map(([x, y]) => {
                    const blockPathString = line(0, x, x + 1).toSVG(4);
                    const doc = [...parse(blockPathString)];
                    const dString = doc[0].attribs!.d;

                    const commands = dString.match(cmdRegEx);
                    const firstPoint = toPoint(commands && commands[0]);
                    console.log(commands && commands[0]);

                    return [
                        "g",
                        { transform: `translate(${y * (R + HGAP)}, 0)` },
                        [wrapper, blockPathString],
                        [
                            "g",
                            { transform: `translate(${firstPoint.join(" ")})` },
                            [
                                "text",
                                {
                                    transform: "scale(1, -1)",
                                    x: 50,
                                    y: -5,
                                    fill: "#999",
                                    stroke: "none",
                                    "font-size": "2rem",
                                    "font-family": "monospace"
                                },
                                `${x.toString(16)},${y}`
                            ]
                        ]
                    ];
                }, range2d(14, 6))
            ]
        ]
    ];
};

const cancel = start(app());

if (process.env.NODE_ENV !== "production") {
    const hot = (<any>module).hot;
    hot && hot.dispose(cancel);
}
