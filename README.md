# to-do-app
A simple app for managing daily tasks, with the ability to add, edit, delete, and mark tasks

## Sign in and API tokens

Create an account at `/signup/`, then sign in with the account email and password
at `/login/`. The browser stores the JWT pair for the current tab, sends the
access token as a Bearer token for task requests, and refreshes it when needed.

Clients can also request a token pair directly:

```http
POST /todo/api/v1/token/
Content-Type: application/json

{"email": "you@example.com", "password": "your-password"}
```

Send `Authorization: Bearer <access-token>` with task API requests. Refresh an
expired access token with `POST /todo/api/v1/token/refresh/` and the `refresh`
token from the token pair.

Interactive API documentation is available at `/swagger/`; the OpenAPI schema
is served at `/api/schema/`.
