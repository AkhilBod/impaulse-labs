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

  if (!id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    if (req.method === 'GET') {
      const result = await pool.query('SELECT * FROM user_settings WHERE user_id = $1', [id]);
      const settings = result.rows[0];
      
      if (!settings) {
        // Return default settings if none exist
        return res.json({
          user_id: id,
          currency: '$',
          income_mode: 'salary',
          yearly_salary: 0,
          hourly_rate: 0,
          monthly_income: 0,
          work_hours_per_week: 0,
        });
      }
      
      return res.json(settings);
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      // Handle both camelCase and snake_case
      const {
        incomeMode,
        income_mode,
        yearlySalary,
        yearly_salary,
        hourlyRate,
        hourly_rate,
        currency,
        monthlyIncome,
        monthly_income,
        workHoursPerWeek,
        work_hours_per_week,
      } = req.body;

      const mode = incomeMode || income_mode;
      const salary = yearlySalary || yearly_salary;
      const rate = hourlyRate || hourly_rate;
      const mIncome = monthlyIncome || monthly_income;
      const hours = workHoursPerWeek || work_hours_per_week;

      console.log('Updating settings for user:', id, { mode, salary, rate, currency, mIncome, hours });

      const result = await pool.query(
        `INSERT INTO user_settings 
         (user_id, income_mode, yearly_salary, hourly_rate, currency, monthly_income, work_hours_per_week) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (user_id) DO UPDATE SET
         income_mode = COALESCE($2, income_mode), 
         yearly_salary = COALESCE($3, yearly_salary), 
         hourly_rate = COALESCE($4, hourly_rate), 
         currency = COALESCE($5, currency), 
         monthly_income = COALESCE($6, monthly_income), 
         work_hours_per_week = COALESCE($7, work_hours_per_week)
         RETURNING *`,
        [id, mode || null, salary || null, rate || null, currency || '$', mIncome || null, hours || null]
      );

      console.log('Settings updated:', result.rows[0]);
      return res.json(result.rows[0]);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Settings error:', error.message);
    res.status(500).json({ error: error.message, details: error.toString() });
  }
}
