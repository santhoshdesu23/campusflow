import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import { seedDatabase } from './scripts/seed.js';

import authRoutes from './routes/authRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import studentRoutes from './routes/studentRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000'
];

const clientUrls = (process.env.CLIENT_URL || ENV.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

const allowedOrigins = new Set([...defaultAllowedOrigins, ...clientUrls]);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);

    const isExplicit = allowedOrigins.has(origin);
    const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    const isVercel = origin.endsWith('.vercel.app');

    if (isExplicit || isLocalhost || isVercel) {
      return callback(null, true);
    }

    // Default to reflect origin so credentials mode works reliably
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serverless DB connection middleware for Vercel
app.use(async (req, res, next) => {
  if (process.env.VERCEL) {
    try {
      await connectDB();
    } catch (e) {
      console.error('Vercel DB connection error:', e);
    }
  }
  next();
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CampusFlow AI Platform',
    timestamp: new Date().toISOString(),
    demoMode: ENV.DEMO_MODE,
    hasGeminiKey: Boolean(ENV.GEMINI_API_KEY),
    database: 'MongoDB Atlas (campusflow)'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/admin', adminRoutes);

// In production, serve client build if present
const clientBuildPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientBuildPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientBuildPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      if (req.path === '/') {
        return res.json({
          status: 'ok',
          service: 'CampusFlow AI Backend API',
          healthCheck: '/api/health',
          message: 'CampusFlow server is running.'
        });
      }
      res.status(404).send('CampusFlow Server is running. Client build not found. Run client in dev mode or execute `npm run build`.');
    }
  });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server after connecting to MongoDB
async function startServer() {
  const PORT = Number(process.env.PORT) || Number(ENV.PORT) || 5000;
  const HOST = '0.0.0.0';

  try {
    await connectDB();
    await seedDatabase(false);

    app.listen(PORT, HOST, () => {
      console.log(`=========================================`);
      console.log(`🚀 CampusFlow AI Server listening on port ${PORT} (${HOST})`);
      console.log(`📡 Mode: ${ENV.DEMO_MODE ? 'DEMO MODE (Bulletproof Local AI)' : 'LIVE GEMINI AI'}`);
      console.log(`🌐 Base URL: http://localhost:${PORT}`);
      console.log(`🍃 Connected to MongoDB Atlas (Database: campusflow)`);
      console.log(`=========================================`);
    });
  } catch (err) {
    console.error('❌ Failed to start CampusFlow server:', err);
    process.exit(1);
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
