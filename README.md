# @thi.ng/font

Generated, modular font based on thi.ng wordmark. Currently only
includes lowercase ASCII characters (also mapped to uppercase) and some
punctuation, but will be extended...

Big shouts to the [opentype.js team](https://opentype.js.org/) for
simplifying OTF file generation!

![screenshot](https://raw.githubusercontent.com/thi-ng/font/master/assets/0.0.4.png)

## Status

WIP / Alpha

## Download

[Download font as OTF](./font/thing-regular-0.0.4.otf) (v0.0.4)

## Building

```bash
git clone https://github.com/thi-ng/font.git
cd font
yarn install
yarn build
```

(Font will be written to `/build`...)

## Glyph definition / configuration

All glyphs are defined via a grid of N columns x 15 rows, a set of
global parametric relationships defining dot radius, slant angle and
grid cell sizes, plus custom grammar strings for each individual glyph.

The overall character aspect ratio, spacing and line width are
adjustable via these global params:

- `R` - dot radius
- `HGAP` - horizontal gap between lines
- `VGAP` - vertical gap between dots
- `X_HEIGHT` - by default set to `6 * R + 5 + VGAP`

The slant angle is defined by the direction vector `[2 * R + HGAP,
X_HEIGHT]` (~19 deg in the default config). This ensures that in the
sequence `i.`, the two dots are horizontally aligned (as in the `thi.ng`
wordmark).

There're 3 basic shape types:

- vertical lines
- horizontal lines
- dots

Key Y (row) coordinates:

- 0x0 = max descender
- 0x4 = baseline
- 0xa = x-height
- 0xe = max ascender

Grammar string parsing rules:

(All coords as 4-bit hex nibbles)

- `0e` => vertical line from row 0x00 -> row 0x0e
- `hb3` => h bridge @ row 0x0b width = 3 (aka multiple of global `R`
  param)
- `Hb3` => same as `h`, but shifted right by `R`
- `.7` => dot @ row 0x07
- `>` => advance X (next column)

For example, the lowercase `a` glyph is encoded by this string:
`58h44h94>59` and translates to:

- vertical line from row 5 -> 8
- horizontal bridge in row 4, w=4
- horizontal bridge in row 9, w=4
- advance to next column
- vertical line from 5 -> 9

## Licenses

- Source: Apache Software License 2.0
- Font: SIL Open Font License 1.1

&copy; 2020 Karsten Schmidt
