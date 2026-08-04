# Milk Dairy Management System

A full-stack Milk Dairy Management System built with React, Tailwind CSS, Express, MongoDB, JWT, Chart.js, and Day.js.

## Features

- Admin-only JWT authentication
- Dashboard with summary cards and analytics charts
- Milk entry management
- Curd entry management
- Monthly report generation
- Monthly rate management
- Calendar and details view
- PDF, Excel, and print export
- Responsive glassmorphism UI

## Project Structure

- `frontend/` — React + Tailwind frontend
- `backend/` — Express + Mongoose API

## Backend Setup

1. Go to `backend/`
2. Copy `.env.example` to `.env`
3. Update MongoDB and JWT values
4. Run:

```bash
npm install
npm run dev
```

## Frontend Setup

1. Go to `frontend/`
2. Run:

```bash
npm install
npm run dev
```

## Default Admin

- Username: `admin`
- Password: `admin123`

## Environment Variables

See `backend/.env.example`.

## Production Notes

- Update `VITE_API_BASE_URL` if needed for production deployment.
- Use secure JWT and MongoDB credentials in production.
