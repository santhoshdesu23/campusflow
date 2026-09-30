import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], required: true, index: true },
    studentId: { type: String, default: null, index: true },
    department: { type: String, default: null }
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
