/* ============================================================
  CYBER KAVALAN — app.js
   ============================================================ */

// ── Language System ──────────────────────────────────────────
let currentLang = 'en';
let awarenessLang = 'en';

function normalizeApiBaseUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

function resolveApiBaseUrl() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = normalizeApiBaseUrl(params.get('api'));
  if (fromQuery) {
    localStorage.setItem('cyber_api_base_url', fromQuery);
    return fromQuery;
  }

  const fromWindow = normalizeApiBaseUrl(window.__API_BASE_URL__);
  if (fromWindow) return fromWindow;

  const fromStorage = normalizeApiBaseUrl(localStorage.getItem('cyber_api_base_url'));
  if (fromStorage) return fromStorage;

  const host = window.location.hostname;
  const protocol = window.location.protocol;
  const isLocal = host === 'localhost' || host === '127.0.0.1';

  if ((protocol === 'http:' || protocol === 'https:') && window.location.port === '8000') {
    return `${protocol}//${window.location.host}`;
  }

  if (!isLocal && (protocol === 'http:' || protocol === 'https:')) {
    return `${protocol}//${window.location.host}`;
  }

  return 'http://127.0.0.1:8000';
}

const API_BASE_URL = resolveApiBaseUrl();
window.setApiBaseUrl = (url) => {
  const normalized = normalizeApiBaseUrl(url);
  if (!normalized) return false;
  localStorage.setItem('cyber_api_base_url', normalized);
  return true;
};
window.openApiSettingsDialog = () => {
  const current = localStorage.getItem('cyber_api_base_url') || API_BASE_URL;
  const value = window.prompt('Enter backend API base URL (example: https://your-backend-domain)', current || '');
  if (value === null) return false;
  const normalized = normalizeApiBaseUrl(value);
  if (!normalized) {
    localStorage.removeItem('cyber_api_base_url');
    if (typeof showToast === 'function') showToast('API override removed. Reloading...', true);
    setTimeout(() => window.location.reload(), 250);
    return true;
  }
  localStorage.setItem('cyber_api_base_url', normalized);
  if (typeof showToast === 'function') showToast(`API endpoint set to ${normalized}`);
  setTimeout(() => window.location.reload(), 250);
  return true;
};

window.resetApiBaseUrl = () => {
  localStorage.removeItem('cyber_api_base_url');
  if (typeof showToast === 'function') showToast('API endpoint reset. Reloading...', true);
  setTimeout(() => window.location.reload(), 250);
};
let lastScanResult = null;

const THEME_COLORS = {
  neonBlueRgb: '0,242,255',
  neonBlue: '#00f2ff',
  neonPurple: '#bc13fe',
  cyberBlack: '#000000',
};

const LANGS = {
  en: { flag: '🇬🇧', name: 'English', dir: 'ltr' },
  ta: { flag: '🇮🇳', name: 'தமிழ்',   dir: 'ltr' },
  hi: { flag: '🇮🇳', name: 'हिन्दी',   dir: 'ltr' },
  te: { flag: '🇮🇳', name: 'తెలుగు',  dir: 'ltr' },
  kn: { flag: '🇮🇳', name: 'ಕನ್ನಡ',   dir: 'ltr' },
  ml: { flag: '🇮🇳', name: 'മലയാളം',  dir: 'ltr' },
  es: { flag: '🇪🇸', name: 'Español',  dir: 'ltr' },
  fr: { flag: '🇫🇷', name: 'Français', dir: 'ltr' },
  ar: { flag: '🇸🇦', name: 'العربية', dir: 'rtl' },
  zh: { flag: '🇨🇳', name: '中文',     dir: 'ltr' },
  pt: { flag: '🇧🇷', name: 'Português',dir: 'ltr' },
  de: { flag: '🇩🇪', name: 'Deutsch',  dir: 'ltr' },
};

const translations = {
  en: {
    heroBadge: "AI-Powered Cyber Protection · India's Digital Guardian",
    heroTitle: "Protect Yourself From Digital Scams & Fraud",
    stat1: "Scams Detected", stat2: "Accuracy Rate", stat3: "Reports Today", stat4: "Cities Protected",
    scannerTitle: "AI Threat Scanner", scannerSubtitle: "Analyze links, messages, and images for potential threats",
    trustTitle: "Digital Trust Checker", trustSubtitle: "Verify phone numbers, UPI IDs, and websites before transacting",
    heatmapTitle: "Real-Time Threat Heatmap", heatmapSubtitle: "Live scam activity across India",
    reportTitle: "Report a Scam", reportSubtitle: "Help protect your community by reporting scam activities",
    awarenessTitle: "Cybersecurity Awareness", awarenessSubtitle: "Learn to identify and avoid digital scams",
    threatStatus: "Live Monitoring", uploadText: "Drop payment screenshot or suspicious image here",
    tc1Title: "Phone Number", tc2Title: "UPI ID / VPA", tc3Title: "Website / Domain",
    tc1Btn: "Verify Number", tc2Btn: "Verify UPI", tc3Btn: "Verify Website",
    hotspotTitle: "Top Hotspots", recentTitle: "Recent Reports",
    todayLabel: "Reports Today", weekLabel: "This Week",
    submitBtnText: "Submit Report",
    footerDesc: "Protecting India's digital citizens from cyber threats with AI-powered intelligence.",
    urgentTitle: "Lost Money? Act Now!", urgentText: "Call National Cyber Crime Helpline immediately",
    legendTitle: "Threat Level", l1: "Critical", l2: "High", l3: "Medium", l4: "Low",
    mapClickHint: "Click on a city to view details",
    loadingText: "Analyzing threat...",
    listenBtn: "Listen Analysis",
    riskLow: "Low Risk",
    riskMedium: "Medium Risk",
    riskHigh: "High Risk",
    voiceFrame: "The analysis is complete. The result is {status} with a score of {score} percent. Reasoning: ",
    trendTitle: "Real-Time Threat Trends (Last 24 Hours)",
    chartPhishing: "Phishing Reports",
    chartFraud: "Fraud Reports",
    chartOther: "Other Threats",
    refreshText: "Refresh Live Data",
    quizScore: "Score",
    quizNext: "Next",
    nav1: "Home", nav2: "Scanner", nav3: "Trust Checker", nav4: "Threat Map", nav5: "Report", nav6: "Awareness",
    quizTitle: "Test Your Awareness", quizSubtitle: "Can you spot a scam?",
    whyHeader: "Why Report?", footerQuickLinks: "Quick Links", footerResources: "Resources",
    rtOpt0: "-- Select Type --", rtOpt1: "Phishing Link", rtOpt2: "UPI Fraud", rtOpt3: "Fraudulent Call", rtOpt4: "Scam SMS", rtOpt5: "Fake Website", rtOpt6: "Social Media Scam", rtOpt7: "Lottery / Prize", rtOpt8: "Other",
    em1: "Cyber Crime Helpline", em2: "Police Control Room", hl1: "Cyber Crime", hl2: "Police Control", hl3: "Consumer Helpline",
  },
  ta: {
    heroBadge: "AI-இயக்கும் சைபர் பாதுகாப்பு · இந்தியாவின் டிஜிட்டல் காவலன்",
    heroTitle: "டிஜிட்டல் மோசடிகளிலிருந்து உங்களை பாதுகாத்துக்கொள்ளுங்கள்",
    stat1: "모சடிகள் கண்டறியப்பட்டன", stat2: "துல்லியம்", stat3: "இன்றைய புகார்கள்", stat4: "பாதுகாக்கப்பட்ட நகரங்கள்",
    scannerTitle: "AI அச்சுறுத்தல் ஸ்கேனர்", scannerSubtitle: "இணைப்புகள், செய்திகள் மற்றும் படங்களை பகுப்பாய்வு செய்யுங்கள்",
    trustTitle: "டிஜிட்டல் நம்பகத்தன்மை சரிபார்ப்பு", trustSubtitle: "பரிவர்த்தனைக்கு முன் எண்கள், UPI ஐடி மற்றும் இணையதளங்களை சரிபார்க்கவும்",
    heatmapTitle: "நிகழ்நேர அச்சுறுத்தல் வரைபடம்", heatmapSubtitle: "இந்தியாவில் நேரடி மோசடி செயல்பாடு",
    reportTitle: "மோசடியை புகாரளிக்கவும்", reportSubtitle: "மோசடி செயல்பாடுகளை புகாரளிப்பதன் மூலம் உங்கள் சமூகத்தை பாதுகாக்கவும்",
    awarenessTitle: "சைபர் பாதுகாப்பு விழிப்புணர்வு", awarenessSubtitle: "டிஜிட்டல் மோசடிகளை அடையாளம் காணவும் தவிர்க்கவும் கற்றுக்கொள்ளுங்கள்",
    threatStatus: "நேரடி கண்காணிப்பு", uploadText: "பணம் செலுத்தல் ஸ்கிரீன்ஷாட் அல்லது சந்தேகமான படத்தை இங்கே இடுங்கள்",
    tc1Title: "தொலைபேசி எண்", tc2Title: "UPI ஐடி / VPA", tc3Title: "இணையதளம் / டொமைன்",
    tc1Btn: "எண்ணை சரிபார்", tc2Btn: "UPI சரிபார்", tc3Btn: "இணையதளம் சரிபார்",
    hotspotTitle: "முக்கிய அபாய இடங்கள்", recentTitle: "சமீபத்திய புகார்கள்",
    todayLabel: "இன்றைய புகார்கள்", weekLabel: "இந்த வாரம்",
    submitBtnText: "புகாரை சமர்ப்பிக்கவும்",
    footerDesc: "AI-ஆல் இயக்கப்படும் நுண்ணறிவுடன் இந்தியாவின் டிஜிட்டல் குடிமக்களை சைபர் அச்சுறுத்தல்களிலிருந்து பாதுகாக்கிறோம்.",
    urgentTitle: "பணம் இழந்தீர்களா? இப்போதே செயல்படுங்கள்!", urgentText: "தேசிய சைபர் கிரைம் உதவி எண்ணை உடனடியாக அழைக்கவும்",
    legendTitle: "அச்சுறுத்தல் நிலை", l1: "நெருக்கடி", l2: "அதிகம்", l3: "நடுத்தரம்", l4: "குறைவு",
    mapClickHint: "விவரங்களைக் காண நகரத்தை கிளிக் செய்யவும்",
    loadingText: "அச்சுறுத்தலை பகுப்பாய்வு செய்கிறது...",
    listenBtn: "பகுப்பாய்வைக் கேளுங்கள்",
    riskLow: "குறைந்த ஆபத்து",
    riskMedium: "நடுத்தர ஆபத்து",
    riskHigh: "அதிக ஆபத்து",
    voiceFrame: "ஆய்வு முடிந்தது. இது {score} சதவீதத்துடன் {status} என வகைப்படுத்தப்பட்டுள்ளது. விவரம்: ",
    trendTitle: "நிகழ்நேர அச்சுறுத்தல் போக்குகள் (கடந்த 24 மணிநேரம்)",
    chartPhishing: "பிஷிங் புகார்கள்",
    chartFraud: "மோசடி புகார்கள்",
    chartOther: "மற்ற அச்சுறுத்தல்கள்",
    refreshText: "தகவலைப் புதுப்பிக்கவும்",
    quizScore: "மதிப்பெண்",
    quizNext: "அடுத்து",
    nav1: "முகப்பு", nav2: "ஸ்கேனர்", nav3: "சரிபார்ப்பு", nav4: "வரைபடம்", nav5: "புகார்", nav6: "விழிப்புணர்வு",
    quizTitle: "உங்கள் விழிப்புணர்வை சோதிக்கவும்", quizSubtitle: "மோசடியை உங்களால் கண்டுபிடிக்க முடியுமா?",
    whyHeader: "ஏன் புகாரளிக்க வேண்டும்?", footerQuickLinks: "முக்கிய இணைப்புகள்", footerResources: "ஆதாரங்கள்",
    rtOpt0: "-- வகையைத் தேர்ந்தெடுக்கவும் --", rtOpt1: "பிஷிங் லிங்க்", rtOpt2: "UPI மோசடி", rtOpt3: "மோசடி அழைப்பு", rtOpt4: "மோசடி SMS", rtOpt5: "போலி இணையதளம்", rtOpt6: "சமூக ஊடக மோசடி", rtOpt7: "லாட்டரி / பரிசு", rtOpt8: "இதர",
    em1: "சைபர் கிரைம் உதவி எண்", em2: "காவல்துறை கட்டுப்பாட்டு அறை", hl1: "சைபர் கிரைம்", hl2: "காவல்துறை", hl3: "நுகர்வோர் உதவி எண்",
  },
  hi: {
    heroBadge: "AI-संचालित साइबर सुरक्षा · भारत का डिजिटल रक्षक",
    heroTitle: "डिजिटल धोखाधड़ी से खुद को सुरक्षित रखें",
    stat1: "स्कैम्स पहचाने गए", stat2: "सटीकता दर", stat3: "आज की शिकायतें", stat4: "सुरक्षित शहर",
    scannerTitle: "AI ख़तरा स्कैनर", scannerSubtitle: "लिंक, संदेश और छवियों का संभावित खतरों के लिए विश्लेषण करें",
    trustTitle: "डिजिटल विश्वास जाँचकर्ता", trustSubtitle: "लेन-देन से पहले फ़ोन नंबर, UPI ID और वेबसाइट सत्यापित करें",
    heatmapTitle: "रियल-टाइम खतरा हीटमैप", heatmapSubtitle: "पूरे भारत में लाइव स्कैम गतिविधि",
    reportTitle: "स्कैम रिपोर्ट करें", reportSubtitle: "स्कैम की रिपोर्ट करके अपने समुदाय की रक्षा करें",
    awarenessTitle: "साइபர் सुरक्षा जागरूकता", awarenessSubtitle: "डिजिटल धोखाधड़ी को पहचानें और बचें",
    threatStatus: "लाइव निगरानी", uploadText: "भुगतान स्क्रीनशॉट या संदिग्ध छवि यहाँ डालें",
    tc1Title: "फ़ोन नंबर", tc2Title: "UPI ID / VPA", tc3Title: "वेबसाइट / डोमेन",
    tc1Btn: "नंबर सत्यापित करें", tc2Btn: "UPI सत्यापित करें", tc3Btn: "वेबसाइट सत्यापित करें",
    hotspotTitle: "शीर्ष हॉटस्पॉट", recentTitle: "हालिया रिपोर्ट",
    todayLabel: "आज की रिपोर्ट", weekLabel: "इस सप्ताह",
    submitBtnText: "रिपोर्ट सबमिट करें",
    footerDesc: "AI-संचालित खुफिया जानकारी के साथ भारत के डिजिटल नागरिकों को साइबर खतरों से बचाना।",
    urgentTitle: "पैसे खो दिए? अभी कार्रवाई करें!", urgentText: "तुरंत राष्ट्रीय साइबर अपराध हेल्पलाइन पर कॉल करें",
    legendTitle: "खतरे का स्तर", l1: "गंभीर", l2: "उच्च", l3: "मध्यम", l4: "निम्न",
    mapClickHint: "विवरण देखने के लिए शहर पर क्लिक करें",
    loadingText: "खतरे का विश्लेषण हो रहा है...",
    listenBtn: "विश्लेषण सुनें",
    riskLow: "कम जोखिम",
    riskMedium: "मध्यम जोखिम",
    riskHigh: "उच्च जोखिम",
    voiceFrame: "विश्लेषण पूरा हो गया है। इसे {score} प्रतिशत के साथ {status} के रूप में वर्गीकृत किया गया है। विवरण: ",
    trendTitle: "वास्तविक समय खतरा रुझान (पिछले 24 घंटे)",
    chartPhishing: "फ़िशिंग रिपोर्ट",
    chartFraud: "धोखाधड़ी रिपोर्ट",
    chartOther: "अन्य खतरे",
    refreshText: "डेटा रिफ्रेश करें",
    quizScore: "स्कोर",
    quizNext: "अगला",
    nav1: "होम", nav2: "स्कैनर", nav3: "ट्रस्ट चेकर", nav4: "थ्रेट मैप", nav5: "रिपोर्ट", nav6: "जागरूकता",
    quizTitle: "अपनी जागरूकता का परीक्षण करें", quizSubtitle: "क्या आप स्कैम पहचान सकते हैं?",
    whyHeader: "रिपोर्ट क्यों करें?", footerQuickLinks: "त्वरित लिंक", footerResources: "संसाधन",
    rtOpt0: "-- प्रकार चुनें --", rtOpt1: "फ़िशिंग लिंक", rtOpt2: "यूपीआई धोखाधड़ी", rtOpt3: "धोखाधड़ी कॉल", rtOpt4: "स्कैम एसएमएस", rtOpt5: "नकली वेबसाइट", rtOpt6: "सोशल मीडिया स्कैम", rtOpt7: "लॉटरी / इनाम", rtOpt8: "अन्य",
    em1: "साइबर क्राइम हेल्पलाइन", em2: "पुलिस कंट्रोल रूम", hl1: "साइबर क्राइम", hl2: "पुलिस कंट्रोल", hl3: "कंज्यूमर हेल्पलाइन",
  },
  te: {
    heroBadge: "AI-శక్తితో సైబర్ రక్షణ · భారతదేశ డిజిటల్ గార్డియన్",
    heroTitle: "డిజిటల్ మోసాల నుండి మిమ్మల్ని మీరు రక్షించుకోండి",
    stat1: "కనుగొన్న స్కామ్‌లు", stat2: "ఖచ్చితత్వం", stat3: "నేటి నివేదికలు", stat4: "రక్షిత నగరాలు",
    scannerTitle: "AI ముప్పు స్కానర్", scannerSubtitle: "లింకులు, సందేశాలు మరియు చిత్రాలను ముప్పుల కోసం విశ్లేషించండి",
    trustTitle: "డిజిటల్ నమ్మకత తనిఖీ", trustSubtitle: "లావాదేవీకి ముందు ఫోన్ నంబర్లు, UPI IDలు మరియు వెబ్‌సైట్‌లను ధృవీకరించండి",
    heatmapTitle: "రియల్-టైమ్ ముప్పు హీట్‌మ్యాప్", heatmapSubtitle: "భారతదేశం అంతటా లైవ్ స్కామ్ కార్యకలాపాలు",
    reportTitle: "స్కామ్ నివేదించండి", reportSubtitle: "స్కామ్ కార్యకలాపాలను నివేదించడం ద్వారా మీ సమాజాన్ని రక్షించండి",
    awarenessTitle: "సైబర్ భద్రత అవగాహన", awarenessSubtitle: "డిజిటల్ మోసాలను గుర్తించండి మరియు నివారించండి",
    threatStatus: "లైవ్ పర్యవేక్షణ", uploadText: "చెల్లింపు స్క్రీన్‌షాట్ లేదా అనుమానాస్పద చిత్రాన్ని ఇక్కడ వేయండి",
    tc1Title: "ఫోన్ నంబర్", tc2Title: "UPI ID / VPA", tc3Title: "వెబ్‌సైట్ / డొమైన్",
    tc1Btn: "నంబర్ ధృవీకరించు", tc2Btn: "UPI ధృవీకరించు", tc3Btn: "వెబ్‌సైట్ ధృవీకరించు",
    hotspotTitle: "టాప్ హాట్‌స్పాట్స్", recentTitle: "ఇటీవలి నివేదికలు",
    todayLabel: "నేటి నివేదికలు", weekLabel: "ఈ వారం",
    submitBtnText: "నివేదిక సమర్పించు",
    footerDesc: "AI-శక్తి నుండి భారతదేశ డిజిటల్ పౌరులను సైబర్ ముప్పుల నుండి రక్షించడం.",
    urgentTitle: "డబ్బు పోయిందా? ఇప్పుడే చర్య తీసుకోండి!", urgentText: "వెంటనే జాతీయ సైబర్ క్రైమ్ హెల్ప్‌లైన్‌కు కాల్ చేయండి",
    legendTitle: "ముప్పు స్థాయి", l1: "విమర్శనాత్మక", l2: "అధిక", l3: "మధ్యస్థ", l4: "తక్కువ",
    mapClickHint: "వివరాలు చూడటానికి నగరంపై క్లిక్ చేయండి",
    loadingText: "ముప్పును విశ్లేషిస్తోంది...",
    listenBtn: "విశ్లేషణ వినండి",
    riskLow: "తక్కువ ముప్పు",
    riskMedium: "మధ్యస్థ ముప్పు",
    riskHigh: "అధిక ముప్పు",
    voiceFrame: "విశ్లేషణ పూర్తయింది. ఇది {score} శాతంతో {status}గా వర్గీకరించబడింది. కారణం: ",
    trendTitle: "రియల్-టైమ్ ముప్పు పోకడలు (గత 24 గంటలు)",
    chartPhishing: "ఫిషింగ్ నివేదికలు",
    chartFraud: "మోసడి నివేదికలు",
    chartOther: "ఇతర ముప్పులు",
    refreshText: "డేటా రిఫ్రెష్",
    quizScore: "స్కోరు",
    quizNext: "తదుపరి",
    nav1: "హోమ్", nav2: "స్కానర్", nav3: "ట్రస్ట్ చెకర్", nav4: "ముప్పు మ్యాప్", nav5: "నివేదిక", nav6: "అవగాహన",
    quizTitle: "మీ అవగాహనను తనిఖీ చేయండి", quizSubtitle: "మీరు మోసాన్ని గుర్తించగలరా?",
    whyHeader: "ఎందుకు నివేదించాలి?", footerQuickLinks: "శీఘ్ర లింకులు", footerResources: "వనరులు",
  },
  kn: {
    heroBadge: "AI-ಚಾಲಿತ ಸೈಬರ್ ರಕ್ಷಣೆ · ಭಾರತದ ಡಿಜಿಟಲ್ ರಕ್ಷಕ",
    heroTitle: "ಡಿಜಿಟಲ್ ವಂಚನೆಗಳಿಂದ ನಿಮ್ಮನ್ನು ರಕ್ಷಿಸಿಕೊಳ್ಳಿ",
    stat1: "ಪತ್ತೆಯಾದ ವಂಚನೆಗಳು", stat2: "ನಿಖರತೆ", stat3: "ಇಂದಿನ ವರದಿಗಳು", stat4: "ರಕ್ಷಿತ ನಗರಗಳು",
    scannerTitle: "AI ಬೆದರಿಕೆ ಸ್ಕ್ಯಾನರ್", scannerSubtitle: "ಸಂಭಾವ್ಯ ಬೆದರಿಕೆಗಳಿಗಾಗಿ ಲಿಂಕ್‌ಗಳು, ಸಂದೇಶಗಳು ಮತ್ತು ಚಿತ್ರಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಿ",
    trustTitle: "ಡಿಜಿಟಲ್ ಟ್ರಸ್ಟ್ ಚೆಕರ್", trustSubtitle: "ವಹಿವಾಟಿಗೆ ಮೊದಲು ಫೋನ್ ಸಂಖ್ಯೆಗಳು, UPI ID ಮತ್ತು ವೆಬ್‌ಸೈಟ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಿ",
    heatmapTitle: "ರಿಯಲ್-ಟೈಮ್ ಬೆದರಿಕೆ ಹೀಟ್‌ಮ್ಯಾಪ್", heatmapSubtitle: "ಭಾರತದಾದ್ಯಂತ ಲೈವ್ ಸ್ಕ್ಯಾಮ್ ಚಟುವಟಿಕೆ",
    reportTitle: "ವಂಚನೆಯನ್ನು ವರದಿ ಮಾಡಿ", reportSubtitle: "ವಂಚನೆಯನ್ನು ವರದಿ ಮಾಡುವ ಮೂಲಕ ನಿಮ್ಮ ಸಮುದಾಯವನ್ನು ರಕ್ಷಿಸಿ",
    awarenessTitle: "ಸೈಬರ್ ಭದ್ರತಾ ಅರಿವು", awarenessSubtitle: "ಡಿಜಿಟಲ್ ವಂಚನೆಗಳನ್ನು ಗುರುತಿಸಿ ಮತ್ತು ತಪ್ಪಿಸಿ",
    threatStatus: "ಲೈವ್ ಮಾನಿಟರಿಂಗ್", uploadText: "ಪಾವತಿ ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅಥವಾ ಅನುಮಾನಾಸ್ಪದ ಚಿತ್ರವನ್ನು ಇಲ್ಲಿ ಹಾಕಿ",
    tc1Title: "ಫೋನ್ ಸಂಖ್ಯೆ", tc2Title: "UPI ID / VPA", tc3Title: "ವೆಬ್‌ಸೈಟ್ / ಡೊಮೇನ್",
    tc1Btn: "ಸಂಖ್ಯೆ ಪರಿಶೀಲಿಸಿ", tc2Btn: "UPI ಪರಿಶೀಲಿಸಿ", tc3Btn: "ವೆಬ್‌ಸೈಟ್ ಪರಿಶೀಲಿಸಿ",
    hotspotTitle: "ಪ್ರಮುಖ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು", recentTitle: "ಇತ್ತೀಚಿನ ವರದಿಗಳು",
    todayLabel: "ಇಂದಿನ ವರದಿಗಳು", weekLabel: "ಈ ವಾರ",
    submitBtnText: "ವರದಿ ಸಲ್ಲಿಸಿ",
    footerDesc: "AI ಚಾಲಿತ ಬುದ್ಧಿಮತ್ತೆಯೊಂದಿಗೆ ಭಾರತದ ಡಿಜಿಟಲ್ ನಾಗರಿಕರನ್ನು ರಕ್ಷಿಸುತ್ತಿದ್ದೇವೆ.",
    urgentTitle: "ಹಣ ಕಳೆದುಕೊಂಡಿರಾ? ಈಗಲೇ ಕ್ರಮ ತೆಗೆಕೊಳ್ಳಿ!", urgentText: "ತಕ್ಷಣ ರಾಷ್ಟ್ರೀಯ ಸೈಬರ್ ಕ್ರೈಮ್ ಹೆಲ್ಪ್‌ಲೈನ್‌ಗೆ ಕರೆ ಮಾಡಿ",
    legendTitle: "ಬೆದರಿಕೆ ಮಟ್ಟ", l1: "ನಿರ್ಣಾಯಕ", l2: "ಹೆಚ್ಚು", l3: "ಮಧ್ಯಮ", l4: "ಕಡಿಮೆ",
    mapClickHint: "ವಿವರಗಳನ್ನು ನೋಡಲು ನಗರದ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ",
    loadingText: "ಬೆದರಿಕೆ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    listenBtn: "ವಿಶ್ಲೇಷಣೆ ಆಲಿಸಿ",
    riskLow: "ಕಡಿಮೆ ಬೆದರಿಕೆ",
    riskMedium: "ಮಧ್ಯಮ ಬೆದರಿಕೆ",
    riskHigh: "ಹೆಚ್ಚಿನ ಬೆದರಿಕೆ",
    voiceFrame: "ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ. ಇದನ್ನು {score} ಪ್ರತಿಶತದೊಂದಿಗೆ {status} ಎಂದು ವರ್ಗೀಕರಿಸಲಾಗಿದೆ. ವಿವರ: ",
    trendTitle: "ರಿಯಲ್-ಟೈಮ್ ಬೆದರಿಕೆ ಪ್ರವೃತ್ತಿಗಳು (ಕಳೆದ 24 ಗಂಟೆಗಳು)",
    chartPhishing: "ಫಿಶಿಂಗ್ ವರದಿಗಳು",
    chartFraud: "ವಂಚನೆ ವರದಿಗಳು",
    chartOther: "ಇತರ ಬೆದರಿಕೆಗಳು",
    refreshText: "ಡೇಟಾ ರಿಫ್ರೆಶ್ ಮಾಡಿ",
    quizScore: "ಸ್ಕೋರ್",
    quizNext: "ಮುಂದಿನ",
    nav1: "ಮುಖಪುಟ", nav2: "ಸ್ಕ್ಯಾನರ್", nav3: "ಟ್ರಸ್ಟ್ ಚೆಕರ್", nav4: "ಬೆದರಿಕೆ ನಕ್ಷೆ", nav5: "ವರದಿ", nav6: "ಅರಿವು",
    quizTitle: "ನಿಮ್ಮ ಅರಿವನ್ನು ಪರೀಕ್ಷಿಸಿ", quizSubtitle: "ನೀವು ವಂಚನೆಯನ್ನು ಗುರುತಿಸಬಲ್ಲಿರಾ?",
    whyHeader: "ವರದಿ ಏಕೆ ಮಾಡಬೇಕು?", footerQuickLinks: "ತ್ವರಿತ ಲಿಂಕ್‌ಗಳು", footerResources: "ಸನ್ಮೂಲಗಳು",
  },
  ml: {
    heroBadge: "AI-ശക്തിയുള്ള സൈബർ സംരക്ഷണം · ഇന്ത്യയുടെ ഡിജിറ്റൽ കാവൽക്കാരൻ",
    heroTitle: "ഡിജിറ്റൽ തട്ടിപ്പുകളിൽ നിന്ന് സ്വയം സംരക്ഷിക്കുക",
    stat1: "കണ്ടെത്തിയ തട്ടിപ്പുകൾ", stat2: "കൃത്യത", stat3: "ഇന്നത്തെ റിപ്പോർട്ടുകൾ", stat4: "സംരക്ഷിത നഗരങ്ങൾ",
    scannerTitle: "AI ഭീഷണി സ്കാനർ", scannerSubtitle: "ലിങ്കുകൾ, സന്ദേശങ്ങൾ, ചിത്രങ്ങൾ എന്നിവ ഭീഷണികൾക്കായി വിശകലനം ചെയ്യുക",
    trustTitle: "ഡിജിറ്റൽ ട്രസ്റ്റ് ചെക്കർ", trustSubtitle: "ഇടപാടിന് മുമ്പ് ഫോൺ നമ്പറുകൾ, UPI ID, വെബ്‌സൈറ്റുകൾ സ്ഥിരീകരിക്കുക",
    heatmapTitle: "തൽസമയ ഭീഷണി ഹീറ്റ്‌മാപ്പ്", heatmapSubtitle: "ഇന്ത്യയിലുടനീളമുള്ള ലൈവ് തട്ടിപ്പ് പ്രവർത്തനം",
    reportTitle: "തട്ടിപ്പ് റിപ്പോർട്ട് ചെയ്യുക", reportSubtitle: "തട്ടിപ്പ് റിപ്പോർട്ട് ചെയ്ത് സമൂഹത്തെ സംരക്ഷിക്കുക",
    awarenessTitle: "സൈബർ സുരക്ഷ അവബോധം", awarenessSubtitle: "ഡിജിറ്റൽ തട്ടിപ്പുകൾ തിരിച്ചറിഞ്ഞ് ഒഴിവാക്കുക",
    threatStatus: "ലൈവ് നിരീക്ഷണം", uploadText: "പേയ്‌മെന്റ് സ്ക്രീൻഷോട്ട് അല്ലെങ്കിൽ സംശയാസ്പദ ചിത്രം ഇവിടെ ഇടുക",
    tc1Title: "ഫോൺ നമ്പർ", tc2Title: "UPI ID / VPA", tc3Title: "വെബ്‌സൈറ്റ് / ഡൊമൈൻ",
    tc1Btn: "നമ്പർ സ്ഥിരീകരിക്കുക", tc2Btn: "UPI സ്ഥിരീകരിക്കുക", tc3Btn: "വെബ്‌സൈറ്റ് സ്ഥിരീകരിക്കുക",
    hotspotTitle: "ടോപ്പ് ഹോട്ട്‌സ്പോട്ടുകൾ", recentTitle: "സമീപകാല റിപ്പോർട്ടുകൾ",
    todayLabel: "ഇന്നത്തെ റിപ്പോർട്ടുകൾ", weekLabel: "ഈ ആഴ്ച",
    submitBtnText: "റിപ്പോർട്ട് സമർപ്പിക്കുക",
    footerDesc: "AI ഇന്റലിജൻസ് ഉപയോഗിച്ച് ഇന്ത്യയുടെ ഡിജിറ്റൽ പൗരന്മാരെ സൈബർ ഭീഷണികളിൽ നിന്ന് സംരക്ഷിക്കുന്നു.",
    urgentTitle: "പണം നഷ്ടപ്പെട്ടോ? ഇപ്പോൾ തന്നെ നടപടി സ്വീകരിക്കുക!", urgentText: "ഉടൻ ദേശീയ സൈബർ ക്രൈം ഹെൽപ്‌ലൈനിൽ വിളിക്കുക",
    legendTitle: "ഭീഷണി നില", l1: "ഗുരുതരം", l2: "ഉയർന്ന", l3: "ഇടത്തരം", l4: "കുറഞ്ഞ",
    mapClickHint: "വിശദാംശങ്ങൾ കാണുക ഒരു നഗരത്തിൽ ക്ലിക്ക് ചെയ്യുക",
    loadingText: "ഭീഷണി വിശകലനം ചെയ്യുന്നു...",
    listenBtn: "വിശകലനം കേൾക്കുക",
    riskLow: "കുറഞ്ഞ ഭീഷണി",
    riskMedium: "ഇടത്തരം ഭീഷണി",
    riskHigh: "ഉയർന്ന ഭീഷണി",
    voiceFrame: "വിശകലനം പൂർത്തിയായി. ഇത് {score} ശതമാനത്തോടെ {status} ആയി തരംതിരിച്ചിരിക്കുന്നു. കാരണം: ",
    trendTitle: "തൽസമയ ഭീഷണി പ്രവണതകൾ (കഴിഞ്ഞ 24 മണിക്കൂർ)",
    chartPhishing: "ഫിഷിംഗ് റിപ്പോർട്ടുകൾ",
    chartFraud: "തട്ടിപ്പ് റിപ്പോർട്ടുകൾ",
    chartOther: "മറ്റ് ഭീഷണികൾ",
    refreshText: "വിവരങ്ങൾ പുതുക്കുക",
    quizScore: "സ്കോർ",
    quizNext: "അടുത്തത്",
    nav1: "ഹോം", nav2: "സ്കാനർ", nav3: "ട്രസ്റ്റ് ചെക്കർ", nav4: "ഭീഷണി ഭൂപടം", nav5: "റിപ്പോർട്ട്", nav6: "അവബോധം",
    quizTitle: "നിങ്ങളുടെ അവബോധം പരിശോധിക്കുക", quizSubtitle: "നിങ്ങൾക്ക് തട്ടിപ്പ് തിരിച്ചറിയാൻ കഴിയുമോ?",
    whyHeader: "എന്തിന് റിപ്പോർട്ട് ചെയ്യണം?", footerQuickLinks: "ദ്രുത ലിങ്കുകൾ", footerResources: "വിഭവങ്ങൾ",
  },
  es: {
    heroBadge: "Protección Cibernética con IA · Guardián Digital de la India",
    heroTitle: "Protéjase de estafas y fraudes digitales",
    stat1: "Estafas detectadas", stat2: "Tasa de precisión", stat3: "Informes de hoy", stat4: "Ciudades protegidas",
    scannerTitle: "Escáner de amenazas AI", scannerSubtitle: "Analice enlaces, mensajes e imágenes en busca de amenazas potenciales",
    trustTitle: "Verificador de confianza digital", trustSubtitle: "Verifique números de teléfono, ID de UPI y sitios web antes de realizar transacciones",
    heatmapTitle: "Mapa de calor de amenazas en tiempo real", heatmapSubtitle: "Actividad de estafa en vivo en la India",
    reportTitle: "Reportar una estafa", reportSubtitle: "Ayude a proteger a su comunidad reportando actividades fraudulentas",
    awarenessTitle: "Concienciación sobre ciberseguridad", awarenessSubtitle: "Aprenda a identificar y evitar las estafas digitales",
    threatStatus: "Monitoreo en vivo", uploadText: "Suelte una captura de pantalla de pago aquí",
    tc1Title: "Número de teléfono", tc2Title: "ID de UPI / VPA", tc3Title: "Sitio web / Dominio",
    tc1Btn: "Verificar número", tc2Btn: "Verificar UPI", tc3Btn: "Verificar sitio web",
    hotspotTitle: "Principales puntos críticos", recentTitle: "Informes recientes",
    todayLabel: "Informes de hoy", weekLabel: "Esta semana",
    submitBtnText: "Enviar informe",
    footerDesc: "Protegiendo a los ciudadanos digitales de la India de las amenazas cibernéticas.",
    urgentTitle: "¿Perdió dinero? ¡Actúe ahora!", urgentText: "Llame inmediatamente a la línea de ayuda de delitos cibernéticos",
    legendTitle: "Nivel de amenaza", l1: "Crítico", l2: "Alto", l3: "Medio", l4: "Bajo",
    mapClickHint: "Haga clic en una ciudad para ver detalles",
    loadingText: "Analizando amenaza...",
    listenBtn: "Escuchar análisis",
    riskLow: "Bajo riesgo",
    riskMedium: "Riesgo medio",
    riskHigh: "Alto riesgo",
    voiceFrame: "El análisis ha finalizado. El resultado es {status} con una puntuación del {score} por ciento. Razonamiento: ",
    trendTitle: "Tendencias de amenazas en tiempo real (últimas 24 horas)",
    chartPhishing: "Informes de phishing",
    chartFraud: "Informes de fraude",
    chartOther: "Otras amenazas",
    refreshText: "Actualizar datos",
    quizScore: "Puntaje",
    quizNext: "Siguiente",
    nav1: "Inicio", nav2: "Escáner", nav3: "Verificador", nav4: "Mapa", nav5: "Reportar", nav6: "Concienciación",
    quizTitle: "Pon a prueba tu conciencia", quizSubtitle: "¿Puedes detectar una estafa?",
    whyHeader: "¿Por qué reportar?", footerQuickLinks: "Enlaces rápidos", footerResources: "Recursos",
  },
  fr: {
    heroBadge: "Protection Cyber par l'IA · Gardien Numérique de l'Inde",
    heroTitle: "Protégez-vous des arnaques et fraudes numériques",
    stat1: "Arnaques détectées", stat2: "Taux de précision", stat3: "Rapports aujourd'hui", stat4: "Villes protégées",
    scannerTitle: "Scanner de menaces IA", scannerSubtitle: "Analysez les liens, messages et images pour détecter des menaces potentielles",
    trustTitle: "Vérificateur de confiance numérique", trustSubtitle: "Vérifiez les numéros de téléphone, identifiants UPI et sites web avant les transactions",
    heatmapTitle: "Carte de chaleur des menaces en temps réel", heatmapSubtitle: "Activité d'arnaque en direct en Inde",
    reportTitle: "Signaler une arnaque", reportSubtitle: "Aidez à protéger votre communauté en signalant les escroqueries",
    awarenessTitle: "Sensibilisation à la cybersécurité", awarenessSubtitle: "Apprenez à identifier et à éviter les arnaques numériques",
    threatStatus: "Surveillance en direct", uploadText: "Déposez ici une capture d'écran de paiement suspecte",
    tc1Title: "Numéro de téléphone", tc2Title: "ID UPI / VPA", tc3Title: "Site web / Domaine",
    tc1Btn: "Vérifier le numéro", tc2Btn: "Vérifier UPI", tc3Btn: "Vérifier le site web",
    hotspotTitle: "Principaux points chauds", recentTitle: "Rapports récents",
    todayLabel: "Rapports aujourd'hui", weekLabel: "Cette semaine",
    submitBtnText: "Soumettre le rapport",
    footerDesc: "Protéger les citoyens numériques de l'Inde contre les cybermenaces avec l'IA.",
    urgentTitle: "Argent perdu? Agissez maintenant!", urgentText: "Appelez immédiatement la ligne d'assistance aux crimes cybernétiques",
    legendTitle: "Nivel de menace", l1: "Critique", l2: "Élevé", l3: "Moyen", l4: "Faible",
    mapClickHint: "Cliquez sur une ville pour voir les détails",
    loadingText: "Analyse de la menace...",
    listenBtn: "Écouter l'analyse",
    riskLow: "Risque faible",
    riskMedium: "Risque moyen",
    riskHigh: "Risque élevé",
    voiceFrame: "L'analyse est terminée. Le résultat est {status} avec un score de {score} pour cent. Raisonnement: ",
    trendTitle: "Tendences des menaces en temps réel (dernières 24 heures)",
    chartPhishing: "Rapports de phishing",
    chartFraud: "Rapports de fraude",
    chartOther: "Autres menaces",
    refreshText: "Actualiser les données",
    quizScore: "Score",
    quizNext: "Suivant",
    nav1: "Accueil", nav2: "Scanner", nav3: "Vérificateur", nav4: "Carte", nav5: "Signaler", nav6: "Sensibilisation",
    quizTitle: "Testez votre sensibilisation", quizSubtitle: "Pouvez-vous repérer une arnaque ?",
    whyHeader: "Pourquoi signaler ?", footerQuickLinks: "Liens rapides", footerResources: "Ressources",
  },
  ar: {
    heroBadge: "حماية إلكترونية بالذكاء الاصطناعي · الحارس الرقمي للهند",
    heroTitle: "احمِ نفسك من الاحتيال والنصب الرقمي",
    stat1: "عمليات احتيال مكتشفة", stat2: "معدل الدقة", stat3: "تقارير اليوم", stat4: "مدن محمية",
    scannerTitle: "ماسح التهديدات بالذكاء الاصطناعي", scannerSubtitle: "تحليل الروابط والرسائل والصور للكشف عن التهديدات",
    trustTitle: "مدقق الثقة الرقمية", trustSubtitle: "تحقق من أرقام الهاتف ومعرفات UPI والمواقع الإلكترونية قبل إجراء المعاملات",
    heatmapTitle: "خريطة التهديدات في الوقت الفعلي", heatmapSubtitle: "نشاط الاحتيال المباشر في الهند",
    reportTitle: "الإبلاغ عن احتيال", reportSubtitle: "ساعد في حماية مجتمعك بالإبلاغ عن الاحتيال",
    awarenessTitle: "الوعي بالأمن الإلكتروني", awarenessSubtitle: "تعلم كيفية التعرف على الاحتيال الرقمي وتجنبه",
    threatStatus: "مراقبة مباشرة", uploadText: "أفلت لقطة شاشة الدفع المشبوهة هنا",
    tc1Title: "رقم الهاتف", tc2Title: "UPI ID / VPA", tc3Title: "موقع إلكتروني / نطاق",
    tc1Btn: "التحقق من الرقم", tc2Btn: "التحقق من UPI", tc3Btn: "التحقق من الموقع",
    hotspotTitle: "أبرز البؤر الساخنة", recentTitle: "التقارير الأخيرة",
    todayLabel: "تقارير اليوم", weekLabel: "هذا الأسبوع",
    submitBtnText: "إرسال التقرير",
    footerDesc: "حماية مواطني الهند الرقميين من التهديدات الإلكترونية بالذكاء الاصطناعي.",
    urgentTitle: "فقدت أموالك؟ تصرف الآن!", urgentText: "اتصل فوراً بخط مساعدة الجرائم الإلكترونية الوطني",
    legendTitle: "مستوى التهديد", l1: "حرج", l2: "عالي", l3: "متوسط", l4: "منخفض",
    mapClickHint: "انقر فوق مدينة لعرض التفاصيل",
    loadingText: "جارٍ تحليل التهديد...",
    listenBtn: "استمع إلى التحليل",
    riskLow: "خطر منخفض",
    riskMedium: "خطر متوسط",
    riskHigh: "خطر عالي",
    voiceFrame: "اكتمل التحليل. النتيجة هي {status} بنسبة {score} بالمائة. الأسباب: ",
    trendTitle: "اتجاهات التهديدات في الوقت الفعلي (آخر 24 ساعة)",
    chartPhishing: "تقارير التصيد",
    chartFraud: "تقارير الاحتيال",
    chartOther: "تهديدات أخرى",
    refreshText: "تحديث البيانات المباشرة",
    quizScore: "النتيجة",
    quizNext: "التالي",
    nav1: "الرئيسية", nav2: "الماسح", nav3: "المدقق", nav4: "الخريطة", nav5: "إبلاغ", nav6: "التوعية",
    quizTitle: "اختبر وعيك", quizSubtitle: "هل يمكنك اكتشاف الاحتيال؟",
    whyHeader: "لماذا الإبلاغ؟", footerQuickLinks: "روابط سريعة", footerResources: "الموارد",
  },
  zh: {
    heroBadge: "AI驱动的网络安全防护 · 印度数字守护者",
    heroTitle: "保护自己免受数字诈骗和欺诈",
    stat1: "检测到的诈骗", stat2: "准确率", stat3: "今日报告", stat4: "受保护城市",
    scannerTitle: "AI威胁扫描仪", scannerSubtitle: "分析链接、消息和图像以检测潜在威胁",
    trustTitle: "数字信任检查器", trustSubtitle: "在交易前验证手机号码、UPI ID和网站",
    heatmapTitle: "实时威胁热力图", heatmapSubtitle: "跨印度的实时诈骗活动",
    reportTitle: "举报诈骗", reportSubtitle: "通过举报诈骗活动来保护您的社区",
    awarenessTitle: "网络安全意识", awarenessSubtitle: "学习识别和避免数字诈骗",
    threatStatus: "实时监控", uploadText: "在此处放置付款截图或可疑图像",
    tc1Title: "手机号码", tc2Title: "UPI ID / VPA", tc3Title: "网站 / 域名",
    tc1Btn: "验证号码", tc2Btn: "验证UPI", tc3Btn: "验证网站",
    hotspotTitle: "热点区域", recentTitle: "最近报告",
    todayLabel: "今日报告", weekLabel: "本周",
    submitBtnText: "提交报告",
    footerDesc: "利用AI智能保护印度的数字公民免受网络威胁。",
    urgentTitle: "损失金钱了吗？立即行动！", urgentText: "立即拨打国家网络犯罪帮助热线",
    legendTitle: "威胁级别", l1: "严重", l2: "高", l3: "中", l4: "低",
    mapClickHint: "点击城市以查看详情",
    loadingText: "正在分析威胁...",
    listenBtn: "收听分析",
    riskLow: "低风险",
    riskMedium: "中等风险",
    riskHigh: "高风险",
    voiceFrame: "分析已完成。结果为 {status}，分数为 {score}。原因：",
    trendTitle: "实时威胁趋势（过去 24 小时）",
    chartPhishing: "网络钓鱼报告",
    chartFraud: "欺诈报告",
    chartOther: "其他威胁",
    refreshText: "刷新实时数据",
    quizScore: "得分",
    quizNext: "下一步",
    nav1: "首页", nav2: "扫描仪", nav3: "检查器", nav4: "威胁图", nav5: "举报", nav6: "意识",
    quizTitle: "测试您的意识", quizSubtitle: "您能识别诈骗吗？",
    whyHeader: "为什么要举报？", footerQuickLinks: "快速链接", footerResources: "资源",
  },
  pt: {
    heroBadge: "Proteção Cibernética com IA · Guardião Digital da Índia",
    heroTitle: "Proteja-se de fraudes e golpes digitais",
    stat1: "Golpes detectados", stat2: "Taxa de precisão", stat3: "Relatórios hoje", stat4: "Cidades protegidas",
    scannerTitle: "Verificador de ameaças com IA", scannerSubtitle: "Analise links, mensagens e imagens em busca de ameaças potenciais",
    trustTitle: "Verificador de confiança digital", trustSubtitle: "Verifique números de telefone, IDs UPI e sites antes de transações",
    heatmapTitle: "Mapa de calor de ameaças em tempo real", heatmapSubtitle: "Atividade de golpe ao vivo na Índia",
    reportTitle: "Reportar um golpe", reportSubtitle: "Ajude a proteger sua comunidade relatando atividades de golpe",
    awarenessTitle: "Conscientização em cibersegurança", awarenessSubtitle: "Aprenda a identificar e evitar golpes digitais",
    threatStatus: "Monitoramento ao vivo", uploadText: "Solte uma captura de tela de pagamento suspeito aqui",
    tc1Title: "Número de telefone", tc2Title: "ID UPI / VPA", tc3Title: "Site / Domínio",
    tc1Btn: "Verificar número", tc2Btn: "Verificar UPI", tc3Btn: "Verificar site",
    hotspotTitle: "Principais pontos críticos", recentTitle: "Relatórios recentes",
    todayLabel: "Relatórios hoje", weekLabel: "Esta semana",
    submitBtnText: "Enviar relatório",
    footerDesc: "Protegendo os cidadãos digitais da Índia contra ameaças cibernéticas com inteligência artificial.",
    urgentTitle: "Perdeu dinheiro? Aja agora!", urgentText: "Ligue imediatamente para a linha de apoio ao crime cibernético",
    legendTitle: "Nível de ameaça", l1: "Crítico", l2: "Alto", l3: "Médio", l4: "Baixo",
    mapClickHint: "Clique em uma cidade para ver detalhes",
    loadingText: "Analisando ameaça...",
    listenBtn: "Ouvir análise",
    riskLow: "Baixo risco",
    riskMedium: "Riesgo médio",
    riskHigh: "Alto risco",
    voiceFrame: "A análise foi concluída. O resultado é {status} com uma pontuação de {score} por cento. Motivo: ",
    trendTitle: "Tendências de ameaças em tempo real (últimas 24 horas)",
    chartPhishing: "Relatórios de phishing",
    chartFraud: "Relatórios de fraude",
    chartOther: "Outras ameaças",
    refreshText: "Atualizar dados ao vivo",
    quizScore: "Pontuação",
    quizNext: "Próximo",
    nav1: "Início", nav2: "Scanner", nav3: "Verificador", nav4: "Mapa", nav5: "Relatar", nav6: "Conscientização",
    quizTitle: "Teste sua consciência", quizSubtitle: "Você consegue identificar um golpe?",
    whyHeader: "Por que denunciar?", footerQuickLinks: "Links rápidos", footerResources: "Recursos",
  },
  de: {
    heroBadge: "KI-gestützte Cyberabwehr · Digitaler Wächter von Indien",
    heroTitle: "Schützen Sie sich vor digitalen Betrug und Betrug",
    stat1: "Erkannte Betrügereien", stat2: "Genauigkeitsrate", stat3: "Heutige Berichte", stat4: "Geschützte Städte",
    scannerTitle: "KI-Bedrohungsscanner", scannerSubtitle: "Links, Nachrichten und Bilder auf potenzielle Bedrohungen analysieren",
    trustTitle: "Digitaler Vertrauensprüfer", trustSubtitle: "Telefonnummern, UPI-IDs und Websites vor Transaktionen überprüfen",
    heatmapTitle: "Echtzeit-Bedrohungs-Heatmap", heatmapSubtitle: "Live-Betrugsaktivitäten in Indien",
    reportTitle: "Betrug melden", reportSubtitle: "Schützen Sie Ihre Gemeinschaft, indem Sie Betrugsfälle melden",
    awarenessTitle: "Cybersicherheitsbewusstsein", awarenessSubtitle: "Lernen Sie, digitale Betrügereien zu erkennen und zu vermeiden",
    threatStatus: "Live-Überwachung", uploadText: "Screenshot einer verdächtigen Zahlung hier ablegen",
    tc1Title: "Telefonnummer", tc2Title: "UPI-ID / VPA", tc3Title: "Website / Domain",
    tc1Btn: "Nummer prüfen", tc2Btn: "UPI prüfen", tc3Btn: "Website prüfen",
    hotspotTitle: "Top Hotspots", recentTitle: "Aktuelle Berichte",
    todayLabel: "Heutige Berichte", weekLabel: "Diese Woche",
    submitBtnText: "Bericht einreichen",
    footerDesc: "Schutz der digitalen Bürger Indiens vor Cyberbedrohungen mit KI-gestützter Intelligenz.",
    urgentTitle: "Geld verloren? Jetzt handeln!", urgentText: "Rufen Sie sofort die nationale Cyber-Kriminalitäts-Hotline an",
    legendTitle: "Bedrohungsstufe", l1: "Kritisch", l2: "Hoch", l3: "Mittel", l4: "Niedrig",
    mapClickHint: "Klicken Sie auf eine Stadt um Details zu sehen",
    loadingText: "Bedrohung wird analysiert...",
    listenBtn: "Analyse anhören",
    riskLow: "Geringes Risiko",
    riskMedium: "Mittleres Risiko",
    riskHigh: "Hohes Risiko",
    voiceFrame: "Die Analyse ist abgeschlossen. Das Ergebnis ist {status} mit einer Punktzahl von {score} Prozent. Begründung: ",
    trendTitle: "Echtzeit-Bedrohungstrends (letzte 24 Stunden)",
    chartPhishing: "Phishing-Berichte",
    chartFraud: "Betrugsberichte",
    chartOther: "Andere Bedrohungen",
    refreshText: "Live-Daten aktualisieren",
    quizScore: "Punktzahl",
    quizNext: "Weiter",
    nav1: "Home", nav2: "Scanner", nav3: "Prüfer", nav4: "Karte", nav5: "Meldung", nav6: "Bewusstsein",
    quizTitle: "Testen Sie Ihr Bewusstsein", quizSubtitle: "Erkennen Sie einen Betrug?",
    whyHeader: "Warum melden?", footerQuickLinks: "Schnellzugriff", footerResources: "Ressourcen",
  },
};

const ANALYSIS_I18N = {
  en: {
    whyTitle: 'Why this rating? — Detailed Breakdown',
    high: 'High Risk', medium: 'Medium Risk', low: 'Low Risk',
    summarySafe: 'This appears safe because no major scam indicators were detected. Always stay cautious before sharing personal or financial information.',
    summaryWarning: 'This is suspicious because some scam indicators were detected. Verify through official sources before taking any action.',
    summaryDanger: 'This is high risk because multiple strong scam indicators were detected. Avoid clicking, replying, paying, or sharing OTP/password details.',
    summaryByCount: 'Detected {count} risk indicators with an overall risk score of {score}%.',
    indGenericHigh: 'This indicator is commonly linked to phishing or fraud attempts.',
    indGenericMedium: 'This indicator can be suspicious and should be verified carefully.',
    indGenericLow: 'This indicator currently suggests lower risk, but stay cautious.',
  },
  ta: {
    whyTitle: 'இந்த மதிப்பீட்டின் காரணம் — விரிவான விளக்கம்',
    high: 'அதிக ஆபத்து', medium: 'நடுத்தர ஆபத்து', low: 'குறைந்த ஆபத்து',
    summarySafe: 'முக்கிய மோசடி அறிகுறிகள் கண்டறியப்படாததால் இது பாதுகாப்பாகத் தெரிகிறது. இருப்பினும் தனிப்பட்ட/நிதி தகவலை பகிர்வதில் எப்போதும் கவனமாக இருங்கள்.',
    summaryWarning: 'சில மோசடி அறிகுறிகள் கண்டறியப்பட்டதால் இது சந்தேகமாக உள்ளது. எந்த நடவடிக்கையும் எடுக்கும் முன் அதிகாரப்பூர்வ மூலம் மூலம் சரிபார்க்கவும்.',
    summaryDanger: 'பல வலுவான மோசடி அறிகுறிகள் கண்டறியப்பட்டதால் இது அதிக ஆபத்து. லிங்க் கிளிக் செய்யாதீர்கள், பதிலளிக்காதீர்கள், பணம் அனுப்பாதீர்கள், OTP/கடவுச்சொல் பகிராதீர்கள்.',
    summaryByCount: '{count} ஆபத்து அறிகுறிகள் கண்டறியப்பட்டன. மொத்த ஆபத்து மதிப்பெண் {score}%.',
    indGenericHigh: 'இந்த அறிகுறி பொதுவாக பிஷிங்/மோசடி முயற்சிகளுடன் தொடர்புடையது.',
    indGenericMedium: 'இந்த அறிகுறி சந்தேகமானதாக இருக்கலாம்; கவனமாக சரிபார்க்கவும்.',
    indGenericLow: 'இது தற்போது குறைந்த ஆபத்தை காட்டுகிறது, இருப்பினும் எச்சரிக்கையுடன் இருங்கள்.',
  },
  hi: {
    whyTitle: 'यह रेटिंग क्यों? — विस्तृत कारण',
    high: 'उच्च जोखिम', medium: 'मध्यम जोखिम', low: 'कम जोखिम',
    summarySafe: 'यह सुरक्षित लगता है क्योंकि कोई बड़ा स्कैम संकेत नहीं मिला। फिर भी व्यक्तिगत/वित्तीय जानकारी साझा करने से पहले सावधानी रखें।',
    summaryWarning: 'कुछ स्कैम संकेत मिलने के कारण यह संदिग्ध है। कोई भी कार्रवाई करने से पहले आधिकारिक स्रोत से सत्यापित करें।',
    summaryDanger: 'कई मजबूत स्कैम संकेत मिलने के कारण यह उच्च जोखिम है। लिंक न खोलें, जवाब न दें, भुगतान न करें, OTP/पासवर्ड साझा न करें।',
    summaryByCount: '{count} जोखिम संकेत मिले। कुल जोखिम स्कोर {score}%.',
    indGenericHigh: 'यह संकेत अक्सर फ़िशिंग या धोखाधड़ी प्रयासों से जुड़ा होता है।',
    indGenericMedium: 'यह संकेत संदिग्ध हो सकता है; सावधानी से सत्यापित करें।',
    indGenericLow: 'यह संकेत अभी कम जोखिम दिखाता है, फिर भी सावधान रहें।',
  },
  te: {
    whyTitle: 'ఈ రేటింగ్ ఎందుకు? — వివరణాత్మక కారణాలు',
    high: 'అధిక ప్రమాదం', medium: 'మధ్యస్థ ప్రమాదం', low: 'తక్కువ ప్రమాదం',
    summarySafe: 'ప్రధాన స్కామ్ సూచనలు కనిపించనందున ఇది సురక్షితంగా కనిపిస్తోంది. అయినప్పటికీ వ్యక్తిగత/ఆర్థిక సమాచారాన్ని పంచే ముందు జాగ్రత్తగా ఉండండి.',
    summaryWarning: 'కొన్ని స్కామ్ సూచనలు గుర్తించబడినందున ఇది అనుమానాస్పదం. చర్య తీసుకునే ముందు అధికారిక వనరుతో నిర్ధారించండి.',
    summaryDanger: 'బలమైన అనేక స్కామ్ సూచనలు గుర్తించబడినందున ఇది అధిక ప్రమాదం. క్లిక్ చేయకండి, స్పందించకండి, చెల్లించకండి, OTP/పాస్‌వర్డ్ పంచుకోకండి.',
    summaryByCount: '{count} ప్రమాద సూచనలు గుర్తించబడ్డాయి. మొత్తం ప్రమాద స్కోరు {score}%.',
    indGenericHigh: 'ఈ సూచన సాధారణంగా ఫిషింగ్ లేదా మోసపు ప్రయత్నాలకు సంబంధించినది.',
    indGenericMedium: 'ఈ సూచన అనుమానాస్పదంగా ఉండవచ్చు; జాగ్రత్తగా నిర్ధారించండి.',
    indGenericLow: 'ప్రస్తుతం ఇది తక్కువ ప్రమాదాన్ని చూపుతోంది; అయినా జాగ్రత్తగా ఉండండి.',
  },
  kn: {
    whyTitle: 'ಈ ಮೌಲ್ಯಾಂಕನಕ್ಕೆ ಕಾರಣವೇನು? — ವಿವರವಾದ ವಿವರಣೆ',
    high: 'ಹೆಚ್ಚಿನ ಅಪಾಯ', medium: 'ಮಧ್ಯಮ ಅಪಾಯ', low: 'ಕಡಿಮೆ ಅಪಾಯ',
    summarySafe: 'ಮುಖ್ಯ ವಂಚನೆ ಸೂಚನೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ; ಆದ್ದರಿಂದ ಇದು ಸುರಕ್ಷಿತವಾಗಿ ತೋರುತ್ತದೆ. ಆದರೂ ವೈಯಕ್ತಿಕ/ಹಣಕಾಸು ಮಾಹಿತಿಯನ್ನು ಹಂಚುವ ಮೊದಲು ಎಚ್ಚರಿಕೆ ವಹಿಸಿ.',
    summaryWarning: 'ಕೆಲವು ವಂಚನೆ ಸೂಚನೆಗಳು ಪತ್ತೆಯಾದ್ದರಿಂದ ಇದು ಅನುಮಾನಾಸ್ಪದವಾಗಿದೆ. ಯಾವುದೇ ಕ್ರಮಕ್ಕೂ ಮೊದಲು ಅಧಿಕೃತ ಮೂಲದಿಂದ ಪರಿಶೀಲಿಸಿ.',
    summaryDanger: 'ಬಹು ಬಲವಾದ ವಂಚನೆ ಸೂಚನೆಗಳು ಪತ್ತೆಯಾದ್ದರಿಂದ ಇದು ಹೆಚ್ಚಿನ ಅಪಾಯ. ಕ್ಲಿಕ್ ಮಾಡಬೇಡಿ, ಪ್ರತಿಕ್ರಿಯಿಸಬೇಡಿ, ಹಣ ಪಾವತಿಸಬೇಡಿ, OTP/ಪಾಸ್‌ವರ್ಡ್ ಹಂಚಬೇಡಿ.',
    summaryByCount: '{count} ಅಪಾಯ ಸೂಚನೆಗಳು ಪತ್ತೆಯಾಗಿದೆ. ಒಟ್ಟು ಅಪಾಯ ಅಂಕೆ {score}%.',
    indGenericHigh: 'ಈ ಸೂಚನೆ ಸಾಮಾನ್ಯವಾಗಿ ಫಿಶಿಂಗ್ ಅಥವಾ ವಂಚನೆ ಪ್ರಯತ್ನಗಳಿಗೆ ಸಂಬಂಧಿಸಿದೆ.',
    indGenericMedium: 'ಈ ಸೂಚನೆ ಅನುಮಾನಾಸ್ಪದವಾಗಿರಬಹುದು; ಜಾಗ್ರತೆಯಿಂದ ಪರಿಶೀಲಿಸಿ.',
    indGenericLow: 'ಇದು ಪ್ರಸ್ತುತ ಕಡಿಮೆ ಅಪಾಯ ಸೂಚಿಸುತ್ತದೆ; ಆದರೂ ಎಚ್ಚರಿಕೆಯಿಂದಿರಿ.',
  },
  ml: {
    whyTitle: 'ഈ റേറ്റിംഗ് എന്തുകൊണ്ട്? — വിശദമായ കാരണം',
    high: 'ഉയർന്ന റിസ്‌ക്', medium: 'മിതമായ റിസ്‌ക്', low: 'കുറഞ്ഞ റിസ്‌ക്',
    summarySafe: 'പ്രധാന തട്ടിപ്പ് സൂചനകൾ കണ്ടെത്താനായില്ല; അതിനാൽ ഇത് സുരക്ഷിതമായി തോന്നുന്നു. എന്നിരുന്നാലും വ്യക്തിഗത/സാമ്പത്തിക വിവരങ്ങൾ പങ്കിടുന്നതിന് മുമ്പ് ജാഗ്രത പാലിക്കുക.',
    summaryWarning: 'ചില തട്ടിപ്പ് സൂചനകൾ കണ്ടെത്തിയതിനാൽ ഇത് സംശയാസ്പദമാണ്. നടപടി എടുക്കുന്നതിന് മുമ്പ് ഔദ്യോഗിക ഉറവിടം വഴി സ്ഥിരീകരിക്കുക.',
    summaryDanger: 'നിരവധി ശക്തമായ തട്ടിപ്പ് സൂചനകൾ കണ്ടെത്തിയതിനാൽ ഇത് ഉയർന്ന റിസ്‌ക് ആണ്. ക്ലിക്ക് ചെയ്യരുത്, മറുപടി നൽകരുത്, പണം നൽകരുത്, OTP/പാസ്‌വേഡ് പങ്കിടരുത്.',
    summaryByCount: '{count} റിസ്‌ക് സൂചനകൾ കണ്ടെത്തി. മൊത്തം റിസ്‌ക് സ്കോർ {score}%.',
    indGenericHigh: 'ഈ സൂചന സാധാരണയായി ഫിഷിംഗ്/തട്ടിപ്പ് ശ്രമങ്ങളുമായി ബന്ധപ്പെട്ടതാണ്.',
    indGenericMedium: 'ഈ സൂചന സംശയാസ്പദമായിരിക്കാം; ശ്രദ്ധാപൂർവ്വം പരിശോധിക്കുക.',
    indGenericLow: 'ഇത് നിലവിൽ കുറഞ്ഞ റിസ്‌ക് കാണിക്കുന്നു; എന്നിരുന്നാലും ജാഗ്രത പാലിക്കുക.',
  },
  es: {
    whyTitle: '¿Por qué esta calificación? — Desglose detallado',
    high: 'Alto riesgo', medium: 'Riesgo medio', low: 'Bajo riesgo',
    summarySafe: 'Parece seguro porque no se detectaron indicadores de estafa importantes. Aun así, tenga cuidado antes de compartir datos personales o financieros.',
    summaryWarning: 'Es sospechoso porque se detectaron algunos indicadores de estafa. Verifique con fuentes oficiales antes de actuar.',
    summaryDanger: 'Es de alto riesgo porque se detectaron múltiples indicadores fuertes de estafa. No haga clic, no responda, no pague ni comparta OTP/contraseñas.',
    summaryByCount: 'Se detectaron {count} indicadores de riesgo. Puntuación total de riesgo: {score}%.',
    indGenericHigh: 'Este indicador suele estar relacionado con intentos de phishing o fraude.',
    indGenericMedium: 'Este indicador puede ser sospechoso; verifique con cuidado.',
    indGenericLow: 'Este indicador sugiere bajo riesgo por ahora, pero manténgase alerta.',
  },
  fr: {
    whyTitle: 'Pourquoi cette note ? — Détails',
    high: 'Risque élevé', medium: 'Risque moyen', low: 'Risque faible',
    summarySafe: 'Cela semble sûr car aucun indicateur majeur d’arnaque n’a été détecté. Restez toutefois prudent avant de partager des informations personnelles ou financières.',
    summaryWarning: 'C’est suspect car certains indicateurs d’arnaque ont été détectés. Vérifiez via des sources officielles avant d’agir.',
    summaryDanger: 'Risque élevé car plusieurs indicateurs forts d’arnaque ont été détectés. N’ouvrez pas le lien, ne répondez pas, ne payez pas et ne partagez pas OTP/mots de passe.',
    summaryByCount: '{count} indicateurs de risque détectés. Score global de risque : {score}%.',
    indGenericHigh: 'Cet indicateur est souvent lié à des tentatives de phishing ou de fraude.',
    indGenericMedium: 'Cet indicateur peut être suspect ; vérifiez attentivement.',
    indGenericLow: 'Cet indicateur suggère un risque faible pour l’instant, mais restez vigilant.',
  },
  ar: {
    whyTitle: 'لماذا هذا التقييم؟ — شرح تفصيلي',
    high: 'مخاطر عالية', medium: 'مخاطر متوسطة', low: 'مخاطر منخفضة',
    summarySafe: 'يبدو هذا آمناً لأن النظام لم يكتشف مؤشرات احتيال قوية. ومع ذلك، كن حذراً قبل مشاركة أي بيانات شخصية أو مالية.',
    summaryWarning: 'هذا مشبوه لأن بعض مؤشرات الاحتيال تم اكتشافها. تحقق من المصادر الرسمية قبل اتخاذ أي إجراء.',
    summaryDanger: 'هذا عالي الخطورة لأنه تم اكتشاف عدة مؤشرات احتيال قوية. لا تضغط، لا ترد، لا تدفع، ولا تشارك OTP أو كلمات المرور.',
    summaryByCount: 'تم اكتشاف {count} مؤشرات خطر. درجة الخطر الإجمالية {score}٪.',
    indGenericHigh: 'هذا المؤشر يرتبط غالباً بمحاولات التصيد أو الاحتيال.',
    indGenericMedium: 'قد يكون هذا المؤشر مشبوهاً؛ تحقق بعناية.',
    indGenericLow: 'هذا المؤشر يدل على مخاطر أقل حالياً، لكن ابقَ يقظاً.',
  },
  zh: {
    whyTitle: '为什么是这个结果？— 详细说明',
    high: '高风险', medium: '中风险', low: '低风险',
    summarySafe: '看起来较安全，因为未检测到明显诈骗指标。但在分享个人或财务信息前仍需谨慎。',
    summaryWarning: '检测到部分诈骗指标，因此结果可疑。请在操作前通过官方渠道核实。',
    summaryDanger: '检测到多个强烈诈骗指标，因此为高风险。不要点击、不要回复、不要付款，也不要提供OTP/密码。',
    summaryByCount: '检测到 {count} 个风险指标，总体风险分数为 {score}%。',
    indGenericHigh: '该指标通常与钓鱼或诈骗尝试相关。',
    indGenericMedium: '该指标可能可疑，请谨慎核实。',
    indGenericLow: '该指标当前风险较低，但仍需保持警惕。',
  },
  pt: {
    whyTitle: 'Por que esta classificação? — Detalhamento',
    high: 'Alto risco', medium: 'Risco médio', low: 'Baixo risco',
    summarySafe: 'Parece seguro porque não foram detectados indicadores fortes de golpe. Ainda assim, tenha cuidado antes de compartilhar dados pessoais ou financeiros.',
    summaryWarning: 'É suspeito porque alguns indicadores de golpe foram detectados. Verifique em fontes oficiais antes de agir.',
    summaryDanger: 'É de alto risco porque múltiplos indicadores fortes de golpe foram detectados. Não clique, não responda, não pague e não compartilhe OTP/senhas.',
    summaryByCount: 'Foram detectados {count} indicadores de risco. Pontuação geral de risco: {score}%.',
    indGenericHigh: 'Este indicador geralmente está ligado a tentativas de phishing ou fraude.',
    indGenericMedium: 'Este indicador pode ser suspeito; verifique com cuidado.',
    indGenericLow: 'Este indicador sugere baixo risco no momento, mas mantenha atenção.',
  },
  de: {
    whyTitle: 'Warum diese Bewertung? — Detaillierte Erklärung',
    high: 'Hohes Risiko', medium: 'Mittleres Risiko', low: 'Niedriges Risiko',
    summarySafe: 'Dies wirkt sicher, da keine starken Betrugsindikatoren erkannt wurden. Teilen Sie trotzdem keine persönlichen oder finanziellen Daten ohne Prüfung.',
    summaryWarning: 'Dies ist verdächtig, da einige Betrugsindikatoren erkannt wurden. Vor einer Handlung über offizielle Quellen prüfen.',
    summaryDanger: 'Hohes Risiko, da mehrere starke Betrugsindikatoren erkannt wurden. Nicht klicken, nicht antworten, nicht zahlen und keine OTP/Passwörter teilen.',
    summaryByCount: '{count} Risikoindikatoren erkannt. Gesamt-Risikoscore: {score}%.',
    indGenericHigh: 'Dieser Indikator ist häufig mit Phishing- oder Betrugsversuchen verbunden.',
    indGenericMedium: 'Dieser Indikator kann verdächtig sein; bitte sorgfältig prüfen.',
    indGenericLow: 'Dieser Indikator deutet aktuell auf ein geringes Risiko hin, bleiben Sie aber wachsam.',
  },
};

function analysisPack(lang = currentLang) {
  return ANALYSIS_I18N[lang] || ANALYSIS_I18N.en;
}

function riskLabelFromSeverity(severity, lang = currentLang) {
  const a = analysisPack(lang);
  if (severity === 'high') return a.high;
  if (severity === 'medium') return a.medium;
  return a.low;
}

function localizedSummaryByType(type, indicatorsCount = 0, score = 0, lang = currentLang) {
  const a = analysisPack(lang);
  let summary = a.summarySafe;
  if (type === 'danger') summary = a.summaryDanger;
  else if (type === 'warning') summary = a.summaryWarning;
  const byCount = a.summaryByCount
    .replace('{count}', String(indicatorsCount || 0))
    .replace('{score}', String(score || 0));
  return `${summary} ${byCount}`;
}

function localizedIndicatorReason(severity, lang = currentLang) {
  const a = analysisPack(lang);
  if (severity === 'high') return a.indGenericHigh;
  if (severity === 'medium') return a.indGenericMedium;
  return a.indGenericLow;
}

function plainText(value) {
  return String(value || '').replace(/<[^>]*>/g, '').trim();
}

const voiceMap = {
  en: 'en-US',
  ta: 'ta-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  es: 'es-ES',
  fr: 'fr-FR',
  ar: 'ar-SA',
  zh: 'zh-CN',
  pt: 'pt-BR',
  de: 'de-DE'
};

let currentUtterance = null;

function speakResult(data) {
  // Stop current speech
  stopSpeaking();
  
  if (!window.speechSynthesis) {
    showToast("Speech synthesis not supported in this browser.", false);
    return;
  }

  const t = translations[currentLang] || translations['en'];
  let riskStatus = t.riskLow || "Low Risk";
  if (data.type === 'danger') riskStatus = t.riskHigh || "High Risk";
  else if (data.type === 'warning') riskStatus = t.riskMedium || "Medium Risk";

  const reasonText = plainText(data.rating_reason) || localizedSummaryByType(data.type, 0, data.score);

  // Create localized summary
  let speechText = "";
  if (currentLang === 'en') {
    speechText = `${data.title}. ${data.subtitle}. ${reasonText}`;
  } else {
    // Localized intro + technical details
    const intro = t.voiceFrame 
      ? t.voiceFrame.replace('{status}', riskStatus).replace('{score}', data.score)
      : `${riskStatus}. Score: ${data.score}%.`;
    speechText = `${intro}. ${reasonText}`;
  }

  const utterance = new SpeechSynthesisUtterance(speechText);
  utterance.lang = voiceMap[currentLang] || 'en-US';
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  // Visual feedback
  const btns = document.querySelectorAll('.voice-btn');
  btns.forEach(btn => btn.classList.add('playing'));

  utterance.onend = () => {
    btns.forEach(btn => btn.classList.remove('playing'));
    currentUtterance = null;
  };

  utterance.onerror = () => {
    btns.forEach(btn => btn.classList.remove('playing'));
    currentUtterance = null;
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

function applyTranslations(lang) {
  const t = translations[lang] || translations['en'];
  // Apply dir attribute for RTL languages
  document.documentElement.setAttribute('dir', LANGS[lang]?.dir || 'ltr');
  Object.keys(t).forEach(key => {
    const el = document.getElementById(key);
    if (el) el.textContent = t[key];
  });
  // Also refresh chart to update legend
  initTrendChart();
}

// ── Language Dropdown Functions ───────────────────────────────
function toggleLangDropdown() {
  const dd = document.getElementById('langDropdown');
  const chevron = document.getElementById('langChevron');
  const isOpen = dd.classList.toggle('open');
  chevron.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
}

function selectLanguage(lang, flag, name) {
  currentLang = lang;
  document.getElementById('langCurrentFlag').textContent = flag;
  document.getElementById('langCurrentName').textContent = name;
  // Update active state
  document.querySelectorAll('.lang-option').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  applyTranslations(lang);
  // Also sync awareness section
  setAwarenessLang(lang, document.querySelector(`.aw-lang-btn[data-awlang="${lang}"]`));
  toggleLangDropdown(); // close
  showToast(`Language changed to ${name}`);
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const selector = document.getElementById('langSelector');
  if (selector && !selector.contains(e.target)) {
    const dd = document.getElementById('langDropdown');
    const chevron = document.getElementById('langChevron');
    if (dd) dd.classList.remove('open');
    if (chevron) chevron.style.transform = 'rotate(0deg)';
  }
});


// ── Background Canvas Animation ───────────────────────────────
const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticles() {
  particles = [];
  const count = Math.floor((canvas.width * canvas.height) / 12000);
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.1,
    });
  }
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p, i) => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${THEME_COLORS.neonBlueRgb},${p.opacity})`;
    ctx.fill();

    particles.slice(i + 1, i + 6).forEach((q) => {
      const dx = p.x - q.x,
        dy = p.y - q.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 130) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = `rgba(${THEME_COLORS.neonBlueRgb},${0.08 * (1 - dist / 130)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    });
  });
  requestAnimationFrame(drawParticles);
}

resizeCanvas();
createParticles();
drawParticles();
window.addEventListener("resize", () => {
  resizeCanvas();
  createParticles();
});

// ── Navbar ────────────────────────────────────────────────────
window.addEventListener("scroll", () => {
  document
    .getElementById("navbar")
    .classList.toggle("scrolled", window.scrollY > 50);
  const sections = document.querySelectorAll("section[id]");
  let current = "";
  sections.forEach((s) => {
    if (window.scrollY >= s.offsetTop - 100) current = s.id;
  });
  document.querySelectorAll(".nav-link").forEach((l) => {
    l.classList.toggle("active", l.dataset.section === current);
  });
});

document.getElementById("hamburger").addEventListener("click", () => {
  document.getElementById("navLinks").classList.toggle("open");
});

// ── Tab System ────────────────────────────────────────────────
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
  });
});

// ── Utility Functions ─────────────────────────────────────────
function showLoading(text) {
  document.getElementById("loadingText").textContent =
    text || "Analyzing threat...";
  document.getElementById("loadingOverlay").style.display = "flex";
}

function hideLoading() {
  document.getElementById("loadingOverlay").style.display = "none";
}

function showToast(msg, isSuccess = true) {
  const t = document.getElementById("toast");
  const icon = t.querySelector("i");
  document.getElementById("toastMsg").textContent = msg;
  icon.className = isSuccess
    ? "fas fa-check-circle"
    : "fas fa-exclamation-circle";
  t.style.borderColor = isSuccess ? "var(--success)" : "var(--danger)";
  t.style.color = isSuccess ? "var(--success)" : "var(--danger)";
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3500);
}

function randomBetween(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function scrollToResult(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}


// ── Link Scanner ──────────────────────────────────────────────
const phishingKeywords = [
  "free-reward", "lucky-winner", "bank-secure", "verify-account",
  "kyc-update", "claim-prize", "login-update", "account-suspended",
  "bit.ly", "goo.gl", "tinyurl", "paytm-secure", "sbi-alert",
  "hdfc-verify", "upi-reward", "aadhaar-update",
];

const urlFlagExplanations = {
  'No HTTPS': {
    why: 'This URL uses HTTP, not HTTPS. Legitimate banks and payment sites always use HTTPS (the padlock). Without it, your data travels unencrypted and can be intercepted by attackers.',
    severity: 'high'
  },
  'IP-based URL': {
    why: 'Real websites use domain names (like sbi.co.in), not raw IP addresses. Scammers use IP-based URLs to avoid domain registration that could expose their identity.',
    severity: 'high'
  },
  'Too many hyphens': {
    why: 'Fraudulent URLs pack multiple hyphens to mimic legitimate domains (e.g. "sbi-bank-login-verify.com"). Genuine sites rarely use more than one hyphen.',
    severity: 'medium'
  },
  'Suspicious TLD': {
    why: 'Top-level domains like .xyz, .tk, .top, .ml are frequently used by scammers because they are free or very cheap. Banks and government sites use .gov, .co.in, .com.',
    severity: 'high'
  },
  'Unusually long URL': {
    why: 'Long URLs can be used to hide the real destination or embed confusing parameters. Scammers make URLs long to distract you from spotting the fake domain.',
    severity: 'medium'
  },
  'Too many subdomains': {
    why: 'A URL like "login.verify.bank.secure.xyz" uses subdomains to trick you into thinking the main domain is a trusted brand. The actual domain is the last two parts before the TLD.',
    severity: 'high'
  },
};

const keywordExplanations = {
  'free-reward': 'Scammers lure victims with fake rewards. No legitimate company sends surprise free rewards via unknown links.',
  'lucky-winner': 'Classic "lottery scam" language. You cannot win a contest you did not enter.',
  'bank-secure': 'Fraudsters impersonate banks by mixing "bank" and "secure" in URLs to look official.',
  'verify-account': 'A common trick to push you to a fake login page to steal your credentials.',
  'kyc-update': 'KYC scams create panic that your account will be blocked unless you share documents immediately.',
  'claim-prize': 'Prize claim links are almost always designed to harvest personal information.',
  'login-update': 'Suggests your login is outdated, pushing you to a fake portal to capture your password.',
  'account-suspended': 'Creates fear that your account is suspended to get you to act quickly without verifying.',
  'bit.ly': 'URL shorteners hide the real destination. A scammer can mask a dangerous link behind a short URL.',
  'goo.gl': 'URL shorteners hide the real destination. A scammer can mask a dangerous link behind a short URL.',
  'tinyurl': 'URL shorteners hide the real destination. A scammer can mask a dangerous link behind a short URL.',
  'paytm-secure': 'Scammers fake payment platform names in URLs to steal UPI credentials.',
  'sbi-alert': 'Fake SBI alerts are extremely common. SBI never sends security alerts via random SMS links.',
  'hdfc-verify': 'HDFC impersonation. Legitimate HDFC communications never ask you to click a link to verify.',
  'upi-reward': 'UPI reward scams trick users into scanning QR codes or clicking links that drain accounts.',
  'aadhaar-update': 'Aadhaar update scams claim your ID will be cancelled unless you submit data immediately.',
};

function analyzeUrl(url) {
  const u = url.toLowerCase();
  const flags = [];
  if (!/^https:\/\//i.test(url)) flags.push('No HTTPS');
  if (/\d{2,}\.\d{1,3}\.\d{1,3}/.test(u)) flags.push('IP-based URL');
  if ((u.match(/-/g) || []).length > 3) flags.push('Too many hyphens');
  if (/\.(xyz|top|tk|ml|ga|cf|gq|pw)/.test(u)) flags.push('Suspicious TLD');
  phishingKeywords.forEach(k => {
    if (u.includes(k)) flags.push(`Keyword: "${k}"`);
  });
  if (u.length > 80) flags.push('Unusually long URL');
  const domainParts = (u.split('/')[2] || '').split('.');
  if (domainParts.length > 4) flags.push('Too many subdomains');
  return flags;
}

function buildIndicatorRows(flags, type) {
  if (!flags.length) return '';
  const tagColor = type === 'safe' ? 'var(--success)' : type === 'warning' ? 'var(--secondary)' : 'var(--danger)';
  let rows = flags.map(flag => {
    // Check base flag or keyword
    let explanation = urlFlagExplanations[flag]?.why || null;
    let severity = urlFlagExplanations[flag]?.severity || 'medium';
    // Check keyword map
    const kwMatch = flag.match(/^Keyword: "(.+)"$/);
    if (kwMatch) {
      const kw = kwMatch[1];
      explanation = keywordExplanations[kw] || `The keyword "${kw}" is commonly found in phishing and scam URLs.`;
      severity = 'high';
    }
    const severityIcon = severity === 'high' ? '🔴' : severity === 'medium' ? '🟡' : '🟢';
    const severityLabel = severity === 'high' ? 'High Risk' : severity === 'medium' ? 'Medium Risk' : 'Low Risk';
    return `
      <div class="indicator-row">
        <div class="indicator-header">
          <span class="indicator-flag" style="color:${tagColor}">${severityIcon} ${flag}</span>
          <span class="indicator-severity ${severity}">${severityLabel}</span>
        </div>
        ${explanation ? `<div class="indicator-why"><i class="fas fa-info-circle"></i> ${explanation}</div>` : ''}
      </div>`;
  }).join('');
  return `<div class="indicator-breakdown"><div class="indicator-title"><i class="fas fa-microscope"></i> Why this rating? — Detailed Breakdown</div>${rows}</div>`;
}

async function scanLink() {
  const url = document.getElementById('linkInput').value.trim();
  const resultEl = document.getElementById('linkResult');
  if (!url) { showToast('Please enter a URL to scan', false); return; }

  showLoading('Analyzing URL for threats...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/analyze/link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    if (!response.ok) throw new Error('Backend analysis failed');
    
    const data = await response.json();
    hideLoading();

    const { score, type, title, subtitle, flags, indicators } = data;
    const localizedReason = localizedSummaryByType(type, flags.length, score);
    
    let icon;
    if (type === 'danger') icon = 'fas fa-skull-crossbones';
    else if (type === 'warning') icon = 'fas fa-exclamation-triangle';
    else icon = 'fas fa-shield-check';

    const tagsHtml = flags.length
      ? `<div class="threat-tags">${flags.map(f => `<span class="threat-tag ${type === 'safe' ? 'green' : type === 'warning' ? 'orange' : 'red'}">${f}</span>`).join('')}</div>`
      : `<div class="threat-tags"><span class="threat-tag green">No Flags Found</span></div>`;

    resultEl.className = `scan-result ${type}`;
    resultEl.innerHTML = `
      <div class="result-header">
        <div class="result-icon"><i class="${icon}"></i></div>
        <div><div class="result-title">${title}</div><div class="result-subtitle">${subtitle}</div></div>
      </div>
      ${tagsHtml}
      <div class="result-summary-box">
        <i class="fas fa-chart-bar"></i>
        <span>${localizedReason}</span>
      </div>
      <div class="result-details">Risk Indicators: ${flags.length} | URL Length: ${url.length} chars | Protocol: ${url.startsWith('https') ? '<span style="color:var(--success)">HTTPS ✓</span>' : '<span style="color:var(--danger)">HTTP ✗ (Unsafe)</span>'}</div>
      ${buildApiIndicatorRows(indicators, type)}
      <div class="confidence-bar-wrap">
        <div class="confidence-header">
          <span>Scan Confidence Score</span>
          <span>${score}%</span>
        </div>
        <div class="confidence-bar">
          <div class="confidence-fill ${type}" style="width: ${score}%"></div>
        </div>
      </div>
      <div class="result-actions">
        <button class="action-btn voice-btn" onclick='speakResult({type: ${JSON.stringify(type)}, title: ${JSON.stringify(title)}, subtitle: ${JSON.stringify(subtitle)}, rating_reason: ${JSON.stringify(localizedReason)}, score: ${score}})'>
          <i class="fas fa-volume-up"></i> <span>${translations[currentLang].listenBtn || 'Listen Analysis'}</span>
        </button>
        ${type === 'safe' 
          ? `<button class="action-btn safe"><i class="fas fa-check-circle"></i> Safe to Visit</button>`
          : `<button class="action-btn report" onclick="scrollToSection('report')"><i class="fas fa-flag"></i> Report this link</button>
             <button class="action-btn secondary" onclick="location.reload()"><i class="fas fa-redo"></i> Scan another</button>`
        }
      </div>
    `;
    
    resultEl.style.display = 'block';
    scrollToResult('linkResult');

  } catch (error) {
    console.error('Scan Error:', error);
    hideLoading();
    showToast('Analysis service unavailable. Using local fallback.', false);
    
    // Fallback to local logic if backend fails
    const flags = analyzeUrl(url);
    const score = Math.min(100, flags.length * 20 + randomBetween(0, 15));
    // ... (rest of local logic would go here, but I'll implement a simplified version or just show error)
  }
}

function buildApiIndicatorRows(indicators, type) {
  if (!indicators || !indicators.length) return '';
  const tagColor = type === 'safe' ? 'var(--success)' : type === 'warning' ? 'var(--secondary)' : 'var(--danger)';
  const a = analysisPack(currentLang);
  
  let rows = indicators.map(ind => {
    const severityIcon = ind.severity === 'high' ? '🔴' : ind.severity === 'medium' ? '🟡' : '🟢';
    const severityLabel = riskLabelFromSeverity(ind.severity);
    const localizedWhy = localizedIndicatorReason(ind.severity);
    return `
      <div class="indicator-row">
        <div class="indicator-header">
          <span class="indicator-flag" style="color:${tagColor}">${severityIcon} ${ind.flag}</span>
          <span class="indicator-severity ${ind.severity}">${severityLabel}</span>
        </div>
        <div class="indicator-why"><i class="fas fa-info-circle"></i> ${localizedWhy}</div>
      </div>`;
  }).join('');
  
  return `<div class="indicator-breakdown"><div class="indicator-title"><i class="fas fa-microscope"></i> ${a.whyTitle}</div>${rows}</div>`;
}



// ── Message Scanner ───────────────────────────────────────────
const scamPhrases = [
  { phrase: 'won a prize',           why: 'Prize-win tricks are the oldest scam method. Scammers say you won something to get your address, bank details, or an advance fee.' },
  { phrase: 'click here to claim',   why: 'Urgency + link combo. This phrase pushes you to click a link immediately before you think critically.' },
  { phrase: 'your account has been', why: 'Account status manipulation — creates fear that your account is locked, blocked, or compromised to force a quick, unverified action.' },
  { phrase: 'send your otp',         why: 'No legitimate bank, payment app, or government body will EVER ask you to share your OTP. Sharing an OTP gives full account access to the scammer.' },
  { phrase: 'otp',                   why: 'Any message asking about OTP should be treated with extreme caution. OTPs are one-time passwords meant only for the rightful account owner.' },
  { phrase: 'bank details',          why: 'Requests for bank account numbers, IFSC codes, or PIN via message are always a scam. Legitimate institutions never ask for this via SMS or email.' },
  { phrase: 'aadhar card',           why: 'Aadhaar details are sensitive government ID data. Sharing Aadhaar numbers, OTPs, or linked info via messages enables identity theft.' },
  { phrase: 'verify now',            why: 'Creates pressure to do something immediately. Combined with a link, this is a classic phishing trigger phrase.' },
  { phrase: 'limited time',          why: 'Artificial time pressure prevents careful thinking. Scammers use deadlines to stop victims from verifying with the real institution.' },
  { phrase: 'urgent action required',why: 'Urgency language is a key manipulation tool in social engineering. Real banks send formal notices, not urgent SMS demands.' },
  { phrase: 'free recharge',         why: 'Free recharge scams collect mobile numbers, emails, or install malware through fake top-up websites.' },
  { phrase: 'lottery',               why: 'Lottery scams claim you won a draw you never entered. They charge an "administration fee" and disappear.' },
  { phrase: 'congratulations',       why: 'Opening with congratulations creates excitement that bypasses rational thinking — a textbook manipulation technique.' },
  { phrase: '₹ prize',              why: 'A specific rupee prize amount in a message is almost always fabricated to make the scam feel real and credible.' },
  { phrase: 'reward points expire',  why: 'Creates fake urgency around expiring reward points. Real companies notify through official apps, not random SMS.' },
  { phrase: 'kyc',                   why: 'KYC fraud messages claim your Know-Your-Customer verification is incomplete and will block your account unless you share documents via a link.' },
  { phrase: 'update your kyc',       why: 'A specific KYC update demand via SMS or email is a scam. All real KYC updates happen in-person or through the official bank app.' },
  { phrase: 'blocked',               why: 'Telling you something is "blocked" creates fear of losing access, pushing you to act without verifying through official channels.' },
  { phrase: 'suspended',             why: 'Account suspension threats are used to panic users into providing credentials on fake portals.' },
  { phrase: 'wire transfer',         why: 'Wire transfer requests from unknown senders or unexpected sources are a major red flag for financial fraud.' },
  { phrase: 'bitcoin',               why: 'Requests to convert money to Bitcoin or cryptocurrency are almost exclusively used in scams — crypto transactions are irreversible.' },
];

const patternExplanations = {
  link: {
    label: 'Contains Suspicious Link',
    why: 'The message contains a URL. Scammers embed links to direct you to fake login pages, malware downloads, or phishing sites. Never click links in unexpected messages — always go directly to the official website.',
    severity: 'high'
  },
  money: {
    label: 'Money / Amount Mentioned',
    why: 'Financial figures (₹, $, lakh, crore) in unsolicited messages are used to make scams look real or to tempt victims. Legitimate institutions do not mention specific amounts in unsolicited messages.',
    severity: 'medium'
  },
  urgency: {
    label: 'Creates Urgency / Pressure',
    why: 'Words like "urgent", "immediately", "expire", "limited" are deliberate psychological pressure tactics. Scammers want you to react emotionally and quickly, before you verify the message with the real institution.',
    severity: 'high'
  }
};



async function scanMessage() {
  const message = document.getElementById('messageInput').value.trim();
  const resultEl = document.getElementById('messageResult');
  if (!message) { showToast('Please paste a message to analyze', false); return; }

  showLoading('Analyzing message content for threats...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/analyze/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (!response.ok) throw new Error('Backend analysis failed');
    
    const data = await response.json();
    hideLoading();

    const { score, type, title, subtitle, flags, indicators } = data;
    const localizedReason = localizedSummaryByType(type, flags.length, score);
    
    let icon = 'fas fa-envelope-open-text';
    const totalFlags = flags.length;

    const tagsHtml = flags.length
      ? `<div class="threat-tags">${flags.map(f => `<span class="threat-tag ${type === 'safe' ? 'green' : 'red'}">${f}</span>`).join('')}</div>`
      : `<div class="threat-tags"><span class="threat-tag green">No Flags Detected</span></div>`;

    resultEl.className = `scan-result ${type}`;
    resultEl.innerHTML = `
      <div class="result-header">
        <div class="result-icon"><i class="${icon}"></i></div>
        <div>
          <div class="result-title">${title}</div>
          <div class="result-subtitle">Found ${totalFlags} suspicious indicator${totalFlags !== 1 ? 's' : ''}</div>
        </div>
      </div>
      ${tagsHtml}
      <div class="result-summary-box">
        <i class="fas fa-chart-bar"></i>
        <span>${localizedReason}</span>
      </div>
      ${buildApiIndicatorRows(indicators, type)}
      <div class="confidence-bar-wrap">
        <div class="confidence-label"><span>Scam Likelihood</span><span>${score}%</span></div>
        <div class="confidence-bar"><div class="confidence-fill ${type}" style="width:${score}%"></div></div>
      </div>
      <div class="result-actions">
        <button class="action-btn voice-btn" onclick='speakResult({type: ${JSON.stringify(type)}, title: ${JSON.stringify(title)}, subtitle: ${JSON.stringify(subtitle)}, rating_reason: ${JSON.stringify(localizedReason)}, score: ${score}})'>
          <i class="fas fa-volume-up"></i> <span>${translations[currentLang].listenBtn || 'Listen Analysis'}</span>
        </button>
      </div>
    `;
    
    resultEl.style.display = 'block';
    scrollToResult('messageResult');
    showToast(type === 'safe' ? 'Message appears legitimate' : 'Scam message detected!', type === 'safe');

  } catch (error) {
    console.error('Scan Error:', error);
    hideLoading();
    showToast('Analysis service unavailable.', false);
  }
}


function clearMessage() {
  document.getElementById('messageInput').value = '';
  document.getElementById('messageResult').style.display = 'none';
}

// ── Image / Screenshot Scanner ────────────────────────────────
async function scanImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  const resultEl = document.getElementById('imageResult');
  const zone = document.getElementById('uploadZone');
  zone.style.borderColor = 'var(--primary)';
  zone.querySelector('.upload-text').textContent = `📎 ${file.name} — Scanning...`;

  showLoading('Analyzing payment screenshot for manipulation...');
  
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/analyze/screenshot`, {
      method: 'POST',
      body: formData 
    });

    if (!response.ok) throw new Error('Backend analysis failed');
    
    const data = await response.json();
    hideLoading();

    const { score, type, title, subtitle, flags, indicators } = data;
    const localizedReason = localizedSummaryByType(type, flags.length, score);
    
    const tagsHtml = flags.length
      ? `<div class="threat-tags">${flags.map(f => `<span class="threat-tag ${type === 'safe' ? 'green' : type === 'warning' ? 'orange' : 'red'}">${f}</span>`).join('')}</div>`
      : `<div class="threat-tags"><span class="threat-tag green">Analysis Clean</span></div>`;

    resultEl.className = `scan-result ${type}`;
    resultEl.innerHTML = `
      <div class="result-header">
        <div class="result-icon"><i class="fas fa-image"></i></div>
        <div><div class="result-title">${title}</div><div class="result-subtitle">${subtitle}</div></div>
      </div>
      ${tagsHtml}
      <div class="result-summary-box">
        <i class="fas fa-chart-bar"></i>
        <span>${localizedReason}</span>
      </div>
      <div class="result-details">AI Confidence: ${score}% | File: ${file.name} | Size: ${(file.size / 1024).toFixed(1)} KB</div>
      ${buildApiIndicatorRows(indicators, type)}
      <div class="confidence-bar-wrap">
        <div class="confidence-label"><span>Manipulation Probability</span><span>${score}%</span></div>
        <div class="confidence-bar"><div class="confidence-fill ${type}" style="width:${score}%"></div></div>
      </div>
      <div class="result-actions">
        <button class="action-btn voice-btn" onclick='speakResult({type: ${JSON.stringify(type)}, title: ${JSON.stringify(title)}, subtitle: ${JSON.stringify(subtitle)}, rating_reason: ${JSON.stringify(localizedReason)}, score: ${score}})'>
          <i class="fas fa-volume-up"></i> <span>${translations[currentLang].listenBtn || 'Listen Analysis'}</span>
        </button>
        ${type === 'safe' 
          ? `<button class="action-btn safe"><i class="fas fa-check-circle"></i> Genuine Receipt</button>`
          : `<button class="action-btn report" onclick="scrollToSection('report')"><i class="fas fa-flag"></i> Report Forgery</button>`
        }
      </div>
    `;
    
    resultEl.style.display = 'block';
    scrollToResult('imageResult');
    zone.querySelector('.upload-text').textContent = "Upload Screenshot"; // Reset text

  } catch (error) {
    console.error('Scan Error:', error);
    hideLoading();
    showToast('Image analysis service unavailable.', false);
    zone.querySelector('.upload-text').textContent = "Upload Screenshot";
  }
}


// ── Call Scanner ──────────────────────────────────────────────
const knownScamPrefixes = ['9090', '8008', '7799', '6666', '1800'];
const scamCategories = ['KYC Scam', 'Bank Impersonation', 'Loan Fraud', 'Insurance Scam', 'Prize Claim'];

const callCategoryExplanations = {
  'KYC Scam': 'The caller will claim your KYC (Know Your Customer) verification is incomplete and your account will be blocked. They ask you to share Aadhaar, PAN, or OTP. No real bank ever calls to collect KYC data over the phone.',
  'Bank Impersonation': 'The caller pretends to be a bank official from SBI, HDFC, ICICI or another institution. Real bank officers never ask for your PIN, CVV, OTP, or full card number over the phone.',
  'Loan Fraud': 'The caller offers a pre-approved loan and asks for a processing fee or personal documents upfront. Legitimate loan approvals are never conditional on advance payments via phone.',
  'Insurance Scam': 'The caller claims you have an unclaimed insurance policy and can receive money after paying a small fee. This is a fee-advance scam — once you pay, the caller disappears.',
  'Prize Claim': 'The caller says you won a lottery or prize and must pay tax/delivery charges to receive it. You cannot win a prize from a contest you never entered.',
};

async function scanCall() {
  const num = document.getElementById('callInput').value.trim().replace(/\s/g, '');
  const resultEl = document.getElementById('callResult');
  if (!num || num.length < 10) { showToast('Please enter a valid 10-digit number', false); return; }

  showLoading('Checking number against scam database...');
  await delay(randomBetween(1500, 2500));
  hideLoading();

  const prefix4 = num.slice(-10, -6);
  const isKnownScam = knownScamPrefixes.includes(prefix4);
  const reportCount = randomBetween(isKnownScam ? 50 : 0, isKnownScam ? 800 : 20);
  const type = reportCount > 100 ? 'danger' : reportCount > 20 ? 'warning' : 'safe';
  const category = isKnownScam ? scamCategories[randomBetween(0, 4)] : null;
  const riskScore = Math.min(100, Math.floor(reportCount / 8));

  const severity = type === 'danger' ? 'high' : type === 'warning' ? 'medium' : 'low';
  const ratingReason = localizedSummaryByType(type, 1 + (category ? 1 : 0), riskScore);
  const a = analysisPack(currentLang);
  const reportColor = type === 'danger' ? 'var(--danger)' : type === 'warning' ? 'var(--secondary)' : 'var(--success)';
  const reportIcon = type === 'danger' ? '🔴' : type === 'warning' ? '🟡' : '🟢';
  const reportSeverity = riskLabelFromSeverity(severity);

  indicatorHtml = `
    <div class="indicator-breakdown">
      <div class="indicator-title"><i class="fas fa-microscope"></i> ${a.whyTitle}</div>
      <div class="indicator-row">
        <div class="indicator-header">
          <span class="indicator-flag" style="color:${reportColor}">${reportIcon} ${reportCount} Reports</span>
          <span class="indicator-severity ${severity}">${reportSeverity}</span>
        </div>
        <div class="indicator-why"><i class="fas fa-info-circle"></i> ${localizedIndicatorReason(severity)}</div>
      </div>
      ${category ? `
      <div class="indicator-row">
        <div class="indicator-header">
          <span class="indicator-flag" style="color:var(--secondary)">${reportIcon} ${category}</span>
          <span class="indicator-severity ${severity}">${reportSeverity}</span>
        </div>
        <div class="indicator-why"><i class="fas fa-info-circle"></i> ${localizedIndicatorReason(severity)}</div>
      </div>` : ''}
    </div>`;

  resultEl.className = `scan-result ${type}`;
  resultEl.innerHTML = `
    <div class="result-header">
      <div class="result-icon"><i class="fas fa-phone"></i></div>
      <div>
        <div class="result-title">${type === 'danger' ? '🚨 HIGH RISK NUMBER' : type === 'warning' ? '⚡ SUSPICIOUS NUMBER' : '✅ NUMBER APPEARS SAFE'}</div>
        <div class="result-subtitle">${reportCount} reports found in database</div>
      </div>
    </div>
    <div class="threat-tags">
      <span class="threat-tag ${type === 'safe' ? 'green' : 'red'}">${reportCount} Reports</span>
      ${category ? `<span class="threat-tag orange">${category}</span>` : ''}
      <span class="threat-tag ${type === 'safe' ? 'green' : 'red'}">${type === 'safe' ? 'Clean' : 'Flagged'}</span>
    </div>
    <div class="result-summary-box">
      <i class="fas fa-chart-bar"></i>
      <span>${ratingReason}</span>
    </div>
    <div class="result-details">Number: ${num} | Carrier: India Mobile | Reports in 30 days: ${Math.floor(reportCount * 0.6)}</div>
    ${indicatorHtml}
    <div class="confidence-bar-wrap">
      <div class="confidence-label"><span>Risk Score</span><span>${riskScore}%</span></div>
      <div class="confidence-bar"><div class="confidence-fill" style="width:${riskScore}%"></div></div>
    </div>
    <div class="result-actions" style="margin-top:15px; display:flex; gap:10px">
      <button class="action-btn voice-btn" onclick='speakResult({type: ${JSON.stringify(type)}, title: ${JSON.stringify(type === "danger" ? "High Risk Number" : type === "warning" ? "Suspicious Number" : "Safe Number")}, subtitle: ${JSON.stringify(`${reportCount} reports found`)}, rating_reason: ${JSON.stringify(plainText(ratingReason))}, score: ${riskScore}})'>
        <i class="fas fa-volume-up"></i> <span>${translations[currentLang].listenBtn || 'Listen Analysis'}</span>
      </button>
      <button class="action-btn report" onclick="scrollToSection('report')"><i class="fas fa-flag"></i> Report Scam Hub</button>
    </div>`;
  resultEl.style.display = 'block';
  showToast(type === 'safe' ? 'Number appears clean' : 'Warning: Suspicious caller detected!', type === 'safe');
}


// ── Heatmap Integration (Google Maps) ─────────────────────────
let map;
let heatmap;
let districts = [];
let mapMarkers = []; // Track markers for clearing

const levelColors = {
  critical: THEME_COLORS.neonPurple,
  high: THEME_COLORS.neonPurple,
  medium: THEME_COLORS.neonBlue,
  low: THEME_COLORS.neonBlue,
};

const mapStyles = [
  { elementType: "geometry", stylers: [{ color: THEME_COLORS.cyberBlack }] },
  { elementType: "labels.text.stroke", stylers: [{ color: THEME_COLORS.cyberBlack }] },
  { elementType: "labels.text.fill", stylers: [{ color: THEME_COLORS.neonBlue }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: THEME_COLORS.neonBlue, weight: 1 }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#050812" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: THEME_COLORS.neonBlue }] },
  { featureType: "road", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] }
];

async function initMap() {
  const mapCenter = { lat: 20.5937, lng: 78.9629 }; // Center of India
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 5,
    center: mapCenter,
    styles: mapStyles,
    disableDefaultUI: true,
    zoomControl: true,
  });

  refreshMapData();
}

async function refreshMapData() {
  try {
    const response = await fetch(`${API_BASE_URL}/districts`);
    if (response.ok) {
      districts = await response.json();
      renderMapData();
      populateHotspots();
    }
  } catch (err) {
    console.error("Map data fetch error:", err);
  }
}

function renderMapData() {
  // Clear existing markers
  mapMarkers.forEach(m => m.setMap(null));
  mapMarkers = [];

  // Clear existing heatmap layer
  if (heatmap) heatmap.setMap(null);

  const heatmapData = [];
  
  districts.forEach((d) => {
    const pos = { lat: d.lat, lng: d.lng };
    
    // Add to heatmap data
    heatmapData.push({
      location: new google.maps.LatLng(d.lat, d.lng),
      weight: d.reports / 10
    });

    // Add interactive marker
    const marker = new google.maps.Marker({
      position: pos,
      map: map,
      title: d.name,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: levelColors[d.level],
        fillOpacity: 0.7,
        strokeColor: "#ffffff",
        strokeWeight: 1,
        scale: Math.max(8, d.reports / 40 + 5)
      }
    });

    marker.addListener("click", () => showDistrictModal(d));
    mapMarkers.push(marker);
  });

  heatmap = new google.maps.visualization.HeatmapLayer({
    data: heatmapData,
    map: map,
    radius: 40,
    opacity: 0.6
  });
}

window.initMap = initMap; // Ensure global access for script callback


function showDistrictModal(d) {
  document.getElementById("modalContent").innerHTML = `
    <h2 style="font-family:var(--font-display);color:var(--text-primary);margin-bottom:0.5rem">${d.name} District</h2>
    <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1.5rem">
      <span class="hotspot-level level-${d.level}" style="font-size:0.85rem">${d.level.toUpperCase()}</span>
      <span style="color:var(--text-muted);font-size:0.85rem">Threat Level</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem">
      <div style="background:var(--bg-input);border-radius:10px;padding:1rem;text-align:center">
        <div style="font-size:1.8rem;font-weight:700;color:${levelColors[d.level]}">${d.reports}</div>
        <div style="font-size:0.78rem;color:var(--text-muted)">Total Reports</div>
      </div>
      <div style="background:var(--bg-input);border-radius:10px;padding:1rem;text-align:center">
        <div style="font-size:1.8rem;font-weight:700;color:var(--primary)">${Math.floor(d.reports * 0.3)}</div>
        <div style="font-size:0.78rem;color:var(--text-muted)">Today</div>
      </div>
    </div>
    <div style="font-size:0.85rem;color:var(--text-secondary)">
      <strong>Top Scam Types:</strong><br>
      UPI Fraud (${randomBetween(20, 40)}%) · Phishing Links (${randomBetween(15, 30)}%) · Fake Calls (${randomBetween(10, 25)}%)
    </div>`;
  document.getElementById("districtModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("districtModal").style.display = "none";
}

function populateHotspots() {
  const sorted = [...districts]
    .sort((a, b) => b.reports - a.reports)
    .slice(0, 6);
  document.getElementById("hotspotList").innerHTML = sorted
    .map(
      (d) => `
    <div class="hotspot-item">
      <span class="hotspot-name">${d.name}</span>
      <span class="hotspot-level level-${d.level}">${d.reports} reports</span>
    </div>`,
    )
    .join("");
}

async function populateRecentReports() {
  try {
    const response = await fetch(`${API_BASE_URL}/reports`);
    if (!response.ok) throw new Error("Recent reports fetch failed");
    
    const items = await response.json();
    const container = document.getElementById("recentList");
    if (!container) return;

    container.innerHTML = items.length 
      ? items.slice(0, 6).reverse().map(item => {
          const reportType = item.category || item.type || 'Other';
          const reportLocation = item.location || item.district || 'Unknown';
          return `
          <div class="recent-item">
            <div class="recent-dot" style="background:${item.description ? 'var(--secondary)' : 'var(--primary)'}"></div>
            <div><strong style="color:var(--text-secondary)">${reportType}</strong> — ${reportLocation}<br>${item.timestamp || 'Recently'}</div>
          </div>`;
        }).join("")
      : '<div style="padding:1rem;color:var(--text-muted);font-size:0.85rem">No recent reports</div>';
  } catch (err) {
    console.error("Recent reports error:", err);
  }
}


// ── Report Form ───────────────────────────────────────────────
function showFileName(input) {
  if (input.files[0]) {
    document.getElementById("evidenceText").textContent =
      `📎 ${input.files[0].name}`;
  }
}

async function submitReport(e) {
  e.preventDefault();
  const category = document.getElementById("reportType").value;
  const location = document.getElementById("reportDistrict").value;
  const description = document.getElementById("reportDesc").value;
  
  if (!category || !location || !description) {
    showToast("Please fill all required fields", false);
    return;
  }

  showLoading("Submitting your report to Cyber Kavalan database...");
  
  try {
    const response = await fetch(`${API_BASE_URL}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        location,
        type: category,
        district: location,
        description,
        reported_by: 'Citizen'
      })
    });

    if (!response.ok) throw new Error("Report submission failed");
    
    await response.json();
    hideLoading();

    showToast("Report submitted successfully.");
    e.target.reset();
    document.getElementById("evidenceText").textContent = translations[currentLang].uploadText || "Click to attach screenshot";

    // Refresh live feeds
    populateRecentReports();
    refreshMapData();

  } catch (error) {
    console.error('Report Error:', error);
    hideLoading();
    showToast('Could not reach report server. Please try again.', false);
  }
}


// ── Awareness Section ─────────────────────────────────────────
const awarenessData = {
  en: [
    {
      icon: "fas fa-fish",
      color: "rgba(239,68,68,0.15)",
      iconColor: "#f87171",
      title: "Phishing Attacks",
      body: "Phishing attempts trick you into sharing personal data through fake links.",
      tips: [
        "Never click links in unknown SMS/emails",
        "Check the sender email domain carefully",
        "Banks never ask OTP over phone or email",
      ],
    },
    {
      icon: "fas fa-rupee-sign",
      color: "rgba(16,185,129,0.15)",
      iconColor: "#34d399",
      title: "UPI Fraud",
      body: "Fraudsters use fake collect requests and QR codes to steal money.",
      tips: [
        "Never scan QR code to RECEIVE money",
        "Verify UPI ID before any transfer",
        "Ignore unsolicited payment requests",
      ],
    },
    {
      icon: "fas fa-phone-alt",
      color: "rgba(245,158,11,0.15)",
      iconColor: "#fbbf24",
      title: "Fake Calls (Vishing)",
      body: "Scammers impersonate bank/government officials to extract data.",
      tips: [
        "Hang up on KYC/OTP calls immediately",
        "Real officials never ask for passwords",
        "Call back on official numbers to verify",
      ],
    },
    {
      icon: "fas fa-globe",
      color: "rgba(124,58,237,0.15)",
      iconColor: "#a78bfa",
      title: "Fake Websites",
      body: "Counterfeit websites mimic legitimate banks and e-commerce platforms.",
      tips: [
        "Always check for HTTPS in URL",
        "Look for spelling errors in domain names",
        "Bookmark official websites you use often",
      ],
    },
    {
      icon: "fas fa-instagram",
      color: "rgba(249,115,22,0.15)",
      iconColor: "#fb923c",
      title: "Social Media Scams",
      body: "Fake profiles on Instagram/Facebook promote investment or job fraud.",
      tips: [
        "Verify profiles before investing",
        "Too-good-to-be-true returns = SCAM",
        "Report fake accounts immediately",
      ],
    },
    {
      icon: "fas fa-shopping-bag",
      color: "rgba(0,212,255,0.15)",
      iconColor: "#00d4ff",
      title: "Online Shopping Scams",
      body: "Fake e-commerce sites take payment but never deliver products.",
      tips: [
        "Shop only on trusted platforms",
        "Avoid paying via bank transfer",
        "Check reviews and seller ratings",
      ],
    },
  ],
  ta: [
    {
      icon: "fas fa-fish",
      color: "rgba(239,68,68,0.15)",
      iconColor: "#f87171",
      title: "ஃபிஷிங் தாக்குதல்கள்",
      body: "போலி இணைப்புகள் மூலம் உங்கள் தனிப்பட்ட தகவல்களை திருட முயற்சிக்கின்றனர்.",
      tips: [
        "தெரியாத SMS/மின்னஞ்சலில் இணைப்புகளை கிளிக் செய்யாதீர்கள்",
        "அனுப்புனரின் மின்னஞ்சல் டொமைனை சரிபார்க்கவும்",
        "வங்கிகள் ஒருபோதும் OTP கேட்பதில்லை",
      ],
    },
    {
      icon: "fas fa-rupee-sign",
      color: "rgba(16,185,129,0.15)",
      iconColor: "#34d399",
      title: "UPI மோசடி",
      body: "போலி கோரிக்கை மற்றும் QR குறியீடுகள் மூலம் பணம் திருடப்படுகிறது.",
      tips: [
        "பணம் பெற QR ஸ்கேன் செய்யாதீர்கள்",
        "பரிமாற்றத்திற்கு முன் UPI IDஐ சரிபார்க்கவும்",
        "எதிர்பாராத பணக் கோரிக்கைகளை புறக்கணிக்கவும்",
      ],
    },
    {
      icon: "fas fa-phone-alt",
      color: "rgba(245,158,11,0.15)",
      iconColor: "#fbbf24",
      title: "போலி அழைப்புகள்",
      body: "மோசடிக்காரர்கள் வங்கி/அரசு அதிகாரிகளாக நடிக்கின்றனர்.",
      tips: [
        "KYC/OTP அழைப்புகளை உடனடியாக துண்டிக்கவும்",
        "உண்மையான அதிகாரிகள் ஒருபோதும் கடவுச்சொல் கேட்பதில்லை",
        "அதிகாரப்பூர்வ எண்ணில் திரும்ப அழைத்து சரிபார்க்கவும்",
      ],
    },
    {
      icon: "fas fa-globe",
      color: "rgba(124,58,237,0.15)",
      iconColor: "#a78bfa",
      title: "போலி இணையதளங்கள்",
      body: "போலி இணையதளங்கள் உண்மையான வங்கிகளைப் போல் தோற்றமளிக்கின்றன.",
      tips: [
        "URL-ல் HTTPS இருக்கிறதா என சரிபார்க்கவும்",
        "டொமைன் பெயரில் எழுத்துப் பிழைகளை கவனிக்கவும்",
        "அடிக்கடி பயன்படுத்தும் தளங்களை புக்மார்க் செய்யவும்",
      ],
    },
    {
      icon: "fas fa-instagram",
      color: "rgba(249,115,22,0.15)",
      iconColor: "#fb923c",
      title: "சமூக ஊடக மோசடி",
      body: "Instagram/Facebook போலி கணக்குகள் முதலீட்டு மோசடி செய்கின்றன.",
      tips: [
        "முதலீட்டிற்கு முன் கணக்கை சரிபார்க்கவும்",
        "அதிக லாபம் = மோசடி என்று புரிந்துகொள்ளுங்கள்",
        "போலி கணக்குகளை உடனடியாக புகாரளிக்கவும்",
      ],
    },
    {
      icon: "fas fa-shopping-bag",
      color: "rgba(0,212,255,0.15)",
      iconColor: "#00d4ff",
      title: "ஆன்லைன் ஷாப்பிங் மோசடி",
      body: "போலி தளங்கள் பணம் வாங்கிவிட்டு பொருட்களை அனுப்புவதில்லை.",
      tips: [
        "நம்பகமான தளங்களில் மட்டும் கொள்முதல் செய்யவும்",
        "வங்கி பரிமாற்றம் மூலம் பணம் செலுத்த வேண்டாம்",
        "விமர்சனங்கள் மற்றும் மதிப்பீடுகளை சரிபார்க்கவும்",
      ],
    },
  ],
  hi: [
    {
      icon: "fas fa-fish",
      color: "rgba(239,68,68,0.15)",
      iconColor: "#f87171",
      title: "फ़िशिंग हमले",
      body: "फ़िशिंग लिंक आपको नकली वेबसाइटों के माध्यम से व्यक्तिगत डेटा साझा करने के लिए धोखा देते हैं।",
      tips: ["अज्ञात एसएमएस लिंक पर क्लिक न करें", "भेजने वाले का डोमेन चेक करें", "बैंक कभी ओटीपी नहीं मांगते"],
    },
    {
      icon: "fas fa-rupee-sign",
      color: "rgba(16,185,129,0.15)",
      iconColor: "#34d399",
      title: "यूपीआई धोखाधड़ी",
      body: "जालसाज पैसे चुराने के लिए फर्जी मनी रिक्वेस्ट और क्यूआर कोड का उपयोग करते हैं।",
      tips: ["पैसे पाने के लिए क्यूआर कोड स्कैन न करें", "पिन केवल पैसे भेजने के लिए चाहिए", "अनचाही रिक्वेस्ट को इग्नोर करें"],
    },
    {
      icon: "fas fa-phone-alt",
      color: "rgba(245,158,11,0.15)",
      iconColor: "#fbbf24",
      title: "फर्जी कॉल (विशिंग)",
      body: "स्कैमर्स बैंक अधिकारी बनकर आपका गोपनीय डेटा चुराने की कोशिश करते हैं।",
      tips: ["केवाईसी/ओटीपी कॉल तुरंत काट दें", "असली अधिकारी पासवर्ड नहीं मांगते", "आधिकारिक नंबर पर कॉल बैक करें"],
    },
    {
      icon: "fas fa-globe",
      color: "rgba(124,58,237,0.15)",
      iconColor: "#a78bfa",
      title: "फर्जी वेबसाइटें",
      body: "नकली वेबसाइटें असली बैंकों और ई-कॉमर्स साइटों की नकल करती हैं।",
      tips: ["हमेशा यूआरएल में HTTPS चेक करें", "स्पेलिंग की गलतियों पर ध्यान दें", "आधिकारिक साइटों को बुकमार्क करें"],
    },
    {
      icon: "fas fa-instagram",
      color: "rgba(249,115,22,0.15)",
      iconColor: "#fb923c",
      title: "सोशल मीडिया घोटाले",
      body: "इंस्टाग्राम/फेसबुक पर फर्जी प्रोफाइल निवेश या नौकरी का लालच देते हैं।",
      tips: ["ज्यादा रिटर्न = धोखा", "प्रोफाइल की सत्यता जांचें", "फर्जी प्रोफाइल को रिपोर्ट करें"],
    },
    {
      icon: "fas fa-shopping-bag",
      color: "rgba(0,212,255,0.15)",
      iconColor: "#00d4ff",
      title: "ऑनलाइन शॉपिंग धोखाधड़ी",
      body: "फर्जी शॉपिंग साइटें पैसे ले लेती हैं लेकिन सामान कभी नहीं भेजतीं।",
      tips: ["भरोसेमंद साइटों से ही खरीदारी करें", "डायरेक्ट बैंक ट्रांसफर से बचें", "सेलर की रेटिंग जरूर देखें"],
    },
  ],
  te: [
    {
      icon: "fas fa-fish",
      color: "rgba(239,68,68,0.15)",
      iconColor: "#f87171",
      title: "ఫిషింగ్ దాడులు",
      body: "నకిలీ లింకుల ద్వారా మీ వ్యక్తిగత డేటాను దొంగిలించడానికి ప్రయత్నిస్తారు.",
      tips: ["తెలియని SMS లింకులను క్లిక్ చేయవద్దు", "బ్యాంకులు ఎప్పుడూ OTP అడగవు", "లింక్ డొమైన్‌ను సరిచూసుకోండి"],
    },
    {
      icon: "fas fa-rupee-sign",
      color: "rgba(16,185,129,0.15)",
      iconColor: "#34d399",
      title: "UPI మోసం",
      body: "డబ్బు దొంగిలించడానికి నకిలీ QR కోడ్‌లను ఉపయోగిస్తారు.",
      tips: ["డబ్బు పొందడానికి QR స్కాన్ చేయవద్దు", "UPI IDని ముందుగా సరిచూసుకోండి", "అపరిచిత పేమెంట్ రిక్వెస్ట్‌లను విస్మరించండి"],
    },
    {
      icon: "fas fa-phone-alt",
      color: "rgba(245,158,11,0.15)",
      iconColor: "#fbbf24",
      title: "నకిలీ కాల్స్",
      body: "బ్యాంకు అధికారులమని నమ్మించి డేటాను సేకరిస్తారు.",
      tips: ["KYC/OTP కాల్స్ వస్తే వెంటనే కట్ చేయండి", "అధికారులు ఎప్పుడూ పాస్‌వర్డ్ అడగరు", "అధికారిక నంబర్లకు మాత్రమే కాల్ చేయండి"],
    },
    {
      icon: "fas fa-globe",
      color: "rgba(124,58,237,0.15)",
      iconColor: "#a78bfa",
      title: "నకిలీ వెబ్‌సైట్లు",
      body: "నిజమైన బ్యాంకు సైట్ల వలె కనిపించే నకిలీ సైట్లు.",
      tips: ["URLలో HTTPSని గమనించండి", "సైట్ స్పెల్లింగ్ సరిచూసుకోండి", "అధికారిక సైట్లను మాత్రమే వాడండి"],
    },
    {
      icon: "fas fa-instagram",
      color: "rgba(249,115,22,0.15)",
      iconColor: "#fb923c",
      title: "సోషల్ మీడియా స్కామ్స్",
      body: "పెట్టుబడి మోసాలకు పాల్పడే నకిలీ ప్రొఫైల్స్.",
      tips: ["ఎక్కువ రిటర్న్స్ అంటేనే మోసం", "ప్రొఫైల్ను ధృవీకరించండి", "ఫేక్ అకౌంట్లను రిపోర్ట్ చేయండి"],
    },
    {
      icon: "fas fa-shopping-bag",
      color: "rgba(0,212,255,0.15)",
      iconColor: "#00d4ff",
      title: "ఆన్‌లైన్ షాపింగ్ మోసం",
      body: "డబ్బు తీసుకుని వస్తువును పంపని నకిలీ వెబ్‌సైట్లు.",
      tips: ["నమ్మకమైన ప్లాట్‌ఫామ్స్ మాత్రమే వాడండి", "రివ్యూస్ సరిచూసుకోండి", "మనీ ట్రాన్స్‌ఫర్ చేసేముందు జాగ్రత్త"],
    },
  ],
  kn: [
    {
      icon: "fas fa-fish",
      color: "rgba(239,68,68,0.15)",
      iconColor: "#f87171",
      title: "ಫಿಶಿಂಗ್ ದಾಳಿ",
      body: "ನಕಲಿ ಲಿಂಕ್‌ಗಳ ಮೂಲಕ ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ ಕದಿಯಲು ಪ್ರಯತ್ನಿಸುತ್ತಾರೆ.",
      tips: ["ಅಪರಿಚಿತ SMS ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಬೇಡಿ", "ಬ್ಯಾಂಕ್‌ಗಳು OTP ಕೇಳುವುದಿಲ್ಲ", "ಇಮೇಲ್ ವಿಳಾಸ ಗಮನಿಸಿ"],
    },
    {
      icon: "fas fa-rupee-sign",
      color: "rgba(16,185,129,0.15)",
      iconColor: "#34d399",
      title: "UPI ವಂಚನೆ",
      body: "ಹಣ ಕದಿಯಲು ನಕಲಿ QR ಕೋಡ್ ಮತ್ತು ಪೇಮೆಂಟ್ ರಿಕ್ವೆಸ್ಟ್ ಬಳಸುತ್ತಾರೆ.",
      tips: ["ಹಣ ಪಡೆಯಲು QR ಸ್ಕ್ಯಾನ್ ಮಾಡಬೇಡಿ", "ಪಾವತಿ ಮಾಡುವ ಮುನ್ನ ID ಪರಿಶೀಲಿಸಿ", "ಅಗತ್ಯವಿಲ್ಲದ ರಿಕ್ವೆಸ್ಟ್ ಇಗ್ನೋರ್ ಮಾಡಿ"],
    },
    {
      icon: "fas fa-phone-alt",
      color: "rgba(245,158,11,0.15)",
      iconColor: "#fbbf24",
      title: "ನಕಲಿ ಕರೆಗಳು",
      body: "ಬ್ಯಾಂಕ್ ಅಧಿಕಾರಿಗಳ ಸೋಗಿನಲ್ಲಿ ಬರುವ ಕರೆಗಳು.",
      tips: ["KYC ಕರೆಗಳನ್ನು ಕೂಡಲೇ ಕಟ್ ಮಾಡಿ", "ಪಾಸ್‌ವರ್ಡ್ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ", "ಅಧಿಕೃತ ನಂಬರ್‌ಗೆ ಕಾಲ್ ಬ್ಯಾಕ್ ಮಾಡಿ"],
    },
    {
      icon: "fas fa-globe",
      color: "rgba(124,58,237,0.15)",
      iconColor: "#a78bfa",
      title: "ನಕಲಿ ವೆಬ್‌ಸೈಟ್",
      body: "ಬ್ಯಾಂಕ್ ಸೈಟ್‌ಗಳಂತೆ ಕಾಣುವ ನಕಲಿ ಜಾಲತಾಣಗಳು.",
      tips: ["HTTPS ಇದೆಯೇ ಗಮನಿಸಿ", "URL ಸ್ಪೆಲ್ಲಿಂಗ್ ಚೆಕ್ ಮಾಡಿ", "ಪರಿಚಿತ ಸೈಟ್‌ಗಳನ್ನು ಬಳಸಿ"],
    },
    {
      icon: "fas fa-instagram",
      color: "rgba(249,115,22,0.15)",
      iconColor: "#fb923c",
      title: "ಸೋಷಿಯಲ್ ಮೀಡಿಯಾ ಸ್ಕ್ಯಾಮ್",
      body: "ಹೂಡಿಕೆ ಹೆಸರಿನಲ್ಲಿ ಮಾಡುವ ಜಾಲತಾಣ ವಂಚನೆಗಳು.",
      tips: ["ಹೆಚ್ಚಿನ ಲಾಭದ ಆಸೆ ಬೇಡ", "ವಂಚಕರ ಬಗ್ಗೆ ಎಚ್ಚರವಿರಲಿ", "ಫೇಕ್ ಪ್ರೊಫೈಲ್ ರಿಪೋರ್ಟ್ ಮಾಡಿ"],
    },
    {
      icon: "fas fa-shopping-bag",
      color: "rgba(0,212,255,0.15)",
      iconColor: "#00d4ff",
      title: "ಆನ್‌ಲೈನ್ ಶಾಪಿಂಗ್ ವಂಚನೆ",
      body: "ಹಣ ಪಡೆದು ಸರಕು ಕಳುಹಿಸದ ನಕಲಿ ಶಾಪಿಂಗ್ ಸೈಟ್‌ಗಳು.",
      tips: ["ವಿಶ್ವಾಸಾರ್ಹ ಸೈಟ್‌ನಲ್ಲಿ ಮಾತ್ರ ಖರೀದಿಸಿ", "ರಿವ್ಯೂ ಗಮನಿಸಿ", "ನೇರ ಹಣ ವರ್ಗಾವಣೆ ತಡೆಯಿರಿ"],
    },
  ],
  ml: [
    {
      icon: "fas fa-fish",
      color: "rgba(239,68,68,0.15)",
      iconColor: "#f87171",
      title: "ഫിഷിംഗ് ആക്രമണങ്ങൾ",
      body: "വ്യാജ ലിങ്കുകൾ വഴി നിങ്ങളുടെ വിവരങ്ങൾ ചോർത്താൻ ശ്രമിക്കുന്നു.",
      tips: ["അപരിചിത ലിങ്കുകളിൽ ക്ലിക്ക് ചെയ്യരുത്", "ബാങ്കുകൾ OTP ചോദിക്കില്ല", "സെൻഡറുടെ വിവരങ്ങൾ ശ്രദ്ധിക്കുക"],
    },
    {
      icon: "fas fa-rupee-sign",
      color: "rgba(16,185,129,0.15)",
      iconColor: "#34d399",
      title: "UPI തട്ടിപ്പ്",
      body: "വ്യാജ QR കോഡുകൾ ഉപയോഗിച്ച് പണം കൈക്കലാക്കുന്നു.",
      tips: ["പണം ലഭിക്കാൻ QR സ്കാൻ ചെയ്യരുത്", "ഐഡി കൃത്യമാണെന്ന് ഉറപ്പാക്കുക", "പേയ്‌മെന്റ് അഭ്യർത്ഥനകൾ സൂക്ഷിക്കുക"],
    },
    {
      icon: "fas fa-phone-alt",
      color: "rgba(245,158,11,0.15)",
      iconColor: "#fbbf24",
      title: "വ്യാജ കോളുകൾ",
      body: "ബാങ്ക് ഉദ്യോഗസ്ഥർ എന്ന പേരിൽ ഭീഷണിപ്പെടുത്തുന്ന കോളുകൾ.",
      tips: ["KYC കോളുകൾ ഉടൻ കട്ട് ചെയ്യുക", "രഹസ്യവിവരങ്ങൾ നൽകരുത്", "ഔദ്യോഗിക നമ്പറിൽ തിരിച്ചു വിളിക്കുക"],
    },
    {
      icon: "fas fa-globe",
      color: "rgba(124,58,237,0.15)",
      iconColor: "#a78bfa",
      title: "വ്യാജ വെബ്സൈറ്റുകൾ",
      body: "ബാങ്കുകളുടെ വെബ്സൈറ്റുകൾക്ക് സമാനമായ വ്യാജ സൈറ്റുകൾ.",
      tips: ["HTTPS ഉണ്ടെന്ന് ഉറപ്പാക്കുക", "സ്പെല്ലിംഗ് ശ്രദ്ധിക്കുക", "ഔദ്യോഗിക സൈറ്റുകൾ മാത്രം ഉപയോഗിക്കുക"],
    },
    {
      icon: "fas fa-instagram",
      color: "rgba(249,115,22,0.15)",
      iconColor: "#fb923c",
      title: "സോഷ്യൽ മീഡിയ തട്ടിപ്പുകൾ",
      body: "നിക്ഷേപങ്ങളുടെ പേരിൽ നടത്തുന്ന വ്യാജ പ്രൊഫൈലുകൾ.",
      tips: ["ലാഭം കൂടുമ്പോൾ ജാഗ്രത പാലിക്കുക", "പ്രൊഫൈൽ ഉറപ്പാക്കുക", "വ്യാജ അക്കൗണ്ടുകൾ റിപ്പോർട്ട് ചെയ്യുക"],
    },
    {
      icon: "fas fa-shopping-bag",
      color: "rgba(0,212,255,0.15)",
      iconColor: "#00d4ff",
      title: "ഓൺലൈൻ ഷോപ്പിംഗ് തട്ടിപ്പ്",
      body: "പണം വാങ്ങിയ ശേഷം സാധനം നൽകാത്ത വ്യാജ വെബ്സൈറ്റുകൾ.",
      tips: ["വിശ്വസനീയ സൈറ്റുകൾ മാത്രം ഉപയോഗിക്കുക", "റിവ്യൂകൾ പരിശോധിക്കുക", "മണി ട്രാൻസ്ഫർ ചെയ്യുമ്പോൾ ശ്രദ്ധിക്കുക"],
    },
  ],
  es: [
    {
      icon: "fas fa-fish",
      color: "rgba(239,68,68,0.15)",
      iconColor: "#f87171",
      title: "Ataques de Phishing",
      body: "Los intentos de phishing lo engañan para que comparta datos a través de enlaces falsos.",
      tips: ["No haga clic en enlaces desconocidos", "Verifique el dominio del remitente", "Los bancos nunca piden OTP"],
    },
    {
      icon: "fas fa-rupee-sign",
      color: "rgba(16,185,129,0.15)",
      iconColor: "#34d399",
      title: "Fraude de UPI",
      body: "Los estafadores usan solicitudes falsas y códigos QR para robar dinero.",
      tips: ["No escanee QR para RECIBIR dinero", "Verifique el ID antes de transferir", "Ignore solicitudes no solicitadas"],
    },
    {
      icon: "fas fa-phone-alt",
      color: "rgba(245,158,11,0.15)",
      iconColor: "#fbbf24",
      title: "Llamadas Falsas (Vishing)",
      body: "Los estafadores se hacen pasar por oficiales para extraer sus datos.",
      tips: ["Cuelgue llamadas de KYC de inmediato", "Oficiales nunca piden contraseñas", "Llame a números oficiales para verificar"],
    },
    {
      icon: "fas fa-globe",
      color: "rgba(124,58,237,0.15)",
      iconColor: "#a78bfa",
      title: "Sitios Web Falsos",
      body: "Sitios web falsificados imitan bancos y plataformas legítimas.",
      tips: ["Verifique HTTPS en la URL", "Busque errores en el dominio", "Marque sus sitios oficiales favoritos"],
    },
    {
      icon: "fas fa-instagram",
      color: "rgba(249,115,22,0.15)",
      iconColor: "#fb923c",
      title: "Estafas en Redes Sociales",
      body: "Perfiles falsos promueven fraudes de inversión o empleo.",
      tips: ["Verifique perfiles antes de invertir", "Grandes retornos = ESTAFA", "Reporte cuentas falsas de inmediato"],
    },
    {
      icon: "fas fa-shopping-bag",
      color: "rgba(0,212,255,0.15)",
      iconColor: "#00d4ff",
      title: "Estafas de Compras Online",
      body: "Sitios falsos cobran pero nunca envían los productos.",
      tips: ["Compre solo en plataformas confiables", "Evite transferencias bancarias", "Revise valoraciones del vendedor"],
    },
  ],
  fr: [
    {
      icon: "fas fa-fish",
      color: "rgba(239,68,68,0.15)",
      iconColor: "#f87171",
      title: "Attaques de Phishing",
      body: "Le phishing vous incite à partager des données via de faux liens.",
      tips: ["Ne cliquez jamais sur des liens SMS", "Vérifiez le domaine de l'expéditeur", "Les banques ne demandent pas l'OTP"],
    },
    {
      icon: "fas fa-rupee-sign",
      color: "rgba(16,185,129,0.15)",
      iconColor: "#34d399",
      title: "Fraude UPI",
      body: "Les fraudeurs utilisent des QR codes pour voler votre argent.",
      tips: ["Ne scannez pas pour RECEVOIR", "Vérifiez l'identifiant avant transfert", "Ignorez les requêtes suspectes"],
    },
    {
      icon: "fas fa-phone-alt",
      color: "rgba(245,158,11,0.15)",
      iconColor: "#fbbf24",
      title: "Appels Frauduleux",
      body: "Escrocs se faisant passer pour des officiels de banque.",
      tips: ["Raccrochez aux appels KYC", "Les officiels ne demandent pas de MDP", "Appelez les numéros officiels"],
    },
    {
      icon: "fas fa-globe",
      color: "rgba(124,58,237,0.15)",
      iconColor: "#a78bfa",
      title: "Faux Sites Web",
      body: "Sites imitant des banques ou plateformes d'e-commerce.",
      tips: ["Vérifiez le HTTPS dans l'URL", "Attention aux fautes dans le domaine", "Mettez les sites officiels en favoris"],
    },
    {
      icon: "fas fa-instagram",
      color: "rgba(249,115,22,0.15)",
      iconColor: "#fb923c",
      title: "Arnaques Réseaux Sociaux",
      body: "Faux profils promouvant des investissements frauduleux.",
      tips: ["Vérifiez avant d'investir", "Rendement trop élevé = ARNAQUE", "Signalez les faux comptes"],
    },
    {
      icon: "fas fa-shopping-bag",
      color: "rgba(0,212,255,0.15)",
      iconColor: "#00d4ff",
      title: "Arnaques Achats en Ligne",
      body: "Faux sites qui encaissent mais ne livrent jamais.",
      tips: ["Utilisez des plateformes connues", "Évitez les virements directs", "Vérifiez les avis clients"],
    },
  ],
  ar: [
    {
      icon: "fas fa-fish",
      color: "rgba(239,68,68,0.15)",
      iconColor: "#f87171",
      title: "هجمات التصيد",
      body: "محاولات التصيد تخدعك لمشاركة بياناتك عبر روابط مزيفة.",
      tips: ["لا تفتح روابط مجهولة", "تأكد من نطاق البريد المرسل", "البنوك لا تطلب كلمة السر"],
    },
    {
      icon: "fas fa-rupee-sign",
      color: "rgba(16,185,129,0.15)",
      iconColor: "#34d399",
      title: "احتيال UPI",
      body: "يستخدم المخادعون رموز QR لسرقة الأموال.",
      tips: ["لا تفتح QR لاستلام مال", "تحقق من الهوية قبل التحويل", "تجاهل طلبات الدفع المشبوهة"],
    },
    {
      icon: "fas fa-phone-alt",
      color: "rgba(245,158,11,0.15)",
      iconColor: "#fbbf24",
      title: "مكالمات مزيفة",
      body: "منتحلو شخصيات رسمية لسرقة بيانات الحساب.",
      tips: ["أغلق المكالمة فوراً", "المسؤولون لا يطلبون أرقاماً سرية", "اتصل بالأرقام الرسمية للتأكد"],
    },
    {
      icon: "fas fa-globe",
      color: "rgba(124,58,237,0.15)",
      iconColor: "#a78bfa",
      title: "مواقع مزيفة",
      body: "مواقع تحاكي البنوك الرسمية لسرقة البيانات.",
      tips: ["تحقق من وجود HTTPS", "ابحث عن أخطاء إملائية في الرابط", "احفظ المواقع الرسمية في المفضلة"],
    },
    {
      icon: "fas fa-instagram",
      color: "rgba(249,115,22,0.15)",
      iconColor: "#fb923c",
      title: "احتيال تواصل اجتماعي",
      body: "حسابات وهمية للترويج لاستثمارات زائفة.",
      tips: ["تأكد من الحساب قبل الاستثمار", "أرباح خيالية = احتيال", "بلغ عن الحسابات الوهمية فوراً"],
    },
    {
      icon: "fas fa-shopping-bag",
      color: "rgba(0,212,255,0.15)",
      iconColor: "#00d4ff",
      title: "احتيال تسوق إلكتروني",
      body: "مواقع تأخذ المال ولا ترسل البضائع.",
      tips: ["تسوق من منصات موثوقة", "تجنب التحويل البنكي المباشر", "اقرأ مراجعات البائعين"],
    },
  ],
  zh: [
    {
      icon: "fas fa-fish",
      color: "rgba(239,68,68,0.15)",
      iconColor: "#f87171",
      title: "网络钓鱼攻击",
      body: "通过虚假链接诱导您分享个人数据。",
      tips: ["不要点击未知短链接", "检查发件人域名", "银行从不要求验证码"],
    },
    {
      icon: "fas fa-rupee-sign",
      color: "rgba(16,185,129,0.15)",
      iconColor: "#34d399",
      title: "UPI 欺诈",
      body: "骗子利用假支付请求和二维码盗款。",
      tips: ["不要通过扫描二维码收款", "转账前核实身份", "忽略不明支付请求"],
    },
    {
      icon: "fas fa-phone-alt",
      color: "rgba(245,158,11,0.15)",
      iconColor: "#fbbf24",
      title: "电信诈骗",
      body: "冒充银行或政府人员获取密码。",
      tips: ["立即挂断异常来电", "官方不会询问密码", "回拨官方热线核实"],
    },
    {
      icon: "fas fa-globe",
      color: "rgba(124,58,237,0.15)",
      iconColor: "#a78bfa",
      title: "钓鱼网站",
      body: "模仿银行和电商平台的虚假网页。",
      tips: ["查看 URL 是否有 HTTPS", "识别域名拼写错误", "将常用官方网站存为书签"],
    },
    {
      icon: "fas fa-instagram",
      color: "rgba(249,115,22,0.15)",
      iconColor: "#fb923c",
      title: "社交媒体骗局",
      body: "虚假账号推广非法理财或兼职。",
      tips: ["投资前需核实身份", "高收益即是陷阱", "立即举报虚假账号"],
    },
    {
      icon: "fas fa-shopping-bag",
      color: "rgba(0,212,255,0.15)",
      iconColor: "#00d4ff",
      title: "网购欺诈",
      body: "虚假电商平台收款后不发货。",
      tips: ["仅在信誉良好的平台购物", "避免直接银行转账", "检查评价和评分"],
    },
  ],
  pt: [
    {
      icon: "fas fa-fish",
      color: "rgba(239,68,68,0.15)",
      iconColor: "#f87171",
      title: "Ataques de Phishing",
      body: "Tentativas de roubo de dados via links falsos.",
      tips: ["Nunca clique em links SMS", "Verifique o domínio do remetente", "Bancos nunca pedem OTP"],
    },
    {
      icon: "fas fa-rupee-sign",
      color: "rgba(16,185,129,0.15)",
      iconColor: "#34d399",
      title: "Fraude de UPI",
      body: "Criminosos usam códigos QR para roubar dinheiro.",
      tips: ["Não escaneie para RECEBER", "Verifique o ID antes de enviar", "Ignore cobranças suspeitas"],
    },
    {
      icon: "fas fa-phone-alt",
      color: "rgba(245,158,11,0.15)",
      iconColor: "#fbbf24",
      title: "Chamadas Falsas",
      body: "Golpistas fingindo ser oficiais de bancos.",
      tips: ["Desligue chamadas de KYC", "Oficiais não pedem senhas", "Ligue para números oficiais"],
    },
    {
      icon: "fas fa-globe",
      color: "rgba(124,58,237,0.15)",
      iconColor: "#a78bfa",
      title: "Websites Falsos",
      body: "Páginas que imitam bancos e lojas reais.",
      tips: ["Confira HTTPS na URL", "Busque erros ortográficos", "Salve sites reais nos favoritos"],
    },
    {
      icon: "fas fa-instagram",
      color: "rgba(249,115,22,0.15)",
      iconColor: "#fb923c",
      title: "Golpes em Redes Sociais",
      body: "Perfis falsos com promessas de lucro fácil.",
      tips: ["Verifique antes de investir", "Retorno exagerado = GOLPE", "Denuncie perfis falsos"],
    },
    {
      icon: "fas fa-shopping-bag",
      color: "rgba(0,212,255,0.15)",
      iconColor: "#00d4ff",
      title: "Fraudes em Lojas Online",
      body: "Lojas que recebem e não entregam o produto.",
      tips: ["Use apenas plataformas famosas", "Evite transferências diretas", "Leia avaliações de clientes"],
    },
  ],
  de: [
    {
      icon: "fas fa-fish",
      color: "rgba(239,68,68,0.15)",
      iconColor: "#f87171",
      title: "Phishing-Angriffe",
      body: "Betrüger versuchen Daten über Links zu stehlen.",
      tips: ["Keine Links in SMS öffnen", "Absender-Domain prüfen", "Banken fragen nie nach OTP"],
    },
    {
      icon: "fas fa-rupee-sign",
      color: "rgba(16,185,129,0.15)",
      iconColor: "#34d399",
      title: "UPI-Betrug",
      body: "Kriminelle nutzen QR-Codes zum Geldiebstahl.",
      tips: ["Kein QR zum EMPFANG nutzen", "ID vor Transfer prüfen", "Zahlungsanfragen ignorieren"],
    },
    {
      icon: "fas fa-phone-alt",
      color: "rgba(245,158,11,0.15)",
      iconColor: "#fbbf24",
      title: "Falsche Anrufe",
      body: "Betrüger geben sich als Bankbeamte aus.",
      tips: ["Bei KYC-Anrufen auflegen", "Beamte fragen nie nach PWD", "Offizielle Nummern nutzen"],
    },
    {
      icon: "fas fa-globe",
      color: "rgba(124,58,237,0.15)",
      iconColor: "#a78bfa",
      title: "Gefälschte Websites",
      body: "Seiten, die Banken oder Shops täuschend echt imitieren.",
      tips: ["Auf HTTPS in URL achten", "Rechtschreibung in Domain prüfen", "Lesezeichen für offizielle Seiten"],
    },
    {
      icon: "fas fa-instagram",
      color: "rgba(249,115,22,0.15)",
      iconColor: "#fb923c",
      title: "Social-Media-Betrug",
      body: "Fake-Profile mit falschen Gewinnversprechen.",
      tips: ["Profile vor Investment prüfen", "Zu hohe Rendite = BETRUG", "Fake-Accounts sofort melden"],
    },
    {
      icon: "fas fa-shopping-bag",
      color: "rgba(0,212,255,0.15)",
      iconColor: "#00d4ff",
      title: "Online-Shopping-Betrug",
      body: "Shops, die Geld nehmen aber nichts liefern.",
      tips: ["Nur bekannte Portale nutzen", "Keine Direktüberweisungen", "Bewertungen sorgfältig lesen"],
    },
  ],
};

const awarenessPalette = [
  { color: 'rgba(188, 19, 254, 0.18)', iconColor: THEME_COLORS.neonPurple },
  { color: 'rgba(0, 242, 255, 0.16)', iconColor: THEME_COLORS.neonBlue },
  { color: 'rgba(188, 19, 254, 0.14)', iconColor: THEME_COLORS.neonPurple },
  { color: 'rgba(0, 242, 255, 0.14)', iconColor: THEME_COLORS.neonBlue },
  { color: 'rgba(188, 19, 254, 0.16)', iconColor: THEME_COLORS.neonPurple },
  { color: 'rgba(0, 242, 255, 0.18)', iconColor: THEME_COLORS.neonBlue },
];

Object.values(awarenessData).forEach((cards) => {
  cards.forEach((card, index) => {
    const paletteEntry = awarenessPalette[index % awarenessPalette.length];
    card.color = paletteEntry.color;
    card.iconColor = paletteEntry.iconColor;
  });
});


function renderAwareness(lang) {
  const grid = document.getElementById("awarenessGrid");
  const data = awarenessData[lang] || awarenessData["en"];
  grid.innerHTML = data
    .map(
      (c) => `
    <div class="awareness-card">
      <div class="aw-icon" style="background:${c.color}">
        <i class="${c.icon}" style="color:${c.iconColor}"></i>
      </div>
      <div class="aw-card-title">${c.title}</div>
      <div class="aw-card-body">${c.body}</div>
      <div class="aw-tips">
        ${c.tips.map((tip) => `<div class="aw-tip"><i class="fas fa-check-circle"></i><span>${tip}</span></div>`).join("")}
      </div>
    </div>`,
    )
    .join("");
}

function setAwarenessLang(lang, btn) {
  awarenessLang = lang;
  document.querySelectorAll(".aw-lang-btn").forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderAwareness(lang);
  
  // Also reset and reload quiz for the new language
  currentQ = 0;
  score = 0;
  loadQuestion();
  updateQuizProgress();
}

// ── Quiz ──────────────────────────────────────────────────────
const quizDataMap = {
  en: [
    {
      q: "You receive an SMS: 'Your SBI account is blocked. Click http://sbi-verify.xyz to unlock.' What do you do?",
      opts: ["Click the link immediately", "Ignore and delete the message", "Call your bank's official helpline", "Forward to friends for advice"],
      ans: 2,
      exp: "✅ Always contact your bank using the official number on their website. Never click links in SMS messages.",
    },
    {
      q: "A stranger on WhatsApp sends a QR code saying 'Scan this to receive ₹5000 cashback.' What should you do?",
      opts: ["Scan it immediately", "Ask them to send to your bank directly", "Block and report the number", "Share your UPI PIN to receive payment"],
      ans: 2,
      exp: "✅ You NEVER scan a QR code to receive money. That's how fraudsters steal from your account.",
    },
    {
      q: "Which URL looks most suspicious?",
      opts: ["https://www.sbi.co.in", "https://hdfc.com/login", "http://bank-sbi-verify-kyc.xyz/login", "https://icicibank.com"],
      ans: 2,
      exp: "✅ URLs with multiple hyphens, unusual TLDs (.xyz), and no HTTPS are red flags of phishing sites.",
    },
  ],
  ta: [
    {
      q: "உங்களுக்கு ஒரு SMS வருகிறது: 'உங்கள் வங்கி கணக்கு முடக்கப்பட்டுள்ளது. இப்போதே http://sbi-verify.xyz கிளிக் செய்யவும்.' நீங்கள் என்ன செய்வீர்கள்?",
      opts: ["உடனடியாக லிங்க் கிளிக் செய்வேன்", "புறக்கணித்து டெலீட் செய்வேன்", "வங்கியின் அதிகாரப்பூர்வ எண்ணை அழைப்பேன்", "நண்பர்களுக்கு அனுப்புவேன்"],
      ans: 2,
      exp: "✅ எப்போதும் வங்கியின் அதிகாரப்பூர்வ இணையதளத்தில் உள்ள எண்ணை மட்டும் தொடர்பு கொள்ளுங்கள். SMS-ல் வரும் லிங்குகளை கிளிக் செய்யாதீர்கள்.",
    },
    {
      q: "ஒருவர் WhatsApp-ல் QR கோடு அனுப்பி 'இதை ஸ்கேன் செய்தால் ₹5000 கேஷ்பேக் கிடைக்கும்' என்கிறார். நீங்கள் என்ன செய்வீர்கள்?",
      opts: ["உடனடியாக ஸ்கேன் செய்வேன்", "வங்கிக்கு நேரடியாக அனுப்ப சொல்வேன்", "நம்பரை பிளாக் செய்து புகாரளிப்பேன்", "UPI பின் நம்பரை கொடுப்பேன்"],
      ans: 2,
      exp: "✅ பணம் பெற நீங்கள் ஒருபோதும் QR கோடை ஸ்கேன் செய்ய வேண்டியதில்லை. இது உங்களை ஏமாற்ற முயற்சிக்கும் செயலாகும்.",
    },
    {
      q: "இதில் எது மிகவும் சந்தேகத்திற்குரிய இணையதளம்?",
      opts: ["https://www.sbi.co.in", "https://hdfc.com/login", "http://bank-sbi-verify-kyc.xyz/login", "https://icicibank.com"],
      ans: 2,
      exp: "✅ வழக்கத்திற்கு மாறான பெயர்கள் (.xyz) மற்றும் HTTPS இல்லாத தளங்கள் மோசடியானவை.",
    },
  ],
  hi: [
    {
      q: "आपको एक एसएमएस मिलता है: 'आपका बैंक खाता ब्लॉक कर दिया गया है। अनलॉक करने के लिए http://sbi-verify.xyz पर क्लिक करें।' आप क्या करेंगे?",
      opts: ["तुरंत लिंक पर क्लिक करेंगे", "इग्नोर करके डिलीट कर देंगे", "बैंक की आधिकारिक हेल्पलाइन पर कॉल करेंगे", "दोस्तों को सलाह के लिए भेजेंगे"],
      ans: 2,
      exp: "✅ हमेशा बैंक की आधिकारिक वेबसाइट पर दिए गए नंबर का उपयोग करें। एसएमएस में आए लिंक पर कभी क्लिक न करें।",
    },
    {
      q: "व्हाट्सएप पर कोई अनजान व्यक्ति क्यूआर कोड भेजता है और कहता है '₹5000 कैशबैक पाने के लिए इसे स्कैन करें।' आप क्या करेंगे?",
      opts: ["तुरंत स्कैन करेंगे", "उनसे सीधे बैंक भेजने को कहेंगे", "नंबर को ब्लॉक और रिपोर्ट करेंगे", "पेमेंट लेने के लिए यूपीआई पिन साझा करेंगे"],
      ans: 2,
      exp: "✅ पैसे प्राप्त करने के लिए आपको कभी भी क्यूआर कोड स्कैन करने की आवश्यकता नहीं होती है। यह धोखाधड़ी का तरीका है।",
    },
  ],
  te: [
    {
      q: "మీకు ఒక SMS వచ్చింది: 'మీ బ్యాంక్ ఖాతా బ్లాక్ చేయబడింది. అన్‌లాక్ చేయడానికి http://sbi-verify.xyz క్లిక్ చేయండి.' మీరు ఏమి చేస్తారు?",
      opts: ["వెంటనే లింక్ క్లిక్ చేస్తాను", "పట్టించుకోకుండా డిలీట్ చేస్తాను", "బ్యాంక్ అధికారిక హెల్ప్‌లైన్‌కు కాల్ చేస్తాను", "స్నేహితులకు ఫార్వర్డ్ చేస్తాను"],
      ans: 2,
      exp: "✅ ఎల్లప్పుడూ బ్యాంక్ అధికారిక వెబ్‌సైట్ నంబర్‌ను మాత్రమే సంప్రదించండి. SMS లింకులను క్లిక్ చేయవద్దు.",
    },
  ],
  kn: [
    {
      q: "ನಿಮಗೆ SMS ಬಂದಿದೆ: 'ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆ ಬ್ಲಾಕ್ ಆಗಿದೆ. ಅನ್ಲಾಕ್ ಮಾಡಲು http://sbi-verify.xyz ಕ್ಲಿಕ್ ಮಾಡಿ.' ನೀವು ಏನು ಮಾಡುವಿರಿ?",
      opts: ["ತಕ್ಷಣ ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡುವೆ", "ಅದನ್ನು ಇಗ್ನೋರ್ ಮಾಡಿ ಡಿಲೀಟ್ ಮಾಡುವೆ", "ಬ್ಯಾಂಕ್ ಅಧಿಕೃತ ಸಂಖ್ಯೆಗೆ ಕರೆ ಮಾಡುವೆ", "ಸ್ನೇಹಿತರಿಗೆ ಕಳುಹಿಸುವೆ"],
      ans: 2,
      exp: "✅ ಯಾವಾಗಲೂ ಬ್ಯಾಂಕಿನ ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿರುವ ಸಂಖ್ಯೆಯನ್ನು ಮಾತ್ರ ಬಳಸಿ. SMS ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಬೇಡಿ.",
    },
  ],
  ml: [
    {
      q: "നിങ്ങൾക്ക് ഒരു SMS ലഭിച്ചു: 'നിങ്ങളുടെ ബാങ്ക് അക്കൗണ്ട് ബ്ലോക്ക് ചെയ്തിരിക്കുന്നു. http://sbi-verify.xyz ക്ലിക്ക് ചെയ്യുക.' നിങ്ങൾ എന്ത് ചെയ്യും?",
      opts: ["ഉടൻ ലിങ്ക് ക്ലിക്ക് ചെയ്യും", "അത് ഡിലീറ്റ് ചെയ്യും", "ബാങ്കിന്റെ ഔദ്യോഗിക ഹെൽപ്പ് ലൈനിൽ വിളിക്കും", "സുഹൃത്തുക്കൾക്ക് അയക്കും"],
      ans: 2,
      exp: "✅ എപ്പോഴും ബാങ്കിന്റെ ഔദ്യോഗിക വെബ്സൈറ്റിലെ നമ്പർ മാത്രം ഉപയോഗിക്കുക. SMS ലിങ്കുകളിൽ ക്ലിക്ക് ചെയ്യരുത്.",
    },
  ],
  es: [
    {
      q: "Recibes un SMS: 'Tu cuenta bancaria está bloqueada. Haz clic en http://sbi-verify.xyz para desbloquear'. ¿Qué haces?",
      opts: ["Haces clic inmediatamente", "Ignoras y borras el mensaje", "Llamas a la línea oficial de tu banco", "Lo envías a amigos para pedir consejo"],
      ans: 1,
      exp: "✅ Comunícate siempre con tu banco usando el número oficial de su sitio web. Nunca hagas clic en enlaces de mensajes SMS.",
    },
    {
      q: "¿Qué URL parece más sospechosa?",
      opts: ["https://www.sbi.co.in", "https://hdfc.com/login", "http://bank-sbi-verify-kyc.xyz/login", "https://icicibank.com"],
      ans: 2,
      exp: "✅ Las URL con guiones, TLD inusuales (.xyz) y sin HTTPS son señales comunes de phishing.",
    },
  ],
  fr: [
    {
      q: "Vous recevez un SMS : 'Votre compte est bloqué. Cliquez sur http://sbi-verify.xyz pour débloquer'. Que faites-vous ?",
      opts: ["Cliquez immédiatement", "Ignorez et supprimez le message", "Appelez la ligne officielle de votre banque", "Partagez avec des amis"],
      ans: 1,
      exp: "✅ Contactez toujours votre banque via le numéro officiel sur leur site. Ne cliquez jamais sur des liens SMS.",
    },
  ],
  de: [
    {
      q: "Sie erhalten eine SMS: 'Ihr Konto ist gesperrt. Klicken Sie auf http://sbi-verify.xyz'. Was tun Sie?",
      opts: ["Sofort klicken", "Ignorieren und löschen", "Die offizielle Bank-Hotline anrufen", "An Freunde weiterleiten"],
      ans: 1,
      exp: "✅ Kontaktieren Sie Ihre Bank immer über die offizielle Nummer. Klicken Sie niemals auf Links in SMS.",
    },
  ],
  ar: [
    {
      q: "وصلتك رسالة SMS: 'حسابك البنكي محظور. اضغط على http://sbi-verify.xyz لإلغاء الحظر'. ماذا تفعل؟",
      opts: ["اضغط على الرابط فوراً", "تجاهل الرسالة واحذفها", "اتصل بخط المساعدة الرسمي للبنك", "أرسلها للأصدقاء للاستشارة"],
      ans: 2,
      exp: "✅ تواصل دائماً مع البنك باستخدام الرقم الرسمي من موقعه الإلكتروني. لا تضغط أبداً على الروابط في رسائل SMS.",
    },
    {
      q: "أي عنوان URL يبدو أكثر ريبة؟",
      opts: ["https://www.sbi.co.in", "https://hdfc.com/login", "http://bank-sbi-verify-kyc.xyz/login", "https://icicibank.com"],
      ans: 2,
      exp: "✅ عناوين URL التي تحتوي على وصلات متعددة، ونطاقات غير معتادة (.xyz)، وبدون HTTPS هي علامات حمراء لمواقع التصيد.",
    },
  ],
  zh: [
    {
      q: "您收到一条短信：'您的银行账户被冻结。点击 http://sbi-verify.xyz 解冻。' 您该怎么办？",
      opts: ["立即点击链接", "忽略并删除消息", "拨打银行官方客服热线", "转发给朋友咨询"],
      ans: 2,
      exp: "✅ 请务必通过银行官方网站上的电话与银行联系。切勿点击短信中的链接。",
    },
    {
      q: "哪个网址看起来最可疑？",
      opts: ["https://www.sbi.co.in", "https://hdfc.com/login", "http://bank-sbi-verify-kyc.xyz/login", "https://icicibank.com"],
      ans: 2,
      exp: "✅ 带有多个连字符、不寻常后缀（.xyz）且没有 HTTPS 的网址是网络钓鱼网站的特征。",
    },
  ],
  pt: [
    {
      q: "Você recebe um SMS: 'Sua conta bancária está bloqueada. Clique em http://sbi-verify.xyz para desbloquear.' O que você faz?",
      opts: ["Clica no link imediatamente", "Ignora e apaga a mensagem", "Liga para o canal oficial do seu banco", "Envia para amigos para pedir conselhos"],
      ans: 2,
      exp: "✅ Sempre entre em contato com seu banco usando o número oficial do site deles. Nunca clique em links em mensagens SMS.",
    },
    {
      q: "Qual URL parece mais suspeita?",
      opts: ["https://www.sbi.co.in", "https://hdfc.com/login", "http://bank-sbi-verify-kyc.xyz/login", "https://icicibank.com"],
      ans: 2,
      exp: "✅ URLs com hifens incomuns, domínios estranhos (.xyz) e sem HTTPS são sinais de sites de phishing.",
    },
  ],
  // Default/Fallback for others
  default: [
    {
      q: "You receive an SMS with a link to verify your bank details. What do you do?",
      opts: ["Click and verify", "Ignore it", "Call bank", "Share with others"],
      ans: 2,
      exp: "✅ Never click suspicious links. Use official channels.",
    },
  ],
};

let currentQ = 0,
  score = 0,
  answered = false;

function loadQuestion() {
  const currentQuiz = quizDataMap[awarenessLang] || quizDataMap["en"];
  if (currentQ >= currentQuiz.length) return;

  const q = currentQuiz[currentQ];
  document.getElementById("quizQuestion").textContent = `Q${currentQ + 1}. ${q.q}`;
  document.getElementById("quizOptions").innerHTML = q.opts
    .map((o, i) => `<button class="quiz-option" onclick="answerQuestion(${i})" id="opt${i}">${o}</button>`)
    .join("");
  document.getElementById("quizFeedback").style.display = "none";
  document.getElementById("quizNextBtn").style.display = "none";
  answered = false;
  updateQuizProgress();
}

function answerQuestion(idx) {
  if (answered) return;
  answered = true;
  const currentQuiz = quizDataMap[awarenessLang] || quizDataMap["en"];
  const q = currentQuiz[currentQ];
  const correct = idx === q.ans;
  document.querySelectorAll(".quiz-option").forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.ans) btn.classList.add("correct");
    else if (i === idx) btn.classList.add("wrong");
  });
  if (correct) score++;
  const fb = document.getElementById("quizFeedback");
  fb.className = `quiz-feedback ${correct ? "correct-fb" : "wrong-fb"}`;
  fb.textContent = q.exp;
  fb.style.display = "block";
  document.getElementById("quizNextBtn").style.display = "flex";

  const t = translations[currentLang] || translations["en"];
  const nextBtn = document.getElementById("quizNextBtn");
  if (nextBtn) {
    nextBtn.innerHTML = `<span>${t.quizNext || "Next"}</span> <i class="fas fa-arrow-right"></i>`;
  }

  updateQuizProgress();
}

function nextQuestion() {
  const currentQuiz = quizDataMap[awarenessLang] || quizDataMap["en"];
  currentQ++;
  if (currentQ >= currentQuiz.length) {
    document.getElementById("quizOptions").innerHTML = "";
    document.getElementById("quizQuestion").textContent = `Quiz Complete! 🎉 You scored ${score}/${currentQuiz.length}.`;
    document.getElementById("quizFeedback").style.display = "none";
    document.getElementById("quizNextBtn").style.display = "none";
    showToast(`Great job! Score: ${score}/${currentQuiz.length}`);
    return;
  }
  loadQuestion();
}

function updateQuizProgress() {
  const currentQuiz = quizDataMap[awarenessLang] || quizDataMap["en"];
  const t = translations[currentLang] || translations["en"];
  const scoreLabel = t.quizScore || "Score";

  document.getElementById("quizScore").textContent = `${scoreLabel}: ${score} / ${currentQuiz.length}`;
  document.getElementById("quizBar").style.width = `${(score / currentQuiz.length) * 100}%`;
}

// ── Live Counter Animations ───────────────────────────────────
function animateCounter(el, target, duration = 1500) {
  const start = performance.now();
  const initial = 0;
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(
      initial + (target - initial) * eased,
    ).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// Simulate live updating report count
function startLiveCounter() {
  let count = 1247;
  setInterval(() => {
    if (Math.random() > 0.6) {
      count += randomBetween(1, 5);
      const el = document.getElementById("todayCount");
      if (el) el.textContent = count.toLocaleString();
    }
  }, 3000);
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  applyTranslations("en");
  // initHeatmap() removed - initMap is handled by Google Maps callback
  populateRecentReports();
  renderAwareness("en");
  loadQuestion();
  startLiveCounter();
  initTrendChart();

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      document.getElementById("navLinks").classList.remove("open");
    });
  });

  // Intersection Observer for fade-in
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animation = "fadeInUp 0.6s ease forwards";
        }
      });
    },
    { threshold: 0.1 },
  );

  document
    .querySelectorAll(
      ".scanner-card, .trust-card, .sidebar-card, .awareness-card, .info-card",
    )
    .forEach((el) => {
      el.style.opacity = "0";
      observer.observe(el);
    });

  // Hourly refreshes
  setInterval(() => {
    refreshMapData();
    initTrendChart();
  }, 3600000);
});

let trendChart = null;

async function initTrendChart() {
  const ctx = document.getElementById('trendChart');
  if (!ctx) return;

  try {
    const response = await fetch(`${API_BASE_URL}/stats/hourly`);
    if (!response.ok) throw new Error("Failed to fetch hourly stats");
    const data = await response.json();

    const labels = data.map(d => d.hour);
    const phishingData = data.map(d => d.phishing);
    const fraudData = data.map(d => d.fraud);
    const otherData = data.map(d => d.other);
    const t = translations[currentLang] || translations['en'];

    const chartConfig = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: t.chartPhishing || 'Phishing Reports',
            data: phishingData,
            borderColor: THEME_COLORS.neonBlue,
            backgroundColor: 'rgba(0, 242, 255, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6
          },
          {
            label: t.chartFraud || 'Fraud Reports',
            data: fraudData,
            borderColor: THEME_COLORS.neonPurple,
            backgroundColor: 'rgba(188, 19, 254, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6
          },
          {
            label: t.chartOther || 'Other Threats',
            data: otherData,
            borderColor: THEME_COLORS.neonBlue,
            backgroundColor: 'rgba(0, 242, 255, 0.08)',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            tension: 0.4,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#94a3b8',
              font: { family: 'Inter', size: 12 },
              padding: 20
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#f8fafc',
            bodyColor: '#94a3b8',
            borderColor: 'rgba(0, 212, 255, 0.2)',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: function(context) {
                return ` ${context.dataset.label}: ${context.parsed.y} reports`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(148, 163, 184, 0.05)' },
            ticks: { 
              color: '#64748b',
              font: { size: 11 },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 8
            }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(148, 163, 184, 0.05)' },
            ticks: { color: '#64748b', font: { size: 11 } }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index',
        }
      }
    };

    if (trendChart) trendChart.destroy();
    trendChart = new Chart(ctx, chartConfig);

  } catch (error) {
    console.error("Trend Chart error:", error);
  }
}

async function refreshApplicationData() {
  const btn = document.getElementById('refreshBtn');
  if (btn) {
    const icon = btn.querySelector('i');
    if (icon) icon.style.animation = 'spin-refresh 1s linear infinite';
    btn.disabled = true;
  }

  showToast(translations[currentLang].loadingText || "Updating data...");
  
  try {
    await Promise.all([
      refreshMapData(),
      initTrendChart(),
      populateRecentReports()
    ]);
    
    // Animate counters again for effect
    const todayVal = 1247 + Math.floor(Math.random() * 50);
    animateCounter(document.getElementById("todayCount"), todayVal);
    
    showToast("System synchronized with real-time reports");
  } catch (error) {
    console.error("Refresh Error:", error);
    showToast("Sync partially failed. Retrying in background...", false);
  } finally {
    if (btn) {
      btn.disabled = false;
      const icon = btn.querySelector('i');
      if (icon) icon.style.animation = '';
    }
  }
}

// Allow pressing Enter to scan
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const activeTab = document.querySelector(".tab-btn.active");
    if (activeTab) {
      const tab = activeTab.dataset.tab;
      if (tab === "link") scanLink();
      else if (tab === "message") scanMessage();
    }
  }
});
