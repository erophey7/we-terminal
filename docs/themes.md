# Themes

webterm ships a few palettes (Nebula, Nord, Dracula, Gruvbox, Catppuccin Mocha and *Campbell*, the Windows Terminal
default). A theme replaces the 16 ANSI colors, so full-screen programs (btop, mc, debconf dialogs) are drawn with the
theme's colors rather than with the palette their author tested. If you want a program to look exactly as it does in
your usual terminal, import that terminal's palette as a custom theme (below) or pick *Campbell*.

**Clear (original colors)** is the theme that changes nothing: the standard xterm 16-color palette on black, which is what
shells and their prompt themes (zsh, powerlevel10k, starship), vim and btop are usually written for. It also switches the
"text contrast" adjustment off while it is selected (the setting stays as you left it and applies again with any other
theme), because that adjustment lightens or darkens colors a program chose on purpose.

You can add, share and download your own themes from the settings drawer (the handle at the top right):
**Import**, **Export** and **Delete** under the theme selector. Custom themes live only in your browser's
`localStorage` (key `webterm:themes`); nothing is sent to a server.

## File format

A theme is a JSON file. Every field except the colors you want to change is optional: missing colors are taken
from Nebula.

```json
{
  "name": "Solarized Dark",
  "colors": {
    "background": "#002b36",
    "foreground": "#93a1a1",
    "cursor": "#93a1a1",
    "cursorAccent": "#002b36",
    "selectionBackground": "rgba(147, 161, 161, 0.3)",
    "black": "#073642",  "red": "#dc322f",  "green": "#859900", "yellow": "#b58900",
    "blue": "#268bd2",   "magenta": "#d33682", "cyan": "#2aa198", "white": "#eee8d5",
    "brightBlack": "#002b36", "brightRed": "#cb4b16", "brightGreen": "#586e75", "brightYellow": "#657b83",
    "brightBlue": "#839496",  "brightMagenta": "#6c71c4", "brightCyan": "#93a1a1", "brightWhite": "#fdf6e3"
  },
  "accent": "#268bd2",
  "accent2": "#2aa198",
  "bgGrad1": "#002b36",
  "bgGrad2": "#002b36"
}
```

| Field | Meaning | Default |
|---|---|---|
| `name` | Label in the theme list (also the key: importing the same name again replaces the theme) | `Custom theme` |
| `colors.*` | Terminal colors: `background`, `foreground`, `cursor`, `cursorAccent`, `selectionBackground`, the 8 ANSI colors and their `bright*` variants | Nebula |
| `accent`, `accent2` | Highlight colors of the settings drawer and overlays | `cursor`, `green` |
| `bgGrad1`, `bgGrad2` | Page background around the terminal | `background` |

Colors are CSS colors in one of these forms: `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `rgb(r, g, b)` or
`rgba(r, g, b, a)`. Anything else (names, `url(...)`, extra keys under `colors`) is rejected with a message.

**Keep `background` opaque.** Reverse-video text (selections in TUIs, bash highlighting a pasted line) is drawn
with the background color as the text color, so a transparent background makes it invisible.

## Sharing

- **Export** downloads the selected theme (built-in or custom) as `<key>.json`; the file imports as is.
- To reuse a palette from another terminal, copy its 16 colors into `colors` (Windows Terminal's `schemes` entries
  use the same names, with `purple` instead of `magenta` and `brightPurple` instead of `brightMagenta`).

## Text contrast

Some palettes put a light "blue" or "white" on a light background, which makes classic dialogs unreadable.
The **Text contrast** setting lets xterm.js nudge such colors until the text reaches a minimum contrast:
*Off* shows the exact colors the program asked for, *Normal (4.5:1)* is the default. URL parameter: `?contrast=1`
(off), `3`, `4.5` or `7`. The choice is remembered.

## URL

`?theme=<key>` selects a theme; custom themes have the key `user-<slug>` (for example `user-solarized-dark`).
