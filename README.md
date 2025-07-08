# DVD Collection Tracker

This project has been converted to use the React framework with Vite.

## Development

1. Install dependencies (requires Node.js):

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Build for production:

   ```bash
   npm run build
   ```

## Testing

Unit tests use Jest and React Testing Library.

Run the test suite with:

```bash
npm test
```

## Features

- Manage owned and wishlist DVD lists.
- Search, add, move and delete titles using the on-page controls.
- Import/export collection data as JSON.
- Data persists in `localStorage`.

## Managing Titles

Each title has a **Move** button (➡️) and a **Delete** button (🗑️).

- **Move** transfers the title to the other list (owned ↔ wishlist).
- **Delete** permanently removes the title.

Both actions show a confirmation dialog before the change is applied. Use the
**+** button in the header to open a dialog for adding a new title to either
list.

## Project Structure

- `src/` – React source files
- `dvd_data.json` – initial data
- `index.html` – entry point served by Vite

