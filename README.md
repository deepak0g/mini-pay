# Payroo - Payroll Management System

A modern payroll management application built with React, Express, Prisma, and Bun.

## Features

- **Employees Management**: Add, edit, and manage employee information
- **Timesheets**: Create and manage weekly timesheets with time entries
- **Pay Run**: Calculate payroll for selected employees and date ranges
- **Pay Slips**: View detailed payslips with tax and superannuation calculations
- **Accessibility**: Full keyboard navigation, ARIA labels, and screen reader support

## Setup

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Setup database:**
   - Create a `.env` file with your database URL:
     ```
     DATABASE_URL="postgresql://user:password@localhost:5432/payroo"
     ```
   - Run Prisma migrations:
     ```bash
     bunx prisma migrate dev
     ```

3. **Seed initial data (optional):**
   ```bash
   bun run server/test/dump.ts
   ```

## Development

Run both the server and client in separate terminals:

**Terminal 1 - Backend Server:**
```bash
bun run dev:server
```

**Terminal 2 - Frontend Client:**
```bash
bun run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Project Structure

```
payroo/
├── client/          # React frontend
│   └── src/
│       ├── pages/   # Page components
│       ├── api/     # API client
│       └── types.ts # TypeScript types
├── server/          # Express backend
│   ├── routes/      # API routes
│   ├── business/    # Business logic
│   └── db.ts        # Prisma client
├── prisma/          # Database schema (moved to server/prisma)
└── package.json     # Single package.json for all dependencies
```

## Tech Stack

- **Frontend**: React 19, React Router, TanStack Query, Tailwind CSS, Lucide Icons
- **Backend**: Express, Prisma, PostgreSQL
- **Runtime**: Bun
- **Build Tool**: Vite
