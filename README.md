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
- Data is stored in a Cloudflare D1 database via the Worker.
- Each movie is stored as an object with a unique `id` and `title`.

## Managing Titles

Each title has a **Move** button (➡️) and a **Delete** button (🗑️).

- **Move** transfers the title to the other list (owned ↔ wishlist).
- **Delete** permanently removes the title.

Both actions show a confirmation dialog before the change is applied. Use the
**+** button in the header to open a dialog for adding a new title to either
list.

## Project Structure

- `src/` – React source files
- `index.html` – entry point served by Vite


## Deployment

1. Create the D1 database (only once):

   ```bash
   wrangler d1 create dvd-db
   ```

   Copy the returned database ID into `wrangler.jsonc` under the `d1_databases` section.

2. Create the `items` table in the database:

   ```bash
   wrangler d1 execute dvd-db --command "CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  owned INTEGER NOT NULL,
  user TEXT NOT NULL
);"
   ```

   You can alternatively open the SQL shell with `wrangler d1 shell dvd-db` and run the same SQL.

3. Publish the worker and site:

   ```bash
   wrangler publish
   ```
