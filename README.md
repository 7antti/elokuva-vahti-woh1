# Elokuva Vahti (Web Programming 1 Final Project)

React app for tracking upcoming movie releases with TMDB data.

## Features

- **Upcoming page**: infinite scrolling grid of upcoming movies
- **Filters page**: filter upcoming movies by title and genre (results are shown only after applying filters)
- **Favorites page**: saved upcoming favorites
- Movie poster support with fallback placeholder
- Favorite status icon on movie cards
- Configurable toast reminders (React Hot Toast) for favorite movie release windows
- Light/dark theme toggle

## Tech stack

- React + Vite
- React Router
- Tailwind CSS + Lucide React
- React Hot Toast + React Intersection Observer
- TMDB API (`themoviedb.org`)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the repository root:

   ```bash
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   ```

3. Start development server:

   ```bash
   npm run dev
   ```

4. Open the app (default):

   ```
   http://localhost:5173/elokuva-vahti-woh1/
   ```

## Build

```bash
npm run build
```

## Deploy to GitHub Pages

This project is configured for GitHub Pages with base path `/elokuva-vahti-woh1/`.

```bash
npm run deploy
```

The deploy script publishes `dist/` to the `gh-pages` branch.
