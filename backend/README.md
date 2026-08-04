# Milk Dairy Management System Backend

## Setup

1. Copy `.env.example` to `.env`.
2. Set your MongoDB URI and JWT secret.
3. Run:

```bash
npm install
npm run dev
```

## Default Admin

- Username: `admin`
- Password: `admin123`

## API

- `POST /api/login`
- `PUT /api/change-password`
- `POST /api/milk`
- `GET /api/milk`
- `PUT /api/milk/:id`
- `DELETE /api/milk/:id`
- `POST /api/monthly-rate`
- `GET /api/monthly-rate`
- `GET /api/dashboard`
- `GET /api/monthly-report`
