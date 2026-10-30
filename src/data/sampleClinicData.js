/**
 * Fresh Starter Dataset for Apna Community Health Clinic
 * Medically coherent specialists, active doctor consultation queues, triage vitals,
 * diagnostic visit histories, and SDG 3 community health camps.
 * Hydrates all dashboards: Admin, Patient, Doctor, Pharmacy, and Waiting Room Display.
 */

// Registered Firebase Auth UIDs for Demo Accounts
export const DEMO_DOCTOR_UID = "XmMYhNw57vcRWLcvTB0j9EeFydB3"; // rajesh.patel@communityclinic.org
export const DEMO_PATIENT_UID = "QyVYz4h08ndO5fPGMkM2q19yjDg1"; // maya.sharma@example.com

// Helper to compute dynamic ISO date strings relative to now
const now = new Date();
const todayStr = now.toISOString().split('T')[0];

export const getPastDateStr = (daysAgo) => {
  const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  return d.toISOString().split('T')[0];
};

export const getFutureDateStr = (daysAhead) => {
  const d = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  return d.toISOString().split('T')[0];
};

// --------------------------------------------------------------------------
// 1. CLINIC SPECIALIST DOCTORS (6 Key Community Specializations)
// --------------------------------------------------------------------------
export const SAMPLE_DOCTORS = [
  {
    id: DEMO_DOCTOR_UID,
    legacyId: "doc_rajesh_patel",
    name: "Dr. Rajesh Patel",
    email: "rajesh.patel@communityclinic.org",
    specialization: "Internal Medicine & Critical Care",
    qualification: "MBBS, MD (Internal Medicine), FICP",
    cabin: "Cabin 101 - Acute & Chronic Care Block",
    experience: "15+ years",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    availableSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"],
    maxPatientsPerSlot: 4,
    rating: 4.96,
    consultationFee: "Free (Community Health Funded)"
  },
  {
    id: "doc_sarah_jenkins",
    name: "Dr. Sarah Jenkins",
    email: "doctor.sarah@communityclinic.org",
    specialization: "General Medicine & Family Practice",
    qualification: "MBBS, MD (Family Medicine)",
    cabin: "Cabin 102 - Primary Care Block",
    experience: "12+ years",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    availableSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"],
    maxPatientsPerSlot: 4,
    rating: 4.92,
    consultationFee: "Free (Community Health Funded)"
  },
  {
    id: "doc_priya_nair",
    name: "Dr. Priya Nair",
    email: "doctor.priya@communityclinic.org",
    specialization: "Pediatrics & Child Health",
    qualification: "MBBS, DCH, MD (Pediatrics)",
    cabin: "Cabin 103 - Maternal & Child Block",
    experience: "10+ years",
    avatar: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=300&auto=format&fit=crop&q=80",
    availableDays: ["Monday", "Wednesday", "Friday", "Saturday"],
    availableSlots: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
    maxPatientsPerSlot: 3,
    rating: 5.0,
    consultationFee: "Free (Community Health Funded)"
  },
  {
    id: "doc_anita_sharma",
    name: "Dr. Anita Sharma",
    email: "doctor.anita@communityclinic.org",
    specialization: "Obstetrics & Women's Health",
    qualification: "MBBS, MS (OB/GYN), FICOG",
    cabin: "Cabin 104 - Women's Wellness Suite",
    experience: "13+ years",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
    availableDays: ["Monday", "Tuesday", "Thursday", "Saturday"],
    availableSlots: ["10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"],
    maxPatientsPerSlot: 4,
    rating: 4.94,
    consultationFee: "Free (Community Health Funded)"
  },
  {
    id: "doc_amitav_roy",
    name: "Dr. Amitav Roy",
    email: "doctor.amitav@communityclinic.org",
    specialization: "Community Dental Care & Oral Surgery",
    qualification: "BDS, MDS (Conservative Dentistry)",
    cabin: "Cabin 105 - Dental Suite",
    experience: "9+ years",
    avatar: "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=300&auto=format&fit=crop&q=80",
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    availableSlots: ["10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"],
    maxPatientsPerSlot: 3,
    rating: 4.88,
    consultationFee: "Free (Community Health Funded)"
  },
  {
    id: "doc_meera_iyer",
    name: "Dr. Meera Iyer",
    email: "doctor.meera@communityclinic.org",
    specialization: "Preventive Diagnostics & Community Pathology",
    qualification: "MBBS, DNB (Pathology)",
    cabin: "Cabin 106 - Diagnostics Block",
    experience: "11+ years",
    avatar: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=300&auto=format&fit=crop&q=80",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    availableSlots: ["08:30 AM", "09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM"],
    maxPatientsPerSlot: 5,
    rating: 4.95,
    consultationFee: "Free (Community Health Funded)"
  }
];

// --------------------------------------------------------------------------
// 2. SDG 3 COMMUNITY HEALTH CAMPS (Upcoming & Dynamic Dates)
// --------------------------------------------------------------------------
export const SAMPLE_ANNOUNCEMENTS = [
  {
    id: "ann_sdg_1",
    title: "Free Hypertension, Diabetes & Cardiac Risk Screening Camp",
    category: "health_camp",
    description: "Comprehensive blood pressure checkups, random blood glucose testing, automated ECG screening, BMI calculation, and nutritional consultation for community residents. Free essential medications and diet charts distributed.",
    sdgTags: [
      "SDG 3: Good Health & Well-being",
      "Target 3.4: Non-Communicable Diseases",
      "Target 3.8: Universal Health"
    ],
    date: getFutureDateStr(3),
    location: "Apna Community Health Center - Hall A, Sector 4",
    targetGroup: "Adults & Seniors (30+ years)",
    organizer: "Apna Community Outreach & Diagnostics Unit",
    registeredCount: 46,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: "ann_sdg_2",
    title: "Maternal Wellness, Nutrition & Infant Immunization Mega Drive",
    category: "vaccination",
    description: "Routine childhood vaccinations (Measles, Polio, MMR, DTP), maternal iron & folic acid supplementation, prenatal ultrasound consultations, and pediatric growth milestone monitoring.",
    sdgTags: [
      "SDG 3: Good Health & Well-being",
      "SDG 5: Gender Equality",
      "Target 3.2: Child Mortality"
    ],
    date: getFutureDateStr(7),
    location: "East Wing Maternal & Child Welfare Center, Room 102",
    targetGroup: "Expectant Mothers & Children (0-5 years)",
    organizer: "Pediatric & Maternal Health Division",
    registeredCount: 34,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: "ann_sdg_3",
    title: "Community Vision, Glaucoma & Eye Health Outreach",
    category: "awareness",
    description: "Free refractive visual acuity testing, cataract screening, intraocular pressure measurement, and zero-cost distribution of reading glasses for underprivileged community elders.",
    sdgTags: [
      "SDG 3: Good Health & Well-being",
      "SDG 10: Reduced Inequalities"
    ],
    date: getFutureDateStr(14),
    location: "Public Library Community Auditorium, Main Bazaar Road",
    targetGroup: "Open to All Residents (Priority for 55+)",
    organizer: "Apna Mobile Health Care Mission",
    registeredCount: 52,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: "ann_sdg_4",
    title: "Geriatric Bone Health & Arthritis Screening Camp",
    category: "health_camp",
    description: "Bone mineral density (BMD) ultrasound screening, joint mobility evaluations, calcium & Vitamin D3 distribution, and guided physical therapy sessions for senior community members.",
    sdgTags: [
      "SDG 3: Good Health & Well-being",
      "Target 3.8: Universal Health"
    ],
    date: getFutureDateStr(21),
    location: "Senior Citizens Welfare Hall, Block C Community Complex",
    targetGroup: "Senior Citizens (60+ years)",
    organizer: "Internal Medicine & Physical Rehab Wing",
    registeredCount: 29,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString()
  }
];

// --------------------------------------------------------------------------
// 3. APPOINTMENTS DATASET (Today Active Queues + Full 7-Day Volume)
// --------------------------------------------------------------------------
export const getSampleAppointments = () => {
  const currentDate = new Date();
  const currentTodayStr = currentDate.toISOString().split('T')[0];

  return [
    // =========================================================================
    // DR. RAJESH PATEL (Internal Medicine) - Demo Doctor Dashboard
    // =========================================================================

    // Token TK-01 (Today - Demo Patient Maya Sharma Waiting)
    {
      id: "apt_patel_1",
      patientId: DEMO_PATIENT_UID,
      patientName: "Maya Sharma",
      patientEmail: "maya.sharma@example.com",
      patientPhone: "+91 98765 01234",
      patientAge: 29,
      patientGender: "Female",
      doctorId: DEMO_DOCTOR_UID,
      doctorName: "Dr. Rajesh Patel",
      doctorEmail: "rajesh.patel@communityclinic.org",
      specialization: "Internal Medicine & Critical Care",
      date: currentTodayStr,
      time: "09:00 AM",
      status: "pending",
      tokenNumber: "TK-01",
      reason: "Persistent dry cough, mild seasonal pyrexia, and fatigue for 3 days",
      vitals: {
        bp: "118/76 mmHg",
        bpSystolic: "118",
        bpDiastolic: "76",
        pulse: "76 bpm",
        temperature: "99.0 °F",
        spo2: "99%",
        bloodSugar: "94 mg/dL",
        weight: "58 kg",
        notes: "Patient alert, normotensive. Mild pharyngeal hyperemia noted at nurse triage.",
        hasAlert: false
      },
      notes: "",
      diagnosis: "",
      prescription: "",
      createdAt: new Date(currentDate.getTime() - 3.5 * 3600000).toISOString()
    },

    // Token TK-02 (Today - Hypertension Follow-up)
    {
      id: "apt_patel_2",
      patientId: "usr_patient_rajesh",
      patientName: "Rajesh Kumar",
      patientEmail: "rajesh.kumar@example.org",
      patientPhone: "+91 98111 22334",
      patientAge: 49,
      patientGender: "Male",
      doctorId: DEMO_DOCTOR_UID,
      doctorName: "Dr. Rajesh Patel",
      doctorEmail: "rajesh.patel@communityclinic.org",
      specialization: "Internal Medicine & Critical Care",
      date: currentTodayStr,
      time: "10:00 AM",
      status: "pending",
      tokenNumber: "TK-02",
      reason: "Routine Stage 1 Essential Hypertension follow-up; morning occipital headache",
      vitals: {
        bp: "142/92 mmHg",
        bpSystolic: "142",
        bpDiastolic: "92",
        pulse: "82 bpm",
        temperature: "98.4 °F",
        spo2: "98%",
        bloodSugar: "114 mg/dL",
        weight: "78 kg",
        notes: "Elevated systolic & diastolic pressure recorded. Advised 10-minute rest before re-check.",
        hasAlert: true
      },
      notes: "",
      diagnosis: "",
      prescription: "",
      createdAt: new Date(currentDate.getTime() - 3 * 3600000).toISOString()
    },

    // Token TK-03 (Today - Type 2 Diabetes Review)
    {
      id: "apt_patel_3",
      patientId: "usr_patient_sunita",
      patientName: "Sunita Verma",
      patientEmail: "sunita.verma@example.org",
      patientPhone: "+91 98222 33445",
      patientAge: 53,
      patientGender: "Female",
      doctorId: DEMO_DOCTOR_UID,
      doctorName: "Dr. Rajesh Patel",
      doctorEmail: "rajesh.patel@communityclinic.org",
      specialization: "Internal Medicine & Critical Care",
      date: currentTodayStr,
      time: "11:00 AM",
      status: "pending",
      tokenNumber: "TK-03",
      reason: "Type 2 Diabetes quarterly routine review & fasting glucose evaluation",
      vitals: {
        bp: "128/82 mmHg",
        bpSystolic: "128",
        bpDiastolic: "82",
        pulse: "74 bpm",
        temperature: "98.6 °F",
        spo2: "99%",
        bloodSugar: "146 mg/dL",
        weight: "66 kg",
        notes: "Fasting glucose elevated. Patient compliant with daily oral metformin regimen.",
        hasAlert: false
      },
      notes: "",
      diagnosis: "",
      prescription: "",
      createdAt: new Date(currentDate.getTime() - 2 * 3600000).toISOString()
    },

    // Token TK-04 (Today - GERD & Acid Reflux)
    {
      id: "apt_patel_4",
      patientId: "usr_patient_amit",
      patientName: "Amit Gupta",
      patientEmail: "amit.gupta@example.org",
      patientPhone: "+91 98555 66778",
      patientAge: 36,
      patientGender: "Male",
      doctorId: DEMO_DOCTOR_UID,
      doctorName: "Dr. Rajesh Patel",
      doctorEmail: "rajesh.patel@communityclinic.org",
      specialization: "Internal Medicine & Critical Care",
      date: currentTodayStr,
      time: "02:00 PM",
      status: "pending",
      tokenNumber: "TK-04",
      reason: "Epigastric retrosternal burning sensation and acid regurgitation post meals",
      vitals: {
        bp: "120/78 mmHg",
        bpSystolic: "120",
        bpDiastolic: "78",
        pulse: "76 bpm",
        temperature: "98.6 °F",
        spo2: "99%",
        bloodSugar: "94 mg/dL",
        weight: "72 kg",
        notes: "Mild epigastric tenderness. No abdominal guarding or rebound sign.",
        hasAlert: false
      },
      notes: "",
      diagnosis: "",
      prescription: "",
      createdAt: new Date(currentDate.getTime() - 1.5 * 3600000).toISOString()
    },

    // Token TK-05 (Today - Chronic Knee Joint Pain)
    {
      id: "apt_patel_5",
      patientId: "usr_patient_vikram",
      patientName: "Vikram Malhotra",
      patientEmail: "vikram.malhotra@example.org",
      patientPhone: "+91 98777 88990",
      patientAge: 44,
      patientGender: "Male",
      doctorId: DEMO_DOCTOR_UID,
      doctorName: "Dr. Rajesh Patel",
      doctorEmail: "rajesh.patel@communityclinic.org",
      specialization: "Internal Medicine & Critical Care",
      date: currentTodayStr,
      time: "03:00 PM",
      status: "pending",
      tokenNumber: "TK-05",
      reason: "Bilateral knee joint crepitus, stiffness after prolonged sitting",
      vitals: {
        bp: "126/80 mmHg",
        bpSystolic: "126",
        bpDiastolic: "80",
        pulse: "72 bpm",
        temperature: "98.4 °F",
        spo2: "99%",
        weight: "79 kg",
        notes: "Stable ambulatory vitals.",
        hasAlert: false
      },
      notes: "",
      diagnosis: "",
      prescription: "",
      createdAt: new Date(currentDate.getTime() - 1 * 3600000).toISOString()
    },

    // Completed Today with Prescription (Pending at Pharmacy Counter)
    {
      id: "apt_patel_done_1",
      patientId: "usr_patient_harish",
      patientName: "Harish Chandra",
      patientEmail: "harish.chandra@example.org",
      patientPhone: "+91 98666 77889",
      patientAge: 62,
      patientGender: "Male",
      patientAvatar: "/patients/harish_chandra.jpg",
      doctorId: DEMO_DOCTOR_UID,
      doctorName: "Dr. Rajesh Patel",
      doctorEmail: "rajesh.patel@communityclinic.org",
      specialization: "Internal Medicine & Critical Care",
      date: currentTodayStr,
      time: "08:30 AM",
      status: "done",
      tokenNumber: "TK-06",
      reason: "Bilateral knee joint stiffness and chronic osteoarthritic ache",
      notes: "Joint effusion minimal. Normal active range of motion. Advised low-impact daily walks.",
      diagnosis: "Bilateral Knee Primary Osteoarthritis (Grade II)",
      prescription: "1. Tab Paracetamol 650mg TDS PRN after meals x 5 days\n2. Tab Glucosamine Sulfate 500mg OD x 60 days\n3. Gentle quadriceps isometric strengthening exercises twice daily",
      dispensaryStatus: "pending", // Waiting for verification in Pharmacy Desk
      vitals: {
        bp: "130/84 mmHg",
        bpSystolic: "130",
        bpDiastolic: "84",
        pulse: "72 bpm",
        temperature: "98.4 °F",
        spo2: "98%",
        bloodSugar: "106 mg/dL",
        weight: "75 kg",
        notes: "Pre-consultation baseline vitals within normal geriatric limits.",
        hasAlert: false
      },
      completedAt: new Date(currentDate.getTime() - 4 * 3600000).toISOString(),
      createdAt: new Date(currentDate.getTime() - 5 * 3600000).toISOString()
    },

    // Past Visit 2 Days Ago (Maya Sharma - Dispensed at Pharmacy)
    {
      id: "apt_patel_done_2",
      patientId: DEMO_PATIENT_UID,
      patientName: "Maya Sharma",
      patientEmail: "maya.sharma@example.com",
      patientPhone: "+91 98765 01234",
      patientAge: 29,
      patientGender: "Female",
      doctorId: DEMO_DOCTOR_UID,
      doctorName: "Dr. Rajesh Patel",
      doctorEmail: "rajesh.patel@communityclinic.org",
      specialization: "Internal Medicine & Critical Care",
      date: getPastDateStr(2),
      time: "10:30 AM",
      status: "done",
      tokenNumber: "TK-02",
      reason: "Generalized fatigue, lightheadedness on standing, low stamina",
      notes: "Serum ferritin low at 13 ng/mL. Hb 10.4 g/dL. No active bleeding. Tolerating oral iron.",
      diagnosis: "Microcytic Hypochromic Anemia (Nutritional Iron Deficiency)",
      prescription: "1. Tab Iron & Folic Acid OD HS x 60 days\n2. Tab Vitamin C 500mg OD with breakfast x 30 days\n3. High iron dietary intake (spinach, beetroot, lentils)\n4. Repeat CBC in 8 weeks",
      dispensaryStatus: "dispensed",
      dispensedAt: new Date(currentDate.getTime() - 2 * 86400000 + 3600000).toISOString(),
      vitals: {
        bp: "114/74 mmHg",
        pulse: "76 bpm",
        temperature: "98.6 °F",
        spo2: "99%",
        weight: "57 kg",
        notes: "Mild pallor observed.",
        hasAlert: false
      },
      completedAt: new Date(currentDate.getTime() - 2 * 86400000).toISOString(),
      createdAt: new Date(currentDate.getTime() - 2 * 86400000 - 3600000).toISOString()
    },

    // Past Visit 5 Days Ago (Maya Sharma - Dispensed at Pharmacy)
    {
      id: "apt_patel_done_3",
      patientId: DEMO_PATIENT_UID,
      patientName: "Maya Sharma",
      patientEmail: "maya.sharma@example.com",
      patientPhone: "+91 98765 01234",
      patientAge: 29,
      patientGender: "Female",
      doctorId: DEMO_DOCTOR_UID,
      doctorName: "Dr. Rajesh Patel",
      doctorEmail: "rajesh.patel@communityclinic.org",
      specialization: "Internal Medicine & Critical Care",
      date: getPastDateStr(5),
      time: "11:30 AM",
      status: "done",
      tokenNumber: "TK-03",
      reason: "Acute viral nasopharyngitis, facial fullness, and sneezing",
      notes: "Inferior nasal turbinates congested. Chest auscultation clear. Responding well to steam inhalation.",
      diagnosis: "Acute Viral Nasopharyngitis & Allergic Rhinitis",
      prescription: "1. Tab Paracetamol 500mg TDS x 3 days\n2. Syrup Levocetirizine 2.5ml OD at bedtime x 5 days\n3. Normal Saline Nasal Drops 2 drops per nostril TDS x 5 days",
      dispensaryStatus: "dispensed",
      dispensedAt: new Date(currentDate.getTime() - 5 * 86400000 + 4000000).toISOString(),
      vitals: {
        bp: "122/78 mmHg",
        pulse: "76 bpm",
        temperature: "98.8 °F",
        spo2: "98%",
        weight: "57 kg",
        notes: "Vitals stable.",
        hasAlert: false
      },
      completedAt: new Date(currentDate.getTime() - 5 * 86400000).toISOString(),
      createdAt: new Date(currentDate.getTime() - 5 * 86400000 - 3600000).toISOString()
    },

    // =========================================================================
    // DR. SARAH JENKINS (General Medicine & Family Practice)
    // =========================================================================

    // Token TK-01 (Today - Ananya Bose)
    {
      id: "apt_sarah_1",
      patientId: "usr_patient_ananya",
      patientName: "Ananya Bose",
      patientEmail: "ananya.bose@example.org",
      patientPhone: "+91 98888 11223",
      patientAge: 24,
      patientGender: "Female",
      doctorId: "doc_sarah_jenkins",
      doctorName: "Dr. Sarah Jenkins",
      doctorEmail: "doctor.sarah@communityclinic.org",
      specialization: "General Medicine & Family Practice",
      date: currentTodayStr,
      time: "09:00 AM",
      status: "pending",
      tokenNumber: "TK-01",
      reason: "Unilateral throbbing hemicranial headache with nausea and light sensitivity",
      vitals: {
        bp: "112/74 mmHg",
        bpSystolic: "112",
        bpDiastolic: "74",
        pulse: "80 bpm",
        temperature: "98.4 °F",
        spo2: "99%",
        bloodSugar: "88 mg/dL",
        weight: "53 kg",
        notes: "Photophobia noted during intake. Patient resting in triage quiet room.",
        hasAlert: false
      },
      notes: "",
      diagnosis: "",
      prescription: "",
      createdAt: new Date(currentDate.getTime() - 3 * 3600000).toISOString()
    },

    // Token TK-02 (Today - Ramesh Patel)
    {
      id: "apt_sarah_2",
      patientId: "usr_patient_ramesh",
      patientName: "Ramesh Patel",
      patientEmail: "ramesh.patel@example.org",
      patientPhone: "+91 98999 22334",
      patientAge: 56,
      patientGender: "Male",
      doctorId: "doc_sarah_jenkins",
      doctorName: "Dr. Sarah Jenkins",
      doctorEmail: "doctor.sarah@communityclinic.org",
      specialization: "General Medicine & Family Practice",
      date: currentTodayStr,
      time: "10:00 AM",
      status: "pending",
      tokenNumber: "TK-02",
      reason: "Mechanical lower back strain radiating to buttocks after lifting heavy crate",
      vitals: {
        bp: "132/86 mmHg",
        bpSystolic: "132",
        bpDiastolic: "86",
        pulse: "76 bpm",
        temperature: "98.6 °F",
        spo2: "98%",
        weight: "81 kg",
        notes: "Paraspinal lumbar muscle spasm palpated.",
        hasAlert: false
      },
      notes: "",
      diagnosis: "",
      prescription: "",
      createdAt: new Date(currentDate.getTime() - 2 * 3600000).toISOString()
    },

    // Completed Today with Prescription (Pending at Pharmacy Counter)
    {
      id: "apt_sarah_done_1",
      patientId: "usr_patient_suresh",
      patientName: "Suresh Raina",
      patientEmail: "suresh.raina@example.org",
      patientPhone: "+91 98333 11224",
      patientAge: 42,
      patientGender: "Male",
      doctorId: "doc_sarah_jenkins",
      doctorName: "Dr. Sarah Jenkins",
      doctorEmail: "doctor.sarah@communityclinic.org",
      specialization: "General Medicine & Family Practice",
      date: currentTodayStr,
      time: "08:30 AM",
      status: "done",
      tokenNumber: "TK-03",
      reason: "Occipital tension headache and neck stiffness from desk ergonomics",
      notes: "Full neurological screening unremarkable. Advised periodic display pauses.",
      diagnosis: "Postural Cervical Muscle Strain & Episodic Tension Headache",
      prescription: "1. Tab Ibuprofen 400mg BD PC x 3 days\n2. Tab Pantoprazole 40mg OD before breakfast x 3 days\n3. Ergonomic neck stretch & warm compress",
      dispensaryStatus: "pending", // Waiting for verification in Pharmacy Desk
      vitals: {
        bp: "122/80 mmHg",
        pulse: "74 bpm",
        temperature: "98.6 °F",
        spo2: "99%",
        weight: "75 kg",
        notes: "Normotensive.",
        hasAlert: false
      },
      completedAt: new Date(currentDate.getTime() - 4 * 3600000).toISOString(),
      createdAt: new Date(currentDate.getTime() - 5 * 3600000).toISOString()
    },

    // Past Visit 1 Day Ago (Completed & Dispensed)
    {
      id: "apt_sarah_done_2",
      patientId: "usr_patient_deepa",
      patientName: "Deepa Nair",
      patientEmail: "deepa.nair@example.org",
      patientPhone: "+91 98122 33445",
      patientAge: 38,
      patientGender: "Female",
      doctorId: "doc_sarah_jenkins",
      doctorName: "Dr. Sarah Jenkins",
      doctorEmail: "doctor.sarah@communityclinic.org",
      specialization: "General Medicine & Family Practice",
      date: getPastDateStr(1),
      time: "11:00 AM",
      status: "done",
      tokenNumber: "TK-04",
      reason: "Acute exudative pharyngitis, odynophagia, and cervical lymphadenopathy",
      notes: "Bilateral tonsillar pillars mildly swollen. No respiratory distress.",
      diagnosis: "Acute Bacterial Streptococcal Pharyngotonsillitis",
      prescription: "1. Cap Amoxicillin 500mg TDS x 5 days\n2. Tab Paracetamol 650mg TDS SOS\n3. Warm saline gargles thrice daily",
      dispensaryStatus: "dispensed",
      dispensedAt: new Date(currentDate.getTime() - 1 * 86400000 + 3600000).toISOString(),
      vitals: {
        bp: "118/76 mmHg",
        pulse: "82 bpm",
        temperature: "100.2 °F",
        spo2: "99%",
        weight: "63 kg",
        notes: "Pyrexia noted.",
        hasAlert: false
      },
      completedAt: new Date(currentDate.getTime() - 1 * 86400000).toISOString(),
      createdAt: new Date(currentDate.getTime() - 1 * 86400000 - 3600000).toISOString()
    },

    // =========================================================================
    // DR. PRIYA NAIR (Pediatrics & Child Health)
    // =========================================================================

    // Token TK-01 (Today - Aarav Patel)
    {
      id: "apt_priya_1",
      patientId: "usr_patient_aarav",
      patientName: "Aarav Patel",
      patientEmail: "sunita.patel@example.com",
      patientPhone: "+91 98333 44556",
      patientAge: 4,
      patientGender: "Male",
      doctorId: "doc_priya_nair",
      doctorName: "Dr. Priya Nair",
      doctorEmail: "doctor.priya@communityclinic.org",
      specialization: "Pediatrics & Child Health",
      date: currentTodayStr,
      time: "09:30 AM",
      status: "pending",
      tokenNumber: "TK-01",
      reason: "Routine milestone checkup and MMR booster vaccine consultation",
      vitals: {
        pulse: "96 bpm",
        temperature: "98.6 °F",
        spo2: "100%",
        weight: "16.4 kg",
        notes: "Child alert, active, playful. Developmental milestones age-appropriate.",
        hasAlert: false
      },
      notes: "",
      diagnosis: "",
      prescription: "",
      createdAt: new Date(currentDate.getTime() - 2.5 * 3600000).toISOString()
    },

    // Token TK-02 (Today - Vihaan Singhania)
    {
      id: "apt_priya_2",
      patientId: "usr_patient_vihaan",
      patientName: "Vihaan Singhania",
      patientEmail: "singhania.priya@example.com",
      patientPhone: "+91 98444 88990",
      patientAge: 2,
      patientGender: "Male",
      doctorId: "doc_priya_nair",
      doctorName: "Dr. Priya Nair",
      doctorEmail: "doctor.priya@communityclinic.org",
      specialization: "Pediatrics & Child Health",
      date: currentTodayStr,
      time: "10:30 AM",
      status: "pending",
      tokenNumber: "TK-02",
      reason: "Acute watery diarrheal episodes (3 times), mild irritability",
      vitals: {
        pulse: "108 bpm",
        temperature: "99.2 °F",
        spo2: "99%",
        weight: "12.1 kg",
        notes: "Mild signs of dehydration. Skin turgor prompt. Oral rehydration initiated.",
        hasAlert: true
      },
      notes: "",
      diagnosis: "",
      prescription: "",
      createdAt: new Date(currentDate.getTime() - 2 * 3600000).toISOString()
    },

    // Completed Today with Prescription (Pending at Pharmacy Counter)
    {
      id: "apt_priya_done_1",
      patientId: "usr_patient_riya",
      patientName: "Riya Sen",
      patientEmail: "riya.sen@example.com",
      patientPhone: "+91 98444 33221",
      patientAge: 6,
      patientGender: "Female",
      patientAvatar: "/patients/riya_sen.jpg",
      doctorId: "doc_priya_nair",
      doctorName: "Dr. Priya Nair",
      doctorEmail: "doctor.priya@communityclinic.org",
      specialization: "Pediatrics & Child Health",
      date: currentTodayStr,
      time: "08:45 AM",
      status: "done",
      tokenNumber: "TK-03",
      reason: "Nighttime dry barking cough and itchy watery eyes",
      notes: "Bilateral chest auscultation clear. No wheezing or rhonchi. Throat mildly injected.",
      diagnosis: "Pediatric Allergic Rhinitis & Seasonal Bronchial Hyperreactivity",
      prescription: "1. Syrup Levocetirizine 2.5ml OD at bedtime x 5 days\n2. Normal Saline Nasal Drops 2 drops per nostril PRN\n3. ORS WHO Formula sachets - 1 sachet in 1 liter clean water PRN",
      dispensaryStatus: "pending", // Waiting for verification in Pharmacy Desk
      vitals: {
        pulse: "92 bpm",
        temperature: "98.4 °F",
        spo2: "99%",
        weight: "19.5 kg",
        notes: "Afebrile, cheerful child.",
        hasAlert: false
      },
      completedAt: new Date(currentDate.getTime() - 4 * 3600000).toISOString(),
      createdAt: new Date(currentDate.getTime() - 5 * 3600000).toISOString()
    },

    // Past Visit 3 Days Ago (Completed & Dispensed)
    {
      id: "apt_priya_done_2",
      patientId: "usr_patient_kabir",
      patientName: "Kabir Mehra",
      patientEmail: "mehra.family@example.com",
      patientPhone: "+91 98123 77889",
      patientAge: 8,
      patientGender: "Male",
      doctorId: "doc_priya_nair",
      doctorName: "Dr. Priya Nair",
      doctorEmail: "doctor.priya@communityclinic.org",
      specialization: "Pediatrics & Child Health",
      date: getPastDateStr(3),
      time: "02:30 PM",
      status: "done",
      tokenNumber: "TK-02",
      reason: "Acute productive bronchitis, chest mucus congestion, and mild cough",
      notes: "Coarse bilateral rhonchi on deep inspiration. Hydration emphasized.",
      diagnosis: "Acute Pediatric Tracheobronchitis",
      prescription: "1. Cough Relief Expectorant 5ml TDS x 5 days\n2. Tab Paracetamol 250mg PRN for fever > 100°F\n3. Warm fluid intake encouraged",
      dispensaryStatus: "dispensed",
      dispensedAt: new Date(currentDate.getTime() - 3 * 86400000 + 3600000).toISOString(),
      vitals: {
        pulse: "88 bpm",
        temperature: "99.1 °F",
        spo2: "98%",
        weight: "24.0 kg",
        notes: "Alert and conversational.",
        hasAlert: false
      },
      completedAt: new Date(currentDate.getTime() - 3 * 86400000).toISOString(),
      createdAt: new Date(currentDate.getTime() - 3 * 86400000 - 3600000).toISOString()
    },

    // =========================================================================
    // DR. ANITA SHARMA (Obstetrics & Women's Health - Cabin 104)
    // =========================================================================

    // Token TK-01 (Today - Pooja Deshmukh)
    {
      id: "apt_anita_1",
      patientId: "usr_patient_pooja",
      patientName: "Pooja Deshmukh",
      patientEmail: "pooja.deshmukh@example.org",
      patientPhone: "+91 98222 77889",
      patientAge: 27,
      patientGender: "Female",
      doctorId: "doc_anita_sharma",
      doctorName: "Dr. Anita Sharma",
      doctorEmail: "doctor.anita@communityclinic.org",
      specialization: "Obstetrics & Women's Health",
      date: currentTodayStr,
      time: "10:00 AM",
      status: "pending",
      tokenNumber: "TK-01",
      reason: "Second trimester routine antenatal review (24 weeks) & blood pressure screen",
      vitals: {
        bp: "116/72 mmHg",
        bpSystolic: "116",
        bpDiastolic: "72",
        pulse: "78 bpm",
        temperature: "98.4 °F",
        spo2: "99%",
        weight: "62 kg",
        notes: "Fundal height corresponds to gestational age. Fetal heart rate audible and regular at 144 bpm.",
        hasAlert: false
      },
      notes: "",
      diagnosis: "",
      prescription: "",
      createdAt: new Date(currentDate.getTime() - 2.5 * 3600000).toISOString()
    },

    // Past Visit 4 Days Ago (Completed & Dispensed)
    {
      id: "apt_anita_done_1",
      patientId: "usr_patient_neha",
      patientName: "Neha Gupta",
      patientEmail: "neha.gupta@example.org",
      patientPhone: "+91 98333 55667",
      patientAge: 31,
      patientGender: "Female",
      doctorId: "doc_anita_sharma",
      doctorName: "Dr. Anita Sharma",
      doctorEmail: "doctor.anita@communityclinic.org",
      specialization: "Obstetrics & Women's Health",
      date: getPastDateStr(4),
      time: "11:00 AM",
      status: "done",
      tokenNumber: "TK-01",
      reason: "Antenatal screening: mild dizziness and pallor noted on routine trimester review",
      notes: "Hemoglobin at 10.2 g/dL. Blood group O+ve. Prescribed oral iron and calcium supplementation.",
      diagnosis: "Mild Gestational Iron Deficiency Anemia (28 Weeks Gravida)",
      prescription: "1. Tab Iron & Folic Acid OD PC x 90 days\n2. Tab Calcium Carbonate + Vitamin D3 OD with dinner x 90 days\n3. High protein & green leafy vegetable dietary counseling",
      dispensaryStatus: "dispensed",
      dispensedAt: new Date(currentDate.getTime() - 4 * 86400000 + 4000000).toISOString(),
      vitals: {
        bp: "112/70 mmHg",
        pulse: "80 bpm",
        temperature: "98.6 °F",
        spo2: "99%",
        weight: "64 kg",
        notes: "Normotensive antenatal baseline.",
        hasAlert: false
      },
      completedAt: new Date(currentDate.getTime() - 4 * 86400000).toISOString(),
      createdAt: new Date(currentDate.getTime() - 4 * 86400000 - 3600000).toISOString()
    },

    // =========================================================================
    // DR. AMITAV ROY (Community Dental Care - Cabin 105)
    // =========================================================================
    {
      id: "apt_amitav_done_1",
      patientId: "usr_patient_kavita",
      patientName: "Kavita Sen",
      patientEmail: "kavita.sen@example.com",
      patientPhone: "+91 98444 55667",
      patientAge: 34,
      patientGender: "Female",
      doctorId: "doc_amitav_roy",
      doctorName: "Dr. Amitav Roy",
      doctorEmail: "doctor.amitav@communityclinic.org",
      specialization: "Community Dental Care & Oral Surgery",
      date: getPastDateStr(5),
      time: "10:00 AM",
      status: "done",
      tokenNumber: "TK-01",
      reason: "Lower molar sensitivity to cold liquids and mild plaque buildup",
      notes: "Superficial enamel wear on tooth 36. Ultrasonic scaling and polishing performed.",
      diagnosis: "Mild Dentin Hypersensitivity with Localized Marginal Gingivitis",
      prescription: "1. Potassium Nitrate Desensitizing Toothpaste - Twice daily gentle brushing\n2. Chlorhexidine Mouthwash 0.2% - Rinse 10ml BD for 7 days\n3. Soft ultra-fine bristle toothbrush recommended",
      dispensaryStatus: "dispensed",
      dispensedAt: new Date(currentDate.getTime() - 5 * 86400000 + 3600000).toISOString(),
      vitals: {
        bp: "120/78 mmHg",
        pulse: "74 bpm",
        weight: "61 kg",
        notes: "Pre-dental screening normal.",
        hasAlert: false
      },
      completedAt: new Date(currentDate.getTime() - 5 * 86400000).toISOString(),
      createdAt: new Date(currentDate.getTime() - 5 * 86400000 - 3600000).toISOString()
    },

    // =========================================================================
    // DR. MEERA IYER (Preventive Diagnostics & Screening - Cabin 106)
    // =========================================================================
    {
      id: "apt_meera_done_1",
      patientId: DEMO_PATIENT_UID,
      patientName: "Maya Sharma",
      patientEmail: "maya.sharma@example.com",
      patientPhone: "+91 98765 01234",
      patientAge: 29,
      patientGender: "Female",
      doctorId: "doc_meera_iyer",
      doctorName: "Dr. Meera Iyer",
      doctorEmail: "doctor.meera@communityclinic.org",
      specialization: "Preventive Diagnostics & Community Pathology",
      date: getPastDateStr(6),
      time: "09:30 AM",
      status: "done",
      tokenNumber: "TK-02",
      reason: "Annual preventive lipid panel, fasting blood sugar, and CBC routine screening",
      notes: "Hemoglobin: 12.8 g/dL, Fasting glucose: 92 mg/dL. Total cholesterol: 178 mg/dL. Normal baseline.",
      diagnosis: "Comprehensive Preventive Health Checkup - Normotensive",
      prescription: "1. Tab Multivitamin with Zinc - 1 tablet OD after breakfast x 30 days\n2. Maintain active physical exercise 30 mins daily\n3. Review annual screening next year",
      dispensaryStatus: "dispensed",
      dispensedAt: new Date(currentDate.getTime() - 6 * 86400000 + 4000000).toISOString(),
      vitals: {
        bp: "118/76 mmHg",
        pulse: "72 bpm",
        temperature: "98.6 °F",
        spo2: "99%",
        bloodSugar: "92 mg/dL",
        weight: "58 kg",
        notes: "All baseline diagnostic parameters within healthy limits.",
        hasAlert: false
      },
      completedAt: new Date(currentDate.getTime() - 6 * 86400000).toISOString(),
      createdAt: new Date(currentDate.getTime() - 6 * 86400000 - 3600000).toISOString()
    }
  ];
};

// --------------------------------------------------------------------------
// 4. DIAGNOSTIC LAB REPORTS (Dynamic Dates with Clinical Indicators)
// --------------------------------------------------------------------------
export const SAMPLE_LAB_REPORTS = [
  {
    id: "rep_maya_fbs_1",
    patientId: DEMO_PATIENT_UID,
    patientName: "Maya Sharma",
    patientEmail: "maya.sharma@example.com",
    testName: "Fasting Blood Sugar & HbA1c Glycemic Panel",
    category: "Diabetes & Metabolism",
    testDate: getPastDateStr(2),
    labName: "Apna Community Diagnostic Center (SDG 3 Pathology)",
    status: "Normal",
    keyMetrics: [
      { param: "Fasting Plasma Glucose", value: "94 mg/dL", reference: "70 - 99 mg/dL", status: "Optimal" },
      { param: "Glycated Hemoglobin (HbA1c)", value: "5.4%", reference: "< 5.7%", status: "Optimal" },
      { param: "Average Estimated Blood Glucose", value: "108 mg/dL", reference: "< 117 mg/dL", status: "Optimal" }
    ],
    summary: "Glycemic indices within normal healthy range. No indication of insulin resistance.",
    notes: "Fasting 10 hours prior to sample collection. Sample verified by pathologist Dr. Meera Iyer.",
    doctorReviewStatus: "Reviewed & Cleared",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: "rep_maya_cbc_1",
    patientId: DEMO_PATIENT_UID,
    patientName: "Maya Sharma",
    patientEmail: "maya.sharma@example.com",
    testName: "Complete Blood Count (CBC) with Automated 5-Part Diff",
    category: "Hematology",
    testDate: getPastDateStr(5),
    labName: "Apna Community Diagnostic Center (SDG 3 Pathology)",
    status: "Normal",
    keyMetrics: [
      { param: "Hemoglobin (Hb)", value: "13.4 g/dL", reference: "12.0 - 15.5 g/dL", status: "Optimal" },
      { param: "Total Leucocyte Count (WBC)", value: "6,900 /uL", reference: "4,000 - 11,000 /uL", status: "Optimal" },
      { param: "Platelet Count", value: "255,000 /uL", reference: "150,000 - 450,000 /uL", status: "Optimal" },
      { param: "Erythrocyte Sed Rate (ESR)", value: "11 mm/hr", reference: "< 20 mm/hr", status: "Optimal" }
    ],
    summary: "Normal red and white cell morphology. Platelet count adequate. Anemia resolved.",
    notes: "Automated hematology analyzer verified by Dr. Meera Iyer.",
    doctorReviewStatus: "Reviewed & Cleared",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: "rep_maya_lipid_1",
    patientId: DEMO_PATIENT_UID,
    patientName: "Maya Sharma",
    patientEmail: "maya.sharma@example.com",
    testName: "Comprehensive Lipid & Cardiovascular Risk Profile",
    category: "Cardiovascular Health",
    testDate: getPastDateStr(12),
    labName: "Apna Community Diagnostic Center (SDG 3 Pathology)",
    status: "Borderline",
    keyMetrics: [
      { param: "Total Cholesterol", value: "194 mg/dL", reference: "< 200 mg/dL", status: "Desirable" },
      { param: "Triglycerides", value: "156 mg/dL", reference: "< 150 mg/dL", status: "Borderline High" },
      { param: "HDL Cholesterol (Good)", value: "56 mg/dL", reference: "> 50 mg/dL", status: "Protective" },
      { param: "LDL Cholesterol (Calculated)", value: "107 mg/dL", reference: "< 100 mg/dL", status: "Borderline" }
    ],
    summary: "Mild triglyceride elevation. Advised reduction in dietary refined carbohydrates and brisk walking.",
    notes: "Recommended re-testing in 6 months following dietary adjustments.",
    doctorReviewStatus: "Doctor Advised Diet Changes",
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString()
  },
  {
    id: "rep_maya_kft_1",
    patientId: DEMO_PATIENT_UID,
    patientName: "Maya Sharma",
    patientEmail: "maya.sharma@example.com",
    testName: "Kidney Function & Serum Electrolytes Panel (KFT)",
    category: "Nephrology & Renal",
    testDate: getPastDateStr(20),
    labName: "Apna Community Diagnostic Center (SDG 3 Pathology)",
    status: "Normal",
    keyMetrics: [
      { param: "Serum Creatinine", value: "0.82 mg/dL", reference: "0.55 - 1.02 mg/dL", status: "Optimal" },
      { param: "Blood Urea Nitrogen (BUN)", value: "13 mg/dL", reference: "7 - 20 mg/dL", status: "Optimal" },
      { param: "Estimated GFR (eGFR)", value: "> 90 mL/min", reference: "> 90 mL/min", status: "Optimal" },
      { param: "Serum Sodium (Na+)", value: "140 mEq/L", reference: "135 - 145 mEq/L", status: "Optimal" },
      { param: "Serum Potassium (K+)", value: "4.2 mEq/L", reference: "3.5 - 5.0 mEq/L", status: "Optimal" }
    ],
    summary: "Renal clearance and electrolyte balance within normal physiologic limits.",
    notes: "Verified by clinical biochemist.",
    doctorReviewStatus: "Reviewed & Cleared",
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
  },
  {
    id: "rep_ramesh_hba1c_1",
    patientId: "usr_patient_ramesh",
    patientName: "Ramesh Kumar",
    patientEmail: "ramesh.kumar@example.com",
    testName: "Quarterly Diabetic Control HbA1c Panel",
    category: "Diabetes & Metabolism",
    testDate: getPastDateStr(4),
    labName: "Apna Community Diagnostic Center (SDG 3 Pathology)",
    status: "Alert",
    keyMetrics: [
      { param: "HbA1c Glycated Hemoglobin", value: "8.3%", reference: "< 7.0% (Diabetic Target)", status: "Uncontrolled" },
      { param: "Fasting Blood Glucose", value: "168 mg/dL", reference: "80 - 130 mg/dL", status: "Elevated" },
      { param: "Post-Prandial Glucose (2hr)", value: "234 mg/dL", reference: "< 180 mg/dL", status: "Elevated" }
    ],
    summary: "Sub-optimal glycemic control. Requires oral hypoglycemic medication titration by Dr. Rajesh Patel.",
    notes: "Priority consultation scheduled for medication dose adjustment.",
    doctorReviewStatus: "Medication Adjustment Needed",
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: "rep_sunita_thyroid_1",
    patientId: "usr_patient_sunita",
    patientName: "Sunita Devi",
    patientEmail: "sunita.devi@example.com",
    testName: "Thyroid Stimulating Hormone (TSH) & Free T4 Screen",
    category: "Endocrinology",
    testDate: getPastDateStr(3),
    labName: "Apna Community Diagnostic Center (SDG 3 Pathology)",
    status: "Borderline",
    keyMetrics: [
      { param: "Ultrasensitive TSH", value: "5.75 uIU/mL", reference: "0.45 - 4.50 uIU/mL", status: "Mild Hypothyroid" },
      { param: "Free Thyroxine (FT4)", value: "1.12 ng/dL", reference: "0.82 - 1.77 ng/dL", status: "Normal" }
    ],
    summary: "Subclinical hypothyroidism pattern with preserved peripheral thyroid hormone levels.",
    notes: "Clinical review with primary care physician recommended.",
    doctorReviewStatus: "Reviewed",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
  }
];

// --------------------------------------------------------------------------
// 5. ESSENTIAL PHARMACY MEDICINE INVENTORY (17 Core Generic Formulations)
// --------------------------------------------------------------------------
export const SAMPLE_PHARMACY_STOCK = [
  { id: "med_1", name: "Paracetamol 650mg / 500mg", generic: "Acetaminophen", form: "Tablets", category: "Antipyretic / Analgesic", stock: 1250, unit: "tabs", minAlert: 200, status: "Good", batch: "PCT-2026-08", expiry: "2028-11" },
  { id: "med_2", name: "Amoxicillin 500mg", generic: "Amoxicillin Trihydrate", form: "Capsules", category: "Broad-Spectrum Antibiotic", stock: 680, unit: "caps", minAlert: 150, status: "Good", batch: "AMX-2026-05", expiry: "2028-04" },
  { id: "med_3", name: "Metformin 500mg", generic: "Metformin Hydrochloride", form: "Tablets", category: "Antidiabetic (Type 2)", stock: 890, unit: "tabs", minAlert: 200, status: "Good", batch: "MET-2026-09", expiry: "2028-09" },
  { id: "med_4", name: "ORS WHO Formula", generic: "Oral Rehydration Salts", form: "Sachets", category: "Hydration Therapy", stock: 450, unit: "sachets", minAlert: 100, status: "Good", batch: "ORS-2026-03", expiry: "2028-06" },
  { id: "med_5", name: "Syrup Levocetirizine 2.5ml", generic: "Levocetirizine Dihydrochloride", form: "Syrup 60ml", category: "Pediatric Antihistamine", stock: 12, unit: "bottles", minAlert: 30, status: "Low Stock", batch: "LCT-2026-07", expiry: "2028-01" },
  { id: "med_6", name: "Pantoprazole 40mg", generic: "Pantoprazole Sodium", form: "Tablets", category: "Proton Pump Inhibitor / Antacid", stock: 540, unit: "tabs", minAlert: 100, status: "Good", batch: "PAN-2026-10", expiry: "2028-12" },
  { id: "med_7", name: "Normal Saline Nasal Drops", generic: "0.9% Sodium Chloride", form: "Drops 15ml", category: "Pediatric Decongestant", stock: 8, unit: "bottles", minAlert: 20, status: "Low Stock", batch: "NSD-2026-03", expiry: "2027-12" },
  { id: "med_8", name: "Tab Glucosamine Sulfate 500mg", generic: "Glucosamine Sulfate Potassium", form: "Tablets", category: "Joint Care / Osteoarthritis", stock: 140, unit: "tabs", minAlert: 50, status: "Good", batch: "GLU-2026-04", expiry: "2028-05" },
  { id: "med_9", name: "Tab Ibuprofen 400mg", generic: "Ibuprofen NSAID", form: "Tablets", category: "Anti-Inflammatory Analgesic", stock: 320, unit: "tabs", minAlert: 80, status: "Good", batch: "IBU-2026-09", expiry: "2028-08" },
  { id: "med_10", name: "Salbutamol 100mcg Inhaler", generic: "Salbutamol MDI", form: "MDI Inhaler", category: "Bronchodilator (Asthma/COPD)", stock: 15, unit: "canisters", minAlert: 25, status: "Low Stock", batch: "SLB-2026-01", expiry: "2028-03" },
  { id: "med_11", name: "Iron & Folic Acid", generic: "Ferrous Ascorbate + Folic Acid", form: "Tablets", category: "Maternal & Anemia Care", stock: 950, unit: "tabs", minAlert: 150, status: "Good", batch: "IFA-2026-04", expiry: "2028-10" },
  { id: "med_12", name: "Calcium + Vitamin D3", generic: "Calcium Carbonate 500mg + D3", form: "Tablets", category: "Bone Health & Antenatal", stock: 620, unit: "tabs", minAlert: 100, status: "Good", batch: "CAL-2026-06", expiry: "2028-11" },
  { id: "med_13", name: "Cough Relief Expectorant", generic: "Ambroxol + Guaifenesin Syrup", form: "Syrup 100ml", category: "Respiratory Relief", stock: 110, unit: "bottles", minAlert: 30, status: "Good", batch: "CGH-2026-06", expiry: "2028-07" },
  { id: "med_14", name: "Amlodipine 5mg", generic: "Amlodipine Besylate", form: "Tablets", category: "Antihypertensive (Calcium Blocker)", stock: 520, unit: "tabs", minAlert: 100, status: "Good", batch: "AML-2026-02", expiry: "2028-12" },
  { id: "med_15", name: "Telmisartan 40mg", generic: "Telmisartan", form: "Tablets", category: "Antihypertensive (ARB)", stock: 410, unit: "tabs", minAlert: 80, status: "Good", batch: "TLM-2026-04", expiry: "2029-01" },
  { id: "med_16", name: "Azithromycin 500mg", generic: "Azithromycin Dihydrate", form: "Tablets", category: "Macrolide Antibiotic", stock: 290, unit: "tabs", minAlert: 60, status: "Good", batch: "AZM-2026-08", expiry: "2028-06" },
  { id: "med_17", name: "Povidone Iodine 5% Ointment", generic: "Povidone Iodine Antiseptic", form: "Ointment 20g", category: "Topical Antiseptic / Wound Care", stock: 95, unit: "tubes", minAlert: 25, status: "Good", batch: "PVD-2026-03", expiry: "2028-10" }
];
