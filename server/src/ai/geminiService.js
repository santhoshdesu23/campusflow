import { ENV } from '../config/env.js';

/**
 * Intelligent AI Service using Google Gemini with robust offline/demo fallback.
 * 
 * Rules:
 * 1. AI UNDERSTANDS AND EXPLAINS.
 * 2. DETERMINISTIC RULES DECIDE ELIGIBILITY.
 * 3. Never allow LLM to independently determine or override eligibility.
 */

// Offline/Fallback Natural Language Extractor
function fallbackParseRequest(text) {
  const lower = (text || '').toLowerCase();
  
  // Detect document type
  let documentType = 'Bonafide Certificate';
  let requiredInfoDetected = true;
  let missingFields = [];

  // Check if text is too vague
  if (lower.trim().length < 10) {
    return {
      documentType: 'Bonafide Certificate',
      purpose: 'Unspecified',
      organization: null,
      confidence: 'Low',
      requiredInfoDetected: false,
      missingFields: ['purpose', 'organization'],
      followUpPrompt: 'Please specify the purpose of your request (e.g., internship, passport application, bank loan).'
    };
  }

  // Detect purpose
  let purpose = 'General Academic Verification';
  if (lower.includes('intern') || lower.includes('job') || lower.includes('placement')) {
    purpose = 'Internship';
  } else if (lower.includes('passport') || lower.includes('visa')) {
    purpose = 'Passport / Visa Application';
  } else if (lower.includes('loan') || lower.includes('bank') || lower.includes('scholarship')) {
    purpose = 'Educational Loan / Scholarship';
  } else if (lower.includes('higher stud') || lower.includes('exam') || lower.includes('admissions')) {
    purpose = 'Higher Studies Application';
  } else if (lower.includes('project') || lower.includes('competition')) {
    purpose = 'External Project / Hackathon';
  }

  // Detect organization
  let organization = null;
  if (/ABC\s*Tech(?:nologies)?/i.test(text)) {
    organization = 'ABC Technologies';
  } else {
    const atMatch = text.match(/\bat\s+([A-Z0-9][A-Za-z0-9&.\s]{1,30})/i);
    if (atMatch && atMatch[1]) {
      let org = atMatch[1].replace(/[.,;:!?]+$/, '').trim();
      org = org.replace(/\s+(?:for|to|next|in|during|regarding).*/i, '').trim();
      const stopWords = ['my', 'the', 'a', 'an', 'our', 'this', 'that', 'bonafide', 'certificate', 'college', 'university'];
      if (!stopWords.includes(org.toLowerCase())) {
        organization = org;
      }
    }
  }

  // Determine confidence
  const confidence = (organization && purpose !== 'General Academic Verification') ? 'High' : 'Medium';

  return {
    documentType,
    purpose,
    organization: organization || 'Official Records',
    confidence,
    requiredInfoDetected: true,
    missingFields: [],
    followUpPrompt: null
  };
}

export async function parseStudentRequest(promptText) {
  if (ENV.DEMO_MODE || !ENV.GEMINI_API_KEY) {
    return fallbackParseRequest(promptText);
  }

  try {
    const systemPrompt = `You are the document intake parser for CampusFlow AI, a university workflow automation platform.
Analyze the student's natural language document request and extract structured information.

Respond ONLY with a valid JSON object matching this schema:
{
  "documentType": "Bonafide Certificate",
  "purpose": "Internship | Passport / Visa Application | Educational Loan | Higher Studies | General Academic Verification",
  "organization": "Company or entity name if mentioned, or null",
  "confidence": "High | Medium | Low",
  "requiredInfoDetected": true/false,
  "missingFields": ["list of missing details if any"],
  "followUpPrompt": "Question to ask the student if key information is missing, or null"
}

Student request text:
"${promptText}"`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${ENV.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      })
    });

    if (!response.ok) {
      console.warn('Gemini API call failed, falling back to local extractor');
      return fallbackParseRequest(promptText);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidateText) {
      return JSON.parse(candidateText);
    }
    return fallbackParseRequest(promptText);
  } catch (err) {
    console.error('Error in parseStudentRequest AI:', err.message);
    return fallbackParseRequest(promptText);
  }
}

export function generateDecisionExplanation(ruleResult, student, parsedRequest) {
  // Deterministic rule breakdown with human-readable language
  const points = [];

  // 1. Enrollment
  if (ruleResult.checks.activeEnrollment) {
    points.push('Student enrollment status is verified active.');
  } else {
    points.push(`Student enrollment status is ${student.enrollmentStatus} (inactive). Automated processing not permitted.`);
  }

  // 2. Attendance
  if (ruleResult.checks.attendanceSufficient) {
    points.push(`Attendance requirement is satisfied (${student.attendancePercentage}% >= 75% threshold).`);
  } else {
    points.push(`Attendance requirement is NOT satisfied (${student.attendancePercentage}% is below the 75% minimum institutional requirement).`);
  }

  // 3. Administrative Hold
  if (ruleResult.checks.noAdministrativeHold) {
    points.push('No administrative, disciplinary, or library holds exist.');
  } else {
    points.push('An active administrative hold is flagged on the student record.');
  }

  // 4. Fees
  if (ruleResult.checks.feesCleared) {
    points.push('Tuition and institutional dues are cleared (₹0 balance).');
  } else {
    points.push(`Fee clearance check failed: outstanding balance of ₹${student.feesDue.toLocaleString('en-IN')} pending.`);
  }

  let title = '';
  let summary = '';
  let conclusion = '';

  if (ruleResult.decision === 'AUTO_APPROVE') {
    title = 'Eligible for Automated Processing';
    summary = 'All configured institutional criteria have been satisfied without requiring staff intervention.';
    points.push('According to institutional policy, document issuance is fully automated.');
    conclusion = 'Automated approval granted. Digital certificate and verification QR code generated.';
  } else if (ruleResult.decision === 'BLOCKED') {
    title = 'Processing Blocked: Inactive Enrollment';
    summary = 'Student enrollment status does not meet minimum policy requirements for official credential issuance.';
    conclusion = 'Request blocked. The student must resolve administrative enrollment standing before re-applying.';
  } else {
    title = `Review Required: ${ruleResult.route || 'Institutional'} Clearance Needed`;
    summary = `Institutional rule policy flagged an exception that requires human discretion before issuance.`;
    conclusion = `Routed to ${ruleResult.route} Department for staff evaluation.`;
  }

  return {
    title,
    summary,
    points,
    conclusion,
    generatedBy: 'CampusFlow Deterministic Rule Logic + AI Natural Language Engine'
  };
}

export function generateAdminDraft(request, student) {
  const route = request.route || 'ACCOUNTS';
  const issue = request.ruleEvaluation?.reasons?.[0] || 'Verification required';
  
  if (route === 'ACCOUNTS') {
    return {
      recipient: `${student.name} <${student.email}>`,
      subject: `CampusFlow Notice: Fee Clearance Required for Bonafide Request #${request.id}`,
      body: `Dear ${student.name},\n\nYour request for a Bonafide Certificate (#${request.id}) has been reviewed by the Institutional Registrar office.\n\nOur system detected an outstanding balance of ₹${student.feesDue?.toLocaleString('en-IN') || '0'} on your student portal.\n\nPlease submit proof of fee clearance to the Accounts Department or clear the balance online. Once verified, your certificate will be issued immediately.\n\nBest regards,\nAccounts & Registrar Department\nCampusFlow University`
    };
  } else if (route === 'ACADEMIC') {
    return {
      recipient: `${student.name} <${student.email}>`,
      subject: `CampusFlow Notice: Attendance Condonation for Bonafide Request #${request.id}`,
      body: `Dear ${student.name},\n\nYour Bonafide Certificate request (#${request.id}) requires academic review as your current attendance (${student.attendancePercentage}%) is below the mandatory 75% threshold.\n\nPlease obtain an attendance condonation letter from your Department Head to proceed.\n\nBest regards,\nOffice of Academic Affairs\nCampusFlow University`
    };
  } else {
    return {
      recipient: `${student.name} <${student.email}>`,
      subject: `CampusFlow Update: Document Request #${request.id}`,
      body: `Dear ${student.name},\n\nYour request #${request.id} for ${request.documentType} is under administrative review.\n\nStatus details: ${issue}.\n\nBest regards,\nCampusFlow Administration`
    };
  }
}
