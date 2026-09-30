import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { db } from '../models/db.js';

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    const user = await db.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User session not found' });
    }

    req.user = user;
    if (user.role === 'student' && user.studentId) {
      req.student = await db.findStudentById(user.studentId);
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires ${role} privileges`
      });
    }
    next();
  };
}
