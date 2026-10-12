import { validateSession } from '../services/authService.js'
import createHttpError from '../utils/httpError.js';

const authCheck = async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const session = await validateSession(token)
        if (!session || new Date(session.expires_at) <= new Date()) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }
        return next();
    } catch (error) {
        if (error.message === 'Invalid session') {
            return next(createHttpError(401, 'Invalid or expired session'));
        }
        return next(error);
    }
};

export default authCheck;
