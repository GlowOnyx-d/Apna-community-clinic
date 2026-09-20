# Apna Community Health Clinic

A modern, real-time community healthcare management web application built with **React 19**, **Vite**, **Tailwind CSS**, **Firebase Authentication**, and **Google Cloud Firestore**.

The application is powered by a real-time, multi-device cloud architecture. All appointments, doctors, patient records, and community health announcements are synchronized live across clinic kiosks, doctor consultation cabins, admin desks, and patient mobile devices.

---

## First-Run Experience & Initialization

Apna Clinic connects directly to your secure Cloud Firestore database:

1. **Cloud Database Connection**: On launch, the application connects to Firebase and listens to live collections (`users`, `doctors`, `appointments`, `announcements`).
2. **Initial Clinic Setup**: If no administrator account exists, the app presents the **"Register Master Administrator"** onboarding screen to initialize the primary CMO account.
3. **Firebase Authentication**: User accounts (administrators, doctors, and patients) are authenticated securely through Firebase Auth with encrypted credentials.
4. **Register Specialists**: Log into the Admin Hub and navigate to **Doctor Management** to register clinic specialists, assign consultation cabins, and configure weekly slot limits.
5. **Patient Registration & Queue**: Patients register accounts, choose from active specialists, book appointments, and receive sequential digital token slips (`TK-01`, `TK-02`, etc.) with QR codes.
6. **Live Queue Display**: Wall-mounted TV displays at `/display` announce tokens in real time as doctors call patients into cabins.

---

## Key Features

- **Real-Time Cloud Firestore Sync**: Instant snapshot synchronization across reception desks, doctor cabins, waiting room TV kiosks, and patient phones.
- **Secure Firebase Authentication**: Role-based access control (Admin, Doctor, Patient) with session management and protected routes.
- **Clinic Data Backup & Disaster Recovery**: One-click JSON backup export and snapshot restore directly to and from Cloud Firestore.
- **Patient Portal**: Schedule appointments with registered specialists, track live token queues, and download printable token slips.
- **Doctor Portal**: Review assigned patient queues, call tokens, record clinical diagnoses, and issue structured digital prescriptions.
- **Admin Hub**: Register clinic doctors, oversee the master appointments registry, configure cabins, and publish UN SDG 3 community health camp drives.
- **Responsive & Accessible Design**: Crafted in light and brand-tailored dark modes with high WCAG contrast and smooth micro-animations.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase Environment Variables
Create a `.env` file in the project root with your Firebase project credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Run the Application
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Firestore Collections

Clinical data is structured in Cloud Firestore collections:

- `users`: Registered administrators, doctors, and patients with role metadata.
- `doctors`: Clinical specialists, cabin numbers, consultation slots, and weekly availability.
- `appointments`: Patient bookings, assigned sequential tokens, diagnoses, and prescriptions.
- `announcements`: Free public health camps, pediatric immunizations, and community health drives.

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the local Vite development server with HMR |
| `npm run build` | Bundles optimized production assets into `dist/` |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs the high-speed Oxlint linter across all source files |
