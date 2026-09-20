/**
 * Default Starter Dataset for Apna Community Health Clinic
 * Medically coherent specialists, active queue tokens, diagnostic visits, and SDG 3 camps.
 */

export const SAMPLE_DOCTORS = [
  {
    id: "doc_sarah_jenkins",
    name: "Dr. Sarah Jenkins",
    email: "doctor.sarah@communityclinic.org",
    specialization: "General Medicine & Family Practice",
    qualification: "MBBS, MD (Family Medicine)",
    cabin: "Cabin 101 - Primary Care Block",
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
    cabin: "Cabin 102 - Maternal & Child Block",
    experience: "9+ years",
    avatar: "https://images.unsplash.com/photo-1594824813580-b2f7685600cb?w=300&auto=format&fit=crop&q=80",
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
    cabin: "Cabin 103 - Dental Suite",
    experience: "8+ years",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80",
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
    cabin: "Cabin 104 - Diagnostics Block",
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
  const todayStr = new Date().toISOString().split('T')[0];
  return [
    {
      id: "apt_sample_1",
      patientId: "usr_patient_maya",
      patientName: "Maya Sharma",
      patientEmail: "patient.maya@example.com",
      patientPhone: "+91 98765 01234",
      patientAge: 29,
      patientGender: "Female",
      doctorId: "doc_sarah_jenkins",
      doctorName: "Dr. Sarah Jenkins",
      specialization: "General Medicine & Family Practice",
      date: todayStr,
      time: "09:00 AM",
      status: "pending",
      tokenNumber: "TK-01",
      reason: "Mild seasonal fever, persistent dry cough, and headache for 2 days",
      notes: "",
      diagnosis: "",
      prescription: "",
      createdAt: new Date().toISOString()
    },
    {
      id: "apt_sample_2",
      patientId: "usr_patient_rajesh",
      patientName: "Rajesh Kumar",
      patientEmail: "rajesh.kumar@example.org",
      patientPhone: "+91 98111 22334",
      patientAge: 48,
      patientGender: "Male",
      doctorId: "doc_sarah_jenkins",
      doctorName: "Dr. Sarah Jenkins",
      specialization: "General Medicine & Family Practice",
      date: todayStr,
      time: "10:00 AM",
      status: "pending",
      tokenNumber: "TK-02",
      reason: "Routine hypertension follow-up and blood pressure monitoring",
      notes: "",
      diagnosis: "",
      prescription: "",
      createdAt: new Date().toISOString()
    },
    {
      id: "apt_sample_3",
      patientId: "usr_patient_aarav",
      patientName: "Aarav Patel",
      patientEmail: "sunita.patel@example.com",
      patientPhone: "+91 98333 44556",
      patientAge: 4,
      patientGender: "Male",
      doctorId: "doc_priya_nair",
      doctorName: "Dr. Priya Nair",
      specialization: "Pediatrics & Child Health",
      date: todayStr,
      time: "09:30 AM",
      status: "pending",
      tokenNumber: "TK-01",
      reason: "Routine milestone checkup and MMR booster vaccine consultation",
      notes: "",
      diagnosis: "",
      prescription: "",
      createdAt: new Date().toISOString()
    },
    {
      id: "apt_sample_4",
      patientId: "usr_patient_maya",
      patientName: "Maya Sharma",
      patientEmail: "patient.maya@example.com",
      patientPhone: "+91 98765 01234",
      patientAge: 29,
      patientGender: "Female",
      doctorId: "doc_meera_iyer",
      doctorName: "Dr. Meera Iyer",
      specialization: "Preventive Diagnostics & Screening",
      date: "2026-09-15",
      time: "09:30 AM",
      status: "done",
      tokenNumber: "TK-03",
      reason: "Annual preventive lipid panel and CBC routine blood screening",
      notes: "Patient vitals stable. Hemoglobin: 12.8 g/dL, Fasting blood glucose: 92 mg/dL. Normal lipid parameters.",
      diagnosis: "Healthy Clinical Screening - Normotensive",
      prescription: "1. Tab Multivitamin with Zinc - 1 tablet OD after breakfast x 30 days\n2. Maintain active physical exercise 30 mins daily\n3. Review annual screening next September",
      completedAt: "2026-09-15T10:15:00.000Z",
      createdAt: "2026-09-15T08:30:00.000Z"
    },
    {
      id: "apt_sample_5",
      patientId: "usr_patient_kavita",
      patientName: "Kavita Sen",
      patientEmail: "kavita.sen@example.com",
      patientPhone: "+91 98444 55667",
      patientAge: 34,
      patientGender: "Female",
      doctorId: "doc_amitav_roy",
      doctorName: "Dr. Amitav Roy",
      specialization: "Community Dental Care",
      date: "2026-09-17",
      time: "10:00 AM",
      status: "done",
      tokenNumber: "TK-01",
      reason: "Lower molar sensitivity to cold liquids and mild plaque buildup",
      notes: "Superficial enamel wear on tooth 36. Scaling and polishing performed successfully.",
      diagnosis: "Mild Dentin Hypersensitivity with Localized Gingivitis",
      prescription: "1. Potassium Nitrate Desensitizing Toothpaste - Twice daily brushing\n2. Chlorhexidine Mouthwash 0.2% - Rinse 10ml BD for 7 days\n3. Soft bristle toothbrush recommended",
      completedAt: "2026-09-17T10:45:00.000Z",
      createdAt: "2026-09-17T09:00:00.000Z"
    }
  ];
};
