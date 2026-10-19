# webterm frontend

A web terminal UI built on [xterm.js](https://xtermjs.org/): themes, fonts,
inline images (Sixel, iTerm2 and the Kitty graphics protocol), smart copy/paste,
a radial quick-action menu and an on-screen keyboard. Plain static files - ES
modules with vendored dependencies, **no build step**.

It talks to any backend that speaks the [tiny WebSocket protocol](docs/protocol.md),
for example the [webterm Go backend](../backend), and it can run as a
[Wallpaper Engine](docs/wallpaper-engine.md) wallpaper: this repository's root is a
ready-to-open Wallpaper Engine project, giving you a live terminal on your desktop.

## Features

- xterm.js 6 with the fit, web-links, unicode11, search, clipboard, image and
  WebGL addons (all vendored in `vendor/`, no CDN requests)
- Five themes (Nebula, Nord, Dracula, Gruvbox, Catppuccin Mocha), six bundled
  monospace fonts, adjustable size, background opacity and cursor style
- Images: Sixel and iTerm2 via `@xterm/addon-image`, and the **Kitty graphics
  protocol** implemented in `kitty.js` (see below)
- Copy and paste modes, each one switchable: auto-copy on selection, `Ctrl+C`
  (copies if there is a selection, otherwise sends SIGINT), `Ctrl+V`,
  `Ctrl+Shift+C/V`, right click
- Terminal resize is propagated to the pty
- Mouse reporting works for full-screen apps (htop, vim, tmux, mc) through
  xterm.js's standard DECSET modes
- **Radial quick-action menu**: a round button over the terminal opens a ring of
  actions (copy, paste, clear, Ctrl+C, scrolling, font size, themes, ...). Made
  for setups where only the left mouse button is available
- **On-screen keyboard** (opened from the menu): overlay, draggable, sticky
  Shift/Ctrl/Alt, Caps, F-keys, arrows with auto-repeat, Copy/Paste; layouts:
  English, Russian, Ukrainian, German, French, Spanish, Italian, Turkish
- `startWebterm(overrides)` - a programmatic entry point for embedding

### Kitty graphics protocol

xterm.js 6.0.0 ignores APC sequences, so `kitty.js` strips them from the output
stream before it reaches the terminal and draws images as DOM overlays anchored
to buffer lines. Supported: transmit / transmit+display / put / delete / query
(`a=t,T,p,d,q`), PNG and raw RGB/RGBA (`f=100,24,32`), zlib (`o=z`), chunked
direct transfer (`m=1`), cropping, offsets, cell sizing, cursor movement,
status replies and the `q` quiet levels. Not supported: file / temp-file /
shared-memory transfer (the browser cannot read files on the backend machine, so
clients such as `kitten icat` fall back to streaming), animation, and Unicode
placeholders.

## Quick start

Serve this directory with any static file server and point it at a backend:

```sh
python -m http.server 8080        # or: npx serve -l 8080 .
# then open http://localhost:8080/?ws=ws://localhost:3000/pty  (adjust to your backend)
```

The simplest setup is the [Go backend](../backend), which embeds a copy of this
frontend: run the binary and open <http://localhost:3000>.

The page picks the WebSocket address from `?ws=`, falling back to `/pty` on the
current origin. An absolute `ws://` / `wss://` URL lets you host the frontend
separately from the backend.

## URL parameters

Configuration priority: programmatic overrides > URL parameters > settings saved
in `localStorage` > defaults.

| Parameter | Values | Default | Description |
|---|---|---|---|
| `ws` | URL or path | `/pty` | Backend WebSocket address |
| `token` | string | - | Sent as `?token=` to the backend |
| `theme` | `nebula`, `nord`, `dracula`, `gruvbox`, `catppuccin` | `nebula` | Color theme |
| `fontFamily` | `jetbrains`, `firacode`, `ibmplex`, `sourcecodepro`, `robotomono`, `spacemono`, `system` | `jetbrains` | Font |
| `fontSize` | 9-28 | `14` | Font size |
| `opacity` | 0-100 | `72` | Background opacity |
| `cursorStyle` | `bar`, `block`, `underline` | `bar` | Cursor |
| `readonly` | `1` | off | View-only: no input |
| `webgl` | `0` | on | Disable the WebGL renderer |
| `images` | `0` | on | Disable Sixel/iTerm2 images (WASM decoder) |
| `kitty` | `0` | on | Disable Kitty graphics |
| `ui` | `0` | on | Hide the slide-out settings drawer |
| `autohide` | `0` | on | Keep the drawer handle always visible |
| `kb` | `0` | on | Disable the on-screen keyboard |
| `kblayouts` | comma list of `en,ru,uk,de,fr,es,it,tr` | `en,ru` | Enabled keyboard layouts (order = order of the Lang key) |
| `menulang` | `en`, `ru` | `en` | Language of the radial menu (see `i18n.js` to add more) |
| `menupos` | `top-left`, `top`, `top-right`, `left`, `right`, `bottom-left`, `bottom`, `bottom-right`, `free` | `bottom-right` | Where the radial-menu button sits |
| `menusize` | px | `0` (auto) | Size of the radial-menu button (0 = scales with the screen width) |
| `menuopacity` | 10-100 | `78` | Opacity of the radial-menu button, percent |
| `menumove` | `1` | off | With `menupos=free`: drag the button (position is saved) |
| `autoCopy`, `copyCtrlC`, `pasteCtrlV`, `copyCtrlShiftC`, `pasteCtrlShiftV`, `rcCopy`, `rcPaste` | `0` | on | Switch individual copy/paste modes off |

Mouse-button bindings (for browsers, where all buttons exist) can be set with
`bind_middle`, `bind_right`, `bind_back`, `bind_forward` (and `..Mod` variants,
`bind_modButton`, `bind_wheelMod`) using the action ids from `actions.js`, for
example `?bind_middle=paste&bind_back=toggleKeyboard`.

## Embedding

```html
<script>window.__WE_MANAGED = true;</script>   <!-- stop main.js from auto-starting -->
<script type="module">
  import { startWebterm } from './main.js';
  const app = startWebterm({
    wsUrl: 'wss://example.com/pty',
    theme: 'nord',
    fontSize: 15,
    showUI: false,
  });
  // later: app.updateConfig({ theme: 'dracula', opacity: 90 });
  // app.term is the xterm.js Terminal, app.transport the active transport
</script>
```

Overrides use the same names as the table above in camelCase: `wsUrl`, `token`,
`theme`, `fontFamily`, `fontSize`, `opacity`, `cursorStyle`, `readonly`,
`enableWebgl`, `enableImages`, `enableKitty`, `keyboardEnabled`, `kbLayouts`,
`menuLang`, `menuPos`, `menuMove`, `menuSize`, `menuOpacity`, `showUI`, `handleAutoHide`, plus the copy/paste flags.

### Custom transports

The terminal never touches a socket directly. A transport is any object with:

```
connect(): void
send(data: string): void
resize(cols: number, rows: number): void
onData(cb: (chunk: string) => void): void
onStatus(cb: (state: 'connecting' | 'online' | 'offline') => void): void
```

`transport.js` contains the WebSocket implementation (`WsTransport`).

## Project layout

```
index.html, style.css   page shell
main.js                 entry point, config, wiring (startWebterm)
terminal.js             xterm.js + addons setup
transport.js            WebSocket transport (+ resize frame)
kitty.js                Kitty graphics protocol
actions.js, bindings.js built-in actions and mouse-button bindings
radial.js               radial quick-action menu
keyboard.js, kblayouts.js  on-screen keyboard and its layout tables
themes.js, fonts.js     themes and fonts
i18n.js                 radial-menu translations (English by default)
vendor/                 xterm.js, addons, fonts and their licenses
we-bridge.js            maps Wallpaper Engine properties to startWebterm(); in a plain browser the
                        same index.html starts from URL parameters
we-bridge.js            maps Wallpaper Engine properties to startWebterm()
project.json            Wallpaper Engine project definition and properties
preview.png             wallpaper preview
docs/                   protocol and Wallpaper Engine guide
```

## Development

There is nothing to build. Run the unit tests with Node 18+:

```sh
node kitty.test.mjs      # Kitty APC stream splitting
node layouts.test.mjs    # keyboard layout tables
node i18n.test.mjs       # translation tables
```

## License

See the `LICENSE` file. Third-party notices:
[THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).
