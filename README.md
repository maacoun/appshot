# 📱 AppShot — App Store Screenshot Generator

Free, open-source browser tool to generate App Store & Google Play screenshots in seconds.
No server, no upload, no account — everything runs locally in your browser.

**[→ Open AppShot](https://maacoun.github.io/appshot)**

---

## Features

- **App Store & Google Play sizes** — iPhone 6.7", 6.5", iPad 12.9", 11", Android phone & tablet
- **Custom size** — enter any width × height
- **5 layout modes** — Pad (letterbox), Phone on Background, **Device Frame**, Stretch, Crop
- **Realistic device frames** — iPhone 13 (5 colors) and iPad (3 colors)
- **Rich backgrounds** — solid colors, 5 gradient presets, custom color picker, custom image
- **Text overlay editor** — multiple text layers with:
  - Font family, size, color
  - Bold, italic, text shadow, stroke
  - Alignment (left / center / right)
  - Drag to reposition on canvas
  - 9-point position grid
  - Per-layer opacity
- **Save / load project** — export and re-import your work as JSON
- **Batch export** — drop multiple screenshots, download all in one click
- **PNG output** — full resolution, ready for store submission

## Usage

1. Open [appshot](https://maacoun.github.io/appshot) in any modern browser
2. Drop your screenshot(s) into the drop zone
3. Pick target device, layout mode and background
4. Optionally add text overlays and drag them into position
5. Click **Stáhnout PNG**

## Deploy to GitHub Pages

1. Fork this repo
2. Go to **Settings → Pages → Source → Deploy from branch → `main` / `root`**
3. Update the GitHub link in `index.html` (search for `maacoun`)
4. Your tool is live at `https://maacoun.github.io/appshot`

## Contributing

PRs welcome. The entire app is a single `index.html` file — no build step, no dependencies.

## Credits

- Device frame images by [Facebook Design](https://design.facebook.com/toolsandresources/devices/) — licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- Flag images by [flagcdn.com](https://flagcdn.com)

## License

MIT
