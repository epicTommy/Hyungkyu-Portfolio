# Hyungkyu (Tom) Lee — Portfolio

Personal academic portfolio: https://epicTommy.github.io/Hyungkyu-Portfolio/

## Development

Requires Node.js 22 or newer; no dependency installation is needed.

```sh
npm run build
npm run check
npm run dev
```

Edit the Markdown files in `content/` to update project text. Layout and styling live in `scripts/build.mjs` and `src/styles.css`. Images and linked project documents are in `content/image/` and `content/documents/`.

Push to `main` to build, validate, and deploy through GitHub Actions. GitHub Pages uses the generated `dist/` folder.

The CV navigation link opens `content/documents/Hyungkyu_Lee_CV.pdf` in a new tab. Replace that file to publish an updated CV.
