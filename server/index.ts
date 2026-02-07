import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Database connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'impaulse_db',
});

// Middleware
app.use(cors());
app.use(express.json());

// Types
interface User {
  id: string;
  email: string;
  full_name: string;
}

interface UserSettings {
  currency: string;
  hourly_rate: number;
  yearly_salary: number;
  investment_return_rate: number;
  retirement_age: number;
  birthday: string;
  income_mode: 'salary' | 'hourly';
}

interface Goal {
  id: string;
  title: string;
  icon: string;
  target_amount: number;
  saved_amount: number;
}

// Auth Routes

// Signup
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { email, fullName, password } = req.body;

    // Check if email exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, full_name, password_hash) VALUES ($1, $2, $3) RETURNING id, email, full_name',
      [email, fullName, hashedPassword]
    );

    const user = result.rows[0];

    // Create default user settings
    await pool.query(
      'INSERT INTO user_settings (user_id, currency, income_mode) VALUES ($1, $2, $3)',
      [user.id, '$', 'salary']
    );

    res.status(201).json({ user });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({ user: { id: user.id, email: user.email, full_name: user.full_name } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Settings Routes

// Get user settings
app.get('/api/users/:userId/settings', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await pool.query('SELECT * FROM user_settings WHERE user_id = $1', [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    const settings = result.rows[0];
    res.json({
      currency: settings.currency,
      hourly_rate: parseFloat(settings.hourly_rate),
      yearly_salary: parseFloat(settings.yearly_salary),
      investment_return_rate: parseFloat(settings.investment_return_rate),
      retirement_age: settings.retirement_age,
      birthday: settings.birthday,
      income_mode: settings.income_mode,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

// Update user settings
app.put('/api/users/:userId/settings', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { currency, hourly_rate, yearly_salary, investment_return_rate, retirement_age, birthday, income_mode } = req.body;

    const result = await pool.query(
      `UPDATE user_settings 
       SET currency = $1, hourly_rate = $2, yearly_salary = $3, 
           investment_return_rate = $4, retirement_age = $5, birthday = $6, income_mode = $7, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $8
       RETURNING *`,
      [currency, hourly_rate, yearly_salary, investment_return_rate, retirement_age, birthday, income_mode, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Goals Routes

// Get user goals
app.get('/api/users/:userId/goals', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await pool.query('SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at', [userId]);

    const goals = result.rows.map(goal => ({
      id: goal.id,
      title: goal.title,
      icon: goal.icon,
      target_amount: parseFloat(goal.target_amount),
      saved_amount: parseFloat(goal.saved_amount),
    }));

    res.json(goals);
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ error: 'Failed to get goals' });
  }
});

// Add or update goals
app.post('/api/users/:userId/goals', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { goals } = req.body;

    // Delete existing goals for user
    await pool.query('DELETE FROM goals WHERE user_id = $1', [userId]);

    // Insert new goals
    for (const goal of goals) {
      await pool.query(
        `INSERT INTO goals (user_id, title, icon, target_amount, saved_amount)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, goal.title, goal.icon, goal.target_amount || 0, goal.saved_amount || 0]
      );
    }

    res.status(201).json({ message: 'Goals saved successfully' });
  } catch (error) {
    console.error('Save goals error:', error);
    res.status(500).json({ error: 'Failed to save goals' });
  }
});

// Delete user account
app.delete('/api/users/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Delete user (cascades to settings and goals)
    const result = await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
