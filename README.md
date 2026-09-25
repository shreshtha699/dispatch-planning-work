# Dispatch Planning Work Request

## PostgreSQL setup (local)

1. Create a PostgreSQL database named `dispatch_form` (or use another name and update `DATABASE_URL`).
2. Run `database.sql` against that database. With `psql`, for example:

   ```sh
   psql -U postgres -d dispatch_form -f database.sql
   ```

3. Copy `.env.example` to `.env` and set your PostgreSQL username, password, host, and database in `DATABASE_URL`.
4. Install dependencies and start the server:

   ```sh
   npm install
   npm start
   ```

The server listens on `http://localhost:3000`. Form rows are saved in `dispatch_requests`. Uploaded files are saved in `uploads/`; PostgreSQL stores their original and server-side filenames plus MIME type and size.

Never commit the real `.env` file. For hosted PostgreSQL, set `DATABASE_URL` and `DATABASE_SSL=true` in the host's environment settings.

GitHub Pages only hosts static HTML/CSS/JavaScript. It cannot run this Express server or connect directly to PostgreSQL. Host the Node server and PostgreSQL separately, then point the form at that backend before using the form as a live database-backed application.
