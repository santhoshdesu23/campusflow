/**
 * Deterministic Rule Engine for CampusFlow AI.
 * 
 * CRITICAL ARCHITECTURAL PRINCIPLE:
 * "Rules decide eligibility. AI understands and explains."
 * 
 * The LLM NEVER independently determines eligibility or overrides these rules.
 */

export function evaluateBonafideRules(student) {
  if (!student) {
    throw new Error('Student record required for rule evaluation');
  }

  const checks = {
    activeEnrollment: student.enrollmentStatus === 'active',
    feesCleared: Number(student.feesDue) === 0,
    attendanceSufficient: Number(student.attendancePercentage) >= 75,
    noAdministrativeHold: student.administrativeHold === false || !student.administrativeHold
  };

  const resultsList = [
    {
      rule: 'Active Enrollment',
      passed: checks.activeEnrollment,
      value: student.enrollmentStatus,
      required: 'active',
      description: checks.activeEnrollment
        ? 'Student has an active, valid enrollment status.'
        : `Student enrollment is ${student.enrollmentStatus} (inactive). Automated processing blocked.`
    },
    {
      rule: 'Fees Cleared',
      passed: checks.feesCleared,
      value: `₹${student.feesDue.toLocaleString('en-IN')}`,
      required: '₹0 balance',
      description: checks.feesCleared
        ? 'All tuition and institutional dues are cleared.'
        : `Outstanding balance of ₹${student.feesDue.toLocaleString('en-IN')} pending clearance.`
    },
    {
      rule: 'Attendance ≥ 75%',
      passed: checks.attendanceSufficient,
      value: `${student.attendancePercentage}%`,
      required: '≥ 75%',
      description: checks.attendanceSufficient
        ? `Academic attendance is ${student.attendancePercentage}% (satisfies institutional minimum).`
        : `Attendance is ${student.attendancePercentage}% (below 75% institutional requirement).`
    },
    {
      rule: 'Administrative Hold',
      passed: checks.noAdministrativeHold,
      value: checks.noAdministrativeHold ? 'None' : 'Active Hold',
      required: 'None',
      description: checks.noAdministrativeHold
        ? 'No administrative, disciplinary, or library holds on record.'
        : 'Administrative hold present on student record.'
    }
  ];

  // 1. INACTIVE ENROLLMENT -> HARD BLOCKED
  if (!checks.activeEnrollment) {
    return {
      decision: 'BLOCKED',
      status: 'blocked',
      route: 'ADMINISTRATION',
      priority: 'High',
      checks,
      resultsList,
      reasons: [
        'Student enrollment status is inactive.',
        'Institutional policy strictly prohibits issuing credentials to inactive students.'
      ],
      recommendedAction: 'Contact the Registrar Office to resolve enrollment standing.',
      canAutoProcess: false
    };
  }

  // 2. ALL PASS -> AUTO APPROVE
  if (checks.feesCleared && checks.attendanceSufficient && checks.noAdministrativeHold) {
    return {
      decision: 'AUTO_APPROVE',
      status: 'approved',
      route: null,
      priority: 'Low',
      checks,
      resultsList,
      reasons: ['All configured institutional requirements have been satisfied.'],
      recommendedAction: 'Automated certificate generation and cryptographic QR signing.',
      canAutoProcess: true
    };
  }

  // 3. EXCEPTIONS -> HUMAN REVIEW REQUIRED
  const reasons = [];
  let route = 'ACCOUNTS';
  let priority = 'Medium';
  let recommendedAction = 'Verify exception with department before issuing certificate.';

  if (!checks.feesCleared) {
    reasons.push(`Outstanding fee balance of ₹${student.feesDue.toLocaleString('en-IN')} detected.`);
    route = 'ACCOUNTS';
    recommendedAction = 'Verify fee clearance or payment receipt before certificate issuance.';
  }

  if (!checks.attendanceSufficient) {
    reasons.push(`Attendance is ${student.attendancePercentage}% (minimum institutional threshold is 75%).`);
    // If fees are also due, we keep Accounts or Academic based on primary
    if (checks.feesCleared) {
      route = 'ACADEMIC';
      recommendedAction = 'Academic Dean approval or attendance condonation required.';
    }
  }

  if (!checks.noAdministrativeHold) {
    reasons.push('Administrative hold flagged on student account.');
    route = 'REGISTRAR';
    priority = 'High';
    recommendedAction = 'Administrative hold clearance required from Dean of Students.';
  }

  return {
    decision: 'REVIEW',
    status: 'pending_review',
    route,
    priority,
    checks,
    resultsList,
    reasons,
    recommendedAction,
    canAutoProcess: false
  };
}
