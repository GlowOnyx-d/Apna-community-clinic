# Apna Community Health Clinic

A modern, empty-by-default community healthcare management web application built with **React 19**, **Vite**, and **Tailwind CSS**.

The application is **100% serverless** and operates with **zero external backend dependencies** — no Express server, no MongoDB database, and no Firebase cloud setup required. All appointments, doctors, patient records, and community health announcements are saved directly as real JSON files on your device using the browser's **File System Access API**.

---

## First-Run Experience & Initialization

Apna Clinic contains **no pre-loaded or mock seed data**. The database starts completely empty until real accounts and clinic resources are created:

1. **Connect Local Storage Folder**: On launch, the browser prompts you to select or create a local directory on your device (e.g. a folder named `local-data`).
2. **Initial Clinic Setup**: Because no users exist yet, the app displays the **"Set Up Your Clinic"** onboarding screen. Enter your administrator name, email, and password.
3. **Secure Password Hashing**: Passwords are encrypted directly in the browser using the **Web Crypto API** (`crypto.subtle`) with **PBKDF2** (100,000 iterations, SHA-256, and random 16-byte cryptographic salts). Passwords are never stored in plaintext.
4. **Register Specialists**: Log into the Admin Hub and navigate to **Doctor Management** to register clinic specialists and configure their consultation slots.
5. **Patient Registration & Queue**: Patients can register real accounts, choose from registered specialists, book appointments, and receive sequential digital token slips (`TK-01`, `TK-02`, etc.).

---

## Key Features

- **Direct Local JSON Storage**: Automatically writes and reads `users.json`, `doctors.json`, `appointments.json`, and `announcements.json` directly from a folder on your computer.
- **Persistent Access**: Directory handle access persists across browser restarts via IndexedDB caching.
- **Transparent Fallback**: Seamlessly falls back to browser `localStorage` if run in unsupported browsers (e.g. Firefox, Safari) or if folder access is skipped.
- **Real Password Verification**: Secure PBKDF2 hashing and constant-time byte verification for real authentication with zero backend servers.
- **Patient Portal**: Schedule appointments with registered specialists, track live token queues, and download printable token slips.
- **Doctor Portal**: Review assigned patient queues, record clinical diagnoses, and issue structured digital prescriptions.
- **Admin Hub**: Register clinic doctors, oversee the master appointments registry, and publish UN SDG 3 community health camp drives.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Application
```bash
npm run dev
```

Open the displayed URL (default: `http://localhost:5173`) in a modern browser (such as Chrome, Edge, Brave, or Opera).

---

## Local Data Files

When connected to a local folder, your clinic data is organized as formatted JSON files in `local-data/`:

- `users.json`: Registered administrators, doctors, and patients (with hashed passwords).
- `doctors.json`: Clinical specialists, cabin numbers, consultation slots, and weekly availability.
- `appointments.json`: Patient bookings, assigned sequential tokens, diagnoses, and prescriptions.
- `announcements.json`: Free public health camps, pediatric immunizations, and community health drives.

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the local Vite development server with HMR |
| `npm run build` | Bundles optimized production assets into `dist/` |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs the high-speed Oxlint linter across all source files |
