# Manual User Subscription Guide

Since public signup is disabled, new users must be added manually to the database by an administrator.

## Database Table: `mppsc_users`

### Required Fields

- `id`: Generate a UUID (e.g., using an online generator or `uuid` command).
- `email`: User's email address.
- `password`: **IMPORTANT** - Store the **hashed** password, not plain text. Use a bcrypt generator.
- `name`: User's full name.
- `role`: Set to `'guest'` (default) or `'admin'`.
- `plan_tier`: Set to `'free'`, `'lite'`, or `'pro'`.
- `is_subscribed`: Set to `1` (true) for paid plans (Lite/Pro), `0` (false) for Free.

### SQL Command Example

```sql
INSERT INTO mppsc_users (id, email, password, name, role, plan_tier, is_subscribed, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000', -- UUID
  'newuser@example.com',
  '$2a$12$R9h/cIPz0gi.URNNXR...', -- Hashed Password
  'Rahul Sharma',
  'guest',
  'pro',
  1, -- true
  strftime('%s', 'now')
);
```

## Making a User an Admin

To grant admin access (enabled to see "Sign Up" button in mobile menu & access admin routes):

1. Find the user ID.
2. Update the role.

```sql
UPDATE mppsc_users SET role = 'admin' WHERE email = 'admin@example.com';
```

## Security Notes

- NEVER share the database credentials.
- Ensure `is_subscribed` matches the `plan_tier` (e.g., Pro/Lite = true).
