import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const result = await pool.query('SELECT * FROM user_settings WHERE user_id = $1', [id]);
      return res.json(result.rows[0] || {});
    }

    if (req.method === 'POST' || req.method === 'PUT') {
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
         (user_id, income_mode, yearly_salary, hourly_rate, currency, monthly_income, work_hours_per_week) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (user_id) DO UPDATE SET
         income_mode = $2, yearly_salary = $3, hourly_rate = $4, currency = $5, monthly_income = $6, work_hours_per_week = $7
         RETURNING *`,
        [id, incomeMode, yearlySalary, hourlyRate, currency, monthlyIncome, workHoursPerWeek]
      );

      return res.json(result.rows[0]);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Settings error:', error);
    res.status(500).json({ error: error.message });
  }
}
