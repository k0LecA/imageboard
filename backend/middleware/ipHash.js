import crypto from 'crypto';

const secret = process.env.HASH_SECRET;
if (!secret) {
  throw new Error('HASH_SECRET environment variable not set');
}
function hashIp(ip) {
  const hash = crypto.createHash('sha256');
  hash.update(ip);
  return hash.digest('hex');
}

function ipHashMiddleware(req, res, next) {
  const ip = req.ip;
  const hashedIp = hashIp(ip);
  req.hashedIp = hashedIp;
  next();
}

export default ipHashMiddleware;
