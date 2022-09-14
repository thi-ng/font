import { slugify } from "@thi.ng/strings";
import { readFileSync, writeFileSync } from "fs";
import { loadSync } from "opentype.js";
import { LOGGER } from "./api.js";
import { renderSvgString } from "./gen.js";

if (process.argv.length < 3) {
    console.log("usage: yarn build:banners font.otf [strings.txt]");
    process.exit(1);
}

const basePath = "./build";
const font = loadSync(process.argv[2]);
const strings =
    process.argv.length > 3 ? process.argv[3] : "specs/packages.txt";

for (let pkg of readFileSync(strings).toString().split("\n")) {
    if (pkg.length) {
        LOGGER.info(pkg);
        writeFileSync(
            `${basePath}/${slugify(pkg)}.svg`,
            renderSvgString(pkg, font)
        );
    }
}
