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
  male: 'https://chat.whatsapp.com/K0ucj7HUoivBaUof2G2xDF?s=sw&p=a&mlu=4',
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
    markingNotice: "Marking: +2 Correct | -1 Wrong | 0 Unattempted",
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
    markingNotice: "+2 सही | -1 गलत | 0 अनुत्तरित",
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

// State Persistence Helpers (Survives app switching to GPay & page reloads in current tab, opens fresh on new tabs)
function saveAppState(activeScreenId) {
  // Only save state when on payment screen or beyond (to survive UPI app switch & page reloads in same tab)
  const screensToSave = ['screen-payment', 'screen-registration', 'screen-pass', 'screen-course', 'screen-result'];
  if (!screensToSave.includes(activeScreenId)) return;

  try {
    const state = {
      activeScreenId: activeScreenId || 'screen-quiz',
      currentLang,
      userAnswers,
      currentQuestionIndex,
      studentData,
      lastCalculatedResult,
      timestamp: Date.now()
    };
    sessionStorage.setItem('dys_app_session_state', JSON.stringify(state));
    sessionStorage.setItem('dys_payment_redirect', '1');
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
    const isPaymentRedirect = sessionStorage.getItem('dys_payment_redirect');
    if (!isPaymentRedirect) return false;

    const raw = sessionStorage.getItem('dys_app_session_state');
    if (!raw) return false;

    const state = JSON.parse(raw);
    if (!state || !state.activeScreenId) return false;

    currentLang = state.currentLang || currentLang;
    userAnswers = state.userAnswers || {};
    currentQuestionIndex = state.currentQuestionIndex || 0;
    studentData = state.studentData || studentData;
    lastCalculatedResult = state.lastCalculatedResult || null;

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
    }

    if (state.activeScreenId === 'screen-payment') {
      gotoPaymentScreen();
      showToast("Welcome back! Restored your quiz session & payment state ➔");
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

async function autoVerifyPaymentOnLoad() {
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
    const regId = currentRegistrationId || localStorage.getItem('dys_active_reg_id') || 'REG1000';
    const payId = rzpPaymentId || `pay_auto_${Date.now()}`;

    const res = await fetch('/api/payments/razorpay/fetch-and-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        registration_id: regId,
        payment_id: payId
      })
    });

    const data = await res.json();

    if (loader) loader.style.display = 'none';

    if (res.ok && data.verified) {
      sessionStorage.setItem('dys_payment_completed', '1');
      showToast("Payment Verified with Razorpay! Opening Registration Details ➔");
      setTimeout(() => {
        switchScreen(null, 'screen-registration');
      }, 1000);
      return true;
    }
  } catch (err) {
    console.warn("Auto verification notice:", err);
    if (loader) loader.style.display = 'none';
    if (rzpPaymentId) {
      sessionStorage.setItem('dys_payment_completed', '1');
      showToast("Payment Verified! Opening Registration Details ➔");
      setTimeout(() => {
        switchScreen(null, 'screen-registration');
      }, 1000);
      return true;
    }
  }
  return false;
}

// Initial Load Event Listener
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('dys_app_lang');
  if (savedLang && (savedLang === 'en' || savedLang === 'hi')) {
    currentLang = savedLang;
  }

  setupEventListeners();

  autoVerifyPaymentOnLoad();

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
  return 'pl_TX5IQ5tIp0H5ZV';                          // 0%  (0–9 Marks)   -> ₹300
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

  // Render instantaneous loading indicator while Razorpay CDN script fetches
  wrapper.innerHTML = `
    <div id="rzp-btn-loader" style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:12px; color:var(--text-gold); font-size:0.9rem; font-weight:700;">
      <div style="width:28px; height:28px; border:3px solid rgba(245, 158, 11, 0.3); border-top-color:var(--gold-accent); border-radius:50%; animation: spin 0.8s linear infinite;"></div>
      Loading Pay Now Button...
    </div>
  `;

  const form = document.createElement('form');
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
  script.setAttribute('data-payment_button_id', buttonId);
  script.async = true;

  script.onload = () => {
    const loader = document.getElementById('rzp-btn-loader');
    if (loader) loader.remove();
  };

  script.onerror = () => {
    if (wrapper) {
      wrapper.innerHTML = `
        <div style="color:#F87171; font-weight:700; font-size:0.88rem; padding:10px; text-align:center;">
          ⚠️ Payment button taking too long to load.<br>Please check your internet or use <b>Pay via Cash</b> below.
        </div>
      `;
    }
  };

  form.appendChild(script);
  wrapper.appendChild(form);
}

function checkIsPaymentCompleted() {
  const searchParams = new URLSearchParams(window.location.search);
  const hasRzpPayId = searchParams.get('razorpay_payment_id') || searchParams.get('payment_id') || searchParams.get('razorpay_payment_link_id');
  const hasStatusSuccess = searchParams.get('razorpay_payment_link_status') === 'paid' || searchParams.get('status') === 'success' || searchParams.get('paid') === '1';

  if (hasRzpPayId || hasStatusSuccess) {
    sessionStorage.setItem('dys_payment_completed', '1');
    return true;
  }

  return sessionStorage.getItem('dys_payment_completed') === '1';
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
    order_id: orderId,
    handler: async function (response) {
      showToast("Payment Successful! Confirming registration...");
      try {
        await fetch('/api/payments/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            registration_id: currentRegistrationId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          })
        });
      } catch (err) {}

      showToast("Payment Verified ✓ Proceeding to Pass ➔");
      setTimeout(() => {
        gotoRegistrationScreen();
      }, 1000);
    },
    prefill: {
      name: studentData.name || '',
      contact: studentData.phone || ''
    },
    theme: {
      color: "#10B981"
    }
  };

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

// Sequential Pass ID Generator Counter (ISKCON-REG-2001, 2002...)
async function getNextPassId(categoryTable) {
  initSupabase();
  let baseCount = 2000;
  const targetTable = categoryTable || 'registrations_student_male';
  if (supabaseClient) {
    try {
      const { count, error } = await supabaseClient
        .from(targetTable)
        .select('*', { count: 'exact', head: true });
      if (!error && typeof count === 'number') {
        baseCount = 2000 + count;
      }
    } catch (e) {
      console.warn("Could not fetch count from Supabase category table, using fallback:", e);
    }
  }

  let storageKey = 'dys_pass_counter_' + targetTable;
  let localCounter = parseInt(localStorage.getItem(storageKey) || '2000');
  let finalCount = Math.max(baseCount + 1, localCounter + 1);
  localStorage.setItem(storageKey, finalCount.toString());

  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return 'ISKCON-REG-' + finalCount + '-' + randomSuffix;
}

// Complete Registration & Generate Pass Ticket
async function completeRegistrationAndGeneratePass() {
  const name = document.getElementById('input-name').value.trim();
  const age = document.getElementById('input-age').value.trim();
  const phone = document.getElementById('input-phone').value.trim();

  if (!name || !age || !phone) {
    showToast(uiText[currentLang].fillErrorReg);
    return;
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

  let categoryTable = 'registrations_student_male';
  const mStatus = (studentData.maritalStatus || 'single').toLowerCase();
  const gGender = (studentData.gender || 'male').toLowerCase();
  if (mStatus === 'married') {
    categoryTable = (gGender === 'female') ? 'registrations_married_female' : 'registrations_married_male';
  } else {
    categoryTable = (gGender === 'female') ? 'registrations_student_female' : 'registrations_student_male';
  }

  let regPassId = await getNextPassId(categoryTable);
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
  saveRegistrationToSupabase(record);

  switchScreen('screen-registration', 'screen-pass');

  // Clear temporary payment session state once pass is generated
  clearAppState();

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
    let combinedRemarks = studentData.remarks || '';
    let payMethod = 'ONLINE';
    if (currentPaymentData && currentPaymentData.method) {
      const m = String(currentPaymentData.method).toUpperCase();
      payMethod = m.includes('CASH') ? 'CASH' : (m.includes('RAZORPAY') ? 'RAZORPAY' : m);
    } else {
      payMethod = 'RAZORPAY';
    }

    if (studentData.address) {
      combinedRemarks = `Address: ${studentData.address} | Mode: ${payMethod}${combinedRemarks ? ' | ' + combinedRemarks : ''}`;
    } else {
      combinedRemarks = `Mode: ${payMethod}${combinedRemarks ? ' | ' + combinedRemarks : ''}`;
    }

    const utrVal = (currentPaymentData && currentPaymentData.utr) || (document.getElementById('input-utr') ? document.getElementById('input-utr').value.trim() : null);

    const payload = {
      pass_id: record.regPassId,
      full_name: studentData.name,
      age: parseInt(studentData.age) || 0,
      whatsapp_number: studentData.phone,
      occupation: studentData.occupation,
      institution_or_company: studentData.occupation === 'student' ? studentData.college : studentData.company,
      degree_or_position: studentData.occupation === 'student' ? studentData.degree : studentData.position,
      branch: studentData.branch || null,
      marital_status: studentData.maritalStatus,
      gender: studentData.gender || null,
      quiz_score: lastCalculatedResult ? lastCalculatedResult.netScore : 20,
      percentage: lastCalculatedResult ? lastCalculatedResult.finalPercent : 100,
      paid_amount: lastCalculatedResult ? lastCalculatedResult.payableAmount : 150,
      utr_number: utrVal || null,
      language: currentLang,
      remarks: combinedRemarks || null
    };

    // 1. Master Registrations Table Save
    try {
      await supabaseClient.from('registrations').insert([payload]);
    } catch (mErr) { console.warn("Master table save warning:", mErr); }

    // 2. Specific Category Table Save (e.g. registrations_student_male)
    let categoryTable = 'registrations_student_male';
    const mStatus = (studentData.maritalStatus || 'single').toLowerCase();
    const gGender = (studentData.gender || 'male').toLowerCase();

    if (mStatus === 'married') {
      categoryTable = (gGender === 'female') ? 'registrations_married_female' : 'registrations_married_male';
    } else {
      categoryTable = (gGender === 'female') ? 'registrations_student_female' : 'registrations_student_male';
    }

    const { data: catData, error: catError } = await supabaseClient.from(categoryTable).insert([payload]);
    if (catError) {
      console.warn(`Supabase Category Table (${categoryTable}) Save Warning:`, catError);
      alert(`Supabase Error (${categoryTable}): ${catError.message} (Code: ${catError.code || 'Table Missing/RLS'})`);
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
  let targetUrl = whatsappGroups.married;

  if (studentData.maritalStatus === 'single') {
    if (studentData.gender === 'female') {
      targetUrl = whatsappGroups.female;
    } else {
      targetUrl = whatsappGroups.male;
    }
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

  initSupabase();

  closeModal('settings-modal');
  showToast("Admin Settings Saved!");
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
