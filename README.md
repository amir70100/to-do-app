# to-do-app
A simple app for managing daily tasks, with the ability to add, edit, delete, and mark tasks

## API authentication

The versioned API uses JWT bearer tokens. Request a token pair with the account's
email address and password:

```http
POST /todo/api/v1/token/
Content-Type: application/json

{"email": "you@example.com", "password": "your-password"}
```

Use the returned `access` token on API requests:

```http
Authorization: Bearer <access-token>
```

When the access token expires, send the returned `refresh` token to
`POST /todo/api/v1/token/refresh/` to receive a new access token. The tasks API
continues to scope records to the authenticated user.
