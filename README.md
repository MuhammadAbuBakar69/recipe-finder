# Recipe Finder - React Vite Starter

A responsive recipe search application powered by [TheMealDB API](https://www.themealdb.com/api.php). Look up dishes by ingredients, explore cooking instructions, and save your favorite meals.

## Features

- **Ingredient Search**: Search recipes filtering by primary ingredient (e.g., chicken, salmon, pasta).
- **Quick Ingredient Chips**: Fast one-click queries for popular ingredients.
- **Detailed Modal View**: View complete ingredients lists with precise measurements, step-by-step instructions, cuisine tags, and video tutorial links.
- **Save Favorites**: Bookmark favorite recipes stored automatically in `localStorage`.
- **Responsive Grid**: Clean responsive grid layout optimized for mobile and desktop screens.

## API Endpoints Used

- Filter by ingredient: `https://www.themealdb.com/api/json/v1/1/filter.php?i={INGREDIENT}`
- Lookup details by ID: `https://www.themealdb.com/api/json/v1/1/lookup.php?i={MEAL_ID}`

## Quick Start (Vite)

1. Set up a Vite React project:
   ```bash
   npm create vite@latest recipe-finder -- --template react
   cd recipe-finder
   npm install
   ```

2. Replace `src/App.jsx` with `recipe-finder_App.jsx` and `src/App.css` with `recipe-finder_App.css`.

3. Ensure `import './App.css'` is present at top of `App.jsx`.

4. Start dev server:
   ```bash
   npm run dev
   ```
