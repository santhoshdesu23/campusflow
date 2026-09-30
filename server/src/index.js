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
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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
  try {
    await connectDB();
    await seedDatabase(false);

    app.listen(ENV.PORT, () => {
      console.log(`=========================================`);
      console.log(`🚀 CampusFlow AI Server listening on port ${ENV.PORT}`);
      console.log(`📡 Mode: ${ENV.DEMO_MODE ? 'DEMO MODE (Bulletproof Local AI)' : 'LIVE GEMINI AI'}`);
      console.log(`🌐 Base URL: http://localhost:${ENV.PORT}`);
      console.log(`🍃 Connected to MongoDB Atlas (Database: campusflow)`);
      console.log(`=========================================`);
    });
  } catch (err) {
    console.error('❌ Failed to start CampusFlow server:', err);
    process.exit(1);
  }
}

// Serverless DB connection middleware
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

if (!process.env.VERCEL) {
  startServer();
}

export default app;
