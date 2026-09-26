import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

export const TRANSLATIONS = {
  en: {
    // Navigation & Common
    clinicTitle: "Apna Community Clinic",
    tagline: "Free primary healthcare under UN SDG 3",
    navHome: "Home",
    navSpecialists: "Specialists",
    navAppointments: "My Visits",
    navAnnouncements: "Health Camps",
    navLiveDisplay: "Waiting TV Display",
    navAdmin: "Admin",
    navDoctor: "Doctor Portal",
    navPatient: "Patient Portal",
    navCamps: "Community Camps",
    navDashboard: "Dashboard",
    navMyAppointments: "My Appointments",
    navHealthCamps: "Health Camps & SDG",
    navDoctorQueue: "Today's Queue",
    navPatientHistory: "Patient History",
    navAdminHub: "Admin Hub",
    navDoctorSlots: "Doctor Slots",
    navMasterAppointments: "Master Ledger",
    navOpdTv: "OPD TV",
    navCloudSync: "Cloud Sync",
    login: "Sign In",
    register: "Register",
    logout: "Sign Out",
    welcome: "Welcome",

    // Landing Page
    heroBadge: "UN SDG 3 • Good Health & Well-Being",
    heroHeadline: "Universal Community Care & Digital Queue Scheduling",
    heroSubtitle: "A trusted primary healthcare portal that replaces crowded clinic waiting rooms with real-time digital token allocation, specialist queues, and free community health camps.",
    bookFreeToken: "Book Free Queue Token",
    goToDashboard: "Go to Dashboard",
    healthDrives: "Health Drives",
    secureCloudSync: "Secure Cloud Sync",
    encryptedFirestore: "Encrypted Firestore Storage",
    instantDigitalSlips: "Instant Digital Token Slips",
    zeroPaperWaste: "Zero Paper Tokens",
    freePrimaryCare: "100% Free Primary Care",
    instantTokenWait: "0 sec Token Wait Delay",
    clinicSpecialistsTitle: "Clinic Specialists & Availability",
    clinicSpecialistsSubtitle: "Choose a department specialist and reserve your daily token",
    liveQueueEstimator: "Live Queue Estimator",
    liveQueueEstimatorSubtitle: "Real-time look inside current consulting cabins",
    nowServing: "Now Serving",
    currentlyInCabin: "Currently In Cabin",
    nextTokenInLine: "Next Token in Line:",
    estimatedQueueWait: "Estimated Queue Wait:",
    todaysConsultations: "Today's Consultations",
    reserveYourTokenSlip: "Reserve Your Token Slip Now",
    mobileExpressToken: "Mobile Express Token",
    mobileExpressDesc: "Scan with smartphone camera to book and track from your phone",
    interactiveQueueDemo: "Interactive Queue Demo",
    checkWaitTime: "Check Wait Time & Reserve Live Token",
    checkWaitTimeDesc: "Choose a medical department below to check real-time queue capacity, available slots, and estimated consultation wait times.",
    specialistOnDuty: "Specialist on Duty",
    inCabinNow: "In Cabin Now",
    consultationInProgress: "Consultation in progress",
    nextTokenAvailable: "Next Token Available",
    reserveNextNow: "Reserve Token Now",
    slotsLeftToday: "consultation slots left today",
    oneIntegratedPlatform: "One Integrated Platform for Clinic Operations",
    platformSubtitle: "Designed for compassionate patient experience, smooth doctor workflows, and transparent clinic oversight.",
    patientHub: "Patient Hub",
    patientHubDesc: "Book sequential doctor consultations with live slot capacity checks, download digital token slips, and access past diagnoses.",
    doctorQueueTitle: "Doctor Queue",
    doctorQueueDesc: "Real-time chronologically sorted queue of daily patients, quick consultation completion, and immediate clinical record archiving.",
    operationsHub: "Operations Hub",
    operationsHubDesc: "Doctor scheduling and cabin allocations, master appointment ledger, UN SDG 3 health camp announcements, and encrypted cloud backups.",
    accessPatientHub: "Access Patient Hub",
    accessDoctorQueue: "Access Doctor Queue",
    accessAdminHub: "Access Admin Hub",
    ourSpecialists: "Our Community Medical Specialists",
    ourSpecialistsDesc: "Experienced physicians dedicated to community primary health and wellness",
    bookTokenWithSpecialist: "Book Token with Specialist",
    communityStories: "Community Stories",
    realImpact: "Real Impact for Everyday Families",
    realImpactDesc: "How zero-cost digital tokens and community drives transform local primary healthcare access.",
    patientFeesSaved: "Patient Fees Saved",
    tokensAllocated: "Tokens Allocated",
    freeUnderSdg: "Free Under SDG 3",
    cloudRealTimeSync: "Cloud Real-Time Sync",
    pendingVisits: "Pending Visits",
    viewAllAnnouncements: "View All Announcements",

    // Dashboard & Patient
    hello: "Hello",
    communityMember: "Community Member",
    patientPortalTitle: "Community Primary Health Portal",
    patientHeroSubtitle: "Book consultations with clinic specialists, access digital queue tokens in real-time, and explore free community health camps under SDG 3.",
    digitalToken: "Digital Queue Token",
    activeInQueue: "Active in Queue",
    scheduledSlot: "Scheduled Slot",
    viewDigitalToken: "View Digital Token",
    bookAppointment: "Book Appointment",
    visitHistory: "Visit History",
    clinicSpecialists: "Clinic Specialists & Availability",
    chooseSpecialist: "Choose a department specialist and reserve your daily token",
    availableSlots: "Available Slots",
    slotsOpenToday: "open today",
    experience: "Experience",
    consultationFee: "Consultation",
    freeCommunityCare: "Free (Community Care)",
    moreAvailability: "More Availability",
    onLeave: "On Leave Today",
    bookToken: "Book Appointment & Token",
    estimatedWait: "Estimated Wait",
    consultationsAhead: "consultations ahead of you in",
    nextInLine: "You are next in line! Please wait near the cabin.",

    // Token Slip & SMS
    tokenSlip: "Official Clinic Consultation Token",
    sendSMS: "Send SMS Details",
    smsSent: "SMS Dispatched",
    printSlip: "Print Slip",
    downloadSlip: "Download Slip",
    signInRequiredTitle: "Please Sign In to Book Your Token",
    signInRequiredDesc: "To allocate your sequential queue token, display your wait time on the OPD TV, and send direct SMS appointment alerts, please sign in or register your free patient account.",
    signInAction: "Sign In to Your Account",
    createAccountAction: "Create Free Patient Account",

    // Health Camps & SDG 3
    sdg3Title: "UN Sustainable Development Goal 3",
    goodHealth: "Good Health & Well-Being for All",
    freeHealthCamps: "Community Health Camp Highlights",
    upcomingCamps: "Upcoming Free Community Health Camps",
    campsSubtitle: "Preventive checkups, pediatric nutrition, and awareness drives",
    rsvpCamp: "RSVP for Free Screening",
    rsvpd: "Registered (Attending)",
    attendees: "registered attendees",

    // Doctor & Queue
    doctorQueue: "Clinical Consultation Queue",
    inQueue: "In Queue",
    completed: "Completed",
    totalAppointments: "Total Appointments",
    startConsultation: "Start Consultation",
    patientHistory: "Past Medical History",
    quickRxTemplates: "Quick Rx Templates",
    recordVitals: "Record Vitals (Triage)",
    bp: "Blood Pressure",
    pulse: "Pulse (bpm)",
    temp: "Temp (°F)",
    spo2: "SpO2 (%)",
    sugar: "Blood Sugar (mg/dL)",

    // Kiosk & Voice
    callingToken: "Now Calling",
    proceedToCabin: "Please proceed to",
    voiceAnnouncement: "Voice Announcer",
    privacyMasking: "Privacy Mask",

    // Walk-in & Pharmacy
    walkInToken: "Issue Walk-In Token",
    pharmacyQueue: "Dispensary / Free Meds",
    dispenseMedication: "Mark as Dispensed",
    dispensed: "Dispensed"
  },
  hi: {
    // Navigation & Common
    clinicTitle: "अपना कम्युनिटी क्लिनिक",
    tagline: "संयुक्त राष्ट्र SDG 3 के तहत निःशुल्क प्राथमिक स्वास्थ्य सेवा",
    navHome: "होम",
    navSpecialists: "विशेषज्ञ डॉक्टर",
    navAppointments: "मेरी पर्चियां",
    navAnnouncements: "स्वास्थ्य शिविर",
    navLiveDisplay: "प्रतीक्षालय टीवी स्क्रीन",
    navAdmin: "प्रशासन",
    navDoctor: "डॉक्टर पोर्टल",
    navPatient: "मरीज़ पोर्टल",
    navCamps: "स्वास्थ्य शिविर",
    navDashboard: "डैशबोर्ड",
    navMyAppointments: "मेरी पर्चियां",
    navHealthCamps: "स्वास्थ्य शिविर (SDG)",
    navDoctorQueue: "आज की कतार",
    navPatientHistory: "मरीज़ इतिहास",
    navAdminHub: "प्रशासन हब",
    navDoctorSlots: "डॉक्टर समय",
    navMasterAppointments: "मास्टर अपॉइंटमेंट",
    navOpdTv: "ओपीडी टीवी",
    navCloudSync: "क्लाउड सिंक",
    login: "लॉग इन",
    register: "पंजीकरण",
    logout: "लॉग आउट",
    welcome: "नमस्ते",

    // Landing Page
    heroBadge: "संयुक्त राष्ट्र SDG 3 • उत्तम स्वास्थ्य और खुशहाली",
    heroHeadline: "सार्वजनिक सामुदायिक स्वास्थ्य सेवा एवं डिजिटल टोकन कतार",
    heroSubtitle: "एक विश्वसनीय प्राथमिक स्वास्थ्य सेवा पोर्टल जो भीड़-भाड़ वाले प्रतीक्षालय को समाप्त कर तुरंत डिजिटल टोकन, डॉक्टर कतार और निःशुल्क स्वास्थ्य शिविर प्रदान करता है।",
    bookFreeToken: "मुफ्त कतार टोकन लें",
    goToDashboard: "डैशबोर्ड पर जाएं",
    healthDrives: "स्वास्थ्य शिविर",
    secureCloudSync: "सुरक्षित क्लाउड सिंक",
    encryptedFirestore: "सुरक्षित फायरस्टोर स्टोरेज",
    instantDigitalSlips: "त्वरित डिजिटल टोकन पर्ची",
    zeroPaperWaste: "कागज़ मुक्त डिजिटल टोकन",
    freePrimaryCare: "100% निःशुल्क प्राथमिक देखभाल",
    instantTokenWait: "0 सेकंड टोकन आवंटन",
    clinicSpecialistsTitle: "क्लिनिक विशेषज्ञ एवं उपलब्धता",
    clinicSpecialistsSubtitle: "विभाग विशेषज्ञ चुनें और आज का टोकन आरक्षित करें",
    liveQueueEstimator: "लाइव कतार अनुमानक",
    liveQueueEstimatorSubtitle: "क्लिनिक केबिनों की रीयल-टाइम स्थिति",
    nowServing: "वर्तमान में जारी",
    currentlyInCabin: "केबिन में वर्तमान",
    nextTokenInLine: "कतार में अगला टोकन:",
    estimatedQueueWait: "अनुमानित प्रतीक्षा समय:",
    todaysConsultations: "आज के परामर्श",
    reserveYourTokenSlip: "अपनी टोकन पर्ची अभी आरक्षित करें",
    mobileExpressToken: "मोबाइल एक्सप्रेस टोकन",
    mobileExpressDesc: "अपने मोबाइल कैमरे से स्कैन कर फोन से कतार टोकन लें",
    interactiveQueueDemo: "इंटरएक्टिव कतार डेमो",
    checkWaitTime: "प्रतीक्षा समय देखें और लाइव टोकन लें",
    checkWaitTimeDesc: "रीयल-टाइम कतार क्षमता, उपलब्ध स्लॉट और अनुमानित प्रतीक्षा समय देखने के लिए नीचे विभाग चुनें।",
    specialistOnDuty: "ड्यूटी पर विशेषज्ञ",
    inCabinNow: "केबिन में उपस्थित",
    consultationInProgress: "परामर्श जारी है",
    nextTokenAvailable: "उपलब्ध अगला टोकन",
    reserveNextNow: "टोकन आरक्षित करें",
    slotsLeftToday: "परामर्श स्लॉट आज शेष हैं",
    oneIntegratedPlatform: "क्लिनिक संचालन के लिए एकीकृत मंच",
    platformSubtitle: "मरीज़ों की सहूलियत, डॉक्टरों के कार्यप्रवाह और पारदर्शी क्लिनिक प्रबंधन के लिए समर्पित।",
    patientHub: "मरीज़ हब",
    patientHubDesc: "डॉक्टर परामर्श बुक करें, डिजिटल टोकन पर्ची डाउनलोड करें और पूर्व जांच पर्ची देखें।",
    doctorQueueTitle: "डॉक्टर कतार",
    doctorQueueDesc: "दैनिक मरीज़ों की रीयल-टाइम कतार, त्वरित परामर्श और तुरंत क्लिनिकल रिकॉर्ड सुरक्षित करना।",
    operationsHub: "प्रशासन हब",
    operationsHubDesc: "डॉक्टर समय सारणी, केबिन प्रबंधन, मास्टर अपॉइंटमेंट लेजर और स्वास्थ्य शिविर घोषणाएं।",
    accessPatientHub: "मरीज़ हब खोलें",
    accessDoctorQueue: "डॉक्टर कतार खोलें",
    accessAdminHub: "प्रशासन हब खोलें",
    ourSpecialists: "हमारे समुदाय के विशेषज्ञ डॉक्टर",
    ourSpecialistsDesc: "सामुदायिक प्राथमिक स्वास्थ्य एवं कल्याण के लिए समर्पित अनुभवी चिकित्सक",
    bookTokenWithSpecialist: "विशेषज्ञ से टोकन लें",
    communityStories: "सामुदायिक अनुभव",
    realImpact: "स्थानीय परिवारों के लिए वास्तविक लाभ",
    realImpactDesc: "शून्य-लागत डिजिटल टोकन और स्वास्थ्य शिविर कैसे स्थानीय स्वास्थ्य सेवा को सुगम बनाते हैं।",
    patientFeesSaved: "मरीज़ों की बचत",
    tokensAllocated: "टोकन आवंटित",
    freeUnderSdg: "SDG 3 के तहत निःशुल्क",
    cloudRealTimeSync: "रीयल-टाइम क्लाउड सिंक",
    pendingVisits: "लंबित परामर्श",
    viewAllAnnouncements: "सभी सूचनाएं देखें",

    // Dashboard & Patient
    hello: "नमस्ते",
    communityMember: "समुदाय सदस्य",
    patientPortalTitle: "सामुदायिक प्राथमिक स्वास्थ्य पोर्टल",
    patientHeroSubtitle: "क्लिनिक विशेषज्ञों से परामर्श लें, लाइव डिजिटल टोकन ट्रैक करें और SDG 3 के तहत निःशुल्क स्वास्थ्य शिविरों में भाग लें।",
    digitalToken: "डिजिटल कतार टोकन",
    activeInQueue: "कतार में सक्रिय",
    scheduledSlot: "निर्धारित समय",
    viewDigitalToken: "डिजिटल टोकन देखें",
    bookAppointment: "अपॉइंटमेंट बुक करें",
    visitHistory: "पूर्व परामर्श इतिहास",
    clinicSpecialists: "क्लिनिक विशेषज्ञ एवं उपलब्धता",
    chooseSpecialist: "विभाग विशेषज्ञ चुनें और अपना दैनिक टोकन आरक्षित करें",
    availableSlots: "उपलब्ध स्लॉट",
    slotsOpenToday: "आज उपलब्ध",
    experience: "अनुभव",
    consultationFee: "परामर्श शुल्क",
    freeCommunityCare: "निःशुल्क (सामुदायिक सेवा)",
    moreAvailability: "अधिक उपलब्धता",
    onLeave: "आज अवकाश पर",
    bookToken: "अपॉइंटमेंट और टोकन लें",
    estimatedWait: "अनुमानित प्रतीक्षा समय",
    consultationsAhead: "मरीज़ आपसे आगे हैं",
    nextInLine: "अब आपकी बारी है! कृपया केबिन के पास रहें।",

    // Token Slip & SMS
    tokenSlip: "आधिकारिक क्लिनिक परामर्श टोकन",
    sendSMS: "एसएमएस द्वारा विवरण भेजें",
    smsSent: "एसएमएस भेज दिया गया",
    printSlip: "पर्ची प्रिंट करें",
    downloadSlip: "डाउनलोड करें",
    signInRequiredTitle: "टोकन लेने के लिए कृपया पहले साइन इन करें",
    signInRequiredDesc: "अपना आधिकारिक कतार टोकन प्राप्त करने, ओपीडी टीवी पर कतार देखने और अपने मोबाइल पर एसएमएस विवरण पाने के लिए कृपया पहले साइन इन करें या नया खाता बनाएं।",
    signInAction: "अपने खाते में साइन इन करें",
    createAccountAction: "नया मुफ्त मरीज़ खाता बनाएं",

    // Health Camps & SDG 3
    sdg3Title: "संयुक्त राष्ट्र सतत विकास लक्ष्य 3",
    goodHealth: "सभी के लिए उत्तम स्वास्थ्य और खुशहाली",
    freeHealthCamps: "सामुदायिक स्वास्थ्य शिविर",
    upcomingCamps: "आगामी निःशुल्क सामुदायिक स्वास्थ्य शिविर",
    campsSubtitle: "नियमित जांच, बाल पोषण और स्वास्थ्य जागरूकता अभियान",
    rsvpCamp: "मुफ्त जांच के लिए पंजीकरण करें",
    rsvpd: "पंजीकृत (उपस्थित होंगे)",
    attendees: "पंजीकृत नागरिक",

    // Doctor & Queue
    doctorQueue: "डॉक्टर परामर्श कतार",
    inQueue: "प्रतीक्षारत",
    completed: "सम्पन्न",
    totalAppointments: "कुल परामर्श",
    startConsultation: "परामर्श प्रारंभ करें",
    patientHistory: "पूर्व मेडिकल इतिहास",
    quickRxTemplates: "दवा त्वरित टेम्पलेट",
    recordVitals: "वाइटल्स दर्ज करें (जांच)",
    bp: "रक्तचाप (BP)",
    pulse: "पल्स (bpm)",
    temp: "तापमान (°F)",
    spo2: "ऑक्सीजन SpO2 (%)",
    sugar: "ब्लड शुगर (mg/dL)",

    // Kiosk & Voice
    callingToken: "बुलाया जा रहा टोकन",
    proceedToCabin: "कृपया यहां पधारें:",
    voiceAnnouncement: "ध्वनि उद्घोषक",
    privacyMasking: "गोपनीयता मोड",

    // Walk-in & Pharmacy
    walkInToken: "वॉक-इन तुरंत टोकन",
    pharmacyQueue: "निःशुल्क दवा वितरण",
    dispenseMedication: "दवा वितरित करें",
    dispensed: "वितरित"
  }
};

// Helper to trigger Google Translate when available
function triggerGoogleTranslate(lang) {
  if (typeof window === 'undefined') return;
  try {
    if (lang === 'en') {
      document.cookie = 'googtrans=/en/en; path=/;';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    } else {
      document.cookie = `googtrans=/en/${lang}; path=/;`;
    }
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event('change'));
    }
  } catch (e) {
    // Non-blocking fallback
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('apna_clinic_lang') || 'en';
    }
    return 'en';
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('apna_clinic_lang', lang);
      document.documentElement.lang = lang;
      triggerGoogleTranslate(lang);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  // Sync Google translate on mount if previously set to Hindi
  useEffect(() => {
    const saved = localStorage.getItem('apna_clinic_lang') || 'en';
    document.documentElement.lang = saved;
    if (saved === 'hi') {
      const timer = setTimeout(() => {
        triggerGoogleTranslate('hi');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const t = (key, fallback = '') => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en',
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: (key, fallback) => fallback || key
    };
  }
  return context;
}
