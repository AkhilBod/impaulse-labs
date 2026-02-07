# PostgreSQL Database Setup for BuyBye

I've created a complete PostgreSQL backend for your BuyBye application. Here's what was set up:

## 📁 Files Created

### Backend Server
- **`server/index.ts`** - Express.js API server with all endpoints
- **`server/db.sql`** - PostgreSQL database schema and tables
- **`server/package.json`** - Backend dependencies (express, pg, bcrypt, etc.)
- **`server/tsconfig.json`** - TypeScript configuration for server
- **`server/.env.example`** - Environment variables template

### Frontend Service
- **`services/dbService.ts`** - API client to communicate with backend

### Documentation
- **`DATABASE_SETUP.md`** - Complete setup and troubleshooting guide

## 🗄️ Database Schema

### Three Main Tables:

1. **users** - Stores user accounts
   - id, email, full_name, password_hash
   - Timestamps for created_at, updated_at

2. **user_settings** - Stores user preferences
   - Currency selection ($, £, €, CHF)
   - Income data (hourly_rate, yearly_salary)
   - Investment settings (return rate, retirement age)
   - Birthday and income mode

3. **goals** - Stores savings goals
   - Goal title, icon (emoji)
   - Target amount and saved amount
   - Linked to user via foreign key

## 🔌 API Endpoints

### Auth
```
POST /api/auth/signup
POST /api/auth/login
```

### Settings
```
GET /api/users/:userId/settings
PUT /api/users/:userId/settings
```

### Goals
```
GET /api/users/:userId/goals
POST /api/users/:userId/goals
```

### User
```
DELETE /api/users/:userId
```

## 🚀 Quick Start

1. **Install PostgreSQL** (see DATABASE_SETUP.md for OS-specific instructions)

2. **Create database:**
   ```bash
   psql < server/db.sql
   ```

3. **Setup backend:**
   ```bash
   cd server
   npm install
   cp .env.example .env
   npm run dev
   ```

4. **Update frontend** to use the new API instead of localStorage

5. **Start both:**
   - Frontend: `npm run dev` (port 5173)
   - Backend: `cd server && npm run dev` (port 5000)

## 🔐 Security Features

- ✅ Passwords hashed with bcrypt
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS enabled
- ✅ Environment variables for sensitive data
- ✅ Cascading deletes for data integrity

## 📝 Next Steps

1. Install PostgreSQL and create the database
2. Update your Login, Signup, and Settings components to use `dbService` instead of the `db` localStorage service
3. Start the backend server on port 5000
4. Test the complete flow with the new database

Would you like me to update the frontend components to use the PostgreSQL backend instead of localStorage?
