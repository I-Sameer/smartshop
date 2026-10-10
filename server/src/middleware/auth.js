import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { db } from '../config/db.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await db.findUserById(decoded.id);
    if (!user) {
      return res.status(403).json({ error: 'User session invalid or expired' });
    }
    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      membershipTier: user.membership_tier
    };
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      const user = await db.findUserById(decoded.id);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          membershipTier: user.membership_tier
        };
      }
    } catch (err) {
      // Ignored for optional auth
    }
  }
  next();
};

export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: `Forbidden: requires ${role} role privileges` });
    }
    next();
  };
};
