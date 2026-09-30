import pool from '../configs/dbConfig.js';
import crypto from 'crypto';

const signUp = async (req, res) => {
    const { username, password } = req.body;
    try {
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
        const result = await pool.query(`
          INSERT INTO moderators (username, password_hash) VALUES ($1, $2)
          `, [username, passwordHash]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const signIn = async (req, res) => {
    const { username, password } = req.body;
    try {
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
        const result = await pool.query(`
          SELECT * FROM moderators WHERE username = $1 AND password_hash = $2
          `, [username, passwordHash]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export { signUp, signIn };
