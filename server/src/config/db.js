import mongoose from 'mongoose';
import { ENV } from './env.js';

export async function connectDB() {
  const uri = ENV.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'campusflow',
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`=========================================`);
    console.log(`🍃 Connected to MongoDB Atlas!`);
    console.log(`📦 Database: ${conn.connection.name}`);
    console.log(`🌐 Host: ${conn.connection.host}`);
    console.log(`=========================================`);
    return conn;
  } catch (err) {
    console.error(`❌ MongoDB Connection Error: ${err.message}`);
    throw err;
  }
}
