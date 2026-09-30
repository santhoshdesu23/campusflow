import mongoose from 'mongoose';
import { ENV } from './env.js';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  const uri = ENV.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      dbName: 'campusflow',
      serverSelectionTimeoutMS: 10000,
    }).then((m) => {
      console.log(`=========================================`);
      console.log(`🍃 Connected to MongoDB Atlas!`);
      console.log(`📦 Database: ${m.connection.name}`);
      console.log(`🌐 Host: ${m.connection.host}`);
      console.log(`=========================================`);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    console.error(`❌ MongoDB Connection Error: ${err.message}`);
    throw err;
  }
}
