const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'b3f59c77c06c2d4b6c0d81514f4e4fd7dc17d0f143e8f0bddc4f9306edb969e6';

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Токен не предоставлен' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Недействительный токен' });
    req.user = user;
    next();
  });
}

module.exports = { authMiddleware };
