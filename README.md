# Aqua Farm App

Aqua Farm App is a small React + Vite web app for managing a home or small-scale fish farming setup.

The current build is tailored around Kerala-style aquaculture workflows and includes guidance for:

- GIFT Tilapia
- Karimeen (Pearl Spot)

## What the app does

- Setup flow for species, fish count, and starting fish size
- Daily and weekly farm task checklists
- Feed calculator based on average fish weight and stock count
- Feed purchase planner across growth stages
- Water quality logging
- Growth tracking by weight or length
- Basic disease reference and seasonal advice
- Local persistence in the browser using `localStorage`

## Tech stack

- React
- Vite
- Plain CSS

## Project structure

```text
src/
  components/    UI screens and reusable app sections
  App.jsx        Main app shell
  AppContext.jsx State, reducer, persistence, calculations
  data.js        Species data, feed stages, disease and advisory content
public/
  _redirects     Static hosting redirect config
deploy.sh        Simple build + rsync deployment script
nginx.conf       Example nginx config
```

## Local development

Requirements:

- Node.js 18+ recommended
- npm

Run locally:

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Deployment

This repo includes a simple deployment script:

```bash
./deploy.sh user@server-ip
```

The script:

- builds the Vite app
- creates `/var/www/aquafarm` on the remote server
- syncs `dist/` with `rsync`

`nginx.conf` is included as a starting point for server setup.

## Notes before pushing to GitHub

- `node_modules/`, `dist/`, logs, editor folders, and ZIP artifacts are ignored
- app data is stored in the browser, not in a backend
- this repo currently has no Git history yet, so it can be initialized cleanly
