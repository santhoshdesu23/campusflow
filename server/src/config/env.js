import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load single .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  JWT_SECRET: process.env.JWT_SECRET || 'campusflow_jwt_secure_secret_key_2026',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  DEMO_MODE: process.env.DEMO_MODE === 'true' || !process.env.GEMINI_API_KEY,
  MONGODB_URI: process.env.MONGODB_URI || '',
};
