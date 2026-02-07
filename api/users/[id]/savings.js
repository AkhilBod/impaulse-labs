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
      const userSavingsResult = await pool.query(
        'SELECT * FROM user_savings WHERE user_id = $1',
        [id]
      );
      const goalSavingsResult = await pool.query(
        'SELECT * FROM goal_savings WHERE user_id = $1',
        [id]
      );

      return res.json({
        userSavings: userSavingsResult.rows[0] || { user_id: id, total_saved: 0 },
        goalSavings: goalSavingsResult.rows,
      });
    }

    if (req.method === 'POST') {
      const { amount, category } = req.body;

      // Update user total savings
      await pool.query(
        `INSERT INTO user_savings (user_id, total_saved)
         VALUES ($1, $2)
         ON CONFLICT (user_id) DO UPDATE SET total_saved = total_saved + $2`,
        [id, amount]
      );

      // Update goal-specific savings
      if (category) {
        await pool.query(
          `INSERT INTO goal_savings (user_id, category, amount_saved)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, category) DO UPDATE SET amount_saved = amount_saved + $3`,
          [id, category, amount]
        );
      }

      return res.json({ success: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Savings error:', error);
    res.status(500).json({ error: error.message });
  }
}
