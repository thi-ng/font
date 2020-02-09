import { slugify } from "@thi.ng/strings";
import glob from "fast-glob";
import { writeFileSync } from "fs";
import pkg from "../package.json";
import { LOGGER } from "./api";
import { defFontFromFile } from "./gen";

const specs =
    process.argv.length > 2 ? process.argv.slice(2) : ["specs/*.json"];

for (let fname of glob.sync(specs)) {
    LOGGER.info(`processing: ${fname}`);
    try {
        const font = defFontFromFile(fname);
        const basePath = `build/${slugify(font.names.fullName.en)}-${
            pkg.version
        }-${(Date.now() / 1000) | 0}`;

        LOGGER.info(`writing OTF: ${basePath}.otf`);
        writeFileSync(`${basePath}.otf`, Buffer.from(font.toArrayBuffer()));
    } catch (e) {
        LOGGER.severe(e.message + "\n");
        process.exit(1);
    }
}
