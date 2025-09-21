// server/src/auth/jwt.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

function verifyToken(token) {
  try {
    if (!token) return null;
    const payload = jwt.verify(token, JWT_SECRET);
    // return a minimal user object
    return { id: payload.sub, email: payload.email, roles: payload.roles || [] };
  } catch (e) {
    return null;
  }
}

module.exports = { verifyToken };
