import { ConsoleLogger, LogLevel } from "@thi.ng/logger";
import { Vec } from "@thi.ng/vectors";

export interface GlyphSpec {
    id?: number;
    name?: string;
    g: string;
    x?: number[];
    width?: number[];
}

export interface FontConfig {
    /**
     * Dot radius, the fundamental param on which everything else is
     * based on.
     */
    r: number;
    /**
     * Dot diameter, i.e. `2 * r`.
     */
    d: number;
    /**
     * Horizontal gap to define grid cell size.
     */
    hgap: number;
    /**
     * Vertical gap to define grid cell size.
     */
    vgap: number;
    /**
     * Column width (i.e. `d + hgap`)
     */
    colWidth: number;
    /**
     * Normalized slant direction vector.
     */
    dir: Vec;
    /**
     * Computed grid cell offsets (single column)
     */
    grid: Vec[];
    /**
     * Computed dot offsets (single column)
     */
    dotGrid: Vec[];
    /**
     * Min Y coord (aka descender)
     */
    minY: number;
    /**
     * Max Y coord (aka ascender)
     */
    maxY: number;
}

export interface RawFontConfig {
    /**
     * Dot radius, the fundamental param on which everything else is
     * based on.
     */
    r: number;
    /**
     * Horizontal and vertical gaps to define grid cell size.
     */
    gap: number[];
    /**
     * Descender/ascender limits in number of rows.
     */
    extent: number[];
    /**
     * Slant direction as [columns, rows]
     */
    slant: number[];
}

export interface RawFontStyleSpec {
    font: {
        styleName: string;
        designer: string;
        designerURL: string;
    };
    config: RawFontConfig;
    glyphs: GlyphSpec[];
}

export const DEFAULT_CONFIG: RawFontConfig = {
    r: 50,
    gap: [30, 15],
    extent: [-4, 11],
    slant: [1, 7],
};

export const LOGGER = new ConsoleLogger("main", LogLevel.INFO);
