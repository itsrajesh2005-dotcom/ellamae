# Ellamae

## Admin portal and PHP backend

A hidden admin route is now available at `/admin-portal-x9v7k2`.

The new PHP backend lives in the `backend` folder and exposes a lightweight REST API under `/backend/index.php`.

### Quick start

1. Create the database and table using the SQL in `backend/schema.sql`.
2. Point the admin UI at your PHP server by setting `NEXT_PUBLIC_ADMIN_API_BASE_URL`.
3. Serve the backend from the project root with a PHP-compatible server.

Example:

```bash
php -S 127.0.0.1:8000 -t backend
```

Then open the admin portal at `/admin-portal-x9v7k2`.

