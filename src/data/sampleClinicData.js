/**
 * Default Starter Dataset for Apna Community Health Clinic
 * Medically coherent specialists, active doctor consultation queues, triage vitals,
 * diagnostic visit histories, and SDG 3 community health camps.
 * Hydrates all 3 dashboards: Admin, Patient, and Doctor.
 */

// Registered Firebase Auth UIDs for Demo Accounts
export const DEMO_DOCTOR_UID = "XmMYhNw57vcRWLcvTB0j9EeFydB3"; // rajesh.patel@communityclinic.org
export const DEMO_PATIENT_UID = "QyVYz4h08ndO5fPGMkM2q19yjDg1"; // maya.sharma@example.com

export const SAMPLE_DOCTORS = [
  {
    id: DEMO_DOCTOR_UID,
    legacyId: "doc_rajesh_patel",
    name: "Dr. Rajesh Patel",
    email: "rajesh.patel@communityclinic.org",
    specialization: "Internal Medicine & Critical Care",
    qualification: "MBBS, MD (Internal Medicine), FICP",
    cabin: "Cabin 101 - Acute & Chronic Care Block",
    experience: "14+ years",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    availableSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"],
    maxPatientsPerSlot: 4,
    rating: 4.95,
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
    rating: 4.9,
    consultationFee: "Free (Community Health Funded)"
  },
  {
    id: "doc_priya_nair",
    name: "Dr. Priya Nair",
    email: "doctor.priya@communityclinic.org",
    specialization: "Pediatrics & Child Health",
    qualification: "MBBS, DCH, MD (Pediatrics)",
    cabin: "Cabin 103 - Maternal & Child Block",
    experience: "9+ years",
    avatar: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=300&auto=format&fit=crop&q=80",
    availableDays: ["Monday", "Wednesday", "Friday", "Saturday"],
    availableSlots: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
    maxPatientsPerSlot: 3,
    rating: 5.0,
    consultationFee: "Free (Community Health Funded)"
  },
  {
    id: "doc_amitav_roy",
    name: "Dr. Amitav Roy",
    email: "doctor.amitav@communityclinic.org",
    specialization: "Community Dental Care",
    qualification: "BDS, MDS (Conservative Dentistry)",
    cabin: "Cabin 104 - Dental Suite",
    experience: "8+ years",
    avatar: "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=300&auto=format&fit=crop&q=80",
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    availableSlots: ["10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"],
    maxPatientsPerSlot: 3,
    rating: 4.8,
    consultationFee: "Free (Community Health Funded)"
  },
  {
    id: "doc_meera_iyer",
    name: "Dr. Meera Iyer",
    email: "doctor.meera@communityclinic.org",
    specialization: "Preventive Diagnostics & Screening",
    qualification: "MBBS, DNB (Pathology)",
    cabin: "Cabin 105 - Diagnostics Block",
    experience: "11+ years",
    avatar: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=300&auto=format&fit=crop&q=80",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    availableSlots: ["08:30 AM", "09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM"],
    maxPatientsPerSlot: 5,
    rating: 4.9,
    consultationFee: "Free (Community Health Funded)"
  }
];

export const SAMPLE_ANNOUNCEMENTS = [
  {
    id: "ann_sdg_1",
    title: "Free Hypertension & Diabetes Screening Camp",
    category: "health_camp",
    description: "Comprehensive blood pressure checkups, random blood glucose testing, BMI calculation, and nutritional consultation for community residents. Free medication samples and diet charts provided.",
    sdgTags: [
      "SDG 3: Good Health & Well-being",
      "Target 3.8: Universal Health"
    ],
    date: "2026-09-27",
    location: "Apna Community Center - Hall B, Sector 4",
    targetGroup: "Adults & Seniors (30+ years)",
    organizer: "Apna Community Outreach & Diagnostics Unit",
    registeredCount: 24,
    createdAt: new Date().toISOString()
  },
  {
    id: "ann_sdg_2",
    title: "Maternal Wellness & Infant Immunization Drive",
    category: "vaccination",
    description: "Routine childhood vaccinations (Measles, Polio, MMR, DTP), maternal iron & folic acid supplementation, prenatal ultrasound consultations, and pediatric growth monitoring.",
    sdgTags: [
      "SDG 3: Good Health & Well-being",
      "SDG 5: Gender Equality",
      "Target 3.2: Child Mortality"
    ],
    date: "2026-10-04",
    location: "East Wing Child Welfare Center, Room 102",
    targetGroup: "Expectant Mothers & Children (0-5 years)",
    organizer: "Pediatric & Maternal Health Division",
    registeredCount: 18,
    createdAt: new Date().toISOString()
  },
  {
    id: "ann_sdg_3",
    title: "Community Vision & Eye Health Outreach",
    category: "awareness",
    description: "Free refractive visual acuity testing, cataract screening, glaucoma pressure exams, and distribution of zero-cost reading glasses for underprivileged community elders.",
    sdgTags: [
      "SDG 3: Good Health & Well-being",
      "SDG 10: Reduced Inequalities"
    ],
    date: "2026-10-12",
    location: "Public Library Auditorium, Main Bazaar Road",
    targetGroup: "Open to All Residents (Priority for 55+)",
    organizer: "Apna Mobile Health Care Mission",
    registeredCount: 31,
    createdAt: new Date().toISOString()
  }
];

export const getSampleAppointments = () => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const getPastDateStr = (daysAgo) => {
    const d = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  };

  return [
    // -------------------------------------------------------------
    // DR. RAJESH PATEL (Internal Medicine) - Demo Doctor Dashboard
    // -------------------------------------------------------------
    // Patient 1: Maya Sharma (Demo Patient - Token TK-01 Today)
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
      date: todayStr,
      time: "09:00 AM",
      status: "pending",
      tokenNumber: "TK-01",
      reason: "Persistent dry cough, mild seasonal pyrexia, and fatigue for 2 days",
      vitals: {
        bp: "118/78 mmHg",
        bpSystolic: "118",
        bpDiastolic: "78",
        pulse: "76 bpm",
        temperature: "99.1 °F",
        spo2: "99%",
        bloodSugar: "92 mg/dL",
        weight: "58 kg",
        notes: "Patient alert and ambulatory. Mild pharyngeal congestion noted at nurse triage.",
        hasAlert: false
      },
      notes: "",
      diagnosis: "",
      prescription: "",
      createdAt: new Date(now.getTime() - 3 * 3600000).toISOString()
    },
    // Patient 2: Rajesh Kumar (Token TK-02 Today - Hypertension Check)
    {
      id: "apt_patel_2",
      patientId: "usr_patient_rajesh",
      patientName: "Rajesh Kumar",
      patientEmail: "rajesh.kumar@example.org",
      patientPhone: "+91 98111 22334",
      patientAge: 48,
      patientGender: "Male",
      doctorId: DEMO_DOCTOR_UID,
      doctorName: "Dr. Rajesh Patel",
      doctorEmail: "rajesh.patel@communityclinic.org",
      specialization: "Internal Medicine & Critical Care",
      date: todayStr,
      time: "10:00 AM",
      status: "pending",
      tokenNumber: "TK-02",
      reason: "Routine hypertension follow-up, mild occipital morning headache",
      vitals: {
        bp: "144/92 mmHg",
        bpSystolic: "144",
        bpDiastolic: "92",
        pulse: "84 bpm",
        temperature: "98.4 °F",
        spo2: "98%",
        bloodSugar: "116 mg/dL",
        weight: "78 kg",
        notes: "Elevated systolic & diastolic BP recorded at triage. Advised 10-minute rest.",
        hasAlert: true
      },
      notes: "",
      diagnosis: "",
      prescription: "",
      createdAt: new Date(now.getTime() - 2.5 * 3600000).toISOString()
    },
    // Patient 3: Sunita Verma (Token TK-03 Today - Diabetes Follow-up)
    {
      id: "apt_patel_3",
      patientId: "usr_patient_sunita",
      patientName: "Sunita Verma",
      patientEmail: "sunita.verma@example.org",
      patientPhone: "+91 98222 33445",
      patientAge: 52,
      patientGender: "Female",
      doctorId: DEMO_DOCTOR_UID,
      doctorName: "Dr. Rajesh Patel",
      doctorEmail: "rajesh.patel@communityclinic.org",
      specialization: "Internal Medicine & Critical Care",
      date: todayStr,
      time: "11:00 AM",
      status: "pending",
      tokenNumber: "TK-03",
      reason: "Type 2 Diabetes routine review and fasting blood glucose evaluation",
      vitals: {
        bp: "128/82 mmHg",
        bpSystolic: "128",
        bpDiastolic: "82",
        pulse: "74 bpm",
        temperature: "98.6 °F",
        spo2: "99%",
        bloodSugar: "148 mg/dL",
        weight: "66 kg",
        notes: "Fasting glucose slightly elevated. Patient reports compliance with metformin.",
        hasAlert: false
      },
      notes: "",
      diagnosis: "",
      prescription: "",
      createdAt: new Date(now.getTime() - 2 * 3600000).toISOString()
    },
    // Patient 4: Amit Gupta (Token TK-04 Today - Acid Peptic Reflux)
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
      date: todayStr,
      time: "02:00 PM",
      status: "pending",
      tokenNumber: "TK-04",
      reason: "Epigastric retrosternal burning sensation and acid reflux after meals",
      vitals: {
        bp: "120/80 mmHg",
        bpSystolic: "120",
        bpDiastolic: "80",
        pulse: "78 bpm",
        temperature: "98.6 °F",
        spo2: "99%",
        bloodSugar: "94 mg/dL",
        weight: "72 kg",
        notes: "Mild epigastric tenderness. No rebound or abdominal guarding.",
        hasAlert: false
      },
      notes: "",
      diagnosis: "",
      prescription: "",
      createdAt: new Date(now.getTime() - 1 * 3600000).toISOString()
    },
    // Patient 5: Harish Chandra (Completed Today by Dr. Patel)
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
      date: todayStr,
      time: "08:30 AM",
      status: "done",
      tokenNumber: "TK-00",
      reason: "Bilateral knee joint stiffness and chronic osteoarthritic ache",
      notes: "Joint effusion minimal. Normal active range of motion. Advised low-impact daily walks.",
      diagnosis: "Bilateral Knee Primary Osteoarthritis (Grade II)",
      prescription: "1. Tab Paracetamol 650mg TDS PRN after meals\n2. Tab Glucosamine Sulfate 500mg OD x 60 days\n3. Gentle quadriceps isometric strengthening exercises twice daily",
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
      completedAt: new Date(now.getTime() - 4 * 3600000).toISOString(),
      createdAt: new Date(now.getTime() - 5 * 3600000).toISOString()
    },
    // Patient 6: Maya Sharma (Past visit completed 12 days ago - Appears in Doctor's Medical History Drawer)
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
      date: getPastDateStr(12),
      time: "10:30 AM",
      status: "done",
      tokenNumber: "TK-02",
      reason: "Generalized fatigue, lightheadedness on standing, low stamina",
      notes: "Serum ferritin low at 13 ng/mL. Hb 10.4 g/dL. No melena or menorrhagia. Tolerating oral iron.",
      diagnosis: "Microcytic Hypochromic Anemia (Nutritional Iron Deficiency)",
      prescription: "1. Tab Ferrous Ascorbate 100mg + Folic Acid 1.5mg OD HS x 60 days\n2. Tab Vitamin C 500mg OD with breakfast\n3. High iron dietary intake (spinach, beetroot, lentils)\n4. Repeat CBC in 8 weeks",
      vitals: {
        bp: "114/74 mmHg",
        pulse: "76 bpm",
        temperature: "98.6 °F",
        spo2: "99%",
        weight: "57 kg",
        notes: "Mild pallor observed.",
        hasAlert: false
      },
      completedAt: new Date(now.getTime() - 12 * 86400000).toISOString(),
      createdAt: new Date(now.getTime() - 12 * 86400000 - 3600000).toISOString()
    },
    // Patient 7: Vikram Malhotra (Past visit completed 6 days ago by Dr. Patel)
    {
      id: "apt_patel_done_3",
      patientId: "usr_patient_vikram",
      patientName: "Vikram Malhotra",
      patientEmail: "vikram.malhotra@example.org",
      patientPhone: "+91 98777 88990",
      patientAge: 41,
      patientGender: "Male",
      doctorId: DEMO_DOCTOR_UID,
      doctorName: "Dr. Rajesh Patel",
      doctorEmail: "rajesh.patel@communityclinic.org",
      specialization: "Internal Medicine & Critical Care",
      date: getPastDateStr(6),
      time: "11:30 AM",
      status: "done",
      tokenNumber: "TK-03",
      reason: "Acute nasal congestion, facial fullness, and sneezing",
      notes: "Inferior nasal turbinates congested. Chest auscultation clear. Responding well to steam inhalation.",
      diagnosis: "Acute Viral Rhinosinusitis & Allergic Rhinitis",
      prescription: "1. Tab Levocetirizine 5mg + Montelukast 10mg OD HS x 7 days\n2. Normal Saline Nasal Spray 2 puffs per nostril TDS x 7 days\n3. Menthol steam inhalation BD",
      vitals: {
        bp: "124/80 mmHg",
        pulse: "76 bpm",
        temperature: "98.8 °F",
        spo2: "98%",
        weight: "74 kg",
        notes: "Vitals stable.",
        hasAlert: false
      },
      completedAt: new Date(now.getTime() - 6 * 86400000).toISOString(),
      createdAt: new Date(now.getTime() - 6 * 86400000 - 3600000).toISOString()
    },

    // -------------------------------------------------------------
    // DR. SARAH JENKINS (General Medicine & Family Practice)
    // -------------------------------------------------------------
    // Patient 8: Ananya Bose (Token TK-01 Today - Migraine)
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
      date: todayStr,
      time: "09:00 AM",
      status: "pending",
      tokenNumber: "TK-01",
      reason: "Unilateral throbbing headache with nausea and light sensitivity",
      vitals: {
        bp: "112/74 mmHg",
        bpSystolic: "112",
        bpDiastolic: "74",
        pulse: "82 bpm",
        temperature: "98.4 °F",
        spo2: "99%",
        bloodSugar: "88 mg/dL",
        weight: "53 kg",
        notes: "Photophobia noted during intake. Patient resting in quiet area.",
        hasAlert: false
      },
      notes: "",
      diagnosis: "",
      prescription: "",
      createdAt: new Date(now.getTime() - 3 * 3600000).toISOString()
    },
    // Patient 9: Ramesh Patel (Token TK-02 Today - Lumbar Strain)
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
      date: todayStr,
      time: "10:00 AM",
      status: "pending",
      tokenNumber: "TK-02",
      reason: "Mechanical lower backache radiating to buttocks after lifting heavy crate",
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
      createdAt: new Date(now.getTime() - 2 * 3600000).toISOString()
    },
    // Patient 10: Suresh Raina (Completed Today by Dr. Sarah)
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
      date: todayStr,
      time: "08:30 AM",
      status: "done",
      tokenNumber: "TK-00",
      reason: "Occipital tension headache and neck stiffness from desk ergonomics",
      notes: "Full neurological screening unremarkable. Advised periodic display pauses.",
      diagnosis: "Postural Cervical Muscle Strain & Episodic Tension Headache",
      prescription: "1. Tab Ibuprofen 400mg + Paracetamol 325mg BD PC x 3 days\n2. Warm moist compress to posterior neck\n3. Ergonomic monitor height adjustment advised",
      vitals: {
        bp: "122/80 mmHg",
        pulse: "74 bpm",
        temperature: "98.6 °F",
        spo2: "99%",
        weight: "75 kg",
        notes: "Normotensive.",
        hasAlert: false
      },
      completedAt: new Date(now.getTime() - 4 * 3600000).toISOString(),
      createdAt: new Date(now.getTime() - 5 * 3600000).toISOString()
    },

    // -------------------------------------------------------------
    // DR. PRIYA NAIR (Pediatrics & Child Health)
    // -------------------------------------------------------------
    // Patient 11: Aarav Patel (Token TK-01 Today - Routine Pediatric Checkup)
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
      date: todayStr,
      time: "09:30 AM",
      status: "pending",
      tokenNumber: "TK-01",
      reason: "Routine milestone checkup and MMR booster vaccine consultation",
      vitals: {
        pulse: "98 bpm",
        temperature: "98.6 °F",
        spo2: "100%",
        weight: "16.2 kg",
        notes: "Child alert, active, playful. Normal developmental milestones for 4y.",
        hasAlert: false
      },
      notes: "",
      diagnosis: "",
      prescription: "",
      createdAt: new Date(now.getTime() - 2.5 * 3600000).toISOString()
    },
    // Patient 12: Riya Sen (Completed Today by Dr. Priya)
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
      date: todayStr,
      time: "08:45 AM",
      status: "done",
      tokenNumber: "TK-00",
      reason: "Nighttime dry cough and itchy watery eyes",
      notes: "Bilateral chest sounds clear. No wheeze. Throat mildly injected.",
      diagnosis: "Pediatric Allergic Rhinitis & Seasonal Cough",
      prescription: "1. Syrup Levocetirizine 2.5ml OD at bedtime x 5 days\n2. Normal Saline Nasal Drops 2 drops per nostril PRN\n3. Avoid cold drinks, air-dry bed linen",
      vitals: {
        pulse: "92 bpm",
        temperature: "98.4 °F",
        spo2: "99%",
        weight: "19.5 kg",
        notes: "Afebrile.",
        hasAlert: false
      },
      completedAt: new Date(now.getTime() - 4 * 3600000).toISOString(),
      createdAt: new Date(now.getTime() - 5 * 3600000).toISOString()
    },

    // -------------------------------------------------------------
    // DR. AMITAV ROY (Community Dental Care)
    // -------------------------------------------------------------
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
      specialization: "Community Dental Care",
      date: getPastDateStr(8),
      time: "10:00 AM",
      status: "done",
      tokenNumber: "TK-01",
      reason: "Lower molar sensitivity to cold liquids and mild plaque buildup",
      notes: "Superficial enamel wear on tooth 36. Ultrasonic scaling and polishing performed.",
      diagnosis: "Mild Dentin Hypersensitivity with Localized Marginal Gingivitis",
      prescription: "1. Potassium Nitrate Desensitizing Toothpaste - Twice daily gentle brushing\n2. Chlorhexidine Mouthwash 0.2% - Rinse 10ml BD for 7 days\n3. Soft ultra-fine bristle toothbrush recommended",
      vitals: {
        bp: "120/78 mmHg",
        pulse: "74 bpm",
        weight: "61 kg",
        notes: "Pre-dental screening normal.",
        hasAlert: false
      },
      completedAt: new Date(now.getTime() - 8 * 86400000).toISOString(),
      createdAt: new Date(now.getTime() - 8 * 86400000 - 3600000).toISOString()
    },

    // -------------------------------------------------------------
    // DR. MEERA IYER (Preventive Diagnostics & Screening)
    // -------------------------------------------------------------
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
      specialization: "Preventive Diagnostics & Screening",
      date: getPastDateStr(14),
      time: "09:30 AM",
      status: "done",
      tokenNumber: "TK-03",
      reason: "Annual preventive lipid panel, fasting blood sugar, and CBC routine screening",
      notes: "Hemoglobin: 12.8 g/dL, Fasting glucose: 92 mg/dL. Total cholesterol: 178 mg/dL. Normal baseline.",
      diagnosis: "Healthy Preventive Clinical Screening - Normotensive",
      prescription: "1. Tab Multivitamin with Zinc - 1 tablet OD after breakfast x 30 days\n2. Maintain active physical exercise 30 mins daily\n3. Review annual screening next year",
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
      completedAt: new Date(now.getTime() - 14 * 86400000).toISOString(),
      createdAt: new Date(now.getTime() - 14 * 86400000 - 3600000).toISOString()
    }
  ];
};

export const SAMPLE_LAB_REPORTS = [
  {
    id: "rep_maya_fbs_1",
    patientId: DEMO_PATIENT_UID,
    patientName: "Maya Sharma",
    patientEmail: "maya.sharma@example.com",
    testName: "Fasting Blood Sugar & HbA1c Panel",
    category: "Diabetes & Metabolism",
    testDate: "2026-09-20",
    labName: "Apna Community Diagnostic Center (SDG 3 Pathology)",
    status: "Normal",
    keyMetrics: [
      { param: "Fasting Plasma Glucose", value: "92 mg/dL", reference: "70 - 99 mg/dL", status: "Optimal" },
      { param: "Glycated Hemoglobin (HbA1c)", value: "5.4%", reference: "< 5.7%", status: "Optimal" },
      { param: "Average Estimated Blood Glucose", value: "108 mg/dL", reference: "< 117 mg/dL", status: "Optimal" }
    ],
    summary: "Glycemic indices within normal healthy range. No indication of insulin resistance.",
    notes: "Fasting 10 hours prior to sample collection. Sample verified by pathologist Dr. Meera Iyer.",
    doctorReviewStatus: "Reviewed & Cleared",
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString()
  },
  {
    id: "rep_maya_cbc_1",
    patientId: DEMO_PATIENT_UID,
    patientName: "Maya Sharma",
    patientEmail: "maya.sharma@example.com",
    testName: "Complete Blood Count (CBC) with ESR",
    category: "Hematology",
    testDate: "2026-09-15",
    labName: "Apna Community Diagnostic Center (SDG 3 Pathology)",
    status: "Normal",
    keyMetrics: [
      { param: "Hemoglobin (Hb)", value: "13.2 g/dL", reference: "12.0 - 15.5 g/dL", status: "Optimal" },
      { param: "Total Leucocyte Count (WBC)", value: "6,800 /uL", reference: "4,000 - 11,000 /uL", status: "Optimal" },
      { param: "Platelet Count", value: "245,000 /uL", reference: "150,000 - 450,000 /uL", status: "Optimal" },
      { param: "Erythrocyte Sed Rate (ESR)", value: "12 mm/hr", reference: "< 20 mm/hr", status: "Optimal" }
    ],
    summary: "Normal red and white cell morphology. Platelet count adequate.",
    notes: "Automated 5-part differential hematology analyzer verified.",
    doctorReviewStatus: "Reviewed & Cleared",
    createdAt: new Date(Date.now() - 11 * 86400000).toISOString()
  },
  {
    id: "rep_maya_lipid_1",
    patientId: DEMO_PATIENT_UID,
    patientName: "Maya Sharma",
    patientEmail: "maya.sharma@example.com",
    testName: "Comprehensive Lipid Profile",
    category: "Cardiovascular Health",
    testDate: "2026-08-28",
    labName: "Apna Community Diagnostic Center (SDG 3 Pathology)",
    status: "Borderline",
    keyMetrics: [
      { param: "Total Cholesterol", value: "192 mg/dL", reference: "< 200 mg/dL", status: "Desirable" },
      { param: "Triglycerides", value: "158 mg/dL", reference: "< 150 mg/dL", status: "Borderline High" },
      { param: "HDL Cholesterol (Good)", value: "54 mg/dL", reference: "> 50 mg/dL", status: "Protective" },
      { param: "LDL Cholesterol (Calculated)", value: "106 mg/dL", reference: "< 100 mg/dL", status: "Borderline" }
    ],
    summary: "Mild triglyceride elevation. Advised reduction in dietary refined carbohydrates and brisk walking.",
    notes: "Recommended re-testing in 6 months following dietary adjustments.",
    doctorReviewStatus: "Doctor Advised Diet Changes",
    createdAt: new Date(Date.now() - 29 * 86400000).toISOString()
  },
  {
    id: "rep_ramesh_hba1c_1",
    patientId: "usr_patient_ramesh",
    patientName: "Ramesh Kumar",
    patientEmail: "ramesh.kumar@example.com",
    testName: "Quarterly Diabetic Control HbA1c Panel",
    category: "Diabetes & Metabolism",
    testDate: "2026-09-22",
    labName: "Apna Community Diagnostic Center (SDG 3 Pathology)",
    status: "Alert",
    keyMetrics: [
      { param: "HbA1c Glycated Hemoglobin", value: "8.2%", reference: "< 7.0% (Diabetic Target)", status: "Uncontrolled" },
      { param: "Fasting Blood Glucose", value: "164 mg/dL", reference: "80 - 130 mg/dL", status: "Elevated" },
      { param: "Post-Prandial Glucose (2hr)", value: "228 mg/dL", reference: "< 180 mg/dL", status: "Elevated" }
    ],
    summary: "Sub-optimal glycemic control. Requires oral hypoglycemic medication titration by Dr. Rajesh Patel.",
    notes: "Urgent consultation scheduled for medication dose adjustment.",
    doctorReviewStatus: "Medication Adjustment Needed",
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: "rep_sunita_thyroid_1",
    patientId: "usr_patient_sunita",
    patientName: "Sunita Devi",
    patientEmail: "sunita.devi@example.com",
    testName: "Thyroid Stimulating Hormone (TSH) Screen",
    category: "Endocrinology",
    testDate: "2026-09-18",
    labName: "Apna Community Diagnostic Center (SDG 3 Pathology)",
    status: "Borderline",
    keyMetrics: [
      { param: "Ultrasensitive TSH", value: "5.85 uIU/mL", reference: "0.45 - 4.50 uIU/mL", status: "Mild Hypothyroid" },
      { param: "Free Thyroxine (FT4)", value: "1.08 ng/dL", reference: "0.82 - 1.77 ng/dL", status: "Normal" }
    ],
    summary: "Subclinical hypothyroidism pattern with preserved FT4 levels.",
    notes: "Clinical review with Dr. Sarah Jenkins recommended.",
    doctorReviewStatus: "Reviewed",
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString()
  }
];

export const SAMPLE_PHARMACY_STOCK = [
  { id: "med_1", name: "Paracetamol 500mg", generic: "Acetaminophen", form: "Tablets", category: "Antipyretic / Analgesic", stock: 1250, unit: "tabs", minAlert: 200, status: "Good", batch: "PCT-2026-08", expiry: "2028-06" },
  { id: "med_2", name: "Amoxicillin 500mg", generic: "Amoxicillin Trihydrate", form: "Capsules", category: "Broad-Spectrum Antibiotic", stock: 680, unit: "caps", minAlert: 150, status: "Good", batch: "AMX-2026-05", expiry: "2027-11" },
  { id: "med_3", name: "Metformin 500mg", generic: "Metformin Hydrochloride", form: "Tablets", category: "Antidiabetic (Type 2)", stock: 890, unit: "tabs", minAlert: 200, status: "Good", batch: "MET-2026-09", expiry: "2028-04" },
  { id: "med_4", name: "ORS WHO Formula", generic: "Oral Rehydration Salts", form: "Sachets", category: "Hydration Therapy", stock: 450, unit: "sachets", minAlert: 100, status: "Good", batch: "ORS-2026-03", expiry: "2028-01" },
  { id: "med_5", name: "Cetirizine 10mg", generic: "Cetirizine Dihydrochloride", form: "Tablets", category: "Antihistamine / Antiallergic", stock: 720, unit: "tabs", minAlert: 100, status: "Good", batch: "CET-2026-07", expiry: "2027-09" },
  { id: "med_6", name: "Pantoprazole 40mg", generic: "Pantoprazole Sodium", form: "Tablets", category: "Proton Pump Inhibitor / Antacid", stock: 540, unit: "tabs", minAlert: 100, status: "Good", batch: "PAN-2026-10", expiry: "2028-08" },
  { id: "med_7", name: "Iron & Folic Acid", generic: "Ferrous Ascorbate + Folic Acid", form: "Tablets", category: "Maternal & Anemia Care", stock: 950, unit: "tabs", minAlert: 150, status: "Good", batch: "IFA-2026-04", expiry: "2027-12" },
  { id: "med_8", name: "Vitamin C 500mg + Zinc", generic: "Ascorbic Acid + Zinc Sulphate", form: "Chewable", category: "Immune Support", stock: 620, unit: "tabs", minAlert: 100, status: "Good", batch: "VCZ-2026-02", expiry: "2028-05" },
  { id: "med_9", name: "Salbutamol 100mcg Inhaler", generic: "Albuterol / Salbutamol", form: "MDI Inhaler", category: "Bronchodilator (Asthma/COPD)", stock: 38, unit: "canisters", minAlert: 20, status: "Low Stock", batch: "SLB-2026-01", expiry: "2027-08" },
  { id: "med_10", name: "Cough Relief Expectorant", generic: "Guaifenesin + Ambroxol Syrup", form: "Syrup 100ml", category: "Respiratory Relief", stock: 110, unit: "bottles", minAlert: 30, status: "Good", batch: "CGH-2026-06", expiry: "2027-10" }
];

