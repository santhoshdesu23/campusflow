import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Request } from '../models/Request.js';
import { Certificate } from '../models/Certificate.js';
import { AuditLog } from '../models/AuditLog.js';
import { generateVerificationHash, generateQrCodeDataUrl } from '../services/qrService.js';

const studentPasswordHash = bcrypt.hashSync('Campus@123', 10);
const adminPasswordHash = bcrypt.hashSync('Admin@123', 10);

/**
 * 50 Fictional Students (NIAT2026AI001 -> NIAT2026AI050)
 * Scenarios:
 * 1. 30 students: Active, attendance >= 75%, fees Rs. 0, no hold (Index 0-29)
 * 2. 8 students: Active, attendance >= 75%, fees Rs. 2,000-15,000 (Index 30-37)
 * 3. 6 students: Active, attendance 50%-74%, fees Rs. 0 (Index 38-43)
 * 4. 3 students: Active, attendance >= 75%, fees Rs. 0, administrative hold (Index 44-46)
 * 5. 3 students: Inactive enrollment (Index 47-49)
 */
export const STUDENTS_50 = [
  // 1-30: Active, attendance >= 75%, fees Rs. 0, no hold (30 students)
  {
    studentId: 'NIAT2026AI001',
    name: 'Aarav Sharma',
    dob: '2004-05-14',
    email: 'NIAT2026AI001@gmail.com',
    course: 'B.Tech AI & Data Science',
    program: 'B.Tech AI & Data Science',
    department: 'Computer Science & Engineering',
    year: 'Year 3',
    semester: 'Semester 6',
    enrollmentStatus: 'active',
    attendancePercentage: 88,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 8.9,
    phone: '+91 98765 43201'
  },
  {
    studentId: 'NIAT2026AI002',
    name: 'Aditi Verma',
    dob: '2005-02-18',
    email: 'NIAT2026AI002@gmail.com',
    course: 'B.Tech AI & Data Science',
    program: 'B.Tech AI & Data Science',
    department: 'Computer Science & Engineering',
    year: 'Year 2',
    semester: 'Semester 4',
    enrollmentStatus: 'active',
    attendancePercentage: 82,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 8.4,
    phone: '+91 98765 43202'
  },
  {
    studentId: 'NIAT2026AI003',
    name: 'Advait Joshi',
    dob: '2003-11-25',
    email: 'NIAT2026AI003@gmail.com',
    course: 'B.Tech Computer Science & Engineering',
    program: 'B.Tech Computer Science & Engineering',
    department: 'Computer Science & Engineering',
    year: 'Year 4',
    semester: 'Semester 8',
    enrollmentStatus: 'active',
    attendancePercentage: 79,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 7.8,
    phone: '+91 98765 43203'
  },
  {
    studentId: 'NIAT2026AI004',
    name: 'Ananya Iyer',
    dob: '2005-08-30',
    email: 'NIAT2026AI004@gmail.com',
    course: 'B.Tech Computer Science & Engineering',
    program: 'B.Tech Computer Science & Engineering',
    department: 'Computer Science & Engineering',
    year: 'Year 2',
    semester: 'Semester 3',
    enrollmentStatus: 'active',
    attendancePercentage: 91,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 9.3,
    phone: '+91 98765 43204'
  },
  {
    studentId: 'NIAT2026AI005',
    name: 'Aryan Patel',
    dob: '2004-01-12',
    email: 'NIAT2026AI005@gmail.com',
    course: 'B.Tech Information Technology',
    program: 'B.Tech Information Technology',
    department: 'Information Technology',
    year: 'Year 3',
    semester: 'Semester 5',
    enrollmentStatus: 'active',
    attendancePercentage: 85,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 8.1,
    phone: '+91 98765 43205'
  },
  {
    studentId: 'NIAT2026AI006',
    name: 'Bhavya Nair',
    dob: '2004-09-04',
    email: 'NIAT2026AI006@gmail.com',
    course: 'B.Tech Electronics & Communication',
    program: 'B.Tech Electronics & Communication',
    department: 'Electronics & Communication',
    year: 'Year 3',
    semester: 'Semester 6',
    enrollmentStatus: 'active',
    attendancePercentage: 86,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 8.7,
    phone: '+91 98765 43206'
  },
  {
    studentId: 'NIAT2026AI007',
    name: 'Chaitanya Rao',
    dob: '2006-04-20',
    email: 'NIAT2026AI007@gmail.com',
    course: 'B.Tech AI & Data Science',
    program: 'B.Tech AI & Data Science',
    department: 'Computer Science & Engineering',
    year: 'Year 1',
    semester: 'Semester 2',
    enrollmentStatus: 'active',
    attendancePercentage: 94,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 9.0,
    phone: '+91 98765 43207'
  },
  {
    studentId: 'NIAT2026AI008',
    name: 'Diya Sen',
    dob: '2005-07-16',
    email: 'NIAT2026AI008@gmail.com',
    course: 'B.Tech Computer Science & Engineering',
    program: 'B.Tech Computer Science & Engineering',
    department: 'Computer Science & Engineering',
    year: 'Year 2',
    semester: 'Semester 4',
    enrollmentStatus: 'active',
    attendancePercentage: 77,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 7.9,
    phone: '+91 98765 43208'
  },
  {
    studentId: 'NIAT2026AI009',
    name: 'Eshan Kulkarni',
    dob: '2004-12-03',
    email: 'NIAT2026AI009@gmail.com',
    course: 'B.Tech Mechanical Engineering',
    program: 'B.Tech Mechanical Engineering',
    department: 'Mechanical Engineering',
    year: 'Year 3',
    semester: 'Semester 6',
    enrollmentStatus: 'active',
    attendancePercentage: 80,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 8.2,
    phone: '+91 98765 43209'
  },
  {
    studentId: 'NIAT2026AI010',
    name: 'Gauri Deshmukh',
    dob: '2005-03-29',
    email: 'NIAT2026AI010@gmail.com',
    course: 'B.Tech AI & Data Science',
    program: 'B.Tech AI & Data Science',
    department: 'Computer Science & Engineering',
    year: 'Year 2',
    semester: 'Semester 4',
    enrollmentStatus: 'active',
    attendancePercentage: 89,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 9.1,
    phone: '+91 98765 43210'
  },
  {
    studentId: 'NIAT2026AI011',
    name: 'Harsh Mehta',
    dob: '2003-10-14',
    email: 'NIAT2026AI011@gmail.com',
    course: 'B.Tech Computer Science & Engineering',
    program: 'B.Tech Computer Science & Engineering',
    department: 'Computer Science & Engineering',
    year: 'Year 4',
    semester: 'Semester 7',
    enrollmentStatus: 'active',
    attendancePercentage: 76,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 7.5,
    phone: '+91 98765 43211'
  },
  {
    studentId: 'NIAT2026AI012',
    name: 'Ishaan Bhatia',
    dob: '2004-06-21',
    email: 'NIAT2026AI012@gmail.com',
    course: 'B.Tech Information Technology',
    program: 'B.Tech Information Technology',
    department: 'Information Technology',
    year: 'Year 3',
    semester: 'Semester 5',
    enrollmentStatus: 'active',
    attendancePercentage: 83,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 8.3,
    phone: '+91 98765 43212'
  },
  {
    studentId: 'NIAT2026AI013',
    name: 'Janhavi Pillai',
    dob: '2005-09-11',
    email: 'NIAT2026AI013@gmail.com',
    course: 'B.Tech Electronics & Communication',
    program: 'B.Tech Electronics & Communication',
    department: 'Electronics & Communication',
    year: 'Year 2',
    semester: 'Semester 3',
    enrollmentStatus: 'active',
    attendancePercentage: 90,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 8.8,
    phone: '+91 98765 43213'
  },
  {
    studentId: 'NIAT2026AI014',
    name: 'Kabir Das',
    dob: '2006-01-05',
    email: 'NIAT2026AI014@gmail.com',
    course: 'B.Tech AI & Data Science',
    program: 'B.Tech AI & Data Science',
    department: 'Computer Science & Engineering',
    year: 'Year 1',
    semester: 'Semester 2',
    enrollmentStatus: 'active',
    attendancePercentage: 95,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 9.4,
    phone: '+91 98765 43214'
  },
  {
    studentId: 'NIAT2026AI015',
    name: 'Kavya Menon',
    dob: '2004-08-19',
    email: 'NIAT2026AI015@gmail.com',
    course: 'B.Tech Computer Science & Engineering',
    program: 'B.Tech Computer Science & Engineering',
    department: 'Computer Science & Engineering',
    year: 'Year 3',
    semester: 'Semester 6',
    enrollmentStatus: 'active',
    attendancePercentage: 87,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 8.6,
    phone: '+91 98765 43215'
  },
  {
    studentId: 'NIAT2026AI016',
    name: 'Krishna Murthy',
    dob: '2003-07-28',
    email: 'NIAT2026AI016@gmail.com',
    course: 'B.Tech Mechanical Engineering',
    program: 'B.Tech Mechanical Engineering',
    department: 'Mechanical Engineering',
    year: 'Year 4',
    semester: 'Semester 8',
    enrollmentStatus: 'active',
    attendancePercentage: 78,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 7.7,
    phone: '+91 98765 43216'
  },
  {
    studentId: 'NIAT2026AI017',
    name: 'Manvi Reddy',
    dob: '2005-11-09',
    email: 'NIAT2026AI017@gmail.com',
    course: 'B.Tech AI & Data Science',
    program: 'B.Tech AI & Data Science',
    department: 'Computer Science & Engineering',
    year: 'Year 2',
    semester: 'Semester 4',
    enrollmentStatus: 'active',
    attendancePercentage: 84,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 8.5,
    phone: '+91 98765 43217'
  },
  {
    studentId: 'NIAT2026AI018',
    name: 'Mohit Agarwal',
    dob: '2004-04-17',
    email: 'NIAT2026AI018@gmail.com',
    course: 'B.Tech Information Technology',
    program: 'B.Tech Information Technology',
    department: 'Information Technology',
    year: 'Year 3',
    semester: 'Semester 5',
    enrollmentStatus: 'active',
    attendancePercentage: 81,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 8.0,
    phone: '+91 98765 43218'
  },
  {
    studentId: 'NIAT2026AI019',
    name: 'Neha Saxena',
    dob: '2005-01-23',
    email: 'NIAT2026AI019@gmail.com',
    course: 'B.Tech Electronics & Communication',
    program: 'B.Tech Electronics & Communication',
    department: 'Electronics & Communication',
    year: 'Year 2',
    semester: 'Semester 4',
    enrollmentStatus: 'active',
    attendancePercentage: 92,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 9.2,
    phone: '+91 98765 43219'
  },
  {
    studentId: 'NIAT2026AI020',
    name: 'Nikhil Chopra',
    dob: '2006-03-08',
    email: 'NIAT2026AI020@gmail.com',
    course: 'B.Tech Computer Science & Engineering',
    program: 'B.Tech Computer Science & Engineering',
    department: 'Computer Science & Engineering',
    year: 'Year 1',
    semester: 'Semester 2',
    enrollmentStatus: 'active',
    attendancePercentage: 86,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 8.3,
    phone: '+91 98765 43220'
  },
  {
    studentId: 'NIAT2026AI021',
    name: 'Pranav Hegde',
    dob: '2004-10-31',
    email: 'NIAT2026AI021@gmail.com',
    course: 'B.Tech AI & Data Science',
    program: 'B.Tech AI & Data Science',
    department: 'Computer Science & Engineering',
    year: 'Year 3',
    semester: 'Semester 6',
    enrollmentStatus: 'active',
    attendancePercentage: 89,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 8.9,
    phone: '+91 98765 43221'
  },
  {
    studentId: 'NIAT2026AI022',
    name: 'Pooja Nambiar',
    dob: '2003-12-15',
    email: 'NIAT2026AI022@gmail.com',
    course: 'B.Tech Mechanical Engineering',
    program: 'B.Tech Mechanical Engineering',
    department: 'Mechanical Engineering',
    year: 'Year 4',
    semester: 'Semester 7',
    enrollmentStatus: 'active',
    attendancePercentage: 77,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 7.6,
    phone: '+91 98765 43222'
  },
  {
    studentId: 'NIAT2026AI023',
    name: 'Rahul Singhania',
    dob: '2005-06-02',
    email: 'NIAT2026AI023@gmail.com',
    course: 'B.Tech Computer Science & Engineering',
    program: 'B.Tech Computer Science & Engineering',
    department: 'Computer Science & Engineering',
    year: 'Year 2',
    semester: 'Semester 4',
    enrollmentStatus: 'active',
    attendancePercentage: 85,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 8.4,
    phone: '+91 98765 43223'
  },
  {
    studentId: 'NIAT2026AI024',
    name: 'Rhea Chatterjee',
    dob: '2004-02-27',
    email: 'NIAT2026AI024@gmail.com',
    course: 'B.Tech Information Technology',
    program: 'B.Tech Information Technology',
    department: 'Information Technology',
    year: 'Year 3',
    semester: 'Semester 5',
    enrollmentStatus: 'active',
    attendancePercentage: 93,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 9.5,
    phone: '+91 98765 43224'
  },
  {
    studentId: 'NIAT2026AI025',
    name: 'Rohan Malhotra',
    dob: '2005-05-19',
    email: 'NIAT2026AI025@gmail.com',
    course: 'B.Tech AI & Data Science',
    program: 'B.Tech AI & Data Science',
    department: 'Computer Science & Engineering',
    year: 'Year 2',
    semester: 'Semester 3',
    enrollmentStatus: 'active',
    attendancePercentage: 85,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 8.7,
    phone: '+91 98765 43225'
  },
  {
    studentId: 'NIAT2026AI026',
    name: 'Saanvi Bansal',
    dob: '2006-02-14',
    email: 'NIAT2026AI026@gmail.com',
    course: 'B.Tech Electronics & Communication',
    program: 'B.Tech Electronics & Communication',
    department: 'Electronics & Communication',
    year: 'Year 1',
    semester: 'Semester 2',
    enrollmentStatus: 'active',
    attendancePercentage: 88,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 8.8,
    phone: '+91 98765 43226'
  },
  {
    studentId: 'NIAT2026AI027',
    name: 'Samar Kapoor',
    dob: '2004-07-07',
    email: 'NIAT2026AI027@gmail.com',
    course: 'B.Tech Computer Science & Engineering',
    program: 'B.Tech Computer Science & Engineering',
    department: 'Computer Science & Engineering',
    year: 'Year 3',
    semester: 'Semester 6',
    enrollmentStatus: 'active',
    attendancePercentage: 82,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 8.2,
    phone: '+91 98765 43227'
  },
  {
    studentId: 'NIAT2026AI028',
    name: 'Shreya Ghoshal',
    dob: '2003-09-22',
    email: 'NIAT2026AI028@gmail.com',
    course: 'B.Tech Mechanical Engineering',
    program: 'B.Tech Mechanical Engineering',
    department: 'Mechanical Engineering',
    year: 'Year 4',
    semester: 'Semester 8',
    enrollmentStatus: 'active',
    attendancePercentage: 80,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 8.1,
    phone: '+91 98765 43228'
  },
  {
    studentId: 'NIAT2026AI029',
    name: 'Siddharth Roy',
    dob: '2005-10-18',
    email: 'NIAT2026AI029@gmail.com',
    course: 'B.Tech AI & Data Science',
    program: 'B.Tech AI & Data Science',
    department: 'Computer Science & Engineering',
    year: 'Year 2',
    semester: 'Semester 4',
    enrollmentStatus: 'active',
    attendancePercentage: 90,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 9.0,
    phone: '+91 98765 43229'
  },
  {
    studentId: 'NIAT2026AI030',
    name: 'Simran Kaur',
    dob: '2004-03-30',
    email: 'NIAT2026AI030@gmail.com',
    course: 'B.Tech Information Technology',
    program: 'B.Tech Information Technology',
    department: 'Information Technology',
    year: 'Year 3',
    semester: 'Semester 5',
    enrollmentStatus: 'active',
    attendancePercentage: 87,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 8.6,
    phone: '+91 98765 43230'
  },

  // 31-38: Active, attendance >= 75%, fees Rs. 2,000-15,000 (8 students)
  {
    studentId: 'NIAT2026AI031',
    name: 'Tanmay Trivedi',
    dob: '2005-04-11',
    email: 'NIAT2026AI031@gmail.com',
    course: 'B.Tech AI & Data Science',
    program: 'B.Tech AI & Data Science',
    department: 'Computer Science & Engineering',
    year: 'Year 2',
    semester: 'Semester 4',
    enrollmentStatus: 'active',
    attendancePercentage: 84,
    feesDue: 8500,
    administrativeHold: false,
    cgpa: 8.5,
    phone: '+91 98765 43231'
  },
  {
    studentId: 'NIAT2026AI032',
    name: 'Tara Srinivasan',
    dob: '2004-11-15',
    email: 'NIAT2026AI032@gmail.com',
    course: 'B.Tech Computer Science & Engineering',
    program: 'B.Tech Computer Science & Engineering',
    department: 'Computer Science & Engineering',
    year: 'Year 3',
    semester: 'Semester 5',
    enrollmentStatus: 'active',
    attendancePercentage: 79,
    feesDue: 2500,
    administrativeHold: false,
    cgpa: 8.2,
    phone: '+91 98765 43232'
  },
  {
    studentId: 'NIAT2026AI033',
    name: 'Tejas Pandey',
    dob: '2006-05-23',
    email: 'NIAT2026AI033@gmail.com',
    course: 'B.Tech Information Technology',
    program: 'B.Tech Information Technology',
    department: 'Information Technology',
    year: 'Year 1',
    semester: 'Semester 2',
    enrollmentStatus: 'active',
    attendancePercentage: 91,
    feesDue: 4200,
    administrativeHold: false,
    cgpa: 8.8,
    phone: '+91 98765 43233'
  },
  {
    studentId: 'NIAT2026AI034',
    name: 'Trisha Mukherjee',
    dob: '2003-08-09',
    email: 'NIAT2026AI034@gmail.com',
    course: 'B.Tech Electronics & Communication',
    program: 'B.Tech Electronics & Communication',
    department: 'Electronics & Communication',
    year: 'Year 4',
    semester: 'Semester 7',
    enrollmentStatus: 'active',
    attendancePercentage: 77,
    feesDue: 6000,
    administrativeHold: false,
    cgpa: 7.9,
    phone: '+91 98765 43234'
  },
  {
    studentId: 'NIAT2026AI035',
    name: 'Utkarsh Shukla',
    dob: '2004-09-17',
    email: 'NIAT2026AI035@gmail.com',
    course: 'B.Tech Mechanical Engineering',
    program: 'B.Tech Mechanical Engineering',
    department: 'Mechanical Engineering',
    year: 'Year 3',
    semester: 'Semester 6',
    enrollmentStatus: 'active',
    attendancePercentage: 82,
    feesDue: 10000,
    administrativeHold: false,
    cgpa: 8.0,
    phone: '+91 98765 43235'
  },
  {
    studentId: 'NIAT2026AI036',
    name: 'Vaidehi Bhatt',
    dob: '2005-01-31',
    email: 'NIAT2026AI036@gmail.com',
    course: 'B.Tech AI & Data Science',
    program: 'B.Tech AI & Data Science',
    department: 'Computer Science & Engineering',
    year: 'Year 2',
    semester: 'Semester 3',
    enrollmentStatus: 'active',
    attendancePercentage: 88,
    feesDue: 11500,
    administrativeHold: false,
    cgpa: 9.1,
    phone: '+91 98765 43236'
  },
  {
    studentId: 'NIAT2026AI037',
    name: 'Varun Sundaram',
    dob: '2004-06-06',
    email: 'NIAT2026AI037@gmail.com',
    course: 'B.Tech Computer Science & Engineering',
    program: 'B.Tech Computer Science & Engineering',
    department: 'Computer Science & Engineering',
    year: 'Year 3',
    semester: 'Semester 5',
    enrollmentStatus: 'active',
    attendancePercentage: 86,
    feesDue: 13000,
    administrativeHold: false,
    cgpa: 8.4,
    phone: '+91 98765 43237'
  },
  {
    studentId: 'NIAT2026AI038',
    name: 'Vidya Narayanan',
    dob: '2003-12-04',
    email: 'NIAT2026AI038@gmail.com',
    course: 'B.Tech Information Technology',
    program: 'B.Tech Information Technology',
    department: 'Information Technology',
    year: 'Year 4',
    semester: 'Semester 8',
    enrollmentStatus: 'active',
    attendancePercentage: 83,
    feesDue: 15000,
    administrativeHold: false,
    cgpa: 8.3,
    phone: '+91 98765 43238'
  },

  // 39-44: Active, attendance 50%-74%, fees Rs. 0 (6 students)
  {
    studentId: 'NIAT2026AI039',
    name: 'Vivaan Nanda',
    dob: '2004-05-25',
    email: 'NIAT2026AI039@gmail.com',
    course: 'B.Tech Mechanical Engineering',
    program: 'B.Tech Mechanical Engineering',
    department: 'Mechanical Engineering',
    year: 'Year 4',
    semester: 'Semester 8',
    enrollmentStatus: 'active',
    attendancePercentage: 68,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 7.4,
    phone: '+91 98765 43239'
  },
  {
    studentId: 'NIAT2026AI040',
    name: 'Yash Vardhan',
    dob: '2005-08-14',
    email: 'NIAT2026AI040@gmail.com',
    course: 'B.Tech AI & Data Science',
    program: 'B.Tech AI & Data Science',
    department: 'Computer Science & Engineering',
    year: 'Year 2',
    semester: 'Semester 4',
    enrollmentStatus: 'active',
    attendancePercentage: 52,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 6.9,
    phone: '+91 98765 43240'
  },
  {
    studentId: 'NIAT2026AI041',
    name: 'Zara Merchant',
    dob: '2004-02-19',
    email: 'NIAT2026AI041@gmail.com',
    course: 'B.Tech Computer Science & Engineering',
    program: 'B.Tech Computer Science & Engineering',
    department: 'Computer Science & Engineering',
    year: 'Year 3',
    semester: 'Semester 5',
    enrollmentStatus: 'active',
    attendancePercentage: 58,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 7.1,
    phone: '+91 98765 43241'
  },
  {
    studentId: 'NIAT2026AI042',
    name: 'Aayush Goel',
    dob: '2006-03-27',
    email: 'NIAT2026AI042@gmail.com',
    course: 'B.Tech Information Technology',
    program: 'B.Tech Information Technology',
    department: 'Information Technology',
    year: 'Year 1',
    semester: 'Semester 2',
    enrollmentStatus: 'active',
    attendancePercentage: 62,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 7.3,
    phone: '+91 98765 43242'
  },
  {
    studentId: 'NIAT2026AI043',
    name: 'Charu Mathur',
    dob: '2003-11-08',
    email: 'NIAT2026AI043@gmail.com',
    course: 'B.Tech Electronics & Communication',
    program: 'B.Tech Electronics & Communication',
    department: 'Electronics & Communication',
    year: 'Year 4',
    semester: 'Semester 7',
    enrollmentStatus: 'active',
    attendancePercentage: 67,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 7.5,
    phone: '+91 98765 43243'
  },
  {
    studentId: 'NIAT2026AI044',
    name: 'Devendra Patil',
    dob: '2004-10-12',
    email: 'NIAT2026AI044@gmail.com',
    course: 'B.Tech Mechanical Engineering',
    program: 'B.Tech Mechanical Engineering',
    department: 'Mechanical Engineering',
    year: 'Year 3',
    semester: 'Semester 6',
    enrollmentStatus: 'active',
    attendancePercentage: 73,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 7.6,
    phone: '+91 98765 43244'
  },

  // 45-47: Active, attendance >= 75%, fees Rs. 0, administrative hold (3 students)
  {
    studentId: 'NIAT2026AI045',
    name: 'Gayathri Swaminathan',
    dob: '2004-07-21',
    email: 'NIAT2026AI045@gmail.com',
    course: 'B.Tech Computer Science & Engineering',
    program: 'B.Tech Computer Science & Engineering',
    department: 'Computer Science & Engineering',
    year: 'Year 3',
    semester: 'Semester 6',
    enrollmentStatus: 'active',
    attendancePercentage: 80,
    feesDue: 0,
    administrativeHold: true,
    cgpa: 8.6,
    phone: '+91 98765 43245'
  },
  {
    studentId: 'NIAT2026AI046',
    name: 'Hemant Solanki',
    dob: '2005-09-03',
    email: 'NIAT2026AI046@gmail.com',
    course: 'B.Tech AI & Data Science',
    program: 'B.Tech AI & Data Science',
    department: 'Computer Science & Engineering',
    year: 'Year 2',
    semester: 'Semester 4',
    enrollmentStatus: 'active',
    attendancePercentage: 84,
    feesDue: 0,
    administrativeHold: true,
    cgpa: 8.2,
    phone: '+91 98765 43246'
  },
  {
    studentId: 'NIAT2026AI047',
    name: 'Jhanvi Venkatesh',
    dob: '2003-06-15',
    email: 'NIAT2026AI047@gmail.com',
    course: 'B.Tech Information Technology',
    program: 'B.Tech Information Technology',
    department: 'Information Technology',
    year: 'Year 4',
    semester: 'Semester 8',
    enrollmentStatus: 'active',
    attendancePercentage: 91,
    feesDue: 0,
    administrativeHold: true,
    cgpa: 8.9,
    phone: '+91 98765 43247'
  },

  // 48-50: Inactive enrollment (3 students)
  {
    studentId: 'NIAT2026AI048',
    name: 'Karan Sethi',
    dob: '2004-01-29',
    email: 'NIAT2026AI048@gmail.com',
    course: 'B.Tech Computer Science & Engineering',
    program: 'B.Tech Computer Science & Engineering',
    department: 'Computer Science & Engineering',
    year: 'Year 3',
    semester: 'Semester 5',
    enrollmentStatus: 'inactive',
    attendancePercentage: 70,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 7.0,
    phone: '+91 98765 43248'
  },
  {
    studentId: 'NIAT2026AI049',
    name: 'Lavanya Sundar',
    dob: '2005-12-10',
    email: 'NIAT2026AI049@gmail.com',
    course: 'B.Tech Electronics & Communication',
    program: 'B.Tech Electronics & Communication',
    department: 'Electronics & Communication',
    year: 'Year 2',
    semester: 'Semester 3',
    enrollmentStatus: 'inactive',
    attendancePercentage: 82,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 8.1,
    phone: '+91 98765 43249'
  },
  {
    studentId: 'NIAT2026AI050',
    name: 'Madhavan Natarajan',
    dob: '2006-04-02',
    email: 'NIAT2026AI050@gmail.com',
    course: 'B.Tech Computer Science & Engineering',
    program: 'B.Tech Computer Science & Engineering',
    department: 'Computer Science & Engineering',
    year: 'Year 1',
    semester: 'Semester 2',
    enrollmentStatus: 'inactive',
    attendancePercentage: 91,
    feesDue: 0,
    administrativeHold: false,
    cgpa: 8.5,
    phone: '+91 98765 43250'
  }
];

export const ADMIN_USER = {
  id: 'user_admin',
  name: 'CampusFlow System Administrator',
  email: 'admin@campusflow.com',
  passwordHash: adminPasswordHash,
  role: 'admin',
  department: 'Academic Registrar'
};

export const USERS_51 = [
  ADMIN_USER,
  ...STUDENTS_50.map(s => ({
    id: `user_${s.studentId.toLowerCase()}`,
    name: s.name,
    email: s.email,
    passwordHash: studentPasswordHash,
    role: 'student',
    studentId: s.studentId,
    department: s.department
  }))
];

export async function seedDatabase(forceClean = false) {
  console.log('🌱 Starting MongoDB database seeding / synchronization...');

  // 1. Safely remove legacy demo users and students from old seed versions
  const legacyEmails = [
    'admin@campusflow.demo',
    'student@campusflow.demo',
    'priya@campusflow.demo',
    'arjun@campusflow.demo',
    'sneha@campusflow.demo'
  ];
  const legacyStudentIds = ['STU001', 'STU002', 'STU003', 'STU004'];

  await User.deleteMany({
    $or: [
      { email: { $in: legacyEmails } },
      { email: { $regex: /@campusflow\.demo$/i } },
      { studentId: { $in: legacyStudentIds } },
      { id: { $in: ['user_admin', 'user_stu001', 'user_stu002', 'user_stu003', 'user_stu004'] } }
    ]
  });

  await Student.deleteMany({
    $or: [
      { studentId: { $in: legacyStudentIds } },
      { email: { $in: legacyEmails } },
      { email: { $regex: /@campusflow\.demo$/i } }
    ]
  });

  if (forceClean) {
    await User.deleteMany({});
    await Student.deleteMany({});
    await Request.deleteMany({});
    await Certificate.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('🧹 Cleared all existing collections for clean seed.');
  }

  // 2. Upsert the 50 students
  for (const stu of STUDENTS_50) {
    await Student.findOneAndUpdate(
      { studentId: stu.studentId },
      stu,
      { upsert: true, new: true }
    );
  }

  // Clean up any student outside the 50
  const validStudentIds = STUDENTS_50.map(s => s.studentId);
  await Student.deleteMany({ studentId: { $nin: validStudentIds } });

  console.log(`✅ Seeded ${STUDENTS_50.length} students into MongoDB.`);

  // 3. Upsert the 51 users (50 students + 1 admin)
  for (const u of USERS_51) {
    await User.findOneAndUpdate(
      { email: u.email.toLowerCase() },
      u,
      { upsert: true, new: true }
    );
  }

  // Clean up any user outside the 51
  const validEmails = USERS_51.map(u => u.email.toLowerCase());
  await User.deleteMany({ email: { $nin: validEmails } });

  console.log(`✅ Seeded ${USERS_51.length} users into MongoDB.`);

  // 4. Seed initial requests, certificate & audit logs for the new dataset
  const req1Id = 'CF-2026-00124';
  const cert1Id = 'CERT-2026-00124';
  const req1Date = new Date(Date.now() - 3600000 * 4);
  const qrDataUrl = await generateQrCodeDataUrl(cert1Id);

  const cert1 = {
    certificateId: cert1Id,
    requestId: req1Id,
    studentId: 'NIAT2026AI001',
    studentName: 'Aarav Sharma',
    documentType: 'Bonafide Certificate',
    purpose: 'Internship at ABC Technologies',
    organization: 'ABC Technologies',
    program: 'B.Tech AI & Data Science',
    year: 'Year 3',
    issueDate: req1Date,
    validUntil: new Date(Date.now() + 365 * 24 * 3600000),
    status: 'Valid',
    verificationHash: 'cf_hash_98a76d54f3e2c1b0a8f7e6d5c4b3a2',
    authorizedSignatory: 'Dr. V. Ramanathan, Academic Registrar',
    qrCodeDataUrl: qrDataUrl
  };

  await Certificate.findOneAndUpdate(
    { certificateId: cert1Id },
    cert1,
    { upsert: true, new: true }
  );

  const req1 = {
    id: req1Id,
    studentId: 'NIAT2026AI001',
    studentName: 'Aarav Sharma',
    studentEmail: 'NIAT2026AI001@gmail.com',
    program: 'B.Tech AI & Data Science',
    documentType: 'Bonafide Certificate',
    rawPrompt: 'I need proof that I am currently studying here for my internship at ABC Technologies.',
    aiUnderstanding: {
      documentType: 'Bonafide Certificate',
      purpose: 'Internship',
      organization: 'ABC Technologies',
      confidence: 'High',
      requiredInfoDetected: true,
      extractedEntities: {
        document: 'Bonafide Certificate',
        purpose: 'Internship',
        organization: 'ABC Technologies'
      }
    },
    ruleEvaluation: {
      decision: 'AUTO_APPROVE',
      status: 'approved',
      route: null,
      priority: 'Low',
      checks: {
        activeEnrollment: true,
        feesCleared: true,
        attendanceSufficient: true,
        noAdministrativeHold: true
      },
      resultsList: [
        { rule: 'Active Enrollment', passed: true, value: 'active', required: 'active', description: 'Student has an active, valid enrollment status.' },
        { rule: 'Fees Cleared', passed: true, value: '₹0', required: '₹0 balance', description: 'All tuition and institutional dues are cleared.' },
        { rule: 'Attendance ≥ 75%', passed: true, value: '88%', required: '≥ 75%', description: 'Academic attendance is 88% (satisfies institutional minimum).' },
        { rule: 'Administrative Hold', passed: true, value: 'None', required: 'None', description: 'No administrative holds on record.' }
      ],
      reasons: ['All configured institutional requirements have been satisfied.'],
      canAutoProcess: true
    },
    decisionExplanation: {
      title: 'Eligible for automated processing',
      summary: 'All institutional requirements satisfied.',
      points: [
        'Student enrollment is active.',
        'Attendance requirement (88% >= 75%) is satisfied.',
        'No administrative hold exists.',
        'All institutional fees are cleared (₹0 due).'
      ],
      conclusion: 'Automated certificate issuance approved according to institutional policy.'
    },
    status: 'approved',
    decision: 'AUTO_APPROVE',
    route: null,
    submittedAt: req1Date,
    processedAt: req1Date,
    certificateId: cert1Id
  };

  await Request.findOneAndUpdate({ id: req1Id }, req1, { upsert: true, new: true });

  // Fee Exception Request (Tanmay Trivedi - NIAT2026AI031)
  const req2Id = 'CF-2026-00125';
  const req2Date = new Date(Date.now() - 1800000);
  const req2 = {
    id: req2Id,
    studentId: 'NIAT2026AI031',
    studentName: 'Tanmay Trivedi',
    studentEmail: 'NIAT2026AI031@gmail.com',
    program: 'B.Tech AI & Data Science',
    documentType: 'Bonafide Certificate',
    rawPrompt: 'Please provide a bonafide letter for my internship at ABC Technologies.',
    aiUnderstanding: {
      documentType: 'Bonafide Certificate',
      purpose: 'Internship',
      organization: 'ABC Technologies',
      confidence: 'High',
      requiredInfoDetected: true,
      extractedEntities: {
        document: 'Bonafide Certificate',
        purpose: 'Internship',
        organization: 'ABC Technologies'
      }
    },
    ruleEvaluation: {
      decision: 'REVIEW',
      status: 'pending_review',
      route: 'ACCOUNTS',
      priority: 'Medium',
      checks: {
        activeEnrollment: true,
        feesCleared: false,
        attendanceSufficient: true,
        noAdministrativeHold: true
      },
      resultsList: [
        { rule: 'Active Enrollment', passed: true, value: 'active', required: 'active', description: 'Student has an active, valid enrollment status.' },
        { rule: 'Fees Cleared', passed: false, value: '₹8,500', required: '₹0 balance', description: 'Outstanding balance of ₹8,500 pending clearance.' },
        { rule: 'Attendance ≥ 75%', passed: true, value: '84%', required: '≥ 75%', description: 'Academic attendance is 84% (satisfies institutional minimum).' },
        { rule: 'Administrative Hold', passed: true, value: 'None', required: 'None', description: 'No administrative holds on record.' }
      ],
      reasons: ['Outstanding fee balance of ₹8,500 detected.'],
      canAutoProcess: false
    },
    decisionExplanation: {
      title: 'Review Required: Fee balance verification',
      summary: 'Outstanding fee balance requires Accounts department clearance.',
      points: [
        'Student enrollment is active.',
        'Attendance requirement is satisfied (84%).',
        'No administrative hold exists.',
        'Fee clearance check failed (₹8,500 due).',
        'According to institutional policy, automated issuance is not permitted.'
      ],
      conclusion: 'Human review required by Accounts Department.'
    },
    status: 'pending_review',
    decision: 'REVIEW',
    route: 'ACCOUNTS',
    submittedAt: req2Date,
    processedAt: null,
    certificateId: null
  };
  await Request.findOneAndUpdate({ id: req2Id }, req2, { upsert: true, new: true });

  // Attendance Exception Request (Vivaan Nanda - NIAT2026AI039)
  const req3Id = 'CF-2026-00126';
  const req3Date = new Date(Date.now() - 3600000 * 2);
  const req3 = {
    id: req3Id,
    studentId: 'NIAT2026AI039',
    studentName: 'Vivaan Nanda',
    studentEmail: 'NIAT2026AI039@gmail.com',
    program: 'B.Tech Mechanical Engineering',
    documentType: 'Bonafide Certificate',
    rawPrompt: 'I require a bonafide certificate for industrial internship verification.',
    aiUnderstanding: {
      documentType: 'Bonafide Certificate',
      purpose: 'Internship',
      organization: 'Industrial Training Corp',
      confidence: 'High',
      requiredInfoDetected: true,
      extractedEntities: {
        document: 'Bonafide Certificate',
        purpose: 'Internship',
        organization: 'Industrial Training Corp'
      }
    },
    ruleEvaluation: {
      decision: 'REVIEW',
      status: 'pending_review',
      route: 'ACADEMIC',
      priority: 'Medium',
      checks: {
        activeEnrollment: true,
        feesCleared: true,
        attendanceSufficient: false,
        noAdministrativeHold: true
      },
      resultsList: [
        { rule: 'Active Enrollment', passed: true, value: 'active', required: 'active', description: 'Student has an active, valid enrollment status.' },
        { rule: 'Fees Cleared', passed: true, value: '₹0', required: '₹0 balance', description: 'All tuition and institutional dues are cleared.' },
        { rule: 'Attendance ≥ 75%', passed: false, value: '68%', required: '≥ 75%', description: 'Attendance is 68% (below 75% institutional requirement).' },
        { rule: 'Administrative Hold', passed: true, value: 'None', required: 'None', description: 'No administrative holds on record.' }
      ],
      reasons: ['Attendance is 68% (institutional threshold: 75%).'],
      canAutoProcess: false
    },
    decisionExplanation: {
      title: 'Review Required: Attendance shortage',
      summary: 'Attendance below 75% requires Academic Dean clearance.',
      points: [
        'Student enrollment is active.',
        'No administrative hold exists.',
        'Fee clearance satisfied.',
        'Attendance is 68% (institutional minimum threshold is 75%).'
      ],
      conclusion: 'Human review required by Academic Department.'
    },
    status: 'pending_review',
    decision: 'REVIEW',
    route: 'ACADEMIC',
    submittedAt: req3Date,
    processedAt: null,
    certificateId: null
  };
  await Request.findOneAndUpdate({ id: req3Id }, req3, { upsert: true, new: true });

  // Initial Audit Logs
  const initialLogs = [
    {
      id: 'aud_1',
      requestId: req1Id,
      action: 'REQUEST_CREATED',
      actor: 'Aarav Sharma (Student)',
      timestamp: req1Date,
      details: 'Submitted natural language request'
    },
    {
      id: 'aud_2',
      requestId: req1Id,
      action: 'AI_PARSED',
      actor: 'CampusFlow AI Engine',
      timestamp: new Date(req1Date.getTime() + 1000),
      details: 'Extracted Bonafide Certificate, Purpose: Internship, Org: ABC Technologies'
    },
    {
      id: 'aud_3',
      requestId: req1Id,
      action: 'RULES_EVALUATED',
      actor: 'Deterministic Rule Engine',
      timestamp: new Date(req1Date.getTime() + 2000),
      details: 'All 4 institutional rules passed (Enrollment: Active, Fees: 0, Attendance: 88%, Hold: None)'
    },
    {
      id: 'aud_4',
      requestId: req1Id,
      action: 'DECISION_AUTO_APPROVED',
      actor: 'CampusFlow System',
      timestamp: new Date(req1Date.getTime() + 2500),
      details: 'Eligible for automated processing without manual review'
    },
    {
      id: 'aud_5',
      requestId: req1Id,
      action: 'CERTIFICATE_GENERATED',
      actor: 'System PDF & QR Engine',
      timestamp: new Date(req1Date.getTime() + 4000),
      details: `Generated Certificate ${cert1Id} with QR cryptographic verification hash`
    },
    {
      id: 'aud_6',
      requestId: req2Id,
      action: 'REQUEST_CREATED',
      actor: 'Tanmay Trivedi (Student)',
      timestamp: req2Date,
      details: 'Submitted natural language request'
    },
    {
      id: 'aud_7',
      requestId: req2Id,
      action: 'RULES_EVALUATED',
      actor: 'Deterministic Rule Engine',
      timestamp: new Date(req2Date.getTime() + 1000),
      details: 'Rule failed: Outstanding fee balance of ₹8,500'
    },
    {
      id: 'aud_8',
      requestId: req2Id,
      action: 'EXCEPTION_ROUTED',
      actor: 'Workflow Router',
      timestamp: new Date(req2Date.getTime() + 2000),
      details: 'Routed to ACCOUNTS department for manual fee clearance verification'
    }
  ];

  for (const log of initialLogs) {
    await AuditLog.findOneAndUpdate({ id: log.id }, log, { upsert: true, new: true });
  }

  console.log(`✅ Seeded requests, certificates, and audit logs into MongoDB.`);
  console.log(`✨ Seed complete! Total users: ${await User.countDocuments()}, Total students: ${await Student.countDocuments()}`);
}

// If run directly: node src/scripts/seed.js
if (process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    try {
      await connectDB();
      const force = process.argv.includes('--force');
      await seedDatabase(force);
      console.log('✨ Database seeding complete!');
      process.exit(0);
    } catch (err) {
      console.error('Seeding error:', err);
      process.exit(1);
    }
  })();
}
