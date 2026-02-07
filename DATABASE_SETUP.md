# BuyBye Database Setup Guide

This guide will help you set up the PostgreSQL database and backend server for the BuyBye application.

## Prerequisites

- PostgreSQL (v12 or later)
- Node.js (v16 or later)
- npm or yarn

## Step 1: Install PostgreSQL

### macOS (using Homebrew)
```bash
brew install postgresql
brew services start postgresql
```

### Windows
Download from: https://www.postgresql.org/download/windows/

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Step 2: Create Database and User

Open PostgreSQL terminal:
```bash
psql
```

Run these commands:
```sql
-- Create database
CREATE DATABASE impaulse_db;

-- Create user (if not exists)
CREATE USER impaulse WITH PASSWORD 'impaulse_password';

-- Grant privileges
ALTER ROLE impaulse SET client_encoding TO 'utf8';
ALTER ROLE impaulse SET default_transaction_isolation TO 'read committed';
ALTER ROLE impaulse SET default_transaction_deferrable TO on;
ALTER ROLE impaulse SET default_transaction_read_only TO off;
GRANT ALL PRIVILEGES ON DATABASE impaulse_db TO impaulse;

-- Connect to database
\c impaulse_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO impaulse;

-- Create tables (paste contents of db.sql here)
```

Or run the SQL file directly:
```bash
psql -U impaulse -d impaulse_db -f server/db.sql
```

## Step 3: Setup Backend Server

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:
```
DB_USER=impaulse
DB_PASSWORD=impaulse_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=impaulse_db
PORT=5000
```

5. Start the server:
```bash
npm run dev
```

The server should now be running at `http://localhost:5000`

## Step 4: Update Frontend Configuration

In your frontend `.env` (create one if it doesn't exist):
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Database Schema

### Users Table
- `id` (UUID) - Primary key
- `email` (VARCHAR) - Unique email
- `full_name` (VARCHAR) - User's full name
- `password_hash` (VARCHAR) - Bcrypt hashed password
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### User Settings Table
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `currency` (VARCHAR) - Selected currency ($, £, €, CHF)
- `hourly_rate` (DECIMAL) - Hourly rate
- `yearly_salary` (DECIMAL) - Yearly salary
- `investment_return_rate` (DECIMAL) - Investment return percentage
- `retirement_age` (INT) - Target retirement age
- `birthday` (VARCHAR) - User's birthday
- `income_mode` ('salary' | 'hourly') - Income calculation mode

### Goals Table
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `title` (VARCHAR) - Goal title
- `icon` (VARCHAR) - Emoji icon
- `target_amount` (DECIMAL) - Target amount to save
- `saved_amount` (DECIMAL) - Amount already saved

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Settings
- `GET /api/users/:userId/settings` - Get user settings
- `PUT /api/users/:userId/settings` - Update user settings

### Goals
- `GET /api/users/:userId/goals` - Get user goals
- `POST /api/users/:userId/goals` - Save/update goals

### User
- `DELETE /api/users/:userId` - Delete user account

## Troubleshooting

### Connection refused error
- Make sure PostgreSQL is running: `brew services list` (macOS)
- Check database credentials in `.env`

### Database doesn't exist
- Run the SQL setup commands again
- Ensure you're connected to the correct database

### Port already in use
- Change `PORT` in `.env` to an available port
- Or kill the process using port 5000

## Development

Start both frontend and backend:

Terminal 1 (Frontend):
```bash
npm run dev
```

Terminal 2 (Backend):
```bash
cd server && npm run dev
```

## Security Notes

- Change default passwords in production
- Use environment variables for all sensitive data
- Enable HTTPS in production
- Implement rate limiting
- Add proper input validation
- Use CSRF protection
- Keep dependencies updated
