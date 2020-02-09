import { readFileSync, writeFileSync } from "fs";
import { LOGGER } from "./api";
import { defFontFromFile, renderSvgString } from "./gen";

const spec = process.argv.length > 2 ? process.argv[2] : "specs/base.json";
const strings =
    process.argv.length > 3 ? process.argv[3] : "specs/packages.txt";

const font = defFontFromFile(spec);

const basePath = "./build";

for (let pkg of readFileSync(strings)
    .toString()
    .split("\n")) {
    if (pkg.length) {
        LOGGER.info(pkg);
        writeFileSync(
            `${basePath}/${pkg}.svg`,
            renderSvgString(`thi.ng/${pkg}`, font)
        );
    }
}
