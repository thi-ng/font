import { readJSON, writeFile } from "@thi.ng/file-io";
import { slugify } from "@thi.ng/strings";
import glob from "fast-glob";
import { LOGGER } from "./api.js";
import { defFontFromFile } from "./gen.js";

const specs =
    process.argv.length > 2 ? process.argv.slice(2) : ["specs/*.json"];

const pkg = readJSON("package.json");

for (let fname of glob.sync(specs)) {
    LOGGER.info(`processing: ${fname}`);
    try {
        const font = defFontFromFile(fname);
        // TODO check when new opentype.js type decls are available
        // @ts-ignore
        const name = font.names.unicode.fullName.en;
        const basePath = `build/${slugify(name)}-${
            pkg.version
        }-${(Date.now() / 1000) | 0}`;

        LOGGER.info(`writing OTF: ${basePath}.otf`);
        writeFile(`${basePath}.otf`, Buffer.from(font.toArrayBuffer()));
    } catch (e) {
        LOGGER.severe((<Error>e).message + "\n");
        process.exit(1);
    }
}
