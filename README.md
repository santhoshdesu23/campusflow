# CampusFlow AI

> **Automate the routine. Explain the exception. Keep humans in control.**

CampusFlow AI is an intelligent college document workflow automation platform that transforms slow, error-prone manual document approvals into deterministic, transparent, and cryptographically verifiable workflows.

---

## 🏛️ Problem Statement

Colleges and universities process tens of thousands of student document requests manually every semester (e.g., Bonafide Certificates, No-Dues Clearances, NOCs).

Administrative staff must repeatedly cross-reference:
* Student enrollment standing (Active vs. Inactive)
* Outstanding fee balances across accounting ledgers
* Academic attendance thresholds (≥ 75%)
* Disciplinary, library, or administrative holds
* Request purpose and target organization

**The Pitfall**: Routine requests consume 80% of staff hours, while genuine edge cases and exceptions cause multi-week delays. Conversely, blindly automating with unconstrained LLMs is dangerous because AI hallucinations or prompt injections can incorrectly grant credentials to ineligible students.

---

## 💡 The CampusFlow Solution

**"Rules decide eligibility. AI understands and explains."**

CampusFlow AI separates natural language comprehension from institutional business logic:
1. **AI Underwriting & Intake**: Understands natural language requests, extracts structured parameters (document type, purpose, target company), and detects missing information.
2. **Deterministic Institutional Rule Engine**: Strictly server-side rules evaluate student records (attendance, dues, enrollment, holds) with 100% mathematical certainty. The LLM is never allowed to independently approve or override rules.
3. **Automated Issuance or Exception Routing**:
   * **Eligible requests**: Instantly approved, cryptographically signed, and issued with an official vector PDF and verification QR code in under 3 seconds.
   * **Exceptions (e.g., fee dues, attendance shortage)**: Automatically routed to the responsible department (Accounts, Academic Affairs, or Registrar) with an AI-generated explanation and drafted administrative memo.
   * **Ineligible requests (e.g., inactive status)**: Blocked at the policy gatekeeper level.
4. **Public Trust Registry**: Employers, visa officers, and universities scan the generated QR code to verify credential authenticity in real-time.

---

## 🚀 End-to-End Workflow Architecture

```
Student Natural Language Request
             │
             ▼
   [ AI Understanding ]
   • Document Type (Bonafide)
   • Purpose (e.g., Internship)
   • Organization (e.g., ABC Technologies)
             │
             ▼
   [ Student Record Retrieval ]
   • Enrollment, Fees, Attendance, Holds
             │
             ▼
   [ Deterministic Rule Engine ]
   ├── All Checks Passed? ────────► [ AUTO APPROVAL ] ──► [ PDF & QR Generation ] ──► [ Public Verification ]
   ├── Fees Due / Low Attendance? ─► [ EXCEPTION ROUTED ] ──► [ Department Queue ] ──► [ Admin Approval Modal ]
   └── Inactive Enrollment? ─────► [ BLOCKED ] ──► [ Contact Registrar Office ]
```

---

## ✨ Key Features

* **Linear / Stripe-Quality SaaS Interface**: Premium typography, clean whitespace, subtle micro-animations, tailored color palette (deep slate, navy, indigo, emerald), and collapsible navigation.
* **Dual Role Support**:
  * **Student Portal**: Natural language intake wizard, live 6-stage workflow timeline, eligibility breakdown matrix, certificate preview modal, and instant PDF download.
  * **Admin Operations Console**: Operations metrics, workflow efficiency distribution chart, high-priority exception triage queue, 3-column decision inspection console, department re-routing, and audit trail.
* **Deterministic Rule Engine**: Server-enforced eligibility matrix that guarantees institutional compliance.
* **Google Gemini AI Integration with Bulletproof Fallback**:
  * `parseStudentRequest()`: Natural language entity extraction.
  * `generateDecisionExplanation()`: Translates institutional rule results into human-readable transparent rationale.
  * `generateAdminDraft()`: Pre-populates administrative messages and follow-up emails.
  * `DEMO_MODE=true`: 100% reliable local fallback when offline or during hackathon presentations.
* **Vector-Quality PDF Engine**: Uses `pdf-lib` to render official university certificates with borders, institutional seal, registrar signature, and embedded QR code.
* **Cryptographic QR Verification**: Public portal (`/verify/:certificateId`) displaying authenticity state and SHA-256 verification hash.
* **Immutable Audit Trail**: Step-by-step chronological audit logs capturing every actor, event, and system action.

---

## 🛠️ Tech Stack

### Frontend
* **React.js 19** + **Vite 8**
* **Tailwind CSS v4** (Modern utility-first styling)
* **React Router v7** (Protected routes, role-based navigation)
* **Lucide React** (Consistent modern iconography)
* **Axios** (JWT interceptors & API client)
* **Recharts** (Workflow efficiency analytics)
* **Canvas Confetti** (Celebratory micro-interactions)

### Backend
* **Node.js** + **Express.js** (ES Modules)
* **JWT (JSON Web Tokens)** + **bcryptjs** (Secure authentication)
* **Zod** (Schema validation)
* **PDF-Lib** (Official vector PDF generation)
* **QRCode** (High-density QR code creation)
* **Google Gemini API** (Flash 1.5/2.0 API with offline semantic extractor)

---

## 👥 Pre-Configured Demo Accounts

CampusFlow includes 1-click demo personas on the login screen:

| Persona | Role | Email | Password | Scenario & Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **Rahul Kumar** | Student | `student@campusflow.demo` | `password123` | **Auto-Approval**: Active, Fees ₹0, Attendance 82% → Instant issuance |
| **Priya Sharma** | Student | `priya@campusflow.demo` | `password123` | **Fee Exception**: Active, Fees ₹8,500 due → Route to Accounts |
| **Arjun Reddy** | Student | `arjun@campusflow.demo` | `password123` | **Attendance Exception**: Active, Attendance 68% → Route to Academic |
| **Sneha Rao** | Student | `sneha@campusflow.demo` | `password123` | **Blocked**: Inactive enrollment → Blocked at policy gate |
| **Admin Officer** | Admin | `admin@campusflow.demo` | `admin123` | **Registrar Console**: Triage queue, override exceptions, view audit log |

---

## 🏁 Quickstart & Local Setup

### 1. Prerequisites
* **Node.js** v18+ (tested on Node v24)
* **npm** v9+

### 2. Installation
Clone the repository and install all dependencies:
```bash
# In the project root:
npm run install:all
```
Or install client and server packages individually:
```bash
cd client && npm install
cd ../server && npm install
```

### 3. Environment Variables
Create `.env` in the root or `server/` directory:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=campusflow_jwt_secure_secret_key_2026
GEMINI_API_KEY=
DEMO_MODE=true
MONGODB_URI=
```
*(If `GEMINI_API_KEY` is not provided or in `DEMO_MODE=true`, the built-in intelligent extractor executes seamlessly without external network dependencies).*

### 4. Running Locally
Run both backend server and frontend client concurrently:
```bash
# Start backend server (port 5000)
npm run dev:server

# Start frontend client (port 5173) in a second terminal
npm run dev:client
```
Alternatively, build the client bundle and let the server serve the entire full-stack app from a single port:
```bash
npm run build
npm start
# Visit http://localhost:5000
```

### 5. Running the Automated E2E Test Suite
Verify all 40 end-to-end integration test assertions:
```bash
node test-e2e.js
```

---

## 📡 API Reference

### Authentication
* `POST /api/auth/login` — Login with email/password; returns JWT and user profile.
* `GET /api/auth/me` — Retrieve current authenticated session.
* `GET /api/auth/demo-accounts` — List available test personas.

### AI Engine
* `POST /api/ai/parse-request` — Extract document type, purpose, organization, and missing fields from natural language text.

### Student Requests
* `POST /api/requests` — Submit request, trigger rule evaluation, and auto-issue or route.
* `GET /api/requests/student` — List all requests for the logged-in student.
* `GET /api/requests/:id` — Retrieve request timeline, eligibility checks, and certificate.

### Admin Operations
* `GET /api/admin/requests` — Query requests with search, status, and department filters.
* `GET /api/admin/requests/:id` — Deep 3-column decision inspection data with AI draft memo.
* `POST /api/admin/requests/:id/approve` — Approve exception, generate certificate, and record audit token.
* `POST /api/admin/requests/:id/reject` — Reject request with institutional notice.
* `POST /api/admin/requests/:id/route` — Re-route request to another department.
* `GET /api/admin/audit-logs` — Retrieve complete chronological audit trail.

### Certificates & Verification
* `GET /api/certificates/:id` — Get certificate metadata and QR code.
* `GET /api/certificates/:id/verify` — Public cryptographic verification endpoint.
* `GET /api/certificates/:id/download` — Stream high-resolution vector PDF certificate.

---

## 🎯 Primary Demo Walkthroughs

### Walkthrough 1: Automatic Processing (Happy Path)
1. Navigate to `/login` and click **Rahul (Student)**.
2. Click **Create New Request** and click **Internship Verification (ABC Tech)**.
3. Click **Analyze Request** to view the AI Understanding card (Purpose: Internship, Org: ABC Technologies).
4. Click **Submit Request & Run Rules**.
5. Watch the live 6-stage workflow timeline execute:
   * Request received → AI understood → Record retrieved → Rules evaluated → Approved → Certificate Generated.
6. Click **Preview** or **Download PDF** to inspect the official Bonafide Certificate with QR code.
7. Scan QR code or visit `/verify/CERT-2026-00124` to confirm **VERIFIED AUTHENTIC**.

### Walkthrough 2: Exception Handling & Administrative Approval
1. Use the persona switcher to log in as **Priya Sharma**.
2. Submit a request: system identifies an outstanding fee balance of ₹8,500.
3. Rule engine flags **REVIEW REQUIRED** and routes to **ACCOUNTS**.
4. Switch persona to **Admin Officer** and open request `CF-2026-00125`.
5. Review the 3-column layout:
   * **Left**: Priya's student record.
   * **Center**: AI understanding + rule failure on fee clearance + decision logic breakdown.
   * **Right**: Recommended Action: "Verify fee clearance before certificate issuance".
6. Click **Approve Exception**, enter an officer review note, and confirm.
7. System generates the signed certificate and updates the audit log.

### Walkthrough 3: Blocked Inactive Student
1. Log in as **Sneha Rao** (Inactive enrollment).
2. Submit a document request.
3. Rule engine deterministically returns **BLOCKED** with policy explanation.
4. No certificate is created, proving system reliability and preventing unauthorized issuance.

---

## 🔒 Security & Privacy

* **JWT Authentication**: Signed HTTP headers for all authenticated routes.
* **Role-Based Access Control (RBAC)**: Strict segregation between student and admin capabilities. Students cannot view or approve peer requests.
* **Input Validation**: Backend validation with Zod schemas.
* **Zero API Key Exposure**: The Gemini API key remains strictly on the server backend.
* **Cryptographic Verification**: Tamper-evident hash tokens verifying document authenticity.

---

## 🌟 Future Scope

* Multi-tenant university support with custom branding and logo uploads.
* Additional document workflows: No-Dues Clearance, Course Completion, Transcripts, and NOCs.
* Direct SIS/ERP webhooks (Banner, PeopleSoft, Canvas).
* Blockchain-anchored verifiable credentials (W3C standard).

---

## 📄 License

MIT License. Built with ❤️ for the Next-Generation Campus Workflow Revolution.
