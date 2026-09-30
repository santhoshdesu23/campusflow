import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { ENV } from '../config/env.js';
import { db } from '../models/db.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function login(req, res) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password format',
        errors: parsed.error.errors
      });
    }

    const { email, password } = parsed.data;
    const user = await db.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account not found with this email address'
      });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password entered'
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, studentId: user.studentId },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    let studentProfile = null;
    if (user.role === 'student' && user.studentId) {
      studentProfile = await db.findStudentById(user.studentId);
    }

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department
      },
      student: studentProfile
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during login' });
  }
}

export async function getMe(req, res) {
  let studentProfile = null;
  if (req.user.role === 'student' && req.user.studentId) {
    studentProfile = await db.findStudentById(req.user.studentId);
  }

  return res.json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      studentId: req.user.studentId,
      department: req.user.department
    },
    student: studentProfile
  });
}

export function getDemoAccounts(req, res) {
  const accounts = [
    {
      role: 'student',
      name: 'Aarav Sharma',
      email: 'NIAT2026AI001@gmail.com',
      password: 'Campus@123',
      studentId: 'NIAT2026AI001',
      program: 'B.Tech AI & Data Science (Yr 3)',
      tag: 'Auto-Approve Demo',
      scenario: 'Clean record (Fees: ₹0, Attendance: 88%) -> Immediate Auto Approval'
    },
    {
      role: 'student',
      name: 'Tanmay Trivedi',
      email: 'NIAT2026AI031@gmail.com',
      password: 'Campus@123',
      studentId: 'NIAT2026AI031',
      program: 'B.Tech AI & Data Science (Yr 2)',
      tag: 'Fee Exception Demo',
      scenario: 'Outstanding Dues (₹8,500) -> Review Required -> Route to Accounts'
    },
    {
      role: 'student',
      name: 'Vivaan Nanda',
      email: 'NIAT2026AI039@gmail.com',
      password: 'Campus@123',
      studentId: 'NIAT2026AI039',
      program: 'B.Tech Mechanical (Yr 4)',
      tag: 'Attendance Exception Demo',
      scenario: 'Low Attendance (68% < 75%) -> Review Required -> Route to Academic'
    },
    {
      role: 'student',
      name: 'Madhavan Natarajan',
      email: 'NIAT2026AI050@gmail.com',
      password: 'Campus@123',
      studentId: 'NIAT2026AI050',
      program: 'B.Tech CSE (Yr 1)',
      tag: 'Blocked Demo',
      scenario: 'Inactive Enrollment -> Blocked Request'
    },
    {
      role: 'admin',
      name: 'CampusFlow Administrator',
      email: 'admin@campusflow.com',
      password: 'Admin@123',
      tag: 'Admin Operations',
      scenario: 'Triage Queue, Review Explanations, Approve Exceptions & Audit Logs'
    }
  ];

  return res.json({ success: true, accounts });
}
