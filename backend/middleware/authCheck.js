import pool from '../configs/dbConfig.js';

const authCheck = async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const result = await pool.query(`
          SELECT * FROM sessions WHERE id = $1`, [token]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        next();
    } catch (error) {
        return res.status(500).json({ message: 'Failed to authenticate token' });
    }
};

export default authCheck;
