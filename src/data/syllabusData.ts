export interface Topic {
  id: number;
  front: string;
  back: string;
  details?: string;
  mnemonic?: string;
  pro_tip?: string;
  impact_emoji?: string;
  important_facts?: string[];
  image_url?: string;
  order?: number;
}

export interface UnitData {
  title?: string; // Optional for backward compatibility
  title_en?: string;
  unit_title?: string; // New format
  exam_name?: string; // New format
  subject?: string; // New format
  unit_id?: string; // New format
  topics: Topic[];
  topics_en?: Topic[];
}

export interface SyllabusData {
  exam_name: string;
  subject: string;
  units: {
    [key: string]: UnitData;
  };
}

export const syllabusData: SyllabusData = {
  exam_name: "राज्य सेवा (प्रारंभिक) परीक्षा",
  subject: "सामान्य अध्ययन - प्रथम प्रश्न पत्र",
  units: {
    "unit_1": {
      "exam_name": "राज्य सेवा (प्रारंभिक) परीक्षा",
      "subject": "सामान्य अध्ययन - प्रथम प्रश्न पत्र",
      "unit_id": "unit_1",
      "unit_title": "भारत का इतिहास (History of India)",
      "title": "भारत का इतिहास",
      "title_en": "History of India",
      "topics": [
        {
          "id": 1, "order": 1,
          "front": "प्राचीन भारतीय ज्ञान परंपरा",
          "back": "यह हमारे पूर्वजों की सोचने की शक्ति और विज्ञान है, जहाँ शिक्षा सिर्फ किताबी नहीं बल्कि जीवन जीने का तरीका थी।",
          "impact_emoji": "🕉️",
          "image_url": "https://images.unsplash.com/photo-1544924222-cd53eb09995d?q=80&w=800&auto=format&fit=crop",
          "important_facts": [
            "शिक्षा को 'विद्या' कहा जाता था जिसका अर्थ है जानना।",
            "गुरु-शिष्य परंपरा इस प्रणाली की मुख्य विशेषता थी।",
            "तक्षशिला और नालंदा प्राचीन ज्ञान के वैश्विक केंद्र थे।",
            "शिक्षा का उद्देश्य केवल आजीविका नहीं बल्कि आत्म-साक्षात्कार था।"
          ],
          "details": "वेद, उपनिषद और वेदांग इस परंपरा के आधार स्तंभ हैं।"
        },
        {
          "id": 2, "order": 2,
          "front": "भारतवर्ष",
          "back": "सिर्फ एक ज़मीन का टुकड़ा नहीं, बल्कि हिमालय से समुद्र तक फैली हमारी सांस्कृतिक और भौगोलिक पहचान।",
          "impact_emoji": "🗺️",
          "image_url": "https://images.unsplash.com/photo-1532375811409-ca664b4c1737?q=80&w=800&auto=format&fit=crop",
          "important_facts": [
            "विष्णु पुराण में कहा गया है: 'उत्तरं यत्समुद्रस्य हिमाद्रेश्चैव दक्षिणम्। तद्वर्षं भारतं नाम भारती यत्र सन्ततिः।'",
            "भारतवर्ष भरत कबीले/राजा के नाम पर आधारित है।",
            "प्राचीन काल में इसे जंबूद्वीप का हिस्सा माना जाता था।",
            "यह एक सांस्कृतिक इकाई है जहाँ विविध भाषाएँ और परंपराएँ जुड़ी हैं।"
          ],
          "mnemonic": "याद रखें: उत्तर में हिमालय, दक्षिण में समुद्र (Him-Sam)"
        },
        {
          "id": 3, "order": 3,
          "front": "वेद",
          "back": "दुनिया का सबसे पुराना ज्ञान का भंडार (ऋग्वेद, सामवेद, यजुर्वेद, अथर्ववेद) जिसमें ब्रह्मांड के रहस्य छुपे हैं।",
          "impact_emoji": "📜",
          "image_url": "https://images.unsplash.com/photo-1620311124458-96264024b335?q=80&w=800&auto=format&fit=crop",
          "important_facts": [
            "ऋग्वेद: सबसे प्राचीन, देवताओं की स्तुति में मंत्र।",
            "यजुर्वेद: यज्ञों और अनुष्ठानों की विधियाँ।",
            "सामवेद: संगीत और गायन का आधार।",
            "अथर्ववेद: चिकित्सा, जादू और दैनिक जीवन के नियम।"
          ],
          "mnemonic": "Trick: R-S-Y-A (Rishabh Sings Yearly Always)"
        },
        {
          "id": 4, "order": 4,
          "front": "उपनिषद",
          "back": "गुरु के समीप बैठकर सीखा गया वो दार्शनिक ज्ञान जो आत्मा और परमात्मा की गहराई समझाता है।",
          "impact_emoji": "🧘‍♂️"
        },
        {
          "id": 5, "order": 5,
          "front": "आरण्यक",
          "back": "वो ग्रंथ जो जंगलों (अरण्य) के एकांत में ऋषियों द्वारा लिखे गए, जिनमें ध्यान और दर्शन की बातें हैं।",
          "impact_emoji": "🌲"
        },
        {
          "id": 6, "order": 6,
          "front": "ब्राह्मण ग्रंथ",
          "back": "वेदों के कठिन मंत्रों को सरल भाषा में समझाने और यज्ञों की विधि बताने वाले ग्रंथ।",
          "impact_emoji": "📖"
        },
        {
          "id": 7, "order": 7,
          "front": "षड्दर्शन",
          "back": "भारतीय दर्शन के 6 स्कूल (सांख्य, योग, न्याय, वैशेषिक, मीमांसा, वेदांत) जो सत्य को खोजने के अलग रास्ते बताते हैं।",
          "impact_emoji": "🧠",
          "mnemonic": "Trick: न्या-वै, सां-यो, मी-वे"
        },
        {
          "id": 8, "order": 8,
          "front": "स्मृतियाँ",
          "back": "प्राचीन समाज के नियम और कानून की पुस्तकें, जैसे मनुस्मृति और याज्ञवल्क्य स्मृति।",
          "impact_emoji": "⚖️"
        },
        {
          "id": 9, "order": 9,
          "front": "ऋत",
          "back": "ब्रह्मांड का वो अटूट प्राकृतिक नियम जिससे पूरी सृष्टि (सूरज, चाँद, मौसम) अनुशासन में चलती है।",
          "impact_emoji": "🌌"
        },
        {
          "id": 10, "order": 10,
          "front": "सभा एवं समिति",
          "back": "वैदिक काल की लोकतांत्रिक संस्थाएं; सभा में अनुभवी लोग और समिति में आम जनता शामिल होती थी।",
          "impact_emoji": "🏛️"
        },
        {
          "id": 11, "order": 11,
          "front": "गणतंत्र",
          "back": "भारत की वो पुरानी व्यवस्था जहाँ शासन किसी राजा के वंश से नहीं बल्कि लोगों या संघ द्वारा चुना जाता था।",
          "impact_emoji": "🤝"
        },
        {
          "id": 12, "order": 12,
          "front": "वर्णाश्रम",
          "back": "समाज और जीवन को व्यवस्थित करने का तरीका (ब्राह्मण, क्षत्रिय, वैश्य, शूद्र) और जीवन के 4 चरण।",
          "impact_emoji": "🏘️"
        },
        {
          "id": 13, "order": 13,
          "front": "पुरुषार्थ",
          "back": "जीवन के चार बड़े उद्देश्य: धर्म (कर्तव्य), अर्थ (धन), काम (इच्छा), और मोक्ष (मुक्ति)।",
          "impact_emoji": "🎯",
          "mnemonic": "Trick: D-A-K-M"
        },
        {
          "id": 14, "order": 14,
          "front": "ऋण",
          "back": "इंसान पर तीन मुख्य कर्ज: देव ऋण, ऋषि ऋण, और पितृ ऋण, जिन्हें चुकाना पुण्य माना जाता है।",
          "impact_emoji": "💳"
        },
        {
          "id": 15, "order": 15,
          "front": "संस्कार",
          "back": "इंसान को बेहतर बनाने की प्रक्रिया, जिसमें जन्म से मृत्यु तक 16 मुख्य रीति-रिवाजों का पालन होता है।",
          "impact_emoji": "🔥",
          "mnemonic": "Trick: 16 Steps of Life"
        },
        {
          "id": 16, "order": 16,
          "front": "पंचमहायज्ञ / यज्ञ",
          "back": "प्रकृति और ईश्वर के प्रति कृतज्ञता जताने के लिए किए जाने वाले 5 मुख्य दैनिक कर्तव्य।",
          "impact_emoji": "🙏"
        },
        {
          "id": 17, "order": 17,
          "front": "कर्म का सिद्धांत",
          "back": "जैसा बीज बोओगे वैसी फसल काटोगे; हमारे अच्छे या बुरे काम ही हमारा भविष्य तय करते हैं।",
          "impact_emoji": "🎡"
        },
        {
          "id": 18, "order": 18,
          "front": "बोधिसत्व",
          "back": "बौद्ध धर्म की वो महान आत्मा जो खुद निर्वाण पा सकती है पर दूसरों के दुःख दूर करने के लिए रुक जाती है।",
          "impact_emoji": "🏵️"
        },
        {
          "id": 19, "order": 19,
          "front": "तीर्थंकर",
          "back": "जैन धर्म के वो 24 महापुरुष जिन्होंने संसार रूपी सागर को पार करने का रास्ता दिखाया।",
          "impact_emoji": "🚶‍♂️"
        },
        {
          "id": 20, "order": 20,
          "front": "प्राचीन एवं मध्यकालीन भारत की विशेषताएं",
          "back": "भारत की वो खूबियाँ जिन्होंने हमें 'सोने की चिड़िया' बनाया, जैसे हमारी वास्तुकला और व्यापार।",
          "impact_emoji": "🏰"
        },
        {
          "id": 21, "order": 21,
          "front": "प्रशासनिक, सामाजिक तथा आर्थिक व्यवस्थाएं",
          "back": "पुराने समय में टैक्स कैसे वसूला जाता था, समाज कैसा था और राजा कैसे राज करते थे।",
          "impact_emoji": "👑"
        },
        {
          "id": 22, "order": 22,
          "front": "सांस्कृतिक विरासत: कला प्रारूप, साहित्य, पर्व एवं उत्सव",
          "back": "हमारी मूर्तियाँ, चित्रकारी, महान लेखकों की किताबें और वो त्यौहार जो आज भी हमें जोड़कर रखते हैं।",
          "impact_emoji": "🎨"
        },
        {
          "id": 23, "order": 23,
          "front": "19वीं एवं 20वीं शताब्दी के सामाजिक-धार्मिक सुधार",
          "back": "सती प्रथा और छुआछूत जैसी बुराइयों को खत्म करने के लिए राजा राममोहन राय और विवेकानंद जैसे महापुरुषों की जंग।",
          "impact_emoji": "🕯️"
        },
        {
          "id": 24, "order": 24,
          "front": "स्वतंत्रता संघर्ष एवं भारतीय राष्ट्रीय आंदोलन",
          "back": "1857 की क्रांति से लेकर 1947 तक आज़ादी के दीवानों के बलिदान और संघर्ष की पूरी कहानी।",
          "impact_emoji": "🇮🇳"
        },
        {
          "id": 25, "order": 25,
          "front": "स्वतंत्रता के पश्चात् भारत का एकीकरण एवं पुनर्गठन",
          "back": "आज़ादी के बाद टुकड़ों में बँटी रियासतों को जोड़कर एक मज़बूत भारत बनाने का सरदार पटेल का करिश्मा।",
          "impact_emoji": "🔗"
        }
      ],
      "topics_en": [
        {
          "id": 1, "order": 1,
          "front": "Ancient Indian Knowledge Tradition",
          "back": "The foundational wisdom of our ancestors where science, logic, and spirituality were taught as a unified way of life.",
          "impact_emoji": "🕉️"
        },
        {
          "id": 2, "order": 2,
          "front": "Bharatvarsha",
          "back": "Beyond a map, it is the cultural identity of the land stretching from the Himalayas to the oceans.",
          "impact_emoji": "🗺️"
        },
        {
          "id": 3, "order": 3,
          "front": "Vedas",
          "back": "The world's oldest 'knowledge library' (Rigveda, Samaveda, Yajurveda, Atharvaveda) containing the secrets of the universe.",
          "impact_emoji": "📜",
          "mnemonic": "Trick: R-S-Y-A"
        },
        {
          "id": 4, "order": 4,
          "front": "Upanishad",
          "back": "Philosophical teachings learned 'sitting near the Guru' that explore deep questions like 'Who am I?'",
          "impact_emoji": "🧘‍♂️"
        },
        {
          "id": 5, "order": 5,
          "front": "Aranyaka",
          "back": "The 'Forest Books' written by sages in solitude, focusing on meditation and the symbolism of rituals.",
          "impact_emoji": "🌲"
        },
        {
          "id": 6, "order": 6,
          "front": "Brahman Granth",
          "back": "Texts that simplify the complex Vedic hymns and explain the procedures and meanings of various rituals.",
          "impact_emoji": "📖"
        },
        {
          "id": 7, "order": 7,
          "front": "Shaddarshan",
          "back": "The 6 schools of Indian Philosophy (Sankhya, Yoga, Nyaya, Vaisheshika, Mimamsa, Vedanta) offering different paths to Truth.",
          "impact_emoji": "🧠"
        },
        {
          "id": 8, "order": 8,
          "front": "Smritiyan",
          "back": "The ancient legal and social codes that defined the rules of conduct for society (e.g., Manusmriti).",
          "impact_emoji": "⚖️"
        },
        {
          "id": 9, "order": 9,
          "front": "Rit (Ṛta)",
          "back": "The eternal cosmic order that keeps the universe, nature, and human life in perfect harmony.",
          "impact_emoji": "🌌"
        },
        {
          "id": 10, "order": 10,
          "front": "Sabha and Samiti",
          "back": "Ancient democratic assemblies; Sabha was the council of elders, and Samiti was the general house of the people.",
          "impact_emoji": "🏛️"
        },
        {
          "id": 11, "order": 11,
          "front": "Gantantra (Republic)",
          "back": "An ancient system where power was held by the people or a group of representatives, rather than a single hereditary king.",
          "impact_emoji": "🤝"
        },
        {
          "id": 12, "order": 12,
          "front": "Varnashrama",
          "back": "A framework to organize society (Varna) and a person’s life stages (Ashrama: Student, Householder, Forest-dweller, Ascetic).",
          "impact_emoji": "🏘️"
        },
        {
          "id": 13, "order": 13,
          "front": "Purushartha",
          "back": "The four great goals of human life: Dharma (Duty), Artha (Wealth), Kama (Desires), and Moksha (Liberation).",
          "impact_emoji": "🎯"
        },
        {
          "id": 14, "order": 14,
          "front": "Rin (Debt) & Sanskara",
          "back": "The three moral debts we owe to gods, sages, and ancestors, and the 16 life-defining rituals from birth to death.",
          "impact_emoji": "💳"
        },
        {
          "id": 15, "order": 15,
          "front": "Panch Mahayagya",
          "back": "Five daily duties/sacrifices performed to express gratitude to gods, sages, ancestors, humans, and nature.",
          "impact_emoji": "🙏"
        },
        {
          "id": 16, "order": 16,
          "front": "Principle of Karma",
          "back": "The law of cause and effect: 'As you sow, so shall you reap.' Our actions determine our destiny.",
          "impact_emoji": "🎡"
        },
        {
          "id": 17, "order": 17,
          "front": "Bodhisattva",
          "back": "In Buddhism, a great soul who attains enlightenment but stays back to help others achieve liberation from suffering.",
          "impact_emoji": "🏵️"
        },
        {
          "id": 18, "order": 18,
          "front": "Tirthankar",
          "back": "The 24 spiritual masters of Jainism who 'built the ford' to cross the ocean of birth and death.",
          "impact_emoji": "🚶‍♂️"
        },
        {
          "id": 19, "order": 19,
          "front": "Administrative, Social, and Economic Systems of Ancient/Medieval India",
          "back": "The study of how taxes were collected, how people lived together, and how kings governed in the past.",
          "impact_emoji": "👑"
        },
        {
          "id": 20, "order": 20,
          "front": "India's Cultural Heritage",
          "back": "Our magnificent art forms, literature, and festivals that represent the soul and diversity of the country.",
          "impact_emoji": "🎨"
        },
        {
          "id": 21, "order": 21,
          "front": "Social and Religious Reform Movements (19th & 20th Century)",
          "back": "The fight against social evils like Sati and untouchability led by heroes like Raja Rammohan Roy and Vivekananda.",
          "impact_emoji": "🕯️"
        },
        {
          "id": 22, "order": 22,
          "front": "Independence Struggle & National Movement",
          "back": "The epic story of sacrifice and courage, from the 1857 revolt to the final victory in 1947.",
          "impact_emoji": "🇮🇳"
        },
        {
          "id": 23, "order": 23,
          "front": "Integration and Reorganization of India after Independence",
          "back": "The masterstroke of Sardar Patel in uniting fragmented princely states into one strong nation.",
          "impact_emoji": "🔗"
        }
      ]
    },
    
    "unit_2": {
      "title": "मध्यप्रदेश का इतिहास, संस्कृति एवं साहित्य",
      "title_en": "History, Culture and Literature of Madhya Pradesh",
      "topics": [
      { "id": 1, "order": 1, "front": "मध्यप्रदेश के इतिहास की महत्वपूर्ण घटनाएँ", "back": "प्राचीन काल से लेकर आधुनिक काल तक की वो घटनाएं जिन्होंने राज्य की दिशा तय की।" },
      { 
          "id": 2, "order": 2, 
          "front": "प्रमुख राजवंश और उनकी राजधानियाँ", 
          "back": "मध्य भारत की प्रमुख सत्तारूढ़ शक्तियाँ और उनकी सरकार के मुख्य केंद्र।",
          "impact_emoji": "🏰",
          "important_facts": [
            "होलकर: इंदौर (मालवा)",
            "सिंधिया: ग्वालियर",
            "बुंदेला: ओरछा"
          ],
          "mnemonic": "होलकर इन डोर्स (इंदौर - Indore)"
      },
      { "id": 3, "order": 3, "front": "स्वतंत्रता आंदोलन में मध्यप्रदेश का योगदान", "back": "1857 की क्रांति और जंगल सत्याग्रह जैसे आंदोलनों में MP के वीरों की भूमिका।" },
      { "id": 4, "order": 4, "front": "मध्यप्रदेश की प्रमुख कला एवं स्थापत्य कला", "back": "खजुराहो के मंदिर, किलों की नक्काशी और प्राचीन गुफाओं की बेजोड़ बनावट।" },
      { "id": 5, "order": 5, "front": "मध्यप्रदेश की प्रमुख जनजातियाँ", "back": "भील, गोंड, बैगा, सहरिया—जो MP की असली सांस्कृतिक विरासत के संरक्षक हैं।" },
      { "id": 6, "order": 6, "front": "जनजातियों की बोलियाँ", "back": "बघेली, निमाड़ी, मालवी और जनजातीय भाषाएं जो हमारी मिट्टी की खुशबू हैं।" },
      { "id": 7, "order": 7, "front": "मध्यप्रदेश के प्रमुख त्योहार", "back": "लोकरंजन, भगोरिया और खजुराहो उत्सव जैसे सांस्कृतिक मिलन के अवसर।" },
      { "id": 8, "order": 8, "front": "लोक संगीत", "back": "गाँव-गाँव में गूँजने वाले आल्हा, फाग और पंडवानी जैसे मधुर संगीत।" },
      { "id": 9, "order": 9, "front": "लोक कलाएँ", "back": "मिट्टी के काम (Clay art), चित्रकारी और हस्तशिल्प जो MP को खास बनाते हैं।" },
      { "id": 10, "order": 10, "front": "लोक-साहित्य", "back": "क्षेत्रीय भाषाओं में रची गई वो कहानियाँ और कविताएँ जो पीढ़ियों से सुनी जा रही हैं।" },
      { "id": 11, "order": 11, "front": "मध्यप्रदेश के प्रमुख साहित्यकार एवं उनकी कृतियाँ", "back": "कालिदास, माखनलाल चतुर्वेदी और गजानन माधव मुक्तिबोध की अमर रचनाएँ।" },
      { "id": 12, "order": 12, "front": "धार्मिक, सांस्कृतिक एवं पुरातात्विक पर्यटन स्थल", "back": "उज्जैन के महाकाल, सांची के स्तूप और भीमबेटका की ऐतिहासिक गुफाएं।" },
      { "id": 13, "order": 13, "front": "मध्यप्रदेश में विश्व धरोहर स्थल", "back": "UNESCO द्वारा मान्यता प्राप्त अनमोल जगहें—खजुराहो, सांची और भीमबेटका।" },
      { "id": 14, "order": 14, "front": "मध्यप्रदेश के प्रमुख जनजातीय व्यक्तित्व", "back": "टंट्या भील और रानी दुर्गावती जैसे महानायक जिन्होंने स्वाभिमान की रक्षा की।" }
    ],
     "topics_en": [
      {
        "id": 1, "order": 1,
        "front": "Major Events and Dynasties of MP",
        "back": "Key historical turning points and the rule of families like the Holkars, Scindias, Chandelas, and Parmars."
      },
      {
        "id": 2, "order": 2,
        "front": "Dynasties & Capitals",
        "back": "The major ruling powers of Central India and their primary seats of government.",
        "impact_emoji": "🏰",
        "important_facts": [
            "Holkar: Indore (Malwa)",
            "Scindia: Gwalior",
            "Bundela: Orchha"
        ],
        "mnemonic": "Holkar In Doors (Indore)"
      },
      {
        "id": 3, "order": 3,
        "front": "Contribution of MP in Freedom Movement",
        "back": "The sparks of resistance in MP, including the Forest Satyagraha and the bravery of local revolutionaries."
      },
      {
        "id": 4, "order": 4,
        "front": "Major Arts and Sculpture of MP",
        "back": "Stone poetry! The intricate temples of Khajuraho and the ancient caves that showcase our artistic peak."
      },
      {
        "id": 5, "order": 5,
        "front": "Major Tribes of MP",
        "back": "The soul of the state—communities like Bhil, Gond, and Baiga who preserve the indigenous heritage."
      },
      {
        "id": 6, "order": 6,
        "front": "Dialects of Tribes",
        "back": "The rich linguistic tapestry of MP including Bagheli, Nimadi, Malvi and various tribal dialects."
      },
      {
        "id": 7, "order": 7,
        "front": "Major Festivals of MP",
        "back": "Cultural celebrations like Lokranjan, Bhagoria, and the Khajuraho Dance Festival."
      },
      {
        "id": 8, "order": 8,
        "front": "Folk Music",
        "back": "Traditional melodies echoing in villages, like Alha, Phag, and Pandvani."
      },
      {
        "id": 9, "order": 9,
        "front": "Folk Arts",
        "back": "Masterpieces of clay art, painting, and handicrafts that define MP's artistic identity."
      },
      {
        "id": 10, "order": 10,
        "front": "Folk Literature",
        "back": "Stories and poems composed in regional languages, passed down through oral traditions."
      },
      {
        "id": 11, "order": 11,
        "front": "Important Literary Creators and their Creations",
        "back": "The legends of the pen—from Kalidasa's Sanskrit epics to the modern poetry of Makhanlal Chaturvedi."
      },
      {
        "id": 12, "order": 12,
        "front": "Religious, Cultural, and Archaeological Tourism",
        "back": "Holy sites like Ujjain Mahakal, Sanchi Stupa, and Bhimbetka—where history meets spirituality."
      },
      {
        "id": 13, "order": 13,
        "front": "World Heritage Sites in MP",
        "back": "The three jewels recognized by UNESCO: Khajuraho, Sanchi Stupa, and Bhimbetka Caves."
      },
      {
        "id": 14, "order": 14,
        "front": "Important Tribal Personalities of MP",
        "back": "Icons of pride like Tantya Bhil and Rani Durgavati who sacrificed everything for their land and dignity."
      }
    ]
    },

    "unit_3": {
      "title": "भारत का भूगोल",
      "title_en": "Geography of India",
     "topics": [
      { "id": 1, "order": 1, "front": "पर्वत", "back": "हिमालय से लेकर अरावली तक, भारत की वो ऊँचाइयाँ जो मानसून और सीमाओं की रक्षा करती हैं।" },
      { "id": 2, "order": 2, "front": "पहाड़ियाँ", "back": "नीलगिरी और विंध्याचल जैसी छोटी पर्वत श्रृंखलाएँ जो जैव-विविधता का घर हैं।" },
      { "id": 3, "order": 3, "front": "पठार", "back": "दक्कन और छोटा नागपुर का पठार जहाँ भारत का सबसे ज़्यादा खनिज पाया जाता है।" },
      { "id": 4, "order": 4, "front": "नदियाँ", "back": "गंगा, नर्मदा और कावेरी—भारत की जीवन रेखाएं जो प्यास भी बुझाती हैं और संस्कृति भी पालती हैं।" },
      { "id": 5, "order": 5, "front": "झीलें", "back": "चिल्का से लेकर वुलर तक, भारत के वो प्राकृतिक जल निकाय जो इकोसिस्टम का हिस्सा हैं।" },
      { "id": 6, "order": 6, "front": "जलवायु घटनाएँ—अल-नीनो, ला-नीना", "back": "प्रशांत महासागर की वो हलचल जो भारत की बारिश और सूखे को तय करती है।" },
      { "id": 7, "order": 7, "front": "दक्षिणी दोलन", "back": "हवा के दबाव में होने वाला बदलाव जो मानसून की ताकत को प्रभावित करता है।" },
      { "id": 8, "order": 8, "front": "पश्चिमी विक्षोभ (Western Disturbances)", "back": "सर्दियों में उत्तर भारत में होने वाली वो बारिश जो रबी की फसल के लिए सोना है।" },
      { "id": 9, "order": 9, "front": "जलवायु परिवर्तन के परिणाम", "back": "बढ़ता तापमान और पिघलते ग्लेशियर—आने वाले समय की सबसे बड़ी चुनौती।" },
      { "id": 10, "order": 10, "front": "प्राकृतिक संसाधन—वन", "back": "भारत के फेफड़े—सदाबहार से लेकर कटीले वनों तक की हरियाली।" },
      { "id": 11, "order": 11, "front": "प्राकृतिक संसाधन—खनिज", "back": "ज़मीन के नीचे छुपा लोहा, कोयला और सोना जो देश की इकॉनमी चलाता है।" },
      { "id": 12, "order": 12, "front": "प्राकृतिक संसाधन—जल संसाधन", "back": "नहरों, बांधों और बारिश के पानी का सही प्रबंधन जो खेती का आधार है।" },
      { "id": 13, "order": 13, "front": "प्रमुख फसलें", "back": "गेहूँ, चावल और मसालों की खेती जो पूरी दुनिया का पेट भरती है।" },
      { "id": 14, "order": 14, "front": "खाद्य सुरक्षा", "back": "हर नागरिक तक अनाज पहुँचाने की सरकारी और सामाजिक ज़िम्मेदारी।" },
      { "id": 15, "order": 15, "front": "हरित क्रांति", "back": "60 के दशक का वो चमत्कार जिसने भारत को अनाज के लिए आत्मनिर्भर बनाया।" },
      { "id": 16, "order": 16, "front": "दूसरी हरित क्रांति की रणनीतियाँ", "back": "आधुनिक तकनीक और सस्टेनेबल खेती के साथ उत्पादन बढ़ाने का नया प्लान।" },
      { "id": 17, "order": 17, "front": "ऊर्जा के पारंपरिक स्रोत", "back": "कोयला और पेट्रोलियम—जो सालों से हमारी बिजली और गाड़ियों की ज़रूरत पूरी कर रहे हैं।" },
      { "id": 18, "order": 18, "front": "ऊर्जा के गैर-पारंपरिक स्रोत", "back": "सौर ऊर्जा और पवन ऊर्जा—भविष्य की साफ और कभी न खत्म होने वाली बिजली।" },
      { "id": 19, "order": 19, "front": "भारत में प्राकृतिक खतरे और आपदाएँ", "back": "बाढ़, भूकंप और सूखा—प्रकृति की वो चुनौतियां जिनसे हमें निपटना सीखना है।" },
      { "id": 20, "order": 20, "front": "भारत में प्रमुख चक्रवात", "back": "समुद्र से आने वाले वो तूफान जो तटीय इलाकों में तबाही और बारिश लाते हैं।" },
      { "id": 21, "order": 21, "front": "जनसंख्या वृद्धि, वितरण एवं घनत्व", "back": "भारत के लोग कहाँ और कितने बसे हैं, और हमारी आबादी कैसे बढ़ रही है।" },
      { "id": 22, "order": 22, "front": "ग्रामीण-नगरीय प्रवास (Migration)", "back": "गाँव से शहर की ओर पलायन और उससे जुड़े सामाजिक-आर्थिक बदलाव।" }
    ],
     "topics_en": [
      { "id": 1, "order": 1, "front": "Mountains", "back": "From the mighty Himalayas in the North to the ancient Aravallis, these peaks protect our borders and influence India's monsoon." },
      { "id": 2, "order": 2, "front": "Hills", "back": "Smaller mountain ranges like the Nilgiris and Western Ghats that are hotspots for biodiversity and heavy rainfall." },
      { "id": 3, "order": 3, "front": "Plateaus", "back": "The Deccan and Chota Nagpur plateaus—the 'mineral heart' of India where most of our natural resources are found." },
      { "id": 4, "order": 4, "front": "Rivers", "back": "Life-lines of India like the Ganga, Narmada, and Kaveri that provide water for agriculture and sacred cultural roots." },
      { "id": 5, "order": 5, "front": "Lakes", "back": "Natural water bodies like Chilika and Wular that support local ecosystems and migratory birds." },
      { "id": 6, "order": 6, "front": "Climate Phenomena: El Nino & La Nina", "back": "Major Pacific Ocean events that can cause either drought or heavy monsoon rains in India." },
      { "id": 7, "order": 7, "front": "Southern Oscillation", "back": "Periodic changes in air pressure over the ocean that directly impact the strength of our rainy season." },
      { "id": 8, "order": 8, "front": "Western Disturbance", "back": "Winter storms from the Mediterranean that bring much-needed rain to North India for the Rabi crops." },
      { "id": 9, "order": 9, "front": "Consequences of Climate Change", "back": "Glacier melting, rising sea levels, and unpredictable weather—the biggest challenge for India's future." },
      { "id": 10, "order": 10, "front": "Natural Resources: Forests", "back": "India's green cover—from tropical evergreens to dry deciduous forests that act as the country's lungs." },
      { "id": 11, "order": 11, "front": "Natural Resources: Minerals", "back": "The hidden wealth of iron, coal, and gold under our soil that drives the nation's industrial economy." },
      { "id": 12, "order": 12, "front": "Natural Resources: Water Resources", "back": "The management of rivers, dams, and rainfall to ensure water for every citizen and farm." },
      { "id": 13, "order": 13, "front": "Major Crops", "back": "The staple foods like Rice and Wheat, and cash crops like Sugarcane that feed over a billion people." },
      { "id": 14, "order": 14, "front": "Food Security", "back": "The national mission to ensure no citizen goes hungry by managing grain stocks and distribution." },
      { "id": 15, "order": 15, "front": "Green Revolution", "back": "The 1960s transformation that used technology and seeds to make India self-sufficient in food grains." },
      { "id": 16, "order": 16, "front": "Strategies for Second Green Revolution", "back": "Focusing on sustainable farming, technology, and high-yield seeds to feed the future population." },
      { "id": 17, "order": 17, "front": "Conventional Sources of Energy", "back": "Traditional power sources like Coal and Petroleum that have powered our vehicles and homes for decades." },
      { "id": 18, "order": 18, "front": "Non-Conventional Sources of Energy", "back": "Future energy like Solar and Wind—clean, green, and never-ending power." },
      { "id": 19, "order": 19, "front": "Natural Hazards and Disasters in India", "back": "Challenges like floods, earthquakes, and landslides that require smart planning and quick response." },
      { "id": 20, "order": 20, "front": "Major Cyclones in India", "back": "Powerful sea storms that hit our coastal areas, bringing heavy wind and rainfall." },
      { "id": 21, "order": 21, "front": "Population Growth, Distribution and Density", "back": "The study of where Indians live and how fast our population is growing across different states." },
      { "id": 22, "order": 22, "front": "Rural-Urban Migration", "back": "The movement of people from villages to cities in search of better jobs and lifestyle." }
    ]
    },

    "unit_4": {
      "title": "मध्यप्रदेश का भूगोल",
      "title_en": "Geography of Madhya Pradesh",
     "topics": [
      { "id": 1, "order": 1, "front": "वन एवं वनोपज", "back": "MP के घने जंगल और उनसे मिलने वाली बेशकीमती चीज़ें जैसे महुआ, सागौन और तेंदूपत्ता।" },
      { "id": 2, "order": 2, "front": "नदियाँ", "back": "नर्मदा, चंबल और सोन जैसी नदियाँ जो मध्यप्रदेश की प्यास बुझाती हैं।" },
      { "id": 3, "order": 3, "front": "पहाड़ियाँ और पठार", "back": "सतपुड़ा और विंध्याचल की ऊँचाइयाँ और मालवा का उपजाऊ पठार।" },
      { "id": 4, "order": 4, "front": "जलवायु: ऋतुएँ, तापमान, वर्षा", "back": "MP में गर्मी, सर्दी और बारिश का चक्र और यहाँ के मौसम की खास बातें।" },
      { "id": 5, "order": 5, "front": "प्राकृतिक संसाधन—मिट्टियाँ", "back": "काली मिट्टी से लेकर लाल-पीली मिट्टी तक, जो यहाँ की फसलों की जान है।" },
      { "id": 6, "order": 6, "front": "प्रमुख खनिज संसाधन", "back": "MP की ज़मीन में छुपा हीरा, तांबा और कोयला जो राज्य को अमीर बनाता है।" },
      { "id": 7, "order": 7, "front": "प्रमुख फसलें", "back": "सोयाबीन, गेहूँ और चना—जिनकी पैदावार में MP देश में नाम कमाता है।" },
      { "id": 8, "order": 8, "front": "जल संसाधन, सिंचाई और परियोजनाएं", "back": "नहरों का जाल और बड़े बांध जो खेतों तक पानी पहुँचाते हैं।" },
      { "id": 9, "order": 9, "front": "ऊर्जा के पारंपरिक और गैर-पारंपरिक स्रोत", "back": "कोयले से बनने वाली बिजली और अब बढ़ता हुआ सोलर प्लांट का नेटवर्क।" },
      { "id": 10, "order": 10, "front": "मध्यप्रदेश के प्रमुख उद्योग", "back": "कपड़ा, लोहा और सीमेंट जैसे कारखाने जो राज्य की इकॉनमी की रीढ़ हैं।" },
      { "id": 11, "order": 11, "front": "जनसंख्या वृद्धि, वितरण एवं घनत्व", "back": "MP के लोग कहाँ ज़्यादा बसे हैं और आबादी कैसे बढ़ रही है।" },
      { "id": 12, "order": 12, "front": "नगरीकरण (Urbanization)", "back": "तेज़ी से बढ़ते शहर और गाँवों का शहरों में तब्दील होना।" }
    ],
     "topics_en": [
      { "id": 1, "order": 1, "front": "Forest and Forest Produce", "back": "MP is the 'Forest State'—home to dense woods providing teak, tendu leaves, and medicinal herbs." },
      { "id": 2, "order": 2, "front": "Rivers of MP", "back": "The 'Narmada' (lifeline of MP) and rivers like Chambal and Betwa that define our landscape." },
      { "id": 3, "order": 3, "front": "Hills and Plateaus of MP", "back": "From the Satpura and Vindhyachal ranges to the fertile Malwa plateau." },
      { "id": 4, "order": 4, "front": "Climate: Seasons, Temperature, Rainfall", "back": "The weather cycle in MP—hot summers, cool winters, and the life-giving monsoon." },
      { "id": 5, "order": 5, "front": "Soils of Madhya Pradesh", "back": "The diverse earth of MP, including rich black soil for cotton and red-yellow soil for rice." },
      { "id": 6, "order": 6, "front": "Major Mineral Resources", "back": "The state's wealth of Diamond (Panna), Copper, and Manganese." },
      { "id": 7, "order": 7, "front": "Major Crops", "back": "MP is the 'Soyabean State' and also a leading producer of Wheat and Gram." },
      { "id": 8, "order": 8, "front": "Irrigation and Irrigation Projects", "back": "Dams and canals that turn our dry lands into productive farms." },
      { "id": 9, "order": 9, "front": "Conventional and Non-Conventional Sources of Energy", "back": "Thermal power plants and MP's massive shift towards giant Solar Parks like Rewa." },
      { "id": 10, "order": 10, "front": "Major Industries of MP", "back": "From textiles and cement to modern industrial hubs like Pithampur and Mandideep." },
      { "id": 11, "order": 11, "front": "Population Growth, Distribution and Density", "back": "A look at the demographic spread across MP's 50+ districts." },
      { "id": 12, "order": 12, "front": "Urbanisation in MP", "back": "The growth of smart cities like Indore, Bhopal, and Gwalior." }
    ]
    },

    "unit_5": {
      "title": "भारत एवं मध्यप्रदेश की संवैधानिक व्यवस्था",
      "title_en": "Constitutional System of India and MP",
      "topics": [
      { "id": 1, "order": 1, "front": "संविधान सभा", "back": "वो महान सभा जिसने आज़ाद भारत के लिए दुनिया का सबसे बड़ा लिखित संविधान बनाया।" },
      { "id": 2, "order": 2, "front": "संघीय कार्यपालिका, राष्ट्रपति एवं संसद", "back": "देश कैसे चलता है—राष्ट्रपति की शक्ति और संसद में कानून बनने की प्रक्रिया।" },
      { "id": 3, "order": 3, "front": "सर्वोच्च न्यायालय एवं न्यायिक व्यवस्था", "back": "इंसाफ का सबसे बड़ा मंदिर और कानून की रक्षा करने वाला सिस्टम।" },
      { "id": 4, "order": 4, "front": "संवैधानिक संशोधन", "back": "समय के साथ संविधान को बेहतर बनाने के लिए किए गए बदलाव।" },
      { "id": 5, "order": 5, "front": "नागरिकों के मौलिक अधिकार एवं कर्तव्य", "back": "संविधान से मिले हमारे हक़ और देश के प्रति हमारी ज़िम्मेदारियाँ।" },
      { "id": 6, "order": 6, "front": "राज्य के नीति-निदेशक सिद्धांत", "back": "सरकार के लिए वो दिशा-निर्देश जो एक अच्छे समाज को बनाने में मदद करते हैं।" },
      { "id": 7, "order": 7, "front": "राष्ट्रीय एवं प्रादेशिक संवैधानिक/सांविधिक आयोग", "back": "चुनाव आयोग और UPSC जैसी संस्थाएं जो देश के लोकतंत्र को मज़बूत रखती हैं।" },
      { "id": 8, "order": 8, "front": "मध्यप्रदेश की संवैधानिक व्यवस्था", "back": "राज्यपाल, मुख्यमंत्री और विधानसभा—राज्य सरकार के कामकाज का तरीका।" },
      { "id": 9, "order": 9, "front": "मध्यप्रदेश में त्रिस्तरीय पंचायतीराज", "back": "गाँव की सरकार—सरपंच और पंचायत की ताकत और उनकी भूमिका।" },
      { "id": 10, "order": 10, "front": "नगरीय प्रशासन व्यवस्था", "back": "नगर निगम और नगर पालिकाओं का ढांचा जो शहरों का विकास देखते हैं।" },
      { "id": 11, "order": 11, "front": "मध्यप्रदेश में सुशासन (Good Governance)", "back": "ईमानदार और तेज़ प्रशासन की वो व्यवस्था जिससे जनता को फायदा मिले।" }
    ],
     "topics_en": [
      { "id": 1, "order": 1, "front": "Constituent Assembly", "back": "The assembly of great minds that debated and drafted the world's longest written constitution." },
      { "id": 2, "order": 2, "front": "Federal Executive, President and Parliament", "back": "How India is governed—the powers of the President and how laws are made in the Lok Sabha & Rajya Sabha." },
      { "id": 3, "order": 3, "front": "Supreme Court and Judicial System", "back": "The guardian of the Constitution and the ultimate temple of justice for every citizen." },
      { "id": 4, "order": 4, "front": "Constitutional Amendments", "back": "The process of updating the Constitution to keep it relevant for modern times." },
      { "id": 5, "order": 5, "front": "Fundamental Rights and Duties", "back": "The basic freedoms every Indian enjoys and the responsibilities we owe to the nation." },
      { "id": 6, "order": 6, "front": "Directive Principles of State Policy", "back": "Guidelines for the government to create a fair, equal, and welfare-oriented society." },
      { "id": 7, "order": 7, "front": "National and Regional Constitutional/Statutory Commissions", "back": "Powerful bodies like the Election Commission and UPSC that protect our democracy." },
      { "id": 8, "order": 8, "front": "Constitutional System of Madhya Pradesh", "back": "State governance—the role of the Governor, Chief Minister, and the State Legislature." },
      { "id": 9, "order": 9, "front": "Three-Tier Panchayati Raj", "back": "Grassroots democracy—village, block, and district levels giving power to the people." },
      { "id": 10, "order": 10, "front": "Civil Administration System in MP", "back": "The machinery of Municipalities and local bodies that run our towns and cities." },
      { "id": 11, "order": 11, "front": "Good Governance in Madhya Pradesh", "back": "The vision of transparent, fast, and digital administration to serve every citizen efficiently." }
    ]
    },

    "unit_6": {
      "title": "भारत एवं मध्यप्रदेश की अर्थव्यवस्था",
      "title_en": "Economy of India and MP",
     "topics": [
      { "id": 1, "order": 1, "front": "भारतीय अर्थव्यवस्था में मध्यप्रदेश की वर्तमान स्थिति", "back": "देश की जीडीपी (GDP) और विकास में हमारा MP कहाँ खड़ा है और कितना योगदान दे रहा है।" },
      { "id": 2, "order": 2, "front": "मध्यप्रदेश की जनसंख्या व मानवीय संसाधनों का विकास", "back": "MP के लोगों की ताकत—कैसे शिक्षा, स्वास्थ्य और स्किल (कौशल) से हम राज्य को आगे बढ़ा सकते हैं।" },
      { "id": 3, "order": 3, "front": "सतत् विकास लक्ष्यों (SDG) में मध्यप्रदेश की प्रगति", "back": "गरीबी मिटाने और पर्यावरण बचाने जैसे ग्लोबल लक्ष्यों को हासिल करने में MP की प्रोग्रेस।" },
      { "id": 4, "order": 4, "front": "मध्यप्रदेश में कृषि, उद्योग, एम.एस.एम.ई. एवं अधोसंरचना का विकास", "back": "खेती, छोटे-बड़े कारखाने और सड़कों-पुलों का जाल, जो राज्य की तरक्की का आधार हैं।" },
      { "id": 5, "order": 5, "front": "आत्मनिर्भर मध्यप्रदेश", "back": "MP को अपने पैरों पर खड़ा करने का विजन, ताकि हमें बाहर से मदद की ज़रूरत न पड़े।" },
      { "id": 6, "order": 6, "front": "एक जिला एक उत्पाद (ODOP)", "back": "हर जिले की एक खास पहचान (जैसे रतलाम के सेव या चंदेरी की साड़ी) को ग्लोबल ब्रांड बनाना।" },
      { "id": 7, "order": 7, "front": "मध्यप्रदेश में बौद्धिक संपदा अधिकारों (IPR) की प्रगति", "back": "MP के नए अविष्कारों और लोकल प्रोडक्ट्स (GI Tag) के कानूनी हक़ की सुरक्षा।" },
      { "id": 8, "order": 8, "front": "भारतीय अर्थव्यवस्था की नवीन प्रवृत्तियाँ", "back": "खेती, फैक्ट्रियों और सर्विस सेक्टर (IT, बैंकिंग) में आ रहे नए बदलाव और ट्रेंड्स।" },
      { "id": 9, "order": 9, "front": "वित्तीय संस्थाएँ: रिजर्व बैंक, वाणिज्यिक बैंक", "back": "बैंकों का सिस्टम—पैसों का लेन-देन संभालने वाले छोटे बैंक और सबका बॉस RBI।" },
      { "id": 10, "order": 10, "front": "सेबी (SEBI), गैर बैंकिंग वित्तीय संस्थाएँ", "back": "शेयर बाज़ार की रखवाली करने वाली संस्था और वो कंपनियाँ जो बैंक नहीं हैं पर लोन देती हैं।" },
      { "id": 11, "order": 11, "front": "भारत की विदेशी व्यापार की नीतियाँ", "back": "दुनिया के दूसरे देशों के साथ सामान बेचने (Export) और खरीदने (Import) के सरकारी नियम।" },
      { "id": 12, "order": 12, "front": "जी-20 (G-20), सार्क (SAARC) तथा एशियन (ASEAN)", "back": "दुनिया के बड़े देशों के वो ग्रुप्स जहाँ भारत व्यापार और शांति की चर्चा करता है।" }
    ],
     "topics_en": [
      { "id": 1, "order": 1, "front": "Current Position of MP in Indian Economy", "back": "The state's share in national GDP and its contribution to India's overall growth story." },
      { "id": 2, "order": 2, "front": "Development of Human Resources in MP", "back": "Focus on education, health, and skill development to turn MP's population into a productive workforce." },
      { "id": 3, "order": 3, "front": "Progress of MP in Sustainable Development Goals (SDG)", "back": "The state's roadmap and achievements in meeting global targets like ending poverty and protecting the planet." },
      { "id": 4, "order": 4, "front": "Development of Agriculture, Industry, MSME & Infrastructure", "back": "The backbone of MP—how farms, small businesses, and roads/power are driving state wealth." },
      { "id": 5, "order": 5, "front": "Self-Reliant Madhya Pradesh (Atmanirbhar MP)", "back": "The vision to make the state self-sufficient and a leader in local manufacturing and services." },
      { "id": 6, "order": 6, "front": "One District One Product (ODOP)", "back": "A strategy to promote a unique local product from each district (like Ratlami Sev) as a global brand." },
      { "id": 7, "order": 7, "front": "Intellectual Property Rights (IPR) in MP", "back": "Protecting legal rights for local innovations and traditional products (like GI Tags)." },
      { "id": 8, "order": 8, "front": "New Trends in Indian Economy", "back": "Modern shifts in agriculture, manufacturing, and the fast-growing service sector (IT, Finance)." },
      { "id": 9, "order": 9, "front": "Financial Institutions: RBI & Commercial Banks", "back": "The banking ecosystem—how money flows, and the role of RBI as the 'Banker to the Banks'." },
      { "id": 10, "order": 10, "front": "SEBI and Non-Banking Financial Companies (NBFC)", "back": "The watchdogs of the stock market and companies that provide loans without being traditional banks." },
      { "id": 11, "order": 11, "front": "India's Foreign Trade Policy", "back": "The rules and strategies for buying (Import) and selling (Export) goods with other countries." },
      { "id": 12, "order": 12, "front": "International Groups: G-20, SAARC, ASEAN", "back": "Global platforms where India collaborates for better trade, security, and economic ties." }
    ]
    },

    "unit_7": {
      "title": "विज्ञान, पर्यावरण एवं स्वास्थ्य",
      "title_en": "Science, Environment and Health",
     "topics": [
      { "id": 1, "order": 1, "front": "विज्ञान की प्रमुख शाखाओं का प्रारंभिक ज्ञान", "back": "Physics, Chemistry और Biology के वो बेसिक नियम जो हमारे रोज़ाना के जीवन में काम आते हैं।" },
      { "id": 2, "order": 2, "front": "भारत के प्रमुख वैज्ञानिक संस्थान एवं उनकी उपलब्धियाँ", "back": "ISRO, DRDO और CSIR जैसे संस्थान जिन्होंने भारत को विज्ञान की दुनिया में सरताज बनाया।" },
      { "id": 3, "order": 3, "front": "उपग्रह एवं अंतरिक्ष प्रौद्योगिकी", "back": "आसमान में तैरते हमारे सैटेलाइट्स और वो रॉकेट जो हमें तारों तक ले जाते हैं।" },
      { "id": 4, "order": 4, "front": "मानव शरीर संरचना", "back": "हड्डियों से लेकर दिल की धड़कन तक—इंसानी शरीर की अद्भुत मशीन कैसे काम करती है।" },
      { "id": 5, "order": 5, "front": "पोषण, आहार, पोषक तत्व एवं कुपोषण", "back": "क्या खाने से शरीर बनता है और खाने की कमी से होने वाली बीमारियाँ।" },
      { "id": 6, "order": 6, "front": "अनुवांशिक रोग: सिकल सेल एनीमिया", "back": "वो बीमारियाँ जो खून के जरिए पीढ़ियों तक पहुँचती हैं और उनका इलाज।" },
      { "id": 7, "order": 7, "front": "स्वास्थ्य नीति एवं कार्यक्रम", "back": "सरकार की वो योजनाएं जो देश के हर नागरिक को सस्ता और अच्छा इलाज देने के लिए बनी हैं।" },
      { "id": 8, "order": 8, "front": "संक्रामक रोग, उनकी रोकथाम एवं स्वास्थ्य सूचक", "back": "फैलने वाली बीमारियाँ, उनसे बचने के तरीके और ये जाँचना कि देश कितना स्वस्थ है।" },
      { "id": 9, "order": 9, "front": "सतत् विकास की अवधारणा एवं एस.डी.जी. (SDG)", "back": "ऐसा विकास जो आज की ज़रूरतें पूरी करे और भविष्य की पीढ़ी के लिए भी संसाधन बचाए।" },
      { "id": 10, "order": 10, "front": "पर्यावरणीय कारक, पारिस्थितिकीय तंत्र एवं जैव-विविधता", "back": "प्रकृति का वो जाल जहाँ जीव-जंतु और इंसान एक-दूसरे पर निर्भर रहते हैं।" },
      { "id": 11, "order": 11, "front": "प्रदूषण, प्राकृतिक आपदाएँ एवं प्रबंधन", "back": "गंदी हवा-पानी की समस्या और बाढ़-भूकंप जैसे खतरों से बचने का तरीका।" }
    ],
     "topics_en": [
      { "id": 1, "order": 1, "front": "Basic Knowledge of Science Branches", "back": "The fundamental principles of Physics, Chemistry, and Biology that we see in everyday life." },
      { "id": 2, "order": 2, "front": "Major Scientific Institutions of India", "back": "Pride of India—institutions like ISRO, DRDO, and BARC and their world-class achievements." },
      { "id": 3, "order": 3, "front": "Satellite and Space Technology", "back": "How rockets work and how satellites in space provide us with GPS, TV, and weather data." },
      { "id": 4, "order": 4, "front": "Human Body Structure", "back": "The incredible machinery of the human body—from the skeleton to the nervous system." },
      { "id": 5, "order": 5, "front": "Nutrition, Diet and Nutrients", "back": "The fuel for our body—understanding vitamins, minerals, and the impact of malnutrition." },
      { "id": 6, "order": 6, "front": "Genetic Diseases: Sickle Cell Anemia", "back": "Inherited blood disorders, their biological causes, and how they are managed/prevented." },
      { "id": 7, "order": 7, "front": "Health Policy and Programs", "back": "Government initiatives to provide affordable healthcare and eradicate diseases across India." },
      { "id": 8, "order": 8, "front": "Infectious Diseases and Prevention", "back": "How germs spread, how to stop them, and the indicators that measure a nation's health." },
      { "id": 9, "order": 9, "front": "Concept of Sustainable Development and SDGs", "back": "Meeting the needs of the present without compromising the ability of future generations to meet theirs." },
      { "id": 10, "order": 10, "front": "Environment, Ecosystem and Biodiversity", "back": "The complex web of life where plants, animals, and humans depend on each other for survival." },
      { "id": 11, "order": 11, "front": "Pollution and Natural Disaster Management", "back": "The threat of environmental damage and strategies to handle floods, earthquakes, and cyclones." }
    ]
    },

    "unit_8": {
      "title": "अंतर्राष्ट्रीय, राष्ट्रीय एवं म.प्र. की समसामयिक घटनाएँ",
      "title_en": "Current Affairs (Intl, National, MP)",
    "topics": [
      { "id": 1, "order": 1, "front": "अंतर्राष्ट्रीय समसामयिक घटनाएँ", "back": "पूरी दुनिया में होने वाली बड़ी हलचलें, समझौते और वर्ल्ड लीडर्स के बीच की चर्चाएं।" },
      { "id": 2, "order": 2, "front": "राष्ट्रीय समसामयिक घटनाएँ", "back": "हमारे देश में आज क्या नया हो रहा है—नई योजनाएं, कानून और बड़ी खबरें।" },
      { "id": 3, "order": 3, "front": "मध्यप्रदेश की समसामयिक घटनाएँ", "back": "हमारे अपने राज्य की ताज़ा खबरें, सरकारी फैसले और MP का गौरव बढ़ाने वाली बातें।" }
    ],
      "topics_en": [
      { 
        "id": 1, "order": 1, 
        "front": "International Current Events", 
        "back": "Major global happenings, international summits, and shifting diplomatic relations between world powers." 
      },
      { 
        "id": 2, "order": 2, 
        "front": "National Current Events", 
        "back": "Key developments across India, including new government schemes, legal landmark decisions, and national achievements." 
      },
      { 
        "id": 3, "order": 3, 
        "front": "Current Events of Madhya Pradesh", 
        "back": "Latest news and policy decisions from our own state, highlighting MP's growth and local milestones." 
      }
    ]
    },

    "unit_9": {
      "title": "सूचना एवं संचार प्रौद्योगिकी",
      "title_en": "Information and Communication Technology",
    "topics": [
      { "id": 1, "order": 1, "front": "कंप्यूटर का आधारभूत ज्ञान", "back": "कंप्यूटर कैसे काम करता है—हार्डवेयर, सॉफ्टवेयर और ऑपरेटिंग सिस्टम की बेसिक जानकारी।" },
      { "id": 2, "order": 2, "front": "इलेक्ट्रॉनिकी (Electronics)", "back": "सेमीकंडक्टर, चिप्स और वो तकनीक जिससे हमारे मोबाइल और गैजेट्स चलते हैं।" },
      { "id": 3, "order": 3, "front": "सूचना एवं संचार प्रौद्योगिकी", "back": "डाटा भेजने और बातचीत करने के आधुनिक तरीके, जैसे टेलीकॉम और नेटवर्क।" },
      { "id": 4, "order": 4, "front": "रोबोटिक्स (Robotics)", "back": "इंसानों की तरह काम करने वाली मशीनें और उनकी बनावट व उपयोग।" },
      { "id": 5, "order": 5, "front": "आर्टिफिशियल इंटेलिजेंस (AI)", "back": "मशीनों का इंसानी दिमाग की तरह सोचना और फैसले लेना, जैसे चैटबॉट्स और ऑटोमेशन।" },
      { "id": 6, "order": 6, "front": "साइबर सिक्योरिटी", "back": "इंटरनेट की दुनिया में हैकर्स से बचने और अपने डाटा को सुरक्षित रखने के तरीके।" },
      { "id": 7, "order": 7, "front": "ई-गवर्नेंस", "back": "सरकारी सुविधाओं का डिजिटल होना, ताकि जनता को घर बैठे सरकारी सेवाएँ मिल सकें।" },
      { "id": 8, "order": 8, "front": "इंटरनेट तथा सोशल नेटवर्किंग प्लेटफॉर्म्स", "back": "फेसबुक, एक्स (Twitter) और इंस्टाग्राम जैसे प्लेटफॉर्म्स और इंटरनेट का जाल।" }
    ],
     "topics_en": [
      { 
        "id": 1, "order": 1, 
        "front": "Basic Knowledge of Computer", 
        "back": "Understanding how computers work—including hardware, software systems, and basic operating principles." 
      },
      { 
        "id": 2, "order": 2, 
        "front": "Electronics, Information and Communication Technology", 
        "back": "The science of circuits, semiconductors, and the tech behind modern digital communication." 
      },
      { 
        "id": 3, "order": 3, 
        "front": "Robotics", 
        "back": "The design and use of automated machines programmed to perform tasks traditionally done by humans." 
      },
      { 
        "id": 4, "order": 4, 
        "front": "Artificial Intelligence (AI)", 
        "back": "Smart machines that can learn, reason, and solve problems like a human brain—shaping the future of tech." 
      },
      { 
        "id": 5, "order": 5, 
        "front": "Cyber Security", 
        "back": "Strategies and tools used to protect digital data from hackers and online threats." 
      },
      { 
        "id": 6, "order": 6, 
        "front": "E-Governance", 
        "back": "The use of digital platforms by the government to provide fast and transparent services to citizens." 
      },
      { 
        "id": 7, "order": 7, 
        "front": "Internet and Social Networking Platforms", 
        "back": "The global web of connectivity and platforms like X, LinkedIn, and Facebook that redefine communication." 
      }
    ]
    },

    "unit_10": {
       "title": "मध्यप्रदेश की जनजातियाँ",
       "title_en": "Tribes of Madhya Pradesh",
      "topics": [
      { "id": 1, "order": 1, "front": "मध्यप्रदेश में जनजातियों का भौगोलिक विस्तार", "back": "MP के नक्शे पर कौन सी जनजाति (भील, गोंड, कोरकू आदि) कहाँ बसी है।" },
      { "id": 2, "order": 2, "front": "जनजातियों से संबंधित संवैधानिक प्रावधान", "back": "संविधान के वो कानून और आर्टिकल्स जो आदिवासियों के अधिकारों की रक्षा करते हैं।" },
      { "id": 3, "order": 3, "front": "मध्यप्रदेश की प्रमुख जनजातियाँ", "back": "राज्य की सबसे बड़ी और प्रभावशाली जनजातियों का विस्तृत परिचय।" },
      { "id": 4, "order": 4, "front": "विशेष पिछड़ी जनजातियाँ (PVTG)", "back": "बैगा, भारिया और सहरिया जैसी वो जनजातियाँ जिन्हें विशेष मदद और सुरक्षा की ज़रूरत है।" },
      { "id": 5, "order": 5, "front": "घुमन्तू जातियाँ", "back": "वो समाज जो एक जगह टिकने के बजाय अपनी संस्कृति के साथ एक जगह से दूसरी जगह प्रवास करते हैं।" },
      { "id": 6, "order": 6, "front": "जनजातियों के कल्याण के लिए योजनाएँ", "back": "सरकार द्वारा चलाई जा रही वो स्कीम्स जो आदिवासियों के जीवन को बेहतर बना रही हैं।" },
      { "id": 7, "order": 7, "front": "जनजातीय संस्कृति: परम्पराएँ, विशिष्ट कलाएँ", "back": "उनके अनोखे रीति-रिवाज, टैटू (गूदना) और हाथों से बनी कलाकृतियाँ।" },
      { "id": 8, "order": 8, "front": "जनजातीय त्योहार, उत्सव, भाषा और बोली", "back": "भगोरिया जैसे मेले और उनकी अपनी मीठी बोलियाँ जो हमारी संस्कृति की जड़ें हैं।" },
      { "id": 9, "order": 9, "front": "जनजातीय साहित्य", "back": "आदिवासी समाज की वो लोककथाएं और गीत जो मौखिक रूप से पीढ़ियों से चले आ रहे हैं।" },
      { "id": 10, "order": 10, "front": "भारत के स्वतंत्रता आंदोलन में जनजातियों का योगदान", "back": "अंग्रेजों के खिलाफ लड़ाई में आदिवासी क्रांतिकारियों के बलिदान की दास्तान।" },
      { "id": 11, "order": 11, "front": "मध्यप्रदेश के प्रमुख जनजातीय व्यक्तित्व", "back": "टंट्या मामा, भीमा नायक और गुंडाधुर जैसे नायक जिन्होंने झुकना नहीं सीखा।" },
      { "id": 12, "order": 12, "front": "जनजातियों से संबंधित प्रमुख संस्थान, संग्रहालय, प्रकाशन", "back": "आदिवासी संस्कृति को सहेजने वाले म्यूजियम और उनसे जुड़ी किताबें।" },
      { "id": 13, "order": 13, "front": "मध्यप्रदेश की लोक संस्कृति एवं लोक साहित्य", "back": "पूरे राज्य की साझा संस्कृति, लोकगीत और वो कहानियाँ जो हमें एक सूत्र में पिरोती हैं।" }
    ],
      "topics_en": [
      { 
        "id": 1, "order": 1, 
        "front": "Geographical Distribution and Constitutional Provisions", 
        "back": "Where different tribes live across MP and the legal laws in the Constitution that protect their rights." 
      },
      { 
        "id": 2, "order": 2, 
        "front": "Particularly Vulnerable Tribal Groups (PVTG)", 
        "back": "Special focus on the Baiga, Bharia, and Sahariya tribes who need extra protection and care." 
      },
      { 
        "id": 3, "order": 3, 
        "front": "Tribal Welfare Programs", 
        "back": "Government initiatives and schemes specifically designed to improve the lives and livelihood of tribal communities." 
      },
      { 
        "id": 4, "order": 4, 
        "front": "Tribal Culture: Customs, Traditions, and Special Arts", 
        "back": "The rich lifestyle of tribes, including their unique marriage rituals, tattoos (Godna), and handcrafted arts." 
      },
      { 
        "id": 5, "order": 5, 
        "front": "Festivals, Dialects, and Literature", 
        "back": "Vibrant celebrations like Bhagoria, their native tongues, and stories passed down through generations." 
      },
      { 
        "id": 6, "order": 6, 
        "front": "Contribution to the Freedom Movement", 
        "back": "The heroic struggle of tribal warriors who fought bravely against British rule for their land and pride." 
      },
      { 
        "id": 7, "order": 7, 
        "front": "Tribal Personalities of Madhya Pradesh", 
        "back": "Icons like Tantya Bhil and Rani Durgavati who represent the courage and heritage of our state." 
      },
      { 
        "id": 8, "order": 8, 
        "front": "Tribal Institutes, Museums and Publications", 
        "back": "Centers that preserve tribal history and the books that document their ancient wisdom." 
      },
      { 
        "id": 9, "order": 9, 
        "front": "Folk Culture and Literature of Madhya Pradesh", 
        "back": "The overall shared folk traditions, songs, and stories that bind the people of MP together." 
      }
    ]
    }
  }
};
