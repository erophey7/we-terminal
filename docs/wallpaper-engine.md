# Using webterm as a Wallpaper Engine wallpaper

**The root of this repository is a complete Wallpaper Engine web-wallpaper
project** ([Wallpaper Engine](https://www.wallpaperengine.io/)): `project.json`,
`index.html` (the entry point WE loads), `we-bridge.js` and `preview.png` sit next
to the shared modules and `vendor/`. You can open the folder directly in the Wallpaper
Engine editor or drop it into your projects directory: a live terminal on your desktop,
connected to a webterm backend.

## Install

1. Start a backend (for example the Go backend from `../backend`). For a local
   setup listen on `127.0.0.1` so nothing else can reach it:

   ```yaml
   # webterm.yml
   listen: { ip: 127.0.0.1, port: 3000 }
   auth: { enabled: true, token: "REPLACE-WITH-LONG-RANDOM-VALUE" }
   access:
     allowed_ips: ["127.0.0.1", "::1"]
     allowed_origins: ["file://"]     # the wallpaper page is loaded from a file
   ```

   The wallpaper page is loaded from a file, so the browser reports its origin as
   `null`; the backend rejects that unless you list `file://`. Because `null` is also the
   origin of sandboxed pages, **keep the token enabled** (see the backend's security guide).

2. Put this repository where Wallpaper Engine can see it - either clone/copy it to
   `<Wallpaper Engine>/projects/myprojects/webterm/`, or open `project.json` from
   wherever it is with the Wallpaper Engine editor (**Wallpaper Editor -> Open
   wallpaper from file**).
3. Refresh your wallpapers in Wallpaper Engine and apply the new one.
4. Open the wallpaper's properties and set **backend address** to your server,
   for example `ws://localhost:3000/pty` (the default). If the backend has a
   token configured, enter it too.

## Properties

Wallpaper Engine shows these in the wallpaper's settings panel (the keys below are
their internal names):

| Key | Type | Meaning |
|---|---|---|
| `wsurl` | text | Backend WebSocket address (`ws://` or `wss://`) |
| `token` | text | Token, if enabled on the backend |
| `advancedgraphics` | bool | Enable WebGL rendering and Sixel/iTerm2 images (off by default) |
| `theme` | choice | Color theme |
| `fontfamily` | choice | Font |
| `fontsize` | slider | Font size |
| `opacity` | slider | Background opacity |
| `cursorstyle` | choice | Cursor shape |
| `readonly` | bool | View-only mode (no input, no mouse) |
| `autocopyselection` | bool | Copy to the clipboard as soon as text is selected |
| `menulang` | choice | Language of the quick menu and on-screen messages (English by default, Russian available) |
| `menupos` | choice | Position of the quick-menu button (corners, sides, or "free") |
| `menusize` | slider | Size of the quick-menu button in px (0 = automatic, scales with the screen) |
| `menuopacity` | slider | Opacity of the quick-menu button in percent |
| `menumove` | bool | With "free": unlock the button so it can be dragged |
| `keyboard` | bool | Enable the on-screen keyboard |
| `kb_en`, `kb_ru`, `kb_uk`, `kb_de`, `kb_fr`, `kb_es`, `kb_it`, `kb_tr` | bool | Keyboard layouts to offer (the Lang key cycles through the enabled ones) |

Cosmetic properties (theme, font, size, opacity, cursor, menu position,
layouts) apply live. Changing the backend address, token, read-only mode,
advanced graphics or the keyboard switch reloads the page.

`advancedgraphics` is off by default because embedded Chromium builds differ in
WebGL and WebAssembly stability. The terminal works without it; Kitty
graphics (`kitty.js`) does not depend on WebGL or WASM and is always available.

## Input on the desktop

Wallpaper Engine forwards only **mouse movement and the left button** to a web
wallpaper that is on the desktop (and only while the pointer is over the bare
desktop, not over windows or icons). The mouse wheel, the other mouse buttons
and the keyboard never reach the page. Because of that, the wallpaper is
designed around left-click interaction:

- **Selection** works with the left button; enable `autocopyselection` to copy
  it automatically.
- **Quick menu**: a round button over the terminal opens a radial menu with
  Copy, Paste, Clear, Ctrl+C, page up/down, a View page (font size, theme,
  opacity, reconnect) and a Keys page (Esc, Tab, Enter, history, Ctrl+D). Place
  the button with `menupos`; with `free` plus `menumove` you can drag it
  anywhere, and it snaps to the screen edges as a half or quarter circle.
- **On-screen keyboard**: open it from the menu. It is an overlay on top of the
  terminal that you can drag by its frame. Shift/Ctrl/Alt are sticky - tap once
  for the next key, twice to lock. Hold a key (Backspace, arrows, Space) to
  repeat. Copy and Paste keys are included.

Mouse-button bindings and wheel actions exist in the frontend (`bindings.js`)
and work in a regular browser or a pop-out window, but not on the desktop
wallpaper itself.

## Troubleshooting

- **"No connection to the backend" card on the wallpaper:** it appears after about 3 seconds without a connection and lists the usual causes; it disappears by itself once connected.
- **Offline although the backend runs:** check the backend log. `rejected Origin "null"`
  means `allowed_origins` lacks `file://`; a failed handshake without that line usually means
  a missing or wrong token (HTTP 401).
- **Black screen / "offline" dot:** the backend is not reachable. Check that it
  is running and that `wsurl` matches. `localhost` may resolve to `::1` - include
  `"::1"` in `access.allowed_ips`, or use `127.0.0.1` in `wsurl`.
- **Nothing happens when clicking:** make sure you click the bare desktop; clicks over
  icons and windows are not forwarded to the wallpaper.
- **Garbled full-screen apps:** the backend must support the resize frame (see
  [protocol.md](protocol.md)); the webterm Go backend does.
- **Clipboard:** copy and paste use the clipboard API of the embedded Chromium,
  which may restrict reads/writes in some setups. If Paste does nothing, that is the
  likely cause.
