# tjEnglishClub

Elementary English learning game built with TanStack Start and Vite.

## GitHub Pages

This repository deploys to GitHub Pages with `.github/workflows/deploy-pages.yml`.

The Pages workflow:

- installs dependencies
- runs `npm run build:pages`
- uploads `dist/client` as the Pages artifact
- deploys on every push to `main`

Expected Pages URL:

`https://leonlzd120000.github.io/tjEnglishClub/`

In GitHub, open `Settings` -> `Pages` and set `Source` to `GitHub Actions`.
