# Pat's Impact Force Calculator

A responsive, self-contained static website. Open `index.html` locally or upload all files in this folder to a static host. No build step or API key is required.

The page uses a stripped-down early-web style. The average-force result includes Earth-weight benchmarks for 1-, 5-, and 10-tonne loads. These compare force magnitudes only, not collision outcomes.

## Publish

### GitHub Pages

You can do this entirely in your browser; no Git software or terminal is needed.

1. Sign in to [GitHub](https://github.com). Click the **+** menu in the upper-right corner and choose **New repository**.
2. Set the repository name to `impact-force-calculator`. Select **Public** (required for GitHub Pages on a free personal account). Turn **Add a README file** on, then click **Create repository**.
3. On the repository's **Code** tab, click **Add file → Upload files**. Upload `index.html`, `styles.css`, and `script.js` from this folder. Upload the *files themselves*, not the ZIP archive or enclosing folder. They should appear beside GitHub's `README.md` at the top level.
4. Enter a message such as `Add impact force calculator` and click **Commit changes**. If GitHub offers a choice, choose to commit directly to `main`.
5. Open **Settings → Pages**. In **Build and deployment**, set **Source** to **Deploy from a branch**. Select `main` as the branch and `/ (root)` as the folder, then click **Save**.
6. Wait a few minutes, refresh **Settings → Pages**, and click **Visit site**. With your username, the expected address is `https://mac1584.github.io/impact-force-calculator/`.

If the site shows a 404 page, check that `index.html` is at the top level of the repository and that Pages is set to `main` and `/ (root)`. GitHub says publishing changes may take up to 10 minutes.

### Update an existing GitHub Pages site

In your `impact-force-calculator` repository, use **Add file → Upload files** to upload the updated `index.html`, `styles.css`, and `script.js` from this folder. Keep the filenames exactly the same and commit the change to `main`. GitHub Pages republishes automatically. If the upload page does not offer to replace an existing file, use the file's pencil-shaped **Edit** button on GitHub, paste in the updated contents, and commit each file.

### Netflify

Drag this folder onto [Netlify Drop](https://app.netlify.com/drop). Netlify will give you a public URL. You can also import the GitHub repository and set the publish directory to the repository root; no build command is needed.

### Vercel

Import the GitHub repository at [Vercel](https://vercel.com/new). Select **Other** as the framework preset if asked. Leave the build command blank and set the output directory to `.` (the repository root), then deploy.

## What the calculator assumes

The calculation models a one-dimensional, isolated, head-on collision. It uses conservation of momentum and a coefficient of restitution between 0 and 1. Speeds entered for both camels are toward each other; positive final velocity points from camel A toward camel B.

The full-contact average force is the impulse magnitude divided by impact duration. The deformation estimate is initial *relative-motion* kinetic energy divided by the combined compression distance, representing the average compression-phase force under a simplified work-energy model. Neither estimate predicts peak force. Real impacts require material behavior, geometry, a force-time profile, or measurement for a defensible peak-force or safety assessment.

Both camels start at 12.5 mph, as requested. This speed and the default masses, restitution, contact time, and compression distance are illustrative and editable; they are not universal camel measurements.

## Editing the calculator

- `index.html` contains the labels, explanatory text, and starting input values. To change a default, edit its input's `value` attribute. **Reset defaults** reads those same values.
- `script.js` contains validation, `calculate()` for the physics, `render()` for the visible results, and the shareable summary. Short comments explain the less obvious physics assumptions.
- `styles.css` controls the early-web appearance and mobile layout.

## References

- [OpenStax: Inelastic collisions in one dimension](https://openstax.org/books/college-physics-2e/pages/8-5-inelastic-collisions-in-one-dimension)
- [University of Illinois Mechanics Reference: Momentum, impulse, and collisions](https://mechref.engr.illinois.edu/dyn/rec.html)
- [NIST: standard gravity and force conversions](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8)
