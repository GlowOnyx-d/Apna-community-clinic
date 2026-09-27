# Apna Community Health Clinic 🏥

A modern, real-time community healthcare management platform built for primary health centers and charitable clinics. Aligned with **UN Sustainable Development Goal 3 (Good Health & Well-Being)**, the platform streamlines outpatient care, specialty doctor queues, digital prescriptions, pharmacy dispensing, and community health camps.

Built with **React 19**, **Vite**, **Tailwind CSS**, **Firebase Authentication**, **Cloud Firestore**, and **Node.js / Nodemailer**.

---

## 🌟 Key Features

### 1. Digital Queue & Smart Token System
- **Sequential Token Generation**: Guarantees unique, sequential token numbers (`TK-01`, `TK-02`...) per doctor consultation queue.
- **Official Digital Token Slip**: Interactive slip with QR triage verification, cabin directions, slot timings, and arrival instructions.
- **Multi-Channel Token Delivery**:
  - **Direct Email Receipt**: Instant rich HTML receipt sent directly to the patient's inbox via zero-cost Gmail SMTP.
  - **Print & PDF Download**: Exportable vector PDF token slip generated client-side via `jsPDF` and `qrcode`.
- **Live Waiting Room TV Display (`/display`)**: Wall-mounted OPD queue screen that announces tokens with synthesized audio chimes as specialists call patients.

### 2. Community Pharmacy & Medicine Dispensary (`/pharmacy`)
- **Prescription Verification Checklist**: Pharmacists verify every prescribed item with an interactive checklist before confirming dispensary release.
- **Prevent Accidental Dispensing**: Strict validation locks the "Mark as Dispensed" action until all prescribed items are verified.
- **Automated Pickup Email Notifications**: 1-click email dispatch to patients when essential medications are packed and ready at Dispensary Counter 2.
- **Thermal Label Printing**: Print formatted medication labels with patient name, doctor, and dosage frequency instructions.
- **Inventory & Stock Management**: Real-time tracking of essential generic medicines with 1-click restock operations.

### 3. Pre-Consultation Nurse Triage & Vitals
- Record baseline physiological indicators prior to doctor consultation: Blood Pressure, Pulse Rate, Temperature, SpO2 (Oxygen Saturation), Weight, Height, and automated BMI classification.
- Vitals sync live to the doctor's consultation desk to assist clinical assessment.

### 4. Doctor Consultation Desk (`/doctor`)
- **Live Queue Management**: View waiting patients in real time, call next token, or mark completed.
- **Clinical Records**: Review patient vitals, diagnosis history, and previous visits.
- **Structured Digital Prescriptions**: Formulate standardized drug regimens, dosage frequencies, and duration.

### 5. Community Health Camps & SDG 3 Drives (`/admin/announcements` & Patient Portal)
- **Camp Administration**: Admins can create and edit active health camps without deleting existing drives.
- **Community RSVP Tracker**: Live registration counters visible across Admin, Doctor, and Patient views to gauge community turnout.
- **Patient Registration**: 1-click RSVP for specialized camps (e.g., pediatric immunization, diabetes screening, vision checkups).

### 6. Admin Control Hub & Staff Management (`/admin`)
- **Specialist Management**: Onboard doctors, assign consultation cabins, and configure daily slot capacities.
- **Staff Provisioning**: Provision and manage clinic staff accounts with credentials dispatched directly via email.
- **Appointments Master**: Centralized registry for all clinic consultations with filtering by date, doctor, and status.
- **Disaster Recovery & Backups**: 1-click export of the entire clinic database to JSON, and instant cloud snapshot restoration.

### 7. Dual Language Support
- Full bilingual localization in **English** and **Hindi (हिन्दी)** with persistent language preferences.

---

##  Quick Start Guide

### 1. Prerequisites
- **Node.js** v18 or higher
- **npm** v9 or higher

### 2. Installation
```bash
git clone https://github.com/your-username/Apna-community-clinic.git
cd Apna-community-clinic
npm install
```

### 3. Configure Frontend Environment (`.env`)
Create a `.env` file in the root directory (refer to [`.env.example`](file:///c:/Users/Admin/Downloads/Community%20service/.env.example)):
```env
# Optional: Set to true for demo preview mode without Firebase credentials
VITE_DEMO_MODE=true

# Firebase Project Credentials (Required for Live Multi-Device Sync)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Configure Zero-Cost Email Gateway (`functions/.env.local`)
To enable real email dispatch for token slips, pharmacy notifications, and staff credentials:
1. Copy [`functions/.env.example`](file:///c:/Users/Admin/Downloads/Community%20service/functions/.env.example) to `functions/.env.local` *(git-ignored)*:
   ```bash
   cp functions/.env.example functions/.env.local
   ```
2. Enter your Gmail address and a 16-character **Google App Password**:
   ```env
   EMAIL_USER=yourclinic@gmail.com
   EMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
   ```
   > **Note:** Generate your 16-character Google App Password in 30 seconds at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) (requires 2-Step Verification enabled on your Google account).

### 5. Start the Development Server
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs the local Vite development server with HMR and local Email API proxy |
| `npm run build` | Compiles optimized production bundle into `dist/` |
| `npm run preview` | Serves production build locally for verification |
| `npm run lint` | Runs high-speed Oxlint linter across all source files |
| `npm run functions:serve` | Starts local Firebase Cloud Functions emulator |
| `npm run functions:deploy` | Deploys production Cloud Functions to Firebase |

---

## 📁 Project Architecture

```
Community service/
├── functions/                     # Firebase Cloud Functions (Node.js)
│   ├── index.js                   # Cloud Function email gateway (sendClinicEmail)
│   ├── .env.example               # Template for email credentials
│   └── .env.local                 # Local secrets (git-ignored)
├── src/
│   ├── components/
│   │   ├── common/                # Navbar, Footer, QRCode, ThemeToggle, HealthCampCard
│   │   ├── patient/               # BookAppointmentModal, TokenSlipModal, VitalsModal
│   │   └── doctor/                # PrescriptionModal, DiagnosisHistory
│   ├── context/
│   │   ├── AuthContext.jsx        # Role-based auth (Admin, Doctor, Patient)
│   │   ├── DataContext.jsx        # Cloud Firestore sync & optimistic state
│   │   └── LanguageContext.jsx    # English & Hindi i18n
│   ├── pages/
│   │   ├── LandingPage.jsx        # Public clinic homepage & instant token booking
│   │   ├── patient/               # PatientDashboard, MyAppointments, CommunityAnnouncements
│   │   ├── doctor/                # DoctorDashboard, PatientRecords
│   │   ├── admin/                 # AdminDashboard, AppointmentsMaster, DoctorManagement
│   │   ├── pharmacy/              # PharmacyDesk (Dispensary verification & stock)
│   │   └── display/               # LiveQueueDisplay (Waiting Room TV Kiosk)
│   ├── services/
│   │   └── emailService.js        # Gmail SMTP client & rich HTML receipt generators
│   └── vite.config.js             # Vite dev server + /api/sendEmail proxy middleware
```

---

## Security & Privacy

- **Credentials Safety**: Email credentials and API secrets are strictly loaded through `functions/.env.local` or Google Secret Manager and are excluded from version control via `.gitignore`.
- **Role-Based Routing**: Strict route guards isolate Patient, Doctor, Pharmacist, and Admin views.
- **HIPAA & Local Compliance**: Token slips and waiting room displays mask sensitive personal identifiers.

---

## License
This project is open-source under the [MIT License](LICENSE). Contributions dedicated to UN Sustainable Development Goal 3 are welcome!
