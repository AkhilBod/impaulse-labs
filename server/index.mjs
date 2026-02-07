import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Database connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'impaulse',
  password: process.env.DB_PASSWORD || 'impaulse_password',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'impaulse_db',
});

// Middleware
app.use(cors());
app.use(express.json());

// Auth Routes

// Signup
app.post('/api/auth/signup', async (req, res) => {
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
app.post('/api/auth/login', async (req, res) => {
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
app.get('/api/users/:userId/settings', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query('SELECT * FROM user_settings WHERE user_id = $1', [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    const settings = result.rows[0];
    res.json({
      currency: settings.currency,
      hourlyMode: false,
      hourlyRate: parseFloat(settings.hourly_rate || 0),
      yearlySalary: parseFloat(settings.yearly_salary || 0),
      investmentReturnRate: parseFloat(settings.investment_return_rate || 10),
      retirementAge: settings.retirement_age || 65,
      birthday: settings.birthday || '',
      incomeMode: settings.income_mode || 'salary',
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

// Update user settings
app.put('/api/users/:userId/settings', async (req, res) => {
  try {
    const { userId } = req.params;
    // Handle both camelCase and snake_case
    const currency = req.body.currency;
    const hourlyRate = req.body.hourlyRate || req.body.hourly_rate;
    const yearlySalary = req.body.yearlySalary || req.body.yearly_salary;
    const investmentReturnRate = req.body.investmentReturnRate || req.body.investment_return_rate;
    const retirementAge = req.body.retirementAge || req.body.retirement_age;
    const birthday = req.body.birthday;
    const incomeMode = req.body.incomeMode || req.body.income_mode;

    const result = await pool.query(
      `UPDATE user_settings 
       SET currency = $1, hourly_rate = $2, yearly_salary = $3, 
           investment_return_rate = $4, retirement_age = $5, birthday = $6, income_mode = $7, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $8
       RETURNING *`,
      [currency, hourlyRate, yearlySalary, investmentReturnRate, retirementAge, birthday, incomeMode, userId]
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
app.get('/api/users/:userId/goals', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query('SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at', [userId]);

    const goals = result.rows.map(goal => ({
      id: goal.id,
      title: goal.title,
      icon: goal.icon,
      selected: goal.selected,
      targetAmount: parseFloat(goal.target_amount),
      savedAmount: parseFloat(goal.saved_amount),
    }));

    res.json(goals);
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ error: 'Failed to get goals' });
  }
});

// Add or update goals
app.post('/api/users/:userId/goals', async (req, res) => {
  try {
    const { userId } = req.params;
    const { goals } = req.body;

    // Delete existing goals for user
    await pool.query('DELETE FROM goals WHERE user_id = $1', [userId]);

    // Insert new goals
    for (const goal of goals) {
      await pool.query(
        `INSERT INTO goals (user_id, title, icon, selected, target_amount, saved_amount)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, goal.title, goal.icon, goal.selected || false, goal.targetAmount || 0, goal.savedAmount || 0]
      );
    }

    res.status(201).json({ message: 'Goals saved successfully' });
  } catch (error) {
    console.error('Save goals error:', error);
    res.status(500).json({ error: 'Failed to save goals' });
  }
});

// Delete user account
app.delete('/api/users/:userId', async (req, res) => {
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
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

export default app;
