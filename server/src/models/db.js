import { User } from './User.js';
import { Student } from './Student.js';
import { Request } from './Request.js';
import { Certificate } from './Certificate.js';
import { AuditLog } from './AuditLog.js';

class MongoDatabase {
  // User methods
  async findUserByEmail(email) {
    if (!email) return null;
    return await User.findOne({ email: new RegExp(`^${email}$`, 'i') }).lean();
  }

  async findUserById(id) {
    if (!id) return null;
    return await User.findOne({ id }).lean();
  }

  // Student methods
  async findStudentById(studentId) {
    if (!studentId) return null;
    return await Student.findOne({ studentId }).lean();
  }

  async findStudentByEmail(email) {
    if (!email) return null;
    return await Student.findOne({ email: new RegExp(`^${email}$`, 'i') }).lean();
  }

  // Request methods
  async getAllRequests() {
    return await Request.find().sort({ submittedAt: -1 }).lean();
  }

  async getRequestById(id) {
    return await Request.findOne({ id }).lean();
  }

  async getRequestsByStudentId(studentId) {
    return await Request.find({ studentId }).sort({ submittedAt: -1 }).lean();
  }

  async createRequest(reqData) {
    const created = await Request.create(reqData);
    return created.toObject();
  }

  async updateRequest(id, updates) {
    return await Request.findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: 'after' }
    ).lean();
  }

  async countRequests() {
    return await Request.countDocuments();
  }

  // Certificate methods
  async createCertificate(certData) {
    const created = await Certificate.create(certData);
    return created.toObject();
  }

  async getCertificateById(id) {
    return await Certificate.findOne({
      $or: [{ certificateId: id }, { requestId: id }]
    }).lean();
  }

  async getAllCertificates() {
    return await Certificate.find().sort({ issueDate: -1 }).lean();
  }

  async getCertificatesByStudentId(studentId) {
    return await Certificate.find({ studentId }).sort({ issueDate: -1 }).lean();
  }

  // Audit Log methods
  async addAuditLog(entry) {
    const logData = {
      id: entry.id || ('aud_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)),
      timestamp: entry.timestamp || new Date(),
      ...entry
    };
    const created = await AuditLog.create(logData);
    return created.toObject();
  }

  async getAuditLogsByRequestId(requestId) {
    return await AuditLog.find({ requestId }).sort({ timestamp: 1 }).lean();
  }

  async getAllAuditLogs() {
    return await AuditLog.find().sort({ timestamp: -1 }).lean();
  }
}

export const db = new MongoDatabase();
