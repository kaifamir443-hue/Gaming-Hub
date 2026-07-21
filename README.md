# Gaming Hub — Offline Website Project

A fully offline, folder-based build of the Gaming Hub catalogue site.
No CDN links, no external fonts/icons, no internet connection required.

## Folder structure

```
gaming-hub/
├── index.html            All page markup + inline SVG icon sprite
├── css/
│   └── styles.css        All styling (hand-written, no framework)
├── js/
│   └── script.js         All interactivity (auth demo, favorites, search, animations)
├── images/
│   ├── shadow-quest.jpg
│   ├── neon-velocity.jpg
│   ├── astral-odyssey.jpg
│   ├── urban-siege.jpg
│   ├── cyber-rage.jpg
│   ├── islands-of-wonder.jpg
│   ├── default-avatar.png
│   ├── favicon.png
│   └── apple-touch-icon.png
├── assets/
│   └── fonts/
│       ├── Poppins-Regular.ttf
│       ├── Poppins-Medium.ttf
│       └── Poppins-Bold.ttf
└── README.md
```

## How to run it

**Option 1 — just open it.** Double-click `index.html`. It opens in your
default browser and works immediately — no server, no build step, no
internet connection. Every file path in the project is relative, so the
whole `gaming-hub` folder can be zipped, emailed, put on a USB stick, or
opened from any device and it will still work exactly the same.

**Option 2 — local server (optional).** If you prefer serving it (some
people do this out of habit, it isn't required here):
```bash
cd gaming-hub
python3 -m http.server 8000
```
Then visit `http://localhost:8000`.

## What's inside, technically

- **No Tailwind CDN.** All utility/layout styling was hand-converted into
  plain CSS in `css/styles.css`, organized by component and using CSS
  custom properties (`:root` variables) for the color system, so the
  whole theme can be re-tuned from one place.
- **No Google Fonts / Material Symbols CDN.** Headings use Poppins,
  bundled locally in `assets/fonts` (SIL Open Font License — free to
  redistribute). Body text uses a native system-font stack. All icons
  (search, heart, bell, menu, etc.) are a hand-built inline SVG sprite
  at the top of `index.html` — zero icon-font dependency.
- **Local images.** The cover art in `images/` is generated locally
  (gradient art with each game's title) rather than hotlinked — this
  sandbox has no internet access to fetch the originally-hosted images,
  so these stand in as fully offline placeholders. Swap in your own
  `.jpg`/`.png` files with the same filenames to replace them; no code
  changes needed.
- **Data persistence.** "Login/Register" and "Favorites" are a demo
  auth system stored in the browser's `localStorage` — no backend.
  Opening `index.html` directly (`file://`) works fine for this since
  `localStorage` is per-origin/per-file in most browsers.

## Customizing

- **Colors:** edit the `:root` block at the top of `css/styles.css`.
- **Copy/text:** edit directly in `index.html`.
- **Game data:** each game card in `index.html` has `data-game-id`,
  `data-game-title`, `data-game-genre` attributes that the search/filter
  JS reads — keep those in sync if you add or rename games.
- **Icons:** add new icons by adding a `<symbol id="icon-name">` inside
  the sprite `<svg>` near the top of `index.html`, then reference it with
  `<svg class="icon"><use href="#icon-name"></use></svg>`.
