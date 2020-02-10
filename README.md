# ![thi.ng/font](https://media.thi.ng/umbrella/banners/thing-font.svg?1581297779)

<!-- TOC depthFrom:2 -->

- [About](#about)
- [Status](#status)
- [Download](#download)
- [Contributing](#contributing)
- [Building](#building)
- [Glyph definition / configuration](#glyph-definition--configuration)
    - [Shape grammar](#shape-grammar)
    - [Glyph spec format](#glyph-spec-format)
- [FontForge post-processing](#fontforge-post-processing)
- [Licenses](#licenses)

<!-- /TOC -->

## About

Generated, modular font based on [thi.ng
wordmark](https://github.com/thi-ng/branding/). Currently only includes
lowercase ASCII characters (also mapped to uppercase), digits, some
punctuation, but will be extended further...

![screenshot](https://raw.githubusercontent.com/thi-ng/font/master/assets/0.0.7.png)

## Status

WIP / Alpha

See [project board](https://github.com/thi-ng/font/projects/1) for
future ideas.

## Download

[Download font as OTF](./font/thing-regular-0.0.7.otf) (v0.0.7)

Big shouts to the [opentype.js](https://opentype.js.org/) &
[FontForge](https://fontforge.org/) teams for simplifying OTF file
generation!

## Contributing

You're welcome to contribute customized and/or extended versions by
adding new font spec JSON files (see section below). These different
versions will be built and distributed as part of the same font family.
The shared use of the underlying (changeable) grid layout and shape
grammar would be the common lowest denominator of these variations.

## Building

```bash
git clone https://github.com/thi-ng/font.git
cd font
yarn install

# generate all font variations
yarn build:all

# generate specific font variation(s) (globs supported)
yarn build specs/*.json

# generate SVG banners
yarn build:banners

# generate debug grid
yarn debug
```

(All generated assets will be written to `/build`...)

## Glyph definition / configuration

![layout grid](https://raw.githubusercontent.com/thi-ng/font/master/assets/grid.png)

All glyphs are defined via a grid of N columns x M rows, a set of
global parametric relationships defining dot radius, slant angle and
grid cell sizes, plus custom grammar strings for each individual glyph.

All of these are defined in JSON files like this:
[base.json](https://github.com/thi-ng/font/blob/master/specs/base.json),
which can/should be used as template for defining new variations.

The overall character aspect ratio, spacing and line width are
adjustable via these global params (See
[api.ts](https://github.com/thi-ng/font/blob/master/src/api.ts) for
further details.):

- `r`: Dot radius, the fundamental param on which everything else is
  based on (`50`).
- `gap`: Horizontal and vertical gaps to define grid cell size (`[30,
  15]`).
- `extent`: Descender/ascender limits in number of rows (`[-4, 11]`)
- `slant`: Slant direction vector as columns & rows (`[1, 7]`)

The default slant angle (~16.5 deg) ensures that in the glyph sequence
`i.` the two dots are horizontally aligned (as in the `thi.ng` wordmark
and illustrated in the above diagram).

The default ascender/descender and grid configuration uses 15 rows with
these key row IDs:

- row 0 (0x00) = max descender
- row 4 (0x04) = baseline
- row 10 (0x0a) = x-height
- row 14 (0x0e) = max ascender

### Shape grammar

All glyphs are based on these 4 basic shape types:

- vertical lines
- horizontal lines
- diagonals
- dots

```text
DIGIT = '0'..'9' | 'a'..'e' # All coords are 4-bit hex nibbles
VLINE = DIGIT DIGIT
HLINE = 'h' DIGIT DIGIT
HLINE_SHIFT = 'H' DIGIT DIGIT
DIAG = '/' DIGIT DIGIT
DOT = '.' DIGIT
ADVANCE = '>'

SHAPE = (VLINE | HLINE | HLINE_SHIFT | DIAG | DOT | ADVANCE)*
```

Examples:

- `0e` => vertical line from row 0x00 -> row 0x0e
- `hb3` => h bridge @ row 0x0b width = 3 (aka multiple of global `R`
  param)
- `Hb3` => same as `h`, but shifted right by `R`
- `/4a` => diagonal from row 4 in curr column to row 0xa in next column
- `.7` => dot @ row 0x07
- `>` => advance X (next column)

For example, the lowercase `a` glyph is encoded by this string:
`58h44h94>59` and translates to:

- vertical line from row 5 -> 8
- horizontal bridge in row 4, w=4
- horizontal bridge in row 9, w=4
- advance to next column
- vertical line from 5 -> 9

Note: The sub-shapes should be arranged/split in such a way as to
avoid/minimize overdraws...

### Glyph spec format

The following snippet shows the spec for a single glyph (see
[base.json](https://github.com/thi-ng/font/blob/master/specs/base.json)):

```json
{
    "name": "a",
    "id": 97,
    "g": "58h44h94>59",
    "x": [0, 0],
    "width": [2, 0]
}
```

- Only the `name` **or** `id` attrib is required. The `id` field is only
  needed if `name` is missing or longer than a single char. Likewise, if
  `name` is missing, it will be derived from the given `id` (Unicode)
  value.
- The `x` offset is only needed if the glyph is not horizontally aligned
  to 0. It's a two element array of `[a, b]` and will be translated to:
  `a * columnWidth + b * r`.
- The `width` is only needed for manual overriding of the computed
  width. If given, the same logic as for `x` is used to compute the
  final value.

## FontForge post-processing

Since [opentype.js](https://opentype.js.org/) doesn't support the
creation of GPOS/kern tables, those hints will need to be added to the
generated font file(s) in a post-processing step, here using
[FontForge](https://fontforge.org/).

Furthermore, due to the modular design approach, most generated glyphs
will consist of multiple sub-paths, incl. possible overlaps. The
[postprocess.py](https://github.com/thi-ng/font/blob/master/src/postprocess.py)
script will take care of that too.

```bash
# install fontforge (if needed)
brew cask install fontforge

# build fonts for all available specs
yarn build:all

# pass a generated font and its JSON spec as input
yarn postprocess -i build/thing-regular-0.0.6-1581258015.otf -k specs/base.json
# processing font: build/thing-regular-0.0.6-1581258015.otf
# cleaning glyphs...
# add kern pair: ' t 80
# add kern pair: " t 80
# add kern pair: / t 80
# add kern pair: # t 80
# add kern pair: ] t 80
# add kern pair: d t 80
# add kern pair: f t 80
# add kern pair: l t 80
# add kern pair: g j 50
# add kern pair: j j 50
# add kern pair: q j 50
# add kern pair: y j 50
# writing build/thing-regular-0.0.6-1581258015-kerned.otf
```

Note: the `yarn postprocess` script currently assumes OSX and that
FontForge is installed in `/Applications/FontForge.app`. You might need
to edit `package.json` to adapt for other environments...

## Licenses

- Source: Apache Software License 2.0
- Font: SIL Open Font License 1.1

&copy; 2020 Karsten Schmidt
