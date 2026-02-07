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
      const result = await pool.query('SELECT * FROM goals WHERE user_id = $1', [id]);
      return res.json(result.rows);
    }

    if (req.method === 'POST') {
      const { goals } = req.body;
      
      // Delete existing goals for this user
      await pool.query('DELETE FROM goals WHERE user_id = $1', [id]);
      
      // Insert new goals
      for (const goal of goals) {
        await pool.query(
          'INSERT INTO goals (user_id, category, savings_goal) VALUES ($1, $2, $3)',
          [id, goal.category, goal.savingsGoal]
        );
      }

      return res.json({ success: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Goals error:', error);
    res.status(500).json({ error: error.message });
  }
}
