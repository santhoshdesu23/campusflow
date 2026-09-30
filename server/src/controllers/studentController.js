import { db } from '../models/db.js';
import { evaluateBonafideRules } from '../rules/ruleEngine.js';

/**
 * Get authenticated student's profile from MongoDB.
 * Ensures the student can only access their own data via JWT.
 */
export async function getStudentProfile(req, res) {
  try {
    const studentId = req.student?.studentId || req.user?.studentId;
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'No student ID associated with this authenticated account'
      });
    }

    const student = await db.findStudentById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found in institutional database'
      });
    }

    // Evaluate deterministic institutional eligibility rules using backend rule engine
    const eligibility = evaluateBonafideRules(student);

    return res.json({
      success: true,
      data: {
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        dob: student.dob,
        course: student.course || student.program,
        program: student.program || student.course,
        department: student.department,
        year: student.year,
        semester: student.semester,
        cgpa: student.cgpa,
        attendancePercentage: student.attendancePercentage,
        feesDue: student.feesDue,
        enrollmentStatus: student.enrollmentStatus,
        administrativeHold: Boolean(student.administrativeHold),
        phone: student.phone,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
        eligibility
      }
    });
  } catch (err) {
    console.error('Error fetching student profile:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve student profile from database'
    });
  }
}
