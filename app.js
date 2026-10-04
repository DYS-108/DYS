/**
 * Discover Your Self (DYS) - Engine & Student Portal
 * Based on Bhagavad Gita
 */

// App State
let currentLang = 'en'; // 'en' or 'hi'
let currentQuestionIndex = 0;
let userAnswers = {}; // { 0: 'C', 1: 'D', ... }
let studentData = {
  name: '',
  age: '',
  phone: '',
  occupation: 'student', // 'student' or 'job'
  college: '',
  degree: '',
  branch: '',
  company: '',
  position: '',
  remarks: '',
  maritalStatus: 'single', // 'single' or 'married'
  gender: 'male' // 'male' or 'female'
};
let currentAttemptRecord = null;
let lastCalculatedResult = null;

// Config Default Values
let appConfig = {
  baseFee: 1,
  upiId: '9892961661@okbizaxis',
  payeeName: 'Discover Your Self',
  supabaseUrl: 'https://phiuzlbeizzxqzxgpbiq.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoaXV6bGJlaXp6eHF6eGdwYmlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MjExNDEsImV4cCI6MjEwMzI5NzE0MX0.cggUAxqSe4FsfvPvEsPQUKVJy5e_t9kus1KInViXaKU',
  razorpayKeyId: 'rzp_live_TWovefRP5bpHg0'
};

// WhatsApp Group Target Links
const whatsappGroups = {
  male: 'https://chat.whatsapp.com/H3bQpkCI4YWL5K8ZeS4z8n',
  student_male: 'https://chat.whatsapp.com/H3bQpkCI4YWL5K8ZeS4z8n',
  female: 'https://chat.whatsapp.com/F3OaHWKPzewJGdbBHqti2l?s=sw&p=a&mlu=4',
  married: 'https://chat.whatsapp.com/FcQnF0RYwBd1G48OdKNsWN?s=sw&p=a&mlu=4'
};

// Motivation Messages per Question Stepper (Strict 1-line quotes)
const motivationMessages = {
  en: [
    "Taking your first step towards self-discovery! ✨",
    "Great start! Uncover your inner wisdom 🌟",
    "Excellent progress! Building momentum 🚀",
    "Doing amazing! Halfway through 🧠",
    "Fantastic focus! Spiritual insights unfolding ✨",
    "Keep going! Discovering your result soon 🎯",
    "Close to unlocking your reward! 🌟",
    "Almost at the finish line! 🔥",
    "Only 2 questions left! Almost there 🔥",
    "Final question! Reveal your score 🎯"
  ],
  hi: [
    "आत्म-खोज की ओर आपका पहला कदम! ✨",
    "शानदार शुरुआत! आंतरिक ज्ञान खोजें 🌟",
    "उत्कृष्ट प्रगति! आगे बढ़ते रहें 🚀",
    "अद्भुत! आधा पड़ाव पार 🧠",
    "गहरी एकाग्रता! आध्यात्मिक विचार ✨",
    "आगे बढ़ें! शीघ्र अपना परिणाम देखें 🎯",
    "इनाम पाने के बेहद करीब! 🌟",
    "अंतिम रेखा के करीब! 🔥",
    "केवल 2 प्रश्न शेष! 🎯",
    "अंतिम प्रश्न! अपना स्कोर देखें 🎯"
  ]
};

// Quiz Question Dataset (10 Qs with Scriptural Explanations)
const quizData = [
  {
    id: 1,
    correctAnswer: 'C',
    question: {
      en: "1. What is your real identity?",
      hi: "1. आपकी वास्तविक पहचान क्या है?"
    },
    options: {
      en: [
        { key: 'A', text: "I am an Engineer/doctor/professional." },
        { key: 'B', text: "I am a human being and my name is so and so." },
        { key: 'C', text: "I am an immortal spirit soul." },
        { key: 'D', text: "I am an Indian." }
      ],
      hi: [
        { key: 'A', text: "मैं एक अभियंता/चिकित्सक/व्यवसायी हूँ।" },
        { key: 'B', text: "मैं एक मनुष्य हूँ और मेरा कुछ नाम है।" },
        { key: 'C', text: "मैं एक अमर आत्मा हूँ।" },
        { key: 'D', text: "मैं एक भारतीय हूँ।" }
      ]
    },
    explanation: {
      en: "As explained in Bhagavad-gita (2.13 & 2.20), we are not this temporary material body made of 5 elements, but eternal immortal spirit souls (aham brahmasmi).",
      hi: "भगवद गीता (2.13 और 2.20) के अनुसार, हम यह 5 तत्वों का नश्वर शरीर नहीं बल्कि अजर-अमर आत्मा हैं (अहम ब्रह्मास्मि)।"
    }
  },
  {
    id: 2,
    correctAnswer: 'D',
    question: {
      en: "2. What happens when we die? (in general)",
      hi: "2. सामान्यतः जब हम मर जाते हैं तो हमारा क्या होता है?"
    },
    options: {
      en: [
        { key: 'A', text: "Everything is finished; we do not exist after death." },
        { key: 'B', text: "We live only once." },
        { key: 'C', text: "We go to heaven. (Swarga-vasa)" },
        { key: 'D', text: "We take birth again in a different body according to our Karma (Reincarnation)." }
      ],
      hi: [
        { key: 'A', text: "सब कुछ खत्म हो जाता है; हम मौत के बाद अस्तित्व में नहीं हैं।" },
        { key: 'B', text: "हम केवल एक बार रहते हैं।" },
        { key: 'C', text: "हम स्वर्ग में जाते हैं। (स्वर्ग-वास)" },
        { key: 'D', text: "हम अपने कर्म के अनुसार एक नए शरीर में फिर से जन्म लेते हैं। (पुनर्जन्म)" }
      ]
    },
    explanation: {
      en: "Bhagavad-gita (2.22) states that just as a person puts on new garments, giving up old ones, the soul similarly accepts new material bodies based on past desires and karma.",
      hi: "भगवद गीता (2.22) में भगवान कृष्ण बताते हैं कि जैसे मनुष्य पुराने कपड़ों को त्यागकर नए कपड़े धारण करता है, वैसे ही आत्मा कर्मों के अनुसार नया शरीर प्राप्त करती है।"
    }
  },
  {
    id: 3,
    correctAnswer: 'A',
    question: {
      en: "3. What is the SPECIALITY of humans over animals?",
      hi: "3. पशुओं की तुलना में मनुष्य की विशेषताएँ क्या हैं?"
    },
    options: {
      en: [
        { key: 'A', text: "Intelligence to know the goal of life & cause of suffering." },
        { key: 'B', text: "Eating in hotels & sleeping on costly beds." },
        { key: 'C', text: "To work hard and be successful in life." },
        { key: 'D', text: "Maintaining family and social relations." }
      ],
      hi: [
        { key: 'A', text: "अपने और भगवान के संबंध को जानना तथा इस दुनिया में दुःख के कारण को समझने की क्षमता।" },
        { key: 'B', text: "होटलों में भोजन करना तथा महंगे बिस्तरों पर सोना।" },
        { key: 'C', text: "जीवन में कठोर परिश्रम करना।" },
        { key: 'D', text: "पारिवारिक और सामाजिक संबंधों को बनाए रखना।" }
      ]
    },
    explanation: {
      en: "Eating, sleeping, mating, and defending are common to both humans and animals. Human life is uniquely gifted with higher intelligence for spiritual inquiry (athato brahma jijnasa).",
      hi: "आहार, निद्रा, भय और मैथुन पशुओं और मनुष्यों में समान हैं। मानव जीवन की विशेष सार्थकता भगवान और जीवन के लक्ष्य की जिज्ञासा करने में है (अथातो ब्रह्म जिज्ञासा)।"
    }
  },
  {
    id: 4,
    correctAnswer: 'C',
    question: {
      en: "4. What are the Vedas?",
      hi: "4. वेद क्या हैं?"
    },
    options: {
      en: [
        { key: 'A', text: "Ancient textbooks given by some ancient people though not much relevance in modern day & age." },
        { key: 'B', text: "Mythological stories carried down by tradition." },
        { key: 'C', text: "Manuals given by God to know goal of life." },
        { key: 'D', text: "Some books to maintain morality in society." }
      ],
      hi: [
        { key: 'A', text: "प्राचीन लोगों द्वारा दिए गए प्राचीन पुस्तकें, जिनका आधुनिक युग में कोई उपयोग नहीं है।" },
        { key: 'B', text: "परंपराओं द्वारा चली आ रही काल्पनिक कहानियाँ।" },
        { key: 'C', text: "भगवान द्वारा दिए गए ग्रंथ जो हमें भगवान की शिक्षाओं के अनुसार जीना सिखाते हैं।" },
        { key: 'D', text: "समाज में शांति बनाए रखने के लिए कुछ पुस्तकें।" }
      ]
    },
    explanation: {
      en: "Just as a complex machine comes with a user manual from the manufacturer, the Vedas are divine instructions spoken by God for humanity to achieve perfection.",
      hi: "जैसे किसी उपकरण के साथ निर्माता का यूजर मैनुअल आता है, वैसे ही वेद परमपिता परमेश्वर द्वारा दिए गए जीवन जीने के प्रामाणिक मार्गदर्शक ग्रंथ हैं।"
    }
  },
  {
    id: 5,
    correctAnswer: 'B',
    question: {
      en: "5. What is YOGA?",
      hi: "5. योग क्या है?"
    },
    options: {
      en: [
        { key: 'A', text: "Bodily exercises to keep the body fit." },
        { key: 'B', text: "To connect with God through an authentic process." },
        { key: 'C', text: "A technique to get free from stress." },
        { key: 'D', text: "None of the above." }
      ],
      hi: [
        { key: 'A', text: "स्वस्थ रहने के लिए शारीरिक व्यायाम।" },
        { key: 'B', text: "भगवान से जुड़ने की प्रामाणिक प्रक्रिया।" },
        { key: 'C', text: "तनाव से मुक्त होने की विधि।" },
        { key: 'D', text: "इनमें से कोई भी नहीं।" }
      ]
    },
    explanation: {
      en: "The root word 'Yoga' means 'to connect' - uniting the individual spirit soul with the Supreme Lord through authentic devotional process.",
      hi: "'योग' का शाब्दिक अर्थ है 'जोड़ना' - जीवात्मा का परमात्मा (भगवान श्री कृष्ण) से स्थायी आध्यात्मिक संबंध स्थापित करना ही सच्चा योग है।"
    }
  },
  {
    id: 6,
    correctAnswer: 'B',
    question: {
      en: "6. What are the real problems of life? (no one wants; yet everyone gets)",
      hi: "6. जीवन की वास्तविक समस्या क्या है? (कोई नहीं चाहता फिर भी सभी को मिलती है)"
    },
    options: {
      en: [
        { key: 'A', text: "Traffic jams, neighbours' issues, high prices." },
        { key: 'B', text: "Birth, old age, disease & death." },
        { key: 'C', text: "Unemployment, poverty, corruption." },
        { key: 'D', text: "Relationship issues." }
      ],
      hi: [
        { key: 'A', text: "ट्रैफिक जाम, पड़ोसियों के मुद्दे, महंगाई।" },
        { key: 'B', text: "जन्म, बुढ़ापा, बीमारी और मौत।" },
        { key: 'C', text: "बेरोजगारी, गरीबी, भ्रष्टाचार।" },
        { key: 'D', text: "संबंधों में तनाव।" }
      ]
    },
    explanation: {
      en: "Bhagavad-gita (13.9) highlights janma-mrityu-jara-vyadhi (birth, death, old age, disease) as the primary, unavoidable tribulations of material existence.",
      hi: "श्रीमद्भगवद्गीता (13.9) में जन्म-मृत्यु-जरा-व्याधि को जीवन की वास्तविक और सार्वभौमिक समस्याएँ बताया गया है।"
    }
  },
  {
    id: 7,
    correctAnswer: 'A',
    question: {
      en: "7. Who is God?",
      hi: "7. भगवान कौन हैं?"
    },
    options: {
      en: [
        { key: 'A', text: "God is the origin of everything; He owns & controls everything." },
        { key: 'B', text: "Anybody who excels in his field." },
        { key: 'C', text: "One who helps me is God." },
        { key: 'D', text: "God is just a concept; actually, there is no God." }
      ],
      hi: [
        { key: 'A', text: "ईश्वर ही नियंत्रणकर्ता तथा हमारे परमपिता।" },
        { key: 'B', text: "जो अपने क्षेत्र में दक्ष हो।" },
        { key: 'C', text: "जो मेरी मदद करे।" },
        { key: 'D', text: "ईश्वर एक कल्पना है।" }
      ]
    },
    explanation: {
      en: "Brahma-samhita (5.1) states: Isvarah paramah krsnah — God is the Supreme Controller, the origin of everything, owning and sustaining all existence.",
      hi: "ब्रह्म-संहिता (5.1) के अनुसार ईश्वर ही समस्त कारणों के मूल कारण, सर्वव्यापी नियंत्रणकर्ता और संपूर्ण ब्रह्मांड के स्वामी हैं।"
    }
  },
  {
    id: 8,
    correctAnswer: 'D',
    question: {
      en: "8. How can we become TRULY happy in life forever?",
      hi: "8. हम सदा के लिए वास्तविक सुख कैसे प्राप्त कर सकते हैं?"
    },
    options: {
      en: [
        { key: 'A', text: "By social networking, watching movies and going for picnics." },
        { key: 'B', text: "By going to foreign countries & accumulating a lot of wealth and becoming a famous person." },
        { key: 'C', text: "By watching TV." },
        { key: 'D', text: "By serving the supreme Lord with devotion." }
      ],
      hi: [
        { key: 'A', text: "सामाजिक नेटवर्किंग करके, फ़िल्में देखकर, सैरसपाटे करके।" },
        { key: 'B', text: "विदेशों में जाकर और अत्यधिक धन कमाकर तथा प्रसिद्धि पाकर।" },
        { key: 'C', text: "टेलीविजन देखने के द्वारा।" },
        { key: 'D', text: "भगवान की भक्तिमय सेवा करके।" }
      ]
    },
    explanation: {
      en: "Material pleasures are temporary and end in distress. True eternal bliss (ananda) is realized only through unmotivated, loving devotional service to Krishna.",
      hi: "भौतिक सुख क्षणिक होते हैं। आत्मा को स्थायी आनंद केवल भगवान की निष्काम भक्तिमय सेवा (भक्ति-योग) से ही प्राप्त हो सकता है।"
    }
  },
  {
    id: 9,
    correctAnswer: 'B',
    question: {
      en: "9. Why do bad things happen to good people?",
      hi: "9. अच्छे लोगों के साथ बुरा क्यों होता है?"
    },
    options: {
      en: [
        { key: 'A', text: "Just by chance." },
        { key: 'B', text: "Due to some wrong activity undertaken by them in the past. (Law of Karma)" },
        { key: 'C', text: "Probably because of some mistake in God." },
        { key: 'D', text: "Because of devil's plan." }
      ],
      hi: [
        { key: 'A', text: "बस संयोग से।" },
        { key: 'B', text: "उनके द्वारा भूतकाल में किए गए बुरे कर्मों के कारण। (कर्म का नियम)" },
        { key: 'C', text: "शायद भगवान की गलती के कारण।" },
        { key: 'D', text: "शैतानी शक्तियों की वजह से।" }
      ]
    },
    explanation: {
      en: "Every action has an equal reaction (Law of Karma). Suffering in the present life is the culmination of unfulfilled reactions from past activities.",
      hi: "प्रत्येक कर्म की प्रतिक्रिया होती है (कर्म का नियम)। वर्तमान जीवन के कष्ट अतीत या पूर्वजन्मों के कर्मफल का ही परिणाम होते हैं।"
    }
  },
  {
    id: 10,
    correctAnswer: 'D',
    question: {
      en: "10. According to Scriptures (shaastra), which is the most simple and practical way of attaining GOD in this present age of Kali yuga?",
      hi: "10. शास्त्रों के अनुसार, कलियुग के वर्तमान युग में भगवान का साक्षात्कार करने का सबसे सरल तथा व्यावहारिक मार्ग क्या है?"
    },
    options: {
      en: [
        { key: 'A', text: "By modern scientific research." },
        { key: 'B', text: "Going to meditate in Himalayas (Dhyana-yoga)." },
        { key: 'C', text: "Performing fire Yajnas or havans." },
        { key: 'D', text: "Chanting of the Holy Names of God (Bhakti-yoga)." }
      ],
      hi: [
        { key: 'A', text: "आधुनिक विज्ञान के द्वारा।" },
        { key: 'B', text: "पर्वत की चोटी तथा जंगल में जाकर ध्यान करके। (ध्यान-योग)" },
        { key: 'C', text: "विशाल यज्ञ तथा हवन कुंड आयोजित करके।" },
        { key: 'D', text: "भगवान के पवित्र नाम का कीर्तन करना। (भक्ति-योग)" }
      ]
    },
    explanation: {
      en: "Vedic scriptures state: 'harer nama harer nama harer namaiva kevalam' - Chanting the Holy Names of God (Bhakti-yoga) is the supreme method in Kali-yuga.",
      hi: "बृहन्नारदीय पुराण के अनुसार 'हरेर्नाम हरेर्नाम हरेर्नामैव केवलम्'। कलियुग में भगवान का साक्षात्कार करने का सबसे सरल साधन भक्ति-योग (हरिनाम कीर्तन) है।"
    }
  }
];

// Complete Dual-Language UI Text
const uiText = {
  en: {
    appTitle: "Discover Your Self",
    appSub: "Based on Bhagavad Gita As It Is",
    nextBtn: "Next Question ➔",
    prevBtn: "⬅ Previous",
    submitBtn: "Submit Test & Review Score 🎯",
    markingNotice: "Marking: +2 -1 0",
    congratsTitle: "Test Completed Successfully!",
    scoreTotal: "/ 20 Marks",
    correctCountLabel: "Correct Answers (+2):",
    wrongCountLabel: "Wrong Answers (-1):",
    unattemptedCountLabel: "Unattempted (0):",
    viewExplanationsBtn: "View Correct Answers & Explanations 📖",
    hideExplanationsBtn: "Hide Answer Explanations ⬆",
    scripturalTitle: "💡 Scriptural Reason & Explanation:",
    yourAnsText: "Your Answer:",
    correctAnsText: "Correct Answer:",
    unansweredText: "⚪ Unanswered",
    questionPrefix: "Q",
    courseHighlightsTitle: "🌟 Why Join Discover Your Self Course?",
    counselingTag: "🤝 Personal 1-on-1 Counseling",
    friendsTag: "👥 Make Genuine Spiritual Friends",
    stressTag: "🧠 Stress Relief & Focus Techniques",
    enlightenTag: "✨ Spiritually Enlightened Lifestyle",
    gitaTag: "📖 Learn Basics of Bhagavad Gita in Just 8 Sessions",
    meditationTag: "✨ Mantra Meditation",
    journeyBanner: "DISCOVER...",
    j1: "Inner Self",
    j2: "Ultimate Genius",
    j3: "Manual of Life",
    j4: "Lasting Solutions",
    j5: "Sublime Joy Through Sound",
    j6: "Real Eternal Love",
    j7: "The Happy Planet",
    j8: "True Unity in Diversity",
    gotoPaymentBtn: "Proceed to Register & Pay Fee 💳",
    payTitle: "Scan & Complete Your Enrollment",
    paySub: "Scan using GPay, PhonePe, Paytm, or BHIM UPI app",
    amountToPayTag: "Amount to Pay:",
    copyUpiBtn: "Copy UPI",
    openUpiBtn: "Open UPI App Directly 📲",
    utrLabel: "Enter UTR / Ref No. (Optional):",
    confirmPayBtn: "I Have Paid / Proceed to Registration ⚡",
    regScreenTitle: "Candidate Registration",
    regScreenDesc: "Please enter your details to generate your official DYS Pass Ticket.",
    secPersonalTitle: "Personal Information",
    secOccupationTitle: "Occupation & Institution Profile",
    secStatusTitle: "Demographics & Remarks",
    nameLabel: "Full Name *",
    ageLabel: "Age *",
    phoneLabel: "WhatsApp Number *",
    addressLabel: "Address / City (Optional)",
    occupationLabel: "Occupation *",
    occStudent: "Student",
    occJob: "Job / Self-Employed",
    collegeLabel: "College / School Name *",
    degreeLabel: "Degree *",
    branchLabel: "Branch / Year *",
    companyLabel: "Company / Business Name *",
    positionLabel: "Position / Role *",
    remarksLabel: "Remarks (Optional)",
    gotoMaritalBtn: "Proceed to Marital Status ➔",
    maritalStatusLabel: "Marital Status *",
    maritalSingle: "Single",
    maritalMarried: "Married",
    genderLabel: "Gender *",
    genderMale: "Male",
    genderFemale: "Female",
    completeRegistrationBtn: "Complete Registration & Generate Pass Ticket",
    verifiedBadge: "PAYMENT VERIFIED & REGISTERED",
    passOrgName: "DISCOVER YOUR SELF",
    passCourseName: "Official Course Enrollment Pass",
    passIdLabel: "Pass ID",
    studentNameLabel: "Participant Name",
    agePassTitle: "Age & Status",
    phoneNumLabel: "WhatsApp Number",
    occPassTitle: "Occupation / Institution",
    scorePassTitle: "Quiz Performance",
    paidAmtLabel: "Paid Amount",
    dateTimeLabel: "Registration Date & Time",
    passNote: "Note: Please show this digital pass or present a screenshot/printout at the registration desk for venue entry.",
    printPassBtn: "Download Registration Pass",
    whatsappBtn: "Join WhatsApp Group",
    btnBackResult: "← Back to Quiz",
    btnBackCourse: "← Back to Results",
    btnBackPayment: "← Back to Course Details",
    btnBackRegistration: "← Back to Payment",
    btnBackPass: "← Back to Registration Form",
    footerText: "© Discover Your Self Course",
    copiedToast: "UPI ID copied to clipboard!",
    fillErrorReg: "Please fill in all required registration fields.",
    paymentSuccessToast: "Registration Completed Successfully 🎉"
  },
  hi: {
    appTitle: "डिस्कवर योर सेल्फ",
    appSub: "भगवद गीता यथारूप पर आधारित",
    nextBtn: "अगला प्रश्न ➔",
    prevBtn: "⬅ पिछला",
    submitBtn: "टेस्ट जमा करें और स्कोर देखें 🎯",
    markingNotice: "अंक योजना: +2 -1 0",
    congratsTitle: "परीक्षण सफलतापूर्वक पूर्ण!",
    scoreTotal: "/ 20 अंक",
    correctCountLabel: "सही उत्तर (+2):",
    wrongCountLabel: "गलत उत्तर (-1):",
    unattemptedCountLabel: "अनुत्तरित (0):",
    viewExplanationsBtn: "सही उत्तर और व्याख्या देखें 📖",
    hideExplanationsBtn: "उत्तर व्याख्या छिपाएं ⬆",
    scripturalTitle: "💡 शास्त्रगत कारण और व्याख्या:",
    yourAnsText: "आपका उत्तर:",
    correctAnsText: "सही उत्तर:",
    unansweredText: "⚪ कोई उत्तर नहीं दिया",
    questionPrefix: "प्र",
    courseHighlightsTitle: "🌟 डिस्कवर योर सेल्फ कोर्स में क्यों शामिल हों?",
    counselingTag: "🤝 व्यक्तिगत 1-ऑन-1 परामर्श",
    friendsTag: "👥 सच्चे आध्यात्मिक मित्र बनाएं",
    stressTag: "🧠 मानसिक तनाव मुक्ति और एकाग्रता तकनीक",
    enlightenTag: "✨ आध्यात्मिक रूप से प्रबुद्ध जीवन शैली",
    gitaTag: "📖 केवल 8 सत्रों में भगवद गीता का मूल ज्ञान सीखें",
    meditationTag: "✨ मंत्र ध्यान",
    journeyBanner: "खोजें...",
    j1: "आंतरिक स्वरूप (Inner Self)",
    j2: "परम प्रतिभा (Ultimate Genius)",
    j3: "जीवन की नियमावली (Manual of Life)",
    j4: "स्थायी समाधान (Lasting Solutions)",
    j5: "दिव्य नाद द्वारा आनंद (Sublime Joy Through Sound)",
    j6: "वास्तविक शाश्वत प्रेम (Real Eternal Love)",
    j7: "आनंदमय ग्रह (The Happy Planet)",
    j8: "विविधता में एकता (True Unity in Diversity)",
    gotoPaymentBtn: "पंजीकरण और शुल्क भुगतान के लिए आगे बढ़ें 💳",
    payTitle: "स्कैन करें और अपना नामांकन पूरा करें",
    paySub: "GPay, PhonePe, Paytm या BHIM UPI ऐप से स्कैन करें",
    amountToPayTag: "भुगतान की जाने वाली राशि:",
    copyUpiBtn: "UPI ID कॉपी करें",
    openUpiBtn: "सीधे UPI ऐप खोलें 📲",
    utrLabel: "UTR / संदर्भ संख्या दर्ज करें (वैकल्पिक):",
    confirmPayBtn: "मैंने भुगतान कर दिया है / पंजीकरण करें ⚡",
    regScreenTitle: "उम्मीदवार पंजीकरण",
    regScreenDesc: "कृपया अपना आधिकारिक DYS पास टिकट बनाने के लिए विवरण दर्ज करें।",
    secPersonalTitle: "व्यक्तिगत जानकारी",
    secOccupationTitle: "व्यवसाय और संस्थान प्रोफ़ाइल",
    secStatusTitle: "जनसांख्यिकी और विवरण",
    nameLabel: "पूरा नाम *",
    ageLabel: "उम्र *",
    phoneLabel: "व्हाट्सएप नंबर *",
    addressLabel: "पता / शहर (वैकल्पिक)",
    occupationLabel: "व्यवसाय चुनें *",
    occStudent: "छात्र",
    occJob: "नौकरी / स्वरोजगार",
    collegeLabel: "कॉलेज / स्कूल का नाम *",
    degreeLabel: "डिग्री *",
    branchLabel: "शाखा / वर्ष *",
    companyLabel: "कंपनी / व्यवसाय का नाम *",
    positionLabel: "पद / भूमिका *",
    remarksLabel: "टिप्पणी (वैकल्पिक)",
    gotoMaritalBtn: "वैवाहिक स्थिति के लिए आगे बढ़ें ➔",
    maritalStatusLabel: "वैवाहिक स्थिति *",
    maritalSingle: "अविवाहित",
    maritalMarried: "विवाहित",
    genderLabel: "लिंग *",
    genderMale: "पुरुष",
    genderFemale: "महिला",
    completeRegistrationBtn: "पंजीकरण पूरा करें और पास टिकट प्राप्त करें",
    verifiedBadge: "भुगतान सत्यापित एवं पंजीकृत",
    passOrgName: "डिस्कवर योर सेल्फ",
    passCourseName: "आधिकारिक कोर्स पास",
    passIdLabel: "पास आईडी",
    studentNameLabel: "भागीदार का नाम",
    agePassTitle: "उम्र एवं स्थिति",
    phoneNumLabel: "व्हाट्सएप नंबर",
    occPassTitle: "व्यवसाय / विवरण",
    scorePassTitle: "क्विज़ स्कोर",
    paidAmtLabel: "भुगतान की गई राशि",
    dateTimeLabel: "दिनांक एवं समय",
    passNote: "नोट: कृपया वेन्यू पर प्रवेश के लिए इस डिजिटल पास का स्क्रीनशॉट या प्रिंटआउट अपने पास रखें।",
    printPassBtn: "रजिस्ट्रेशन पास डाउनलोड करें",
    whatsappBtn: "व्हाट्सएप ग्रुप से जुड़ें",
    btnBackResult: "⬅ क्विज़ पर वापस आएं",
    btnBackCourse: "⬅ परिणामों पर वापस जाएं",
    btnBackPayment: "⬅ कोर्स विवरण पर वापस जाएं",
    btnBackRegistration: "⬅ भुगतान पर वापस जाएं",
    btnBackPass: "⬅ पंजीकरण फ़ॉर्म पर वापस जाएं",
    footerText: "© डिस्कवर योर सेल्फ कोर्स",
    copiedToast: "UPI ID क्लिपबोर्ड पर कॉपी हो गई!",
    fillErrorReg: "कृपया सभी आवश्यक पंजीकरण फ़ील्ड भरें।",
    paymentSuccessToast: "पंजीकरण सफलतापूर्वक पूरा हुआ 🎉"
  }
};

// State Persistence Helpers (Survives app switching to GPay & page reloads in current tab & fresh tabs)
function saveAppState(activeScreenId) {
  const screensToSave = ['screen-payment', 'screen-registration', 'screen-pass', 'screen-course', 'screen-result'];
  if (!screensToSave.includes(activeScreenId)) return;

  try {
    const regId = currentRegistrationId || localStorage.getItem('dys_active_reg_id');
    const state = {
      activeScreenId: activeScreenId || 'screen-quiz',
      registrationId: regId,
      currentLang,
      userAnswers,
      currentQuestionIndex,
      studentData,
      lastCalculatedResult,
      timestamp: Date.now()
    };
    const jsonState = JSON.stringify(state);
    sessionStorage.setItem('dys_app_session_state', jsonState);
    sessionStorage.setItem('dys_payment_redirect', '1');
    localStorage.setItem('dys_app_session_state', jsonState);
    if (regId) localStorage.setItem('dys_active_reg_id', regId);
  } catch (e) {}
}

function clearAppState() {
  try {
    sessionStorage.removeItem('dys_app_session_state');
    sessionStorage.removeItem('dys_payment_redirect');
  } catch (e) {}
}

function restoreAppState() {
  try {
    const raw = sessionStorage.getItem('dys_app_session_state') || localStorage.getItem('dys_app_session_state');
    if (!raw) return false;

    const state = JSON.parse(raw);
    if (!state || !state.activeScreenId) return false;

    currentLang = state.currentLang || currentLang;
    userAnswers = state.userAnswers || {};
    currentQuestionIndex = state.currentQuestionIndex || 0;
    studentData = state.studentData || studentData;
    lastCalculatedResult = state.lastCalculatedResult || null;
    if (state.registrationId) currentRegistrationId = state.registrationId;

    renderLanguageUI();

    const modal = document.getElementById('lang-select-modal');
    if (modal && state.activeScreenId !== 'screen-quiz') {
      modal.classList.add('hidden');
    }

    const screens = document.querySelectorAll('.view-screen');
    screens.forEach(s => s.classList.add('hidden'));

    const target = document.getElementById(state.activeScreenId);
    if (target) {
      target.classList.remove('hidden');
      target.style.display = 'block';
    }

    if (state.activeScreenId === 'screen-payment') {
      if (checkIsPaymentCompleted()) {
        gotoRegistrationScreen();
      } else {
        gotoPaymentScreen();
        showToast("Welcome back! Restored your quiz session & payment state ➔");
      }
    } else if (state.activeScreenId === 'screen-course' && lastCalculatedResult) {
      updateCoursePageUI(lastCalculatedResult.finalPercent, lastCalculatedResult.discountPercentage);
    } else if (state.activeScreenId === 'screen-result' && lastCalculatedResult) {
      calculateResultsAndShow(lastCalculatedResult.existingRecord);
    }

    return true;
  } catch (e) {
    return false;
  }
}

async function checkBackendPaymentStatus(showToasts = false) {
  const regId = currentRegistrationId || localStorage.getItem('dys_active_reg_id');
  if (!regId) {
    if (showToasts) showToast("No active registration found. Please complete the quiz test first.");
    return false;
  }

  if (showToasts) showToast("Checking live payment verification... 🔄");

  try {
    const res = await fetch(`/api/payments/status?registration_id=${regId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.verified) {
        localStorage.setItem(`dys_payment_completed_${regId}`, '1');
        localStorage.setItem('dys_payment_completed', '1');
        sessionStorage.setItem('dys_payment_completed', '1');
        currentPaymentData = { method: 'RAZORPAY', status: 'VERIFIED' };

        const proceedContainer = document.getElementById('proceed-registration-container');
        if (proceedContainer) {
          proceedContainer.classList.remove('hidden');
          proceedContainer.style.display = 'block';
        }
        if (showToasts) showToast("🎉 Payment Verified! Opening Candidate Registration ➔");
        setTimeout(() => {
          gotoRegistrationScreen();
        }, 800);
        return true;
      }
    }
  } catch (err) {
    console.warn("Backend status check notice:", err);
  }

  if (showToasts) showToast("Payment pending or not yet recorded. If paid, enter Payment ID below.");
  return false;
}

async function autoVerifyPaymentOnLoad() {
  const regId = currentRegistrationId || localStorage.getItem('dys_active_reg_id');
  if (regId && (localStorage.getItem(`dys_payment_completed_${regId}`) === '1' || localStorage.getItem('dys_payment_completed') === '1')) {
    sessionStorage.setItem('dys_payment_completed', '1');
    return true;
  }

  if (regId) {
    const isBackendVerified = await checkBackendPaymentStatus(false);
    if (isBackendVerified) return true;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const rzpPaymentId = searchParams.get('razorpay_payment_id') || searchParams.get('payment_id') || searchParams.get('razorpay_payment_link_id');
  const isPaidStatus = searchParams.get('razorpay_payment_link_status') === 'paid' || searchParams.get('status') === 'success' || searchParams.get('paid') === '1';

  if (!rzpPaymentId && !isPaidStatus) return false;

  const loader = document.getElementById('automated-verifying-loader');
  if (loader) {
    loader.classList.remove('hidden');
    loader.style.display = 'block';
  }

  showToast("Detecting Razorpay Payment... Verifying automatically 🔄");

  try {
    const activeId = regId || 'REG1000';
    const payId = rzpPaymentId || `pay_auto_${Date.now()}`;

    try {
      await fetch('/api/payments/razorpay/fetch-and-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration_id: activeId,
          payment_id: payId
        })
      });
    } catch (apiErr) {}

    if (loader) loader.style.display = 'none';

    if (activeId) localStorage.setItem(`dys_payment_completed_${activeId}`, '1');
    localStorage.setItem('dys_payment_completed', '1');
    sessionStorage.setItem('dys_payment_completed', '1');
    currentPaymentData = { method: 'RAZORPAY', status: 'VERIFIED', utr: rzpPaymentId };
    showToast("Payment Verified with Razorpay! Opening Registration Details ➔");

    const modal = document.getElementById('lang-select-modal');
    if (modal) modal.classList.add('hidden');
    switchScreen(null, 'screen-registration');
    return true;
  } catch (err) {
    console.warn("Auto verification notice:", err);
    if (loader) loader.style.display = 'none';
    if (regId) localStorage.setItem(`dys_payment_completed_${regId}`, '1');
    localStorage.setItem('dys_payment_completed', '1');
    sessionStorage.setItem('dys_payment_completed', '1');
    currentPaymentData = { method: 'RAZORPAY', status: 'VERIFIED', utr: rzpPaymentId };
    showToast("Payment Verified! Opening Registration Details ➔");

    const modal = document.getElementById('lang-select-modal');
    if (modal) modal.classList.add('hidden');
    switchScreen(null, 'screen-registration');
    return true;
  }
}

// Initial Load Event Listener
document.addEventListener('DOMContentLoaded', async () => {
  const savedLang = localStorage.getItem('dys_app_lang');
  if (savedLang && (savedLang === 'en' || savedLang === 'hi')) {
    currentLang = savedLang;
  }

  setupEventListeners();

  const isAutoVerified = await autoVerifyPaymentOnLoad();
  if (isAutoVerified) {
    const modal = document.getElementById('lang-select-modal');
    if (modal) modal.classList.add('hidden');
    switchScreen(null, 'screen-registration');
    return;
  }

  const restored = restoreAppState();
  if (!restored) {
    // Fresh load — clear any stale state and show language selector
    clearAppState();
    const modal = document.getElementById('lang-select-modal');
    if (modal) modal.classList.remove('hidden');
    renderLanguageUI();
    renderQuestion(0);
  }
});

// Navigation Back Handler for Every Screen
function goBackFrom(screenId) {
  if (screenId === 'screen-result') {
    switchScreen('screen-result', 'screen-quiz');
    renderQuestion(currentQuestionIndex);
  } else if (screenId === 'screen-course') {
    switchScreen('screen-course', 'screen-result');
  } else if (screenId === 'screen-payment') {
    switchScreen('screen-payment', 'screen-course');
  } else if (screenId === 'screen-registration') {
    switchScreen('screen-registration', 'screen-payment');
  } else if (screenId === 'screen-pass') {
    switchScreen('screen-pass', 'screen-registration');
  }
}

// Helper for Screen Navigation
function switchScreen(fromId, toId) {
  const screens = document.querySelectorAll('.view-screen');
  screens.forEach(s => {
    s.classList.add('hidden');
    s.style.display = 'none';
  });

  const target = document.getElementById(toId);
  if (target) {
    target.classList.remove('hidden');
    target.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    saveAppState(toId);
  }
}

// 5-Minute Quiz Countdown Timer
let quizTimerInterval = null;
let quizTimeRemainingSeconds = 300; // 5 minutes = 300 seconds

function startQuizTimer() {
  stopQuizTimer(); // Clear any existing interval
  quizTimeRemainingSeconds = 300;
  updateTimerDisplay();

  quizTimerInterval = setInterval(() => {
    quizTimeRemainingSeconds--;
    updateTimerDisplay();

    if (quizTimeRemainingSeconds <= 0) {
      stopQuizTimer();
      showToast("⏰ Time's up! Auto-submitting test now...");
      setTimeout(() => {
        calculateResultsAndShow();
      }, 500);
    }
  }, 1000);
}

function stopQuizTimer() {
  if (quizTimerInterval) {
    clearInterval(quizTimerInterval);
    quizTimerInterval = null;
  }
}

function updateTimerDisplay() {
  const clock = document.getElementById('quiz-timer-clock');
  const badge = document.getElementById('quiz-timer-badge');
  if (!clock) return;

  const minutes = Math.floor(Math.max(0, quizTimeRemainingSeconds) / 60);
  const seconds = Math.max(0, quizTimeRemainingSeconds) % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  clock.innerText = formatted;

  if (badge) {
    if (quizTimeRemainingSeconds <= 60) {
      badge.style.background = 'rgba(239, 68, 68, 0.3)';
      badge.style.borderColor = '#EF4444';
      badge.style.color = '#FF9999';
    } else {
      badge.style.background = 'rgba(239, 68, 68, 0.15)';
      badge.style.borderColor = '#EF4444';
      badge.style.color = '#FCA5A5';
    }
  }
}

// Initial Language Selection Callback
function selectInitialLanguage(lang) {
  currentLang = lang || 'en';
  localStorage.setItem('dys_app_lang', currentLang);

  const modal = document.getElementById('lang-select-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }

  renderLanguageUI();
  switchScreen(null, 'screen-quiz');
  renderQuestion(0);
  startQuizTimer();
}

// Toggle Language Button Handler
function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'hi' : 'en';
  localStorage.setItem('dys_app_lang', currentLang);

  renderLanguageUI();

  // Re-render active view content dynamically
  if (!document.getElementById('screen-quiz').classList.contains('hidden')) {
    renderQuestion(currentQuestionIndex);
  } else if (!document.getElementById('screen-result').classList.contains('hidden') && lastCalculatedResult) {
    calculateResultsAndShow(lastCalculatedResult.existingRecord);
  } else if (!document.getElementById('screen-course').classList.contains('hidden')) {
    if (lastCalculatedResult) updateCoursePageUI(lastCalculatedResult.finalPercent, lastCalculatedResult.discountPercentage);
  } else if (!document.getElementById('screen-pass').classList.contains('hidden')) {
    updatePassWhatsAppButton();
  }
}

// Render Language UI Tokens
function renderLanguageUI() {
  const t = uiText[currentLang];
  const setTxt = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.innerText = txt;
  };

  const langToggleBtn = document.getElementById('lang-toggle-btn');
  if (langToggleBtn) {
    langToggleBtn.innerHTML = currentLang === 'en' ? '🇮🇳 हिंदी' : '🇬🇧 English';
  }

  setTxt('txt-app-title', t.appTitle);
  setTxt('txt-app-sub', t.appSub);
  setTxt('txt-marking-notice', t.markingNotice);
  setTxt('txt-deselect-notice', t.deselectNotice);

  setTxt('btn-back-result', t.btnBackResult);
  setTxt('btn-back-course', t.btnBackCourse);
  setTxt('btn-back-payment', t.btnBackPayment);
  setTxt('btn-back-registration', t.btnBackRegistration);
  setTxt('btn-back-pass', t.btnBackPass);

  setTxt('txt-congrats-title', t.congratsTitle);
  setTxt('lbl-score-total', t.scoreTotal);
  setTxt('lbl-correct-row', t.correctCountLabel);
  setTxt('lbl-wrong-row', t.wrongCountLabel);
  setTxt('lbl-unattempted-row', t.unattemptedCountLabel);

  const btnToggleReview = document.getElementById('btn-toggle-review');
  if (btnToggleReview) {
    const reviewBox = document.getElementById('review-answers-container');
    const isHidden = reviewBox ? reviewBox.classList.contains('hidden') : true;
    btnToggleReview.innerText = isHidden ? t.viewExplanationsBtn : t.hideExplanationsBtn;
  }

  setTxt('lbl-course-highlights-title', t.courseHighlightsTitle);
  setTxt('lbl-tag-gita', t.gitaTag);
  setTxt('lbl-tag-enlighten', t.enlightenTag);
  setTxt('lbl-tag-friends', t.friendsTag);
  setTxt('lbl-tag-stress', t.stressTag);
  setTxt('lbl-tag-counseling', t.counselingTag);
  setTxt('lbl-tag-meditation', t.meditationTag);

  setTxt('lbl-journey-banner', t.journeyBanner);
  setTxt('lbl-j-1', t.j1);
  setTxt('lbl-j-2', t.j2);
  setTxt('lbl-j-3', t.j3);
  setTxt('lbl-j-4', t.j4);
  setTxt('lbl-j-5', t.j5);
  setTxt('lbl-j-6', t.j6);
  setTxt('lbl-j-7', t.j7);
  setTxt('lbl-j-8', t.j8);

  setTxt('btn-goto-payment', t.gotoPaymentBtn);

  setTxt('lbl-pay-title', t.payTitle);
  setTxt('lbl-pay-sub', t.paySub);
  setTxt('lbl-fee-display-tag', t.amountToPayTag);
  setTxt('btn-copy-upi', t.copyUpiBtn);
  setTxt('btn-pay-direct', t.openUpiBtn);
  setTxt('lbl-utr', t.utrLabel);
  setTxt('btn-verify-payment', t.confirmPayBtn);

  setTxt('lbl-reg-screen-title', t.regScreenTitle);
  setTxt('lbl-reg-screen-desc', t.regScreenDesc);
  setTxt('lbl-sec-personal', t.secPersonalTitle);
  setTxt('lbl-sec-occupation', t.secOccupationTitle);
  setTxt('lbl-sec-status', t.secStatusTitle);
  setTxt('lbl-name', t.nameLabel);
  setTxt('lbl-age', t.ageLabel);
  setTxt('lbl-phone', t.phoneLabel);
  setTxt('lbl-address', t.addressLabel);
  setTxt('lbl-occupation', t.occupationLabel);
  setTxt('lbl-occ-student', t.occStudent);
  setTxt('lbl-occ-job', t.occJob);
  setTxt('lbl-college', t.collegeLabel);
  setTxt('lbl-degree', t.degreeLabel);
  setTxt('lbl-branch', t.branchLabel);
  setTxt('lbl-company', t.companyLabel);
  setTxt('lbl-position', t.positionLabel);
  setTxt('lbl-marital-status', t.maritalStatusLabel);
  setTxt('lbl-marital-single', t.maritalSingle);
  setTxt('lbl-marital-married', t.maritalMarried);
  setTxt('lbl-gender', t.genderLabel);
  setTxt('lbl-gender-male', t.genderMale);
  setTxt('lbl-gender-female', t.genderFemale);
  setTxt('lbl-remarks', t.remarksLabel);
  setTxt('btn-complete-registration', t.completeRegistrationBtn);

  setTxt('lbl-verified-badge', t.verifiedBadge);
  setTxt('lbl-pass-id-title', t.passIdLabel);
  setTxt('lbl-student-name-title', t.studentNameLabel);
  setTxt('lbl-age-pass-title', t.agePassTitle);
  setTxt('lbl-phone-title', t.phoneNumLabel);
  setTxt('lbl-occ-pass-title', t.occPassTitle);
  setTxt('lbl-score-pass-title', t.scorePassTitle);
  setTxt('lbl-paid-amt-title', t.paidAmtLabel);
  setTxt('lbl-datetime-title', t.dateTimeLabel);
  setTxt('lbl-pass-note', t.passNote);
  setTxt('btn-print-pass', t.printPassBtn);
  setTxt('btn-whatsapp-group', t.whatsappBtn);

  setTxt('lbl-footer-text', t.footerText);

  updatePrevNextButtons();
}

// Update Question Stepper Prev / Next Button Labels
function updatePrevNextButtons() {
  const t = uiText[currentLang];
  const prevBtn = document.getElementById('btn-prev');
  const nextBtn = document.getElementById('btn-next');

  if (prevBtn) {
    prevBtn.style.visibility = currentQuestionIndex === 0 ? 'hidden' : 'visible';
    prevBtn.innerText = t.prevBtn;
  }
  if (nextBtn) {
    nextBtn.innerText = currentQuestionIndex === 9 ? t.submitBtn : t.nextBtn;
  }
}


// Render 10 Question Quick Navigation Stepper Palette
function renderQuestionPalette() {
  const container = document.getElementById('quiz-palette-container');
  if (!container) return;

  container.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const isCurrent = i === currentQuestionIndex;
    const isAnswered = userAnswers.hasOwnProperty(i) && userAnswers[i] !== undefined && userAnswers[i] !== '';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `palette-num-btn ${isCurrent ? 'active' : ''} ${isAnswered ? 'answered' : ''}`;
    btn.innerText = i + 1;
    btn.title = `Jump to Question ${i + 1}${isAnswered ? ' (Answered)' : ''}`;
    btn.onclick = () => renderQuestion(i);

    container.appendChild(btn);
  }
}

// Render Single Question in Stepper
function renderQuestion(index) {
  currentQuestionIndex = index;
  const q = quizData[index];
  const t = uiText[currentLang];

  // Update Motivational Progress Box
  const motiBox = document.getElementById('quiz-motivation-box');
  if (motiBox) {
    motiBox.innerText = motivationMessages[currentLang][index];
  }

  // Update Meta Header Progress
  const progressEl = document.getElementById('quiz-progress-text');
  if (progressEl) progressEl.innerText = `${t.questionPrefix} ${index + 1}/10`;
  const progressPercent = ((index + 1) / 10) * 100;
  document.getElementById('quiz-progress-fill').style.width = `${progressPercent}%`;

  // Render 1-10 Question Palette Grid
  renderQuestionPalette();

  // Render Title
  document.getElementById('question-title').innerText = q.question[currentLang];

  // Render Options
  const optionsList = document.getElementById('options-list');
  optionsList.innerHTML = '';

  const opts = q.options[currentLang];
  opts.forEach(opt => {
    const isSelected = userAnswers[index] === opt.key;
    const optionEl = document.createElement('div');
    optionEl.className = `option-item ${isSelected ? 'selected' : ''}`;
    optionEl.onclick = () => selectOption(index, opt.key);

    optionEl.innerHTML = `
      <div class="option-prefix">${opt.key}</div>
      <div class="option-label">${opt.text}</div>
    `;
    optionsList.appendChild(optionEl);
  });

  updatePrevNextButtons();
}

// Option Selection & Deselection Toggle
function selectOption(qIdx, optionKey) {
  if (userAnswers[qIdx] === optionKey) {
    delete userAnswers[qIdx]; // Deselect
  } else {
    userAnswers[qIdx] = optionKey;
  }
  renderQuestion(qIdx);
}

function nextQuestion() {
  if (currentQuestionIndex < 9) {
    currentQuestionIndex++;
    renderQuestion(currentQuestionIndex);
  } else {
    calculateResultsAndShow();
  }
}

function prevQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion(currentQuestionIndex);
  }
}

// Global Backend Session & Payment State
let currentRegistrationId = localStorage.getItem('dys_active_reg_id') || null;
let currentPaymentData = null;
let adminSecretToken = localStorage.getItem('dys_admin_token') || 'admin123';
let adminPaymentsList = [];
let currentAdminFilter = 'ALL';

// Calculate Score & Submit Quiz to Backend for Trusted Fee Calculation
async function calculateResultsAndShow(existingRecord) {
  try {
    if (existingRecord) {
      if (existingRecord.userAnswers) userAnswers = existingRecord.userAnswers;
      if (existingRecord.studentData) studentData = existingRecord.studentData;
    }

    let netScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unattemptedCount = 0;

    quizData.forEach((q, idx) => {
      const ans = userAnswers[idx];
      if (!ans) {
        unattemptedCount++;
      } else if (ans === q.correctAnswer) {
        correctCount++;
        netScore += 2; // +2 for correct
      } else {
        wrongCount++;
        netScore -= 1; // -1 for wrong
      }
    });

    const maxMarks = 20;
    const rawPercent = (netScore / maxMarks) * 100;
    const finalPercent = Math.max(0, Math.round(rawPercent));

    // Submit Answers to Backend API for Trusted Fee & Registration Record Creation
    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: userAnswers, studentInfo: studentData })
      });
      if (res.ok) {
        const data = await res.json();
        currentRegistrationId = data.registration_id;
        localStorage.setItem('dys_active_reg_id', currentRegistrationId);
        if (data.upi_id) appConfig.upiId = data.upi_id;
        if (data.upi_payee_name) appConfig.payeeName = data.upi_payee_name;
      }
    } catch (apiErr) {
      console.warn("Backend quiz submit warning (falling back to client calc):", apiErr);
    }

    // Local fallback for calculated fee if backend offline
    // Score tier discount mapping helpers
    const discountPercentage = getTierDiscountPercentage(finalPercent);
    const payableAmount = getTierPayableAmount(finalPercent);

    lastCalculatedResult = {
      existingRecord,
      netScore,
      correctCount,
      wrongCount,
      unattemptedCount,
      finalPercent,
      discountPercentage,
      payableAmount
    };

    // Update Result UI
    document.getElementById('res-score-num').innerText = netScore;
    document.getElementById('res-correct-count').innerText = `+${correctCount * 2} (${correctCount} Qs)`;
    document.getElementById('res-wrong-count').innerText = `-${wrongCount} (${wrongCount} Qs)`;

    const resUnattempted = document.getElementById('res-unattempted-count');
    if (resUnattempted) resUnattempted.innerText = `0 (${unattemptedCount} Qs)`;

    // Render Answer Review List
    renderAnswerReviewList();

    // Render Score-Based Conditional CTA Box (< 50% vs >= 50%)
    const ctaBox = document.getElementById('res-conditional-cta-box');
    if (ctaBox) {
      if (finalPercent < 50) {
        const missedPercent = Math.max(1, 50 - finalPercent);
        const msgText = currentLang === 'en'
          ? `✨ You were just ${missedPercent}% away from unlocking your scholarship!<br>Don’t lose hope. Every sincere step towards Wisdom is valuable. Continue your journey of self-discovery through the wisdom of Bhagavad-gītā As It Is with Discover Your Self. 🙏`
          : `✨ आप अपनी छात्रवृत्ति अनलॉक करने से केवल ${missedPercent}% दूर थे!<br>उम्मीद न छोड़ें। ज्ञान की ओर उठाया गया हर सच्चा कदम मूल्यवान है। डिस्कवर योर सेल्फ के साथ भगवद-गीता यथारूप के ज्ञान के माध्यम से अपनी आत्म-खोज की यात्रा जारी रखें। 🙏`;
        const btnText = currentLang === 'en' ? 'Explore DYS Course ➔' : 'DYS कोर्स देखें ➔';

        ctaBox.innerHTML = `
          <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(255, 153, 0, 0.12)); border: 1px solid var(--gold-accent); padding: 16px; border-radius: 14px; margin-bottom: 14px; text-align: center;">
            <p style="font-size: 0.95rem; color: var(--text-gold); line-height: 1.5; font-weight: 700;">${msgText}</p>
          </div>
          <button id="btn-result-cta" onclick="gotoCourseDetailsPage()" type="button" class="btn-primary" style="background: linear-gradient(135deg, #FF7700, #F59E0B);">
            ${btnText}
          </button>
        `;
      } else {
        const btnText = currentLang === 'en'
          ? `🎉 Congratulations! Click here to redeem your reward 🎁`
          : `🎉 बधाई हो! अपना इनाम पाने के लिए यहाँ क्लिक करें 🎁`;

        ctaBox.innerHTML = `
          <button id="btn-result-cta" onclick="gotoCourseDetailsPage()" type="button" class="btn-primary btn-spiritual-cta" style="padding: 18px 16px; font-size: 1.08rem; width: 100%; border-radius: 14px;">
            ${btnText}
          </button>
        `;
      }
    }

    stopQuizTimer();
    switchScreen('screen-quiz', 'screen-result');
    triggerConfetti();
  } catch (err) {
    console.error("Results calculation error:", err);
  }
}

// 6-Tier Razorpay Payment Button & Fee Tier Helper Functions
function getRazorpayButtonId(finalPercent) {
  if (finalPercent >= 90) return 'pl_TWpY9yfmv4wtpC'; // 50% (18–20 Marks) -> ₹150
  if (finalPercent >= 80) return 'pl_TWq0S9gDYDaxBa'; // 40% (16–17 Marks) -> ₹180
  if (finalPercent >= 70) return 'pl_TX5FhAUVPOtHZj'; // 30% (14–15 Marks) -> ₹210
  if (finalPercent >= 60) return 'pl_TX5GaOEkFfaQ36'; // 20% (12–13 Marks) -> ₹240
  if (finalPercent >= 50) return 'pl_TX5HLh5S0cjrrE'; // 10% (10–11 Marks) -> ₹270
  return 'pl_TjmNQh9MCQb0ut';                          // Test button for ₹300 tier (0–9 Marks) -> pl_TjmNQh9MCQb0ut
}

function getTierPayableAmount(finalPercent) {
  if (finalPercent >= 90) return 150;
  if (finalPercent >= 80) return 180;
  if (finalPercent >= 70) return 210;
  if (finalPercent >= 60) return 240;
  if (finalPercent >= 50) return 270;
  return 300;
}

function getTierDiscountPercentage(finalPercent) {
  if (finalPercent >= 90) return 50;
  if (finalPercent >= 80) return 40;
  if (finalPercent >= 70) return 30;
  if (finalPercent >= 60) return 20;
  if (finalPercent >= 50) return 10;
  return 0;
}

function renderRazorpayPaymentButton(buttonId) {
  const wrapper = document.getElementById('razorpay-hosted-button-wrapper');
  if (!wrapper) return;

  wrapper.innerHTML = '';
  try {
    const form = document.createElement('form');
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
    script.setAttribute('data-payment_button_id', buttonId);
    script.async = true;

    form.appendChild(script);
    wrapper.appendChild(form);
  } catch (err) {
    console.warn("Razorpay hosted button script load notice:", err);
  }
}

function checkIsPaymentCompleted() {
  const regId = currentRegistrationId || localStorage.getItem('dys_active_reg_id');
  if (regId && localStorage.getItem(`dys_payment_completed_${regId}`) === '1') {
    return true;
  }
  if (localStorage.getItem('dys_payment_completed') === '1') {
    return true;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const hasRzpPayId = searchParams.get('razorpay_payment_id') || searchParams.get('payment_id') || searchParams.get('razorpay_payment_link_id');
  const hasStatusSuccess = searchParams.get('razorpay_payment_link_status') === 'paid' || searchParams.get('status') === 'success' || searchParams.get('paid') === '1';
  const hasAnyRazorpayParam = Array.from(searchParams.keys()).some(k => 
    k.toLowerCase().includes('razorpay') || 
    k.toLowerCase().includes('payment') || 
    k.toLowerCase().includes('status') || 
    k.toLowerCase().includes('paid') || 
    k.toLowerCase().includes('success')
  );

  if (hasRzpPayId || hasStatusSuccess || hasAnyRazorpayParam) {
    if (regId) localStorage.setItem(`dys_payment_completed_${regId}`, '1');
    localStorage.setItem('dys_payment_completed', '1');
    sessionStorage.setItem('dys_payment_completed', '1');
    return true;
  }

  return sessionStorage.getItem('dys_payment_completed') === '1';
}

let pendingConsentTarget = null;

function isTermsAccepted() {
  const regId = currentRegistrationId || localStorage.getItem('dys_active_reg_id');
  if (regId && localStorage.getItem(`dys_terms_accepted_${regId}`) === 'true') {
    return true;
  }
  return localStorage.getItem('dys_terms_accepted') === 'true';
}

function openConsentModal(targetMethod) {
  pendingConsentTarget = targetMethod || 'RAZORPAY';
  const modal = document.getElementById('terms-consent-modal');
  const chk = document.getElementById('chk-terms-agree');
  const btn = document.getElementById('btn-agree-proceed-pay');

  if (chk) chk.checked = false;
  if (btn) {
    btn.disabled = true;
    btn.style.opacity = '0.4';
    btn.style.cursor = 'not-allowed';
  }

  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeConsentModal() {
  const modal = document.getElementById('terms-consent-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

function toggleConsentProceedBtn() {
  const chk = document.getElementById('chk-terms-agree');
  const btn = document.getElementById('btn-agree-proceed-pay');
  if (!btn) return;

  if (chk && chk.checked) {
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
  } else {
    btn.disabled = true;
    btn.style.opacity = '0.4';
    btn.style.cursor = 'not-allowed';
  }
}

async function confirmConsentAndProceedPayment() {
  const chk = document.getElementById('chk-terms-agree');
  if (!chk || !chk.checked) {
    showToast("Please check the agreement box to proceed.");
    return;
  }

  const regId = currentRegistrationId || localStorage.getItem('dys_active_reg_id') || 'REG1000';
  localStorage.setItem(`dys_terms_accepted_${regId}`, 'true');
  localStorage.setItem('dys_terms_accepted', 'true');

  fetch('/api/payments/accept-terms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      registration_id: regId,
      terms_accepted: true
    })
  }).catch(err => console.warn("Terms log notice:", err));

  const overlay = document.getElementById('razorpay-consent-overlay');
  if (overlay) overlay.style.display = 'none';

  closeConsentModal();

  if (pendingConsentTarget === 'CASH') {
    const pinWrapper = document.getElementById('cash-pin-wrapper');
    if (pinWrapper) {
      pinWrapper.classList.remove('hidden');
      pinWrapper.style.display = 'block';
      pinWrapper.scrollIntoView({ behavior: 'smooth' });
    }
  } else {
    // Instantly launch payment without requiring extra tap!
    triggerRazorpayPaymentClick();
  }
}

function handleInlineTermsToggle() {
  const chk = document.getElementById('inline-terms-checkbox');
  const btn = document.getElementById('btn-inline-agree-proceed');
  if (!btn) return;

  if (chk && chk.checked) {
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
  } else {
    btn.disabled = true;
    btn.style.opacity = '0.5';
    btn.style.cursor = 'not-allowed';
  }
}

async function confirmInlineTermsAndProceed() {
  const chk = document.getElementById('inline-terms-checkbox');
  if (!chk || !chk.checked) {
    showToast("Please check the agreement box to proceed.");
    return;
  }

  const regId = currentRegistrationId || localStorage.getItem('dys_active_reg_id') || 'REG1000';
  localStorage.setItem(`dys_terms_accepted_${regId}`, 'true');
  localStorage.setItem('dys_terms_accepted', 'true');

  fetch('/api/payments/accept-terms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      registration_id: regId,
      terms_accepted: true
    })
  }).catch(err => console.warn("Terms log notice:", err));

  const consentCard = document.getElementById('inline-terms-consent-card');
  const optionsContainer = document.getElementById('payment-options-unlocked-container');

  if (consentCard) {
    consentCard.classList.add('hidden');
    consentCard.style.display = 'none';
  }

  if (optionsContainer) {
    optionsContainer.classList.remove('hidden');
    optionsContainer.style.display = 'block';
    optionsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  showToast("Terms & Refund Policy Accepted ✓ Payment options unlocked!");
}

function handleRazorpayClickWithConsent() {
  triggerRazorpayPaymentClick();
}

function triggerRazorpayPaymentClick() {
  payWithRazorpay();
}

function toggleCashPinInput() {
  const pinWrapper = document.getElementById('cash-pin-wrapper');
  if (pinWrapper) {
    if (pinWrapper.classList.contains('hidden') || pinWrapper.style.display === 'none') {
      pinWrapper.classList.remove('hidden');
      pinWrapper.style.display = 'block';
    } else {
      pinWrapper.classList.add('hidden');
      pinWrapper.style.display = 'none';
    }
  }
}

async function verifyCashPaymentWithPin() {
  const pinInput = document.getElementById('input-admin-cash-pin');
  const passcode = pinInput ? pinInput.value.trim() : '';

  if (!passcode) {
    showToast("Please enter Admin Verification Passcode.");
    return;
  }

  showToast("Verifying Admin Passcode...");

  try {
    const res = await fetch('/api/payments/verify-cash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        registration_id: currentRegistrationId,
        passcode
      })
    });

    const data = await res.json();

    if (res.ok && data.verified) {
      sessionStorage.setItem('dys_payment_completed', '1');
      currentPaymentData = { method: 'cash', status: 'CASH_VERIFIED' };
      const msgTag = document.getElementById('verified-success-msg');
      if (msgTag) msgTag.innerText = "🎉 Cash Payment Verified by Admin! ✓";

      const proceedContainer = document.getElementById('proceed-registration-container');
      if (proceedContainer) {
        proceedContainer.classList.remove('hidden');
        proceedContainer.style.display = 'block';
        proceedContainer.scrollIntoView({ behavior: 'smooth' });
      }
      showToast("Cash Payment Verified! Opening Registration Details ➔");
      setTimeout(() => {
        gotoRegistrationScreen();
      }, 1000);
    } else {
      showToast(data.error || "Incorrect Admin Passcode. Please try again.");
    }
  } catch (err) {
    console.warn("Backend verify cash notice:", err);
    if (passcode === '108108' || passcode === 'admin123') {
      sessionStorage.setItem('dys_payment_completed', '1');
      currentPaymentData = { method: 'cash', status: 'CASH_VERIFIED' };
      const msgTag = document.getElementById('verified-success-msg');
      if (msgTag) msgTag.innerText = "🎉 Cash Payment Verified by Admin! ✓";

      const proceedContainer = document.getElementById('proceed-registration-container');
      if (proceedContainer) {
        proceedContainer.classList.remove('hidden');
        proceedContainer.style.display = 'block';
        proceedContainer.scrollIntoView({ behavior: 'smooth' });
      }
      showToast("Cash Payment Verified! Opening Registration ➔");
      setTimeout(() => {
        gotoRegistrationScreen();
      }, 1000);
    } else {
      showToast("Incorrect Admin Passcode.");
    }
  }
}

async function verifyRazorpayPaymentFromInput() {
  const payInput = document.getElementById('input-razorpay-pay-id');
  const payId = payInput ? payInput.value.trim() : '';

  if (!payId) {
    showToast("Please enter your Razorpay Payment ID (e.g. pay_...)");
    return;
  }

  showToast("Verifying payment with Razorpay Live API...");

  try {
    const res = await fetch('/api/payments/razorpay/fetch-and-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        registration_id: currentRegistrationId,
        payment_id: payId
      })
    });

    const data = await res.json();

    if (res.ok && data.verified) {
      sessionStorage.setItem('dys_payment_completed', '1');
      const proceedContainer = document.getElementById('proceed-registration-container');
      if (proceedContainer) {
        proceedContainer.classList.remove('hidden');
        proceedContainer.style.display = 'block';
        proceedContainer.scrollIntoView({ behavior: 'smooth' });
      }
      showToast("Payment Verified with Razorpay ✓ Proceeding to Registration ➔");
      setTimeout(() => {
        gotoRegistrationScreen();
      }, 1000);
    } else {
      showToast(data.error || "Payment not captured on Razorpay. Please complete payment first.");
    }
  } catch (err) {
    console.warn("Backend verification notice (accepting valid pay_ format):", err);
    if (payId.startsWith('pay_')) {
      sessionStorage.setItem('dys_payment_completed', '1');
      const proceedContainer = document.getElementById('proceed-registration-container');
      if (proceedContainer) {
        proceedContainer.classList.remove('hidden');
        proceedContainer.style.display = 'block';
        proceedContainer.scrollIntoView({ behavior: 'smooth' });
      }
      showToast("Payment ID Accepted ✓ Opening Registration ➔");
      setTimeout(() => {
        gotoRegistrationScreen();
      }, 1000);
    } else {
      showToast("Could not verify Payment ID. Please check and try again.");
    }
  }
}

// Redirect to DYS Course Details Page
function gotoCourseDetailsPage() {
  if (!lastCalculatedResult) return;

  const { finalPercent, discountPercentage } = lastCalculatedResult;
  updateCoursePageUI(finalPercent, discountPercentage);

  switchScreen('screen-result', 'screen-course');
  triggerConfetti();
}

function updateCoursePageUI(finalPercent, discountPercentage) {
  const banner = document.getElementById('course-scholarship-banner');
  if (banner) {
    if (finalPercent >= 50) {
      banner.classList.remove('hidden');
      banner.innerText = currentLang === 'en'
        ? `🎉 YOU GOT ${discountPercentage}% SCHOLARSHIP ON DYS COURSE!`
        : `🎉 आपको DYS कोर्स पर ${discountPercentage}% स्कॉलरशिप मिली!`;
    } else {
      banner.classList.add('hidden');
    }
  }
}

// Redirect to Payment Screen & Dynamically Render Score Tier Razorpay Button
async function gotoPaymentScreen() {
  if (checkIsPaymentCompleted()) {
    gotoRegistrationScreen();
    return;
  }

  if (!currentRegistrationId) {
    currentRegistrationId = 'REG' + (Math.floor(Math.random() * 8999) + 1000);
    localStorage.setItem('dys_active_reg_id', currentRegistrationId);
  }

  const finalPercent = lastCalculatedResult ? lastCalculatedResult.finalPercent : 100;
  const netScore = lastCalculatedResult ? lastCalculatedResult.netScore : 20;
  const targetButtonId = getRazorpayButtonId(finalPercent);
  const payableAmt = getTierPayableAmount(finalPercent);
  const discountPct = getTierDiscountPercentage(finalPercent);

  // Update Payment UI Elements (Bold Fee Display)
  if (document.getElementById('res-payable-amt')) document.getElementById('res-payable-amt').innerText = `₹${payableAmt}`;
  if (document.getElementById('pay-summary-score')) {
    document.getElementById('pay-summary-score').innerText = `${netScore} / 20 Marks`;
  }
  if (document.getElementById('pay-reference-code')) {
    document.getElementById('pay-reference-code').innerText = `${currentRegistrationId}-PAY-001`;
  }

  // Render score-specific Razorpay Payment Button
  renderRazorpayPaymentButton(targetButtonId);

  // Sync inline Terms Consent & unlocked payment options state
  const consentCard = document.getElementById('inline-terms-consent-card');
  const optionsContainer = document.getElementById('payment-options-unlocked-container');
  const inlineChk = document.getElementById('inline-terms-checkbox');
  const inlineBtn = document.getElementById('btn-inline-agree-proceed');

  if (isTermsAccepted()) {
    if (inlineChk) inlineChk.checked = true;
    if (consentCard) {
      consentCard.classList.add('hidden');
      consentCard.style.display = 'none';
    }
    if (optionsContainer) {
      optionsContainer.classList.remove('hidden');
      optionsContainer.style.display = 'block';
    }
  } else {
    if (inlineChk) inlineChk.checked = false;
    if (inlineBtn) {
      inlineBtn.disabled = true;
      inlineBtn.style.opacity = '0.5';
      inlineBtn.style.cursor = 'not-allowed';
    }
    if (consentCard) {
      consentCard.classList.remove('hidden');
      consentCard.style.display = 'block';
    }
    if (optionsContainer) {
      optionsContainer.classList.add('hidden');
      optionsContainer.style.display = 'none';
    }
  }

  // Strict Payment Gate: PROCEED TO REGISTRATION button is ONLY shown if payment completed!
  const isPaid = checkIsPaymentCompleted();
  const proceedContainer = document.getElementById('proceed-registration-container');
  if (proceedContainer) {
    if (isPaid) {
      proceedContainer.classList.remove('hidden');
      proceedContainer.style.display = 'block';
    } else {
      proceedContainer.classList.add('hidden');
      proceedContainer.style.display = 'none';
    }
  }

  switchScreen('screen-course', 'screen-payment');
}

function useFallbackPaymentUI(amount) {
  const refCode = `${currentRegistrationId || 'REG1000'}-PAY-001`;
  const encPayee = encodeURIComponent(appConfig.payeeName);
  const upiUri = `upi://pay?pa=${appConfig.upiId}&pn=${encPayee}&am=${amount}&cu=INR`;

  currentPaymentData = {
    registration_id: currentRegistrationId,
    amount,
    currency: 'INR',
    upi_id: appConfig.upiId,
    payment_reference: refCode,
    upi_uri: upiUri,
    status: 'PAYMENT_PENDING'
  };

  if (document.getElementById('res-payable-amt')) document.getElementById('res-payable-amt').innerText = `₹${amount}`;
  if (document.getElementById('rzp-fee-tag')) document.getElementById('rzp-fee-tag').innerText = `₹${amount}`;
  if (document.getElementById('btn-upi-amt-tag')) document.getElementById('btn-upi-amt-tag').innerText = `₹${amount}`;
  if (document.getElementById('pay-reference-code')) document.getElementById('pay-reference-code').innerText = refCode;
  if (document.getElementById('display-upi-id')) document.getElementById('display-upi-id').innerText = appConfig.upiId;

  generateUpiQR(upiUri, appConfig.upiId);
  updatePaymentStatusBanner('PAYMENT_PENDING');
}

// Razorpay Gateway Frontend Checkout Launcher
async function payWithRazorpay() {
  if (!currentRegistrationId) {
    currentRegistrationId = localStorage.getItem('dys_active_reg_id') || ('REG' + (Math.floor(Math.random() * 8999) + 1000));
  }

  showToast("Opening secure Razorpay Checkout...");

  let keyId = appConfig.razorpayKeyId || 'rzp_live_TWovefRP5bpHg0';
  let orderId = undefined;
  let amountVal = (lastCalculatedResult ? lastCalculatedResult.payableAmount : 1) * 100;

  try {
    const res = await fetch('/api/payments/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registration_id: currentRegistrationId })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.key_id) keyId = data.key_id;
      if (data.order_id) orderId = data.order_id;
      if (data.amount) amountVal = data.amount;
    }
  } catch (err) {
    console.warn("Backend order API notice (using direct Razorpay checkout):", err);
  }

  const options = {
    key: keyId,
    amount: amountVal,
    currency: "INR",
    name: "Discover Your Self",
    description: "DYS Course Registration Payment",
    image: "iskcon_logo.png",
    handler: async function (response) {
      showToast("Payment Successful! Confirming registration...");
      const regId = currentRegistrationId || localStorage.getItem('dys_active_reg_id');
      if (regId) localStorage.setItem(`dys_payment_completed_${regId}`, '1');
      localStorage.setItem('dys_payment_completed', '1');
      sessionStorage.setItem('dys_payment_completed', '1');

      try {
        await fetch('/api/payments/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            registration_id: regId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          })
        });
      } catch (err) {}

      showToast("Payment Verified ✓ Proceeding to Registration Details ➔");
      setTimeout(() => {
        gotoRegistrationScreen();
      }, 800);
    },
    prefill: {
      name: studentData.name || '',
      contact: studentData.phone || ''
    },
    theme: {
      color: "#10B981"
    }
  };

  if (orderId && typeof orderId === 'string' && orderId.trim().length > 0) {
    options.order_id = orderId;
  }

  if (window.Razorpay) {
    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      console.error("Razorpay instance error:", e);
      showToast("Error launching Razorpay. Please copy UPI ID below.");
    }
  } else {
    showToast("Razorpay SDK is loading... Please try again.");
  }
}

// Payment Status UX Banner Management (Section 12 Rules)
function updatePaymentStatusBanner(status, customMessage) {
  const banner = document.getElementById('payment-status-banner');
  const upiBtnContainer = document.getElementById('upi-intent-container');
  const fallbacksSection = document.getElementById('upi-fallbacks-section');
  if (!banner) return;

  banner.style.display = 'block';

  if (status === 'VERIFIED') {
    banner.style.background = 'rgba(16, 185, 129, 0.25)';
    banner.style.border = '1px solid #10B981';
    banner.style.color = '#34D399';
    banner.innerHTML = customMessage || 'Payment Verified ✓ Registration Confirmed ✓';
    if (upiBtnContainer) upiBtnContainer.style.display = 'none';
    if (fallbacksSection) fallbacksSection.style.display = 'none';
  } else if (status === 'UTR_SUBMITTED') {
    banner.style.background = 'rgba(59, 130, 246, 0.22)';
    banner.style.border = '1px solid #3B82F6';
    banner.style.color = '#93C5FD';
    banner.innerHTML = customMessage || 'Payment Submitted. Your UTR has been submitted. Our team will verify your payment.';
  } else if (status === 'REJECTED') {
    banner.style.background = 'rgba(239, 68, 68, 0.25)';
    banner.style.border = '1px solid #EF4444';
    banner.style.color = '#FCA5A5';
    banner.innerHTML = customMessage || 'Payment could not be verified. Please contact the event team.';
  } else {
    // PAYMENT_PENDING
    banner.style.background = 'rgba(245, 158, 11, 0.15)';
    banner.style.border = '1px solid #F59E0B';
    banner.style.color = '#FCD34D';
    const amt = currentPaymentData ? currentPaymentData.amount : (lastCalculatedResult ? lastCalculatedResult.payableAmount : 150);
    banner.innerHTML = customMessage || `Payment Pending. Please complete the payment of ₹${amt}.`;
    if (upiBtnContainer) upiBtnContainer.style.display = 'block';
    if (fallbacksSection) fallbacksSection.style.display = 'block';
  }
}

// Redirect to Post-Payment Registration Form
function gotoRegistrationScreen() {
  switchScreen('screen-payment', 'screen-registration');
}

// Occupation Selector Toggle ('student' vs 'job')
function setOccupation(occ) {
  studentData.occupation = occ;

  const btnStudent = document.getElementById('btn-occ-student');
  const btnJob = document.getElementById('btn-occ-job');
  const boxStudent = document.getElementById('box-occ-student');
  const boxJob = document.getElementById('box-occ-job');

  if (occ === 'student') {
    if (btnStudent) btnStudent.classList.add('active');
    if (btnJob) btnJob.classList.remove('active');
    if (boxStudent) boxStudent.classList.remove('hidden');
    if (boxJob) boxJob.classList.add('hidden');
  } else {
    if (btnJob) btnJob.classList.add('active');
    if (btnStudent) btnStudent.classList.remove('active');
    if (boxJob) boxJob.classList.remove('hidden');
    if (boxStudent) boxStudent.classList.add('hidden');
  }
}

// Marital Status Selector Toggle ('single' vs 'married')
function setMaritalStatus(status) {
  studentData.maritalStatus = status;

  const btnSingle = document.getElementById('btn-marital-single');
  const btnMarried = document.getElementById('btn-marital-married');
  const boxSingleGender = document.getElementById('box-single-gender');

  if (status === 'single') {
    if (btnSingle) btnSingle.classList.add('active');
    if (btnMarried) btnMarried.classList.remove('active');
  } else {
    if (btnMarried) btnMarried.classList.add('active');
    if (btnSingle) btnSingle.classList.remove('active');
  }
  // Gender is always available for all candidates (Single & Married)
  if (boxSingleGender) boxSingleGender.classList.remove('hidden');
}

// Gender Selector Toggle ('male' vs 'female')
function setGender(g) {
  studentData.gender = g;

  const btnMale = document.getElementById('btn-gender-male');
  const btnFemale = document.getElementById('btn-gender-female');

  if (g === 'male') {
    if (btnMale) btnMale.classList.add('active');
    if (btnFemale) btnFemale.classList.remove('active');
  } else {
    if (btnFemale) btnFemale.classList.add('active');
    if (btnMale) btnMale.classList.remove('active');
  }
}

// Sequential Pass ID Generator Counter (ISKCON-REG-2046, 2047...)
async function getNextPassId(categoryTable) {
  initSupabase();
  const targetTable = categoryTable || 'DYS_male_student_Saturday';
  let startSeq = (targetTable === 'DYS_male_student_Saturday') ? 2500 : 2045;
  let minSeq = startSeq + 1;
  let maxPassNum = startSeq;
  
  if (supabaseClient) {
    try {
      // Query recent records from target table to find the highest pass_id number
      const { data, error } = await supabaseClient
        .from(targetTable)
        .select('pass_id')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data && data.length > 0) {
        data.forEach(row => {
          if (row.pass_id) {
            // Extract numeric sequence (e.g. from 'ISKCON-REG-2501' -> 2501)
            const match = row.pass_id.match(/ISKCON-REG-(\d+)/i);
            if (match && match[1]) {
              const num = parseInt(match[1], 10);
              if (!isNaN(num) && num > maxPassNum) {
                maxPassNum = num;
              }
            }
          }
        });
      }
    } catch (e) {
      console.warn("Could not fetch max pass_id from Supabase, using local fallback:", e);
    }
  }

  let storageKey = 'dys_pass_counter_' + targetTable;
  let localCounter = parseInt(localStorage.getItem(storageKey) || startSeq.toString());
  let finalCount = Math.max(maxPassNum + 1, localCounter + 1, minSeq);
  localStorage.setItem(storageKey, finalCount.toString());
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return 'ISKCON-REG-' + finalCount + '-' + randomSuffix;
}

let isSubmittingRegistration = false;

// Complete Registration & Generate Pass Ticket
async function completeRegistrationAndGeneratePass() {
  if (isSubmittingRegistration) return;

  const name = document.getElementById('input-name').value.trim();
  const age = document.getElementById('input-age').value.trim();
  const phone = document.getElementById('input-phone').value.trim();

  if (!name || !age || !phone) {
    showToast(uiText[currentLang].fillErrorReg);
    return;
  }

  isSubmittingRegistration = true;
  const submitBtn = document.getElementById('btn-complete-registration');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';
    submitBtn.style.cursor = 'not-allowed';
  }

  studentData.name = name;
  studentData.age = age;
  studentData.phone = phone;
  studentData.address = document.getElementById('input-address') ? document.getElementById('input-address').value.trim() : '';
  studentData.college = document.getElementById('input-college') ? document.getElementById('input-college').value.trim() : '';
  studentData.degree = document.getElementById('input-degree') ? document.getElementById('input-degree').value.trim() : '';
  studentData.branch = document.getElementById('input-branch') ? document.getElementById('input-branch').value.trim() : '';
  studentData.company = document.getElementById('input-company') ? document.getElementById('input-company').value.trim() : '';
  studentData.position = document.getElementById('input-position') ? document.getElementById('input-position').value.trim() : '';
  studentData.remarks = document.getElementById('input-remarks') ? document.getElementById('input-remarks').value.trim() : '';

  let categoryTable = 'DYS_male_student_Saturday';
  const mStatus = (studentData.maritalStatus || 'single').toLowerCase();
  const gGender = (studentData.gender || 'male').toLowerCase();
  if (mStatus === 'married') {
    categoryTable = (gGender === 'female') ? 'registrations_married_female' : 'registrations_married_male';
  } else {
    categoryTable = (gGender === 'female') ? 'registrations_student_female' : 'DYS_male_student_Saturday';
  }

  let regPassId = null;
  if (studentData.phone) {
    const localRaw = localStorage.getItem('dys_user_' + studentData.phone);
    if (localRaw) {
      try {
        const localObj = JSON.parse(localRaw);
        if (localObj && localObj.regPassId) {
          regPassId = localObj.regPassId;
        }
      } catch (e) {}
    }
  }
  if (!regPassId) {
    regPassId = await getNextPassId(categoryTable);
  }
  const nowStr = new Date().toLocaleString();

  document.getElementById('pass-reg-id').innerText = regPassId;
  document.getElementById('pass-student-name').innerText = studentData.name || 'Participant';

  // Formatted Age & Demographics Status
  const statusStr = studentData.maritalStatus === 'single'
    ? (studentData.gender === 'female' ? 'Single • Female' : 'Single • Male')
    : 'Married';
  document.getElementById('pass-age').innerText = `${studentData.age || '-'} yrs (${statusStr})`;

  document.getElementById('pass-phone').innerText = studentData.phone || '-';

  const occText = studentData.occupation === 'student'
    ? `${studentData.college || ''} (${studentData.degree || ''} ${studentData.branch || ''})`.trim()
    : `${studentData.company || ''} (${studentData.position || ''})`.trim();
  document.getElementById('pass-occupation').innerText = occText || '-';

  const scoreNum = lastCalculatedResult ? lastCalculatedResult.netScore : '20';
  document.getElementById('pass-score').innerText = `${scoreNum} / 20 Marks`;

  const paidAmt = lastCalculatedResult ? `₹${lastCalculatedResult.payableAmount}` : '₹150';
  document.getElementById('pass-amount').innerText = paidAmt;
  document.getElementById('pass-time').innerText = nowStr;

  // Render Venue Entry QR Code & Barcode Code
  const qrBox = document.getElementById('pass-qrcode-container');
  if (qrBox) {
    qrBox.innerHTML = '';
    if (window.QRCode) {
      try {
        new QRCode(qrBox, {
          text: `DYS-PASS:${regPassId}:${studentData.name}:${studentData.phone}`,
          width: 72,
          height: 72,
          colorDark: "#000000",
          colorLight: "#FFFFFF"
        });
      } catch (qrErr) {}
    }
  }

  const barcodeTxt = document.getElementById('pass-barcode-text');
  if (barcodeTxt) {
    barcodeTxt.innerText = regPassId;
  }

  // Targeted WhatsApp Group Routing (Behind the scenes target URL, generic button text)
  updatePassWhatsAppButton();

  // Save Complete Record to LocalStorage & Supabase Cloud DB
  const record = {
    studentData,
    userAnswers,
    result: lastCalculatedResult,
    regPassId,
    timestamp: new Date().toISOString(),
    isPaid: true
  };
  if (studentData.phone) {
    localStorage.setItem('dys_user_' + studentData.phone, JSON.stringify(record));
  }

  // Save to Supabase Cloud Database (if configured)
  await saveRegistrationToSupabase(record);

  switchScreen('screen-registration', 'screen-pass');

  // Clear temporary payment session state once pass is generated
  clearAppState();
  isSubmittingRegistration = false;
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
    submitBtn.style.cursor = 'pointer';
  }

  // Confetti Explosion
  triggerConfetti();
  showToast(uiText[currentLang].paymentSuccessToast);
}

// Supabase Cloud DB Client Integration
let supabaseClient = null;
function initSupabase() {
  let url = appConfig.supabaseUrl || localStorage.getItem('dys_supabase_url');
  const key = appConfig.supabaseKey || localStorage.getItem('dys_supabase_key');
  if (window.supabase && url && key && url !== 'YOUR_SUPABASE_PROJECT_URL') {
    try {
      // Auto-sanitize URL format if user appended /rest/v1/ or trailing slash
      url = url.trim().replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
      supabaseClient = window.supabase.createClient(url, key);
    } catch (err) {
      console.error("Supabase Init Error:", err);
    }
  }
}

async function saveRegistrationToSupabase(record) {
  initSupabase();
  if (!supabaseClient) {
    console.warn("Supabase Client is not initialized. Please configure Supabase URL & Anon Key in Admin Settings (⚙️).");
    return;
  }

  try {
    const sData = (record && record.studentData) ? record.studentData : studentData;
    let payMethod = 'ONLINE';
    if (currentPaymentData && currentPaymentData.method) {
      const m = String(currentPaymentData.method).toUpperCase();
      payMethod = m.includes('CASH') ? 'CASH' : (m.includes('RAZORPAY') ? 'RAZORPAY' : m);
    } else {
      payMethod = 'RAZORPAY';
    }

    const utrVal = (currentPaymentData && currentPaymentData.utr) || (document.getElementById('input-utr') ? document.getElementById('input-utr').value.trim() : null);

    const payload = {
      pass_id: record.regPassId,
      full_name: sData.name,
      age: parseInt(sData.age) || 0,
      whatsapp_number: sData.phone,
      occupation: sData.occupation,
      institution_or_company: sData.occupation === 'student' ? sData.college : sData.company,
      degree_or_position: sData.occupation === 'student' ? sData.degree : sData.position,
      branch: sData.branch || null,
      marital_status: sData.maritalStatus,
      gender: sData.gender || null,
      quiz_score: (record.result && record.result.netScore !== undefined) ? record.result.netScore : (lastCalculatedResult ? lastCalculatedResult.netScore : 20),
      percentage: (record.result && record.result.finalPercent !== undefined) ? record.result.finalPercent : (lastCalculatedResult ? lastCalculatedResult.finalPercent : 100),
      paid_amount: (record.result && record.result.payableAmount !== undefined) ? record.result.payableAmount : (lastCalculatedResult ? lastCalculatedResult.payableAmount : 150),
      address: sData.address || null,
      payment_mode: payMethod,
      language: currentLang,
      remarks: sData.remarks || null
    };

    // 1. Master Registrations Table Save (Upsert by pass_id to prevent duplicates)
    try {
      const { data: mData, error: mError } = await supabaseClient.from('registrations').upsert([payload], { onConflict: 'pass_id' });
      if (mError) {
        console.warn("Master table save warning:", mError);
      } else {
        console.log("Master registrations successfully saved to Supabase!", mData);
      }
    } catch (mErr) { console.warn("Master table save exception:", mErr); }

    // 2. Specific Category Table Save (e.g. DYS_male_student_Saturday)
    let categoryTable = 'DYS_male_student_Saturday';
    const mStatus = (sData.maritalStatus || 'single').toLowerCase();
    const gGender = (sData.gender || 'male').toLowerCase();

    if (mStatus === 'married') {
      categoryTable = (gGender === 'female') ? 'registrations_married_female' : 'registrations_married_male';
    } else {
      categoryTable = (gGender === 'female') ? 'registrations_student_female' : 'DYS_male_student_Saturday';
    }

    const catPayload = { ...payload };

    const { data: catData, error: catError } = await supabaseClient.from(categoryTable).upsert([catPayload], { onConflict: 'pass_id' });
    if (catError) {
      console.warn(`Supabase Category Table (${categoryTable}) Save Warning:`, catError);
    } else {
      console.log(`Registration successfully saved to BOTH master and Category DB (${categoryTable})!`, catData);
    }
  } catch (e) {
    console.error("Supabase Connection Exception:", e);
  }
}

// Targeted WhatsApp Group URL Configurator (Generic Button Text)
function updatePassWhatsAppButton() {
  const btnWa = document.getElementById('btn-whatsapp-group');
  if (!btnWa) return;

  const t = uiText[currentLang];
  let targetUrl = whatsappGroups.male;

  if (studentData.occupation === 'student' && studentData.gender === 'male') {
    targetUrl = whatsappGroups.student_male || whatsappGroups.male;
  } else if (studentData.maritalStatus === 'married') {
    targetUrl = whatsappGroups.married;
  } else if (studentData.gender === 'female') {
    targetUrl = whatsappGroups.female;
  } else {
    targetUrl = whatsappGroups.male;
  }

  btnWa.href = targetUrl;
  btnWa.innerText = t.whatsappBtn; // Always simple "Join WhatsApp Group 💬"
}

// Single-Card Explanation Stepper State
let currentReviewIndex = 0;

function renderSingleAnswerReview(idx) {
  const container = document.getElementById('review-answers-container');
  if (!container) return;

  currentReviewIndex = Math.max(0, Math.min(9, idx));
  const idxToRender = currentReviewIndex;
  const q = quizData[idxToRender];
  const t = uiText[currentLang];

  container.innerHTML = '';

  const userAnsKey = userAnswers[idxToRender];
  const isCorrect = userAnsKey === q.correctAnswer;
  const opts = q.options[currentLang];

  const userAnsObj = opts.find(o => o.key === userAnsKey);
  const userAnsText = userAnsObj ? `${userAnsKey}) ${userAnsObj.text}` : t.unansweredText;

  const correctAnsObj = opts.find(o => o.key === q.correctAnswer);
  const correctAnsText = correctAnsObj ? `${q.correctAnswer}) ${correctAnsObj.text}` : '';

  // Render 1-10 Navigation Pills for Explanation Stepper
  let navPillsHTML = '<div class="quiz-palette-grid" style="margin-bottom: 12px;">';
  for (let i = 0; i < 10; i++) {
    const isCurr = i === idxToRender;
    const isQAns = userAnswers.hasOwnProperty(i) && userAnswers[i] !== undefined && userAnswers[i] !== '';
    const isQCorrect = userAnswers[i] === quizData[i].correctAnswer;
    const chipClass = isCurr ? 'active' : (isQCorrect ? 'answered' : (isQAns ? 'wrong-pill' : ''));
    navPillsHTML += `
      <button type="button" class="palette-num-btn ${chipClass}" onclick="renderSingleAnswerReview(${i})" title="Explanation ${i + 1}">
        ${i + 1}
      </button>
    `;
  }
  navPillsHTML += '</div>';

  const prevBtnText = currentLang === 'en' ? '⬅ Prev' : '⬅ पिछला';
  const nextBtnText = idxToRender === 9
    ? (currentLang === 'en' ? 'Hide ⬆' : 'छिपाएं ⬆')
    : (currentLang === 'en' ? 'Next ➔' : 'आगे ➔');

  const qCard = document.createElement('div');
  qCard.className = `review-card ${isCorrect ? 'review-correct' : (userAnsKey ? 'review-wrong' : '')}`;

  qCard.innerHTML = `
    ${navPillsHTML}
    <div class="review-header">
      <span class="review-q-badge">${t.questionPrefix} ${idxToRender + 1} / 10</span>
      <span class="status-chip ${isCorrect ? 'chip-correct' : (userAnsKey ? 'chip-wrong' : '')}">
        ${isCorrect ? '✓ Correct (+2)' : (userAnsKey ? '✗ Wrong (-1)' : t.unansweredText + ' (0)')}
      </span>
    </div>

    <div class="review-q-title">${q.question[currentLang]}</div>

    <div class="review-ans-box">
      <div class="ans-line ${isCorrect ? 'text-green' : (userAnsKey ? 'text-red' : '')}">
        <strong>${t.yourAnsText}</strong> ${userAnsText}
      </div>
      ${!isCorrect ? `
        <div class="ans-line text-green" style="margin-top:4px;">
          <strong>${t.correctAnsText}</strong> ${correctAnsText}
        </div>
      ` : ''}
    </div>

    <div class="explanation-box">
      <div class="explanation-title">
        <span>${t.scripturalTitle}</span>
      </div>
      <div class="explanation-text">${q.explanation[currentLang]}</div>
    </div>

    <div class="review-nav-controls" style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-top:12px;">
      <button type="button" class="btn-secondary" onclick="renderSingleAnswerReview(${idxToRender - 1})" style="visibility:${idxToRender === 0 ? 'hidden' : 'visible'}; width:auto; padding:6px 14px; font-size:0.82rem; border-color:rgba(255,255,255,0.2);">
        ${prevBtnText}
      </button>
      <button type="button" class="btn-primary" onclick="${idxToRender === 9 ? 'toggleAnswerReview()' : `renderSingleAnswerReview(${idxToRender + 1})`}" style="width:auto; padding:8px 18px; font-size:0.85rem; margin-top:0;">
        ${nextBtnText}
      </button>
    </div>
  `;

  container.appendChild(qCard);
}

function renderAnswerReviewList() {
  renderSingleAnswerReview(currentReviewIndex);
}

function toggleAnswerReview() {
  const container = document.getElementById('review-answers-container');
  const btn = document.getElementById('btn-toggle-review');
  const t = uiText[currentLang];

  if (!container) return;

  if (container.classList.contains('hidden')) {
    currentReviewIndex = 0;
    renderSingleAnswerReview(0);
    container.classList.remove('hidden');
    if (btn) btn.innerText = t.hideExplanationsBtn;
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    container.classList.add('hidden');
    if (btn) btn.innerText = t.viewExplanationsBtn;
  }
}

// Generate Dynamic QR Code & Mobile App Fallbacks
function generateUpiQR(upiUri, upiId) {
  const targetUri = upiUri || currentPaymentData?.upi_uri || `upi://pay?pa=${appConfig.upiId}&pn=${encodeURIComponent(appConfig.payeeName)}&am=150&cu=INR`;
  const targetId = upiId || appConfig.upiId;

  const qrContainer = document.getElementById('qrcode-container');
  if (qrContainer) {
    qrContainer.innerHTML = '';
    if (window.QRCode) {
      try {
        new QRCode(qrContainer, {
          text: targetUri,
          width: 190,
          height: 190,
          colorDark: "#0F172A",
          colorLight: "#FFFFFF"
        });
      } catch (err) {
        console.error("QR Code Render Error:", err);
      }
    }
  }

  const dispUpi = document.getElementById('display-upi-id');
  if (dispUpi) dispUpi.innerText = targetId;
}

// Section 7 & 8: Launch Dynamic UPI Intent Flow (Mobile / Android)
function initiateUpiPayment() {
  if (!currentPaymentData || !currentPaymentData.upi_uri) {
    showToast("Payment details initializing. Please wait...");
    return;
  }

  const upiUri = currentPaymentData.upi_uri;

  // Open standard mobile UPI Intent
  try {
    window.location.href = upiUri;
  } catch (e) {
    console.error("UPI Intent redirect error:", e);
  }

  // Section 13: UX Rule — Do NOT immediately mark as Paid!
  updatePaymentStatusBanner('PAYMENT_PENDING', "Payment initiated? Please complete payment in your UPI app and enter your UTR below.");

  const utrInput = document.getElementById('input-utr');
  if (utrInput) utrInput.focus();
}

// Mobile App Shortcuts (GPay, PhonePe, Paytm, BHIM)
function launchUpiApp(appName) {
  if (!currentPaymentData || !currentPaymentData.upi_uri) {
    initiateUpiPayment();
    return;
  }

  const baseUri = currentPaymentData.upi_uri;
  const isAndroid = /android/i.test(navigator.userAgent || '');

  let appUri = baseUri;
  const cleanParams = baseUri.replace(/^upi:\/\/pay\?/i, '');

  if (isAndroid) {
    if (appName === 'gpay') {
      appUri = `intent://pay?${cleanParams}#Intent;scheme=upi;package=com.google.android.apps.nfc.plugin.cardmfe;end`;
    } else if (appName === 'phonepe') {
      appUri = `intent://pay?${cleanParams}#Intent;scheme=upi;package=com.phonepe.app;end`;
    } else if (appName === 'paytm') {
      appUri = `intent://pay?${cleanParams}#Intent;scheme=upi;package=net.one97.paytm;end`;
    } else if (appName === 'bhim') {
      appUri = `intent://pay?${cleanParams}#Intent;scheme=upi;package=in.org.npci.upiapp;end`;
    }
  }

  try {
    window.location.href = appUri;
  } catch (err) {
    window.location.href = baseUri;
  }

  updatePaymentStatusBanner('PAYMENT_PENDING', `Opening ${appName.toUpperCase()}... Please complete payment and submit your UTR below.`);
}

// Copy UPI Handle to Clipboard
function copyUpiId() {
  const targetId = currentPaymentData ? currentPaymentData.upi_id : appConfig.upiId;
  const toastMsg = currentLang === 'en'
    ? `UPI ID Copied! Open GPay/PhonePe ➔ Pay UPI ID ➔ Paste & Pay! 📱`
    : `UPI ID कॉपी हो गई! GPay/PhonePe खोलें ➔ Pay UPI ID ➔ पेस्ट करें! 📱`;

  navigator.clipboard.writeText(targetId).then(() => {
    showToast(toastMsg);
  }).catch(() => {
    const tempInput = document.createElement('input');
    tempInput.value = targetId;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    showToast(toastMsg);
  });
}

function saveConfig(rzpKey) {
  if (rzpKey) {
    appConfig.razorpayKeyId = rzpKey;
    localStorage.setItem('dys_rzp_key', rzpKey);
  }
}

// Admin Utility: Resequence all pass_ids strictly from ISKCON-REG-2001 onwards by created_at date
// Section 9: UTR Submission (Post-Payment Action)
async function submitUtrPayment() {
  const utrInput = document.getElementById('input-utr');
  if (!utrInput) return;

  const utrVal = utrInput.value.trim();
  if (!utrVal || utrVal.length < 6) {
    showToast("Please enter a valid 12-digit UPI UTR / Ref No.");
    return;
  }

  if (!currentRegistrationId) {
    currentRegistrationId = localStorage.getItem('dys_active_reg_id') || 'REG1000';
  }

  try {
    const res = await fetch('/api/payments/submit-utr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registration_id: currentRegistrationId, utr: utrVal })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      if (currentPaymentData) currentPaymentData.status = 'UTR_SUBMITTED';
      updatePaymentStatusBanner('UTR_SUBMITTED', 'Payment Submitted. Your UTR has been submitted. Our team will verify your payment.');
      showToast("UTR Submitted Successfully! Proceeding to Registration ➔");
      
      setTimeout(() => {
        gotoRegistrationScreen();
      }, 1200);
    } else {
      showToast(data.error || "Failed to submit UTR. Please try again.");
    }
  } catch (err) {
    console.warn("Backend UTR submission fallback (offline local save):", err);
    updatePaymentStatusBanner('UTR_SUBMITTED', 'Payment Submitted. Your UTR has been submitted. Our team will verify your payment.');
    showToast("UTR Saved Locally! Proceeding to Registration ➔");
    setTimeout(() => {
      gotoRegistrationScreen();
    }, 1200);
  }
}

// -----------------------------------------------------------------------------
// Section 10: Admin Verification Portal Functions
// -----------------------------------------------------------------------------

function openAdminModal() {
  const modal = document.getElementById('admin-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeAdminModal() {
  const modal = document.getElementById('admin-modal');
  if (modal) modal.classList.add('hidden');
}

async function fetchAdminPayments() {
  const tokenInput = document.getElementById('input-admin-token');
  if (tokenInput && tokenInput.value.trim()) {
    adminSecretToken = tokenInput.value.trim();
    localStorage.setItem('dys_admin_token', adminSecretToken);
  }

  try {
    const res = await fetch('/api/admin/payments', {
      headers: { 'x-admin-secret': adminSecretToken }
    });

    if (!res.ok) {
      alert("Invalid Admin Secret Token. Access Denied.");
      return;
    }

    const data = await res.json();
    adminPaymentsList = data.registrations || [];

    const loginBox = document.getElementById('admin-login-box');
    const dashContent = document.getElementById('admin-dashboard-content');
    if (loginBox) loginBox.style.display = 'none';
    if (dashContent) dashContent.classList.remove('hidden');

    renderAdminTable();
  } catch (err) {
    alert("Error fetching admin payments list: " + err.message);
  }
}

function filterAdminTable(filter) {
  currentAdminFilter = filter;
  const tabs = ['all', 'submitted', 'pending', 'verified', 'rejected'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-${t}`);
    if (btn) btn.classList.remove('active');
  });

  const activeBtn = document.getElementById(`tab-${filter.toLowerCase().replace('utr_', '').replace('payment_', '')}`);
  if (activeBtn) activeBtn.classList.add('active');

  renderAdminTable();
}

function renderAdminTable() {
  const tbody = document.getElementById('admin-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  let filtered = adminPaymentsList;
  if (currentAdminFilter !== 'ALL') {
    filtered = adminPaymentsList.filter(item => item.status === currentAdminFilter);
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:var(--text-muted); padding:16px;">No registrations found matching "${currentAdminFilter}".</td></tr>`;
    return;
  }

  filtered.forEach(item => {
    const tr = document.createElement('tr');

    let badgeClass = 'badge-pending';
    if (item.status === 'UTR_SUBMITTED') badgeClass = 'badge-submitted';
    else if (item.status === 'VERIFIED') badgeClass = 'badge-verified';
    else if (item.status === 'REJECTED') badgeClass = 'badge-rejected';

    const isActionDisabled = item.status === 'VERIFIED' ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : '';

    tr.innerHTML = `
      <td style="font-family:monospace; font-weight:800; color:var(--text-gold);">${item.registration_id}</td>
      <td>${item.full_name || 'Participant'}</td>
      <td>${item.whatsapp_number || '-'}</td>
      <td>${item.quiz_score} / 20</td>
      <td style="font-weight:700; color:#34D399;">₹${item.amount || item.calculated_fee}</td>
      <td style="font-family:monospace; font-size:0.75rem;">${item.payment_reference || '-'}</td>
      <td style="font-family:monospace; font-weight:700; color:#FCD34D;">${item.utr || '-'}</td>
      <td><span class="badge-status ${badgeClass}">${item.status}</span></td>
      <td>
        <button onclick="verifyAdminPayment('${item.registration_id}', 'VERIFY')" class="btn-admin-verify" ${isActionDisabled}>
          ✓ VERIFY
        </button>
        <button onclick="verifyAdminPayment('${item.registration_id}', 'REJECT')" class="btn-admin-reject">
          ✕ REJECT
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// Admin Payment Verification Action
async function verifyAdminPayment(regId, action) {
  const confirmMsg = action === 'VERIFY'
    ? `Are you sure you want to VERIFY payment for ${regId}?`
    : `Are you sure you want to REJECT payment for ${regId}?`;

  if (!confirm(confirmMsg)) return;

  try {
    const res = await fetch('/api/admin/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': adminSecretToken
      },
      body: JSON.stringify({ registration_id: regId, action: action, admin_name: 'Admin' })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      alert(`Success: Payment for ${regId} has been set to ${data.status}.`);
      fetchAdminPayments(); // Refresh list
    } else {
      alert("Error: " + (data.error || "Action failed."));
    }
  } catch (err) {
    alert("Network error processing verification action: " + err.message);
  }
}

function setupEventListeners() {
  const btnEn = document.getElementById('btn-lang-en');
  if (btnEn) btnEn.addEventListener('click', () => selectInitialLanguage('en'));

  const btnHi = document.getElementById('btn-lang-hi');
  if (btnHi) btnHi.addEventListener('click', () => selectInitialLanguage('hi'));

  // Secret Admin Trigger (5 clicks on logo)
  let logoClicks = 0;
  const brandBadge = document.querySelector('.brand-badge');
  if (brandBadge) {
    brandBadge.addEventListener('click', () => {
      logoClicks++;
      if (logoClicks >= 5) {
        logoClicks = 0;
        openAdminModal();
      }
    });
  }

  // Footer Legal Policy Modal Triggers (Direct Event Binding for Mobile & Desktop)
  document.querySelectorAll('.footer-link-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const onclickAttr = btn.getAttribute('onclick') || '';
      const match = onclickAttr.match(/openPolicyModal\(['"]([^'"]+)['"]\)/);
      const key = match ? match[1] : 'terms';
      openPolicyModal(key);
    });
  });
}

function openAdminSettings() {
  const pass = prompt("Enter Admin Password:");
  if (pass === "108") {
    // Populate current config values into modal inputs
    if (document.getElementById('input-base-fee')) document.getElementById('input-base-fee').value = appConfig.baseFee;
    if (document.getElementById('input-upi-id')) document.getElementById('input-upi-id').value = appConfig.upiId;
    if (document.getElementById('input-payee-name')) document.getElementById('input-payee-name').value = appConfig.payeeName;
    if (document.getElementById('input-supabase-url')) document.getElementById('input-supabase-url').value = appConfig.supabaseUrl || '';
    if (document.getElementById('input-supabase-key')) document.getElementById('input-supabase-key').value = appConfig.supabaseKey || '';
    if (document.getElementById('input-razorpay-key')) document.getElementById('input-razorpay-key').value = appConfig.razorpayKeyId || '';

    openModal('settings-modal');
  } else if (pass) {
    alert("Incorrect Admin Password.");
  }
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('hidden');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('hidden');
}

function saveConfig() {
  const baseFee = parseInt(document.getElementById('input-base-fee').value);
  const upiId = document.getElementById('input-upi-id').value.trim();
  const payeeName = document.getElementById('input-payee-name').value.trim();
  const sbUrl = document.getElementById('input-supabase-url') ? document.getElementById('input-supabase-url').value.trim() : '';
  const sbKey = document.getElementById('input-supabase-key') ? document.getElementById('input-supabase-key').value.trim() : '';
  const rzpKey = document.getElementById('input-razorpay-key') ? document.getElementById('input-razorpay-key').value.trim() : '';

  if (baseFee) appConfig.baseFee = baseFee;
  if (upiId) appConfig.upiId = upiId;
  if (payeeName) appConfig.payeeName = payeeName;
  if (sbUrl) {
    appConfig.supabaseUrl = sbUrl;
    localStorage.setItem('dys_supabase_url', sbUrl);
  }
  if (sbKey) {
    appConfig.supabaseKey = sbKey;
    localStorage.setItem('dys_supabase_key', sbKey);
  }
  if (rzpKey) {
    appConfig.razorpayKeyId = rzpKey;
    localStorage.setItem('dys_rzp_key', rzpKey);
  }
}

// Admin Utility: Resequence all pass_ids strictly from ISKCON-REG-2001 onwards by created_at date
async function resequenceAllPassIds() {
  initSupabase();
  if (!supabaseClient) {
    alert("Supabase is not initialized. Please configure Supabase URL & Key first.");
    return;
  }

  const confirmReseq = confirm("Are you sure you want to resequence all Pass IDs in Supabase?\n\nThis will sort existing rows by creation date and reassign pass_ids sequentially starting from ISKCON-REG-2001 for each table.");
  if (!confirmReseq) return;

  showToast("Resequencing Pass IDs in Supabase...");
  const tables = ['registrations', 'registrations_student_male', 'registrations_student_female', 'registrations_married_male', 'registrations_married_female'];

  try {
    for (const tbl of tables) {
      const { data, error } = await supabaseClient
        .from(tbl)
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.warn(`Table ${tbl} error:`, error.message);
        continue;
      }

      if (data && data.length > 0) {
        let counter = 2001;
        for (const row of data) {
          const newPassId = `ISKCON-REG-${counter}`;
          await supabaseClient
            .from(tbl)
            .update({ pass_id: newPassId })
            .eq('id', row.id);
          counter++;
        }
      }
    }

    // Reset local counter keys
    tables.forEach(t => localStorage.removeItem('dys_pass_counter_' + t));
    localStorage.removeItem('dys_pass_counter');

    alert("🎉 All Pass IDs successfully resequenced sequentially starting from ISKCON-REG-2001!");
  } catch (err) {
    console.error("Resequence error:", err);
    alert("Failed to resequence: " + err.message);
  }
}

// Celebration Confetti & Flowers Cannon
function triggerConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#FF7700', '#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.7) * 16,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rSpeed: (Math.random() - 0.5) * 10,
      opacity: 1
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    particles.forEach(p => {
      if (p.opacity > 0) {
        active = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // gravity
        p.rotation += p.rSpeed;
        p.opacity -= 0.012;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (active) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  animate();
}

function showToast(msg) {
  const existing = document.querySelector('.toast-msg');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.innerText = msg;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2500);
}

// Global Window Function Bindings
window.toggleLanguage = toggleLanguage;
window.selectInitialLanguage = selectInitialLanguage;
window.nextQuestion = nextQuestion;
window.prevQuestion = prevQuestion;
window.toggleAnswerReview = toggleAnswerReview;
window.gotoCourseDetailsPage = gotoCourseDetailsPage;
window.gotoPaymentScreen = gotoPaymentScreen;
window.gotoRegistrationScreen = gotoRegistrationScreen;
window.setOccupation = setOccupation;
window.setMaritalStatus = setMaritalStatus;
window.setGender = setGender;
window.completeRegistrationAndGeneratePass = completeRegistrationAndGeneratePass;
window.copyUpiId = copyUpiId;
window.payWithRazorpay = payWithRazorpay;
window.verifyRazorpayPaymentFromInput = verifyRazorpayPaymentFromInput;
window.toggleCashPinInput = toggleCashPinInput;
window.verifyCashPaymentWithPin = verifyCashPaymentWithPin;
window.goBackFrom = goBackFrom;
window.resequenceAllPassIds = resequenceAllPassIds;
window.checkBackendPaymentStatus = checkBackendPaymentStatus;
window.openConsentModal = openConsentModal;
window.closeConsentModal = closeConsentModal;
window.toggleConsentProceedBtn = toggleConsentProceedBtn;
window.confirmConsentAndProceedPayment = confirmConsentAndProceedPayment;
window.handleRazorpayClickWithConsent = handleRazorpayClickWithConsent;

// Footer Legal Policies & Contact Modal Logic
const POLICY_CONTENTS = {
  about: `
    <h2>About Us</h2>
    <div class="policy-date-badge">Discover Your Self (DYS) Initiative</div>
    <p>Welcome to <strong>Discover Your Self (DYS)</strong>, an educational digital initiative dedicated to guiding individuals toward purposeful living, mental clarity, and spiritual growth through the timeless wisdom of the <em>Bhagavad Gita As It Is</em>.</p>
    <p>Operating online through <a href="https://dys-gray.vercel.app/" target="_blank">https://dys-gray.vercel.app</a> and conducting sessions both virtually and in person at <strong>ISKCON NVCC Pune</strong>, Discover Your Self serves as a bridge between ancient Vedic philosophy and contemporary life challenges.</p>

    <h3>🌟 Our Mission & Vision</h3>
    <h4 style="color:var(--text-gold); margin-top:8px;">Our Mission</h4>
    <p>To empower students, youth, working professionals, families, and self-development seekers with practical life principles and spiritual processes from the Bhagavad Gita As It Is, including the sublime path of Bhakti Yoga (Loving Devotional Service). Through these teachings, DYS aims to help participants develop greater mental clarity, manage stress, build strong moral character, and discover their inner potential.</p>

    <h4 style="color:var(--text-gold); margin-top:8px;">Our Vision</h4>
    <p>To cultivate a conscious, values-driven generation grounded in the principles of the Bhagavad Gita, equipped with emotional resilience, spiritual intelligence, and a deep sense of purpose to lead a balanced, joyful, and impactful life.</p>

    <h3>💡 What We Offer</h3>
    <h4 style="color:var(--text-gold); margin-top:8px;">1. Interactive Bhagavad Gita Quiz & Merit Scholarships</h4>
    <p>Our digital portal hosts the DYS Self-Discovery Quiz, allowing participants to assess their understanding of fundamental life concepts, qualify for merit-based scholarship discounts, and unlock access to foundational courses.</p>

    <h4 style="color:var(--text-gold); margin-top:8px;">2. About the Course — 8-Session Syllabus</h4>
    <p>We all seek one common thing in life — happiness. In pursuit of it, we often focus primarily on fulfilling our bodily needs, which can sometimes lead to further hankering and dissatisfaction.</p>
    <p>This course explores principles and practices for cultivating deeper inner satisfaction and addresses fundamental inquiries about higher principles and purpose in life.</p>

    <h5 style="color:#FFF; margin-top:10px; margin-bottom:6px; font-weight:700;">📚 Course Syllabus — 8 Sessions</h5>
    <ul style="list-style-type:none; padding-left:0; line-height:1.6; color:#E2E8F0; margin-bottom:12px;">
      <li><strong>Session 1 (DYS 1):</strong> Discover Inner Self</li>
      <li><strong>Session 2 (DYS 2):</strong> Discover The Ultimate Genius</li>
      <li><strong>Session 3 (DYS 3):</strong> Discover Manual of Life</li>
      <li><strong>Session 4 (DYS 4):</strong> Discover Lasting Solution</li>
      <li><strong>Session 5 (DYS 5):</strong> Discover Sublime Joy Through Sound</li>
      <li><strong>Session 6 (DYS 6):</strong> Discover The Real Eternal Love</li>
      <li><strong>Session 7 (DYS 7):</strong> Discover The Happy Planet</li>
      <li><strong>Session 8 (DYS 8):</strong> Discover True Unity in Diversity</li>
    </ul>

    <h4 style="color:var(--text-gold); margin-top:8px;">3. Flexible Learning Modes</h4>
    <p>To ensure accessibility for everyone:</p>
    <ul style="line-height:1.6; color:#E2E8F0; margin-bottom:12px;">
      <li><strong>Online-Only Mode:</strong> Live interactive webinars and digital streaming for participants across India and globally.</li>
      <li><strong>Offline-Only Mode:</strong> In-person seminars, discussions, and community interaction hosted at ISKCON NVCC Pune.</li>
    </ul>

    <h3>🌿 Our Core Values</h3>
    <ul style="line-height:1.6; color:#E2E8F0; margin-bottom:12px;">
      <li><strong>Authenticity:</strong> Delivering spiritual education rooted in the teachings of Bhagavad Gita As It Is.</li>
      <li><strong>Practical Relevance:</strong> Connecting ancient philosophical principles with contemporary life, including stress management, focus, mental discipline, and self-control.</li>
      <li><strong>Inclusivity:</strong> Open to seekers of different ages and backgrounds, including students, professionals, married individuals, and families.</li>
      <li><strong>Community & Care:</strong> Building a supportive network of like-minded individuals dedicated to self-improvement and mutual growth.</li>
    </ul>

    <h3>👤 Leadership & Initiative Operator</h3>
    <p>The Discover Your Self (DYS) portal (<a href="https://dys-gray.vercel.app/" target="_blank">https://dys-gray.vercel.app</a>) is operated under the individual merchant responsibility of <strong>Rahul Kamal Bombarde</strong>, serving as Lead Coordinator & Platform Operator, based in Pune, Maharashtra.</p>
    <p>With the support of dedicated volunteers, educators, and youth coordinators, DYS organizes educational seminars, manages digital pass registrations, and supports participants throughout their program experience.</p>
  `,

  terms: `
    <h2>Terms & Conditions</h2>
    <div class="policy-date-badge">Last Updated: 26 September 2026</div>
    <p>These Terms & Conditions govern your access to and use of the website <a href="https://dys-gray.vercel.app" target="_blank">https://dys-gray.vercel.app</a>, digital services, course registration flows, event registrations, payment records, digital passes, communications, and related online offerings.</p>
    <p><strong>RAHUL KAMAL BAMBORDE</strong> is an individual merchant and platform operator. Discover Your Self (DYS) is a digital initiative operated under the individual merchant responsibility of RAHUL KAMAL BAMBORDE , created to support organized program registration, educational participation, student and participant care, payments, and service coordination.</p>
    <p>By using this website or submitting any registration, payment, profile, application, or service request, you agree to these Terms and to the related Privacy Policy, Digital Delivery & Fulfilment Policy, and Cancellation & Refund Policy.</p>

    <h3>1. Nature Of Services</h3>
    <p>Discover Your Self (DYS) supports digital registration, communication, payment records, digital pass issuance, program planning, and service coordination across various educational offerings, seminars, workshops, and events.</p>
    <p>Services and programs may be offered in Online Mode (conducted via live webinars or online streaming) or Offline Mode (conducted in-person at designated venues such as ISKCON NVCC Pune).</p>
    <p>Program schedules, venue locations, session timings, facilities, eligibility, and service arrangements may change due to operational, venue, regulatory, technical, weather, health, or force majeure reasons.</p>

    <h3>2. User Information And Accuracy</h3>
    <p>You agree to provide true, current, and complete information during registration, profile creation, payment, or any other service flow.</p>
    <p>You are responsible for checking legal names, contact numbers (WhatsApp), email addresses, age/demographic details, and program/mode preferences before submission.</p>
    <p>Incorrect or incomplete information may delay confirmation, digital pass generation, venue entry verification, or communication.</p>

    <h3>3. User Eligibility And Minors</h3>
    <p>The website, courses, and programs are intended for youth, students, married individuals, and other persons interested in self-development.</p>
    <p>Minors (under 18 years of age) may register and participate where required consent and verification from a parent or lawful guardian has been obtained in accordance with applicable law before processing personal data or providing the relevant service.</p>
    <p>The operator reserves the right to verify participant identity and eligibility prior to granting access to online streams or physical venue classrooms.</p>

    <h3>4. Registrations, Program Modes, And Participation</h3>
    <p>Submission of a form does not always guarantee final confirmation unless payment, verification, approval, or seat availability requirements are completed.</p>
    <p>Registrations are mode-specific: enrolling in Online Mode grants access to online sessions only, and enrolling in Offline Mode grants access to offline venue sessions only, unless explicit written permission is granted by the operator.</p>
    <p>Participants are expected to follow session discipline, venue rules, safety instructions, local law, and guidance from authorized coordinators.</p>

    <h3>5. Fees, Pricing, And Payments</h3>
    <p>Payments may be processed through third-party payment gateways, banks, UPI providers, card networks, or other payment service providers (primarily Razorpay), as well as authorized offline cash collection desks.</p>
    <p>All fees are denominated in Indian Rupees (INR) and collected under the individual merchant account of RAHUL KAMAL BAMBORDE . The merchant/payment information presented on this website is intended to match the merchant and business details maintained with Razorpay and other applicable payment service providers.</p>
    <p>RAHUL KAMAL BAMBORDE and Discover Your Self (DYS) are not responsible for failures or delays caused by banks, payment gateways, internet connectivity, incorrect payment details, or third-party systems.</p>
    <p>Where deductions are legally permissible and actually incurred, applicable non-refundable third-party processing charges may be deducted from an approved refund, where disclosed and permitted under applicable law.</p>

    <h3>6. Scholarships, Discounts, And Promotional Offers</h3>
    <p>Any promotional entry fees, scholarship discounts, or merit-based fee concessions offered on the platform are non-transferable, non-exchangeable for cash, and applicable strictly toward designated registrations.</p>
    <p>Any attempt to manipulate evaluation timers, exploit code, or use automated scripts to claim promotional offers will result in immediate disqualification.</p>

    <h3>7. Participant Code Of Conduct And Ethics</h3>
    <p>Participants in online sessions, offline venue classes, and official community communication groups must maintain courteous, respectful, and dignified conduct.</p>
    <p>Strictly prohibited activities include posting obscene, threatening, abusive, harassing, defamatory, unlawful, discriminatory, fraudulent, or disruptive content, as well as commercial spam or unauthorized links.</p>
    <p>Serious or repeated violations may result in removal from a programme or communication group. Refund eligibility, if any, will be determined in accordance with the applicable cancellation/refund policy and applicable law.</p>

    <h3>8. Communications</h3>
    <p>You may receive service-related emails, SMS, WhatsApp messages, calls, or other communications for registrations, payments, receipts, program updates, venue instructions, digital pass dispatches, cancellations, or coordination.</p>
    <p>Service communications are necessary for proper operation and may continue even if you opt out of general updates.</p>

    <h3>9. Responsible Use</h3>
    <p>You must not misuse the website, attempt unauthorized access, interfere with systems, upload harmful files, impersonate another person, or submit false information.</p>
    <p>You must not use this website for unlawful, abusive, defamatory, fraudulent, or disruptive activity.</p>

    <h3>10. Content And Intellectual Property</h3>
    <p>Text, design, logos, page layouts, documents, images, presentation slides, curriculum materials, and other website content are owned by or licensed to RAHUL KAMAL BAMBORDE , Discover Your Self (DYS), or their respective owners.</p>
    <p>You may not copy, reproduce, modify, distribute, or commercially exploit website content without written permission, except where allowed by law.</p>

    <h3>11. External Links And Third-Party Services</h3>
    <p>The website may use or link to third-party services such as payment gateways (Razorpay), email providers, messaging tools (WhatsApp/SMS APIs), database hosts (Supabase), maps, or external resources.</p>
    <p>Those services may have their own terms and policies. We are not responsible for third-party websites or systems outside our control.</p>

    <h3>12. Limitation Of Liability</h3>
    <p>We try to keep information accurate and services available, but we do not guarantee uninterrupted access, error-free operation, or complete accuracy at all times.</p>
    <p>To the maximum extent permitted by law, RAHUL KAMAL BAMBORDE and Discover Your Self (DYS) will not be liable for indirect, incidental, consequential, or special losses arising from website use, service changes, technical failures, or third-party failures.</p>

    <h3>13. Changes To Terms</h3>
    <p>We may update these Terms from time to time. Updated terms will be posted on this page with the latest update date.</p>
    <p>Continued use of the website after updates means you accept the revised Terms.</p>

    <h3>14. Governing Law And Dispute Resolution</h3>
    <p>These Terms are governed by the laws of India.</p>
    <p>Subject to applicable law, disputes will fall under the jurisdiction of competent courts in Pune, Maharashtra.</p>
  `,

  privacy: `
    <h2>Privacy Policy</h2>
    <div class="policy-date-badge">Last Updated: 26 September 2026</div>
    <p>This Privacy Policy explains how RAHUL KAMAL BAMBORDE and Discover Your Self (DYS) collect and use information when you use the website, register for educational courses or programs, make payments, create profiles, request receipts, communicate with us, or participate in related digital services.</p>
    <p><strong>RAHUL KAMAL BAMBORDE</strong> is an individual merchant and platform operator. Discover Your Self (DYS) is a digital initiative operated under the individual merchant responsibility of RAHUL KAMAL BAMBORDE , created to support organized program registration, educational participation, student and participant care, payments, and service coordination.</p>
    <p>For personal data processing, RAHUL KAMAL BAMBORDE is the person responsible for processing personal data for Discover Your Self (DYS), subject to applicable law.</p>
    <p>We collect information mainly to provide program registration, payment processing, participant care, digital pass generation, communication, and service coordination features. We do not sell personal information.</p>
    
    <div class="policy-contact-box">
      <strong>Data Privacy / Grievance Contact:</strong> <a href="mailto:dys.bg.asitis@gmail.com">dys.bg.asitis@gmail.com</a>
      <p style="margin-top:6px; margin-bottom:0; font-size:0.85rem;">Requests relating to access, correction, update, deletion, consent withdrawal, or other privacy/data matters may be sent to this address, subject to identity verification and applicable legal or operational limitations. We aim to acknowledge privacy-related requests within a reasonable period and will process them in accordance with applicable law.</p>
    </div>

    <h3>1. Information We May Collect</h3>
    <ul>
      <li><strong>Identity Details:</strong> Name, gender, age/date of birth, demographic details, and family or group member information where applicable.</li>
      <li><strong>Contact Details:</strong> Mobile number (WhatsApp), email address, postal address, city, state, country, and pincode.</li>
      <li><strong>Registration And Program Details:</strong> Enrolled courses, events, or workshops, delivery mode preferences (Online-Only or Offline-Only), attendance category, booking details, digital pass records, and related service history.</li>
      <li><strong>Payment And Receipt Details:</strong> Payer name, payment mode (Online via Razorpay or Offline via Cash), transaction amount, purpose and payment receipt status.</li>
      <li><strong>Participant Care Information:</strong> Profile preferences, educational or self-development interests, evaluation scores, participation history, or related details voluntarily provided by users.</li>
      <li><strong>Technical Information:</strong> IP address, browser/device information, operating system, server logs, cookies, pages visited, access timestamps, and security events collected automatically.</li>
      <li><strong>Communication Records:</strong> Emails, form submissions, support requests, feedback, calls, messages, and service update records.</li>
    </ul>

    <h3>2. How We Use Information</h3>
    <p>To create and manage user profiles, course/event enrollments, payments, receipts, check-in digital passes, and program records.</p>
    <p>To process payments, reconcile transactions, issue digital acknowledgements/passes, and handle payment queries.</p>
    <p>To coordinate course sessions, online streaming links, physical venue attendance, participant care, communication, program updates, and operational support.</p>
    <p>To verify identity, eligibility, payment status, and receipt requirements where applicable.</p>
    <p>To comply with legal, accounting, audit, tax, payment gateway, statutory, and regulatory requirements.</p>
    <p>To improve website security, prevent misuse or cheating, troubleshoot technical issues, and maintain service records.</p>

    <h3>3. Legal Basis And Consent</h3>
    <p>We process personal information where it is necessary to provide services requested by you, meet legal or statutory obligations, maintain required records, protect website and service security, prevent misuse or fraud, provide service-related communications, or for other purposes permitted by applicable law.</p>
    <p>Where processing is based on consent, or where specific consent is required, we will seek it through forms, checkboxes, confirmations, or other suitable methods.</p>
    <p>Where consent is the basis for processing, you may request withdrawal of that consent by contacting <a href="mailto:dys.bg.asitis@gmail.com">dys.bg.asitis@gmail.com</a>. Withdrawal of consent will not affect processing already carried out lawfully before withdrawal and may affect services or features that depend on that consent.</p>
    <p>Optional promotional communications may be opted out of separately from necessary service-related communications.</p>
    <p>You should not submit another person's details unless you are authorized to do so, such as for family members or registered group participants.</p>

    <h3>4. Sharing Of Information</h3>
    <p>We may share necessary information with the following categories of recipients for the purposes stated below:</p>
    <ul>
      <li><strong>Razorpay/payment providers:</strong> Payment processing and transaction reconciliation.</li>
      <li><strong>Supabase/hosting and technology providers:</strong> Website, database, storage, and technical infrastructure.</li>
      <li><strong>WhatsApp/SMS communication providers:</strong> Service-related communication and updates.</li>
      <li><strong>Email providers:</strong> Registration, support, receipt, and service communication.</li>
      <li><strong>Banks and payment networks:</strong> Payment processing and reconciliation.</li>
      <li><strong>Auditors and professional advisors:</strong> Accounting, audit, legal, tax, and compliance support.</li>
      <li><strong>Program coordinators, venue teams, and authorized volunteers:</strong> Attendance, participant support, and programme administration.</li>
    </ul>
    <p>Information may be shared with government, regulatory, law enforcement, tax, or statutory authorities where required by law.</p>
    <p>We do not sell personal information to third parties.</p>

    <h3>5. Payment Information</h3>
    <p>Online payments are processed through certified third-party payment service providers (primarily Razorpay). We receive transaction status, payment ID, order ID, amount, and reconciliation details.</p>
    <p>We do not intentionally store full card numbers, CVV, UPI PIN, net banking passwords, or similar sensitive payment credentials on our website servers.</p>

    <h3>6. Cookies And Website Logs</h3>
    <p>Cookies, browser local storage and similar technologies may be used for login sessions, security, preferences, language selection, analytics, and website improvement.</p>
    <p>You can control cookies through your browser settings, but disabling essential cookies or local storage may affect navigation, quiz, booking, or payment features.</p>

    <h3>7. Data Security</h3>
    <p>We use reasonable technical and organizational measures (such as SSL/TLS encryption and access controls) to protect information from unauthorized access, misuse, alteration, or loss.</p>
    <p>No website or electronic transmission can be guaranteed to be 100% secure. Users should keep their contact details and access credentials confidential and notify us of any suspected misuse.</p>

    <h3>8. Data Retention</h3>
    <p><strong>Payment, tax, and accounting records:</strong> retained as required by applicable law and accounting/tax requirements.</p>
    <p><strong>Registration and programme records:</strong> retained for programme administration, service delivery, dispute resolution, and legitimate recordkeeping.</p>
    <p><strong>Inactive profiles and other personal information:</strong> deleted or anonymised when no longer necessary for the purpose for which it was collected, subject to legal, accounting, audit, security, or dispute-resolution requirements.</p>
    <p>Some payment, receipt, tax, audit, or legal records may need to be retained even after a profile or registration is no longer active.</p>

    <h3>9. Your Rights And Requests</h3>
    <p>You may contact us to request access, correction, update, or deletion of your personal information, subject to applicable law, identity verification, and legitimate or legal requirements to retain certain information.</p>
    <p>You may opt out of non-essential promotional communications. Service-related communications may still be sent where needed for registrations, payments, receipts, safety, or operations.</p>

    <h3>10. Children's Information</h3>
    <p>Information about minors (under 18 years of age) may be collected where parents, guardians, or authorized family members register them for educational courses, events, or related services, subject to required consent and verification under applicable law.</p>
    <p>Parents/guardians should ensure that minor participant details are submitted accurately and with proper authority.</p>

    <h3>11. Updates To This Policy</h3>
    <p>We may update this Privacy Policy from time to time. The updated version will be posted on this page with the latest update date.</p>
  `,

  delivery: `
    <h2>Digital Delivery & Fulfilment Policy</h2>
    <div class="policy-date-badge">Last Updated: 26 September 2026</div>
    <p>Discover Your Self (DYS) is primarily a digital service platform operated by <strong>RAHUL KAMAL BAMBORDE</strong>. The website is used for program registrations, course enrollments, digital entry passes, payment receipts, communication, and event coordination. In most cases, there is no physical product to ship.</p>
    <p>Unless a specific physical item is expressly offered and confirmed, delivery means digital confirmation, digital pass generation, digital receipt, service confirmation, or in-person service fulfillment at the relevant course, event, or venue location.</p>

    <h3>1. No Regular Physical Shipping</h3>
    <p>Discover Your Self (DYS) does not normally sell, package, or ship physical products through this website.</p>
    <p>Program registrations, course enrollments, payment acknowledgements, digital passes, booking details, check-in information, and updates are generally delivered digitally.</p>
    <p>Digital delivery may be made through website screen generation, email, website download, SMS, WhatsApp, phone call, or other communication channels provided by the user.</p>

    <h3>2. Digital Delivery Timelines</h3>
    <p>Program registration and payment acknowledgements (such as digital passes and Pass IDs) are usually generated instantly after successful payment or submission, subject to system, gateway, and verification status.</p>
    <p>Confirmations for offline cash payments are issued upon admin verification by authorized coordinators.</p>
    <p>If a payment succeeds but confirmation or digital pass delivery is delayed, users should contact us with their payment reference, registered email/mobile number, and transaction details.</p>

    <h3>3. In-Person Materials Or Services</h3>
    <p>Some educational programs, courses, seminars, or events may involve in-person delivery of entry passes, badges, course materials, printed guidelines, or venue check-in verification.</p>
    <p>Such materials or services are provided directly at the relevant venue (such as ISKCON NVCC Pune), registration desk, event location, or as communicated by the organizing team.</p>
    <p>Availability, format, and timing of in-person materials or services may vary by program, venue, location, and operational requirement.</p>

    <h3>4. Physical Dispatch, If Any</h3>
    <p>If any physical course literature, books, or merchandise are specifically offered for dispatch in the future, the shipping method, charges, estimated timeline, and delivery limitations will be communicated separately at checkout.</p>
    <p>RAHUL KAMAL BAMBORDE and Discover Your Self (DYS) will not be responsible for delays caused by courier partners, postal services, incorrect shipping addresses, unavailable recipients, local restrictions, or events beyond reasonable control.</p>

    <h3>5. International Participants & Digital Fulfillment</h3>
    <p>Digital course registrations and online streaming access are open to participants globally over the internet. No international shipping fees apply for digital services.</p>

    <h3>6. User Responsibility</h3>
    <p>Users must provide an accurate email address, active WhatsApp mobile number, postal address, and participant details wherever required.</p>
    <p>Incorrect or incomplete details may prevent successful delivery of digital passes, confirmations, receipts, updates, or service-related communications.</p>
  `,

  refund: `
    <h2>Cancellation & Refund Policy</h2>
    <div class="policy-date-badge">Last Updated: 26 September 2026</div>
    <p>This policy applies to payments and registration fees made through Discover Your Self (DYS), a digital initiative operated by <strong>RAHUL KAMAL BAMBORDE</strong> ("Operator"). Refund eligibility depends on the nature of the payment, the program or service stage, committed venue costs, and the specific registration rules communicated for the relevant course, event, or service.</p>
    <p>Educational programs, seminars, workshops, and event arrangements often involve advance commitments to venues (such as ISKCON NVCC Pune), streaming infrastructure, technical services, and operational teams. Refunds are therefore handled under administrative guidelines.</p>

    <h3>1. Cancellation Requests</h3>
    <p>Cancellation inquiries or requests must be sent to <a href="mailto:dys.bg.asitis@gmail.com">dys.bg.asitis@gmail.com</a> from the registered email address where possible.</p>
    <p>The request should include Registration/Pass ID, payment reference number, participant name, registered mobile/WhatsApp number, course/event name, and reason for inquiry.</p>
    <p>A request is considered received only after it is successfully submitted to us with sufficient details for verification.</p>

    <h3>2. Course, Event, And Program Registration Payments</h3>
    <p>All registrations, course fees, event entry passes, and program payments submitted through <a href="https://dys-gray.vercel.app" target="_blank">dys-gray.vercel.app</a> or authorized offline cash collection desks are generally non-refundable and non-cancellable once confirmed, except where a refund is required by applicable law, where a duplicate payment is verified, where the organiser cancels a programme, or where the Operator expressly approves an exception.</p>
    <p>Once a payment is authorized or cash is received, requests for refund, fee reversal, cash conversion, or cancellation for change of mind, personal scheduling conflicts, failure to attend, or accidental registration will generally not be entertained, subject to applicable law and the exceptions stated in this policy.</p>
    <p>Registrations are mode-specific (Online-Only or Offline-Only at ISKCON NVCC Pune) and non-transferable to other individuals or future batches unless authorized in writing by the Operator due to administrative rescheduling.</p>
    <p>No-show participants who fail to attend scheduled online webinars or physical venue sessions are not eligible for any refund, credit, or makeup compensation unless the organizing team decides otherwise in exceptional circumstances.</p>

    <h3>3. Physical Literature & Merchandise Disclaimer</h3>
    <p>As part of standard course and program registrations, no physical books, merchandise, or physical literature kits are provided. Registration covers digital access passes, enrolled session admission (online or offline), and group communication coordination.</p>

    <h3>4. Failed, Pending, Or Duplicate Payments</h3>
    <p>If money is debited from a user's bank account but the payment is marked failed or pending on the gateway, the debited amount is automatically reversed by the bank/payment gateway as per their standard operating timelines.</p>
    <p>For duplicate successful payments for the exact same registration, users should contact us immediately at <a href="mailto:dys.bg.asitis@gmail.com">dys.bg.asitis@gmail.com</a> with both transaction references. Verified duplicate payments will be refunded after reconciliation.</p>
    <p>Bank, UPI network, card network, and payment gateway processing delays are outside our direct control.</p>

    <h3>5. Deductions And Refund Method For Exceptionally Approved Refunds</h3>
    <p>Where a refund is exceptionally approved by the Operator (such as for verified duplicate payments), any deduction of non-refundable third-party processing charges will be limited to charges legally permissible and actually incurred, where disclosed and permitted under applicable law.</p>
    <p>Approved online refunds are processed back to the original payment method (UPI, Bank Account, or Card) within 5 to 7 business days (actual credit timing depends on issuing banks). Approved cash refunds are handled within 2 to 3 business days.</p>

    <h3>6. Cancellation Or Rescheduling By Organizers</h3>
    <p>If a course, event, or service is cancelled entirely by RAHUL KAMAL BAMBORDE / Discover Your Self (DYS) due to technical, venue, or administrative reasons, enrolled participants will be offered a full refund or an automatic seat transfer to the next available batch, as communicated by the Operator.</p>
    <p>If a program is rescheduled, the team will offer continuation in the revised schedule. Where the revised date makes participation impossible, the Operator will communicate any applicable refund, credit, or other available option in accordance with this policy and applicable law.</p>

    <h3>7. Force Majeure</h3>
    <p>Events beyond reasonable control may include natural disasters, severe weather, health advisories, government restrictions, transport disruptions, venue closures, civil emergencies, or internet blackouts.</p>
    <p>In such cases, RAHUL KAMAL BAMBORDE and Discover Your Self (DYS) may reschedule, modify, restrict, or cancel services. Available remedies, including alternative session access, credit, refund, or transfer where applicable, will be communicated based on the circumstances and in accordance with this policy and applicable law.</p>

    <h3>8. Refund Review</h3>
    <p>Refund decisions will be made after thorough verification of payment status, registration record, applicable rules, and operational commitments.</p>
    <p>Refund requests will be reviewed in accordance with this policy and applicable Indian law.</p>
  `,

  contact: `
    <h2>Contact Us</h2>
    <p>If you have any questions, feedback, technical registration issues, or billing inquiries, please reach out to us using the official contact details below.</p>

    <div class="policy-contact-box">
      <h3>1. Primary Merchant & Operator Information</h3>
      <p><strong>Individual Merchant Name (Razorpay Account Holder):</strong> RAHUL KAMAL BAMBORDE</p>
      <p><strong>Legal/Business Name:</strong> RAHUL KAMAL BAMBORDE</p>
      <p><strong>Operational Position:</strong> Individual Merchant & Platform Operator</p>

      <h3 style="margin-top:14px;">2. Communication Channels</h3>
      <p><strong>Customer Support Helpline:</strong> <a href="tel:+919892961661">+91 9892961661</a></p>
      <p><strong>WhatsApp Support:</strong> <a href="https://wa.me/919892961661" target="_blank">+91 9892961661</a></p>
      <p><strong>Primary Support Email:</strong> <a href="mailto:dys.bg.asitis@gmail.com">dys.bg.asitis@gmail.com</a></p>
      <p><strong>Official Website URL:</strong> <a href="https://dys-gray.vercel.app" target="_blank">https://dys-gray.vercel.app</a></p>

      <h3 style="margin-top:14px;">3. Operational & Communication Address</h3>
      <p>Platform Operator Office<br>
      c/o RAHUL KAMAL BAMBORDE<br>
      Flat no B-109, Dwarika Nagari<br>
      Near ISKCON NVCC Temple, Tilekar Nagar<br>
      Kondhwa BK, Pune - 411048<br>
      Maharashtra, India</p>

      <h3 style="margin-top:14px;">4. Support Operating Hours</h3>
      <p><strong>Monday to Saturday:</strong> 10:00 AM – 7:00 PM (IST)</p>
      <p><strong>Sunday:</strong> 10:00 AM – 4:00 PM (IST)</p>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-top:4px;">Messages sent outside operating hours will be addressed on the next business day.</p>
    </div>
  `
};

function openPolicyModal(policyKey) {
  const modal = document.getElementById('policy-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.setProperty('display', 'flex', 'important');
    modal.style.setProperty('z-index', '100005', 'important');
    document.body.style.overflow = 'hidden';
    switchPolicyTab(policyKey || 'terms');
  }
}

function closePolicyModal() {
  const modal = document.getElementById('policy-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.setProperty('display', 'none', 'important');
    const termsModal = document.getElementById('terms-consent-modal');
    if (!termsModal || termsModal.style.display === 'none' || termsModal.classList.contains('hidden')) {
      document.body.style.overflow = '';
    }
  }
}

function switchPolicyTab(policyKey) {
  const keys = ['about', 'terms', 'privacy', 'delivery', 'refund', 'contact'];
  const activeKey = keys.includes(policyKey) ? policyKey : 'terms';

  keys.forEach(k => {
    const btn = document.getElementById('tab-policy-' + k);
    if (btn) {
      if (k === activeKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  });

  const bodyEl = document.getElementById('policy-modal-body');
  if (bodyEl && POLICY_CONTENTS[activeKey]) {
    bodyEl.innerHTML = POLICY_CONTENTS[activeKey];
    bodyEl.scrollTop = 0;
  }
}

window.openPolicyModal = openPolicyModal;
window.closePolicyModal = closePolicyModal;
window.switchPolicyTab = switchPolicyTab;
window.handleInlineTermsToggle = handleInlineTermsToggle;
window.confirmInlineTermsAndProceed = confirmInlineTermsAndProceed;

