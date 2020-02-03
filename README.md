# @thi.ng/font

Generated, modular font based on [thi.ng
wordmark](https://github.com/thi-ng/branding/). Currently only includes
lowercase ASCII characters (also mapped to uppercase), some punctuation
and some digits, but will be extended...

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

# generate font
yarn build

# generate debug grid
yarn debug
```

(Assets will be written to `/build`...)

## Glyph definition / configuration

![layout grid](https://raw.githubusercontent.com/thi-ng/font/master/assets/grid.png)

All glyphs are defined via a grid of N columns x 15 rows, a set of
global parametric relationships defining dot radius, slant angle and
grid cell sizes, plus custom grammar strings for each individual glyph.

The overall character aspect ratio, spacing and line width are
adjustable via these global params:

- `R` - dot radius
- `HGAP` - horizontal gap between lines
- `VGAP` - vertical gap between dots
- `I_HEIGHT` - by default set to `7 * R + 6 * VGAP` (pos of `i` dot)
- `X_HEIGHT` - by default set to `6 * R + 5 * VGAP`

The slant angle is implicitly defined by the direction vector `[2 * R +
HGAP, I_HEIGHT]` (~16.5 deg in the default config). This ensures that in the
sequence `i.` the two dots are horizontally aligned (as in the `thi.ng`
wordmark and illustrated in the above diagram).

There're 3 basic shape types:

- vertical lines
- horizontal lines
- dots

### Shape grammar

```text
DIGIT = '0'..'9' | 'a'..'e' # All coords are 4-bit hex nibbles
VLINE = DIGIT DIGIT
HLINE = 'h' DIGIT DIGIT
HLINE_SHIFT = 'H' DIGIT DIGIT
DOT = '.' DIGIT
ADVANCE = '>'

SHAPE = (VLINE | HLINE | HLINE_SHIFT | DOT | ADVANCE)+
```

Examples:

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

Note: The subshapes should be arranged in such a way as to
avoid/minimize overdraws...

## Licenses

- Source: Apache Software License 2.0
- Font: SIL Open Font License 1.1

&copy; 2020 Karsten Schmidt
