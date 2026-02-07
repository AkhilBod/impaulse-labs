import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Database connection pool - use POSTGRES_URL from Neon/Vercel
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
  ssl: process.env.DB_SSL === 'true' || process.env.POSTGRES_URL ? { rejectUnauthorized: false } : false,
});

// Middleware
app.use(cors());
app.use(express.json());

// ============ AUTH ROUTES ============

// Signup
app.post('/auth/signup', async (req, res) => {
  try {
    const { email, fullName, password } = req.body;

    if (!email || !fullName || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (email, full_name, password_hash) VALUES ($1, $2, $3) RETURNING id, email, full_name',
      [email, fullName, hashedPassword]
    );

    res.json({ user: result.rows[0], message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
      },
      message: 'Login successful',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ USER SETTINGS ROUTES ============

// Get user settings
app.get('/users/:id/settings', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM user_settings WHERE user_id = $1', [id]);
    res.json(result.rows[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user settings
app.post('/users/:id/settings', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      incomeMode,
      yearlySalary,
      hourlyRate,
      currency,
      savingsGoals,
      monthlyIncome,
      workHoursPerWeek,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO user_settings 
       (user_id, income_mode, yearly_salary, hourly_rate, currency, savings_goals, monthly_income, work_hours_per_week) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id) DO UPDATE SET
       income_mode = $2, yearly_salary = $3, hourly_rate = $4, currency = $5, savings_goals = $6, monthly_income = $7, work_hours_per_week = $8
       RETURNING *`,
      [id, incomeMode, yearlySalary, hourlyRate, currency, JSON.stringify(savingsGoals), monthlyIncome, workHoursPerWeek]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ SAVINGS ROUTES ============

// Add savings
app.post('/users/:id/savings', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, hours, minutes, investment, category, selectedGoals } = req.body;

    // Add main savings record
    const savingsResult = await pool.query(
      'INSERT INTO user_savings (user_id, amount, category) VALUES ($1, $2, $3) RETURNING *',
      [id, amount, category]
    );

    // Distribute savings to selected goals
    if (selectedGoals && Array.isArray(selectedGoals)) {
      const perGoalAmount = amount / selectedGoals.length;

      for (const goalName of selectedGoals) {
        await pool.query(
          `INSERT INTO goal_savings (user_id, goal_name, amount) VALUES ($1, $2, $3)
           ON CONFLICT (user_id, goal_name) DO UPDATE SET amount = amount + $3`,
          [id, goalName, perGoalAmount]
        );
      }
    }

    res.json(savingsResult.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user savings
app.get('/users/:id/savings', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM user_savings WHERE user_id = $1 ORDER BY created_at DESC', [id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get goal savings
app.get('/users/:id/goal-savings', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM goal_savings WHERE user_id = $1', [id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

export default app;
