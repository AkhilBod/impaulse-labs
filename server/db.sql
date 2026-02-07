-- Create tables for BuyBye app

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User settings table
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  currency VARCHAR(10) DEFAULT '$',
  hourly_rate DECIMAL(10, 2) DEFAULT 0,
  yearly_salary DECIMAL(12, 2) DEFAULT 0,
  investment_return_rate DECIMAL(5, 2) DEFAULT 10,
  retirement_age INT DEFAULT 65,
  birthday VARCHAR(10) DEFAULT '',
  income_mode VARCHAR(20) DEFAULT 'salary',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goals table
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  icon VARCHAR(10) NOT NULL,
  selected BOOLEAN DEFAULT true,
  target_amount DECIMAL(12, 2) DEFAULT 0,
  saved_amount DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_goals_user_id ON goals(user_id);
