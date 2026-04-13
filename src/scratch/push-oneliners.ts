import { db } from '../db';
import { mppoliceOneLinerFacts } from '../db/schema';
import { nanoid } from 'nanoid';
import { revalidateTag } from 'next/cache';

const DATA = [
  {
    "subjectTag": "General Knowledge",
    "stemHi": "भगवान बुद्ध को ज्ञान की प्राप्ति कहाँ हुई थी?",
    "stemEn": "Where did Lord Buddha attain enlightenment?",
    "answerHi": "बोधगया",
    "answerEn": "Bodh Gaya",
    "importanceScore": 95,
    "extendedData": {
      "facts": ["बोधगया बिहार राज्य में स्थित है।", "ज्ञान पीपल के पेड़ (बोधि वृक्ष) के नीचे मिला था।"],
      "factsEn": ["Located in Bihar.", "Enlightenment attained under the Bodhi (Peepal) tree."],
      "explanationHi": "गौतम बुद्ध ने वर्षों की तपस्या के बाद निरंजना नदी के तट पर ज्ञान प्राप्त किया था।",
      "explanationEn": "Buddha attained enlightenment on the banks of the Niranjana river after rigorous meditation.",
      "memoryTip": "बोध (Knowledge) + गया (Place) = बोधगया।",
      "memoryTipEn": "Bodh means realization/knowledge.",
      "related": ["Buddhism", "Sarnath", "Lumbini"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "आर्य समाज की स्थापना किसने की?",
    "stemEn": "Who founded the Arya Samaj?",
    "answerHi": "स्वामी दयानंद सरस्वती",
    "answerEn": "Swami Dayanand Saraswati",
    "importanceScore": 90,
    "extendedData": {
      "facts": ["स्थापना 1875 में बॉम्बे में हुई।", "इन्होंने 'वेदों की ओर लौटो' का नारा दिया।"],
      "factsEn": ["Founded in 1875 in Bombay.", "Gave the slogan 'Go back to Vedas'."],
      "explanationHi": "हिंदू धर्म में सुधार लाने और वैदिक परंपराओं को पुनर्जीवित करने के लिए आर्य समाज की स्थापना की गई।",
      "explanationEn": "Founded to reform Hinduism and revive the Vedic traditions.",
      "memoryTip": "आर्य (Noble) ज्ञान 'दयानंद' (Compassion+Bliss) से आता है।",
      "memoryTipEn": "Arya (Noble) + Dayanand.",
      "related": ["Brahmo Samaj", "Satyarth Prakash"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "पंजाबी भाषा की लिपि कौनसी है?",
    "stemEn": "What is the script of the Punjabi language?",
    "answerHi": "गुरुमुखी",
    "answerEn": "Gurmukhi",
    "importanceScore": 85,
    "extendedData": {
      "facts": ["गुरुमुखी का अर्थ है 'गुरु के मुख से'।", "इसे दूसरे सिख गुरु, गुरु अंगद देव द्वारा मानकीकृत किया गया था।"],
      "factsEn": ["Means 'from the mouth of the Guru'.", "Standardized by Guru Angad Dev."],
      "explanationHi": "सिखों के धार्मिक ग्रंथ इसी लिपि में लिखे गए हैं।",
      "explanationEn": "Sikh religious texts are predominantly written in this script.",
      "memoryTip": "पंजाब में 'गुरु' का महत्व है, इसलिए लिपि 'गुरुमुखी'।",
      "memoryTipEn": "Gurus speak Punjabi -> Gurmukhi.",
      "related": ["Devanagari", "Sikhism", "Guru Angad Dev"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "भारत की मुख्य भूमि का दक्षिणतम किनारा कौनसा है?",
    "stemEn": "Which is the southernmost point of mainland India?",
    "answerHi": "कन्याकुमारी",
    "answerEn": "Kanyakumari",
    "importanceScore": 88,
    "extendedData": {
      "facts": ["यह तमिलनाडु राज्य में स्थित है।", "यहाँ तीन समुद्र (अरब सागर, बंगाल की खाड़ी, हिंद महासागर) मिलते हैं।"],
      "factsEn": ["Located in Tamil Nadu.", "Confluence of three oceans happens here."],
      "explanationHi": "यह भारतीय प्रायद्वीप का अंतिम दक्षिणी बिंदु है (मुख्य भूमि पर)।",
      "explanationEn": "It is the tip of the Indian peninsula on the mainland.",
      "memoryTip": "भारत माता के चरणों में 'कन्या' (Kanya) निवास करती है।",
      "memoryTipEn": "Mainland ends with a 'Kumari' (girl/goddess).",
      "related": ["Indira Point", "Cape Comorin"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "भारत में सबसे पहले सूर्य किस राज्य में निकलता है?",
    "stemEn": "In which Indian state does the sun rise first?",
    "answerHi": "अरुणाचल प्रदेश",
    "answerEn": "Arunachal Pradesh",
    "importanceScore": 92,
    "extendedData": {
      "facts": ["डोंग घाटी में सबसे पहले सूर्योदय देखा जाता है।", "अरुणाचल का अर्थ ही 'उगते सूर्य की भूमि' है।"],
      "factsEn": ["Dong valley sees the first sunrise.", "Name translates to 'Land of dawn-lit mountains'."],
      "explanationHi": "भारत के सबसे पूर्वी छोर पर स्थित होने के कारण यहाँ सबसे पहले सूर्योदय होता है।",
      "explanationEn": "Being the easternmost state, it receives the first sunlight in India.",
      "memoryTip": "अरुण = सूर्य। इसलिए अरुणाचल में सबसे पहले सूर्य आता है।",
      "memoryTipEn": "Arun means Sun in Hindi.",
      "related": ["Dong Valley", "Easternmost point of India"]
    }
  },
  {
    "subjectTag": "General Science",
    "stemHi": "इंसुलिन का प्रयोग किस बीमारी के उपचार में होता है?",
    "stemEn": "Insulin is used in the treatment of which disease?",
    "answerHi": "मधुमेह (Diabetes)",
    "answerEn": "Diabetes",
    "importanceScore": 95,
    "extendedData": {
      "facts": ["इंसुलिन अग्न्याशय (Pancreas) द्वारा स्रावित होता है।", "यह रक्त शर्करा (Blood Sugar) को नियंत्रित करता है।"],
      "factsEn": ["Secreted by the Pancreas.", "Regulates blood sugar levels."],
      "explanationHi": "मधुमेह के रोगियों में शरीर पर्याप्त इंसुलिन नहीं बनाता है, जिससे रक्त में ग्लूकोज बढ़ जाता है।",
      "explanationEn": "In diabetes, the body doesn't produce enough insulin, leading to high blood glucose.",
      "memoryTip": "Insulin In-serts Sugar into cells.",
      "memoryTipEn": "Insulin IN-serts Sugar into cells.",
      "related": ["Pancreas", "Blood Sugar", "Glucagon"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "बिहू किस राज्य का प्रसिद्ध त्योहार है?",
    "stemEn": "Bihu is a famous festival of which state?",
    "answerHi": "असम",
    "answerEn": "Assam",
    "importanceScore": 89,
    "extendedData": {
      "facts": ["यह एक फसल कटाई का त्योहार है।", "वर्ष में तीन बार (रोंगाली, कंगाली, भोगाली बिहू) मनाया जाता है।"],
      "factsEn": ["It is a harvest festival.", "Celebrated three times a year."],
      "explanationHi": "असमिया नव वर्ष और वसंत के आगमन का प्रतीक है।",
      "explanationEn": "Marks the Assamese New Year and the advent of Spring.",
      "memoryTip": "असम की 'बहू' (Bihu) चाय बनाती है।",
      "memoryTipEn": "Assam tea is served with Bihu dance.",
      "related": ["Rongali Bihu", "Assamese Culture"]
    }
  },
  {
    "subjectTag": "General Science",
    "stemHi": "कौनसा विटामिन आंवले में प्रचुर मात्रा में मिलता है?",
    "stemEn": "Which vitamin is abundantly found in Amla (Gooseberry)?",
    "answerHi": "विटामिन C",
    "answerEn": "Vitamin C",
    "importanceScore": 90,
    "extendedData": {
      "facts": ["विटामिन C का रासायनिक नाम एस्कॉर्बिक एसिड है।", "यह प्रतिरक्षा प्रणाली (Immunity) को मजबूत करता है।"],
      "factsEn": ["Chemical name is Ascorbic Acid.", "Boosts the immune system."],
      "explanationHi": "खट्टे फलों में विटामिन C पाया जाता है, जो स्कर्वी रोग से बचाता है।",
      "explanationEn": "Citrus fruits are rich in Vitamin C, which prevents Scurvy.",
      "memoryTip": "C से खट्टा (Citrus), आंवला खट्टा होता है।",
      "memoryTipEn": "C for Citrus and Colds.",
      "related": ["Scurvy", "Ascorbic Acid"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "भारत का प्रथम गवर्नर जनरल कौन था?",
    "stemEn": "Who was the first Governor-General of India?",
    "answerHi": "विलियम बेंटिक",
    "answerEn": "William Bentinck",
    "importanceScore": 92,
    "extendedData": {
      "facts": ["चार्टर एक्ट 1833 के तहत इन्हें यह पद मिला।", "इन्होंने सती प्रथा (1829) पर प्रतिबंध लगाया था।"],
      "factsEn": ["Appointed under the Charter Act of 1833.", "Abolished the Sati practice in 1829."],
      "explanationHi": "बंगाल के गवर्नर जनरल के पद को बदलकर भारत का गवर्नर जनरल कर दिया गया था।",
      "explanationEn": "The post of Governor-General of Bengal was redesignated as Governor-General of India.",
      "memoryTip": "बेंटिक ने सती प्रथा को 'बैन' (Ban) किया, वही पहले बने।",
      "memoryTipEn": "Bentinck 'Banned' Sati as the first pan-India Governor General.",
      "related": ["Lord Canning", "Sati System", "Charter Act 1833"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "कागज का आविष्कार किस देश में हुआ?",
    "stemEn": "In which country was paper invented?",
    "answerHi": "चीन",
    "answerEn": "China",
    "importanceScore": 80,
    "extendedData": {
      "facts": ["हान राजवंश के दौरान चाई लुन द्वारा आविष्कार किया गया था।", "यह पहले शहतूत की छाल से बनाया गया था।"],
      "factsEn": ["Invented by Cai Lun during the Han Dynasty.", "Originally made from mulberry bark."],
      "explanationHi": "प्राचीन चीन में लेखन के लिए कागज का पहली बार निर्माण और उपयोग किया गया था।",
      "explanationEn": "Paper was first manufactured and used for writing in ancient China.",
      "memoryTip": "चीन (China) = कागज (Paper)।",
      "memoryTipEn": "China -> Cai Lun -> Paper.",
      "related": ["Printing Press", "Cai Lun"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "गौतम बुद्ध का बचपन का नाम क्या था?",
    "stemEn": "What was the childhood name of Gautam Buddha?",
    "answerHi": "सिद्धार्थ",
    "answerEn": "Siddhartha",
    "importanceScore": 88,
    "extendedData": {
      "facts": ["उनके पिता का नाम शुद्धोधन और माता का नाम मायादेवी था।", "उनका जन्म लुंबिनी (नेपाल) में हुआ था।"],
      "factsEn": ["Father was Suddhodana, Mother was Mayadevi.", "Born in Lumbini, Nepal."],
      "explanationHi": "ज्ञान प्राप्ति से पहले उन्हें राजकुमार सिद्धार्थ के नाम से जाना जाता था।",
      "explanationEn": "Before attaining enlightenment, he was known as Prince Siddhartha.",
      "memoryTip": "जिसका लक्ष्य (अर्थ) सिद्ध हो गया हो = सिद्धार्थ।",
      "memoryTipEn": "Siddhartha means 'he who has attained his goals'.",
      "related": ["Buddhism", "Mahamaya", "Suddhodana"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "भारत में सशस्त्र बलों का सर्वोच्च सेनापति कौन होता है?",
    "stemEn": "Who is the Supreme Commander of the Armed Forces in India?",
    "answerHi": "राष्ट्रपति",
    "answerEn": "President",
    "importanceScore": 95,
    "extendedData": {
      "facts": ["संविधान के अनुच्छेद 53(2) के तहत यह अधिकार दिया गया है।", "तीनों सेनाओं के प्रमुख राष्ट्रपति को रिपोर्ट करते हैं।"],
      "factsEn": ["Mandated by Article 53(2) of the Constitution.", "All three service chiefs report to the President."],
      "explanationHi": "भारत के राष्ट्रपति थल सेना, नौसेना और वायु सेना के औपचारिक प्रमुख होते हैं।",
      "explanationEn": "The President of India is the formal head of the Army, Navy, and Air Force.",
      "memoryTip": "देश का 'प्रथम नागरिक' ही सेना का 'सर्वोच्च' होगा।",
      "memoryTipEn": "First Citizen = Supreme Commander.",
      "related": ["Chief of Defence Staff", "Article 53"]
    }
  },
  {
    "subjectTag": "General Science",
    "stemHi": "रतौंधी किस विटामिन की कमी से होती है?",
    "stemEn": "Night blindness is caused by the deficiency of which vitamin?",
    "answerHi": "विटामिन A",
    "answerEn": "Vitamin A",
    "importanceScore": 94,
    "extendedData": {
      "facts": ["विटामिन A का रासायनिक नाम रेटिनॉल (Retinol) hai।", "गाजर और हरी पत्तेदार सब्जियां इसके अच्छे स्रोत हैं।"],
      "factsEn": ["Chemical name is Retinol.", "Carrots and leafy greens are good sources."],
      "explanationHi": "विटामिन ए आंखों के रेटिना को स्वस्थ रखने के लिए आवश्यक है।",
      "explanationEn": "Vitamin A is essential for keeping the retina of the eyes healthy.",
      "memoryTip": "A से आँख (Eye) की बीमारी रतौंधी।",
      "memoryTipEn": "Vitamin A for 'A'mazing Vision.",
      "related": ["Retinol", "Carrot", "Vision"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "पोंगल किस राज्य का त्योहार है?",
    "stemEn": "Pongal is a festival of which state?",
    "answerHi": "तमिलनाडु",
    "answerEn": "Tamil Nadu",
    "importanceScore": 87,
    "extendedData": {
      "facts": ["यह चार दिनों तक चलने वाला फसल उत्सव है।", "मुख्य रूप से सूर्य देवता को समर्पित है।"],
      "factsEn": ["A four-day harvest festival.", "Primarily dedicated to the Sun God."],
      "explanationHi": "मकर संक्रांति के समय तमिलनाडु में अच्छी फसल के लिए यह पर्व मनाया जाता है।",
      "explanationEn": "Celebrated in Tamil Nadu during Makar Sankranti for a good harvest.",
      "memoryTip": "तमिलनाडु में पोंगल खाया जाता है।",
      "memoryTipEn": "Pongal is both a dish and a festival in TN.",
      "related": ["Jallikattu", "Makar Sankranti", "Onam"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "गिद्धा और भंगड़ा किस राज्य के लोक नृत्य हैं?",
    "stemEn": "Giddha and Bhangra are folk dances of which state?",
    "answerHi": "पंजाब",
    "answerEn": "Punjab",
    "importanceScore": 85,
    "extendedData": {
      "facts": ["भंगड़ा पुरुषों द्वारा किया जाता है।", "गिद्धा विशेष रूप से महिलाओं का लोक नृत्य है।"],
      "factsEn": ["Bhangra is performed by men.", "Giddha is specifically a women's folk dance."],
      "explanationHi": "ये नृत्य मुख्य रूप से बैसाखी के त्योहार और फसल कटाई के दौरान किए जाते हैं।",
      "explanationEn": "These dances are mainly performed during the Baisakhi festival and harvest season.",
      "memoryTip": "पंजाब की ऊर्जा भंगड़ा और गिद्धा में दिखती है।",
      "memoryTipEn": "Bhangra beats belong to Punjab.",
      "related": ["Baisakhi", "Folk Dances of India"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "टेलीविजन का आविष्कार किसने किया?",
    "stemEn": "Who invented the television?",
    "answerHi": "जॉन लोगी बेयर्ड",
    "answerEn": "John Logie Baird",
    "importanceScore": 82,
    "extendedData": {
      "facts": ["इन्होंने 1925 में मैकेनिकल टेलीविजन का प्रदर्शन किया था।", "ये स्कॉटलैंड के इंजीनियर थे।"],
      "factsEn": ["Demonstrated mechanical television in 1925.", "He was a Scottish engineer."],
      "explanationHi": "उन्होंने पहली बार चलती हुई छवियों को प्रसारित करने में सफलता प्राप्त की थी।",
      "explanationEn": "He successfully transmitted moving images for the first time.",
      "memoryTip": "टीव्ही पर हम 'बर्ड' (Baird) देखते हैं।",
      "memoryTipEn": "Baird broadcasted the first TV pictures.",
      "related": ["Inventions", "Radio transmission"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "भारत की पहली महिला शासिका कौन थी?",
    "stemEn": "Who was the first female ruler of India?",
    "answerHi": "रजिया सुल्तान",
    "answerEn": "Razia Sultana",
    "importanceScore": 92,
    "extendedData": {
      "facts": ["वह इल्तुतमिश की पुत्री थी।", "उन्होंने 1236 से 1240 तक दिल्ली पर शासन किया।"],
      "factsEn": ["She was the daughter of Iltutmish.", "Ruled Delhi from 1236 to 1240."],
      "explanationHi": "वह दिल्ली सल्तनत (गुलाम वंश) की एकमात्र महिला शासिका थीं।",
      "explanationEn": "She was the only female ruler of the Delhi Sultanate (Slave Dynasty).",
      "memoryTip": "दिल्ली पर 'राज' करने वाली पहली महिला 'रजिया'।",
      "memoryTipEn": "Razia Ruled Royalty.",
      "related": ["Delhi Sultanate", "Slave Dynasty", "Iltutmish"]
    }
  },
  {
    "subjectTag": "General Science",
    "stemHi": "मछली किसकी सहायता से सांस लेती है?",
    "stemEn": "With whose help does a fish breathe?",
    "answerHi": "गलफड़ों (Gills)",
    "answerEn": "Gills",
    "importanceScore": 80,
    "extendedData": {
      "facts": ["गलफड़े पानी में घुली हुई ऑक्सीजन को सोख लेते हैं।", "पानी मुंह से अंदर जाता है और गलफड़ों से बाहर आता है।"],
      "factsEn": ["Gills absorb dissolved oxygen from water.", "Water enters the mouth and exits through gills."],
      "explanationHi": "गलफड़ों में रक्त वाहिकाएं होती हैं जो सीधे ऑक्सीजन ग्रहण करती हैं और कार्बन डाइऑक्साइड छोड़ती हैं।",
      "explanationEn": "Blood vessels in the gills absorb oxygen directly and release carbon dioxide.",
      "memoryTip": "गले में 'गलफड़े' पानी छानते हैं।",
      "memoryTipEn": "Gills Filter dissolved oxygen.",
      "related": ["Aquatic Respiration", "Lungs"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "'इंकलाब जिंदाबाद' का नारा किसने दिया?",
    "stemEn": "Who gave the slogan 'Inquilab Zindabad'?",
    "answerHi": "भगत सिंह",
    "answerEn": "Bhagat Singh",
    "importanceScore": 96,
    "extendedData": {
      "facts": ["मूल रूप से इसे हसरत मोहानी ने लिखा था, लेकिन भगत सिंह ने इसे लोकप्रिय बनाया।", "इसका अर्थ है 'क्रांति अमर रहे'।"],
      "factsEn": ["Originally coined by Hasrat Mohani, popularized by Bhagat Singh.", "Means 'Long live the revolution'."],
      "explanationHi": "सेंट्रल असेंबली में बम फेंकने के बाद भगत सिंह और बटुकेश्वर दत्त ने यह नारा लगाया था।",
      "explanationEn": "Shouted by Bhagat Singh and Batukeshwar Dutt after bombing the Central Assembly.",
      "memoryTip": "क्रांति (Inquilab) के प्रतीक भगत सिंह।",
      "memoryTipEn": "Bhagat Singh popularized Revolution (Inquilab).",
      "related": ["Hasrat Mohani", "Indian Freedom Struggle"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "जलियांवाला बाग हत्याकांड कब व कहाँ हुआ?",
    "stemEn": "When and where did the Jallianwala Bagh massacre take place?",
    "answerHi": "1919 ई., अमृतसर",
    "answerEn": "1919, Amritsar",
    "importanceScore": 98,
    "extendedData": {
      "facts": ["यह 13 अप्रैल 1919 को बैसाखी के दिन हुआ था।", "जनरल डायर ने निहत्थी भीड़ पर गोलियां चलवाई थीं।"],
      "factsEn": ["Happened on 13 April 1919 (Baisakhi day).", "General Dyer ordered firing on an unarmed crowd."],
      "explanationHi": "लोग रॉलेट एक्ट और दो नेताओं (सत्यपाल और सैफुद्दीन किचलू) की गिरफ्तारी का विरोध करने जमा हुए थे।",
      "explanationEn": "People gathered to protest the Rowlatt Act and the arrest of two leaders.",
      "memoryTip": "13 अप्रैल 1919 को अमृतसर खून से रंग गया।",
      "memoryTipEn": "1919 Amritsar Massacre.",
      "related": ["Rowlatt Act", "General Dyer", "Udham Singh"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "1939 ई. में कांग्रेस छोड़ने के बाद सुभाषचंद्र बोस ने किस दल की स्थापना की?",
    "stemEn": "Which party was founded by Subhash Chandra Bose after leaving Congress in 1939?",
    "answerHi": "फॉरवर्ड ब्लॉक",
    "answerEn": "Forward Bloc",
    "importanceScore": 93,
    "extendedData": {
      "facts": ["इसकी स्थापना वामपंथी विचारधारा को संगठित करने के लिए की गई थी।", "गांधीजी के साथ वैचारिक मतभेद के कारण उन्होंने कांग्रेस छोड़ी।"],
      "factsEn": ["Founded to consolidate the left-wing ideology.", "He left Congress due to ideological differences with Gandhi."],
      "explanationHi": "त्रिपुरी अधिवेशन के बाद बोस ने अध्यक्ष पद से इस्तीफा दिया और ऑल इंडिया फॉरवर्ड ब्लॉक बनाया।",
      "explanationEn": "After the Tripuri session, Bose resigned and formed the All India Forward Bloc.",
      "memoryTip": "बोस हमेशा 'फॉरवर्ड' (आगे) सोचते थे।",
      "memoryTipEn": "Bose moved 'Forward' out of Congress.",
      "related": ["Tripuri Session", "Pattabhi Sitaramayya", "INA"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "'पंजाब केसरी' किसे कहा जाता है?",
    "stemEn": "Who is known as 'Punjab Kesari'?",
    "answerHi": "लाला लाजपत राय",
    "answerEn": "Lala Lajpat Rai",
    "importanceScore": 91,
    "extendedData": {
      "facts": ["वे 'लाल-बाल-पाल' की तिकड़ी के सदस्य थे।", "साइमन कमीशन का विरोध करते हुए लाठीचार्ज में वे घायल हुए थे।"],
      "factsEn": ["Part of the 'Lal-Bal-Pal' trio.", "Injured in a lathi charge while protesting the Simon Commission."],
      "explanationHi": "उनके साहस और पंजाब के प्रति योगदान के कारण उन्हें शेर-ए-पंजाब या पंजाब केसरी कहा गया।",
      "explanationEn": "Known as the Lion of Punjab for his bravery and contribution.",
      "memoryTip": "पंजाब का 'शेर' (केसरी) = लाला जी।",
      "memoryTipEn": "Kesari means Lion -> Lion of Punjab.",
      "related": ["Simon Commission", "Lal Bal Pal"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "सांडर्स की हत्या किसने की थी?",
    "stemEn": "Who assassinated Saunders?",
    "answerHi": "भगत सिंह",
    "answerEn": "Bhagat Singh",
    "importanceScore": 88,
    "extendedData": {
      "facts": ["लाला लाजपत राय की मौत का बदला लेने के लिए हत्या की गई।", "दिसंबर 1928 में लाहौर में हत्या की गई।"],
      "factsEn": ["Assassinated to avenge the death of Lala Lajpat Rai.", "Killed in Lahore in December 1928."],
      "explanationHi": "भगत सिंह, राजगुरु और चंद्रशेखर आजाद ने जेम्स ए. स्कॉट को मारने की योजना बनाई थी, लेकिन गलती से जॉन पी. सांडर्स को मार दिया।",
      "explanationEn": "They intended to kill James A. Scott but mistakenly shot John P. Saunders.",
      "memoryTip": "लाला जी के लाठीचार्ज का बदला सांडर्स को मारकर लिया गया।",
      "memoryTipEn": "Revenge for Lala Lajpat Rai.",
      "related": ["Lala Lajpat Rai", "Rajguru", "Chandrashekhar Azad"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "1857 ई. के विद्रोह में किसने अपना बलिदान सबसे पहले दिया?",
    "stemEn": "Who gave his sacrifice first in the revolt of 1857?",
    "answerHi": "मंगल पांडे",
    "answerEn": "Mangal Pandey",
    "importanceScore": 95,
    "extendedData": {
      "facts": ["वे बैरकपुर छावनी (बंगाल) में 34वीं बंगाल नेटिव इन्फैंट्री के सिपाही थे।", "उन्हें 8 अप्रैल 1857 को फाँसी दी गई।"],
      "factsEn": ["Sepoy in the 34th Bengal Native Infantry at Barrackpore.", "Hanged on 8 April 1857."],
      "explanationHi": "उन्होंने गाय और सूअर की चर्बी वाले कारतूसों का उपयोग करने से मना कर दिया और ब्रिटिश अधिकारियों पर हमला किया।",
      "explanationEn": "He refused to use greased cartridges and attacked British officers.",
      "memoryTip": "1857 का 'मंगल' (आरंभ) मंगल पांडे से हुआ।",
      "memoryTipEn": "First spark of 1857 was Mangal.",
      "related": ["Revolt of 1857", "Barrackpore Mutiny"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "भारत की पहली महिला राज्यपाल कौन थी?",
    "stemEn": "Who was the first female Governor of India?",
    "answerHi": "सरोजिनी नायडु",
    "answerEn": "Sarojini Naidu",
    "importanceScore": 94,
    "extendedData": {
      "facts": ["वह उत्तर प्रदेश (संयुक्त प्रांत) की राज्यपाल बनी थीं।", "इन्हें 'भारत कोकिला' (Nightingale of India) भी कहा जाता है।"],
      "factsEn": ["Became Governor of United Provinces (UP).", "Known as the Nightingale of India."],
      "explanationHi": "वह 1947 में भारत की स्वतंत्रता के बाद किसी राज्य की राज्यपाल बनने वाली पहली महिला थीं।",
      "explanationEn": "She became the first woman to hold the governor's office in independent India in 1947.",
      "memoryTip": "राज्यपाल का 'ताज' पहली बार 'कोकिला' सरोजिनी को मिला।",
      "memoryTipEn": "Nightingale of India became the first Governor.",
      "related": ["Sucheta Kriplani", "Nightingale of India"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "माउन्ट एवेरेस्ट पर दो बार चढ़ने वाली पहली महिला कौन थी?",
    "stemEn": "Who was the first woman to climb Mount Everest twice?",
    "answerHi": "संतोष यादव",
    "answerEn": "Santosh Yadav",
    "importanceScore": 90,
    "extendedData": {
      "facts": ["उन्होंने 1992 और 1993 में एवरेस्ट फतह किया।", "कंगशुंग फेस से एवरेस्ट पर चढ़ने वाली पहली महिला।"],
      "factsEn": ["Summited in 1992 and 1993.", "First woman to climb Everest from the Kangshung face."],
      "explanationHi": "वह लगातार दो बार विश्व की सबसे ऊंची चोटी पर चढ़ने वाली पहली महिला बनीं।",
      "explanationEn": "First woman globally to reach the summit twice continuously.",
      "memoryTip": "एक बार चढ़कर 'संतोष' नहीं हुआ, इसलिए दो बार चढ़ीं संतोष यादव।",
      "memoryTipEn": "Santosh wasn't 'satisfied' with just one climb.",
      "related": ["Bachendri Pal", "Mount Everest"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "'ब्रह्म समाज' की स्थापना किसके द्वारा की गई?",
    "stemEn": "Who founded the 'Brahmo Samaj'?",
    "answerHi": "राजा राममोहन राय",
    "answerEn": "Raja Ram Mohan Roy",
    "importanceScore": 96,
    "extendedData": {
      "facts": ["1828 में कलकत्ता में स्थापना हुई।", "इन्होंने सती प्रथा के खिलाफ बड़ा आंदोलन चलाया।"],
      "factsEn": ["Founded in 1828 in Calcutta.", "Campaigned heavily against the Sati system."],
      "explanationHi": "ब्रह्म समाज ने मूर्ति पूजा, जाति व्यवस्था और अन्य कुरीतियों का विरोध किया।",
      "explanationEn": "Brahmo Samaj opposed idol worship, the caste system, and social evils.",
      "memoryTip": "राम और मोहन ने मिलकर 'ब्रह्म' का ज्ञान दिया।",
      "memoryTipEn": "Raja Ram reformed the Brahmo way.",
      "related": ["Atmiya Sabha", "Sati System", "Indian Renaissance"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "स्वामी दयानंद सरस्वती का मूल नाम क्या था?",
    "stemEn": "What was the original name of Swami Dayanand Saraswati?",
    "answerHi": "मूलशंकर",
    "answerEn": "Moolshankar",
    "importanceScore": 86,
    "extendedData": {
      "facts": ["उनका जन्म गुजरात के मोरबी में हुआ था।", "वे आर्य समाज के संस्थापक थे।"],
      "factsEn": ["Born in Morbi, Gujarat.", "Founder of Arya Samaj."],
      "explanationHi": "उनके 'मूल' नाम से ही पता चलता है कि वे वैदिक जड़ों (मूल) की ओर लौटना चाहते थे।",
      "explanationEn": "He wanted to go back to the 'roots' (Vedas).",
      "memoryTip": "दयानंद का 'मूल' नाम 'मूलशंकर' था।",
      "memoryTipEn": "Original name = Mool (Root) Shankar.",
      "related": ["Arya Samaj", "Go back to Vedas"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "'वेदों की ओर लौटो' का नारा किसने दिया?",
    "stemEn": "Who gave the slogan 'Go back to Vedas'?",
    "answerHi": "दयानंद सरस्वती",
    "answerEn": "Dayanand Saraswati",
    "importanceScore": 91,
    "extendedData": {
      "facts": ["यह नारा आर्य समाज का मुख्य सिद्धांत था।", "उनका मानना था कि वेद ही सच्चे ज्ञान का स्रोत हैं।"],
      "factsEn": ["Main principle of Arya Samaj.", "Believed Vedas are the true source of knowledge."],
      "explanationHi": "उन्होंने हिंदू समाज की कुरीतियों को दूर करने के लिए वैदिक जीवन शैली अपनाने पर जोर दिया।",
      "explanationEn": "He emphasized adopting the Vedic lifestyle to eradicate social evils in Hinduism.",
      "memoryTip": "सरस्वती (विद्या की देवी) का वास 'वेदों' में है।",
      "memoryTipEn": "Saraswati = Goddess of Knowledge -> Vedas.",
      "related": ["Arya Samaj", "Satyarth Prakash"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "'रामकृष्ण मिशन' की स्थापना किसने की?",
    "stemEn": "Who founded the 'Ramakrishna Mission'?",
    "answerHi": "स्वामी विवेकानंद",
    "answerEn": "Swami Vivekananda",
    "importanceScore": 95,
    "extendedData": {
      "facts": ["स्थापना 1 मई 1897 को हुई।", "मुख्यालय बेलूर मठ (पश्चिम बंगाल) में है।"],
      "factsEn": ["Founded on May 1, 1897.", "Headquarters at Belur Math, West Bengal."],
      "explanationHi": "यह मिशन उनके गुरु रामकृष्ण परमहंस के आदर्शों और वेदांत दर्शन के प्रचार-प्रसार के लिए बनाया गया था।",
      "explanationEn": "Created to spread the ideals of his guru Ramakrishna Paramahamsa and Vedanta philosophy.",
      "memoryTip": "विवेकानंद ने अपने गुरु (रामकृष्ण) के नाम पर मिशन शुरू किया।",
      "memoryTipEn": "Vivekananda honored his guru Ramakrishna.",
      "related": ["Belur Math", "Ramakrishna Paramahamsa", "Vedanta"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "वास्कोडिगामा भारत कब आया?",
    "stemEn": "When did Vasco da Gama come to India?",
    "answerHi": "1498 ई.",
    "answerEn": "1498 AD",
    "importanceScore": 93,
    "extendedData": {
      "facts": ["वह केरल के कालीकट (कोझिकोड) तट पर पहुंचा था।", "वहां के राजा 'जमोरिन' ने उसका स्वागत किया था।"],
      "factsEn": ["Arrived at the port of Calicut (Kozhikode), Kerala.", "Welcomed by the local ruler, Zamorin."],
      "explanationHi": "उसने यूरोप से भारत तक केप ऑफ गुड होप होते हुए सीधे समुद्री मार्ग की खोज की।",
      "explanationEn": "He discovered the direct sea route from Europe to India via the Cape of Good Hope.",
      "memoryTip": "14-9-8 (क्रम याद रखें: 1498)।",
      "memoryTipEn": "1498: Vasco navigates.",
      "related": ["Zamorin", "Calicut", "Cape of Good Hope"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "वास्कोडिगामा कहाँ का रहने वाला था?",
    "stemEn": "Where was Vasco da Gama from?",
    "answerHi": "पुर्तगाल",
    "answerEn": "Portugal",
    "importanceScore": 88,
    "extendedData": {
      "facts": ["वह एक पुर्तगाली नाविक और खोजकर्ता था।", "भारत आने वाले पहले यूरोपीय पुर्तगाली ही थे।"],
      "factsEn": ["He was a Portuguese explorer.", "Portuguese were the first Europeans to reach India by sea."],
      "explanationHi": "पुर्तगालियों ने ही सबसे पहले भारत में व्यापारिक केंद्र स्थापित किए (कोचीन में)।",
      "explanationEn": "The Portuguese established the first European trading centers in India.",
      "memoryTip": "पुर्तगाल से 'पोर' (Port) होते हुए भारत आया।",
      "memoryTipEn": "Portugal -> Port explorer.",
      "related": ["Estado da India", "Cochin", "Goa"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "हवा महल कहाँ स्थित है?",
    "stemEn": "Where is Hawa Mahal located?",
    "answerHi": "जयपुर",
    "answerEn": "Jaipur",
    "importanceScore": 86,
    "extendedData": {
      "facts": ["इसे महाराजा सवाई प्रताप सिंह ने 1799 में बनवाया था।", "इसमें 953 छोटी खिड़कियां (झरोखे) हैं।"],
      "factsEn": ["Built by Maharaja Sawai Pratap Singh in 1799.", "Has 953 small windows (jharokhas)."],
      "explanationHi": "शाही महिलाओं को शहर के त्योहारों को बिना किसी के देखे देखने की अनुमति देने के लिए इसे बनवाया गया था।",
      "explanationEn": "Built to allow royal ladies to observe street festivals unseen.",
      "memoryTip": "गुलाबी नगर (जयपुर) में गुलाबी हवा महल है।",
      "memoryTipEn": "Palace of Winds is in the Pink City.",
      "related": ["Pink City", "Sawai Pratap Singh", "Rajasthan Architecture"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "सिख धर्म का संस्थापक किस सिख गुरु को माना जाता है?",
    "stemEn": "Which Sikh Guru is considered the founder of Sikhism?",
    "answerHi": "गुरु नानक",
    "answerEn": "Guru Nanak",
    "importanceScore": 92,
    "extendedData": {
      "facts": ["वे सिखों के दस गुरुओं में से पहले गुरु थे।", "उनका जन्म तलवंडी (अब पाकिस्तान में ननकाना साहिब) में हुआ था।"],
      "factsEn": ["First of the ten Sikh Gurus.", "Born in Talwandi (now Nankana Sahib, Pakistan)."],
      "explanationHi": "उन्होंने 15वीं शताब्दी में समानता और एकेश्वरवाद का उपदेश देते हुए सिख धर्म की नींव रखी।",
      "explanationEn": "Founded Sikhism in the 15th century, preaching equality and monotheism.",
      "memoryTip": "सिख धर्म के 'नानक' (जनक)।",
      "memoryTipEn": "First Guru -> Guru Nanak.",
      "related": ["Guru Granth Sahib", "Nankana Sahib", "Sikh Gurus"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "सिखों का प्रमुख त्यौहार कौन-सा है?",
    "stemEn": "Which is the major festival of Sikhs?",
    "answerHi": "बैसाखी",
    "answerEn": "Baisakhi",
    "importanceScore": 88,
    "extendedData": {
      "facts": ["यह वसंत ऋतु का फसल उत्सव hai।", "इसी दिन 1699 में गुरु गोबिंद सिंह ने खालसा पंथ की स्थापना की थी।"],
      "factsEn": ["A spring harvest festival.", "Khalsa Panth was founded on this day in 1699 by Guru Govind Singh."],
      "explanationHi": "यह सिखों के लिए एक धार्मिक और कृषि उत्सव दोनों है।",
      "explanationEn": "It is both a religious and agricultural festival for Sikhs.",
      "memoryTip": "बैसाखी में 'खालसा' की साखी (कथा) जुड़ी है।",
      "memoryTipEn": "Baisakhi -> Birth of Khalsa.",
      "related": ["Khalsa Panth", "Guru Gobind Singh", "Harvest Festival"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "'लौह पुरुष' किस महापुरुष को कहा जाता है?",
    "stemEn": "Which great man is known as the 'Iron Man'?",
    "answerHi": "सरदार वल्लभभाई पटेल",
    "answerEn": "Sardar Vallabhbhai Patel",
    "importanceScore": 96,
    "extendedData": {
      "facts": ["वे भारत के पहले उप प्रधानमंत्री और गृह मंत्री थे।", "उन्होंने 562 रियासतों को भारत में एकीकृत किया।"],
      "factsEn": ["First Deputy PM and Home Minister of India.", "Integrated 562 princely states into India."],
      "explanationHi": "रियासतों के एकीकरण में उनके दृढ़ संकल्प के कारण उन्हें 'भारत का लौह पुरुष' कहा गया।",
      "explanationEn": "Called Iron Man for his iron will in integrating the princely states.",
      "memoryTip": "पटेल जी का इरादा 'लोहे' जैसा मजबूत था।",
      "memoryTipEn": "Iron Man -> Statue of Unity -> Patel.",
      "related": ["Statue of Unity", "Bismarck of India", "Bardoli Satyagraha"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "नेताजी किस महापुरुष को कहा जाता है?",
    "stemEn": "Which great man is called 'Netaji'?",
    "answerHi": "सुभाष चंद्र बोस",
    "answerEn": "Subhas Chandra Bose",
    "importanceScore": 94,
    "extendedData": {
      "facts": ["इन्होंने 'आजाद हिंद फौज' का पुनर्गठन किया।", "'तुम मुझे खून दो, मैं तुम्हें आजादी दूंगा' का प्रसिद्ध नारा दिया।"],
      "factsEn": ["Reorganized the 'Indian National Army' (INA).", "Gave the famous slogan 'Give me blood, and I shall give you freedom'."],
      "explanationHi": "भारत के स्वतंत्रता संग्राम में उनके असाधारण नेतृत्व के लिए लोगों और भारतीय सैनिकों ने उन्हें 'नेताजी' की उपाधि दी।",
      "explanationEn": "Given the title 'Netaji' (Respected Leader) by Indian soldiers in Germany.",
      "memoryTip": "हमारे 'नेता' सुभाष बाबू।",
      "memoryTipEn": "Netaji = Leader -> Bose.",
      "related": ["Azad Hind Fauj", "Forward Bloc", "Parakram Diwas"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "दिल्ली स्थित लाल बहादुर शास्त्री की समाधि का क्या नाम है?",
    "stemEn": "What is the name of the memorial of Lal Bahadur Shastri in Delhi?",
    "answerHi": "विजय घाट",
    "answerEn": "Vijay Ghat",
    "importanceScore": 89,
    "extendedData": {
      "facts": ["यह नई दिल्ली में यमुना नदी के तट पर स्थित है।", "यह 1965 के युद्ध में पाकिस्तान पर भारत की विजय का भी प्रतीक है।"],
      "factsEn": ["Located on the banks of Yamuna river in New Delhi.", "Symbolizes India's victory over Pakistan in the 1965 war."],
      "explanationHi": "भारत के दूसरे प्रधानमंत्री लाल बहादुर शास्त्री के सम्मान में इसे विजय घाट नाम दिया गया।",
      "explanationEn": "Named 'Vijay Ghat' (Victory Bank) to honor the 2nd PM who led India during the 1965 war.",
      "memoryTip": "बहादुर लोग हमेशा 'विजय' प्राप्त करते हैं।",
      "memoryTipEn": "Brave (Bahadur) brings Victory (Vijay).",
      "related": ["Raj Ghat", "Kisan Ghat", "Tashkent Agreement"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "महाभारत के रचयिता कौन हैं?",
    "stemEn": "Who is the author of Mahabharata?",
    "answerHi": "महर्षि वेदव्यास",
    "answerEn": "Maharishi Ved Vyas",
    "importanceScore": 91,
    "extendedData": {
      "facts": ["महाभारत दुनिया का सबसे लंबा महाकाव्य है।", "श्रीमद्भगवद्गीता इसी महाकाव्य का एक हिस्सा (भीष्म पर्व) है।"],
      "factsEn": ["Mahabharata is the longest epic poem in the world.", "Bhagavad Gita is a part of it (Bhishma Parva).."],
      "explanationHi": "महर्षि वेदव्यास ने महाभारत की रचना की और भगवान गणेश ने इसे लिखा था।",
      "explanationEn": "Dictated by Ved Vyas and written down by Lord Ganesha.",
      "memoryTip": "वेद और महाभारत दोनों 'व्यास' जी ने संकलित किए।",
      "memoryTipEn": "Vyas wrote the Vast epic.",
      "related": ["Ramayana", "Bhagavad Gita", "Kurukshetra"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "अर्थशास्त्र नामक पुस्तक किसने लिखी?",
    "stemEn": "Who wrote the book named Arthashastra?",
    "answerHi": "चाणक्य (कौटिल्य / विष्णुगुप्त)",
    "answerEn": "Chanakya (Kautilya)",
    "importanceScore": 95,
    "extendedData": {
      "facts": ["यह राज्यकला, आर्थिक नीति और सैन्य रणनीति पर एक प्राचीन भारतीय ग्रंथ है।", "चाणक्य चंद्रगुप्त मौर्य के प्रधानमंत्री थे।"],
      "factsEn": ["An ancient Indian treatise on statecraft, economic policy, and military strategy.", "Chanakya was the PM of Chandragupta Maurya."],
      "explanationHi": "इस पुस्तक में मौर्य साम्राज्य के प्रशासन के बारे में विस्तृत जानकारी है।",
      "explanationEn": "Provides detailed insights into the administration of the Mauryan Empire.",
      "memoryTip": "कौटिल्य की कूटनीति = अर्थशास्त्र।",
      "memoryTipEn": "Kautilya's economics = Arthashastra.",
      "related": ["Chandragupta Maurya", "Mauryan Empire", "Vishnugupta"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "'जय जवान, जय किसान' का नारा किसने दिया?",
    "stemEn": "Who gave the slogan 'Jai Jawan, Jai Kisan'?",
    "answerHi": "लाल बहादुर शास्त्री",
    "answerEn": "Lal Bahadur Shastri",
    "importanceScore": 96,
    "extendedData": {
      "facts": ["यह नारा 1965 के भारत-पाकिस्तान युद्ध के दौरान दिया गया था।", "अटल बिहारी वाजपेयी ने इसमें 'जय विज्ञान' जोड़ा था।"],
      "factsEn": ["Given during the 1965 India-Pakistan war.", "Atal Bihari Vajpayee later added 'Jai Vigyan' to it."],
      "explanationHi": "सैनिकों (जवानों) और किसानों का मनोबल बढ़ाने के लिए यह नारा दिया गया था, क्योंकि देश युद्ध और अन्न की कमी का सामना कर रहा था।",
      "explanationEn": "To boost the morale of soldiers and farmers when India was facing war and food scarcity.",
      "memoryTip": "शास्त्री जी ने जवान और किसान दोनों की महिमा गाई।",
      "memoryTipEn": "Shastri honored soldiers and farmers.",
      "related": ["1965 Indo-Pak War", "Green Revolution"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "संविधान सभा का स्थाई अध्यक्ष कौन था?",
    "stemEn": "Who was the permanent President of the Constituent Assembly?",
    "answerHi": "डॉ. राजेन्द्र प्रसाद",
    "answerEn": "Dr. Rajendra Prasad",
    "importanceScore": 95,
    "extendedData": {
      "facts": ["उन्हें 11 दिसंबर 1946 को अध्यक्ष चुना गया था।", "अस्थाई अध्यक्ष डॉ. सच्चिदानंद सिन्हा थे (9 दिसंबर को)।"],
      "factsEn": ["Elected on December 11, 1946.", "Dr. Sachchidananda Sinha was the interim president."],
      "explanationHi": "वे बाद में स्वतंत्र भारत के पहले राष्ट्रपति भी बने।",
      "explanationEn": "He later became the first President of independent India.",
      "memoryTip": "प्रसाद के रूप में हमें 'स्थाई' संविधान मिला।",
      "memoryTipEn": "First President of India = Permanent President of Assembly.",
      "related": ["Constituent Assembly", "Dr. Sachchidananda Sinha", "Drafting Committee"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "संविधान सभा की प्रारूप समिति के अध्यक्ष कौन थे?",
    "stemEn": "Who was the Chairman of the Drafting Committee of the Constituent Assembly?",
    "answerHi": "डॉ. भीमराव अंबेडकर",
    "answerEn": "Dr. B. R. Ambedkar",
    "importanceScore": 98,
    "extendedData": {
      "facts": ["प्रारूप समिति का गठन 29 अगस्त 1947 को हुआ था।", "समिति में अध्यक्ष सहित 7 सदस्य थे।"],
      "factsEn": ["Drafting Committee was formed on Aug 29, 1947.", "It had 7 members including the Chairman."],
      "explanationHi": "उन्हें भारतीय संविधान के 'जनक' या 'निर्माता' के रूप में जाना जाता है।",
      "explanationEn": "Known as the Father of the Indian Constitution.",
      "memoryTip": "अंबेडकर जी ने संविधान का 'रूप' (प्रारूप) तैयार किया।",
      "memoryTipEn": "Ambedkar drafted our future.",
      "related": ["Father of Indian Constitution", "Article 32"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "विश्व रेडक्रॉस दिवस किस तारीख को मनाया जाता है?",
    "stemEn": "On which date is World Red Cross Day celebrated?",
    "answerHi": "8 मई",
    "answerEn": "8 May",
    "importanceScore": 84,
    "extendedData": {
      "facts": ["यह हेनरी ड्यूनेंट के जन्मदिन पर मनाया जाता है।", "हेनरी ड्यूनेंट इंटरनेशनल कमिटी ऑफ द रेड क्रॉस (ICRC) के संस्थापक थे।"],
      "factsEn": ["Celebrated on the birthday of Henry Dunant.", "Henry Dunant founded the ICRC."],
      "explanationHi": "यह दिन मानवीय कार्यों और रेडक्रॉस स्वयंसेवकों को सम्मानित करने के लिए मनाया जाता है।",
      "explanationEn": "Celebrated to honor humanitarian efforts and Red Cross volunteers.",
      "memoryTip": "मई (May) में 8 (आठ) दिशाओं में रेडक्रॉस मदद करता है।",
      "memoryTipEn": "May 8 -> Mate -> Helping mate -> Red Cross.",
      "related": ["Henry Dunant", "Geneva Conventions"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "सूर्योदय का देश के नाम से कौनसा देश प्रसिद्ध है?",
    "stemEn": "Which country is famous as the 'Land of the Rising Sun'?",
    "answerHi": "जापान",
    "answerEn": "Japan",
    "importanceScore": 90,
    "extendedData": {
      "facts": ["जापानी भाषा में इसे 'निप्पॉन' (Nippon) या 'निहोन' कहते हैं, जिसका अर्थ सूर्य का मूल है।", "यह एशिया के सुदूर पूर्व में स्थित है।"],
      "factsEn": ["In Japanese, it's called 'Nippon' meaning origin of the sun.", "Located in the far east of Asia."],
      "explanationHi": "प्राचीन चीनियों के नजरिए से सूर्य जापान की दिशा से उगता हुआ दिखाई देता था।",
      "explanationEn": "From China's perspective, the sun appeared to rise from Japan's direction.",
      "memoryTip": "जा-पान -> जहाँ से सूरज पान करता है रोशनी का।",
      "memoryTipEn": "Japan is far east, gets sun first in the region.",
      "related": ["Nippon", "Midnight Sun (Norway)"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "अन्तर्राष्ट्रीय महिला दिवस किस तिथि को मनाया जाता है?",
    "stemEn": "On which date is International Women's Day celebrated?",
    "answerHi": "8 मार्च",
    "answerEn": "8 March",
    "importanceScore": 92,
    "extendedData": {
      "facts": ["इसे संयुक्त राष्ट्र द्वारा भी मान्यता प्राप्त है।", "यह महिलाओं के अधिकारों और महिला सशक्तीकरण का जश्न मनाता है।"],
      "factsEn": ["Recognized by the United Nations.", "Celebrates women's rights and empowerment."],
      "explanationHi": "महिलाओं की सामाजिक, आर्थिक, सांस्कृतिक और राजनीतिक उपलब्धियों का जश्न मनाने के लिए यह दिन मनाया जाता है।",
      "explanationEn": "A global day celebrating the social, economic, cultural, and political achievements of women.",
      "memoryTip": "मार्च (March) करती महिलाएँ (8)।",
      "memoryTipEn": "Marching forward on the 8th.",
      "related": ["National Women's Day (Feb 13)"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "क्षेत्रफल की दृष्टि से भारत में सबसे छोटा राज्य कौन-सा है?",
    "stemEn": "Which is the smallest state in India in terms of area?",
    "answerHi": "गोवा",
    "answerEn": "Goa",
    "importanceScore": 93,
    "extendedData": {
      "facts": ["इसका क्षेत्रफल केवल 3,702 वर्ग किलोमीटर hai।", "जनसंख्या के हिसाब से सबसे छोटा राज्य सिक्किम है।"],
      "factsEn": ["Its area is only 3,702 sq km.", "Smallest state by population is Sikkim."],
      "explanationHi": "गोवा भारत के पश्चिमी तट (कोंकण क्षेत्र) पर स्थित है।",
      "explanationEn": "Goa is located on the western coast of India (Konkan region).",
      "memoryTip": "गोवा 'गया' और तुरंत खत्म हो गया (सबसे छोटा)।",
      "memoryTipEn": "Goa is tiny like a dot on the west coast.",
      "related": ["Sikkim", "Rajasthan (Largest Area)"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "ओणम किस राज्य का प्रसिद्ध त्योहार है?",
    "stemEn": "Onam is a famous festival of which state?",
    "answerHi": "केरल",
    "answerEn": "Kerala",
    "importanceScore": 90,
    "extendedData": {
      "facts": ["यह एक फसल उत्सव है।", "राजा महाबली के स्वागत में मनाया जाता है।"],
      "factsEn": ["It is a harvest festival.", "Celebrated to welcome King Mahabali."],
      "explanationHi": "इस त्योहार के दौरान प्रसिद्ध नौका दौड़ (वल्लमकली) आयोजित की जाती है।",
      "explanationEn": "The famous snake boat race (Vallamkali) is held during this festival.",
      "memoryTip": "केरल के लोग 'ओणम' पर केले के पत्ते पर खाते हैं।",
      "memoryTipEn": "K-O: Kerala - Onam.",
      "related": ["Pongal", "Snake Boat Race", "King Mahabali"]
    }
  },
  {
    "subjectTag": "General Knowledge",
    "stemHi": "दिल्ली भारत की राजधानी कब बनी?",
    "stemEn": "When did Delhi become the capital of India?",
    "answerHi": "1911",
    "answerEn": "1911",
    "importanceScore": 94,
    "extendedData": {
      "facts": ["1911 के दिल्ली दरबार में जॉर्ज पंचम ने इसकी घोषणा की थी।", "इससे पहले भारत की राजधानी कलकत्ता (अब कोलकाता) थी।"],
      "factsEn": ["Announced by King George V in the 1911 Delhi Durbar.", "Previously, the capital was Calcutta."],
      "explanationHi": "भारत के बेहतर प्रशासन के लिए राजधानी को केंद्र में (दिल्ली) स्थानांतरित किया गया।",
      "explanationEn": "The capital was moved to the center (Delhi) for better administration of India.",
      "memoryTip": "कलकत्ता से दिल्ली 'एक-एक' (11) कदम करके गए (1911)।",
      "memoryTipEn": "1911 -> Capital shifts from East to Center.",
      "related": ["Lord Hardinge", "Delhi Durbar", "Calcutta"]
    }
  },
  {
    "subjectTag": "General Science",
    "stemHi": "सबसे चमकीला ग्रह कौनसा है?",
    "stemEn": "Which is the brightest planet?",
    "answerHi": "शुक्र (Venus)",
    "answerEn": "Venus",
    "importanceScore": 91,
    "extendedData": {
      "facts": ["इसे भोर का तारा (Morning Star) और सांझ का तारा (Evening Star) भी कहा जाता hai।", "यह सौरमंडल का सबसे गर्म ग्रह भी है।"],
      "factsEn": ["Also called Morning Star and Evening Star.", "It is also the hottest planet in the solar system."],
      "explanationHi": "शुक्र के वायुमंडल में सल्फ्यूरिक एसिड के घने बादल हैं, जो सूरज की रोशनी को अत्यधिक प्रतिबिंबित करते हैं।",
      "explanationEn": "Venus has thick clouds of sulfuric acid that heavily reflect sunlight.",
      "memoryTip": "शुक्र (Shukra) मतलब सुंदरता, और सुंदर चीज़ चमकती है।",
      "memoryTipEn": "Venus = Roman Goddess of Beauty = Brightest.",
      "related": ["Hottest Planet", "Morning Star", "Earth's Twin"]
    }
  }
];

async function push() {
  console.log('--- Initializing Remote Push ---');
  try {
    let inserted = 0;
    const now = new Date();

    await db.transaction(async (tx) => {
      for (const r of DATA) {
        await tx.insert(mppoliceOneLinerFacts).values({
          id: nanoid(),
          subjectTag: r.subjectTag,
          stemHi: r.stemHi,
          stemEn: r.stemEn,
          answerHi: r.answerHi,
          answerEn: r.answerEn,
          importanceScore: r.importanceScore,
          sortOrder: 0,
          extendedData: r.extendedData as any,
          status: 'published',
          createdAt: now,
          updatedAt: now,
        });
        inserted++;
      }
    });

    console.log(`Success! Inserted ${inserted} records into Turso.`);
  } catch (err) {
    console.error('Push Failed:', err);
  }
}

push();
