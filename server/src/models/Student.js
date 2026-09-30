import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    program: { type: String, required: true },
    department: { type: String, required: true },
    year: { type: String, required: true },
    semester: { type: String, required: true },
    enrollmentStatus: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active', index: true },
    attendancePercentage: { type: Number, required: true },
    feesDue: { type: Number, default: 0 },
    administrativeHold: { type: Boolean, default: false },
    cgpa: { type: Number, default: 0 },
    phone: { type: String, default: '' },
    dob: { type: String, default: '' },
    course: { type: String, default: '' }
  },
  { timestamps: true }
);

export const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);
