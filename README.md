# Camel Collision Calculator v2.01

Waypoint Utility Web edition · **STATUS: STABLE**

A complete, responsive static site for GitHub Pages. No build step, API key, or external assets are required. Open `index.html` directly for local use; clipboard copying is most reliable on the published HTTPS site or a local web server.

## Files

- `index.html` — calculator controls, results, explanatory formulas, sources, version, and status.
- `script.js` — the original calculator behavior, preserved without changes.
- `waypoint.css` — the shared Waypoint Utility Web theme.
- `styles.css` — this calculator's responsive layout.
- `camel.svg` — the local line-art collision diagram.
- `.nojekyll` — tells GitHub Pages to serve this static site directly.

## Upload to GitHub Pages

1. Extract the ZIP. In your `impact-force-calculator` repository, choose **Add file → Upload files**.
2. Upload the extracted files into the repository's top level, including `index.html`, both CSS files, `script.js`, and `camel.svg`. Upload the files themselves, not the ZIP or an enclosing folder. Commit the upload.
3. In **Settings → Pages**, choose **Deploy from a branch**, then `main` and **/ (root)**. Save and use the **Visit site** link when publication finishes.
4. Future updates use the same filenames and location.

## Preserved behavior

The seven live inputs, numeric validation, reset, shareable summary and parameter links, force/energy/momentum outputs, Earth-weight benchmarks, and optional WebMCP `configure_collision` integration are retained. Defaults remain 450 kg at 5.8 km/h and 550 kg at 5.3 km/h, restitution 0.2, duration 0.15 s, and compression 0.4 m.

The model is an isolated, one-dimensional collision. Average contact force is impulse divided by contact time; the compression estimate is relative-motion energy divided by compression distance. Neither predicts peak force. The site retains the original educational-use explanation.

## Source and verification

Based on [Mac1584/impact-force-calculator](https://github.com/Mac1584/impact-force-calculator), branch `main`. This edition changes presentation and local diagram assets; `script.js` is byte-for-byte unchanged. Checked locally against the original for defaults, changed inputs, elastic and stationary scenarios, invalid-input handling, reset, query restoration, summary copying, keyboard access, and mobile layout.
