import { validateSession } from '../services/authService.js'

const authCheck = async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const session = await validateSession(token)
        if (!session) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        next();
    } catch (error) {
        return res.status(500).json({ message: 'Failed to authenticate token' });
    }
};

export default authCheck;
