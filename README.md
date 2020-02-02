# @thi.ng/font

Generated, modular font based on thi.ng wordmark. Currently only
includes lowercase ASCII characters, but will be extended...

Big shouts to the [opentype.js team](https://opentype.js.org/) for
simplifying OTF file generation!

![screenshot](https://raw.githubusercontent.com/thi-ng/font/master/assets/0.0.2.png)

## Status

WIP / Alpha

## Download

[Download font as OTF](./font/thing-regular-0.0.2.otf)

## Building

```bash
git clone https://github.com/thi-ng/font.git
cd font
yarn install
yarn build
```

(Font will be written to `/build`...)

## Glyph definition

All glyphs are defined via a grid of N columns x 15 rows, a set of
global parametric relationships defining dot radius, slant angle and
grid cell sizes, plus custom grammar strings for each individual glyph.

There're 3 basic shape types:

-   vertical lines
-   horizontal lines
-   dots

Key Y (row) coordinates:

-   0x0 = max descender
-   0x4 = baseline
-   0xa = x-height
-   0xe = max ascender

Grammar string parsing rules:

(All coords as 4-bit hex nibbles)

-   `0e` => vertical line from row 0x00 -> row 0x0e
-   `hb3` => h bridge @ row 0x0b width = 3
-   `.7` => dot @ row 0x07
-   `>` => advance X (next column)

For example, this string: `48h42h92>4a` compiles to:

-   vertical line from 4 -> 8
-   horizontal bridge in row 4, w=2
-   horizontal bridge in row 9, w=2
-   advance to next column
-   vertical line from 4 -> 10

## Licenses

Source: Apache Software License 2.0
Font: SIL Open Font License 1.1

&copy; 2020 Karsten Schmidt
