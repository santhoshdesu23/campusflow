// Automated End-to-End Test Suite for CampusFlow AI
const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Starting CampusFlow AI Comprehensive E2E Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // TEST 1: Healthcheck
    console.log('Test 1: System Health Check');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    assert(health.status === 'ok', 'Server is healthy and responding');
    assert(health.service === 'CampusFlow AI Platform', 'Service name matches');

    // TEST 2: Demo Accounts
    console.log('\nTest 2: Demo Accounts Lookup');
    const demoRes = await fetch(`${BASE_URL}/auth/demo-accounts`);
    const demo = await demoRes.json();
    assert(demo.success === true, 'Demo accounts endpoint succeeded');
    assert(demo.accounts.length === 5, 'Found 5 pre-configured demo personas');

    // TEST 3: Scenario 1 - Auto Approval (Aarav Sharma - NIAT2026AI001)
    console.log('\nTest 3: Scenario 1 — Auto-Approval Flow (NIAT2026AI001)');
    const loginStudent1 = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'NIAT2026AI001@gmail.com', password: 'Campus@123' })
    });
    const stu1Auth = await loginStudent1.json();
    assert(stu1Auth.success === true, 'Aarav Sharma logged in successfully');
    assert(stu1Auth.student.studentId === 'NIAT2026AI001', 'Linked to Student ID NIAT2026AI001');
    assert(stu1Auth.student.attendancePercentage >= 75, 'Attendance is >= 75%');
    assert(stu1Auth.student.feesDue === 0, 'Fees balance is ₹0');
    assert(stu1Auth.student.administrativeHold === false, 'No administrative hold');

    // AI Request Parsing
    const aiParseRes = await fetch(`${BASE_URL}/ai/parse-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${stu1Auth.token}`
      },
      body: JSON.stringify({
        prompt: 'I need proof that I am currently studying here for my internship at ABC Technologies.'
      })
    });
    const aiParsed = await aiParseRes.json();
    assert(aiParsed.success === true, 'AI request parser succeeded');
    assert(aiParsed.data.purpose === 'Internship', 'AI identified purpose as Internship');
    assert(aiParsed.data.organization === 'ABC Technologies', 'AI extracted organization as ABC Technologies');
    assert(aiParsed.data.requiredInfoDetected === true, 'AI marked required information as detected');

    // Submit Request (Student NIAT2026AI001)
    const createReqRes = await fetch(`${BASE_URL}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${stu1Auth.token}`
      },
      body: JSON.stringify({
        prompt: 'I need proof that I am currently studying here for my internship at ABC Technologies.',
        documentType: 'Bonafide Certificate',
        purpose: 'Internship',
        organization: 'ABC Technologies'
      })
    });
    const newReq = await createReqRes.json();
    assert(newReq.success === true, 'Request created in database');
    assert(newReq.data.decision === 'AUTO_APPROVE', 'Deterministic rule engine decided: AUTO_APPROVE');
    assert(newReq.data.status === 'approved', 'Status automatically set to approved');
    assert(newReq.data.ruleEvaluation.checks.activeEnrollment === true, 'Active enrollment rule check passed');
    assert(newReq.data.ruleEvaluation.checks.feesCleared === true, 'Fees cleared rule check passed');
    assert(newReq.data.ruleEvaluation.checks.attendanceSufficient === true, 'Attendance >= 75% rule check passed');
    assert(newReq.data.ruleEvaluation.checks.noAdministrativeHold === true, 'No hold rule check passed');
    assert(Boolean(newReq.data.certificateId), `Generated Certificate ID: ${newReq.data.certificateId}`);

    // TEST 4: Certificate PDF Download and QR Verification
    console.log('\nTest 4: PDF Generation and QR Verification');
    const certId = newReq.data.certificateId;
    const certVerifyRes = await fetch(`${BASE_URL}/certificates/${certId}/verify`);
    const certVerify = await certVerifyRes.json();
    assert(certVerify.success === true, 'Public verification API returned 200');
    assert(certVerify.verified === true, 'Certificate verified as authentic');
    assert(certVerify.data.studentName === 'Aarav Sharma', 'Verified student name matches');
    assert(certVerify.data.status === 'Valid', 'Verified status is Valid');

    const pdfRes = await fetch(`${BASE_URL}/certificates/${certId}/download`);
    assert(pdfRes.status === 200, 'PDF download endpoint returned 200 OK');
    assert(pdfRes.headers.get('content-type') === 'application/pdf', 'Content-Type is application/pdf');
    const pdfBuffer = await pdfRes.arrayBuffer();
    assert(pdfBuffer.byteLength > 1000, `PDF generated successfully (${pdfBuffer.byteLength} bytes)`);

    // TEST 5: Scenario 2 - Fee Exception (Tanmay Trivedi - NIAT2026AI031)
    console.log('\nTest 5: Scenario 2 — Fee Exception Flow (NIAT2026AI031)');
    const loginFeeStu = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'NIAT2026AI031@gmail.com', password: 'Campus@123' })
    });
    const feeAuth = await loginFeeStu.json();
    assert(feeAuth.student.feesDue === 8500, 'Student has outstanding balance of ₹8,500');

    const feeReqRes = await fetch(`${BASE_URL}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${feeAuth.token}`
      },
      body: JSON.stringify({
        prompt: 'Please provide a bonafide letter for my internship at ABC Technologies.'
      })
    });
    const feeReq = await feeReqRes.json();
    assert(feeReq.data.decision === 'REVIEW', 'Rule engine decided: REVIEW');
    assert(feeReq.data.route === 'ACCOUNTS', 'Exception routed to ACCOUNTS department');
    assert(feeReq.data.ruleEvaluation.checks.feesCleared === false, 'Fees check correctly failed');
    assert(feeReq.data.status === 'pending_review', 'Status set to pending_review');

    // Admin Flow - Admin Approves Fee Exception
    const loginAdmin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@campusflow.com', password: 'Admin@123' })
    });
    const adminAuth = await loginAdmin.json();
    assert(adminAuth.user.role === 'admin', 'Admin logged in');

    const approveRes = await fetch(`${BASE_URL}/admin/requests/${feeReq.data.id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAuth.token}`
      },
      body: JSON.stringify({ note: 'Fee clearance receipt manually validated by Accounts Registrar.' })
    });
    const approveData = await approveRes.json();
    assert(approveData.success === true, 'Admin exception approval succeeded');
    assert(approveData.data.status === 'approved', 'Request status updated to approved');
    assert(Boolean(approveData.data.certificate), 'Certificate generated for approved exception');

    // TEST 6: Scenario 3 - Attendance Exception (Vivaan Nanda - NIAT2026AI039)
    console.log('\nTest 6: Scenario 3 — Attendance Shortage Exception (NIAT2026AI039)');
    const loginAttStu = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'NIAT2026AI039@gmail.com', password: 'Campus@123' })
    });
    const attAuth = await loginAttStu.json();
    assert(attAuth.student.attendancePercentage === 68, 'Student attendance is 68% (< 75%)');

    const attReqRes = await fetch(`${BASE_URL}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${attAuth.token}`
      },
      body: JSON.stringify({
        prompt: 'I need an official bonafide letter for my industrial training project.'
      })
    });
    const attReq = await attReqRes.json();
    assert(attReq.data.decision === 'REVIEW', 'Rule engine decided: REVIEW');
    assert(attReq.data.route === 'ACADEMIC', 'Exception routed to ACADEMIC department');
    assert(attReq.data.ruleEvaluation.checks.attendanceSufficient === false, 'Attendance check correctly failed');
    assert(attReq.data.status === 'pending_review', 'Status set to pending_review');

    // TEST 7: Scenario 4 - Administrative Hold (Gayathri Swaminathan - NIAT2026AI045)
    console.log('\nTest 7: Scenario 4 — Administrative Hold (NIAT2026AI045)');
    const loginHoldStu = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'NIAT2026AI045@gmail.com', password: 'Campus@123' })
    });
    const holdAuth = await loginHoldStu.json();
    assert(holdAuth.student.administrativeHold === true, 'Student has administrative hold active');

    const holdReqRes = await fetch(`${BASE_URL}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${holdAuth.token}`
      },
      body: JSON.stringify({
        prompt: 'Requesting bonafide certificate for passport renewal.'
      })
    });
    const holdReq = await holdReqRes.json();
    assert(holdReq.data.decision === 'REVIEW', 'Rule engine decided: REVIEW');
    assert(holdReq.data.route === 'REGISTRAR', 'Exception routed to REGISTRAR department');
    assert(holdReq.data.ruleEvaluation.checks.noAdministrativeHold === false, 'Administrative hold check correctly failed');
    assert(holdReq.data.status === 'pending_review', 'Status set to pending_review');

    // TEST 8: Scenario 5 - Inactive Enrollment Blocked (Madhavan Natarajan - NIAT2026AI050)
    console.log('\nTest 8: Scenario 5 — Inactive Enrollment Blocked (NIAT2026AI050)');
    const loginInactiveStu = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'NIAT2026AI050@gmail.com', password: 'Campus@123' })
    });
    const inactiveAuth = await loginInactiveStu.json();
    assert(inactiveAuth.student.enrollmentStatus === 'inactive', 'Student enrollment is inactive');

    const inactiveReqRes = await fetch(`${BASE_URL}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${inactiveAuth.token}`
      },
      body: JSON.stringify({
        prompt: 'I need a bonafide certificate for competitive coding hackathon.'
      })
    });
    const inactiveReq = await inactiveReqRes.json();
    assert(inactiveReq.data.decision === 'BLOCKED', 'Rule engine decided: BLOCKED');
    assert(inactiveReq.data.status === 'blocked', 'Request status is blocked');
    assert(inactiveReq.data.certificateId === null, 'No certificate generated for blocked request');

    // TEST 9: Audit Trail Completeness
    console.log('\nTest 9: Audit Trail Completeness');
    const auditRes = await fetch(`${BASE_URL}/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` }
    });
    const auditData = await auditRes.json();
    assert(auditData.success === true, 'Fetched complete audit logs');
    assert(auditData.data.length > 5, `Audit trail contains ${auditData.data.length} chronological log events`);

    console.log('\n====================================================');
    console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test execution error:', err);
    process.exit(1);
  }
}

runTests();
