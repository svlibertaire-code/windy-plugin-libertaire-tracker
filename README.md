# Windy Plugin: Libertaire Tracker

A Windy.com plugin for importing and displaying GPX sailing tracks, built for the s/v Libertaire voyages.

## Features

- **GPX Import** — Drag & drop or click to import `.gpx` track files
- **Multiple Segments** — Each GPX track segment becomes an editable track
- **Customizable** — Edit track names and colors
- **Toggle Visibility** — Show/hide individual tracks
- **Fit to Bounds** — Zoom map to show all tracks
- **Start/End Markers** — Circle markers at track endpoints with popups

## Development

```bash
git clone https://github.com/svlibertaire-code/windy-plugin-libertaire-tracker.git
cd windy-plugin-libertaire-tracker
npm install
npm start
```

Then open [Windy Developer Mode](https://www.windy.com/developer-mode) and load:
```
https://localhost:9999/plugin.js
```

## Roadmap

- [x] GPX track import with editable names/colors
- [ ] Link blog posts to track points via dates
- [ ] Display Libertaire voyage segments from website

## License

MIT
