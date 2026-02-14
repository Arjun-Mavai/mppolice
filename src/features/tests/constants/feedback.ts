export const QUIZ_FEEDBACK: {
    en: { high: string[], medium: string[], low: string[] },
    hi: { high: string[], medium: string[], low: string[] }
} = {
    en: {
        high: [
            "Outstanding performance! You have a command over the subject.",
            "Excellent work! You are well on your way to mastering this topic.",
            "Top-tier effort! Keep maintaining this consistency.",
            "Brilliant! Your concepts are crystal clear.",
            "Superb! You're crushing it. Try a full-length mock next.",
            "Great job! Your hard work is clearly paying off.",
            "Impressive score! You have a competitive edge.",
            "Fantastic! Keep pushing the boundaries of your knowledge.",
            "Remarkable! You are among the top performers.",
            "You nailed it! Keep up the momentum."
        ],
        medium: [
            "Good effort! A little more revision will get you to the top.",
            "Solid performance. Focus on your weak areas to improve.",
            "You're on the right track. Keep practicing to boost your score.",
            "Nice attempt! Review the explanations for missed questions.",
            "Decent score. Consistency is key to improvement.",
            "You have potential! Just need to fine-tune your concepts.",
            "Good understanding. Work on speed and accuracy.",
            "Not bad! A bit more focus and you'll ace it.",
            "You are doing well. Analyze your mistakes to grow.",
            "Steady progress. Keep challenging yourself."
        ],
        low: [
            "Don't give up! Every expert was once a beginner.",
            "Keep trying! Consistency beats intensity.",
            "Focus on the basics and try again. You got this!",
            "Learn from your mistakes. They are the best teachers.",
            "Stay positive! Review the material and retake the test.",
            "It's okay to falter. What matters is that you get back up.",
            "Use this as a learning opportunity. Analyze your errors.",
            "Don't be discouraged. Persistence is the key to success.",
            "Keep studying! Your scores will improve with time.",
            "Believe in yourself. Hard work always pays off."
        ]
    },
    hi: {
        high: [
            "अद्भुत प्रदर्शन! आपकी विषय पर अच्छी पकड़ है।",
            "उत्कृष्ट कार्य! आप इस विषय में महारत हासिल करने की राह पर हैं।",
            "शिखर स्तर का प्रयास! इस निरंतरता को बनाए रखें।",
            "शानदार! आपकी अवधारणाएँ बिल्कुल स्पष्ट हैं।",
            "बेहतरीन! आप बहुत अच्छा कर रहे हैं। अगला पूर्ण मॉक टेस्ट आज़माएं।",
            "बढ़िया काम! आपकी कड़ी मेहनत रंग ला रही है।",
            "प्रभावशाली स्कोर! आपके पास एक प्रतिस्पर्धी बढ़त है।",
            "लाजवाब! अपने ज्ञान की सीमाओं को बढ़ाते रहें।",
            "असाधारण! आप शीर्ष प्रदर्शन करने वालों में से हैं।",
            "आपने कमाल कर दिया! इस गति को बनाए रखें।"
        ],
        medium: [
            "अच्छा प्रयास! थोड़ा और संशोधन आपको शीर्ष पर ले जाएगा।",
            "ठोस प्रदर्शन। सुधार के लिए अपने कमजोर क्षेत्रों पर ध्यान दें।",
            "आप सही रास्ते पर हैं। अपना स्कोर बढ़ाने के लिए अभ्यास करते रहें।",
            "अच्छा प्रयास! छूटे हुए प्रश्नों के लिए स्पष्टीकरण की समीक्षा करें।",
            "संतोषजनक स्कोर। निरंतरता सुधार की कुंजी है।",
            "आपमें क्षमता है! बस अपनी अवधारणाओं को थोड़ा और निखारने की जरूरत है।",
            "अच्छी समझ। गति और सटीकता पर काम करें।",
            "बुरा नहीं है! थोड़ा और ध्यान और आप इसमें माहिर हो जाएंगे।",
            "आप अच्छा कर रहे हैं। आगे बढ़ने के लिए अपनी गलतियों का विश्लेषण करें।",
            "स्थिर प्रगति। खुद को चुनौती देते रहें।"
        ],
        low: [
            "हार मत मानो! हर विशेषज्ञ कभी एक शुरुआती था।",
            "कोशिश करते रहो! निरंतरता तीव्रता को हरा देती है।",
            "मूल बातों पर ध्यान दें और पुनः प्रयास करें। आप यह कर सकते हैं!",
            "अपनी गलतियों से सीखें। वे सबसे अच्छे शिक्षक हैं।",
            "सकारात्मक रहें! सामग्री की समीक्षा करें और टेस्ट फिर से दें।",
            "लड़खड़ाना ठीक है। जो मायने रखता है वह यह है कि आप वापस उठें।",
            "इसे सीखने के अवसर के रूप में उपयोग करें। अपनी त्रुटियों का विश्लेषण करें।",
            "हताश न हों। दृढ़ता सफलता की कुंजी है।",
            "पढ़ते रहो! समय के साथ आपके अंकों में सुधार होगा।",
            "खुद पर विश्वास रखें। कड़ी मेहनत हमेशा रंग लाती है।"
        ]
    }
};

export const getRandomFeedback = (scorePercentage: number, language: 'en' | 'hi' = 'en'): string => {
    let messages: string[];
    // Fallback to English if language not found, though types say it's strictly 'en' | 'hi'
    const feedbackData = QUIZ_FEEDBACK[language] || QUIZ_FEEDBACK.en;

    if (scorePercentage >= 80) {
        messages = feedbackData.high;
    } else if (scorePercentage >= 60) {
        messages = feedbackData.medium;
    } else {
        messages = feedbackData.low;
    }
    
    return messages[Math.floor(Math.random() * messages.length)];
};
